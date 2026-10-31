#!/usr/bin/env pwsh
# HITL approval helper for main pushes — better-toolkits (Windows/PowerShell).
# Creates the elevated marker that the pre-push guard requires.
#
# On Windows the marker lives under %ProgramData% (only writable by an elevated
# process), so creating it requires a UAC elevation prompt — the analog of the
# Unix root-owned marker created via sudo/pkexec. A non-elevated agent cannot
# create it, which preserves the deterministic HITL gate.
#
# Usage (Windows):
#   powershell -ExecutionPolicy Bypass -File scripts/git-hooks/hitl-approve-main-push.ps1
#
# After approval, the marker persists at:
#   %ProgramData%\better-toolkits\hitl-approve-main-push
# Revoke when done:
#   powershell -ExecutionPolicy Bypass -File scripts/git-hooks/hitl-revoke-main-push.ps1

[CmdletBinding()]
param(
    [switch]$Elevated
)

if (-not $IsWindows) {
    Write-Error "[hitl-approve] ERROR: this is the Windows/PowerShell variant; run the .sh on POSIX."
    exit 1
}

$marker = Join-Path $env:ProgramData 'better-toolkits\hitl-approve-main-push'
$markerDir = Split-Path -Parent $marker

function Test-IsElevated {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = [Security.Principal.WindowsPrincipal]::new($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Write-ApprovalMarker {
    New-Item -ItemType Directory -Path $markerDir -Force | Out-Null
    New-Item -ItemType File -Path $marker -Force | Out-Null
}

Write-Output "[hitl-approve] This approves a push/merge to 'main' for better-toolkits."
Write-Output "[hitl-approve] Creating elevated marker at: $marker"

if (-not (Test-IsElevated)) {
    # Refuse to loop: if the elevated re-run still is not elevated, it must fail.
    if ($Elevated) {
        Write-Error "[hitl-approve] ERROR: elevation did not take effect; cannot create elevated marker (UAC may be disabled)."
        exit 1
    }
    Write-Output "[hitl-approve] Not running elevated; requesting UAC elevation to create the marker."
    try {
        Start-Process -FilePath (Get-Process -Id $PID).Path `
            -ArgumentList @('-NoProfile', '-File', "`"$PSCommandPath`"", '-Elevated') `
            -Verb RunAs -Wait
    }
    catch {
        Write-Error "[hitl-approve] ERROR: elevation failed or was declined. Cannot create elevated marker."
        exit 1
    }
}
else {
    try {
        Write-ApprovalMarker
    }
    catch {
        Write-Error "[hitl-approve] ERROR: failed to create marker: $($_.Exception.Message)"
        exit 1
    }
}

if (Test-Path -LiteralPath $marker) {
    Write-Output "[hitl-approve] OK: elevated marker created. You may now push/merge to main."
    exit 0
}

Write-Error "[hitl-approve] ERROR: marker not created. Push to main remains BLOCKED."
exit 1
