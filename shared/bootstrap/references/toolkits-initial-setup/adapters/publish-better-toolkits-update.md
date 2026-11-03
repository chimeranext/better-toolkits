# publish-better-toolkits-update — protocol SSOT

Editor-side publish command for better-toolkits. It is the counterpart to the
consumer-side per-harness update scripts (`update-better-toolkits-marketplace-*`):
those pull updates into a machine; this publishes the artifacts that a fresh
install fetches.

## Why

The one-liner curl install (`apps/web/public/install-opencode.sh`) downloads the 5
MCP servers from `https://toolkits.chimeranext.dev/mcp/<name>.tar.gz`. Those assets
must exist. Publishing them, bumping the marketplace, and deploying the site are
all release steps — this command makes them a single repeatable action.

## Pipeline

1. **MCP assets** — for each of the 5 MCP servers, build a tarball from its source
   (excluding `node_modules/`, since the install script runs `npm ci` at the
   destination). Sources:

   | Server | Source |
   | --- | --- |
   | `notion-chimeranext` | `shared/mcp/notion-chimeranext/` |
   | `posthog-chimeranext` | `shared/mcp/posthog-chimeranext/` |
   | `google-workspace-apps` | `shared/google-workspace-apps/` |
   | `social-media-ads-mcp` | `shared/mcp/social-media-ads-mcp/` |
   | `stitch-chimeranext` | `shared/mcp/stitch-chimeranext/` |

   Output: `apps/web/public/mcp/<name>.tar.gz`.

2. **Marketplace** — reuse the pre-push gate: `marketplace_versioning.py write
   --range origin/main..HEAD`. Same versioning authority as push.

3. **Site** — with `--deploy`, run the `apps/web` build (Next.js copies
   `public/` → `out/`) and publish to GitHub Pages (same pipeline as
   `.github/workflows/deploy-pages.yml`).

## Invocation

```bash
bash shared/bootstrap/scripts/publish-better-toolkits-update.sh [--dry-run] [--deploy] [--only <mcp|marketplace|site>]
```

## Example

```bash
bash shared/bootstrap/scripts/publish-better-toolkits-update.sh --dry-run        # plan only
bash shared/bootstrap/scripts/publish-better-toolkits-update.sh                  # assets + marketplace
bash shared/bootstrap/scripts/publish-better-toolkits-update.sh --deploy          # + deploy site
```

## Relationship to update scripts

| Direction | Command / script | What it does |
| --- | --- | --- |
| Publish (editor) | `/publish-better-toolkits-update` | emits MCP assets + marketplace bump + site deploy |
| Update (consumer) | `update-better-toolkits-marketplace-opencode.sh` | pulls clone + re-syncs wiring |
| Install (consumer) | `curl -fsSL .../install-opencode.sh \| bash` | installs toolkit layer + MCP servers globally |
