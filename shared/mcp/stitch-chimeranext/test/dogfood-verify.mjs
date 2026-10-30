#!/usr/bin/env node
/**
 * Dogfood verification for the stitch-chimeranext ViteMCP server.
 *
 * Does NOT call Google: credentials are mocked/env-absent. It proves:
 *   1. request construction + headers (Bearer + X-Goog-User-Project) are right,
 *   2. a graceful missing-env UserError names the variable (never a crash),
 *   3. the real stdio server lists the `get_screen` tool,
 *   4. the real server reads env config (missing STITCH_PROJECT_ID is reported).
 *
 * Prints a summary to stdout and exits non-zero on any failure.
 */
import { spawn } from "node:child_process";
import readline from "node:readline";
import assert from "node:assert/strict";
import { buildGetScreenRequest, callStitch, extractScreenResult } from "../server.js";

const API = "https://stitch.googleapis.com/mcp";
const FAKE_TOKEN = "gcloud-fake-access-token";

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function ok(msg) {
  console.log(`ok - ${msg}`);
}

// --- mocks (no network) ---
function captureFetch(responder) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url, init });
    return { ok: true, json: async () => responder };
  };
  fn.calls = calls;
  return fn;
}

// --- 1. request construction + headers, parsed result ---
process.env.STITCH_GCP_PROJECT = "344341424155";
const fetchFn = captureFetch({
  result: { content: [{ type: "text", text: JSON.stringify({ screenshot: { downloadUrl: "https://d/s.png" } }) }] },
});
const rpc = await callStitch(buildGetScreenRequest("9064173060952920822", "screen-1"), {
  fetchFn,
  tokenFn: () => FAKE_TOKEN,
});
const { url, init } = fetchFn.calls[0];
assert.equal(url, API, "should POST to the Stitch MCP endpoint");
assert.equal(init.method, "POST");
assert.equal(init.headers.Authorization, `Bearer ${FAKE_TOKEN}`, "Authorization must be gcloud Bearer token");
assert.equal(init.headers["X-Goog-User-Project"], "344341424155", "X-Goog-User-Project must carry the GCP project number");
const sent = JSON.parse(init.body);
assert.equal(sent.method, "tools/call");
assert.equal(sent.params.name, "get_screen");
assert.deepEqual(sent.params.arguments, { projectId: "9064173060952920822", screenId: "screen-1" });
const parsed = extractScreenResult(rpc);
assert.equal(parsed.screenshot_download_url, "https://d/s.png", "nested JSON text should be parsed");
ok("get_screen builds the right request (Bearer + X-Goog-User-Project) and parses the result");

// --- 2. graceful missing-env (STITCH_GCP_PROJECT) ---
delete process.env.STITCH_GCP_PROJECT;
let caught = null;
try {
  await callStitch(buildGetScreenRequest("p1", "s1"), { fetchFn, tokenFn: () => FAKE_TOKEN });
} catch (e) {
  caught = e;
}
assert.ok(caught, "missing STITCH_GCP_PROJECT must throw");
assert.match(String(caught.message), /STITCH_GCP_PROJECT is not set/, "error must name the missing var");
ok("graceful missing-env names STITCH_GCP_PROJECT (no crash)");

// --- 3. real stdio server: tool listing + env-read missing-env ---
const serverPath = new URL("../server.js", import.meta.url).pathname;
const env = { ...process.env };
delete env.STITCH_GCP_PROJECT;
delete env.STITCH_PROJECT_ID; // force the env-read path to surface the missing STITCH_PROJECT_ID
const child = spawn(process.execPath, [serverPath], { env, stdio: ["pipe", "pipe", "pipe"] });
const rl = readline.createInterface({ input: child.stdout });
const pending = new Map();
let nextId = 1;
rl.on("line", (line) => {
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    return;
  }
  if (msg && msg.id !== undefined && pending.has(msg.id)) {
    const p = pending.get(msg.id);
    pending.delete(msg.id);
    p.resolve(msg);
  }
});
child.stderr.on("data", () => {}); // consume (never forward) server stderr
function request(method, params) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`timeout waiting for ${method}`));
    }, 6000);
    pending.set(id, {
      resolve: (m) => {
        clearTimeout(timer);
        resolve(m);
      },
    });
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
  });
}

let tools = null;
for (let attempt = 0; attempt < 2 && !tools; attempt += 1) {
  const resp = await request("tools/list", {});
  const list = resp.result?.tools ?? resp.result?.content ?? null;
  if (Array.isArray(list)) tools = list.map((t) => t.name ?? t);
}
assert.ok(tools && tools.includes("get_screen"), "tools/list must expose get_screen");
ok("real stdio server lists get_screen");

const callResp = await request("tools/call", {
  name: "get_screen",
  arguments: { screenId: "screen-1" }, // no projectId → must read STITCH_PROJECT_ID env
});
const callText = JSON.stringify(callResp);
assert.match(callText, /STITCH_PROJECT_ID/, "missing STITCH_PROJECT_ID must be reported by the live server");
assert.ok(!callText.includes("SyntaxError") && !callText.includes("at "), "must not be a crash/stack trace");
ok("real server reads env: missing STITCH_PROJECT_ID reported cleanly");

child.stdin.end();
child.kill();

console.log("STITCH_VITEMPCP_VERIFY_PASS");
