# OpenCode MCP config — protocol SSOT

Playbook para conectar MCP servers remotos con OAuth en OpenCode (verificado con
Slack MCP en OpenCode v1.15.5 y opencode v2.0.4). Harness-specific body; el patrón
aplica a cualquier MCP remoto con OAuth confidencial.

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

Variante opencode v2 (verificado en v2.0.4): claves planas bajo `mcp` siguen
válidas; se agrega `redirectUri` pineado (ver §3 — sin esto v2 genera callback
con puerto aleatorio y Slack lo rechaza):

```json
{
  "mcp": {
    "slack": {
      "type": "remote",
      "url": "https://mcp.slack.com/mcp",
      "oauth": {
        "clientId": "<CLIENT_ID>",
        "clientSecret": "{env:SLACK_MCP_CLIENT_SECRET}",
        "redirectUri": "http://localhost:3118/callback"
      }
    }
  }
}
```

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

## 3. Redirect URIs: HTTP plano, ambas spellings registradas

En la app → **OAuth & Permissions → Redirect URLs**, registrar **ambas** y
**Save URLs** (Slack permite múltiples; no recortar a una sola):

```
http://127.0.0.1:19876/mcp/oauth/callback
http://localhost:3118/callback
```

- HTTP, NO HTTPS (OpenCode escucha en HTTP plano; con `https` el callback muere).
- `127.0.0.1:19876/...` es el default de OpenCode (v1 y default `McpOAuthConfig.redirectUri` en v2).
- `localhost:3118/callback` es la convención Claude-compatible: opencode v2 sin
  `redirectUri` pineado genera callback con **puerto aleatorio**
  (`http://127.0.0.1:<puerto>/callback`) y Slack lo rechaza con
  `redirect_uri did not match any configured URIs` antes del consent.
  Pineando `"redirectUri": "http://localhost:3118/callback"` en la config (§1,
  variante v2) el flujo usa la URL registrada. Ojo: `localhost` ≠ `127.0.0.1`
  para el match exacto de Slack.
- Localhost-HTTP es la excepción permitida al check de HTTPS.

## 4. Manifest instalable a la primera

Crear app **From manifest** (scopes de USER token, que es lo que usa el MCP):

```json
{
  "display_information": { "name": "opencode-slack-mcp" },
  "oauth_config": {
    "redirect_urls": [
      "http://127.0.0.1:19876/mcp/oauth/callback",
      "http://localhost:3118/callback"
    ],
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

Script (prompt GUI estilo `/secret-input`, persiste con mode 0600):

```sh
# Per-user (default, sin sudo): ~/.config/opencode/mcp-secrets.env + source en ~/.bashrc
shared/bootstrap/scripts/setup-opencode-mcp-slack.sh

