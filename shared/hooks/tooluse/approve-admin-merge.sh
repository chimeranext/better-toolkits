#!/usr/bin/env bash
# Pre-tool-use guard: `gh pr merge --admin` requires explicit HUMAN approval.
#
# A `--admin` merge bypasses required reviews — it must never run as a silent
# action. This hook intercepts the command BEFORE execution. If it sees
# `gh pr merge` with `--admin`, it demands a root-owned approval marker that
# only a human can create via pkexec/sudo (password prompt). Declining blocks
# the tool use (exit 1). Approval is fresh (5 min).
#
# Wiring example (opencode.json hooks.beforeToolUse or adapter):
#   bash <repo>/shared/hooks/tooluse/approve-admin-merge.sh "$ARGUMENTS"
set -u

CMD="$*"
case "$CMD" in
  *"gh pr merge"*"--admin"*) ;;
  *) exit 0 ;; # not a guarded admin merge
esac

MARKER="${XDG_CACHE_HOME:-${HOME}/.cache}/better-toolkits/hitl-approve-main-merge"

# Already freshly approved by a human (root-owned, <300s)?
if [ -f "$MARKER" ]; then
  if [ "$(stat -c %u "$MARKER")" = "0" ]; then
    AGE=$(( $(date +%s) - $(stat -c %Y "$MARKER") ))
    if [ "$AGE" -le 300 ]; then
      exit 0
    fi
  fi
  rm -f "$MARKER"
fi

echo "[tooluse] 'gh pr merge --admin' requires explicit HUMAN approval." >&2
echo "[tooluse] A pkexec/sudo prompt is about to open (authorize to create the root marker)." >&2

RC=1
if command -v pkexec; then
  pkexec bash -c "mkdir -p \"$(dirname "$MARKER")\" && touch \"$MARKER\" && chown root:root \"$MARKER\""
  RC=$?
elif command -v sudo; then
  sudo bash -c "mkdir -p \"$(dirname "$MARKER")\" && touch \"$MARKER\" && chown root:root \"$MARKER\""
  RC=$?
else
  echo "[tooluse] ERROR: no pkexec/sudo available to confirm human approval." >&2
  exit 1
fi

if [ "$RC" -ne 0 ]; then
  echo "[tooluse] BLOCKED: admin merge not approved by human." >&2
  exit 1
fi

if [ -f "$MARKER" ] && [ "$(stat -c %u "$MARKER")" = "0" ]; then
  echo "[tooluse] OK: human approval recorded. Proceeding." >&2
  exit 0
fi

echo "[tooluse] BLOCKED: marker not created as root." >&2
exit 1
