#!/usr/bin/env bash
# Claude Code PreToolUse(Bash) — PRDS gate on git push / gh pr create|edit.
# Blocking exit: 2. Tooling failure: fail-open (0).
set -u

HOOKS_PRDS_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DETECT="$HOOKS_PRDS_DIR/detect.py"

if [ "${CLAUDE_DISABLE_PLUGIN_HOOKS:-0}" = "1" ] || [ "${FCTO_DISABLE_PRDS_HOOK:-0}" = "1" ]; then
  exit 0
fi

REPO_ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
CFG="$REPO_ROOT/.claude/config/prds-hooks.json"
if [ -r "$CFG" ] && command -v jq >/dev/null 2>&1; then
  ENABLED="$(jq -r '.enforce_prds // true' "$CFG" 2>/dev/null)" || ENABLED="true"
  if [ "$ENABLED" = "false" ]; then
    exit 0
  fi
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "[claude-pre-bash.sh] WARN: python3 not found; PRDS failing open." >&2
  exit 0
fi

if [ ! -f "$DETECT" ]; then
  echo "[claude-pre-bash.sh] WARN: detect.py missing; PRDS failing open." >&2
  exit 0
fi

INPUT_RAW="$(cat)"

CMD="$(printf '%s' "$INPUT_RAW" | python3 -c '
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

if ! python3 "$DETECT" --command "$CMD" --cwd "$REPO_ROOT"; then
  exit 2
fi
exit 0
