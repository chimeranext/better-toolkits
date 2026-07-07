#!/usr/bin/env bash
# PreToolUse hook (Write|Edit) — enforces openspec/project.md governance:
#  1. Spec/ADR-shaped files must live inside openspec/changes/.
#  2. Writes under apps/ require an active (non-archived) openspec change.
# Exit 2 = block (stderr is shown to the model). Exit 0 = allow.
set -euo pipefail

INPUT="$(cat)"
FILE_PATH="$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null || true)"
[ -z "$FILE_PATH" ] && exit 0

REPO_ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
REL="${FILE_PATH#"$REPO_ROOT"/}"

# Rule 1: spec/ADR/proposal/design docs only inside openspec/changes/
BASE="$(basename "$REL")"
if printf '%s' "$BASE" | grep -qiE '(-spec\.md|-adr\.md|^proposal\.md$|^design\.md$)'; then
  case "$REL" in
    openspec/changes/*) : ;;
    *)
      echo "BLOCKED by openspec governance: '$REL' looks like a spec/ADR/design record." >&2
      echo "Decision records live in openspec/changes/<YYYY-MM-DD>-<slug>/ — see openspec/project.md." >&2
      exit 2
      ;;
  esac
fi

# Rule 2: engineering writes under apps/ require an active change
case "$REL" in
  apps/*)
    ACTIVE="$(find "$REPO_ROOT/openspec/changes" -mindepth 1 -maxdepth 1 -type d ! -name archive 2>/dev/null | head -1 || true)"
    if [ -z "$ACTIVE" ]; then
      echo "BLOCKED by openspec governance: writing under apps/ requires an active change in openspec/changes/." >&2
      echo "Create openspec/changes/<YYYY-MM-DD>-<slug>/{proposal,design,tasks}.md first — see openspec/project.md." >&2
      exit 2
    fi
    ;;
esac

exit 0
