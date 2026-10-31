#!/usr/bin/env pwsh
# sync-better-profile.ps1 — repo-canonical → user runtime profile sync (Windows, multi-harness).
#
# Canonical source of truth: <repo>/shared/bootstrap/agents/better.md
# Runtime destinations:
#   OpenCode: $HOME/.config/opencode/agents/better.md
#   Claude:   $HOME/.claude/agents/better.md
#   Cursor:   $HOME/.cursor/agents/better.md
#
# Each destination is generated from the canonical profile with a per-harness
# frontmatter conversion (scripts/ci/sync-better-profile-generate.py).
#
# Modes (PowerShell uses single-dash switches):
#   (default)  sync  — sync all destinations (idempotent)
#   -check    check — exit 1 if any destination differs from canonical (drift)
#   -quiet           — suppress output
#   -harness <h>    — restrict to opencode|claude|cursor (default: all)
#
# The check is machine-local: if a destination path does not exist, that harness
# is skipped (nothing to compare) so CI/other machines never fail on a missing
# user config. Never discard stderr; no redirections to null.

param(
    [switch]$check,
    [switch]$quiet,
    [string]$harness = ""
)

$ErrorActionPreference = 'Stop'

$ScriptDir = $PSScriptRoot
$RepoRoot = (Resolve-Path (Join-Path $ScriptDir '..\..')).Path
$SRC = Join-Path $RepoRoot 'shared\bootstrap\agents\better.md'
$GENERATE = Join-Path $ScriptDir 'sync-better-profile-generate.py'

$MODE = if ($check) { 'check' } else { 'sync' }
$QUIET = [bool]$quiet

$HARNESSES = if ($harness) { @($harness) } else { @('opencode','claude','cursor') }
$DST = @{
    opencode = Join-Path $env:USERPROFILE '.config\opencode\agents\better.md'
    claude   = Join-Path $env:USERPROFILE '.claude\agents\better.md'
    cursor   = Join-Path $env:USERPROFILE '.cursor\agents\better.md'
}

function Say([string]$msg) {
    if (-not $QUIET) { Write-Output $msg }
}

if (-not (Test-Path -LiteralPath $SRC -PathType Leaf)) {
    Write-Error "[better-profile] ERROR: canonical profile missing: $SRC"
    exit 1
}
if (-not (Test-Path -LiteralPath $GENERATE -PathType Leaf)) {
    Write-Error "[better-profile] ERROR: generator missing: $GENERATE"
    exit 1
}

$tmpDir = Join-Path ([System.IO.Path]::GetTempPath()) ("better-profile-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tmpDir | Out-Null

$FAIL = 0
foreach ($h in $HARNESSES) {
    $out = Join-Path $tmpDir ("better-$h.md")
    & python3 $GENERATE --harness $h --src $SRC --out $out
    if ($LASTEXITCODE -ne 0) {
        Write-Error "[better-profile] ERROR: generate failed for $h"
        $FAIL = 1
        continue
    }
    if (-not $DST.ContainsKey($h)) {
        Write-Error "[better-profile] ERROR: unknown harness $h"
        $FAIL = 1
        continue
    }
    $dst = $DST[$h]
    # No destination → nothing to compare/sync (skip, never fail).
    if (-not (Test-Path -LiteralPath $dst -PathType Leaf)) {
        if ($MODE -eq 'check') {
            Say "[better-profile] check: $h destination absent ($dst) — skip"
            continue
        }
        New-Item -ItemType Directory -Path (Split-Path -Parent $dst) -Force | Out-Null
    }
    if ($MODE -eq 'check') {
        $hashSrc = (Get-FileHash -LiteralPath $out -Algorithm SHA256).Hash
        $hashDst = (Get-FileHash -LiteralPath $dst -Algorithm SHA256).Hash
        if ($hashSrc -ne $hashDst) {
            Write-Error "[better-profile] DRIFT ($h): run 'pwsh -File scripts/ci/sync-better-profile.ps1' to sync"
            $FAIL = 1
        } else {
            Say "[better-profile] check: $h in sync"
        }
    } else {
        Copy-Item -LiteralPath $out -Destination $dst -Force
        Say "[better-profile] synced: $dst"
    }
}

Remove-Item -LiteralPath $tmpDir -Recurse -Force -ErrorAction SilentlyContinue
if ($FAIL -ne 0) { exit 1 }
exit 0
