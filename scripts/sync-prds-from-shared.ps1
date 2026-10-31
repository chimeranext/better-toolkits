#!/usr/bin/env pwsh
# Sync shared/hooks/prds into every toolkit (vendored for independent publish).
# Windows/PowerShell variant of scripts/sync-prds-from-shared.sh.

$ErrorActionPreference = 'Stop'

$ROOT = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$SRC = Join-Path $ROOT 'shared\hooks\prds'

if (-not (Test-Path -LiteralPath $SRC -PathType Container)) {
    Write-Error "sync-prds: shared source missing: $SRC"
    exit 1
}

foreach ($tk in (Get-ChildItem -LiteralPath (Join-Path $ROOT 'toolkits') -Directory)) {
    $dest = Join-Path $tk.FullName 'hooks\prds'

    if (Test-Path -LiteralPath $dest) {
        Remove-Item -LiteralPath $dest -Recurse -Force
    }
    New-Item -ItemType Directory -Path (Join-Path $tk.FullName 'hooks') -Force | Out-Null
    Copy-Item -LiteralPath $SRC -Destination $dest -Recurse -Force

    # Remove __pycache__ trees (mirrors: find ... -exec rm -rf {} + || true)
    $pycache = Get-ChildItem -LiteralPath $dest -Recurse -Directory -Filter '__pycache__' -ErrorAction SilentlyContinue
    foreach ($py in $pycache) {
        Remove-Item -LiteralPath $py.FullName -Recurse -Force
    }

    # chmod +x has no Windows equivalent; Git for Windows/bash consumers rely on
    # the interpreter, not a POSIX file mode.
    Write-Output "synced $($tk.Name)"
}

exit 0
