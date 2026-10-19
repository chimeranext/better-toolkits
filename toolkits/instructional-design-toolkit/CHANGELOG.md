# Changelog

## [Unreleased]

### Changed

- **hooks/prds/README.md:** OpenCode stderr registration points to `better-toolkits-bootstrap` / `setup-opencode.md` (not `/make-no-mistakes:opencode-setup`).

### Fixed
- Cap new-course lesson estimates at **20 minutes** (microlearning; was 15–60) — upstream IDT #38.
- Slides: semantic `<br>` line breaks + anti-widow `text-wrap` guidance — upstream IDT #31 (protocol + `skills/slides-generate`).

## [1.3.0] — 2026-10-19

### Added

- **commands/notion-recursive-fetch.md:** `/notion-recursive-fetch` — recursive, loss-less Notion fetch (page/database tree to markdown with verbatim bookmark/video/file URLs).
- **references/notion-recursive-fetch/protocol.md:** protocol SSOT (preflight → tree proposal → HITL out-dir OK → phased fetch).
- **mcp/notion-batch/:** custom local (stdio) MCP server over the Notion REST API that bypasses the native Notion MCP bookmark blind spot (server + tests + README).

