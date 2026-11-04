#!/usr/bin/env bash
# Claude Code PreToolUse(Bash) — Bilingual gate (CLI fallback) on issue creation.
#
# Primary path for Linear MCP is the dedicated PreToolUse hook
# (shared/hooks/bilingual/pre-linear-save-issue-bilingual.sh). This adapter
# covers the shell/CLI transports (gh issue, linear ... create). It is
# MANDATORY (no opt-in) and reads no .claude config. Blocking exit: 2;
# tooling failure: fail-open (0).
set -u

HOOKS_BILINGUAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DETECT="$HOOKS_BILINGUAL_DIR/detect.py"

if ! command -v python3; then
  echo "[claude-pre-bash.sh] WARN: python3 not found; Bilingual fail-open." >&2
  exit 0
fi

if [ ! -f "$DETECT" ]; then
  echo "[claude-pre-bash.sh] WARN: detect.py missing; Bilingual fail-open." >&2
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
cmd = cmd if isinstance(cmd,str) else ""
print(cmd)
')" || CMD=""

[ -z "$CMD" ] && exit 0

# Only issue-creation CLI transports (Linear primary-of-CLI; gh fallback)
case "$CMD" in
  *"gh issue create"*|*"gh issue edit"*|*"linear"*create*|*"linear"*edit*) ;;
  *) exit 0 ;;
esac

# Extract body
BODY=""
BODY_FILE=""
if printf '%s' "$CMD" | grep -qE -- '--body-file[ =]+[^ ]+'; then
  BODY_FILE=$(printf '%s' "$CMD" | sed -nE 's/.*--body-file[ =]+([^ ]+).*/\1/p')
elif printf '%s' "$CMD" | grep -qE -- '--body[ =]+.+'; then
  BODY=$(printf '%s' "$CMD" | sed -nE 's/.*--body[ =]+(.*)$/\1/p')
fi

if [ -n "$BODY_FILE" ]; then
  if [ -f "$BODY_FILE" ]; then
    if ! python3 "$DETECT" --body-file "$BODY_FILE"; then exit 2; fi
  else
    echo "[claude-pre-bash.sh] --body-file no existe: $BODY_FILE" >&2
    exit 2
  fi
elif [ -n "$BODY" ]; then
  if ! python3 "$DETECT" --body "$BODY"; then exit 2; fi
else
  echo "[claude-pre-bash.sh] comando de creación de issue sin body (se requiere brief Bilingual)." >&2
  exit 2
fi

exit 0
