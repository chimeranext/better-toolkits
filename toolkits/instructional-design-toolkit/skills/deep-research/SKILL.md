---
name: deep-research
description: Deep research (estilo Google Gemini Deep Research) que produce capítulos de curso estructurados para el repo ../academy. Combina Notion recursive crawl + scrapers web (crw, Scrapling, yt-dlp, webfetch) + síntesis por capítulos. Use cuando el usuario pide "deep research", "investigación profunda", "armar capítulo", "investigar tema para curso", "research para academy", o cuando necesita contenido de curso basado en fuentes web/Notion. No confundir con research-methodology (que es el proceso de investigación académica, no la producción de capítulos).
---

# Deep Research — Capítulos de Curso para Academy

Skill de investigación profunda (inspirado en Google Gemini Deep Research) que produce
capítulos de curso estructurados para el repo `../academia`. Combina:

1. **Notion recursive crawl** — vía `notion-chimeranext` MCP (REST API) para resolver el
   blind spot de bookmarks del MCP nativo.
2. **Scrapers web** — `crw` (rápido, URL→markdown), `Scrapling` (stealth/dynamic
   fallback), `yt-dlp` (transcripts), `webfetch` (último recurso).
3. **Síntesis por capítulos** — el agente organiza el contenido crawlado en
   capítulos de curso listos para `new-course`.

## When to use

- User pide "deep research", "investigación profunda", "armar un capítulo",
  "investigar este tema para un curso", "research para academy".
- User tiene una DB de Notion tipo "Biblioteca de Guías" y quiere convertirla
  en contenido de curso.
- User quiere scrapear contenido web (YouTube, artículos, PDFs) para
  alimentar capítulos de curso.

## Scrapers disponibles (tools del agente)

| Tool | Uso | Cuándo |
|------|-----|--------|
| `crw <url>` | URL→markdown rápido | artículos, PDFs, páginas estáticas |
| `Scrapling` | stealth fetch dinámico | sitios con anti-bot, JS-rendered |
| `yt-dlp --write-subs --skip-download` | transcript YouTube | videos |
| `webfetch` | fallback HTTP | cuando crw/Scrapling fallan |

**Importante:** estos son tools del agente (shell/CLI), no herramientas de
herramientas. Se invocan desde el shell del agente. Nunca uses `2>/dev/null`.

## Pipeline

### Step 1 — Notion crawl (si hay DB de Notion)

```bash
/deep-research <notion-db-url> --out docs/<tema>/
```

- `query_database` primero (inventario: título + URL por fila).
- `fetch_tree {root, max_depth, max_pages}` → markdown por página + inventario.
- Escribe `docs/<tema>/sitemap.yaml` con el árbol recursivo.

### Step 2 — Enriquecer recursos externos

```bash
scripts/notion-enrich.py --sitemap docs/<tema>/sitemap.yaml
```

Para cada `resources[]` por `kind`:
- `youtube` → `yt-dlp --write-subs --skip-download -o <out>/yt_%(id)s <url>`
- `article` → `crw <url>` → markdown
- `pdf` → `crw <url>` → extract
- `image` → `curl -sS -o <out>/assets/<nombre> <url>`
- `bookmark` → resolver destino vía REST API → recargar según el destino
- `notion_page` → `fetch_tree` recursivo

### Step 3 — Síntesis del capítulo

El agente (no un script) organiza el contenido crawlado en un capítulo:

1. Leer el sitemap + el contenido de cada página.
2. Por cada guía, extraer: conceptos clave, pasos, herramientas, ejemplos.
3. Escribir `docs/<tema>/capitulos/<capitulo>.md` con:
   - Frontmatter (título, fuente, fecha de extracción)
   - Objetivos de aprendizaje
   - Conceptos clave (definiciones)
   - Procedimientos paso a paso
   - Recursos externos (URLs verbatim)
   - Ejemplos y casos
4. Generar `docs/<tema>/manifest.json` con estado por recurso.

### Step 4 — Verificación

- Cada página de `fetch_tree` aterrizó en exactamente un archivo.
- Cada bookmark URL se resolvió a un destino real (nunca `<unknown>`).
- Sin `2>/dev/null` en ningún script.
- El manifest registra estado por recurso (dumped/enriched/pending/failed).

## Sitemap YAML spec (v1)

```yaml
version: 1
source:
  notion_database: <url>
  data_source: collection://<id>
  guides_count: N
  extracted_at: "<ISO>"
  extraction_mode: recursive
guides:
  - id: "01"
    skill: "Skill Name"
    type: Dura Tecnológica | Dura en Finanzas | Blanda Corporativa | Blanda Personal
    notion_url: https://app.notion.com/p/<id>
    local_path: docs/<tema>/<slug>/
    children:
      - { kind: notion_page, title: "...", notion_url: ..., local_path: ... }
    resources:
      - { kind: youtube, url: "..." }
      - { kind: article, url: "..." }
```

### Node kinds (fixed enum)
`notion_page | youtube | article | pdf | image | bookmark | notion_page_mention`

### Contract
- `local_path` of hub = folder; each subguide = `.md`. The wrapper dumps there.
- `resources` = inventory of external URLs only; NOT resolved in the sitemap.
- If `local_path` doesn't exist when the wrapper runs → fail explicitly (never silently).
- The YAML is regenerable from `notion-chimeranext`; never edit by hand.

## Reusabilidad

Cualquier startup con una DB de Notion tipo "Biblioteca de Guías" puede apuntar
el crawler a su propia URL y obtener un volcado local + sitemap. La DB Vertivo
es la instancia de referencia.

## Related

- `shared/mcp/notion-chimeranext/` — custom MCP (REST API) que bypassa el blind spot del nativo.
- `references/deep-research/protocol.md` — command SSOT.
- `commands/deep-research.md` — thin entry.
