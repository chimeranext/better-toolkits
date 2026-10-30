# Proposal

## Why

The `opencode.json` currently registers a `posthog` MCP server pointing at the
PostHog **SaaS** endpoint (`https://mcp.posthog.com/mcp`). The studio decision
was to self-host PostHog (Podman, hobby-deploy) and expose it to agents via a
local, stateless ViteMCP server — the same pattern already used for
`stitch-chimeranext`, `notion-chimeranext`, and `social-media-ads-mcp`. The
cloud endpoint (with dynamic OAuth) sends product/behavioral data to PostHog's
cloud and does not reflect the self-hosted architecture, so it must be replaced.

## What Changes

- **Add** a stateless ViteMCP server `shared/mcp/posthog-chimeranext/`
  (stdio, Node) that talks to the self-hosted PostHog instance
  (`http://localhost:8000`) using a per-call `POSTHOG_PERSONAL_API_KEY` /
  host from env — no secret or key embedded in `opencode.json`.
- **Change** `opencode.json` to register `posthog-chimeranext` as a local server
  (`type: local`, `command: ["node", "shared/mcp/posthog-chimeranext/server.js"]`)
  instead of the remote `posthog` SaaS entry, removing `url`/`oauth`.
- **Revert** the temporary cloud-oriented v8r fixes on PRs #167/#169
  (`b7c176d` / `5eb1973`) that left `mcp.posthog.com` in place.
- **Document** the self-hosted deploy (Podman hobby-deploy) in the server README.

## Capabilities

### New Capabilities
- `shared-mcp/posthog-chimeranext`: a local stateless MCP server exposing
  PostHog self-hosted query tools (insights/funnel/retention) to agents, with
  no embedded credentials.

### Modified Capabilities
- (none — no existing spec-level behavior changes)

## Impact

- New code: `shared/mcp/posthog-chimeranext/` (`server.js`, `package.json`,
  `package-lock.json`, `README.md`, `test/`).
- Config: root `opencode.json` MCP servers section.
- Repos/PRs affected: this monorepo's PRs #167 and #169 (they carry the
  cloud-oriented `opencode.json` state).
