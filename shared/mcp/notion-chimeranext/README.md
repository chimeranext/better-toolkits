# notion-batch — custom Notion MCP (REST, sin pérdida)

Local stdio MCP server que se salta el límite del MCP nativo de Notion
(`https://mcp.notion.com/mcp` renderiza bookmarks como `<unknown
url="page#fragment">` sin destino). Habla con la Notion REST API, donde
`bookmark.url` viene verbatim, y fetchea recursivo página/database →
markdown con inventario de URLs.

## Requisito: token (una vez, 5 min)

1. `notion.so/my-account/integrations` → New integration → Internal (`academy-fetch`).
2. Guarda el secret `ntn_…` con `/secret-input` → `NOTION_API_KEY` en `mcp-secrets.env` (nunca en claro).
3. En Notion: Share de cada página/DB a extraer → invita a la integration.

## OpenCode (opt-in — no es parte del set canónico)

```json
{
  "mcp": {
    "notion-batch": {
      "type": "local",
      "command": ["node", "/ABS/better-toolkits/toolkits/instructional-design-toolkit/mcp/notion-batch/server.js"],
      "environment": { "NOTION_API_KEY": "{env:NOTION_API_KEY}" }
    }
  }
}
```

PATH de node: el proceso server necesita `node` resoluble (misma regla que
`chrome-devtools-mcp` en `setup-opencode.md`: si falla con `Connection
closed`, pinea `environment.PATH` con el dir del binario de node).

Verificar: `opencode mcp list` → `✓ notion-batch connected`.

## Tools

| Tool | Uso |
|------|-----|
| `fetch_tree {root, max_depth=4, max_pages=300}` | hub/DB → markdown por página + inventario. Bookmarks, videos, embeds y archivos con URL verbatim; `child_page`/`child_database` recursan; archivos `file:` llevan aviso de expiración (~1h, re-fetch para renovar firma) |
| `query_database {database}` | filas planas (título + URL + props), sin recursión |

Límites honestos: ~3 req/s (throttle interno 350ms); `max_pages` corta con
`truncated: true`; bloques `table_row` → pipes; tipos no mapeados se marcan
`<!-- unsupported block -->` en vez de perderse en silencio.

## Dev

```bash
npm install
npm test   # node --test test/ — fetch mockeado, sin red ni token
```
