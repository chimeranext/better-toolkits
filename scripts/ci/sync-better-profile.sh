#!/usr/bin/env bash
# sync-better-profile.sh — repo-canonical → user runtime profile sync (multi-harness).
#
# Canonical source of truth: <repo>/shared/bootstrap/agents/better.md
# Runtime destinations:
#   OpenCode: $HOME/.config/opencode/agents/better.md
#   Claude:   $HOME/.claude/agents/better.md
#   Cursor:   $HOME/.cursor/agents/better.md
#
# Each destination is generated from the canonical profile with a per-harness
# frontmatter conversion (scripts/ci/sync-better-profile-generate.py).
#
# Modes:
#   (default)  sync  — sync all destinations (idempotent)
#   --check    check — exit 1 if any destination differs from canonical (drift)
#   --quiet           — suppress output
#   --harness <h>    — restrict to opencode|claude|cursor (default: all)
#
# The check is machine-local: if a destination path does not exist, that harness
# is skipped (nothing to compare) so CI/other machines never fail on a missing
# user config. Never discard stderr; no redirections to null.

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SRC="$ROOT/shared/bootstrap/agents/better.md"
GENERATE="$SCRIPT_DIR/sync-better-profile-generate.py"

MODE="sync"
QUIET=0
HARNESSES=(opencode claude cursor)

for arg in "$@"; do
  case "$arg" in
    --check) MODE="check" ;;
    --quiet) QUIET=1 ;;
    --harness=*) HARNESSES=("${arg#--harness=}") ;;
    opencode|claude|cursor) HARNESSES=("$arg") ;;
  esac
done

say() { [ "$QUIET" -eq 0 ] && echo "$1"; }

if [ ! -f "$SRC" ]; then
  echo "[better-profile] ERROR: canonical profile missing: $SRC" >&2
  exit 1
fi
if [ ! -f "$GENERATE" ]; then
  echo "[better-profile] ERROR: generator missing: $GENERATE" >&2
  exit 1
fi

declare -A DST
DST[opencode]="${HOME}/.config/opencode/agents/better.md"
DST[claude]="${HOME}/.claude/agents/better.md"
DST[cursor]="${HOME}/.cursor/agents/better.md"

TMPDIR_PROF="$(mktemp -d)"
trap 'rm -rf "$TMPDIR_PROF"' EXIT

FAIL=0
for h in "${HARNESSES[@]}"; do
  out="$TMPDIR_PROF/better-$h.md"
  if ! python3 "$GENERATE" --harness "$h" --src "$SRC" --out "$out" > "$TMPDIR_PROF/generate-$h.log" 2>&1; then
    echo "[better-profile] ERROR: generate failed for $h (see $TMPDIR_PROF/generate-$h.log)" >&2
    FAIL=1
    continue
  fi
  dst="${DST[$h]:-}"
  if [ -z "$dst" ]; then
    echo "[better-profile] ERROR: unknown harness $h" >&2
    FAIL=1
    continue
  fi
  # No destination → nothing to compare/sync (skip, never fail).
  if [ ! -f "$dst" ]; then
    if [ "$MODE" = "check" ]; then
      say "[better-profile] check: $h destination absent ($dst) — skip"
      continue
    fi
    mkdir -p "$(dirname "$dst")"
  fi
  if [ "$MODE" = "check" ]; then
    if ! cmp -s "$out" "$dst"; then
      echo "[better-profile] DRIFT ($h): run 'bash scripts/ci/sync-better-profile.sh' to sync" >&2
      FAIL=1
    else
      say "[better-profile] check: $h in sync"
    fi
  else
    cp "$out" "$dst"
    say "[better-profile] synced: $dst"
  fi
done

[ "$FAIL" -eq 0 ] || exit 1
exit 0
