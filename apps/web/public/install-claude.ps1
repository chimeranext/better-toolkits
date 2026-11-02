# Install the better-toolkits layer for Claude Code (harness already installed).
# One-liner (PowerShell): irm https://toolkits.chimeranext.dev/install-claude.ps1 | iex
$ErrorActionPreference = "Stop"

Write-Output "[claude] add marketplace"
claude plugin marketplace add chimeranext/better-toolkits

Write-Output "[claude] install bootstrap plugin"
claude plugin install better-toolkits-bootstrap@better-toolkits

Write-Output "[claude] install agent-agnostic skills (global)"
npx skills add chimeranext/better-toolkits --all -g -y

Write-Output "[claude] done. Run /toolkits-initial-setup to finish wiring."
