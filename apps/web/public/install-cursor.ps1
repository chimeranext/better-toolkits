# Install the better-toolkits layer for Cursor (harness already installed).
# One-liner (PowerShell): irm https://toolkits.chimeranext.dev/install-cursor.ps1 | iex
#
# Design (parity with install-cursor.sh):
# - No dependency on a developer clone under Documents/GitHub.
# - Custom MCPs: SSOT is shared/mcp in the monorepo; published as
#   https://toolkits.chimeranext.dev/mcp/<name>.tar.gz (same assets as OpenCode).
#   Installed under ~/.local/share/better-toolkits/mcp and registered in
#   ~/.cursor/mcp.json — not from agent marketplace cache.
# - Optional shallow clone under ~/.local/share/better-toolkits/src for hooks +
#   /refresh (BETTER_TOOLKITS_ROOT override supported).
# - Never silence stderr (/dev/null, Out-Null on failures, 2>$null).
$ErrorActionPreference = "Stop"

$MarketplaceUrl = "https://github.com/chimeranext/better-toolkits"
$ShareRoot = Join-Path $HOME ".local/share/better-toolkits"
$CloneDir = if ($env:BETTER_TOOLKITS_ROOT) { $env:BETTER_TOOLKITS_ROOT } else { Join-Path $ShareRoot "src" }
$McpBase = "https://toolkits.chimeranext.dev/mcp"
$McpDest = Join-Path $ShareRoot "mcp"
$McpServers = @(
  "notion-chimeranext"
  "posthog-chimeranext"
  "google-workspace-apps"
  "social-media-ads-mcp"
  "stitch-chimeranext"
)
$CursorHooksDir = Join-Path $HOME ".cursor/hooks"
$CursorHooksJson = Join-Path $HOME ".cursor/hooks.json"
$CursorMcpJson = Join-Path $HOME ".cursor/mcp.json"
$UpdateScriptName = "update-better-toolkits-marketplace-cursor.sh"

$SkipAutoUpdate = $false
if ($env:BETTER_TOOLKITS_AUTO_UPDATE -eq "0") { $SkipAutoUpdate = $true }
foreach ($arg in $args) {
  if ($arg -eq "--no-auto-update") { $SkipAutoUpdate = $true }
}

