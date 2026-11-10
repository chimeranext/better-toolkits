#!/usr/bin/env bash
# recover-project-takeover.sh — move custody markers toward client org control.
# Idempotent intent. Backs up remote list before changes.
# Supports NONINTERACTIVE=1 (skip prompts; still refuses missing env).
# No blanket sudo. State change is git remote / mirror only unless you extend.
# Env:
#   TAKEOVER_REPO_DIR     — local clone path (required)
#   TAKEOVER_CLIENT_REMOTE — new canonical remote URL under client org (required)
#   TAKEOVER_MIRROR_DIR   — optional path for bare mirror backup
#   TAKEOVER_RECOVER_LOG  — optional log for git stderr (default: ./recover-project-takeover.err)
set -euo pipefail

log()  { printf '\033[0;36m[recover]\033[0m %s\n' "$*"; }
ok()   { printf '\033[0;32m[ok]\033[0m %s\n' "$*"; }
warn() { printf '\033[0;33m[warn]\033[0m %s\n' "$*"; }
fail() { printf '\033[0;31m[fail]\033[0m %s\n' "$*"; }

err_log="${TAKEOVER_RECOVER_LOG:-./recover-project-takeover.err}"

# Guardrails
if ! GIT_BIN="$(command -v git)"; then
  fail "git not found"
  exit 1
fi
readonly GIT_BIN

if [[ -z "${TAKEOVER_REPO_DIR:-}" || -z "${TAKEOVER_CLIENT_REMOTE:-}" ]]; then
  fail "Set TAKEOVER_REPO_DIR and TAKEOVER_CLIENT_REMOTE"
  exit 1
fi

if [[ ! -d "${TAKEOVER_REPO_DIR}/.git" ]]; then
  fail "Not a git repo: ${TAKEOVER_REPO_DIR}"
  exit 1
fi

backup_dir="${TAKEOVER_REPO_DIR}/.takeover-recover-backup"
mkdir -p "${backup_dir}"
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
"${GIT_BIN}" -C "${TAKEOVER_REPO_DIR}" remote -v > "${backup_dir}/remotes-${stamp}.txt" 2>>"${err_log}"
ok "Backed up remotes to ${backup_dir}/remotes-${stamp}.txt"

if [[ -n "${TAKEOVER_MIRROR_DIR:-}" ]]; then
  if [[ -d "${TAKEOVER_MIRROR_DIR}" ]]; then
    ok "Mirror dir already exists (idempotent): ${TAKEOVER_MIRROR_DIR}"
  else
    log "Creating bare mirror at ${TAKEOVER_MIRROR_DIR}"
    "${GIT_BIN}" clone --mirror "${TAKEOVER_REPO_DIR}" "${TAKEOVER_MIRROR_DIR}" 2>>"${err_log}"
    ok "Mirror created"
  fi
else
  warn "TAKEOVER_MIRROR_DIR unset — skipping bare mirror"
  warn "On HIGH risk, set TAKEOVER_MIRROR_DIR before outreach"
fi

if current_origin="$("${GIT_BIN}" -C "${TAKEOVER_REPO_DIR}" remote get-url origin 2>>"${err_log}")"; then
  :
else
  current_origin=""
fi

if [[ "${current_origin}" == "${TAKEOVER_CLIENT_REMOTE}" ]]; then
  ok "origin already points at client remote (idempotent)"
else
  if [[ "${NONINTERACTIVE:-0}" != "1" ]]; then
    printf 'Set origin to %s ? [y/N] ' "${TAKEOVER_CLIENT_REMOTE}"
    read -r ans
    case "${ans}" in
      y|Y|yes|YES) ;;
      *) fail "Aborted by operator"; exit 1 ;;
    esac
  fi
  if [[ -n "${current_origin}" ]]; then
    "${GIT_BIN}" -C "${TAKEOVER_REPO_DIR}" remote set-url origin "${TAKEOVER_CLIENT_REMOTE}" 2>>"${err_log}"
  else
    "${GIT_BIN}" -C "${TAKEOVER_REPO_DIR}" remote add origin "${TAKEOVER_CLIENT_REMOTE}" 2>>"${err_log}"
  fi
  ok "origin set to ${TAKEOVER_CLIENT_REMOTE}"
fi

log "Manual gates still required (not automated here):"
log "  [APPROVAL REQUIRED] Rotate deploy secrets / revoke prior-developer admin"
log "  [APPROVAL REQUIRED] Move DNS and cloud ownership to client accounts"
log "Re-run diagnose-project-takeover.sh after those gates"

ok "Recover git custody step complete"
exit 0
