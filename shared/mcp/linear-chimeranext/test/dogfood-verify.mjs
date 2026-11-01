#!/usr/bin/env node
/**
 * Dogfood verification for the linear-chimeranext ViteMCP server.
 *
 * Does NOT call Linear: credentials are mocked/env-absent. It proves:
 *   1. request construction + auth header (API key verbatim, no Bearer) are right,
 *   2. a graceful missing-env UserError names the variable (never a crash),
 *   3. the real stdio server lists all the tools (team_list, issue_get,
 *      issue_search, issue_create),
 *   4. the real server, without LINEAR_API_KEY, reports the missing env cleanly.
 *
 * Prints a summary to stdout and exits non-zero on any failure.
 */
import { spawn } from "node:child_process";
import readline from "node:readline";
import assert from "node:assert/strict";
import { gql, QUERIES } from "../server.js";

const API = "https://api.linear.app/graphql";
const FAKE_KEY = "lin_api_testdummykey123";

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

// --- 1. request construction + auth header ---
process.env.LINEAR_API_KEY = FAKE_KEY;
const fetchFn = captureFetch({ data: { teams: { nodes: [{ id: "t1", name: "Engineering", key: "ENG" }] } } });
await gql(QUERIES.teams, {}, { fetchFn });
const { url, init } = fetchFn.calls[0];
assert.equal(url, API, "should POST to the Linear GraphQL endpoint");
assert.equal(init.method, "POST");
assert.equal(init.headers.Authorization, FAKE_KEY, "personal API key must go verbatim (no Bearer prefix)");
assert.equal(init.headers["Content-Type"], "application/json");
const sent = JSON.parse(init.body);
assert.equal(sent.query, QUERIES.teams);
assert.deepEqual(sent.variables, {});
ok("builds the right request (Authorization: <key> verbatim) against https://api.linear.app/graphql");

// --- 2. graceful missing-env (LINEAR_API_KEY) ---
delete process.env.LINEAR_API_KEY;
let caught = null;
try {
  await gql(QUERIES.teams, {}, { fetchFn });
} catch (e) {
  caught = e;
}
assert.ok(caught, "missing LINEAR_API_KEY must throw");
assert.match(String(caught.message), /LINEAR_API_KEY is not set/, "error must name the missing var");
ok("graceful missing-env names LINEAR_API_KEY (no crash)");

// --- 3 + 4. real stdio server: tool listing + missing-env on call ---
const serverPath = new URL("../server.js", import.meta.url).pathname;
const env = { ...process.env };
delete env.LINEAR_API_KEY; // prove the live server reports cleanly without a key
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

const EXPECTED_TOOLS = ["team_list", "issue_get", "issue_search", "issue_create"];
let tools = null;
for (let attempt = 0; attempt < 2 && !tools; attempt += 1) {
  const resp = await request("tools/list", {});
  const list = resp.result?.tools ?? resp.result?.content ?? null;
  if (Array.isArray(list)) tools = list.map((t) => t.name ?? t);
}
assert.ok(tools, "tools/list must return a tool list");
for (const name of EXPECTED_TOOLS) {
  assert.ok(tools.includes(name), `tools/list must expose ${name}`);
}
ok(`real stdio server lists tools: ${EXPECTED_TOOLS.join(", ")}`);

const callResp = await request("tools/call", {
  name: "team_list",
  arguments: {},
});
const callText = JSON.stringify(callResp);
assert.match(callText, /LINEAR_API_KEY is not set/, "missing LINEAR_API_KEY must be reported by the live server");
assert.ok(!callText.includes("SyntaxError") && !callText.includes("at "), "must not be a crash/stack trace");
ok("real server without LINEAR_API_KEY reports a clean missing-env error");

child.stdin.end();
child.kill();

console.log("LINEAR_VITEMPCP_VERIFY_PASS");
