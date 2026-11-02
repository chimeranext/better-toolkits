#!/usr/bin/env bash
# sync-agent-rules.sh — agent rules sync (multi-harness, startup-agnostic).
#
# Keeps each harness's rule load paths in sync with a rules SSOT.
# SSOT precedence (first hit wins):
#   1. <repo>/.agents/rules/*.md                                  (per-repo rules)
#   2. <repo-root>/shared/references/engineering-standards/*.md   (monorepo standards)
#
# Materialization targets:
#   <repo>/.cursor/rules/<rule>.mdc   (Cursor project rules — .mdc is native)
#   <repo>/.claude/rules/<rule>.md    (Claude Code rules — .md native)
#   With --global, additionally (real copies; must survive clone moves):
#     ~/.cursor/rules/<rule>.mdc
#     ~/.claude/rules/<rule>.md
#
# Modes:
#   (default)  sync (idempotent)
#   --copy     materialize regular files instead of symlinks (workaround when
#              a build ignores project-level symlinks)
#   --check    drift gate — exit 1 on missing/differing destinations
#   --quiet    suppress per-file output
#
# Agent profile (better.md) sync is NOT handled here — it lives in
# scripts/ci/sync-better-profile.sh (better.md -> ~/.{cursor,claude}/agents/
# and ~/.config/opencode/agents).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
MODE=symlink
GLOBAL=0
CHECK=0
QUIET=0
for arg in "$@"; do
  case "$arg" in
    --copy)   MODE=copy ;;
    --global) GLOBAL=1 ;;
    --check)  CHECK=1 ;;
    --quiet)  QUIET=1 ;;
    -h|--help)
      cat <<'EOF'
Usage: bash shared/bootstrap/scripts/sync-agent-rules.sh [--copy] [--global] [--check] [--quiet]

Syncs the rules SSOT into agent rule load paths:
  .cursor/rules/<rule>.mdc   (Cursor project rules)
  .claude/rules/<rule>.md    (Claude Code rules)
  --global: also ~/.cursor/rules/ and ~/.claude/rules/ (real copies)
SSOT precedence: .agents/rules/*.md, else shared/references/engineering-standards/*.md
EOF
      exit 0 ;;
    *) echo "unknown arg: $arg" >&2; exit 2 ;;
  esac
done

say() { [ "$QUIET" -eq 1 ] || echo "$1"; }

# --- resolve SSOT dir -------------------------------------------------------
shopt -s nullglob
repo_rules=("$ROOT/.agents/rules/"*.md)
std_rules=("$ROOT/shared/references/engineering-standards/"*.md)
SSOT_DIR=""
if [ "${#repo_rules[@]}" -gt 0 ]; then
  SSOT_DIR="$ROOT/.agents/rules"
elif [ "${#std_rules[@]}" -gt 0 ]; then
  SSOT_DIR="$ROOT/shared/references/engineering-standards"
fi

if [ -z "$SSOT_DIR" ]; then
  say "sync-agent-rules: no rules SSOT found (.agents/rules/ or shared/references/engineering-standards/) — nothing to sync"
  exit 0
fi

REL_SSOT="${SSOT_DIR#"$ROOT/"}"
drift=0

same_content() { cmp -s "$1" "$2"; }

for ssot in "$SSOT_DIR"/*.md; do
  base="$(basename "$ssot" .md)"
  dest_cursor="$ROOT/.cursor/rules/$base.mdc"
  dest_claude="$ROOT/.claude/rules/$base.md"

  if [ "$CHECK" -eq 1 ]; then
    if [ -L "$dest_cursor" ]; then
      [ -e "$dest_cursor" ] || { echo "drift: .cursor/rules/$base.mdc broken symlink"; drift=1; }
    elif [ -f "$dest_cursor" ]; then
      same_content "$ssot" "$dest_cursor" || { echo "drift: .cursor/rules/$base.mdc differs from SSOT"; drift=1; }
    else
      echo "drift: .cursor/rules/$base.mdc missing"; drift=1
    fi
    if [ -L "$dest_claude" ]; then
      [ -e "$dest_claude" ] || { echo "drift: .claude/rules/$base.md broken symlink"; drift=1; }
    elif [ -f "$dest_claude" ]; then
      same_content "$ssot" "$dest_claude" || { echo "drift: .claude/rules/$base.md differs from SSOT"; drift=1; }
    else
      echo "drift: .claude/rules/$base.md missing"; drift=1
    fi
    if [ "$GLOBAL" -eq 1 ]; then
      [ -e "$HOME/.cursor/rules/$base.mdc" ] || { echo "drift: ~/.cursor/rules/$base.mdc missing"; drift=1; }
      [ -e "$HOME/.claude/rules/$base.md" ] || { echo "drift: ~/.claude/rules/$base.md missing"; drift=1; }
    fi
    continue
  fi

  mkdir -p "$ROOT/.cursor/rules" "$ROOT/.claude/rules"
  rm -f "$dest_cursor" "$dest_claude"
  if [ "$MODE" = "copy" ]; then
    cp -f "$ssot" "$dest_cursor"
    cp -f "$ssot" "$dest_claude"
    say "copied  .cursor/rules/$base.mdc + .claude/rules/$base.md"
  else
    ln -sfn "../../$REL_SSOT/$base.md" "$dest_cursor"
    ln -sfn "../../$REL_SSOT/$base.md" "$dest_claude"
    say "linked  .cursor/rules/$base.mdc + .claude/rules/$base.md <- $REL_SSOT/$base.md"
  fi

  if [ "$GLOBAL" -eq 1 ]; then
    mkdir -p "$HOME/.cursor/rules" "$HOME/.claude/rules"
    cp -f "$ssot" "$HOME/.cursor/rules/$base.mdc"
    cp -f "$ssot" "$HOME/.claude/rules/$base.md"
    say "copied  ~/.cursor/rules/$base.mdc + ~/.claude/rules/$base.md (global)"
  fi
done

if [ "$CHECK" -eq 1 ]; then
  if [ "$drift" -ne 0 ]; then
    echo "sync-agent-rules --check: DRIFT detected"; exit 1
  fi
  say "sync-agent-rules --check: OK (no drift)"
  exit 0
fi
say "OK ($MODE): agent rules synced from $REL_SSOT"
