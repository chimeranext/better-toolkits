#!/usr/bin/env bash
# Cursor harness — better-toolkits marketplace auto-update (workspaceOpen hook).
#
# Source of truth: `git pull --ff-only` on the monorepo clone, then
# `agent plugin marketplace update better-toolkits`. One script per harness;
# the OpenCode equivalent is update-better-toolkits-marketplace-opencode.sh.
#
# SSOT: shared/bootstrap/references/toolkits-initial-setup/adapters/setup-cursor.md
#
# Usage:
#   update-better-toolkits-marketplace-cursor.sh [--expert-mode]
#
# Logs: ~/.cursor/hooks/logs/update-better-toolkits-marketplace-cursor-*.out|err.log
# Throttle: BETTER_TOOLKITS_AUTO_UPDATE_INTERVAL_SECONDS (default 1800)
# Fail-open: never exits non-zero — a hook must not break the editor.

set -euo pipefail

THROTTLE_SECONDS="${BETTER_TOOLKITS_AUTO_UPDATE_INTERVAL_SECONDS:-1800}"
LOG_DIR="${HOME}/.cursor/hooks/logs"
STAMP_FILE="${LOG_DIR}/.update-better-toolkits-marketplace-cursor.last"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
LOG="${LOG_DIR}/update-better-toolkits-marketplace-cursor-${TS}.log"

mkdir -p "${LOG_DIR}"

if [[ -f "${STAMP_FILE}" ]]; then
  if last="$(cat "${STAMP_FILE}")"; then :; else last=0; fi
  now="$(date +%s)"
  age=$((now - last))
  if [[ "${age}" -lt "${THROTTLE_SECONDS}" ]]; then
    exit 0
  fi
fi

EXPERT=()
if [[ "${1:-}" == "--expert-mode" ]]; then
  EXPERT=(--expert-mode)
fi

# Clone root: env override, else this script's own location (it lives in the clone).
CLONE="${BETTER_TOOLKITS_ROOT:-}"
if [[ -z "${CLONE}" || ! -f "${CLONE}/.claude-plugin/marketplace.json" ]]; then
  CLONE="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
fi

if [[ -f "${CLONE}/.claude-plugin/marketplace.json" && -f "${CLONE}/shared/bootstrap/cli/bin/better-toolkits.js" ]]; then
  if node "${CLONE}/shared/bootstrap/cli/bin/better-toolkits.js" self-update --harness cursor "${EXPERT[@]}" >>"${LOG}" 2>&1; then
    date +%s >"${STAMP_FILE}"
  fi
  exit 0
fi

# Fallback: no clone on this machine — refresh the marketplace registration only.
AGENT_BIN="$(command -v agent || true)"
if [[ -n "${AGENT_BIN}" ]]; then
  if "${AGENT_BIN}" plugin marketplace update better-toolkits >>"${LOG}" 2>&1; then
    date +%s >"${STAMP_FILE}"
  fi
fi

exit 0
