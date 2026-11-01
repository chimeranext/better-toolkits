#!/usr/bin/env bash
# opsx-sync-apply.sh — apply delta specs into main specs (shared engine).
#
# Used by BOTH /opsx-sync and /sweep-unstaged (mandatory when drift detected).
# Applies the delta of ONE change (--change <slug>, or the active change in the
# worktree) into openspec/specs/ WITHOUT archiving (change stays active).
#
# Rules (per OpenSpec OPSX delta-spec merge):
#   - main spec missing        → copy delta → main (ADD)
#   - main spec exists, drift  → replace main content with delta (UPDATE)
#   - `## REMOVED` section     → strip that block from the main spec
#
# Exit: 0 ok; 1 failure or ambiguous (multiple changes → HITL required).
# Never discards stderr; no redirections to null.

set -u

ROOT_DIR=""
CHANGE=""
while [ "$#" -gt 0 ]; do
  case "$1" in
    --change=*) CHANGE="${1#--change=}" ;;
    --change) shift; if [ "$#" -ge 1 ]; then CHANGE="$1"; fi ;;
    --root=*) ROOT_DIR="${1#--root=}" ;;
    --root) shift; if [ "$#" -ge 1 ]; then ROOT_DIR="$1"; fi ;;
    *) if [ -z "$CHANGE" ]; then CHANGE="$1"; else echo "opsx-sync-apply: unexpected argument: $1" >&2; exit 1; fi ;;
  esac
  shift
done

if [ -n "$ROOT_DIR" ]; then
  REPO_ROOT="$ROOT_DIR"
else
  REPO_ROOT="$(git rev-parse --show-toplevel)"
fi
CHANGES_DIR="$REPO_ROOT/openspec/changes"
SPECS_DIR="$REPO_ROOT/openspec/specs"

if [ ! -d "$CHANGES_DIR" ] || [ ! -d "$SPECS_DIR" ]; then
  echo "opsx-sync-apply: repo has no openspec/changes or openspec/specs (skip)" >&2
  exit 0
fi

# Resolve the change dir.
# With --change <slug> → only that change. Without → iterate ALL active changes
# (every change under openspec/changes/ that has a specs/ dir). The sweep runs
# this before /goodnight or /exit, so absolutely nothing may be left unsynced.
if [ -n "$CHANGE" ]; then
  CHANGE_DIR="$CHANGES_DIR/$CHANGE"
  if [ ! -d "$CHANGE_DIR" ]; then
    echo "opsx-sync-apply: unknown change: $CHANGE" >&2
    exit 1
  fi
  CHANGE_DIRS="$CHANGE_DIR"
else
  CHANGE_DIRS="$(find "$CHANGES_DIR" -type d -path "*/specs" | sed 's#/specs$##' | sort -u)"
fi

FAIL=0
APPLIED=0

apply_delta() {
  local delta="$1"
  local change_dir="$2"
  local rel="${delta#"$change_dir/"}"          # specs/<domain>/spec.md
  local domain_rel="${rel#specs/}"             # <domain>/spec.md
  local main_spec="$SPECS_DIR/$domain_rel"
  local tmp

  [ -f "$delta" ] || return

  tmp="$(mktemp)"

  if [ ! -f "$main_spec" ]; then
    mkdir -p "$(dirname "$main_spec")"
    if cp "$delta" "$tmp"; then
      sed -i '/^## REMOVED$/,$d' "$tmp"
      if cp "$tmp" "$main_spec"; then
        APPLIED=$((APPLIED + 1))
        echo "ADD    $domain_rel"
      else
        echo "FAIL   ADD $domain_rel" >&2
        FAIL=1
      fi
    else
      echo "FAIL   read delta $delta" >&2
      FAIL=1
    fi
  elif ! cmp -s "$delta" "$main_spec"; then
    if cp "$delta" "$tmp"; then
      sed -i '/^## REMOVED$/,$d' "$tmp"
      if cp "$tmp" "$main_spec"; then
        APPLIED=$((APPLIED + 1))
        echo "UPDATE $domain_rel"
      else
        echo "FAIL   UPDATE $domain_rel" >&2
        FAIL=1
      fi
    else
      echo "FAIL   read delta $delta" >&2
      FAIL=1
    fi
  fi
  rm -f "$tmp"
}

while IFS= read -r change_dir; do
  [ -d "$change_dir" ] || continue
  while IFS= read -r delta; do
    apply_delta "$delta" "$change_dir"
  done < <(find "$change_dir" -type f -path "*/specs/*/spec.md" | sort)
done <<< "$CHANGE_DIRS"

if [ "$FAIL" -ne 0 ]; then
  echo "opsx-sync-apply: FAILURES — partial apply." >&2
  exit 1
fi
echo "opsx-sync-apply: applied=$APPLIED"
exit 0
