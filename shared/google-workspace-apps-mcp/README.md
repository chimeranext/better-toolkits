# google-workspace-apps-mcp

MCP server para Google Workspace (Drive) vía `rclone`. Transporte `stdio` persistente (`google-for-rclone.ts`).

## Configuración

```bash
# 1. Configurar remote de rclone (OAuth2 interactivo)
rclone config

# 2. Verificar archivo generado
ls ~/.config/rclone/rclone.conf

# 3. El archivo .ts lee .rclone-config.json o .config/rclone/rclone.conf
```

## Evidencia / Por qué NO usar un client_id compartido

- **Google APIs Terms of Service**, sección *Confidential Matters* (b.1):
  > "Developer credentials (such as passwords, keys, and **client IDs**) are intended to be used by you and identify your API Client. You will keep your credentials confidential and make reasonable efforts to prevent and discourage other API Clients from using your credentials. Developer credentials **may not be embedded in open source projects**."
  Fuente: https://developers.google.com/terms

- **OAuth 2.0 Policies** (`developers.google.com/identity/protocols/oauth2/policies`):
  > "Every app that uses Google's OAuth 2.0 infrastructure... must have at least one registered OAuth client. You must create a separate OAuth client for each platform..."

- **rclone docs** (`rclone.org/drive`): recomienda `"making your own client-id"`.

- **Exposición del client_id** (`newscrewdriver.com`): confirma que incrustar `client_id` en código abierto viola los términos.

Este archivo NO contiene ni incrusta ningún `client_id`. Cada usuario debe configurar su propio `rclone config` con su proyecto Google Cloud.
