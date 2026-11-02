# Install the better-toolkits layer for OpenCode (harness already installed).
# One-liner (PowerShell): irm https://toolkits.chimeranext.dev/install-opencode.ps1 | iex
$ErrorActionPreference = "Stop"

$configDir = if ($env:OPENCODE_CONFIG_DIR) { $env:OPENCODE_CONFIG_DIR } else { Join-Path $HOME ".config/opencode" }
$config = Join-Path $configDir "opencode.json"
$catalog = "https://toolkits.chimeranext.dev/opencode/skills/"

New-Item -ItemType Directory -Force -Path $configDir | Out-Null
Write-Host "[opencode] config: $config"

if (-not (Test-Path $config)) {
  $doc = @{ '$schema' = "https://opencode.ai/config.json"; skills = @($catalog) }
  $doc | ConvertTo-Json -Depth 4 | Set-Content -Path $config -Encoding UTF8
  Write-Host "[opencode] created config with skills catalog"
} else {
  $doc = Get-Content $config -Raw | ConvertFrom-Json
  if ($doc.skills -notcontains $catalog) {
    $doc.skills += $catalog
    ($doc | ConvertTo-Json -Depth 6) | Set-Content -Path $config -Encoding UTF8
  }
  Write-Host "[opencode] skills catalog ensured"
}

Write-Host "[opencode] done. Restart OpenCode to load the catalog."
