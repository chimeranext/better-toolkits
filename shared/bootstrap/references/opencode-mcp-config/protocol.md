# OpenCode MCP config — protocol SSOT

Playbook para conectar MCP servers remotos con OAuth en OpenCode (verificado con
Slack MCP, OpenCode v1.15.5). Harness-specific body; el patrón aplica a cualquier
MCP remoto con OAuth confidencial.

---

## 1. Forma de la config (v1.15.5)

Claves planas bajo `mcp`, SIN wrapper `servers` (el formato `mcp.servers` de la
doc V2 es rechazado por esta versión con `Missing key mcp.servers.enabled`):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "slack": {
      "type": "remote",
      "url": "https://mcp.slack.com/mcp",
      "oauth": {
        "clientId": "<CLIENT_ID>",
        "clientSecret": "{env:SLACK_MCP_CLIENT_SECRET}"
      }
    }
  }
}
```

Archivo: `~/.config/opencode/opencode.json`. El secret NUNCA va en claro:
referencia `{env:VAR}` + `/secret-input` → `/secret-use` → `/secret-clear`.

## 2. Slack MCP: app propia obligatoria

`https://mcp.slack.com/mcp` **no soporta Dynamic Client Registration**. Sin
`clientId`, `opencode mcp list` muestra:

```
✗ slack  Incompatible auth server: does not support dynamic client registration
```

Hay que crear app propia en `api.slack.com/apps` y usar su **Client ID**
(`Basic Information → App Credentials`, formato `123.../...`), NO el App ID
(`A0C25...`). El error típico de confundirlos es que el navegador dice
"authorizing Claude Code" (ese `1601185624273...` es el client público de Claude).

## 3. Redirect URI: HTTP plano, puerto de OpenCode

En la app → **OAuth & Permissions → Redirect URLs**:

```
http://127.0.0.1:19876/mcp/oauth/callback
```

- HTTP, NO HTTPS (OpenCode escucha en HTTP plano; con `https` el callback muere).
- El puerto es el de OpenCode (`19876`), no el de Claude (`3118`).
- Localhost-HTTP es la excepción permitida al check de HTTPS.

## 4. Manifest instalable a la primera

Crear app **From manifest** (scopes de USER token, que es lo que usa el MCP):

```json
{
  "display_information": { "name": "opencode-slack-mcp" },
  "oauth_config": {
    "redirect_urls": ["http://127.0.0.1:19876/mcp/oauth/callback"],
    "scopes": {
      "user": [
        "search:read.public", "search:read.private",
        "search:read.mpim", "search:read.im",
        "search:read.files", "search:read.users",
        "channels:history", "groups:history",
        "mpim:history", "im:history",
        "channels:read", "groups:read",
        "im:read", "mpim:read",
        "chat:write",
        "users:read", "users:read.email",
        "emoji:read",
        "files:read", "files:write",
        "reactions:read", "reactions:write",
        "canvases:read", "canvases:write",
        "lists:read", "lists:write",
        "channels:write", "groups:write",
        "im:write", "mpim:write"
      ]
    }
  },
  "settings": {
    "org_deploy_enabled": false,
    "socket_mode_enabled": false,
    "token_rotation_enabled": false
  }
}
```

Sin al menos un scope, Slack ni muestra el botón de instalar.

## 5. Instalación: interna, NO distribución pública

- **Public Distribution es para el Marketplace y exige HTTPS en todo** → incompatible
  con el callback `http://127.0.0.1`. No perseguir sus 4 checks verdes.
- Lo que hace falta: **Install App → Install to Workspace → Allow** (+ aprobación
  del admin si la pide). Eso la vuelve app interna, habilitada para MCP.
- Tras **cambiar scopes**, reinstalar (`Reinstall`) o el token queda con scopes viejos
  (Slack avisa: "You've changed the permission scopes… please reinstall").

## 6. Paso que casi nadie encuentra: habilitar el MCP en la app

Sin esto, el OAuth completa pero el handshake falla con:

```
Streamable HTTP error: … "App is not enabled for Slack MCP server access.
Please enable it here: https://api.slack.com/apps/<APP_ID>/app-assistant"
```

Ir a `api.slack.com/apps/<APP_ID>/app-assistant` → sección
**Slack Model Context Protocol (MCP) Server** → toggle ON → Save.
(Ojo: la sección **MCP Servers** del sidebar es la dirección contraria —
conectar la app de Slack como cliente de otros MCPs. No es esto.)

## 7. Auth con secret en RAM (nunca en el chat)

```sh
export SLACK_MCP_CLIENT_SECRET='...'   # Client Secret, NO Signing Secret
opencode mcp logout slack              # limpia estado/PKCE viejo
opencode mcp auth slack                # autorizar en el navegador
```

Con `/secret-input` + `/secret-use`, la var vive solo en el proceso del comando.
El `code` del callback es de un solo uso (10 min): si el CLI dice
`OAuth completion failed`, hay que repetir el flujo fresco, no reusar la URL.

## 8. Tabla de errores vistos

| Síntoma | Causa | Fix |
|---|---|---|
| `Incompatible auth server: does not support dynamic client registration` | Falta `clientId` | §2, app propia |
| Navegador dice "authorizing Claude Code" | `clientId` de Claude en vez del propio | §2, Client ID ≠ App ID |
| `OAuth completion failed` + navegador `Successful` | Falla el canje `code→token`: secret ausente/equivocado, scopes viejos | §5+§7, flujo fresco |
| `SSE error: Non-200 status code (400)` con tokens guardados | App no habilitada para MCP | §6, toggle en `app-assistant` |
| `Missing key mcp.servers.enabled` | Formato V2 en OpenCode v1.15.5 | §1, claves planas |
| Botón Install no aparece | Sin scopes o workspace/permiso wrong | §4+§5 |

## 9. Verificación

```sh
opencode mcp list   # ✓ slack  connected (OAuth)
opencode mcp debug slack --print-logs --log-level DEBUG
```

`debug` muestra `Auth status: ✓ authenticated` y el error real del handshake
(Streamable HTTP), no el genérico del `auth`.

## 10. Referencias

- <https://docs.slack.dev/ai/slack-mcp-server> (overview, scopes por tool)
- <https://docs.slack.dev/ai/slack-mcp-server/connect-to-harnesses>
- <https://opencode.ai/docs/mcp-servers/> (OAuth: automatic vs pre-registered)
