#!/usr/bin/env bash
# HITL approval helper for main pushes — better-toolkits.
# Creates the root-owned marker that the pre-push guard requires.
# MUST be run by the human (it elevates via sudo/pkexec and prompts for the
# password). An agent cannot create this marker: it runs as uid != 0.
#
# Usage:
#   scripts/git-hooks/hitl-approve-main-push.sh
#
# After approval, the marker persists at:
#   ${XDG_CACHE_HOME:-$HOME/.cache}/better-toolkits/hitl-approve-main-push
# Revoke when done:
#   scripts/git-hooks/hitl-revoke-main-push.sh
set -u

MARKER="${XDG_CACHE_HOME:-${HOME}/.cache}/better-toolkits/hitl-approve-main-push"
DIRNAME="$(dirname "$MARKER")"

echo "[hitl-approve] This approves a push/merge to 'main' for better-toolkits."
echo "[hitl-approve] Creating root-owned marker at: ${MARKER}"

if command -v pkexec; then
  pkexec bash -c "mkdir -p '${DIRNAME}' && touch '${MARKER}' && chown root:root '${MARKER}'"
elif command -v sudo; then
  sudo bash -c "mkdir -p '${DIRNAME}' && touch '${MARKER}' && chown root:root '${MARKER}'"
else
  echo "[hitl-approve] ERROR: no sudo or pkexec available. Cannot create root-owned marker." >&2
  exit 1
fi

if [ -f "$MARKER" ] && [ "$(stat -c %u "$MARKER")" = "0" ]; then
  echo "[hitl-approve] OK: root-owned marker created. You may now push/merge to main."
  exit 0
fi

echo "[hitl-approve] ERROR: marker not created as root. Push to main remains BLOCKED." >&2
exit 1
