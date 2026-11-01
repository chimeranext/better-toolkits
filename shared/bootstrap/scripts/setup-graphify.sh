#!/usr/bin/env bash
# setup-graphify.sh — install Graphify (graphifyy) globally, pinned, idempotent.
#
# Graphify builds a knowledge graph with edges tagged EXTRACTED/INFERRED (a
# concrete implementation of the Genchi Genbutsu observation distinction used by
# /ishikawa). It is installed GLOBALLY (one per machine), never committed into
# consumer repos, and it makes NO assumption about a fixed scan root — an agent
# runs `graphify .` from whichever repo it is working in.
#
# Usage: bash setup-graphify.sh
# Idempotent: re-running is safe (no duplicate installs).
set -euo pipefail

PINNED_VERSION="${GRAPHIFY_PINNED_VERSION:-0.9.97}"   # bump deliberately

log() { printf '[setup-graphify] %s\n' "$*" >&2; }

# Prefer uv; fall back to pipx.
if command -v uv; then
  log "using uv to manage graphifyy"
  if uv tool list > /tmp/opencode/graphify-uv.log 2>&1 && grep -q 'graphifyy' /tmp/opencode/graphify-uv.log; then
    log "graphifyy already installed via uv — checking pinned version"
    if ! uv tool run --from "graphifyy==${PINNED_VERSION}" graphify --version > /tmp/opencode/graphify-ver.log 2>&1; then
      log "installing graphifyy==${PINNED_VERSION}"
      uv tool install "graphifyy==${PINNED_VERSION}"
    else
      log "graphifyy==${PINNED_VERSION} already satisfied"
    fi
  else
    log "installing graphifyy==${PINNED_VERSION}"
    uv tool install "graphifyy==${PINNED_VERSION}"
  fi
elif command -v pipx; then
  log "using pipx to manage graphifyy"
  if pipx list > /tmp/opencode/graphify-pipx.log 2>&1 && grep -q 'graphifyy' /tmp/opencode/graphify-pipx.log; then
    log "graphifyy already installed via pipx — checking pinned version"
    pipx install "graphifyy==${PINNED_VERSION}" --force || true
  else
    pipx install "graphifyy==${PINNED_VERSION}"
  fi
else
  log "neither uv nor pipx found — cannot manage graphifyy"
  exit 1
fi

# Register the global /graphify skill (NOT per-project).
if command -v graphify; then
  log "registering global graphify skill (graphify install)"
  graphify install || log "graphify install returned non-zero (may already be registered; continuing)"
else
  log "graphify CLI not on PATH after install — check your tool PATH"
  exit 1
fi

log "done. Use \"graphify .\" from the repo you want to map (no fixed scan root)."
log "gitignore note: add \"graphify-out/\" to each repo's .gitignore."
