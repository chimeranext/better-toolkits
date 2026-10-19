#!/usr/bin/env bash
# OpenCode harness — purge better-toolkits managed artifacts, then re-wire.
#
# The OpenCode equivalent of prune-better-toolkits-cache-cursor.sh. OpenCode has
# no marketplace plugin cache; its "cached copies" are the discovery-dir plugin
# copies, the commands/ symlinks and the npm CLI installs.
#
# SSOT: shared/bootstrap/references/toolkits-initial-setup/adapters/setup-opencode.md
#
# Usage:
#   prune-better-toolkits-cache-opencode.sh [--also-npm]
#
# Deletes ONLY these fixed paths (if present):
#   <configDir>/plugins/mnm-no-stderr-redirect/       (stderr adapter copy)
#   <configDir>/plugins/better-toolkits-auto-update/  (auto-update plugin copy)
#   <configDir>/commands/                            (command symlinks)
#   <configDir>/node_modules/                        (npm CLI installs)
#
# Never touches opencode.json(c): "plugins"/"skills" entries are absolute paths
# into the clone, not cached copies. After purging, the wiring is re-run via the
# CLI (adapter copy + commands + skills). Pass --also-npm to reinstall the four
# @chimeranext/* CLIs afterwards.
#
# Logs: <configDir>/logs/prune-better-toolkits-cache-opencode-*.out|err.log
# Fail-open: never exits non-zero.

set -euo pipefail

CONFIG_DIR="${OPENCODE_CONFIG_DIR:-${HOME}/.config/opencode}"
LOG_DIR="${CONFIG_DIR}/logs"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_LOG="${LOG_DIR}/prune-better-toolkits-cache-opencode-${TS}.out.log"
ERR_LOG="${LOG_DIR}/prune-better-toolkits-cache-opencode-${TS}.err.log"
mkdir -p "${LOG_DIR}"

# Safety: only ever purge inside an opencode config dir (an `opencode` path
# component, absolute). Blocks "/etc/opencode-evil", relative paths, etc.
case "${CONFIG_DIR}" in
  /*/opencode/*|/*/opencode|*/opencode/*|*/opencode) ;;
  *)
    echo "refusing: CONFIG_DIR is not an opencode config dir: ${CONFIG_DIR}" >>"${ERR_LOG}"
    exit 0
    ;;
esac

# Clone root: env override, else this script's own location (it lives in the clone).
CLONE="${BETTER_TOOLKITS_ROOT:-}"
if [[ -z "${CLONE}" || ! -f "${CLONE}/.claude-plugin/marketplace.json" ]]; then
  CLONE="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
fi

{
  echo "scope=opencode-managed-artifacts"
  echo "started_at=${TS}"
  echo "config_dir=${CONFIG_DIR}"
  echo "clone=${CLONE}"
} >>"${OUT_LOG}"

purge_dir() {
  local target="$1"
  if [[ -e "${target}" ]]; then
    echo "rm -rf ${target}" >>"${OUT_LOG}"
    rm -rf "${target}"
  else
    echo "skip (absent): ${target}" >>"${OUT_LOG}"
  fi
}

purge_dir "${CONFIG_DIR}/plugins/mnm-no-stderr-redirect"
purge_dir "${CONFIG_DIR}/plugins/better-toolkits-auto-update"
purge_dir "${CONFIG_DIR}/commands"
purge_dir "${CONFIG_DIR}/node_modules"

if [[ -f "${CLONE}/shared/bootstrap/cli/bin/better-toolkits.js" ]]; then
  if node "${CLONE}/shared/bootstrap/cli/bin/better-toolkits.js" self-update --harness opencode --no-pull >>"${OUT_LOG}" 2>>"${ERR_LOG}"; then
    echo "rewire: ok" >>"${OUT_LOG}"
  else
    echo "rewire: failed (see ${ERR_LOG})" >>"${OUT_LOG}"
  fi
else
  echo "rewire: skipped (no CLI in ${CLONE})" >>"${OUT_LOG}"
fi

if [[ "${1:-}" == "--also-npm" ]]; then
  for pkg in @chimeranext/make-no-mistakes @chimeranext/atomic-design-toolkit @chimeranext/business-model-toolkit @chimeranext/app-gtm-release-toolkit; do
    if npx --yes "${pkg}" install --config-dir "${CONFIG_DIR}" >>"${OUT_LOG}" 2>>"${ERR_LOG}"; then
      echo "npm reinstall: ok ${pkg}" >>"${OUT_LOG}"
    else
      echo "npm reinstall: failed ${pkg} (see ${ERR_LOG})" >>"${OUT_LOG}"
    fi
  done
fi

echo "done — OpenCode better-toolkits artifacts purged and re-wired" >>"${OUT_LOG}"
exit 0
