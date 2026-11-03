#!/usr/bin/env bash
# /publish-better-toolkits-update — editor-side publish command.
#
# Generates the 5 MCP server tarballs the one-liner curl install consumes,
# bumps marketplace versions when release-relevant changes exist, and (with
# --deploy) deploys the site so the assets land on toolkits.chimeranext.dev.
#
# Usage:
#   publish-better-toolkits-update.sh [--dry-run] [--deploy] [--only <mcp|marketplace|site>]
#
# SSOT: shared/bootstrap/references/toolkits-initial-setup/adapters/publish-better-toolkits-update.md
set -euo pipefail

DRY_RUN=0
DEPLOY=0
ONLY=""
ROOT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=1; shift ;;
    --deploy) DEPLOY=1; shift ;;
    --only) ONLYLY="${2:-}"; shift 2 ;;
    -h|--help) sed -n '2,14p' "$0"; exit 0 ;;
    *) echo "ERROR: unknown flag: $1 (see --help)" >&2; exit 64 ;;
  esac
done

if [[ -z "$ROOT" ]]; then
  ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
fi

MCP_OUT="$ROOT/apps/web/public/mcp"
# (name|source) pairs — SSOT uses the same sources as opencode.json.
MCP_SERVERS=(
  "notion-chimeranext|shared/mcp/notion-chimeranext"
  "posthog-chimeranext|shared/mcp/posthog-chimeranext"
  "google-workspace-apps|shared/google-workspace-apps"
  "social-media-ads-mcp|shared/mcp/social-media-ads-mcp"
  "stitch-chimeranext|shared/mcp/stitch-chimeranext"
)

publish_mcp() {
  [[ "$ONLY" == "" || "$ONLY" == "mcp" ]] || return 0
  mkdir -p "$MCP_OUT"
  for entry in "${MCP_SERVERS[@]}"; do
    name="${entry%%|*}"
    src="$ROOT/${entry#*|}"
    tarball="$MCP_OUT/${name}.tar.gz"
    if [[ ! -d "$src" ]]; then
      echo "[publish] WARN: source missing for ${name}: ${src}" >&2
      continue
    fi
    if [[ "$DRY_RUN" == "1" ]]; then
      echo "[publish] (dry-run) would create ${tarball} from ${src}"
      continue
    fi
    # Exclude node_modules; install runs `npm ci` at the destination. Emit the
    # direct content (no top-level <name>/ wrapper) so install-opencode.sh's
    # `tar -xzf ... -C $dest` lands package.json/server.js at $dest directly.
    tar -czf "$tarball" -C "$src" --exclude='node_modules' .
    echo "[publish] wrote ${tarball}"
  done
}

publish_marketplace() {
  [[ "$ONLY" == "" || "$ONLY" == "marketplace" ]] || return 0
  # Same gate as pre-push.
  if [[ "$DRY_RUN" == "1" ]]; then
    echo "[publish] (dry-run) marketplace check: python3 scripts/ci/marketplace_versioning.py check --range origin/main..HEAD"
    return 0
  fi
  ( cd "$ROOT" && python3 scripts/ci/marketplace_versioning.py write --range origin/main..HEAD )
}

publish_site() {
  [[ "$ONLY" == "" || "$ONLY" == "site" ]] || return 0
  if [[ "$DRY_RUN" == "1" ]]; then
    echo "[publish] (dry-run) site: would build apps/web + publish to GitHub Pages"
    return 0
  fi
  if [[ "$DEPLOY" == "1" ]]; then
    echo "[publish] deploying site (apps/web)..."
    ( cd "$ROOT/apps/web" && npm ci && npm run build )
  else
    echo "[publish] site build requires --deploy; use --deploy to publish."
  fi
}

publish_mcp
publish_marketplace
publish_site

echo "[publish] done."
