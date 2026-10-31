#!/usr/bin/env pwsh
# HITL revocation helper (Windows/PowerShell) — removes the main-push approval marker.
# Usage: powershell -ExecutionPolicy Bypass -File scripts/git-hooks/hitl-revoke-main-push.ps1

[CmdletBinding()]
param(
    [switch]$Elevated
)

if (-not $IsWindows) {
    Write-Error "[hitl-revoke] ERROR: this is the Windows/PowerShell variant; run the .sh on POSIX."
    exit 1
}

$marker = Join-Path $env:ProgramData 'better-toolkits\hitl-approve-main-push'

function Test-IsElevated {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = [Security.Principal.WindowsPrincipal]::new($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-Path -LiteralPath $marker)) {
    Write-Output "[hitl-revoke] No marker present (already revoked)."
    exit 0
}

if (-not (Test-IsElevated)) {
    if ($Elevated) {
        Write-Error "[hitl-revoke] ERROR: elevation did not take effect; cannot remove the elevated marker."
        exit 1
    }
    Write-Output "[hitl-revoke] Not running elevated; requesting UAC elevation to remove the marker."
    try {
        Start-Process -FilePath (Get-Process -Id $PID).Path `
            -ArgumentList @('-NoProfile', '-File', "`"$PSCommandPath`"", '-Elevated') `
            -Verb RunAs -Wait
    }
    catch {
        Write-Error "[hitl-revoke] ERROR: elevation failed or was declined. Marker still present."
        exit 1
    }
}

if (Test-Path -LiteralPath $marker) {
    try {
        Remove-Item -LiteralPath $marker -Force
    }
    catch {
        Write-Error "[hitl-revoke] ERROR: failed to remove marker: $($_.Exception.Message)"
        exit 1
    }
}

if (Test-Path -LiteralPath $marker) {
    Write-Error "[hitl-revoke] ERROR: marker still present. Pushes to main remain BLOCKED."
    exit 1
}

Write-Output "[hitl-revoke] OK: approval marker removed. Pushes to main are BLOCKED again."
exit 0
