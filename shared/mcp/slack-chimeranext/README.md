# slack-chimeranext — custom Slack MCP (Web API, stateless)

Local stdio MCP server que habla directo con la Slack Web API pública
(`https://slack.com/api/`) con auth Bearer. Sin dependencia de un MCP
hosteado de terceros para las operaciones básicas y estables: listar canales,
postear un mensaje y listar usuarios. Stateless / ViteMCP (revisión MCP
2026-07-28 — sin handshake `initialize`, sin `Mcp-Session-Id`).

## Requisito: token

1. Crea un bot token en `https://api.slack.com/apps` (App → OAuth & Permissions).
2. Guarda el secret `xoxb-…` con `/secret-input` → `SLACK_BOT_TOKEN` en
   `mcp-secrets.env` (nunca en claro).
3. Otorga los scopes necesarios: `conversations:read`, `channels:history`
   (opcional), `chat:write`, `users:read`. El token debe tener scope para las
   operaciones que uses.

## OpenCode (opt-in — no es parte del set canónico)

```json
{
  "mcp": {
    "servers": {
      "slack-chimeranext": {
        "type": "local",
        "command": ["node", "shared/mcp/slack-chimeranext/server.js"],
        "environment": { "SLACK_BOT_TOKEN": "{env:SLACK_BOT_TOKEN}" }
      }
    }
  }
}
```

El proceso server necesita `node` resoluble (misma regla que
`chrome-devtools-mcp`). Verificar: `opencode mcp list` →
`✓ slack-chimeranext connected`.

## Tools

| Tool | Uso |
|------|-----|
| `conversation_list {types=public_channel, limit=100, cursor?}` | lista canales/conversaciones (id, name, is_archived, member_count) |
| `message_post {channel, text, thread_ts?}` | postea un mensaje a un canal/DM; devuelve `channel` y `ts` |
| `user_list {limit=100, cursor?}` | lista usuarios del workspace (id, real_name, display_name, deleted, profile) |

Límites honestos: solo tools implementables de forma confiable contra la Slack
Web API pública; la API de Slack devuelve `{ ok, error }` (un `ok:false`
se lanza como UserError); paginación vía `next_cursor`.

## Dev

```bash
npm ci
npm test  # node --test test/ — fetch mockeado, sin red ni token real
```
