param(
  [string]$label = "continuar",
  [string]$auto = ""
)
# Thin UI prompt for Makefile.windows (between phases). Windows twin of make-prompt.sh.
if ($auto -eq "yes") { exit 0 }
$ans = Read-Host "[make] $label — ¿continuar? [s/N]"
if ($ans -match '^(s|S|y|Y)$') { exit 0 } else { Write-Host "abortado por el usuario"; exit 1 }
