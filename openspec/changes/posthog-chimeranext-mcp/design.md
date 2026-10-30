# Design

## Context

The repo currently registers a `posthog` MCP server pointing at the PostHog
cloud (`https://mcp.posthog.com/mcp`). The studio decision (see proposal.md ·
Why) is to self-host PostHog via Podman hobby-deploy and expose it through a
local stateless ViteMCP server. The repo already has the authoritative pattern
for this: `shared/mcp/stitch-chimeranext/server.js` (ViteMCP stdio server,
stateless, config from env, `npm test` with mocked deps). This design mirrors
that pattern for PostHog.

## Goals / Non-Goals

**Goals:**
- Provide `shared/mcp/posthog-chimeranext/` as a local, stateless ViteMCP
  server (stdio) that queries the self-hosted PostHog instance.
- Register it in `opencode.json` as a local server, removing the cloud entry.
- Revert the temporary cloud-oriented v8r fixes on PRs #167/#169.

**Non-Goals:**
- Not building a full PostHog SDK wrapper — only the tools agents need
  (insights/funnel/retention).
- Not changing the PostHog self-hosted deploy itself beyond documenting the
  Podman hobby-deploy command (already in `revenue-growth-toolkit/references/posthog/setup.md`).
- Not introducing cloud OAuth or any remote endpoint.

## Decisions

### D1 — ViteMCP stateless stdio server (mirror stitch-chimeranext)
- **Decision:** new `shared/mcp/posthog-chimeranext/server.js` using
  `@vitemcp/server` (same stack as stitch), listening over stdio.
- **Rationale:** matches the established multi-harness pattern for
  `*chimeranext` MCPs; stateless means no secrets in JSON or committed source.
- **Alternative considered:** the remote `mcp.posthog.com` (rejected — cloud,
  sends data off-site, contradicts self-hosted decision).

### D2 — Per-call env auth (`POSTHOG_HOST` + `POSTHOG_PERSONAL_API_KEY`)
- **Decision:** each `tools/call` reads `POSTHOG_HOST` (default
  `http://localhost:8000`) and `POSTHOG_PERSONAL_API_KEY` from env; missing env
  → clear `UserError` naming the variable (same as stitch's `requireEnv`).
- **Rationale:** stateless; no key in `opencode.json`; follows the repo's
  "no secrets in config" rule.

### D3 — Rest API over the self-hosted instance
- **Decision:** the server calls PostHog's public REST API (`/api/projects/.../insights/`, `funnel`, `retention`) at `POSTHOG_HOST` with `Authorization: Bearer <personal_api_key>`.
- **Rationale:** PostHog's self-hosted instance exposes the same REST API; no
  separate MCP endpoint is required. Keeps it stateless and local.
- **Alternative considered:** `mcp.posthog.com` (rejected, cloud).

### D4 — `opencode.json` local registration
- **Decision:** replace the cloud `posthog` entry with:
  ```json
  "posthog-chimeranext": {
    "type": "local",
    "command": ["node", "shared/mcp/posthog-chimeranext/server.js"],
    "environment": {
      "POSTHOG_HOST": "{env:POSTHOG_HOST}",
      "POSTHOG_PERSONAL_API_KEY": "{env:POSTHOG_PERSONAL_API_KEY}"
    }
  }
  ```
- **Rationale:** local server, no `url`/`oauth`, passes v8r, and honors the
  self-hosted intent.

## Risks / Trade-offs

- [R1] Self-hosted instance not running → tools return connection errors.
  → Mitigation: README documents the Podman hobby-deploy command; `UserError`
  surfaces the host clearly.
- [R2] PostHog API shape varies by version → tool responses may differ.
  → Mitigation: expose a small, well-scoped tool set and normalize responses.
- [R3] Reverting `b7c176d`/`5eb1973` on PRs #167/#169 touches shared files.
  → Mitigation: isolate per worktree; run `openspec validate` + `v8r` before
  push; HITL on merge.

## Migration Plan

1. Create `shared/mcp/posthog-chimeranext/` (server, package.json, tests, README).
2. Update root `opencode.json` to register `posthog-chimeranext` (local).
3. Revert the cloud entry/fixes on PRs #167/#169 (commit per branch).
4. `openspec validate posthog-chimeranext-mcp`; shellcheck/v8r gates.
5. Dogfood: boot the server (stdio) against the self-hosted instance and run
   a query; confirm no cloud traffic.

## Open Questions

- None blocking — deferrable: which specific PostHog tool set to expose first
  (insights vs funnel vs retention) can be decided during implementation.
