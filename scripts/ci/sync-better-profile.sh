#!/usr/bin/env bash
# sync-better-profile.sh — repo-canonical → user runtime profile sync.
#
# Canonical source of truth: <repo>/shared/bootstrap/agents/better.md
# Runtime destination: $HOME/.config/opencode/agents/better.md
#
# Modes:
#   (default)  sync  — copy canonical → destination (idempotent)
#   --check    check — exit 1 if destination differs from canonical (drift)
#   --quiet           — suppress output
#
# The check is machine-local: if the destination path does not exist, the hook
# exits 0 (nothing to compare) so CI/other machines never fail on a missing user
# config. Never discard stderr; no redirections to null.

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SRC="$ROOT/shared/bootstrap/agents/better.md"
DST="${HOME}/.config/opencode/agents/better.md"

MODE="sync"
QUIET=0
for arg in "$@"; do
  case "$arg" in
    --check) MODE="check" ;;
    --quiet) QUIET=1 ;;
  esac
done

say() { [ "$QUIET" -eq 0 ] && echo "$1"; }

if [ ! -f "$SRC" ]; then
  echo "[better-profile] ERROR: canonical profile missing: $SRC" >&2
  exit 1
fi

# No destination → nothing to compare/sync (skip, never fail).

if [ ! -f "$DST" ]; then
  if [ "$MODE" = "check" ]; then
    say "[better-profile] check: destination absent ($DST) — skip"
    exit 0
  fi
  mkdir -p "$(dirname "$DST")"
fi

if [ "$MODE" = "check" ]; then
  if ! cmp -s "$SRC" "$DST"; then
    echo "[better-profile] DRIFT: run 'bash scripts/ci/sync-better-profile.sh' to sync" >&2
    exit 1
  fi
  say "[better-profile] check: in sync"
  exit 0
fi

cp "$SRC" "$DST"
say "[better-profile] synced: $DST"
exit 0
