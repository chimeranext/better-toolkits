#!/usr/bin/env bash
# Install the better-toolkits layer for OpenCode (harness already installed).
# One-liner: curl -fsSL https://toolkits.chimeranext.dev/install-opencode.sh | bash
# What it does: adds the HTTP skills catalog to ~/.config/opencode/opencode.json
# and installs the hooks (stderr / bilingual / code-smells).
set -euo pipefail

CONFIG_DIR="${OPENCODE_CONFIG_DIR:-${HOME}/.config/opencode}"
CONFIG="${CONFIG_DIR}/opencode.json"
CATALOG="https://toolkits.chimeranext.dev/opencode/skills/"

echo "[opencode] config: ${CONFIG}"
mkdir -p "${CONFIG_DIR}"

# 1. Ensure the catalog URL is in the "skills" array (idempotent JSON edit).
# shellcheck disable=SC2016  # $schema must stay literal (not expanded) in the JSON
if [ ! -f "${CONFIG}" ]; then
	printf '{\n  "$schema": "https://opencode.ai/config.json",\n  "skills": ["%s"]\n}\n' "${CATALOG}" >"${CONFIG}"
	echo "[opencode] created config with skills catalog"
else
	python3 - "${CONFIG}" "${CATALOG}" <<'PY'
import json, sys
path, url = sys.argv[1], sys.argv[2]
with open(path, encoding="utf-8") as fh:
    doc = json.load(fh)
skills = doc.get("skills") or []
if url not in skills:
    skills.append(url)
doc["skills"] = skills
with open(path, "w", encoding="utf-8") as fh:
    json.dump(doc, fh, indent=2)
    fh.write("\n")
PY
	echo "[opencode] skills catalog added to config"
fi

# 2. Hooks: install tool-use guards (stderr/bilingual fallback) via the shared script.
if [ -f "scripts/ci/install-tooluse-guards.sh" ]; then
	bash scripts/ci/install-tooluse-guards.sh
	echo "[opencode] tool-use guards installed"
else
	echo "[opencode] WARN: install-tooluse-guards.sh not found in cwd (run from repo root)"
fi

# 3. Install the better-toolkits MCP servers globally (repo-independent).
# Each server ships as an asset on the site; we copy it to a fixed global path
# and run `npm ci` so it works without a clone.
MCP_BASE="https://toolkits.chimeranext.dev/mcp"
MCP_DEST="${HOME}/.local/share/better-toolkits/mcp"
MCP_SERVERS="notion-chimeranext posthog-chimeranext google-workspace-apps social-media-ads-mcp stitch-chimeranext"

mkdir -p "${MCP_DEST}"

for server in ${MCP_SERVERS}; do
	dest="${MCP_DEST}/${server}"
	if [ -d "${dest}/node_modules" ] && [ -f "${dest}/package.json" ]; then
		echo "[opencode] MCP ${server} already installed at ${dest}"
		continue
	fi
	echo "[opencode] installing MCP server: ${server}"
	mkdir -p "${dest}"
	if curl -fsSL "${MCP_BASE}/${server}.tar.gz" -o "${dest}/server.tar.gz"; then
		tar -xzf "${dest}/server.tar.gz" -C "${dest}"
		rm -f "${dest}/server.tar.gz"
		if [ -f "${dest}/package.json" ]; then
			( cd "${dest}" && npm ci --no-audit --no-fund --silent )
		fi
		echo "[opencode] MCP ${server} installed at ${dest}"
	else
		echo "[opencode] WARN: failed to download MCP server ${server}"
	fi
done

# 4. Register the 5 MCP servers in the global opencode.json (idempotent).
if [ -f "${CONFIG}" ]; then
	python3 - "${CONFIG}" "${MCP_DEST}" <<'PY'
import json, sys
path, dest = sys.argv[1], sys.argv[2]
with open(path, encoding="utf-8") as fh:
    doc = json.load(fh)
servers = doc.setdefault("mcp", {}).setdefault("servers", {})
servers.setdefault("notion-chimeranext", {
    "type": "local",
    "command": ["node", dest + "/notion-chimeranext/server.js"],
    "environment": {"NOTION_API_KEY": "{env:NOTION_API_KEY}"},
})
servers.setdefault("posthog-chimeranext", {
    "type": "local",
    "command": ["node", dest + "/posthog-chimeranext/server.js"],
    "environment": {
        "POSTHOG_HOST": "{env:POSTHOG_HOST}",
        "POSTHOG_PERSONAL_API_KEY": "{env:POSTHOG_PERSONAL_API_KEY}",
        "POSTHOG_PROJECT_ID": "{env:POSTHOG_PROJECT_ID}",
    },
})
servers.setdefault("google-workspace-apps", {
    "type": "local",
    "command": ["npx", "-y", "tsx", dest + "/google-workspace-apps/google-for-rclone.ts"],
})
servers.setdefault("social-media-ads-mcp", {
    "type": "local",
    "command": ["npx", "-y", "tsx", dest + "/social-media-ads-mcp/src/server.ts"],
})
servers.setdefault("stitch-chimeranext", {
    "type": "local",
    "command": ["node", dest + "/stitch-chimeranext/server.js"],
    "environment": {
        "STITCH_GCP_PROJECT": "{env:STITCH_GCP_PROJECT}",
        "STITCH_PROJECT_ID": "{env:STITCH_PROJECT_ID}",
    },
})
with open(path, "w", encoding="utf-8") as fh:
    json.dump(doc, fh, indent=2)
    fh.write("\n")
PY
	echo "[opencode] 5 MCP servers registered in ${CONFIG}"
fi

echo "[opencode] done. Restart OpenCode to load the catalog and MCP servers."
