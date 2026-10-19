#!/usr/bin/env bash
# OpenCode harness — better-toolkits auto-update (git pull + full wiring re-sync).
#
# Source of truth: `git pull --ff-only` on the monorepo clone, then the same
# idempotent wiring `setup` runs (discovery copy + commands/ symlinks + skills
# entries + auto-update plugin). One script per harness; the Cursor equivalent
# is update-better-toolkits-marketplace-cursor.sh.
#
# SSOT: shared/bootstrap/references/toolkits-initial-setup/adapters/setup-opencode.md
#
# Usage:
#   update-better-toolkits-marketplace-opencode.sh [--expert-mode] [--no-pull]
#
# Logs: <configDir>/logs/update-better-toolkits-marketplace-opencode-*.out|err.log
# Fail-open: never exits non-zero.

set -euo pipefail

CONFIG_DIR="${OPENCODE_CONFIG_DIR:-${HOME}/.config/opencode}"
LOG_DIR="${CONFIG_DIR}/logs"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_LOG="${LOG_DIR}/update-better-toolkits-marketplace-opencode-${TS}.out.log"
ERR_LOG="${LOG_DIR}/update-better-toolkits-marketplace-opencode-${TS}.err.log"
mkdir -p "${LOG_DIR}"

ARGS=(self-update --harness opencode)
if [[ "${1:-}" == "--expert-mode" ]]; then
  ARGS+=(--expert-mode)
fi
if [[ "${1:-}" == "--no-pull" ]]; then
  ARGS+=(--no-pull)
fi

# Clone root: env override, else this script's own location (it lives in the clone).
CLONE="${BETTER_TOOLKITS_ROOT:-}"
if [[ -z "${CLONE}" || ! -f "${CLONE}/.claude-plugin/marketplace.json" ]]; then
  CLONE="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
fi

if [[ ! -f "${CLONE}/shared/bootstrap/cli/bin/better-toolkits.js" ]]; then
  echo "no better-toolkits CLI in ${CLONE} — nothing to update" >>"${OUT_LOG}"
  exit 0
fi

if ! node "${CLONE}/shared/bootstrap/cli/bin/better-toolkits.js" "${ARGS[@]}" >>"${OUT_LOG}" 2>>"${ERR_LOG}"; then
  echo "self-update failed (see ${ERR_LOG})" >>"${OUT_LOG}"
fi

exit 0
