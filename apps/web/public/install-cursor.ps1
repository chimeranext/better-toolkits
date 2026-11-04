# Install the better-toolkits layer for Cursor (harness already installed).
# One-liner (PowerShell): irm https://toolkits.chimeranext.dev/install-cursor.ps1 | iex
$ErrorActionPreference = "Stop"

Write-Output "[cursor] add marketplace"
agent plugin marketplace add chimeranext/better-toolkits

Write-Output "[cursor] install bootstrap plugin"
agent plugin install better-toolkits-bootstrap@better-toolkits

Write-Output "[cursor] install agent-agnostic skills (global)"
npx skills add chimeranext/better-toolkits --all -g -y

$hooksDir = Join-Path $HOME ".cursor/hooks"
New-Item -ItemType Directory -Force -Path $hooksDir | Out-Null
$src = "shared/hooks/bilingual/adapters/cursor-before-shell.sh"
if (Test-Path $src) {
  Copy-Item $src (Join-Path $hooksDir "cursor-before-shell.sh") -Force
  Write-Output "[cursor] bilingual hook copied"
} else {
  Write-Output "[cursor] WARN: cursor-before-shell.sh not found in cwd (run from repo root)"
}

Write-Output "[cursor] done. Run /toolkits-initial-setup to finish wiring."
