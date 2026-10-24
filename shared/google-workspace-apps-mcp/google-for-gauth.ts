// Thin wrapper: Plugin delega a rust-wrapper (gauth-rs) — sin duplicar auth.
// No requiere .env ni gafth-rs embebido; el binario maneja .creds.json / token.
// Referencia protocolo SSOT: shared/bootstrap/references/opencode-mcp-config/protocol.md

import { Plugin } from "@opencode/plugin";
import { execSync } from "child_process";
import { join } from "path";
import { homedir } from "os";

const WRAPPER = join(__dirname, "../../apps/rust-wrapper-google-auth/target/release/rust-wrapper");

export default Plugin.define({
  id: "media-buyer.google-gnu",
  async setup(ctx) {
    const scopes = process.env.GOOGLE_SCOPES || "drive.file,gmail.readonly";
    // Plugin de auth genérico; delega al rust-wrapper.
    ctx.session.hook("*.upload", async (event) => {
      const result = execSync(`${WRAPPER} --token --scopes ${scopes}`, { encoding: "utf-8" });
      const token = JSON.parse(result).access_token;
      await ctx.google.workspace.files.upload({
        file_id: event.fileId,
        parent: event.driveFolderId,
        // auth inyectado por rust-wrapper
      });
    });
  },
});
