#!/usr/bin/env bash
# diagnose-project-takeover.sh — read-only ownership probes for project takeover.
# Exit: 0=no match (client org looks canonical), 1=detected risk, 2=does not apply
# Idempotent. No sudo. No state change.
# Env:
#   TAKEOVER_REPO_DIR  — path to a local clone (required for git probes)
#   TAKEOVER_CLIENT_ORG — substring expected in canonical remote URL (optional)
#   TAKEOVER_DIAG_LOG — optional log file for git stderr (default: ./diagnose-project-takeover.err)
set -euo pipefail

log()  { printf '\033[0;36m[diagnose]\033[0m %s\n' "$*"; }
ok()   { printf '\033[0;32m[ok]\033[0m %s\n' "$*"; }
warn() { printf '\033[0;33m[warn]\033[0m %s\n' "$*"; }
fail() { printf '\033[0;31m[fail]\033[0m %s\n' "$*"; }

err_log="${TAKEOVER_DIAG_LOG:-./diagnose-project-takeover.err}"

# Guardrails
if ! GIT_BIN="$(command -v git)"; then
  fail "git not found"
  exit 2
fi
readonly GIT_BIN

if [[ -z "${TAKEOVER_REPO_DIR:-}" ]]; then
  warn "TAKEOVER_REPO_DIR unset — cannot probe git remotes"
  log "Manual checklist (read-only):"
  log "  1. Is origin under the client org URL?"
  log "  2. Does the prior developer still have admin on cloud/DNS?"
  log "  3. Can anyone wipe production from a personal account?"
  exit 2
fi

if [[ ! -d "${TAKEOVER_REPO_DIR}/.git" ]]; then
  fail "Not a git repo: ${TAKEOVER_REPO_DIR}"
  exit 2
fi

detected=0

log "Probing remotes in ${TAKEOVER_REPO_DIR}"
if ! remotes="$("${GIT_BIN}" -C "${TAKEOVER_REPO_DIR}" remote -v 2>>"${err_log}")"; then
  fail "git remote -v failed (see ${err_log})"
  exit 2
fi
if [[ -z "${remotes}" ]]; then
  fail "DETECTED: no git remotes configured"
  detected=1
else
  printf '%s\n' "${remotes}"
fi

if origin_url="$("${GIT_BIN}" -C "${TAKEOVER_REPO_DIR}" remote get-url origin 2>>"${err_log}")"; then
  :
else
  origin_url=""
  fail "DETECTED: origin remote missing"
  detected=1
fi

client_org="${TAKEOVER_CLIENT_ORG:-}"
if [[ -n "${client_org}" && -n "${origin_url}" ]]; then
  case "${origin_url}" in
    *"${client_org}"*)
      ok "origin URL contains client org marker (${client_org})"
      ;;
    *)
      fail "DETECTED: origin URL does not contain client org marker (${client_org})"
      fail "origin=${origin_url}"
      detected=1
      ;;
  esac
else
  warn "TAKEOVER_CLIENT_ORG unset — skip org substring check"
  warn "Manual: confirm origin is under the client org"
fi

log "Manual confirms (not automated):"
log "  - Cloud account root / IAM admin holder"
log "  - DNS registrar login owner"
log "  - Production destroy capability on personal accounts"

if [[ "${detected}" -eq 1 ]]; then
  fail "Ownership risk detected (exit 1)"
  exit 1
fi

ok "No automated ownership mismatch detected (exit 0)"
exit 0
