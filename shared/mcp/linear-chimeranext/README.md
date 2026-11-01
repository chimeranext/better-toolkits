# linear-chimeranext — local stateless Linear MCP (GraphQL)

Local stdio ViteMCP server que reemplaza al MCP remoto `linear-project` por
una versión local, stateless, que habla directo con la API pública de Linear
(GraphQL).

- Endpoint: `https://api.linear.app/graphql` (único, GraphQL — no hay REST).
- Auth: `LINEAR_API_KEY` (personal API key, `lin_api_…`) enviada **verbatim**
  en el header `Authorization` (scheme de Linear: sin prefijo `Bearer` para
  llaves personales). El secreto vive solo en env — nunca en config JSON, chat
  o logs.
- Stateless / ViteMCP: targets MCP revision 2026-07-28. Sin `initialize`
  handshake ni sesión — cada request es autocontenido.

## Requisito: API key

1. Linear → Settings → Security & access → Personal API keys → create.
2. Guarda el secret `lin_api_…` → `LINEAR_API_KEY` en env (nunca en claro).

## OpenCode (opt-in — no es parte del set canónico)

```json
{
  "mcp": {
    "servers": {
      "linear-chimeranext": {
        "type": "local",
        "command": ["node", "/ABS/better-toolkits/shared/mcp/linear-chimeranext/server.js"],
        "environment": { "LINEAR_API_KEY": "{env:LINEAR_API_KEY}" }
      }
    }
  }
}
```

Verificar: `opencode mcp list` → `✓ linear-chimeranext connected`.

## Tools

| Tool | Uso |
|------|-----|
| `team_list {}` | lista teams (id, name, key) — resuelve el `teamId` para `issue_create` |
| `issue_get {id}` | un issue por UUID o identifier humano (p.ej. `ENG-123`) |
| `issue_search {term, first=25}` | full-text search (`searchIssues`) |
| `issue_create {teamId, title, description?, assigneeId?, labelIds?, stateId?, priority?}` | crea un issue (description en markdown; priority 0–4) |

Límites honestos: `searchIssues` y `teams` devuelven la primera página (usa
`first` en search; max 250). `issue_get` y `issue_create` son operaciones
puntuales. Errores de GraphQL y `success: false` en mutations se reportan como
`UserError` claro (nunca un crash).

## Dev

```bash
npm ci
npm test   # node --test test/ — fetch mockeado, sin red ni token
```

Dogfood: `node test/dogfood-verify.mjs` → imprime `ok - …` y termina con
`LINEAR_VITEMPCP_VERIFY_PASS` (también consumido por `dogfood-run.sh`).
