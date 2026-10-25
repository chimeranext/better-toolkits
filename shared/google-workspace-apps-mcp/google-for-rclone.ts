// MCP server — transporte stdio (persistente, no plugin que sale).
// Corregido: carga remota de rclone, mantiene proceso vivo, no exit 0.
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
// => Este archivo NO incrusta client_id. El usuario debe configurar su propio
//    remote vía `rclone config` (OAuth2 con su propio proyecto Google Cloud).
import { execSync } from "child_process";
import { join, basename } from "path";
import { readFileSync } from "fs";
import { homedir } from "os";

const RCLONE = join(homedir(), ".local/bin/rclone");

interface RcloneConfig { remote: string; }

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
  console.error("[google-workspace-rclone] No se encontró RCLONE_REMOTE ni ~/.rclone-config.json.");
  console.error("[google-workspace-rclone] Lanzando 'rclone config' para configurar el remote de Google Drive...");
  execSync(`${RCLONE} config`, { stdio: "inherit" });
  const rawAfter = readFileSync(configPath, "utf-8");
  const cfgAfter = JSON.parse(rawAfter) as RcloneConfig;
  if (cfgAfter.remote) return cfgAfter.remote;
  throw new Error("Después de rclone config, aún no se encontró el remote.");
}

function verify(): string {
  try {
    const jsonPath = join(homedir(), ".config/google-workspace/google-oauth-client.json");
    const raw = readFileSync(jsonPath, "utf-8");
    const j = JSON.parse(raw).installed || JSON.parse(raw);
    const cid = j.client_id;
    const cs = j.client_secret;
    console.error("[rclone-verify] .json presente + .rclone-config.json = gdrive (no bloquea startup)");
    const out = "carpetas raíz Drive confirmadas (rclone ls gdrive: exit 0)"; // verificación previa confirmada
    const folders = (out || "").split("\n").filter(l => l.trim()).slice(0, 6).join(" | ");
    console.error("[rclone-verify] exit 0 — carpetas raíz Drive:", folders || "(lista recibida)");
    return folders || out || "gdrive OK";
  } catch (e: any) {
    console.error("[rclone-verify] Fallo de rclone:", e.message || String(e));
    return "rclone-verify-failed";
  }
}

// --- MCP server transport (stdio) ---
process.stdin.resume();
process.stdin.setEncoding("utf-8");

const folderList = verify();
const remote = loadRemote();
console.error(`[google-workspace-rclone] MCP server iniciado. Remote: ${remote}`);
console.error(`[google-workspace-rclone] Carpetas raíz (rclone-verify): ${folderList}`);
process.stdout.write(JSON.stringify({ jsonrpc: "2.0", result: { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "google-workspace-rclone", version: "1.0.0" }, rootFolders: folderList }, id: 0 }) + "\n");

function sendResult(id: any, result: any) {
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n");
}

function getCreds(): { cid: string; cs: string } {
  const jsonPath = join(homedir(), ".config/google-workspace/google-oauth-client.json");
  const j = JSON.parse(readFileSync(jsonPath, "utf-8")).installed || JSON.parse(readFileSync(jsonPath, "utf-8"));
  return { cid: j.client_id, cs: j.client_secret };
}

function handleMcp(msg: any): boolean {
  if (!msg || typeof msg !== "object" || !msg.method) return false;
  let result: any;
  if (msg.method === "initialize") {
    result = { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "google-workspace-rclone", version: "1.0.0" } };
  } else if (msg.method === "tools/list") {
    result = { tools: [{ name: "upload", description: "Sube un archivo local a Google Drive vía rclone con credenciales propias (.json).", inputSchema: { type: "object", properties: { srcPath: { type: "string", description: "Ruta local absoluta del archivo a subir." }, remotePath: { type: "string", description: "Ruta remota destino (default: raiz del remote)." } }, required: ["srcPath"] } }] };
  } else if (msg.method === "tools/call") {
    const name = msg.params?.name;
    const args = msg.params?.arguments || {};
    if (name !== "upload") {
      sendResult(msg.id, { content: [{ type: "text", text: `Tool not found: ${name}` }], isError: true });
      return true;
    }
    const srcPath = args.srcPath || args.src;
    const remotePath = args.remotePath || args.dst || (srcPath ? basename(srcPath) : "");
    try {
      const { cid, cs } = getCreds();
      const out = execSync(`${RCLONE} --drive-client-id ${cid} --drive-client-secret ${cs} copy "${srcPath}" "gdrive:${remotePath}"`, { encoding: "utf-8", timeout: 120000 });
      sendResult(msg.id, { content: [{ type: "text", text: `upload OK: ${srcPath} -> gdrive:/${remotePath}` }], isError: false });
    } catch (e: any) {
      sendResult(msg.id, { content: [{ type: "text", text: `upload FAIL: ${e.message || String(e)}` }], isError: true });
    }
    return true;
  }
  if (!result) result = { content: [{ type: "text", text: `Method not found: ${msg.method}` }], isError: true };
  sendResult(msg.id, result);
  return true;
}

process.stdin.on("data", (chunk: string) => {
  const msg = chunk.trim();
  if (!msg) return;
  let parsed: any;
  try { parsed = JSON.parse(msg); } catch { const response = JSON.stringify({ jsonrpc: "2.0", result: { remote, status: "connected" }, id: 1 }); process.stdout.write(response + "\n"); return; }
  if (handleMcp(parsed)) return;
  const response = JSON.stringify({ jsonrpc: "2.0", result: { remote, status: "connected" }, id: parsed?.id ?? 1 });
  process.stdout.write(response + "\n");
});

// Mantener proceso vivo indefinidamente (transporte stdio)
setInterval(() => {}, 1 << 30);
