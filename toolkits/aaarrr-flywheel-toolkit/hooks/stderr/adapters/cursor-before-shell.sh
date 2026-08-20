#!/usr/bin/env bash
# Cursor beforeShellExecution adapter — JSON permission deny/allow on stdin/stdout.
# On by default; opt-out via MNM_DISABLE_STDERR_HOOK=1 or
# .claude/config/stderr-hooks.json {"preserve_stderr": false}.
set -u

HOOKS_STDERR_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DETECT="$HOOKS_STDERR_DIR/detect.py"

if [ "${MNM_DISABLE_STDERR_HOOK:-0}" = "1" ]; then
  printf '%s\n' '{"permission":"allow"}'
  exit 0
fi

input="$(cat)"

# Opt-out config (best-effort from cwd)
CFG="$(pwd)/.claude/config/stderr-hooks.json"
if [ -r "$CFG" ] && command -v python3 >/dev/null 2>&1; then
  if python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); sys.exit(0 if d.get("preserve_stderr",True) is False else 1)' "$CFG" 2>/dev/null; then
    printf '%s\n' '{"permission":"allow"}'
    exit 0
  fi
fi

python3 - "$DETECT" "$input" <<'PY'
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

msg = (proc.stderr or proc.stdout or "Blocked: stderr policy").strip()
print(json.dumps({
    "permission": "deny",
    "user_message": msg,
    "agent_message": msg,
}))
PY