# System-wide (/etc/profile.d): pide sudo vía GUI (run0 > pkexec > sudo)
shared/bootstrap/scripts/setup-opencode-mcp-slack.sh --system
```

Pide el **Client Secret** (NO Signing Secret) con zenity/kdialog (fallback:
lectura silenciosa en terminal) y lo guarda con `%q`-escaped + `chmod 600`.
Luego, en terminal nueva (o tras `source`):

```sh
opencode mcp logout slack              # limpia estado/PKCE viejo
opencode mcp auth slack                # autorizar en el navegador
```

Con `/secret-input` + `/secret-use`, la var vive solo en el proceso del comando.
El `code` del callback es de un solo uso (10 min): si el CLI dice
`OAuth completion failed`, hay que repetir el flujo fresco, no reusar la URL.

Rotación de secret (falla con `Authentication failed: bad_client_secret` aunque
el browser autorice): Show/Regenerate en `Basic Information → App Credentials`,
reescribir el env file sin exponer el valor y reiniciar el servicio desde shell
con env (ver §10 paso 4):

```sh
bash "${CLAUDE_PLUGIN_ROOT}/scripts/secret-store.sh" use SLACK_MCP_CLIENT_SECRET -- bash -c 'printf "export SLACK_MCP_CLIENT_SECRET=%s\n" "$SLACK_MCP_CLIENT_SECRET" > ~/.config/opencode/mcp-secrets.env && chmod 600 ~/.config/opencode/mcp-secrets.env'
```

## 8. Tabla de errores vistos

| Síntoma | Causa | Fix |
|---|---|---|
| `Incompatible auth server: does not support dynamic client registration` | Falta `clientId` | §2, app propia |
| Navegador dice "authorizing Claude Code" | `clientId` de Claude en vez del propio | §2, Client ID ≠ App ID |
| `OAuth completion failed` + navegador `Successful` | Falla el canje `code→token`: secret ausente/equivocado, scopes viejos | §5+§7, flujo fresco |
| `SSE error: Non-200 status code (400)` con tokens guardados | App no habilitada para MCP | §6, toggle en `app-assistant` |
| `Missing key mcp.servers.enabled` | Formato V2 en OpenCode v1.15.5 | §1, claves planas |
| Botón Install no aparece | Sin scopes o workspace/permiso wrong | §4+§5 |
| `mcp list` dice `connected` pero `mcp debug` da `401 Unauthorized` | Token muerto o `code` de otra app / secret ausente en el canje | §10: verificar que el segmento medio del `code` (`<clientid>.<...>`) coincida con el `clientId` de la config; flujo fresco con secret exportado |
| Sidebar dice `Needs auth` aunque el CLI dice `connected` | Estado stale de la sesión + refresh sin secret en el proceso servidor | §10: reinicio completo desde terminal con env |
| `opencode mcp auth slack` colgado por horas (proceso vivo, sin output) | Flujo OAuth a medio canje (secret ausente o callback reusado) | Matar el PID (`ps aux | grep "opencode mcp auth"`), exportar secret, flujo fresco |
| `logout` deja todo en rojo | El `logout` borra tokens que funcionaban; sin secret a mano no hay re-auth | No hacer `logout` a ciegas: primero `echo ${#SLACK_MCP_CLIENT_SECRET}` (>0), luego `logout + auth` |
| `redirect_uri did not match any configured URIs. Passed URI: http://127.0.0.1:<puerto-aleatorio>/callback` (v2) | Callback con puerto aleatorio, no registrado en la app | §1 variante v2 (`redirectUri` pineado) + §3 (ambas URLs con Save URLs) |
| `Authentication failed: bad_client_secret` (v2.0.4, browser sí autorizó) | Secret stale/rotado o de otra app | §7 rotación + §10 paso 4 (restart con env), un solo `auth` |
| `Authentication failed` + Zod `access_token`/`token_type` `undefined` (pre-2.0.4) | Preview no parsea el user-token anidado (`authed_user.access_token`) de Slack | Upgrade: `curl -fsSL https://opencode.ai/v2/install \| bash` (verificado fix en v2.0.4) |
| `Failed to start server. Is port 3118 in use?` al correr `mcp auth` | Listener del callback colgado en el proceso `serve` (matar el CLI no lo libera) | `ss -tlnp \| grep 3118`; solo `opencode2 service restart` lo libera; un `auth` a la vez |

## 9. Verificación

```sh
opencode mcp list   # ✓ slack  connected (OAuth)
opencode mcp debug slack --print-logs --log-level DEBUG
```

`debug` muestra `Auth status: ✓ authenticated` y el error real del handshake
(Streamable HTTP), no el genérico del `auth`.

En opencode v2 (verificado v2.0.4, app propia + `redirectUri` + secret fresco):

```sh
opencode2 mcp list  # ✓ chrome-devtools-mcp connected / ✓ context7 connected / ✓ slack connected
```

Token v1 de respaldo verificable sin exponerlo (solo `ok` + team):

```sh
python3 -c "
import json,urllib.request
d=json.load(open('/home/kvttvrsis/.local/share/opencode/mcp-auth.json'))
t=d.get('slack',{}).get('tokens',{}).get('accessToken','')
req=urllib.request.Request('https://slack.com/api/auth.test', headers={'Authorization':'Bearer '+t})
r=json.load(urllib.request.urlopen(req, timeout=15)); print(r.get('ok'), r.get('team'))"
# True ChimeraNext
```

## 10. Reinicio TUI/server: por qué una sesión nueva "pierde" el auth

El `{env:SLACK_MCP_CLIENT_SECRET}` se resuelve en el entorno del **proceso
servidor**, no por terminal. El env se hereda al nacer el proceso: si el
servidor/TUI nació sin la var, el access token funciona hasta que expira y
luego el refresh falla — el estado fluctúa (`connected` → `needs_auth`) y el
sidebar queda en `Needs auth` aunque el CLI diga `connected` (stale: refleja el
estado al arrancar la sesión).

Notas de versión: `opencode` (v1.15.5) **no** tiene subcomando `service`; el
servicio vivo es `opencode2 serve --service`. Se gestiona con `opencode2`.
Upgrade del preview cuando el auth falle con errores de parseo (firma Zod §8):
`curl -fsSL https://opencode.ai/v2/install | bash` (fix verificado en v2.0.4;
`opencode2 --version` para confirmar).

```sh
# 1. Matar un auth colgado (si lo hay)
ps aux | grep "opencode mcp auth" | grep -v grep

# 2. Cerrar el TUI (Ctrl+C o :exit)

# 3. Terminal NUEVA y verificar que trae el secret (bashrc hace auto-source)
echo ${#SLACK_MCP_CLIENT_SECRET}   # debe imprimir >0, no 0

# 4. Reiniciar el background server desde esa terminal
opencode2 service restart
opencode2 service status
opencode mcp list                  # ✓ slack connected (OAuth)

# 5. Relanzar el TUI desde esa misma terminal para que herede el env
opencode2
# o para volver a una sesión: opencode2 -s <session-id>
```

Reglas:

- Nunca `logout` sin tener el secret a mano (`echo ${#...}` >0 primero).
- Nunca reusar un `code` de callback: es de un solo uso y va atado a una app
  (comparar su segmento medio con el `clientId` de la config).
- Recargar/reabrir la sesión tras el restart: el sidebar no se actualiza solo.

## 11. Referencias

- <https://docs.slack.dev/ai/slack-mcp-server> (overview, scopes por tool)
- <https://docs.slack.dev/ai/slack-mcp-server/connect-to-harnesses>
- <https://opencode.ai/docs/mcp-servers/> (OAuth: automatic vs pre-registered)
- Upstream redirect aleatorio: `anomalyco/opencode#18955`, `#23787`
  (`McpOAuthConfig.redirectUri` para pinear el callback); Slack DCR:
  `slackapi/slack-mcp-plugin#7`
