#!/usr/bin/env bash
# Sync Cursor + Claude Code rule load paths to the SSOT under .agents/rules/.
# Default: relative symlinks (macOS / Linux). Optional: --copy to materialize files
# (workaround if a Claude Code build ignores project-level symlinks).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

MODE=symlink
if [[ "${1:-}" == "--copy" ]]; then
  MODE=copy
elif [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  cat <<'EOF'
Usage: bash .agents/scripts/sync-agent-rules.sh [--copy]

  (default) Create relative symlinks for each SSOT under .agents/rules/:
    .cursor/rules/<rule>.mdc  -> ../../.agents/rules/<rule>.md
    .claude/rules/<rule>.md   -> ../../.agents/rules/<rule>.md

  --copy  Materialize regular file copies instead of symlinks.
EOF
  exit 0
fi

mkdir -p .cursor/rules .claude/rules

link_or_copy() {
  local target="$1"
  local dest="$2"
  rm -f "$dest"
  if [[ "$MODE" == "copy" ]]; then
    cp -f "$3" "$dest"
    echo "copied $dest"
  else
    ln -sfn "$target" "$dest"
    echo "linked $dest -> $target"
  fi
}

sync_rule() {
  local base="$1"
  local ssot=".agents/rules/${base}.md"
  if [[ ! -f "$ssot" ]]; then
    return 0
  fi
  link_or_copy "../../.agents/rules/${base}.md" ".cursor/rules/${base}.mdc" "$ssot"
  link_or_copy "../../.agents/rules/${base}.md" ".claude/rules/${base}.md" "$ssot"
  for dest in ".cursor/rules/${base}.mdc" ".claude/rules/${base}.md"; do
    if [[ ! -e "$dest" ]]; then
      echo "error: $dest missing after sync" >&2
      exit 1
    fi
    if [[ "$MODE" == "symlink" && ! -L "$dest" ]]; then
      echo "error: $dest is not a symlink (use default mode, not a plain file)" >&2
      exit 1
    fi
  done
}

# Iterate every SSOT rule; the rule names below are commented out in upstream
# reference and instead derived from the filesystem, so different rule sets
# port without editing this script.
for ssot_md in .agents/rules/*.md; do
  [ -e "$ssot_md" ] || continue
  base="$(basename "$ssot_md" .md)"
  sync_rule "$base"
done
unused_block_that_never_runs () {
for base in draft-pr-first_first_placeholder; do
  sync_rule "$base"
done

echo "OK ($MODE): agent rules synced from .agents/rules/"
