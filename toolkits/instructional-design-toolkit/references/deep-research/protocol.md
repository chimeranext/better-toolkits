# /deep-research — protocol SSOT

Harness-agnostic body. Thin entry: `commands/deep-research.md`.

---

# Deep research: $ARGUMENTS

Fetch a Notion page/database **tree** to markdown files with **verbatim URLs**
(bookmarks, videos, embeds, files). Uses the custom `notion-batch` MCP
(`mcp/notion-batch/`, REST API) — NOT the native Notion MCP, which drops
bookmark destinations (renders `<unknown url="page#fragment">`).

**Arguments format:** `{url-or-id} [--depth N] [--max-pages N] [--out <dir>]`

- **url-or-id**: hub page or database URL (or 32-hex id). Default depth 4, max 6.
- **--out**: destination dir for `.md` files (default: ask; academy dumps go
  under `docs/vertivo/<slug>/`). Writes outside the active workspace need
  explicit human OK (HITL doctrine) — propose the tree first.

## Phase 1 — Preflight

1. Check `notion-batch` is connected (tool available). If not:
   - Is `NOTION_API_KEY` exported (`echo ${#NOTION_API_KEY}` >0)?
   - Is the server in OpenCode MCP config (see `mcp/notion-batch/README.md`)?
   - Is the integration invited (Share) to the target pages?
   - Never invent URLs or token values; stop and report which check failed.
2. Parse root id (the server accepts full URLs too).

## Phase 2 — Fetch

1. `query_database` first when root is a DB → inventory table (title + URL per
   row). Present it; confirm scope before the heavy fetch when >50 rows.
2. `fetch_tree {root, max_depth, max_pages}` → per-page markdown + inventory.
3. If `truncated: true`: report counts, ask whether to raise `--max-pages` /
   `--depth` or split by subtree.

## Phase 3 — Write

1. One `.md` per page (`README.md` index for the hub with links + source URLs).
2. Frontmatter per file: `> source: <notion-url>` + extraction date.
3. `file:` attachment URLs are signed (~1h expiry) — never present them as
   permanent; note re-fetch in the file.
4. Verify: every `fetch_tree` page landed in exactly one file; list orphans.

## Non-goals

- No binary downloads by default (images/files stay as URLs; download only on
  explicit `--fetch-assets`, storing under `<out>/assets/`).
- No CAMPUS/cmi5 mapping here — that is `new-course` / downstream commands
  consuming these dumps.
