#!/usr/bin/env bash
# Cursor beforeShellExecution adapter — JSON permission deny/allow on stdin/stdout.
# Block squash merges (gh pr merge --squash / git merge --squash).
set -u

HOOKS_NO_SQUASH_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DETECT="$HOOKS_NO_SQUASH_DIR/detect.py"
PLUGIN_HOOKS_DIR="$(cd "$HOOKS_NO_SQUASH_DIR/.." && pwd)"

if [ "${MNM_DISABLE_NO_SQUASH_HOOK:-0}" = "1" ]; then
  printf '%s\n' '{"permission":"allow"}'
  exit 0
fi

input="$(cat)"

PYBIN="$(command -v python3)"
if [ -z "$PYBIN" ]; then
  printf '%s\n' '{"permission":"allow"}'
  exit 0
fi

# Opt-out config (best-effort from cwd)
CFG="$(pwd)/.claude/config/no-squash-hooks.json"
if [ -r "$CFG" ]; then
  if "$PYBIN" -c 'import json,sys; d=json.load(open(sys.argv[1])); sys.exit(0 if d.get("enforce_no_squash",True) is False else 1)' "$CFG"; then
    printf '%s\n' '{"permission":"allow"}'
    exit 0
  fi
fi

command="$(printf '%s' "$input" | "$PYBIN" -c 'import json,sys
try:
  d=json.loads(sys.stdin.read())
except Exception:
  print(""); raise SystemExit(0)
print((d.get("command") or "") if isinstance(d.get("command"),str) else "")')" || command=""

if [ -n "$command" ] && printf '%s' "$command" | grep -qE '(git|gh)[[:space:]]+[^|&;]*merge'; then
  if ! MNM_GIT_COMMAND="$command" bash "$PLUGIN_HOOKS_DIR/git/pre-push.sh" "${command##* }"; then
    printf '%s\n' '{"permission":"deny","user_message":"BLOCKED: squash merges are forbidden (use --merge/--rebase).","agent_message":"BLOCKED: squash merges are forbidden (use --merge/--rebase)."}'
    exit 0
  fi
fi

"$PYBIN" - "$DETECT" "$input" <<'PY'
import json, subprocess, sys

detect, raw = sys.argv[1], sys.argv[2]
try:
    data = json.loads(raw)
except json.JSONDecodeError:
    print(json.dumps({"permission": "allow"}))
    raise SystemExit(0)

command = data.get("command") or ""
if not isinstance(command, str) or not command.strip():
    print(json.dumps({"permission": "allow"}))
    raise SystemExit(0)

proc = subprocess.run(
    [sys.executable, detect, "--command", command],
    capture_output=True,
    text=True,
)

if proc.returncode == 0:
    print(json.dumps({"permission": "allow"}))
    raise SystemExit(0)

msg = (proc.stderr or proc.stdout or "Blocked: squash merges are forbidden").strip()
print(json.dumps({
    "permission": "deny",
    "user_message": msg,
    "agent_message": msg,
}))
PY
