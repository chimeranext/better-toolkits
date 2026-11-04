---
description: "Publish better-toolkits release artifacts: 5 MCP server tarballs, marketplace version bump, and (with --deploy) site deploy. Editor-side counterpart to the one-liner curl install."
priority: 9
---
# /publish-better-toolkits-update

Publishes the artifacts the one-liner curl install consumes, so a fresh install
fetches the latest bits **without a repo clone**:

1. **MCP assets** — generate `apps/web/public/mcp/<name>.tar.gz` for the 5 local
   MCP servers from `shared/mcp/` and `shared/google-workspace-apps/`.
2. **Marketplace** — bump plugin versions in `.claude-plugin/marketplace.json` when
   release-relevant changes exist (same gate as pre-push).
3. **Site** — (with `--deploy`) build and publish `apps/web` so the new assets
   land on `toolkits.chimeranext.dev`.

## Command

```bash
bash shared/bootstrap/scripts/publish-better-toolkits-update.sh [--dry-run] [--deploy] [--only <mcp|marketplace|site>]
```

- `--dry-run` — print the plan, write nothing.
- `--deploy` — also run the site build/publish.
- `--only` — restrict to one subsystem.

## Output

```
[publish] wrote apps/web/public/mcp/notion-chimeranext.tar.gz
[publish] wrote apps/web/public/mcp/posthog-chimeranext.tar.gz
[publish] wrote apps/web/public/mcp/google-workspace-apps.tar.gz
[publish] wrote apps/web/public/mcp/social-media-ads-mcp.tar.gz
[publish] wrote apps/web/public/mcp/stitch-chimeranext.tar.gz
[publish] done.
```

## Consumed by

- `apps/web/public/install-opencode.sh` (the `curl -fsSL https://toolkits.chimeranext.dev/install-opencode.sh | bash` one-liner) downloads these assets to `~/.local/share/better-toolkits/mcp/` and runs `npm ci`.
