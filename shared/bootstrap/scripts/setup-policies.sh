#!/usr/bin/env bash
# setup-policies.sh — install policy enforcement into a consumer monorepo.
#
# Copies the machine-readable policy + apply-policies.sh + the consumer workflow
# into a target repo so that repository_dispatch(policies-updated) is honored.
#
# Usage:
#   setup-policies.sh [--target /path/to/consumer-repo] [--dry-run]
#
# Default target: current directory. Idempotent.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
SRC_POLICIES="$ROOT/shared/references/policies"
DRY_RUN=0
TARGET="${PWD}"

while [ $# -gt 0 ]; do
  case "$1" in
    --target) TARGET="$2"; shift 2 ;;
    --dry-run) DRY_RUN=1; shift ;;
    *) echo "usage: $0 [--target <dir>] [--dry-run]" >&2; exit 2 ;;
  esac
done

mkdir -p "$TARGET/.github/workflows"

# 1. Policy + helpers
if [ "$DRY_RUN" = "1" ]; then
  echo "[setup] (dry-run) copiaría:"
  echo "  policies.yml -> $TARGET/shared/references/policies/policies.yml"
  echo "  apply-policies.sh -> $TARGET/shared/references/policies/apply-policies.sh"
else
  mkdir -p "$TARGET/shared/references/policies"
  cp "$SRC_POLICIES/policies.yml" "$TARGET/shared/references/policies/policies.yml"
  cp "$SRC_POLICIES/apply-policies.sh" "$TARGET/shared/references/policies/apply-policies.sh"
  chmod +x "$TARGET/shared/references/policies/apply-policies.sh"
  echo "[setup] policies instaladas en $TARGET"
fi

# 2. Consumer workflow (apply-policies.yml)
APPLY_WORKFLOW="$TARGET/.github/workflows/apply-policies.yml"
if [ "$DRY_RUN" = "1" ]; then
  echo "  apply-policies.yml -> $APPLY_WORKFLOW"
else
  cat > "$APPLY_WORKFLOW" <<'EOF'
name: apply-policies

on:
  repository_dispatch:
    types: [policies-updated]

jobs:
  apply:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Apply policies
        run: bash shared/references/policies/apply-policies.sh
        env:
          GH_TOKEN: ${{ secrets.GH_APP_INSTALLATION_TOKEN }}
EOF
  echo "[setup] workflow consumer instalado: $APPLY_WORKFLOW"
fi

echo "[setup] done"
