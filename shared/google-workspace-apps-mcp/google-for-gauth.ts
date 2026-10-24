// FORK de taylorwilsdon/google_workspace_mcp — adaptado a gauth-rs
// Propósito: eliminar la necesidad de registrar OAuth manualmente en
// Google Cloud Console por cada usuario. gauth-automático guarda
// refresh token tras autorizar con el flujo de cuentas.google.com.
//
// Uso con gauth-rs (https://github.com/makarsi/gauth-rs / gauth.dev):
//   1) gauth autoriza con Google (scopes drive.readonly/upload)
//   2) Token guardado en ~/.local/share/gauth/google-refresh-token.json
//   3) Este MCP lee ese archivo (o ~/.local/.google-workspace.env con
//      referencia al path de gauth) para completar drive.upload / drive.list.
//
// Referencia: protocolo SSOT en shared/bootstrap/references/opencode-mcp-config/protocol.md
// GUI: zenity --forms --add-entry=GOOGLE_CLIENT_ID ... (ya documentado)

import { Plugin } from "@opencode/plugin";
import { execSync } from "child_process";
import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

function loadWorkspaceEnv(): Record<string, string> {
  const envPath = join(homedir(), ".local", ".google-workspace.env");
  const raw = readFileSync(envPath, "utf-8");
  const env: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return env;
}

const WORKSPACE_ENV = loadWorkspaceEnv();

export default Plugin.define({
  id: "media-buyer.google-gnu",

  async setup(ctx) {
    const scopes = WORKSPACE_ENV.GOOGLE_SCOPES || "drive.file,gmail.readonly";
    // Opción C — Hybrid Plugin + CLI: ejecuta rust-wrapper --token --scopes <scopes>
    // El binario (creado por nosotros a partir de makarski/gauth-rs) devuelve JSON.
    ctx.session.hook("campaign.video.upload", async (event) => {
      const { fileId, driveFolderId } = event;
      const result = execSync(`./rust-wrapper --token --scopes ${scopes}`, { encoding: "utf-8" });
      const token = JSON.parse(result).access_token;
      const drive = ctx.google.workspace.files;
      await drive.upload({
        file_id: fileId,
        parent: driveFolderId ?? WORKSPACE_ENV.GOOGLE_DRIVE_FOLDER_ID,
        // token inyectado por el wrapper (reemplaza auth manual)
      });
    });
  },
});
