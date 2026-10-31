#!/usr/bin/env pwsh
# prune-better-toolkits-cache-cursor.ps1 — Clear ALL Cursor plugin cache for the
# better-toolkits marketplace, then re-sync (Windows/PowerShell variant).
# Use after any marketplace version bump so Cursor does not keep stale copies of any toolkit.
# The OpenCode equivalent is prune-better-toolkits-cache-opencode.sh.
#
# Slash command SSOT: /prune-better-toolkits-cache (shared/bootstrap/commands/)
#
# Deletes only these fixed directories (if they exist):
#   %USERPROFILE%\.cursor\plugins\cache\chimeranext-better-toolkits
#   %USERPROFILE%\.cursor\plugins\cache\better-toolkits
# Then runs: agent plugin marketplace update better-toolkits
#
# Logs: %USERPROFILE%\.cursor\hooks\logs\prune-better-toolkits-cache-*.out.log|err.log
# Fail-open on marketplace update errors (cache purge is the critical step).

$ErrorActionPreference = 'Stop'

if ($args.Count -gt 0) {
    Write-Error "This script takes no arguments — it always purges the full better-toolkits cache."
    Write-Error "Do not pass a single toolkit slug after a version bump; stale siblings would remain."
    exit 2
}

$LOG_DIR = Join-Path $env:USERPROFILE '.cursor\hooks\logs'
$TS = [DateTime]::UtcNow.ToString('yyyyMMddTHHmmssZ')
$OUT_LOG = Join-Path $LOG_DIR ("prune-better-toolkits-cache-{0}.out.log" -f $TS)
$ERR_LOG = Join-Path $LOG_DIR ("prune-better-toolkits-cache-{0}.err.log" -f $TS)

$CURSOR_PLUGIN_CACHE = Join-Path $env:USERPROFILE '.cursor\plugins\cache'

# Literal allowlist — never remove a path outside $CURSOR_PLUGIN_CACHE.
$MARKETPLACE_CACHE_DIRNAMES = @('chimeranext-better-toolkits', 'better-toolkits')

New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null

# Runs an external command capturing stdout and stderr (both preserved, never
# discarded). Returns @{ StdOut; StdErr; ExitCode }.
function Invoke-Capture {
    param(
        [string]$FilePath,
        [string[]]$ArgumentList
    )
    $psi = [System.Diagnostics.ProcessStartInfo]::new()
    $psi.FileName = $FilePath
    foreach ($a in $ArgumentList) { [void]$psi.ArgumentList.Add($a) }
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $p = [System.Diagnostics.Process]::new()
    $p.StartInfo = $psi
    [void]$p.Start()
    $outTask = $p.StandardOutput.ReadToEndAsync()
    $errTask = $p.StandardError.ReadToEndAsync()
    $p.WaitForExit()
    $out = $outTask.GetAwaiter().GetResult()
    $err = $errTask.GetAwaiter().GetResult()
    return @{
        StdOut   = $out.TrimEnd()
        StdErr   = $err.TrimEnd()
        ExitCode = $p.ExitCode
    }
}

function Get-MarketplaceCachePaths {
    foreach ($name in $MARKETPLACE_CACHE_DIRNAMES) {
        Join-Path $CURSOR_PLUGIN_CACHE $name
    }
}

function Assert-SafeMarketplaceCachePath([string]$target) {
    $parent = Split-Path -Parent $target
    $base = Split-Path -Leaf $target
    $resolvedCache = [IO.Path]::GetFullPath($CURSOR_PLUGIN_CACHE)
    $resolvedParent = [IO.Path]::GetFullPath($parent)
    if ($resolvedParent -ne $resolvedCache) {
        Add-Content -LiteralPath $ERR_LOG -Value "refusing purge outside Cursor plugin cache: $target"
        return $false
    }
    if ($MARKETPLACE_CACHE_DIRNAMES -notcontains $base) {
        Add-Content -LiteralPath $ERR_LOG -Value "refusing purge of unexpected cache basename: $base"
        return $false
    }
    return $true
}

