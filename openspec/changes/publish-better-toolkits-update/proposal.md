# Proposal — /publish-better-toolkits-update

**Change:** `publish-better-toolkits-update`
**Domain:** `area:meta`
**Status:** Proposed
**Date:** 2026-11-03

## What we will build

A **publish command** for the better-toolkits bootstrap — the "editor-side" counterpart
to the per-harness update scripts. It publishes the artifacts the one-liner curl
install consumes:

1. **Slash command** `/publish-better-toolkits-update` (thin entry → `references/.../protocol.md`).
2. **MCP assets** — generate tarballs for the 5 local MCP servers from `shared/mcp/`
   and `shared/google-workspace-apps/`, placed at `apps/web/public/mcp/<name>.tar.gz`.
3. **Marketplace update** — bump plugin versions in `.claude-plugin/marketplace.json`
   when release-relevant changes exist (same gate as pre-push).
4. **Site deploy** — rebuild/deploy `apps/web` so the new assets land on
   `toolkits.chimeranext.dev`.

## For whom

- Maintainers who need to publish a new version of the MCP servers or toolkit plugins
  so the `curl -fsSL https://toolkits.chimeranext.dev/install-opencode.sh | bash`
  one-liner installs the latest bits without a repo clone.
- The one-liner curl install (`install-opencode.sh`) depends on these assets existing
  at predictable URLs.

## Why now

- The one-liner curl install (in `apps/web/public/install-opencode.sh`, PR #176) is
  being extended to install the 5 MCP servers globally. It downloads them from
  `https://toolkits.chimeranext.dev/mcp/<name>.tar.gz` — those assets must be
  published by something. Today there is no editor-side command that does this.
- Updating the marketplace and deploying the site are currently manual / ad-hoc;
  a single publish command makes the release repeatable.

## Success criteria

- Running `/publish-better-toolkits-update` generates the 5 MCP tarballs, bumps a
  marketplace version when needed, and deploys the site.
- The `curl -fsSL .../install-opencode.sh | bash` one-liner can then fetch and
  install the 5 MCP servers globally, working without a repo clone.
