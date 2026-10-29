#!/usr/bin/env bash
# Cursor beforeShellExecution adapter — JSON permission deny/allow on stdin/stdout.
# RESTRICTION: never skip /ready-to-review-mergeable protocol steps (#128).
set -u

RESTRICTIONS_FILE="${HOOKS_STDERR_DIR}/../../../../restrictions-ready-to-review-mergeable.json"
if [ -f "$RESTRICTIONS_FILE" ]; then
  python3 -c '
import json, sys
try:
  r=json.load(open("'$RESTRICTIONS_FILE'"))
  states=r.get("verified_states",{})
  pending=any(v=="PENDING" for v in states.values())
  blocked=any(v=="BLOCKED" for v in states.values())
  if pending or blocked:
    sys.exit(1)
except Exception:
  pass
' 2>/dev/null || echo "[STDERR HOOK] RESTRICTION CHECK: /ready-to-review-mergeable steps must complete before next phase." >&2
fi

HOOKS_STDERR_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DETECT="$HOOKS_STDERR_DIR/detect.py"

if [ "${MNM_DISABLE_STDERR_HOOK:-0}" = "1" ]; then
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
CFG="$(pwd)/.claude/config/stderr-hooks.json"
if [ -r "$CFG" ]; then
  if "$PYBIN" -c 'import json,sys; d=json.load(open(sys.argv[1])); sys.exit(0 if d.get("preserve_stderr",True) is False else 1)' "$CFG"; then
    printf '%s\n' '{"permission":"allow"}'
    exit 0
  fi
fi

"$PYBIN" - "$DETECT" "$input" <<'PY'
import json, os, subprocess, sys

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

tk = (command or "").split()
push_main = False
if any(t in ("push", "merge") for t in tk) and tk and tk[-1] in ("main", "master"):
    push_main = True

if push_main:
    env2 = dict(os.environ)
    env2["MNM_GIT_TARGET"] = tk[-1]
    proc2 = subprocess.run(
        ["bash", detect_dir + "/../../git/pre-push.sh", tk[-1]],
        capture_output=True,
        text=True,
        env=env2,
    )
    if proc2.returncode == 2:
        msg = (proc2.stderr or proc2.stdout or "BLOCKED: push/merge to main requires HITL human approval").strip()
        print(json.dumps({
            "permission": "deny",
            "user_message": msg,
            "agent_message": msg,
        }))
        raise SystemExit(0)

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
