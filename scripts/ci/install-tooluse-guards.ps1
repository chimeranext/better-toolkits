#!/usr/bin/env pwsh
# install-tooluse-guards.ps1 — install tool-use guards into central hooks home (Windows).
#
# Convention:
#   $HARNESS_HOME    = C:\Users\<user>\.agents   (central agent home)
#   $HARNESS_HOOKS   = $HARNESS_HOME\hooks        (central hooks dir)
# Usage: pwsh -File scripts/ci/install-tooluse-guards.ps1 [-root <custom-home>]

param(
    [string]$root
)

$ErrorActionPreference = 'Stop'

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path

if ($root) {
    $HARNESS_HOME = $root
}
elseif ($env:HARNESS_HOME) {
    $HARNESS_HOME = $env:HARNESS_HOME
}
elseif ($env:USERPROFILE) {
    $HARNESS_HOME = Join-Path $env:USERPROFILE '.agents'
}
else {
    Write-Error "[tooluse-guards] ERROR: no \$root, \$env:HARNESS_HOME, or \$env:USERPROFILE available; cannot locate the agent home."
    exit 1
}

$HARNESS_HOOKS = Join-Path $HARNESS_HOME 'hooks'

New-Item -ItemType Directory -Path $HARNESS_HOOKS -Force | Out-Null

Copy-Item -LiteralPath (Join-Path $RepoRoot 'shared\hooks\tooluse\enforce-prds.sh') `
    -Destination (Join-Path $HARNESS_HOOKS 'enforce-prds.sh') -Force
Copy-Item -LiteralPath (Join-Path $RepoRoot 'shared\hooks\tooluse\approve-admin-merge.sh') `
    -Destination (Join-Path $HARNESS_HOOKS 'approve-admin-merge.sh') -Force

$STOP_SRC = Join-Path $RepoRoot 'shared\hooks\tooluse\stop-prs-green.sh'
if (-not (Test-Path -LiteralPath $STOP_SRC -PathType Leaf)) {
    $STOP_SRC = Join-Path $RepoRoot 'toolkits\make-no-mistakes-toolkit\hooks\hygiene\stop-prs-green.sh'
}
if (Test-Path -LiteralPath $STOP_SRC -PathType Leaf) {
    Copy-Item -LiteralPath $STOP_SRC -Destination (Join-Path $HARNESS_HOOKS 'stop-prs-green.sh') -Force
}

# chmod +x has no Windows equivalent; Git for Windows executes hooks via bash,
# which does not depend on a POSIX file mode.

Write-Output "[tooluse-guards] installed: $HARNESS_HOOKS"
Write-Output "  HARNESS_HOME=$HARNESS_HOME"
Write-Output "  set these in your environment: `$env:HARNESS_HOME = '$HARNESS_HOME'; `$env:HARNESS_HOOKS = '$HARNESS_HOOKS'"
exit 0
