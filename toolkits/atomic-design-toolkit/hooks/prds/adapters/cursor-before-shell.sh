#!/usr/bin/env bash
# Cursor beforeShellExecution — PRDS gate on git push / gh pr create|edit.
# On by default; opt-out via FCTO_DISABLE_PRDS_HOOK=1 or
# .claude/config/prds-hooks.json {"enforce_prds": false}.
# No output is discarded: binaries are captured into variables, never sent to null.
set -u

HOOKS_PRDS_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DETECT="$HOOKS_PRDS_DIR/detect.py"

if [ "${FCTO_DISABLE_PRDS_HOOK:-0}" = "1" ]; then
  printf '%s\n' '{"permission":"allow"}'
  exit 0
fi

input="$(cat)"

PYBIN="$(command -v python3)"
if [ -z "$PYBIN" ]; then
  printf '%s\n' '{"permission":"allow"}'
  exit 0
fi

CFG="$(pwd)/.claude/config/prds-hooks.json"
if [ -r "$CFG" ]; then
  if "$PYBIN" -c 'import json,sys; d=json.load(open(sys.argv[1])); sys.exit(0 if d.get("enforce_prds",True) is False else 1)' "$CFG"; then
    printf '%s\n' '{"permission":"allow"}'
    exit 0
  fi
fi

"$PYBIN" - "$DETECT" "$input" "$(pwd)" <<'PY'
import json, subprocess, sys

detect, raw, cwd = sys.argv[1], sys.argv[2], sys.argv[3]
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
    [sys.executable, detect, "--command", command, "--cwd", cwd],
    capture_output=True,
    text=True,
)
if proc.returncode == 0:
    print(json.dumps({"permission": "allow"}))
    raise SystemExit(0)

msg = (proc.stderr or proc.stdout or "Blocked: PRDS policy").strip()
print(json.dumps({
    "permission": "deny",
    "user_message": msg,
    "agent_message": msg,
}))
PY
