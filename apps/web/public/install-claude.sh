#!/usr/bin/env bash
# Install the better-toolkits layer for Claude Code (harness already installed).
# One-liner: curl -fsSL https://toolkits.chimeranext.dev/install-claude.sh | bash
set -euo pipefail

echo "[claude] add marketplace"
claude plugin marketplace add chimeranext/better-toolkits

echo "[claude] install bootstrap plugin"
claude plugin install better-toolkits-bootstrap@better-toolkits

echo "[claude] install agent-agnostic skills (global)"
npx skills add chimeranext/better-toolkits --all -g -y

echo "[claude] done. Run /toolkits-initial-setup to finish wiring."
