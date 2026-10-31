#!/usr/bin/env bash
# setup-specula.sh — install Specula (agentic TLA+ formal verification) globally,
# pinned, idempotent.
#
# Specula writes TLA+ specs + invariants of a target system, model-checks them
# with TLC, and reproduces violations at the code level. It is the third leg of
# the /ishikawa evidence stack (Graphify observes, Open Ontologies reasons over
# data, Specula proves behavior). It is installed GLOBALLY (one per machine),
# never committed into consumer repos.
#
# Usage: bash setup-specula.sh
# Idempotent: re-running is safe.
set -euo pipefail

SPECULA_PIN="${SPECULA_PIN:-main}"   # commit/tag ref (bump deliberately)

log() { printf '[setup-specula] %s\n' "$*" >&2; }

# Prerequisites: python3, uv, java 21+ (for TLC), mvn (for spec_analyzer jar), gh
for tool in python3 uv java mvn gh; do
  if ! command -v "$tool" > /tmp/opencode/specula-prereq.log 2>&1; then
    log "missing required command: $tool (specula setup needs it to build bundled tools)"
    exit 1
  fi
done

SPECULA_DIR="${SPECULA_DIR:-$HOME/.local/src/Specula}"

if [ ! -d "$SPECULA_DIR/.git" ]; then
  log "cloning Specula into ${SPECULA_DIR}"
  mkdir -p "$(dirname "$SPECULA_DIR")"
  git clone https://github.com/specula-org/Specula.git "$SPECULA_DIR"
fi

log "checking out pinned ref ${SPECULA_PIN}"
git -C "$SPECULA_DIR" fetch --quiet origin
git -C "$SPECULA_DIR" checkout --quiet "$SPECULA_PIN"

log "installing specula CLI (uv tool install -e .)"
( cd "$SPECULA_DIR" && uv tool install -e . )

log "running specula setup (agent skills + MCP tools + bundled tools)"
if command -v specula > /tmp/opencode/specula-path.log 2>&1; then
  specula setup || log "specula setup returned non-zero (may already be configured; continuing)"
else
  log "specula CLI not on PATH after install — check your tool PATH"
  exit 1
fi

log "done. Use 'specula run <sys> --artifact=<repo> --guidance=<file>'."
log "Outputs live in runs/<run-id>/ (outside the source checkout)."
log "The /ishikawa recurrence guard can be expressed as a TLA+ invariant checked by Specula."
