#!/usr/bin/env bash
# Optional Cursor workspaceOpen hook — register only with explicit user consent (/toolkits-initial-setup).
# Updates better-toolkits marketplace; logs stderr; throttled; fail-open.

set -euo pipefail

THROTTLE_SECONDS=1800
LOG_DIR="${HOME}/.cursor/hooks/logs"
STAMP_FILE="${LOG_DIR}/.update-better-toolkits-marketplace.last"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_LOG="${LOG_DIR}/update-better-toolkits-marketplace-${TS}.out.log"
ERR_LOG="${LOG_DIR}/update-better-toolkits-marketplace-${TS}.err.log"

mkdir -p "${LOG_DIR}"

if [[ -f "${STAMP_FILE}" ]]; then
  last="$(cat "${STAMP_FILE}" 2>"${ERR_LOG}" || echo 0)"
  now="$(date +%s)"
  age=$((now - last))
  if [[ "${age}" -lt "${THROTTLE_SECONDS}" ]]; then
    exit 0
  fi
fi

if ! command -v agent >/dev/null 2>"${ERR_LOG}"; then
  exit 0
fi

if agent plugin marketplace update better-toolkits >"${OUT_LOG}" 2>"${ERR_LOG}"; then
  date +%s >"${STAMP_FILE}"
fi

exit 0
