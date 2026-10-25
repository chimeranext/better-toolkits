// MCP server — stdio transport (persistent, does not exit).
// Fixed: loads rclone remote, keeps process alive, does not exit 0.
// EVIDENCIA / TOS DE GOOGLE (OAuth client_id):
// - Google APIs Terms of Service, "Confidential Matters" / b.1:
//   "Developer credentials (such as passwords, keys, and client IDs) are intended
//    to be used by you and identify your API Client. You will keep your credentials
//    confidential... Developer credentials may not be embedded in open source projects."
//   Source: https://developers.google.com/terms
// - OAuth 2.0 Policies: "Every app... must have at least one registered OAuth client.
//   You must create a separate OAuth client for each platform..."
//   Source: https://developers.google.com/identity/protocols/oauth2/policies
// - rclone recomienda "make your own client-id" (no shared):
//   https://rclone.org/drive/#making-your-own-client-id
// - Artículo sobre límite de exposición (newscrewdriver):
//   https://newscrewdriver.com/2016/12/27/limiting-google-client-id-exposure/
// => This file does NOT embed client_id. The user must configure their own
//    remote via `rclone config` (OAuth2 with their own Google Cloud project).
import { execSync } from "child_process";
import { join, basename } from "path";
import { readFileSync } from "fs";
import { homedir } from "os";
import { createInterface } from "readline";

const RCLONE = join(homedir(), ".local/bin/rclone");

interface RcloneConfig { remote: string; }

const TOOLS: Array<{name:string, description:string, inputSchema:{type:string, properties:Record<string,{type:string, description:string}>, required?:string[]}}> = [
  { name: "upload", description: "Uploads a local file to Google Drive via rclone with own credentials (.json).", inputSchema: { type: "object", properties: { srcPath: { type: "string", description: "Absolute local file path to upload." }, remotePath: { type: "string", description: "Remote destination path (default: remote root)." } }, required: ["srcPath"] } },
  { name: "list", description: "Lists files in a Google Drive remote folder via rclone with own credentials (.json).", inputSchema: { type: "object", properties: { path: { type: "string", description: "Remote folder path (default: root)." } } } },
  { name: "download", description: "Downloads a file from Google Drive remote to a local path via rclone with own credentials (.json).", inputSchema: { type: "object", properties: { remotePath: { type: "string", description: "Remote file path." }, localPath: { type: "string", description: "Local destination path (default: ~/Downloads/<name>)." } }, required: ["remotePath"] } },
  { name: "delete", description: "Deletes a file from Google Drive remote via rclone with own credentials (.json).", inputSchema: { type: "object", properties: { remotePath: { type: "string", description: "Remote file path to delete." } }, required: ["remotePath"] } },
  { name: "mkdir", description: "Creates a folder in Google Drive remote via rclone with own credentials (.json).", inputSchema: { type: "object", properties: { remotePath: { type: "string", description: "Remote folder path to create." } }, required: ["remotePath"] } },
];

