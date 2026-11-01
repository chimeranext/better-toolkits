#!/usr/bin/env pwsh
# sweep-unstaged.ps1 — ground-truth sweep (Windows). Port of sweep-unstaged.sh.
#
# For every worktree of the repo:
#   1. uncommitted   — `git status --porcelain` non-empty (untracked included)
#   2. unpushed      — `git rev-list --count origin/<branch>..HEAD` > 0, or
#                      no origin/<branch>
#   3. PR coverage   — open, non-draft PR with mergeable=MERGEABLE
#   4. OpenSpec drift — every active change's delta spec reflected in main specs
#
# Exit: 0 if every worktree is clean; 1 otherwise. Always prints a report.
# MANDATORY: if OpenSpec drift is detected, invokes opsx-sync-apply.ps1 on
# each affected worktree (shared engine with /opsx-sync) before the verdict.
#
# Usage: pwsh -File scripts/ci/sweep-unstaged.ps1 [-Json]
# Never discards stderr; no redirections to null.

param(
    [switch]$Json
)

$ErrorActionPreference = 'Stop'

function Say([string]$msg) {
    if (-not $Json) { Write-Output $msg }
}
function Emit-Json([string]$obj) {
    if ($Json) { Write-Output $obj }
}

$RepoRoot = (& git rev-parse --show-toplevel) | Select-Object -First 1
$DIRTY = 0
$OpenSpecSyncNeeded = 0
$DriftWorktrees = [System.Collections.Generic.List[string]]::new()

# Parse the porcelain stream into one object per worktree.
$blocks = [System.Collections.Generic.List[object]]::new()
$cur = $null

foreach ($line in (& git worktree list --porcelain)) {
    if ($line -like 'worktree *') {
        if ($null -ne $cur) { $blocks.Add($cur) }
        $cur = [ordered]@{ path = $line.Substring('worktree '.Length); branch = ''; head = ''; locked = $false }
    } elseif ($line -like 'branch *') {
        $cur.branch = $line.Substring('branch '.Length) -replace '^refs/heads/', ''
    } elseif ($line -like 'HEAD *') {
        $cur.head = $line.Substring('HEAD '.Length)
    } elseif ($line -eq 'locked') {
        $cur.locked = $true
    }
}
if ($null -ne $cur) { $blocks.Add($cur) }

foreach ($wt in $blocks) {
    $w = $wt.path
    $br = $wt.branch

    # 1. uncommitted
    $uncommitted = 0
    $statusOut = & git -C $w status --porcelain 2>&1
    if ($LASTEXITCODE -ne 0) { $uncommitted = 1 } else { if ($statusOut) { $uncommitted = 1 } }

    # 2. unpushed (vs origin/<branch>)
    $unpushed = 0
    $originRef = ''
    if ($br) {
        & git rev-parse --verify --quiet "refs/remotes/origin/$br" 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $originRef = "origin/$br"
            $n = & git -C $w rev-list --count "origin/$br..HEAD" 2>&1
            if ($LASTEXITCODE -eq 0) {
                try { if ([int]$n -gt 0) { $unpushed = 1 } } catch { $unpushed = 0 }
            } else { $unpushed = 0 }
        } else {
            $unpushed = 1   # no origin/<branch> => cannot have pushed
        }
    } else {
        $unpushed = 1
    }

    # 3. PR coverage
    $prNum = '?'; $prDraft = 'unknown'; $prMergeable = 'unknown'
    if ($br) {
        $pr = & gh pr list --head $br --state open --json number,isDraft,mergeable --jq '.[0] // empty' 2>&1
        if ($LASTEXITCODE -eq 0 -and $pr -and $pr -ne '') {
            $obj = $pr | ConvertFrom-Json
            $prNum = "$($obj.number)"
            $prDraft = "$($obj.isDraft)".ToLower()
            $prMergeable = "$($obj.mergeable)"
        }
    }

    # 4. OpenSpec drift
    $openspecDrift = 0
    $driftDetail = ''
    $changesDir = Join-Path $w 'openspec\changes'
    if (Test-Path -LiteralPath $changesDir) {
        $specsDir = Join-Path $w 'openspec\specs'
        Get-ChildItem -LiteralPath $changesDir -Recurse -Filter 'spec.md' -File |
            Where-Object { $_.FullName -like '*\specs\*\spec.md' } |
            ForEach-Object {
                $delta = $_.FullName
                $rel = $delta.Substring($changesDir.Length + 1)   # <change>/specs/<domain>/spec.md
                $domainRel = ($rel -split '/specs/')[1]           # <domain>/spec.md
                $mainSpec = Join-Path $specsDir $domainRel
                if (-not (Test-Path -LiteralPath $mainSpec -PathType Leaf)) {
                    $script:openspecDrift = 1
                    $driftDetail += " missing:$rel"
                } else {
                    $h1 = (Get-FileHash -LiteralPath $delta -Algorithm SHA256).Hash
                    $h2 = (Get-FileHash -LiteralPath $mainSpec -Algorithm SHA256).Hash
                    if ($h1 -ne $h2) {
                        $script:openspecDrift = 1
                        $driftDetail += " drift:$rel"
                    }
                }
            }
    }

    # verdict
    $verdict = 'CLEAN'
    if ($uncommitted -eq 1) { $verdict = 'DIRTY'; $script:DIRTY = 1 }
    if ($unpushed -eq 1) { $verdict = 'DIRTY'; $script:DIRTY = 1 }
    if ($prNum -eq '?' -or $prDraft -eq 'true' -or ($prMergeable -ne 'MERGEABLE' -and $prMergeable -ne 'true')) {
        $verdict = 'DIRTY'; $script:DIRTY = 1
    }
    if ($openspecDrift -eq 1) {
        $verdict = 'DIRTY'; $script:DIRTY = 1
        $script:OpenSpecSyncNeeded = 1
        if (-not $DriftWorktrees.Contains($w)) { $DriftWorktrees.Add($w) }
    }

    Say "worktree: $w"
    Say "  branch:      $br"
    Say "  origin-branch: $([string]$originRef)"
    Say "  uncommitted: $uncommitted"
    Say "  unpushed:    $unpushed"
    Say "  PR:          $prNum (draft=$prDraft, mergeable=$prMergeable)"
    if ($openspecDrift -eq 1) {
        Say "  openspec:    DRIFT$driftDetail"
    } else {
        Say "  openspec:    clean"
    }
    Say "  verdict:     $verdict"
    Say ""
    Emit-Json "{`"worktree`":`"$w`",`"branch`":`"$br`",`"uncommitted`":$uncommitted,`"unpushed`":$unpushed,`"pr`":`"$prNum`",`"draft`":`"$prDraft`",`"mergeable`":`"$prMergeable`",`"verdict`":`"$verdict`"}"
}

# MANDATORY OpenSpec sync
if ($OpenSpecSyncNeeded -eq 1) {
    foreach ($w in $DriftWorktrees) {
        Say "SWEEP: OpenSpec drift in $w — applying mandatory sync (opsx-sync-apply)."
        & pwsh -File (Join-Path $PSScriptRoot 'opsx-sync-apply.ps1') --root $w
        if ($LASTEXITCODE -ne 0) {
            Write-Error "SWEEP: OpenSpec sync FAILED for $w — fix before continuing."
            exit 1
        }
    }
    Say "SWEEP: OpenSpec sync applied."
}

if ($DIRTY -eq 1) {
    Say "SWEEP: DIRTY — work left uncommitted, unpushed, or uncovered by a ready PR."
    exit 1
}
Say "SWEEP: CLEAN — nothing uncommitted, unpushed, or PR-uncovered."
exit 0