function Write-LogCachedVersions([string]$root) {
    Add-Content -LiteralPath $OUT_LOG -Value "== plugin.json versions under $root (before purge) =="

    $jqCmd = Get-Command jq -ErrorAction SilentlyContinue
    if (-not $jqCmd) {
        Add-Content -LiteralPath $OUT_LOG -Value 'jq not found; skip version listing'
        return
    }

    if (-not (Test-Path -LiteralPath $root)) {
        Add-Content -LiteralPath $OUT_LOG -Value '(directory absent)'
        return
    }

    try {
        # -Force: .claude-plugin is a dot-prefixed dir; the bash original's find
        # includes dot-dirs, so recursion must not skip hidden entries.
        $pluginJsons = Get-ChildItem -LiteralPath $root -Recurse -Filter plugin.json -Force |
            Where-Object { $_.Directory.Name -eq '.claude-plugin' } |
            Sort-Object -Property FullName
    }
    catch {
        Add-Content -LiteralPath $ERR_LOG -Value $_.Exception.Message
        $pluginJsons = @()
    }

    foreach ($p in $pluginJsons) {
        $r = Invoke-Capture -FilePath $jqCmd.Source -ArgumentList @('-r', '.version // empty', $p.FullName)
        if ($r.ExitCode -ne 0 -and $r.StdErr) {
            Add-Content -LiteralPath $ERR_LOG -Value $r.StdErr
        }
        $ver = $r.StdOut
        $slug = Split-Path -Leaf (Split-Path -Parent (Split-Path -Parent $p.FullName))
        $verText = if ([string]::IsNullOrWhiteSpace($ver)) { '<missing>' } else { $ver }
        Add-Content -LiteralPath $OUT_LOG -Value "$slug $verText ($($p.FullName))"
    }
}

function Remove-MarketplaceCacheRoot([string]$target) {
    if (-not (Assert-SafeMarketplaceCachePath $target)) { return }
    if (-not (Test-Path -LiteralPath $target)) {
        Add-Content -LiteralPath $OUT_LOG -Value "skip purge (not present): $target"
        return
    }
    Add-Content -LiteralPath $OUT_LOG -Value "rm -rf $target"
    Remove-Item -LiteralPath $target -Recurse -Force
}

Add-Content -LiteralPath $OUT_LOG -Value 'scope=full-marketplace-cache-roots'
Add-Content -LiteralPath $OUT_LOG -Value "started_at=$TS"
Add-Content -LiteralPath $OUT_LOG -Value "cursor_plugin_cache=$CURSOR_PLUGIN_CACHE"

foreach ($cacheRoot in Get-MarketplaceCachePaths) {
    Write-LogCachedVersions $cacheRoot
    Remove-MarketplaceCacheRoot $cacheRoot
}

$agentCmd = Get-Command agent -ErrorAction SilentlyContinue
if ($agentCmd) {
    Add-Content -LiteralPath $OUT_LOG -Value 'agent plugin marketplace update better-toolkits'
    # Fail-open: fold stdout+stderr into the SAME sink (OUT_LOG).
    $r = Invoke-Capture -FilePath $agentCmd.Source -ArgumentList @('plugin', 'marketplace', 'update', 'better-toolkits')
    if ($r.StdOut) { Add-Content -LiteralPath $OUT_LOG -Value $r.StdOut }
    if ($r.StdErr) { Add-Content -LiteralPath $OUT_LOG -Value $r.StdErr }
    if ($r.ExitCode -eq 0) {
        Add-Content -LiteralPath $OUT_LOG -Value 'marketplace update: ok'
    }
    else {
        Add-Content -LiteralPath $OUT_LOG -Value 'marketplace update: failed (see err log); cache already cleared'
        Add-Content -LiteralPath $ERR_LOG -Value "marketplace update exited $($r.ExitCode)"
    }
}
else {
    Add-Content -LiteralPath $OUT_LOG -Value 'agent CLI not on PATH; skipped marketplace update'
}

$wiped = "Wiped $CURSOR_PLUGIN_CACHE\chimeranext-better-toolkits $CURSOR_PLUGIN_CACHE\better-toolkits"
Add-Content -LiteralPath $OUT_LOG -Value $wiped
Write-Output $wiped
Add-Content -LiteralPath $OUT_LOG -Value 'done — re-enable or reinstall toolkits in Cursor if skills/commands are missing'

exit 0
