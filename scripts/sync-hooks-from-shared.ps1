# Sync shared/hooks/<mod> into every toolkit (vendored for independent publish).
# SSOT: shared/hooks is the single source; toolkits keep generated copies.
param(
  [string[]]$Mods = @('stderr','prds','no-squash')
)
$srcBase = Join-Path $PSScriptRoot '../shared/hooks'
foreach ($mod in $Mods) {
  $src = Join-Path $srcBase $mod
  if (-not (Test-Path $src)) { Write-Host "skip: no shared/hooks/$mod"; continue }
  Get-ChildItem (Join-Path $PSScriptRoot '../toolkits') -Directory | ForEach-Object {
    $dest = Join-Path $_.FullName "hooks/$mod"
    Remove-Item -Recurse -Force $dest -ErrorAction SilentlyContinue
    Copy-Item -Recurse $src $dest
  }
  Write-Host "synced hooks/$mod"
}
