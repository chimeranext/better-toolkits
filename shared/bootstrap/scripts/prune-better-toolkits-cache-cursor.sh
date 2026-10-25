#!/usr/bin/env bash
# Clear ALL Cursor plugin cache for the better-toolkits marketplace, then re-sync.
# Use after any marketplace version bump so Cursor does not keep stale copies of any toolkit.
# The OpenCode equivalent is prune-better-toolkits-cache-opencode.sh.
#
# Usage:
#   prune-better-toolkits-cache-cursor.sh
#
# Slash command SSOT: /prune-better-toolkits-cache (shared/bootstrap/commands/)
#
# Deletes only these fixed directories (if they exist):
#   ~/.cursor/plugins/cache/chimeranext-better-toolkits
#   ~/.cursor/plugins/cache/better-toolkits
# Then runs: agent plugin marketplace update better-toolkits
#
# Logs: ~/.cursor/hooks/logs/prune-better-toolkits-cache-*.out|err.log
# Fail-open on marketplace update errors (cache purge is the critical step).

set -euo pipefail

LOG_DIR="${HOME}/.cursor/hooks/logs"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_LOG="${LOG_DIR}/prune-better-toolkits-cache-${TS}.out.log"
ERR_LOG="${LOG_DIR}/prune-better-toolkits-cache-${TS}.err.log"

CURSOR_PLUGIN_CACHE="${HOME}/.cursor/plugins/cache"

# Literal allowlist — never rm -rf from a variable path without this check.
readonly -a MARKETPLACE_CACHE_DIRNAMES=(
  chimeranext-better-toolkits
  better-toolkits
)

if [[ $# -gt 0 ]]; then
  echo "This script takes no arguments — it always purges the full better-toolkits cache." >&2
  echo "Do not pass a single toolkit slug after a version bump; stale siblings would remain." >&2
  exit 2
fi

mkdir -p "${LOG_DIR}"

marketplace_cache_paths() {
  local name
  for name in "${MARKETPLACE_CACHE_DIRNAMES[@]}"; do
    printf '%s/%s\n' "${CURSOR_PLUGIN_CACHE}" "${name}"
  done
}

assert_safe_marketplace_cache_path() {
  local target="$1"
  local parent
  local base

  parent="$(cd "$(dirname "${target}")" && pwd)"
  base="$(basename "${target}")"

  if [[ "${parent}" != "$(cd "${CURSOR_PLUGIN_CACHE}" && pwd)" ]]; then
    echo "refusing purge outside Cursor plugin cache: ${target}" >>"${ERR_LOG}"
    return 1
  fi

  local allowed=0
  local name
  for name in "${MARKETPLACE_CACHE_DIRNAMES[@]}"; do
    if [[ "${base}" == "${name}" ]]; then
      allowed=1
      break
    fi
  done

  if [[ "${allowed}" -ne 1 ]]; then
    echo "refusing purge of unexpected cache basename: ${base}" >>"${ERR_LOG}"
    return 1
  fi

  return 0
}

log_cached_versions() {
  local root="$1"
  {
    echo "== plugin.json versions under ${root} (before purge) =="
  } >>"${OUT_LOG}"

  command -v jq >>"${OUT_LOG}" || { echo "jq not found; skip version listing" >>"${OUT_LOG}"; return 0; }
  # Suppress noisy stdout from jq; log only
  find "${root}" -path '*/.claude-plugin/plugin.json' -print0 2>/dev/null | xargs -0 -I{} sh -c 'jq -r ".version" "{}"' >>"${OUT_LOG}" 2>>"${ERR_LOG}" || true

  if [[ ! -d "${root}" ]]; then
    echo "(directory absent)" >>"${OUT_LOG}"
    return 0
  fi

  local plugin_json
  while IFS= read -r plugin_json; do
    [[ -z "${plugin_json}" ]] && continue
    local ver slug
    ver="$(jq -r '.version // empty' "${plugin_json}" 2>>"${ERR_LOG}" || true)"
    slug="$(basename "$(dirname "$(dirname "${plugin_json}")")")"
    echo "${slug} ${ver:-<missing>} (${plugin_json})" >>"${OUT_LOG}"
  done < <(find "${root}" -path '*/.claude-plugin/plugin.json' 2>>"${ERR_LOG}" | sort)
}

purge_marketplace_cache_root() {
  local target="$1"

  assert_safe_marketplace_cache_path "${target}"

  if [[ ! -e "${target}" ]]; then
    echo "skip purge (not present): ${target}" >>"${OUT_LOG}"
    return 0
  fi

  echo "rm -rf ${target}" >>"${OUT_LOG}"
  rm -rf "${target}"
}

{
  echo "scope=full-marketplace-cache-roots"
  echo "started_at=${TS}"
  echo "cursor_plugin_cache=${CURSOR_PLUGIN_CACHE}"
} >>"${OUT_LOG}"

while IFS= read -r cache_root; do
  log_cached_versions "${cache_root}"
  purge_marketplace_cache_root "${cache_root}"
done < <(marketplace_cache_paths)

if command -v agent; then
  echo "agent plugin marketplace update better-toolkits" >>"${OUT_LOG}"
  if agent plugin marketplace update better-toolkits >>"${OUT_LOG}" 2>>"${ERR_LOG}" >>"${OUT_LOG}"; then
    echo "marketplace update: ok" >>"${OUT_LOG}"
  else
    echo "marketplace update: failed (see err log); cache already cleared" >>"${OUT_LOG}"
  fi
else
  echo "agent CLI not on PATH; skipped marketplace update" >>"${OUT_LOG}"
fi

echo "echo "Wiped ${CURSOR_PLUGIN_CACHE}/chimeranext-better-toolkits ${CURSOR_PLUGIN_CACHE}/better-toolkits" >>"${OUT_LOG}"
echo "Wiped ${CURSOR_PLUGIN_CACHE}/chimeranext-better-toolkits ${CURSOR_PLUGIN_CACHE}/better-toolkits"
done — re-enable or reinstall toolkits in Cursor if skills/commands are missing" >>"${OUT_LOG}"
exit 0
