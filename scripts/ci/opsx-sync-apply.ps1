#!/usr/bin/env pwsh
# opsx-sync-apply.ps1 — apply delta specs into main specs (shared engine, Windows).
#
# Equivalent of scripts/ci/opsx-sync-apply.sh — used by BOTH /opsx-sync and
# /sweep-unstaged (mandatory when drift detected). Applies the delta of every
# active change under openspec/changes/ into openspec/specs/ WITHOUT archiving.
#
# Rules (per OpenSpec OPSX delta-spec merge):
#   - main spec missing        -> copy delta -> main (ADD)
#   - main spec exists, drift  -> replace main content with delta (UPDATE)
#   - `## REMOVED` section     -> strip that block from the main spec
#
# Usage: pwsh -File scripts/ci/opsx-sync-apply.ps1 [--change <slug>] [--root <path>]
# Exit: 0 ok; 1 failure or ambiguous.

param(
    [string]$change = "",
    [string]$root = ""
)

$ErrorActionPreference = 'Stop'

if ($root) {
    $RepoRoot = $root
} else {
    $RepoRoot = (& git rev-parse --show-toplevel) | Select-Object -First 1
}

$ChangesDir = Join-Path $RepoRoot 'openspec\changes'
$SpecsDir = Join-Path $RepoRoot 'openspec\specs'

if (-not (Test-Path -LiteralPath $ChangesDir) -or -not (Test-Path -LiteralPath $SpecsDir)) {
    Write-Error "opsx-sync-apply: repo has no openspec/changes or openspec/specs (skip)"
    exit 0
}

# Resolve change dirs: explicit change, else every change with a specs/ dir.
if ($change) {
    $ChangeDir = Join-Path $ChangesDir $change
    if (-not (Test-Path -LiteralPath $ChangeDir)) {
        Write-Error "opsx-sync-apply: unknown change: $change"
        exit 1
    }
    $ChangeDirs = @($ChangeDir)
} else {
    $ChangeDirs = Get-ChildItem -LiteralPath $ChangesDir -Directory |
        Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'specs') } |
        ForEach-Object { $_.FullName }
}

$FAIL = 0
$APPLIED = 0

function Apply-Delta {
    param([string]$Delta, [string]$ChangeDir)

    if (-not (Test-Path -LiteralPath $Delta -PathType Leaf)) { return }

    $rel = $Delta.Substring($ChangeDir.Length + 1)   # specs/<domain>/spec.md
    $domainRel = $rel.Substring('specs'.Length + 1)  # <domain>/spec.md
    $mainSpec = Join-Path $SpecsDir $domainRel
    $tmp = [System.IO.Path]::GetTempFileName()

    $raw = Get-Content -LiteralPath $Delta -Raw -ErrorAction SilentlyContinue
    if ($null -eq $raw) {
        Write-Error "FAIL   read delta $Delta"
        $script:FAIL = 1
        Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
        return
    }
    # Strip from `## REMOVED` onward (both ADD and UPDATE).
    $idx = $raw.IndexOf('## REMOVED')
    if ($idx -ge 0) { $raw = $raw.Substring(0, $idx) }

    if (-not (Test-Path -LiteralPath $mainSpec -PathType Leaf)) {
        # ADD
        $dir = Split-Path -Parent $mainSpec
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Set-Content -LiteralPath $mainSpec -Value $raw -Encoding UTF8
        $script:APPLIED += 1
        Write-Output "ADD    $domainRel"
    } elseif (-not (Compare-Spec $Delta $mainSpec)) {
        # UPDATE
        Set-Content -LiteralPath $mainSpec -Value $raw -Encoding UTF8
        $script:APPLIED += 1
        Write-Output "UPDATE $domainRel"
    }
    Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
}

function Compare-Spec {
    param([string]$A, [string]$B)
    $ca = (Get-FileHash -LiteralPath $A -Algorithm SHA256).Hash
    $cb = (Get-FileHash -LiteralPath $B -Algorithm SHA256).Hash
    return ($ca -eq $cb)
}

foreach ($cdir in $ChangeDirs) {
    Get-ChildItem -LiteralPath (Join-Path $cdir 'specs') -Recurse -Filter 'spec.md' -File |
        ForEach-Object { Apply-Delta -Delta $_.FullName -ChangeDir $cdir }
}

if ($FAIL -ne 0) {
    Write-Error "opsx-sync-apply: FAILURES — partial apply."
    exit 1
}
Write-Output "opsx-sync-apply: applied=$APPLIED"
exit 0
