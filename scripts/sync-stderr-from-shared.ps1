#!/usr/bin/env pwsh
# Sync shared/hooks/stderr into every toolkit (vendored for independent publish).
# Windows/PowerShell variant of scripts/sync-stderr-from-shared.sh.

$ErrorActionPreference = 'Stop'

$ROOT = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$SRC = Join-Path $ROOT 'shared\hooks\stderr'

if (-not (Test-Path -LiteralPath $SRC -PathType Container)) {
    Write-Error "sync-stderr: shared source missing: $SRC"
    exit 1
}

foreach ($tk in (Get-ChildItem -LiteralPath (Join-Path $ROOT 'toolkits') -Directory)) {
    $dest = Join-Path $tk.FullName 'hooks\stderr'

    if (Test-Path -LiteralPath $dest) {
        Remove-Item -LiteralPath $dest -Recurse -Force
    }
    New-Item -ItemType Directory -Path (Join-Path $tk.FullName 'hooks') -Force | Out-Null
    Copy-Item -LiteralPath $SRC -Destination $dest -Recurse -Force

    Write-Output "synced $($tk.Name)"
}

exit 0
