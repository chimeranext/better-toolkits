param(
  [string]$label = "continue",
  [string]$auto = ""
)
# Thin UI prompt for Makefile.windows (between phases). Windows twin of make-prompt.sh.
if ($auto -eq "yes") { exit 0 }
$ans = Read-Host "[make] $label - continue? [y/N]"
if ($ans -match '^(y|Y)$') { exit 0 } else { Write-Output "aborted by user"; exit 1 }