function Test-CommandExists {
  param([Parameter(Mandatory = $true)][string]$Name)
  # Prefer Get-Command exit via $null check; do not redirect stderr to $null.
  return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Ensure-Marketplace {
  if (-not (Test-CommandExists "agent")) {
    Write-Output "[cursor] WARN: 'agent' CLI not on PATH — skip marketplace registration"
    Write-Output "[cursor]        Add marketplace in Cursor Desktop: $MarketplaceUrl"
    return
  }
  Write-Output "[cursor] ensure marketplace $MarketplaceUrl"
  # Prefer update (idempotent). Fall back to add with full URL (agent 2026.11+).
  try {
    & agent plugin marketplace update $MarketplaceUrl
    if ($LASTEXITCODE -eq 0) {
      Write-Output "[cursor] marketplace updated"
      return
    }
  } catch {
    Write-Output "[cursor] marketplace update (URL) threw: $($_.Exception.Message)"
  }
  try {
    & agent plugin marketplace update better-toolkits
    if ($LASTEXITCODE -eq 0) {
      Write-Output "[cursor] marketplace updated (by name)"
      return
    }
  } catch {
    Write-Output "[cursor] marketplace update (name) threw: $($_.Exception.Message)"
  }
  try {
    & agent plugin marketplace add $MarketplaceUrl
    if ($LASTEXITCODE -eq 0) {
      Write-Output "[cursor] marketplace added"
      return
    }
  } catch {
    Write-Output "[cursor] marketplace add threw: $($_.Exception.Message)"
  }
  Write-Output "[cursor] WARN: marketplace add/update failed — add $MarketplaceUrl in Desktop UI"
}

function Ensure-Clone {
  $parent = Split-Path -Parent $CloneDir
  if (-not (Test-Path $parent)) {
    [void](New-Item -ItemType Directory -Force -Path $parent)
  }
  $marketplaceJson = Join-Path $CloneDir ".claude-plugin/marketplace.json"
  if (Test-Path $marketplaceJson) {
    Write-Output "[cursor] clone present: $CloneDir"
    return $true
  }
  if ((Test-Path $CloneDir) -and -not (Test-Path (Join-Path $CloneDir ".git"))) {
    Write-Output "[cursor] WARN: $CloneDir exists but is not a git clone — set BETTER_TOOLKITS_ROOT"
    return $false
  }
  if (-not (Test-CommandExists "git")) {
    Write-Output "[cursor] WARN: git not on PATH — cannot shallow clone"
    return $false
  }
  Write-Output "[cursor] shallow clone -> $CloneDir"
  & git clone --depth 1 --branch main "$MarketplaceUrl.git" $CloneDir
  if ($LASTEXITCODE -ne 0) {
    Write-Output "[cursor] WARN: git clone failed (exit $LASTEXITCODE)"
    return $false
  }
  return $true
}

function Install-HooksFromClone {
  $srcBi = Join-Path $CloneDir "shared/hooks/bilingual/adapters/cursor-before-shell.sh"
  $srcUpd = Join-Path $CloneDir "shared/bootstrap/scripts/$UpdateScriptName"
  if (-not (Test-Path $CursorHooksDir)) {
    [void](New-Item -ItemType Directory -Force -Path $CursorHooksDir)
  }
  if (Test-Path $srcBi) {
    Copy-Item $srcBi (Join-Path $CursorHooksDir "cursor-before-shell.sh") -Force
    Write-Output "[cursor] bilingual hook -> $CursorHooksDir/cursor-before-shell.sh"
  } else {
    Write-Output "[cursor] WARN: bilingual adapter missing in clone"
  }
  if (Test-Path $srcUpd) {
    Copy-Item $srcUpd (Join-Path $CursorHooksDir $UpdateScriptName) -Force
    Write-Output "[cursor] auto-update script -> $CursorHooksDir/$UpdateScriptName"
  } else {
    Write-Output "[cursor] WARN: $UpdateScriptName missing in clone"
  }
}

function Wire-WorkspaceOpen {
  if ($SkipAutoUpdate) {
    Write-Output "[cursor] skip workspaceOpen auto-update (--no-auto-update / BETTER_TOOLKITS_AUTO_UPDATE=0)"
    return
  }
  $scriptPath = Join-Path $CursorHooksDir $UpdateScriptName
  if (-not (Test-Path $scriptPath)) {
    Write-Output "[cursor] WARN: cannot wire workspaceOpen — update script missing"
    return
  }
  # Cursor hooks expect a bash-invokable command (same as install-cursor.sh).
  $cmd = "bash $scriptPath"
  $doc = @{ version = 1; hooks = @{} }
  if (Test-Path $CursorHooksJson) {
    $doc = Get-Content -Raw -Path $CursorHooksJson | ConvertFrom-Json
  }
  if (-not $doc.hooks) {
    $doc | Add-Member -NotePropertyName hooks -NotePropertyValue ([pscustomobject]@{}) -Force
  }
  $hooksObj = $doc.hooks
  $entries = @()
  if ($hooksObj.PSObject.Properties.Name -contains "workspaceOpen" -and $null -ne $hooksObj.workspaceOpen) {
    foreach ($e in @($hooksObj.workspaceOpen)) {
      if ($e -is [string]) {
        $entries += [pscustomobject]@{ command = $e }
      } else {
        $entries += $e
      }
    }
  }
  $already = $false
  foreach ($e in $entries) {
    if ($e.command -eq $cmd) { $already = $true; break }
  }
  if ($already) {
    Write-Output "[cursor] workspaceOpen already has $cmd"
    return
  }
  $entries += [pscustomobject]@{ command = $cmd }
  $hooksHash = @{}
  foreach ($p in $hooksObj.PSObject.Properties) {
    $hooksHash[$p.Name] = $p.Value
  }
  $hooksHash["workspaceOpen"] = $entries
  $out = [ordered]@{
    version = if ($null -ne $doc.version) { $doc.version } else { 1 }
    hooks   = $hooksHash
  }
  $cursorDir = Split-Path -Parent $CursorHooksJson
  if (-not (Test-Path $cursorDir)) {
    [void](New-Item -ItemType Directory -Force -Path $cursorDir)
  }
  ($out | ConvertTo-Json -Depth 8) + "`n" | Set-Content -Path $CursorHooksJson -Encoding UTF8 -NoNewline
  Write-Output "[cursor] wired workspaceOpen -> $cmd"
}

function Install-Mcps {
  if (-not (Test-Path $McpDest)) {
    [void](New-Item -ItemType Directory -Force -Path $McpDest)
  }
  foreach ($server in $McpServers) {
    $dest = Join-Path $McpDest $server
    $pkg = Join-Path $dest "package.json"
    $nm = Join-Path $dest "node_modules"
    if ((Test-Path $nm) -and (Test-Path $pkg)) {
      Write-Output "[cursor] MCP $server already installed at $dest"
      continue
    }
    Write-Output "[cursor] installing MCP server: $server"
    if (-not (Test-Path $dest)) {
      [void](New-Item -ItemType Directory -Force -Path $dest)
    }
    $tarball = Join-Path $dest "server.tar.gz"
    $url = "$McpBase/$server.tar.gz"
    try {
      Invoke-WebRequest -Uri $url -OutFile $tarball -UseBasicParsing
    } catch {
      Write-Output "[cursor] WARN: failed to download MCP server $server — $($_.Exception.Message)"
      continue
    }
    if (-not (Test-CommandExists "tar")) {
      Write-Output "[cursor] WARN: tar not on PATH — cannot extract $server"
      continue
    }
    & tar -xzf $tarball -C $dest
    if ($LASTEXITCODE -ne 0) {
      Write-Output "[cursor] WARN: tar extract failed for $server (exit $LASTEXITCODE)"
      continue
    }
    Remove-Item -Force $tarball
    if (Test-Path $pkg) {
      if (Test-CommandExists "npm") {
        Push-Location $dest
        try {
          & npm ci --no-audit --no-fund
        } finally {
          Pop-Location
        }
      } else {
        Write-Output "[cursor] WARN: npm not on PATH — skip npm ci for $server"
      }
    }
    Write-Output "[cursor] MCP $server installed at $dest"
  }
}

function Register-McpJson {
  $cursorDir = Split-Path -Parent $CursorMcpJson
  if (-not (Test-Path $cursorDir)) {
    [void](New-Item -ItemType Directory -Force -Path $cursorDir)
  }
  # Prefer python for stable JSON merge (parity with install-cursor.sh).
  $python = $null
  foreach ($cand in @("python3", "python", "py")) {
    if (Test-CommandExists $cand) { $python = $cand; break }
  }
  if ($python) {
    $py = @'
import json, sys
from pathlib import Path

path = Path(sys.argv[1])
dest = Path(sys.argv[2]).as_posix()
if path.exists():
    doc = json.loads(path.read_text(encoding="utf-8"))
else:
    doc = {}
servers = doc.setdefault("mcpServers", {})

def upsert(name, entry):
    if name not in servers:
        servers[name] = entry
        return "added"
    return "kept"

actions = []
actions.append(upsert("notion-chimeranext", {
    "command": "node",
    "args": [f"{dest}/notion-chimeranext/server.js"],
    "env": {"NOTION_API_KEY": "${env:NOTION_API_KEY}"},
}))
actions.append(upsert("posthog-chimeranext", {
    "command": "node",
    "args": [f"{dest}/posthog-chimeranext/server.js"],
    "env": {
        "POSTHOG_HOST": "${env:POSTHOG_HOST}",
        "POSTHOG_PERSONAL_API_KEY": "${env:POSTHOG_PERSONAL_API_KEY}",
        "POSTHOG_PROJECT_ID": "${env:POSTHOG_PROJECT_ID}",
    },
}))
actions.append(upsert("google-workspace-apps", {
    "command": "npx",
    "args": ["-y", "tsx", f"{dest}/google-workspace-apps/google-for-rclone.ts"],
}))
actions.append(upsert("social-media-ads-mcp", {
    "command": "npx",
    "args": ["-y", "tsx", f"{dest}/social-media-ads-mcp/src/server.ts"],
}))
actions.append(upsert("stitch-chimeranext", {
    "command": "node",
    "args": [f"{dest}/stitch-chimeranext/server.js"],
    "env": {
        "STITCH_GCP_PROJECT": "${env:STITCH_GCP_PROJECT}",
        "STITCH_PROJECT_ID": "${env:STITCH_PROJECT_ID}",
    },
}))
path.write_text(json.dumps(doc, indent=2) + "\n", encoding="utf-8")
print(f"[cursor] mcp.json updated ({path}): " + ",".join(actions))
'@
    $destUnix = ($McpDest -replace '\\', '/')
    if ($python -eq "py") {
      & py -3 -c $py $CursorMcpJson $destUnix
    } else {
      & $python -c $py $CursorMcpJson $destUnix
    }
    return
  }

  Write-Output "[cursor] WARN: python not on PATH — merging mcp.json with ConvertTo-Json"
  $doc = @{ mcpServers = @{} }
  if (Test-Path $CursorMcpJson) {
    $doc = Get-Content -Raw -Path $CursorMcpJson | ConvertFrom-Json
  }
  if (-not $doc.mcpServers) {
    $doc | Add-Member -NotePropertyName mcpServers -NotePropertyValue ([pscustomobject]@{}) -Force
  }
  $destUnix = ($McpDest -replace '\\', '/')
  $wanted = [ordered]@{
    "notion-chimeranext" = @{
      command = "node"
      args    = @("$destUnix/notion-chimeranext/server.js")
      env     = @{ NOTION_API_KEY = '${env:NOTION_API_KEY}' }
    }
    "posthog-chimeranext" = @{
      command = "node"
      args    = @("$destUnix/posthog-chimeranext/server.js")
      env     = @{
        POSTHOG_HOST             = '${env:POSTHOG_HOST}'
        POSTHOG_PERSONAL_API_KEY = '${env:POSTHOG_PERSONAL_API_KEY}'
        POSTHOG_PROJECT_ID       = '${env:POSTHOG_PROJECT_ID}'
      }
    }
    "google-workspace-apps" = @{
      command = "npx"
      args    = @("-y", "tsx", "$destUnix/google-workspace-apps/google-for-rclone.ts")
    }
    "social-media-ads-mcp" = @{
      command = "npx"
      args    = @("-y", "tsx", "$destUnix/social-media-ads-mcp/src/server.ts")
    }
    "stitch-chimeranext" = @{
      command = "node"
      args    = @("$destUnix/stitch-chimeranext/server.js")
      env     = @{
        STITCH_GCP_PROJECT = '${env:STITCH_GCP_PROJECT}'
        STITCH_PROJECT_ID  = '${env:STITCH_PROJECT_ID}'
      }
    }
  }
  $serversHash = @{}
  foreach ($p in $doc.mcpServers.PSObject.Properties) {
    $serversHash[$p.Name] = $p.Value
  }
  $actions = @()
  foreach ($name in $wanted.Keys) {
    if ($serversHash.ContainsKey($name)) {
      $actions += "kept"
    } else {
      $serversHash[$name] = $wanted[$name]
      $actions += "added"
    }
  }
  $out = [ordered]@{ mcpServers = $serversHash }
  foreach ($p in $doc.PSObject.Properties) {
    if ($p.Name -ne "mcpServers") { $out[$p.Name] = $p.Value }
  }
  ($out | ConvertTo-Json -Depth 8) + "`n" | Set-Content -Path $CursorMcpJson -Encoding UTF8 -NoNewline
  Write-Output "[cursor] mcp.json updated ($CursorMcpJson): $($actions -join ',')"
}

Write-Output "[cursor] share root: $ShareRoot"
Ensure-Marketplace

Write-Output "[cursor] NOTE: product toolkits (bootstrap, make-no-mistakes, …) — Add them in Cursor Desktop"
Write-Output "[cursor]       Marketplace → better-toolkits. (agent CLI 2026.11+ has no 'plugin install')"

if (Test-CommandExists "npx") {
  Write-Output "[cursor] install agent-agnostic skills (global)"
  try {
    & npx --yes skills add chimeranext/better-toolkits --all -g -y
    if ($LASTEXITCODE -ne 0) {
      Write-Output "[cursor] WARN: skills add failed (exit $LASTEXITCODE)"
    }
  } catch {
    Write-Output "[cursor] WARN: skills add failed — $($_.Exception.Message)"
  }
} else {
  Write-Output "[cursor] WARN: npx not on PATH — skip skills add"
}

Install-Mcps
Register-McpJson

if (Ensure-Clone) {
  Install-HooksFromClone
  Wire-WorkspaceOpen
  $env:BETTER_TOOLKITS_ROOT = $CloneDir
  Write-Output "[cursor] BETTER_TOOLKITS_ROOT=$CloneDir (use for /refresh)"
} else {
  Write-Output "[cursor] WARN: clone unavailable — hooks/auto-update not fully wired"
}

Write-Output "[cursor] done."
Write-Output "[cursor] Next: Add toolkits in Desktop UI; reload window; set MCP env secrets as needed."
Write-Output "[cursor] MCP binaries: $McpDest"
Write-Output "[cursor] Finish wiring with /toolkits-initial-setup when skills load."
