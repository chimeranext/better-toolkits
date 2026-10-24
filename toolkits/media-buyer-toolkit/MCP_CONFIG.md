# Google Workspace MCP — setup

## Repositorio oficial
https://github.com/taylorwilsdon/google_workspace_mcp

## Instalación (OpenCode V2)
```bash
opencode mcp add local.google-workspace
# luego configurar credenciales en .google-workspace.env
```

## Credenciales
- Crea OAuth2 credentials en Google Cloud Console para el servicio "Google Drive API"
- Agrega `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_FOLDER_ID` a `.google-workspace.env`

## Uso
Desde media-buyer-toolkit:
- `ctx.session.hook("campaign.video.upload", ...)` — sube video editado a Drive
- `ctx.session.hook("campaign.video.list", ...)` — lista videos en carpeta de campaña
