#!/usr/bin/env bash
# HITL revocation helper — removes the main-push approval marker.
# Usage: scripts/git-hooks/hitl-revoke-main-push.sh
set -u

MARKER="${XDG_CACHE_HOME:-${HOME}/.cache}/better-toolkits/hitl-approve-main-push"

if [ -f "$MARKER" ]; then
  rm -f "$MARKER"
  echo "[hitl-revoke] OK: approval marker removed. Pushes to main are BLOCKED again."
else
  echo "[hitl-revoke] No marker present (already revoked)."
fi
exit 0
