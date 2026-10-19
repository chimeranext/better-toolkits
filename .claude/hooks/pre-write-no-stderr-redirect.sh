#!/usr/bin/env bash
# PreToolUse hook (Write|Edit) — blocks writes that discard stderr to /dev/null.
#
# Doctrine: stderr hooks (shared/hooks/stderr) forbid `2>/dev/null`, `&>/dev/null`,
# `2>>/dev/null`, `>&/dev/null` in agent shell commands. The same rule applies
# to code/scripts written by the agent: silencing stderr hides failures.
#
# Exit 2 = block (stderr is shown to the model). Exit 0 = allow.
set -euo pipefail

INPUT="$(cat)"
FILE_PATH="$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty' || true)"
[ -z "$FILE_PATH" ] && exit 0

# Extract the proposed content (Write.content / Edit.new_string / MultiEdit.edits).
CONTENT="$(printf '%s' "$INPUT" | jq -r '
  (.tool_input.content // "") +
  (.tool_input.new_string // "") +
  ([.tool_input.edits[]?.new_string // empty] | join("\n"))
' || true)"
[ -z "$CONTENT" ] && exit 0

REPO_ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
REL="${FILE_PATH#"$REPO_ROOT"/}"

# Exempt documentation, tests, and the detector itself (they reference the
# forbidden patterns on purpose).
case "$REL" in
  *.md) exit 0 ;;
  *hooks/stderr/*) exit 0 ;;
  *test-detect.sh) exit 0 ;;
  *test-*.sh) exit 0 ;;
  *.test.*) exit 0 ;;
  *tests/*) exit 0 ;;
esac

# Forbidden stderr-redirection patterns (literal, no log file).
PATTERN='2[[:space:]]*>>?[[:space:]]*/dev/null|&>[[:space:]]*/dev/null|>&[[:space:]]*/dev/null'

if printf '%s\n' "$CONTENT" | grep -qE "$PATTERN"; then
  echo "BLOCKED by stderr doctrine: proposed write to '$REL' discards stderr to /dev/null." >&2
  echo "Forbidden patterns:, 2> /dev/null, 2>>/dev/null, &>/dev/null, >&/dev/null." >&2
  echo "Redirect stderr to a log file instead (e.g. 2>>\"\$ERR_LOG\"), or let it flow." >&2
  echo "See shared/hooks/stderr/README.md and docs/hitl.md." >&2
  exit 2
fi

exit 0