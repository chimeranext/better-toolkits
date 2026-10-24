---
created: 2026-10-16 12:00
session_topic: Notion MCP + Vertivo extraction to academy
branch: feat/94-otel-ux-replay
status: pending
---

# Next Day: Notion MCP + Vertivo extraction to academy

## Done
- Notion added to canonical OpenCode MCP set (6→7 servers): `mcp.js:40` + `audit.js:152` + `cli.test.js:92` + `setup-opencode.md:194,273` — bootstrap tests 23/23 OK
- `notion` (`https://mcp.notion.com/mcp`, browser OAuth) merged into `~/.config/opencode/opencode.json`; auth completed, workspace Vertivo confirmed
- Vertivo inventory: 38 guides indexed → `academy/docs/vertivo-biblioteca-inventario.md`
- Pilot guide #31 (Modelado 3D, hub + 9 subpages) extracted via native MCP → `academy/docs/vertivo/modelado-3d/` (10 files)
- Diagnosed native MCP blind spot: bookmarks render as `<unknown url="page#fragment">`, destination never exposed (verified full 56-tool catalog, no block-level tool)
- Scaffolded custom `notion-batch` MCP (REST API, stdio): `toolkits/instructional-design-toolkit/mcp/notion-batch/` — `server.js` + `test/server.test.js` (9/9 pass mocked) + `README.md`
- Created `/notion-recursive-fetch`: `commands/notion-recursive-fetch.md` + `references/notion-recursive-fetch/protocol.md`
- Version bumps: instructional-design-toolkit 1.2.2→1.3.0 (`plugin.json` + root `marketplace.json`, 1-line diff)
- Confirmed enrichment plan: crw (fast URL→markdown, has MCP) + Scrapling (stealth/dynamic fallback, has MCP) + `yt-dlp` (installed, transcript-tested on pilot video `Sq1S4sZJXMc` → "Introducción a Autocad 2022", 1:24:59)

## In Progress
- notion-batch MCP: scaffolded + unit-tested, NOT live-verified (needs `NOTION_API_KEY`) and NOT registered in `opencode.json`
  - Files: `toolkits/instructional-design-toolkit/mcp/notion-batch/{server.js,test/server.test.js,README.md,package.json}`
- Pilot re-fetch with full bookmark URLs: blocked on token (pilot `.md` files currently contain `bookmark (bloque …)` placeholders instead of real URLs)
- Content-enrichment pipeline (bookmark URL → crw/Scrapling/yt-dlp → academy study guides): designed, not built

## Pending (Not Started)
- [ ] User: create internal integration at `notion.so/my-account/integrations`, save `ntn_…` as `NOTION_API_KEY` in `mcp-secrets.env`, Share Vertivo pages to it
- [ ] Register `notion-batch` in `~/.config/opencode/opencode.json` (snippet in `mcp/notion-batch/README.md`) + `opencode mcp list` verify
- [ ] Re-run pilot (#31) via `fetch_tree`, rewrite 10 `.md` with verbatim URLs
- [ ] Build enricher script: classify URL (youtube/article/doc) → yt-dlp subs / crw → Scrapling fallback → per-URL md + manifest
- [ ] Install `crw` binary; `pip install scrapling` (both have MCP servers — decide script-first vs MCP-wired)
- [ ] Decide: `notion-batch` as 8th opt-in row in `setup-opencode.md` canonical table (left out deliberately — don't force on token-less setups without user OK)
- [ ] Commit + push: better-toolkits branch `feat/94-otel-ux-replay` has unrelated uncommitted work mixed in (see Git State)

## Resume Instructions

To continue this work:

1. Ask user for `NOTION_API_KEY` status (token created + pages shared?)
2. Register notion-batch in opencode.json, restart service, verify `opencode mcp list`
3. Re-fetch pilot: `fetch_tree` on `a7ad121dfabb477092d25eed4ecd38d0`, rewrite `academy/docs/vertivo/modelado-3d/`
4. Build enricher script, pilot on Modelado 3D URLs, then scale to 38 guides

### Key Files
- `toolkits/instructional-design-toolkit/mcp/notion-batch/server.js` — custom MCP; `fetchTree`, `renderBlock` (bookmark fix), `parseId`
- `toolkits/instructional-design-toolkit/mcp/notion-batch/README.md` — opencode config snippet
- `toolkits/instructional-design-toolkit/references/notion-recursive-fetch/protocol.md` — command SSOT
- `shared/bootstrap/cli/lib/mcp.js:40` — canonical `notion` entry
- `../academy/docs/vertivo/` — inventory + pilot (branch `feat/1-academy-tokens-ssot`, untracked `docs/`)

### Key Context
- Native Notion MCP CANNOT resolve bookmark URLs — hard API limitation, not a formatting choice. Don't retry via MCP; needs REST token.
- `mcp.js` reads `mcp.servers` but live user config uses flat `mcp.*` keys (pre-existing drift) — notion was merged in flat format manually.
- Vertivo guides are YouTube-heavy → transcripts via yt-dlp, not page scraping. crw=bulk fast path, Scrapling=stealth fallback.
- Academy repo has no `content/` convention yet; dumps live in `docs/vertivo/` pending structure decision.
- crw engine is AGPL-3.0 (local binary use is fine); Scrapling is BSD-3-Clause.

## Git State
- Branch: `feat/94-otel-ux-replay` (better-toolkits — NOTE: pre-existing feature branch, not created this session)
- Uncommitted changes: yes — marketplace.json, audit.js, mcp.js, cli.test.js, setup-opencode.md, plugin.json (modified) + notion-recursive-fetch.md, mcp/, references/notion-recursive-fetch/ (untracked)
- Stashes: 6 pre-existing `resolve-oq` backups (untouched)
- Open worktrees: none (`academy` is a separate checkout on `feat/1-academy-tokens-ssot` with untracked `docs/`)
- Academy: branch `feat/1-academy-tokens-ssot`, untracked `docs/` only

## Linear Issues
- None discussed this session — skipped.

## Session Log (Compressed)
Session goal was adding a Notion MCP to better-toolkits to pull Vertivo content into the academy repo. First established the official remote Notion MCP (`mcp.notion.com/mcp`) beats the deprecated `notion-mcp-server`, wired it as 7th canonical server with tests passing, and completed browser OAuth. Indexed the target DB (Biblioteca de Guías, 38 rows) and extracted pilot guide #31 end-to-end. User then flagged the bookmark placeholder problem; investigation proved the native MCP structurally omits bookmark destinations, which motivated scaffolding the `notion-batch` REST MCP plus the `/notion-recursive-fetch` command with version bumps. User then redirected enrichment strategy to crw + Scrapling for fetching behind-bookmark content as real academy study guides; verified yt-dlp works for the YouTube-heavy corpus and confirmed both tools' capabilities from their repos. Session ended at the token handoff: everything is built and tested except live REST verification, which needs the user's integration token.
