#!/usr/bin/env bash
# Claude Code PreToolUse(Bash) — block squash merges.
# Blocking exit: 2. Tooling failure: fail-open (0).
set -u

HOOKS_NO_SQUASH_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DETECT="$HOOKS_NO_SQUASH_DIR/detect.py"
PLUGIN_HOOKS_DIR="$(cd "$HOOKS_NO_SQUASH_DIR/.." && pwd)"

# Global kill switches (same family as stderr hooks)
if [ "${CLAUDE_DISABLE_PLUGIN_HOOKS:-0}" = "1" ] || [ "${MNM_DISABLE_NO_SQUASH_HOOK:-0}" = "1" ]; then
  exit 0
fi

# Per-repo opt-out: .claude/config/no-squash-hooks.json
# -> {"enforce_no_squash": false}
REPO_ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
CFG="$REPO_ROOT/.claude/config/no-squash-hooks.json"
if [ -r "$CFG" ] && command -v jq >/dev/null; then
  ENABLED="$(jq -r '.enforce_no_squash // true' "$CFG")" || ENABLED="true"
  if [ "$ENABLED" = "false" ]; then
    exit 0
  fi
fi

if ! command -v python3 >/dev/null; then
  exit 0
fi
if [ ! -f "$DETECT" ]; then
  exit 0
fi

INPUT_RAW="$(cat)"

# Accept Claude tool_input.command or Cursor-style {command}
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

# Git-strict guard: pass the raw command to the pre-push no-squash gate so the
# git hook (the last line of defense) can block squash even if detect.py is
# bypassed. This sets MNM_GIT_COMMAND for the pre-push gate.
if printf '%s' "$CMD" | grep -qE '(git|gh)[[:space:]]+[^|&;]*merge'; then
  MNM_GIT_COMMAND="$CMD" bash "$PLUGIN_HOOKS_DIR/git/pre-push.sh" "${CMD##* }" || exit 2
fi

if ! python3 "$DETECT" --command "$CMD"; then
  echo "[no-squash] BLOCKED: squash merges are forbidden (use --merge/--rebase)." >&2
  exit 2
fi
exit 0
