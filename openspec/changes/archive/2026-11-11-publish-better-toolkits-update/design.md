# Design — /publish-better-toolkits-update

## Overview

`/publish-better-toolkits-update` is the editor-side publish command. It makes the
release of MCP assets + marketplace + site a single repeatable action, so the
one-liner curl install always fetches current bits.

## Command surface

```
/publish-better-toolkits-update [--dry-run] [--deploy] [--only <mcp|marketplace|site>]
```

- `--dry-run` — plan only, no writes.
- `--deploy` — also run the site deploy pipeline.
- `--only` — restrict to one subsystem.

## Components

### 1. MCP assets (`apps/web/public/mcp/<name>.tar.gz`)

For each of the 5 MCP servers, build a tarball from its source:

| Server | Source |
| --- | --- |
| `notion-chimeranext` | `shared/mcp/notion-chimeranext/` |
| `posthog-chimeranext` | `shared/mcp/posthog-chimeranext/` |
| `google-workspace-apps` | `shared/mcp/google-workspace-apps/` |
| `social-media-ads-mcp` | `shared/mcp/social-media-ads-mcp/` |
| `stitch-chimeranext` | `shared/mcp/stitch-chimeranext/` |

Tarball excludes `node_modules/` (the install script runs `npm ci` at the destination).
A `.tar.gz` per server is written to `apps/web/public/mcp/<name>.tar.gz`.

### 2. Marketplace bump

Reuse the existing gate: `python3 scripts/ci/marketplace_versioning.py write --range origin/main..HEAD`.
This is the same logic the pre-push hook uses, so publish and push agree on versioning.

### 3. Site deploy

Run the same pipeline as `.github/workflows/deploy-pages.yml` (build `apps/web` +
publish to GitHub Pages). When `--deploy` is given, the command triggers it.

## Protocol location

- Command entry: `shared/bootstrap/commands/publish-better-toolkits-update.md`
- Protocol SSOT: `shared/bootstrap/references/toolkits-initial-setup/adapters/publish-better-toolkits-update.md`
- Script: `shared/bootstrap/scripts/publish-better-toolkits-update.sh`
