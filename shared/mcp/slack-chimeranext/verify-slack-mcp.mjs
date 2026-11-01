#!/usr/bin/env node
/**
 * verify-slack-mcp.mjs — dogfood verification for the slack-chimeranext MCP
 * server. Drives the REAL server over stdio and proves:
 *   1. the server lists its core tools (conversation_list, message_post,
 *      user_list) via `tools/list`;
 *   2. without SLACK_BOT_TOKEN it errors CLEANLY (a UserError result, not a
 *      crash/hang) when a tool is called.
 *
 * No-Workarounds: this script only writes to stdout; the child's stderr is
 * captured and surfaced as evidence (never silenced, never leaked to the
 * harness stderr channel).
 */
import { spawn } from "node:child_process";
import readline from "node:readline";

const SERVER =
  "/home/kvttvrsis/Documentos/GitHub/chimeranext/better-toolkits/.agents/worktrees/slack-chimeranext/shared/mcp/slack-chimeranext/server.js";

const EXPECTED_TOOLS = ["conversation_list", "message_post", "user_list"];

function fail(msg) {
  console.log(`VERIFY FAIL: ${msg}`);
  process.exit(1);
}

// Ensure the child never sees a token (proves missing-env path).
const env = { ...process.env };
delete env.SLACK_BOT_TOKEN;

const child = spawn("node", [SERVER], { stdio: ["pipe", "pipe", "pipe"], env });

let childStderr = "";
child.stderr.setEncoding("utf8");
child.stderr.on("data", (d) => { childStderr += d; });

const byId = new Map();
const pending = new Set([1, 2]);
const rl = readline.createInterface({ input: child.stdout });

const allResponses = new Promise((resolve) => {
  rl.on("line", (line) => {
    try {
      const msg = JSON.parse(line);
      if (msg && typeof msg.id === "number" && pending.has(msg.id)) {
        byId.set(msg.id, msg);
        pending.delete(msg.id);
        if (pending.size === 0) resolve();
      }
    } catch { /* non-JSON line, ignore */ }
  });
});

function send(id, method, params) {
  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
}

send(1, "tools/list", {});
send(2, "tools/call", { name: "user_list", arguments: {} });

const guard = setTimeout(() => fail("timed out waiting for server responses"), 15000);
try {
  await allResponses;
} finally {
  clearTimeout(guard);
}

// ---- Assertion 1: server lists its tools ----
const listResp = byId.get(1);
const toolNames = ((listResp?.result?.tools) ?? []).map((t) => t.name);
console.log("tools/list returned tools:", JSON.stringify(toolNames));
for (const expected of EXPECTED_TOOLS) {
  if (!toolNames.includes(expected)) fail(`missing tool '${expected}' in tools/list`);
}

// ---- Assertion 2: clean UserError without SLACK_BOT_TOKEN ----
const callResp = byId.get(2);
const isError = callResp?.result?.isError === true;
const errText = ((callResp?.result?.content ?? [])[0]?.text) ?? "";
console.log("user_list w/o token → isError:", isError, "| message:", JSON.stringify(errText));
if (!isError) fail("expected an error result when calling with no SLACK_BOT_TOKEN");
if (!errText.includes("SLACK_BOT_TOKEN")) fail("error did not name the missing SLACK_BOT_TOKEN");

console.log("VERIFY PASS — server lists 3 tools and errors cleanly without SLACK_BOT_TOKEN");
console.log("[server stderr (informational)]");
console.log(childStderr || "(none)");

child.kill();
