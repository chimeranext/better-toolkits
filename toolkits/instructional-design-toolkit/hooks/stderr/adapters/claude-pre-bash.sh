#!/usr/bin/env bash
# Claude Code PreToolUse(Bash) — preserve stderr (on by default, opt-out).
# Blocking exit: 2. Tooling failure: fail-open (0).
# No output is discarded: binaries are captured into variables, never sent to null.
set -u

HOOKS_STDERR_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DETECT="$HOOKS_STDERR_DIR/detect.py"
PLUGIN_HOOKS_DIR="$(cd "$HOOKS_STDERR_DIR/.." && pwd)"

# Global kill switches
if [ "${CLAUDE_DISABLE_PLUGIN_HOOKS:-0}" = "1" ] || [ "${MNM_DISABLE_STDERR_HOOK:-0}" = "1" ]; then
  exit 0
fi

# Per-repo opt-out: .claude/config/stderr-hooks.json → {"preserve_stderr": false}
REPO_ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
CFG="$REPO_ROOT/.claude/config/stderr-hooks.json"
JQ_BIN="$(command -v jq)"
if [ -r "$CFG" ] && [ -n "$JQ_BIN" ]; then
  ENABLED="$("$JQ_BIN" -r '.preserve_stderr // true' "$CFG")" || ENABLED="true"
  if [ "$ENABLED" = "false" ]; then
    exit 0
  fi
fi

PYBIN="$(command -v python3)"
if [ -z "$PYBIN" ]; then
  echo "[claude-pre-bash.sh] WARN: python3 not found; failing open." >&2
  exit 0
fi

if [ ! -f "$DETECT" ]; then
  echo "[claude-pre-bash.sh] WARN: detect.py missing; failing open." >&2
  exit 0
fi

INPUT_RAW="$(cat)"

# Accept Claude tool_input.command or Cursor-style {command}
CMD="$(printf '%s' "$INPUT_RAW" | "$PYBIN" -c '
import json,sys
raw=sys.stdin.read()
try:
  d=json.loads(raw)
except Exception:
  print(""); raise SystemExit(0)
cmd = d.get("tool_input",{}).get("command") if isinstance(d.get("tool_input"), dict) else None
if cmd is None:
  cmd = d.get("command") or ""
print(cmd if isinstance(cmd,str) else "")
')" || CMD=""

[ -z "$CMD" ] && exit 0

if ! "$PYBIN" "$DETECT" --command "$CMD"; then
  exit 2
fi
exit 0
