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
import { join } from "path";
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

function verify(): void {
  try {
    const jsonPath = join(homedir(), ".config/google-workspace/google-oauth-client.json");
    const raw = readFileSync(jsonPath, "utf-8");
    const j = JSON.parse(raw).installed || JSON.parse(raw);
    const cid = j.client_id;
    const cs = j.client_secret;
    console.error("[future-proof] Verificando con --drive-client-id / --drive-client-secret ...");
    const out = execSync(`${RCLONE} --drive-client-id ${cid} --drive-client-secret ${cs} ls gdrive:`, { encoding: "utf-8", timeout: 30000 });
    console.error("[future-proof] exit 0 — rclone funciona directamente con .json:", (out || "").split("\n").slice(0, 3).join("; "));
  } catch (e: any) {
    console.error("[future-proof] Fallo (esperado si aún no hay .conf completo):", e.message || String(e));
  }
}

// --- MCP server transport (stdio) ---
process.stdin.resume();
process.stdin.setEncoding("utf-8");

const remote = loadRemote();
verify();
console.error(`[google-workspace-rclone] MCP server iniciado. Remote: ${remote}`);
// Handshake inmediato para evitar timeout del cliente MCP
process.stdout.write(JSON.stringify({ jsonrpc: "2.0", result: { protocolVersion: "2024-11-05", capabilities: {}, serverInfo: { name: "google-workspace-rclone", version: "1.0.0" } }, id: 0 }) + "\n");

process.stdin.on("data", (chunk: string) => {
  // Respuesta mínima para mantener conexión activa
  const msg = chunk.trim();
  if (msg) {
    const response = JSON.stringify({ jsonrpc: "2.0", result: { remote, status: "connected" }, id: 1 });
    process.stdout.write(response + "\n");
  }
});

// Mantener proceso vivo indefinidamente (transporte stdio)
setInterval(() => {}, 1 << 30);
