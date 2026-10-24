// Media Buyer Toolkit — Google Workspace integration (Taylor Wilson MCP)
// Referencia: https://github.com/taylorwilsdon/google_workspace_mcp
// Credenciales leídas desde .google-workspace.env (no expuestas al repo).

import { Plugin } from "@opencode/plugin";

export default Plugin.define({
  id: "media-buyer.google",

  async setup(ctx) {
    // Hook para subir videos editados a Google Drive (campañas de pauta)
    ctx.session.hook("campaign.video.upload", async (event) => {
      const { fileId, driveFolderId } = event;
      const drive = ctx.google.workspace.files;
      await drive.upload({
        file_id: fileId,
        parent: driveFolderId ?? process.env.GOOGLE_DRIVE_FOLDER_ID,
      });
    });

    // Hook para listar videos en la carpeta de campaña
    ctx.session.hook("campaign.video.list", async (event) => {
      const drive = ctx.google.workspace.files;
      const folderId = event.drive_folder_id ?? process.env.GOOGLE_DRIVE_FOLDER_ID;
      return await drive.list({ parent: folderId });
    });
  },
});
