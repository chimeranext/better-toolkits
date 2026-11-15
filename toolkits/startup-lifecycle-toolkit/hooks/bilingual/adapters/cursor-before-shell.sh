#!/usr/bin/env bash
# Cursor beforeShellExecution — Bilingual gate (CLI fallback) on issue creation.
#
# Primary path for Linear MCP is the OpenCode plugin / Claude PreToolUse hook.
# This Cursor adapter covers the shell/CLI transports (gh issue, linear ... create)
# by delegating to the shared deterministic detector. It is MANDATORY (no opt-in)
# and reads no .claude config.
#
# Output JSON: {"permission":"allow"} | {"permission":"deny", user_message, agent_message}
set -u

HOOKS_BILINGUAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DETECT="$HOOKS_BILINGUAL_DIR/detect.py"

if [ ! -f "$DETECT" ]; then
  printf '%s\n' '{"permission":"allow"}'
  exit 0
fi

input="$(cat)"

PYBIN="$(command -v python3)"
if [ -z "$PYBIN" ]; then
  printf '%s\n' '{"permission":"allow"}'
  exit 0
fi

"$PYBIN" - "$DETECT" "$input" <<'PY'
import json, subprocess, sys, re

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

# Only issue-creation CLI transports (Linear primary-of-CLI; gh fallback)
if not re.search(r"gh\s+issue\s+(create|edit)|linear\s+.*\s+(create|edit)", command, re.I):
    print(json.dumps({"permission": "allow"}))
    raise SystemExit(0)

body = ""
body_file = ""
m = re.search(r"--body-file[ =]+([^ ]+)", command)
if m:
    body_file = m.group(1)
else:
    m = re.search(r"--body[ =]+(.+)$", command)
    if m:
        body = m.group(1)

def run(detect, args):
    return subprocess.run([sys.executable, detect] + args, capture_output=True, text=True)

if body_file:
    try:
        body = open(body_file, encoding="utf-8").read()
    except OSError:
        print(json.dumps({"permission": "deny", "user_message": "BILINGUAL: no se puede leer --body-file", "agent_message": "BILINGUAL: no se puede leer --body-file"}))
        raise SystemExit(0)

if not body.strip():
    msg = ("BLOCKED — Bilingual: el comando de creación de issue no lleva body. Todo issue debe abrirse con un brief Bilingual (HUMAN LAYER / AGENT LAYER / Acceptance Criteria / Context Files).")
    print(json.dumps({"permission": "deny", "user_message": msg, "agent_message": msg}))
    raise SystemExit(0)

proc = run(detect, ["--body", body])
if proc.returncode == 0:
    print(json.dumps({"permission": "allow"}))
    raise SystemExit(0)

msg = (proc.stderr or proc.stdout or "BLOCKED — Bilingual: verifica el cuerpo del issue.").strip()
print(json.dumps({"permission": "deny", "user_message": msg, "agent_message": msg}))
PY
