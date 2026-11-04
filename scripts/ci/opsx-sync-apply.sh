#!/usr/bin/env bash
# opsx-sync-apply.sh — apply delta specs into main specs (shared engine).
#
# Used by BOTH /opsx-sync and /sweep-unstaged (mandatory when drift detected).
# Applies the delta of ONE change (--change <slug>, or the active change in the
# worktree) into openspec/specs/ by delegating to the OpenSpec CLI
# (`openspec archive`) instead of hand-copying deltas.
#
# Why the CLI (regression fix):
#   The previous implementation copied the raw delta verbatim onto the main
#   spec, which leaked the `# Spec Delta` header (and `## ADDED Requirements`
#   operation sections) into openspec/specs/**/spec.md. `openspec archive`
#   normalizes those: `# Spec Delta` → `# <domain> Specification`,
#   `## ADDED Requirements` → `## Requirements`, and reports
#   added/modified/removed/renamed totals.
#
# Anti-delta recurrence-guard:
#   A main spec must never itself be a raw delta. `guard_anti_delta` runs as a
#   pre-condition and fails (exit 1) with a stderr diagnostic if a main spec
#   already carries the `# Spec Delta` header, so drift cannot silently persist.
#
# BDD (dado/cuando/entonces):
#   - Given un change cuyo delta usa `# Spec Delta` / When el engine corre /
#     Then el main spec queda normalizado (`# <domain> Specification`, sin
#     header delta) y el delta nunca se copia crudo — `openspec archive` lo
#     normaliza.
#   - Given un main spec que ya es `# Spec Delta` / When el engine valida /
#     Then lo detecta y reporta (exit 1), no lo deja pasar.
#
# Rules (per OpenSpec OPSX delta-spec merge):
#   - main spec missing        → CLI creates it (ADD)
#   - main spec exists, drift  → CLI replaces/merges main content (UPDATE)
#   - `## REMOVED` section     → CLI strips that block from the main spec
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

# ---------------------------------------------------------------------------
# guard_anti_delta <file> — anti-delta recurrence-guard.
# Returns 1 if the file still carries the raw `# Spec Delta` header. Applied to
# main spec DESTINATIONS: a main spec must never be a raw delta. Source deltas
# MAY keep the header; `openspec archive` normalizes them instead of copying
# them verbatim.
# ---------------------------------------------------------------------------
guard_anti_delta() {
  local f="$1"
  [ -f "$f" ] || return 0
  if head -n 40 "$f" | grep -qE '^# Spec Delta[[:space:]]*$'; then
    echo "opsx-sync-apply: anti-delta guard: '$f' is a raw '# Spec Delta' spec" >&2
    return 1
  fi
  return 0
}

# Apply ONE change via the OpenSpec CLI. Never falls back to a raw copy: the
# CLI is the only writer of main specs.
apply_change() {
  local change_dir="$1"
  local change_slug delta rel domain_rel main_spec out

  change_slug="$(basename "$change_dir")"

  # Pre-condition (recurrence-guard): none of this change's main-spec
  # destinations may already be a raw `# Spec Delta` spec. If one is, fail
  # loudly (exit 1) instead of letting the drift pass.
  while IFS= read -r delta; do
    [ -f "$delta" ] || continue
    rel="${delta#"$change_dir/"}"          # specs/<domain>/spec.md
    domain_rel="${rel#specs/}"             # <domain>/spec.md
    main_spec="$SPECS_DIR/$domain_rel"
    if ! guard_anti_delta "$main_spec"; then
      FAIL=1
      return
    fi
  done < <(find "$change_dir" -type f -path "*/specs/*/spec.md" | sort)

  # Delegate to the CLI. Capture stdout+stderr into a sink FILE (StS); never
  # redirect to null, never leave a bare `2>&1` without a sink. Any CLI
  # failure → fail loudly, never silently.
  out="$(mktemp)"
  if (cd "$REPO_ROOT" && openspec archive "$change_slug" --yes --json) > "$out" 2>&1; then
    if grep -q '"specsUpdated": true' "$out"; then
      APPLIED=$((APPLIED + 1))
      echo "SYNCED $change_slug"
    else
      echo "FAIL archive $change_slug: specs not updated" >&2
      cat "$out" >&2
      FAIL=1
    fi
  else
    echo "FAIL archive $change_slug" >&2
    cat "$out" >&2
    FAIL=1
  fi
  rm -f "$out"
}

while IFS= read -r change_dir; do
  [ -d "$change_dir" ] || continue
  apply_change "$change_dir"
done <<< "$CHANGE_DIRS"

if [ "$FAIL" -ne 0 ]; then
  echo "opsx-sync-apply: FAILURES — partial apply." >&2
  exit 1
fi
echo "opsx-sync-apply: applied=$APPLIED"
exit 0
