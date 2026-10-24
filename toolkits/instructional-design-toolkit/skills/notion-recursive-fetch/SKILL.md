---
name: notion-recursive-fetch
description: Recursively scrape a Notion database (pages + subpages + external resources) into local Markdown for academy/course content. Uses the custom notion-batch MCP (REST API) to bypass the native Notion MCP bookmark blind spot. Works for any startup that has a Notion "Biblioteca de Guías" style database. Requires NOTION_API_KEY and the notion-batch MCP registered.
---

# Notion Recursive Fetch

Skill for extracting Notion content (hubs + subpages + external resources) into
local Markdown files, producing a sitemap YAML that the enricher consumes.

## When to use

- User wants to import Notion self-study guides into the academy repo.
- User has a Notion database of "skills/guides" with subpages and external links.
- User wants to scrape content recursively (Notion pages + YouTube + articles + PDFs).

## Prerequisites

1. **NOTION_API_KEY** exported (`echo ${#NOTION_API_KEY}` > 0). Create an internal integration at `notion.so/my-account/integrations`, save the `ntn_…` secret via `/secret-input`.
2. **notion-batch MCP** registered in OpenCode (see `mcp/notion-batch/README.md`). Verify: `opencode mcp list` → `✓ notion-batch connected`.
3. **Share** the Notion pages/DB with the integration (Notion → Share → invite the integration).
4. **yt-dlp** installed (for YouTube transcripts): `pip install yt-dlp` or `brew install yt-dlp`.
5. **crw** binary (optional, for fast article/PDF fetch): see https://github.com/fastcrw/crw.
6. **Scrapling** (optional, stealth fallback): `pip install scrapling`.

## Pipeline

### Step 1 — Generate the sitemap

Run `/notion-recursive-fetch <notion-url-or-id>`:

1. `query_database` first (inventory table: title + URL per row). Confirm scope if >50 rows.
2. `fetch_tree {root, max_depth, max_pages}` → per-page markdown + inventory.
3. Write `docs/vertivo/sitemap.yaml` with the recursive tree (see sitemap spec below).
4. One `.md` per page (`README.md` index for the hub with links + source URLs).
5. Frontmatter per file: `> source: <notion-url>` + extraction date.

### Step 2 — Enrich external resources

Run the enricher: `scripts/notion-enrich.py --sitemap docs/vertivo/sitemap.yaml`

For each `resources[]` entry by `kind`:
- `youtube` → `yt-dlp --write-subs --skip-download` → transcript → `.md`
- `article` → `crw` (fast) or `webfetch` (fallback) → `.md`
- `pdf` → `crw` extract → `.md`
- `image` → download to `<out>/assets/` + reference
- `notion_page` / `bookmark` → resolve via REST API → recurse or enrich by resolved kind

### Step 3 — Verify

- Every `fetch_tree` page landed in exactly one file.
- List orphans (pages without a local file).
- Signed `file:` URLs expire (~1h) — note re-fetch in the file.

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
    local_path: docs/vertivo/<slug>/
    children:
      - { kind: notion_page, title: "...", notion_url: ..., local_path: ... }
      - { kind: youtube, url: "...", local_path: ... }
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
- The YAML is regenerable from `notion-batch`; never edit by hand.

## Non-goals
- No binary downloads by default (images/files stay as URLs; download only on explicit `--fetch-assets`).
- No CAMPUS/cmi5 mapping here — that is `new-course` / downstream commands.

## Related
- `mcp/notion-batch/` — custom MCP (REST API) that bypasses the native blind spot.
- `references/notion-recursive-fetch/protocol.md` — command SSOT.
- `commands/notion-recursive-fetch.md` — thin entry.