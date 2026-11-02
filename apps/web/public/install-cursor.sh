#!/usr/bin/env bash
# Install the better-toolkits layer for Cursor (harness already installed).
# One-liner: curl -fsSL https://toolkits.chimeranext.dev/install-cursor.sh | bash
set -euo pipefail

echo "[cursor] add marketplace"
agent plugin marketplace add chimeranext/better-toolkits

echo "[cursor] install bootstrap plugin"
agent plugin install better-toolkits-bootstrap@better-toolkits

echo "[cursor] install agent-agnostic skills (global)"
npx skills add chimeranext/better-toolkits --all -g -y

echo "[cursor] copy bilingual stderr hook"
mkdir -p "${HOME}/.cursor/hooks"
if [ -f "shared/hooks/bilingual/adapters/cursor-before-shell.sh" ]; then
  cp "shared/hooks/bilingual/adapters/cursor-before-shell.sh" "${HOME}/.cursor/hooks/cursor-before-shell.sh"
  echo "[cursor] bilingual hook copied"
else
  echo "[cursor] WARN: cursor-before-shell.sh not found in cwd (run from repo root)"
fi

echo "[cursor] done. Run /toolkits-initial-setup to finish wiring."
