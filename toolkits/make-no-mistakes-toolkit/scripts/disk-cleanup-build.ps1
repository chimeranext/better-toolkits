# disk-cleanup-build.ps1 — Windows (PowerShell) build-artifacts stage.
#
# Peer of the bash `build-artifacts` stage in disk-cleanup.sh. Discovers
# authentic git repos (dirs containing .git), honours $HOME\Documentos\GitHub if
# present, and scans for regenerable build artifacts (node_modules, target, dist,
# build, .cache). Skips symlinks and system dirs. Never deletes source/tracked
# files; these are regenerable from lockfiles/builds.
#
# Usage:
#   powershell -File disk-cleanup-build.ps1 -ListOnly
#   powershell -File disk-cleanup-build.ps1 -Apply
param(
    [switch]$ListOnly,
    [switch]$Apply
)

$ErrorActionPreference = 'SilentlyContinue'
$ROOT = '/'
if ($env:BUILD_SCAN_ROOT) { $ROOT = $env:BUILD_SCAN_ROOT }

# 1. Discover auth git repos (maxdepth 5, skip system dirs).
$systemDirs = 'proc|sys|dev|run|tmp|snap|usr|Windows|Program Files|AppData'
$repos = Get-ChildItem -Path $ROOT -Directory -Recurse -Depth 5 -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -eq '.git' -and $_.FullName -notmatch $systemDirs } |
    ForEach-Object { $_.Parent.FullName } |
    Sort-Object -Unique

if (Test-Path (Join-Path $HOME 'Documentos\GitHub')) {
    $repos += (Join-Path $HOME 'Documentos\GitHub')
    $repos = $repos | Sort-Object -Unique
}

# 2. Build artifact names.
$artifactNames = 'node_modules','target','dist','build','.cache'

# 3. Collect artifact dirs within repos.
$artifacts = @()
foreach ($repo in $repos) {
    if (-not $repo) { continue }
    foreach ($name in $artifactNames) {
        Get-ChildItem -Path $repo -Directory -Recurse -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -eq $name -and -not $_.LinkType -and -not ($_.FullName -match '\node_modules\') } |
            ForEach-Object { $artifacts += $_.FullName }
    }
}
$artifacts = $artifacts | Sort-Object -Unique

# 4. Sum sizes (best effort; skip unreadable).
$total = 0
foreach ($a in $artifacts) {
    $sz = (Get-ChildItem -Path $a -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    if ($sz) { $total += [long]$sz }
}

Write-Host "Scan root:  $ROOT"
Write-Host "Repos descubiertos: $($repos.Count)"
Write-Host "Artifact dirs found: $($artifacts.Count) ($([math]::Round($total/1MB,1)) MB)"

if ($artifacts.Count -eq 0) {
    Write-Host "no build/target artifacts found under $ROOT"
    exit 0
}

if ($ListOnly) {
    Write-Host "LIST ONLY — nothing removed. Use -Apply to remove them."
    $artifacts | ForEach-Object { Write-Host "  $_" }
    exit 0
}

if ($Apply) {
    foreach ($a in $artifacts) {
        Write-Host "removing $a"
        Remove-Item -Path $a -Recurse -Force -ErrorAction SilentlyContinue
    }
}

exit 0