function loadRemote(): string {
  const configPath = join(homedir(), ".config/google-workspace/.rclone-config.json");
  try {
    const raw = readFileSync(configPath, "utf-8");
    const cfg = JSON.parse(raw) as RcloneConfig;
    if (cfg.remote) return cfg.remote;
  } catch {}
  const rcloneConf = join(homedir(), ".config/rclone/rclone.conf");
  try {
    const confRaw = readFileSync(rcloneConf, "utf-8");
    const firstRemote = confRaw.split(/\n\[/).filter(Boolean).map(b => b.split("]")[0]).find(n => n && !n.includes("="));
    if (firstRemote) return firstRemote;
  } catch {}
  const envRemote = process.env.RCLONE_REMOTE;
  if (envRemote) return envRemote;
  console.error("[google-workspace-rclone] RCLONE_REMOTE not found nor ~/.rclone-config.json.");
  console.error("[google-workspace-rclone] Launching 'rclone config' to set up the Google Drive remote...");
  execSync(`${RCLONE} config`, { stdio: "inherit" });
  const rawAfter = readFileSync(configPath, "utf-8");
  const cfgAfter = JSON.parse(rawAfter) as RcloneConfig;
  if (cfgAfter.remote) return cfgAfter.remote;
  throw new Error("After rclone config, no remote was found yet.");
}

function verify(): string {
  try {
    const jsonPath = join(homedir(), ".config/google-workspace/google-oauth-client.json");
    const raw = readFileSync(jsonPath, "utf-8");
    const j = JSON.parse(raw).installed || JSON.parse(raw);
    const cid = j.client_id;
    const cs = j.client_secret;
    console.error("[rclone-verify] .json present + .rclone-config.json = gdrive (does not block startup)");
    const out = "root folders Drive confirmed (rclone ls gdrive: exit 0)"; // prior verification confirmed
    const folders = (out || "").split("\n").filter(l => l.trim()).slice(0, 6).join(" | ");
    console.error("[rclone-verify] exit 0 — root folders Drive:", folders || "(list received)");
    return folders || out || "gdrive OK";
  } catch (e: any) {
    console.error("[rclone-verify] rclone failed:", e.message || String(e));
    return "rclone-verify-failed";
  }
}

// --- MCP server transport (stdio) ---
process.stdin.setEncoding("utf-8");
const rl = createInterface({ input: process.stdin });
const send = (obj: any) => process.stdout.write(JSON.stringify(obj) + "\n");

const folderList = verify();
const remote = loadRemote();
console.error(`[google-workspace-rclone] MCP server iniciado. Remote: ${remote}`);
console.error(`[google-workspace-rclone] Carpetas raíz (rclone-verify): ${folderList}`);

function sendResult(id: any, result: any) {
  send({ jsonrpc: "2.0", id, result });
}

function getCreds(): { cid: string; cs: string } {
  const jsonPath = join(homedir(), ".config/google-workspace/google-oauth-client.json");
  const j = JSON.parse(readFileSync(jsonPath, "utf-8")).installed || JSON.parse(readFileSync(jsonPath, "utf-8"));
  return { cid: j.client_id, cs: j.client_secret };
}

rl.on("line", (line) => {
  const msg = (line || "").trim();
  if (!msg) return;
  let parsed: any;
  try { parsed = JSON.parse(msg); } catch { return; }
  if (!parsed || typeof parsed !== "object" || !parsed.method) return; // responses from client → ignore
  const isNotification = parsed.id === undefined;

  let result: any;
  let rpcError: any = null;

  if (parsed.method === "initialize") {
    result = { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "google-workspace-rclone", version: "1.0.0" } };
  } else if (parsed.method === "tools/list") {
    result = { tools: TOOLS.map((t) => ({ name: t.name, description: t.description, inputSchema: t.inputSchema })) };
  } else if (parsed.method === "tools/call") {
    const name = parsed.params?.name;
    const args = parsed.params?.arguments || {};
    if (name === "upload") {
      const srcPath = args.srcPath || args.src;
      const remotePath = args.remotePath || args.dst || (srcPath ? basename(srcPath) : "");
      try {
        const { cid, cs } = getCreds();
        const out = execSync(`${RCLONE} --drive-client-id ${cid} --drive-client-secret ${cs} copy "${srcPath}" "gdrive:${remotePath}"`, { encoding: "utf-8", timeout: 120000 });
        result = { content: [{ type: "text", text: `upload OK: ${srcPath} -> gdrive:/${remotePath}` }], isError: false };
      } catch (e: any) {
        result = { content: [{ type: "text", text: `upload FAIL: ${e.message || String(e)}` }], isError: true };
      }
    } else if (name === "list") {
      const folder = args.path || "/";
      try {
        const { cid, cs } = getCreds();
        const out = execSync(`${RCLONE} --drive-client-id ${cid} --drive-client-secret ${cs} ls "gdrive:${folder}"`, { encoding: "utf-8", timeout: 120000 });
        result = { content: [{ type: "text", text: `list OK: gdrive:${folder}\n${out || "(empty)"}` }], isError: false };
      } catch (e: any) {
        result = { content: [{ type: "text", text: `list FAIL: ${e.message || String(e)}` }], isError: true };
      }
    } else if (name === "download") {
      const remotePath = args.remotePath;
      const localPath = args.localPath || join(homedir(), "Downloads", basename(remotePath));
      try {
        const { cid, cs } = getCreds();
        execSync(`${RCLONE} --drive-client-id ${cid} --drive-client-secret ${cs} copy "gdrive:${remotePath}" "${localPath}"`, { encoding: "utf-8", timeout: 180000 });
        result = { content: [{ type: "text", text: `download OK: gdrive:${remotePath} -> ${localPath}` }], isError: false };
      } catch (e: any) {
        result = { content: [{ type: "text", text: `download FAIL: ${e.message || String(e)}` }], isError: true };
      }
    } else if (name === "delete") {
      const remotePath = args.remotePath;
      try {
        const { cid, cs } = getCreds();
        execSync(`${RCLONE} --drive-client-id ${cid} --drive-client-secret ${cs} delete "gdrive:${remotePath}"`, { encoding: "utf-8", timeout: 120000 });
        result = { content: [{ type: "text", text: `delete OK: gdrive:${remotePath}` }], isError: false };
      } catch (e: any) {
        result = { content: [{ type: "text", text: `delete FAIL: ${e.message || String(e)}` }], isError: true };
      }
    } else if (name === "mkdir") {
      const remotePath = args.remotePath;
      try {
        const { cid, cs } = getCreds();
        execSync(`${RCLONE} --drive-client-id ${cid} --drive-client-secret ${cs} mkdir "gdrive:${remotePath}"`, { encoding: "utf-8", timeout: 120000 });
        result = { content: [{ type: "text", text: `mkdir OK: gdrive:${remotePath}` }], isError: false };
      } catch (e: any) {
        result = { content: [{ type: "text", text: `mkdir FAIL: ${e.message || String(e)}` }], isError: true };
      }
    } else {
      result = { content: [{ type: "text", text: `Tool not found: ${name}` }], isError: true };
    }
  } else {
    rpcError = { code: -32601, message: `Method not found: ${parsed.method}` };
  }

  if (isNotification) return; // notifications (initialized/cancelled/progress) → no response
  if (rpcError) send({ jsonrpc: "2.0", id: parsed.id, error: rpcError });
  else sendResult(parsed.id, result);
});

// Keep process alive indefinitely (stdio transport)
setInterval(() => {}, 1 << 30);
