#!/usr/bin/env bash
# pre-write hook — block stderr redirect + decorative echoes before file creation
# Part of /dogfood SSOT enforcement
set -uo pipefail
if echo "${CLAUDE_PREWRITE_CMD:-}" | grep -qE '2>/dev/null|2> /dev/null|2>>/dev/null|&>/dev/null'; then
  echo "[HOOK] PROHIBITED: stderr redirect (2>/dev/null) in write command." >&2
  exit 2
fi
if echo "$*" | grep -qE 'echo\s+"={3,}|echo\s+"-{3,}'; then
  echo "[HOOK] PROHIBITED: decorative echo separator." >&2
  exit 2
fi
exit 0
