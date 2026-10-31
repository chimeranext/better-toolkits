#!/usr/bin/env pwsh
# sync-better-profile.ps1 — repo-canonical → user runtime profile sync (Windows).
#
# Canonical source of truth: <repo>/shared/bootstrap/agents/better.md
# Runtime destination: $HOME/.config/opencode/agents/better.md  ($HOME = %USERPROFILE%)
#
# Modes (PowerShell uses single-dash switches):
#   (default)  sync  — copy canonical → destination (idempotent)
#   -check    check — exit 1 if destination differs from canonical (drift)
#   -quiet           — suppress output
#
# The check is machine-local: if the destination path does not exist, the script
# exits 0 (nothing to compare) so CI/other machines never fail on a missing user
# config. Never discard stderr; no redirections to null.

param(
    [switch]$check,
    [switch]$quiet
)

$ErrorActionPreference = 'Stop'

$ScriptDir = $PSScriptRoot
$RepoRoot = (Resolve-Path (Join-Path $ScriptDir '..\..')).Path
$SRC = Join-Path $RepoRoot 'shared\bootstrap\agents\better.md'
$DST = Join-Path $env:USERPROFILE '.config\opencode\agents\better.md'

$MODE = if ($check) { 'check' } else { 'sync' }
$QUIET = [bool]$quiet

function Say([string]$msg) {
    if (-not $QUIET) { Write-Output $msg }
}

if (-not (Test-Path -LiteralPath $SRC -PathType Leaf)) {
    Write-Error "[better-profile] ERROR: canonical profile missing: $SRC"
    exit 1
}

# No destination → nothing to compare/sync (skip, never fail).
if (-not (Test-Path -LiteralPath $DST -PathType Leaf)) {
    if ($MODE -eq 'check') {
        Say "[better-profile] check: destination absent ($DST) — skip"
        exit 0
    }
    New-Item -ItemType Directory -Path (Split-Path -Parent $DST) -Force | Out-Null
}

if ($MODE -eq 'check') {
    $hashSrc = (Get-FileHash -LiteralPath $SRC -Algorithm SHA256).Hash
    $hashDst = (Get-FileHash -LiteralPath $DST -Algorithm SHA256).Hash
    if ($hashSrc -ne $hashDst) {
        Write-Error "[better-profile] DRIFT: run 'pwsh -File scripts/ci/sync-better-profile.ps1' to sync"
        exit 1
    }
    Say "[better-profile] check: in sync"
    exit 0
}

Copy-Item -LiteralPath $SRC -Destination $DST -Force
Say "[better-profile] synced: $DST"
exit 0
