#!/usr/bin/env bash
# Install the better-toolkits layer for Cursor (harness already installed).
# One-liner: curl -fsSL https://toolkits.chimeranext.dev/install-cursor.sh | bash
#
# Design:
# - No dependency on a developer clone under Documents/GitHub.
# - Custom MCPs: SSOT is shared/mcp in the monorepo; published as
#   https://toolkits.chimeranext.dev/mcp/<name>.tar.gz (same assets as OpenCode).
#   Installed under ~/.local/share/better-toolkits/mcp and registered in
#   ~/.cursor/mcp.json — not from agent marketplace cache (that index does not
#   materialize shared/mcp on disk).
# - Optional shallow clone under ~/.local/share/better-toolkits/src for hooks +
#   /refresh (BETTER_TOOLKITS_ROOT override supported).
set -euo pipefail

MARKETPLACE_URL="https://github.com/chimeranext/better-toolkits"
SHARE_ROOT="${HOME}/.local/share/better-toolkits"
CLONE_DIR="${BETTER_TOOLKITS_ROOT:-${SHARE_ROOT}/src}"
MCP_BASE="https://toolkits.chimeranext.dev/mcp"
MCP_DEST="${SHARE_ROOT}/mcp"
MCP_SERVERS="notion-chimeranext posthog-chimeranext google-workspace-apps social-media-ads-mcp stitch-chimeranext"
CURSOR_HOOKS_DIR="${HOME}/.cursor/hooks"
CURSOR_HOOKS_JSON="${HOME}/.cursor/hooks.json"
CURSOR_MCP_JSON="${HOME}/.cursor/mcp.json"
UPDATE_SCRIPT_NAME="update-better-toolkits-marketplace-cursor.sh"
SKIP_AUTO_UPDATE=0
if [[ "${BETTER_TOOLKITS_AUTO_UPDATE:-1}" == "0" ]]; then
	SKIP_AUTO_UPDATE=1
fi
for arg in "$@"; do
	case "${arg}" in
	--no-auto-update) SKIP_AUTO_UPDATE=1 ;;
	esac
done

have_agent() {
	# Prefer `command -v` exit status; never silence stderr (Cursor stderr gate).
	local bin
	bin="$(command -v agent || true)"
	[[ -n "${bin}" ]]
}

ensure_marketplace() {
	if ! have_agent; then
		echo "[cursor] WARN: 'agent' CLI not on PATH — skip marketplace registration"
		echo "[cursor]        Add marketplace in Cursor Desktop: ${MARKETPLACE_URL}"
		return 0
	fi
	echo "[cursor] ensure marketplace ${MARKETPLACE_URL}"
	# Prefer update (idempotent). Fall back to add with full URL (agent 2026.11+).
	if agent plugin marketplace update "${MARKETPLACE_URL}"; then
		echo "[cursor] marketplace updated"
		return 0
	fi
	if agent plugin marketplace update better-toolkits; then
		echo "[cursor] marketplace updated (by name)"
		return 0
	fi
	if agent plugin marketplace add "${MARKETPLACE_URL}"; then
		echo "[cursor] marketplace added"
		return 0
	fi
	echo "[cursor] WARN: marketplace add/update failed — add ${MARKETPLACE_URL} in Desktop UI"
}

ensure_clone() {
	mkdir -p "$(dirname "${CLONE_DIR}")"
	if [[ -f "${CLONE_DIR}/.claude-plugin/marketplace.json" ]]; then
		echo "[cursor] clone present: ${CLONE_DIR}"
		return 0
	fi
	if [[ -e "${CLONE_DIR}" ]] && [[ ! -d "${CLONE_DIR}/.git" ]]; then
		echo "[cursor] WARN: ${CLONE_DIR} exists but is not a git clone — set BETTER_TOOLKITS_ROOT"
		return 1
	fi
	echo "[cursor] shallow clone -> ${CLONE_DIR}"
	git clone --depth 1 --branch main "${MARKETPLACE_URL}.git" "${CLONE_DIR}"
}

install_hooks_from_clone() {
	local src_bi src_upd
	src_bi="${CLONE_DIR}/shared/hooks/bilingual/adapters/cursor-before-shell.sh"
	src_upd="${CLONE_DIR}/shared/bootstrap/scripts/${UPDATE_SCRIPT_NAME}"
	mkdir -p "${CURSOR_HOOKS_DIR}"
	if [[ -f "${src_bi}" ]]; then
		cp "${src_bi}" "${CURSOR_HOOKS_DIR}/cursor-before-shell.sh"
		chmod +x "${CURSOR_HOOKS_DIR}/cursor-before-shell.sh"
		echo "[cursor] bilingual hook -> ${CURSOR_HOOKS_DIR}/cursor-before-shell.sh"
	else
		echo "[cursor] WARN: bilingual adapter missing in clone"
	fi
	if [[ -f "${src_upd}" ]]; then
		cp "${src_upd}" "${CURSOR_HOOKS_DIR}/${UPDATE_SCRIPT_NAME}"
		chmod +x "${CURSOR_HOOKS_DIR}/${UPDATE_SCRIPT_NAME}"
		echo "[cursor] auto-update script -> ${CURSOR_HOOKS_DIR}/${UPDATE_SCRIPT_NAME}"
	else
		echo "[cursor] WARN: ${UPDATE_SCRIPT_NAME} missing in clone"
	fi
}

wire_workspace_open() {
	if [[ "${SKIP_AUTO_UPDATE}" -eq 1 ]]; then
		echo "[cursor] skip workspaceOpen auto-update (--no-auto-update / BETTER_TOOLKITS_AUTO_UPDATE=0)"
		return 0
	fi
	local script_path="${CURSOR_HOOKS_DIR}/${UPDATE_SCRIPT_NAME}"
	if [[ ! -f "${script_path}" ]]; then
		echo "[cursor] WARN: cannot wire workspaceOpen — update script missing"
		return 0
	fi
	python3 - "${CURSOR_HOOKS_JSON}" "${script_path}" <<'PY'
import json, sys
from pathlib import Path

path = Path(sys.argv[1])
script = sys.argv[2]
cmd = f"bash {script}"
if path.exists():
    doc = json.loads(path.read_text(encoding="utf-8"))
else:
    doc = {"version": 1, "hooks": {}}
hooks = doc.setdefault("hooks", {})
entries = hooks.setdefault("workspaceOpen", [])
# Normalize legacy string entries
norm = []
for e in entries:
    if isinstance(e, str):
        norm.append({"command": e})
    elif isinstance(e, dict):
        norm.append(e)
entries[:] = norm
if any(e.get("command") == cmd for e in entries):
    print(f"[cursor] workspaceOpen already has {cmd}")
else:
    entries.append({"command": cmd})
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(doc, indent=2) + "\n", encoding="utf-8")
    print(f"[cursor] wired workspaceOpen -> {cmd}")
PY
}

install_mcps() {
	mkdir -p "${MCP_DEST}"
	local server dest
	for server in ${MCP_SERVERS}; do
		dest="${MCP_DEST}/${server}"
		if [[ -d "${dest}/node_modules" && -f "${dest}/package.json" ]]; then
			echo "[cursor] MCP ${server} already installed at ${dest}"
			continue
		fi
		echo "[cursor] installing MCP server: ${server}"
		mkdir -p "${dest}"
		if curl -fsSL "${MCP_BASE}/${server}.tar.gz" -o "${dest}/server.tar.gz"; then
			tar -xzf "${dest}/server.tar.gz" -C "${dest}"
			rm -f "${dest}/server.tar.gz"
			if [[ -f "${dest}/package.json" ]]; then
				(cd "${dest}" && npm ci --no-audit --no-fund --silent)
			fi
			echo "[cursor] MCP ${server} installed at ${dest}"
		else
			echo "[cursor] WARN: failed to download MCP server ${server}"
		fi
	done
}

register_mcp_json() {
	mkdir -p "$(dirname "${CURSOR_MCP_JSON}")"
	python3 - "${CURSOR_MCP_JSON}" "${MCP_DEST}" <<'PY'
import json, sys
from pathlib import Path

path = Path(sys.argv[1])
dest = sys.argv[2]
if path.exists():
    doc = json.loads(path.read_text(encoding="utf-8"))
else:
    doc = {}
servers = doc.setdefault("mcpServers", {})

def upsert(name, entry):
    # Idempotent: only fill missing keys; never clobber a human-edited server.
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
PY
}

echo "[cursor] share root: ${SHARE_ROOT}"
ensure_marketplace

echo "[cursor] NOTE: product toolkits (bootstrap, make-no-mistakes, …) — Add them in Cursor Desktop"
echo "[cursor]       Marketplace → better-toolkits. (agent CLI 2026.11+ has no 'plugin install')"

NPX_BIN="$(command -v npx || true)"
if [[ -n "${NPX_BIN}" ]]; then
	echo "[cursor] install agent-agnostic skills (global)"
	npx --yes skills add chimeranext/better-toolkits --all -g -y || echo "[cursor] WARN: skills add failed"
else
	echo "[cursor] WARN: npx not on PATH — skip skills add"
fi

install_mcps
register_mcp_json

if ensure_clone; then
	install_hooks_from_clone
	wire_workspace_open
	export BETTER_TOOLKITS_ROOT="${CLONE_DIR}"
	echo "[cursor] BETTER_TOOLKITS_ROOT=${CLONE_DIR} (use for /refresh)"
else
	echo "[cursor] WARN: clone unavailable — hooks/auto-update not fully wired"
fi

echo "[cursor] done."
echo "[cursor] Next: Add toolkits in Desktop UI; reload window; set MCP env secrets as needed."
echo "[cursor] MCP binaries: ${MCP_DEST}"
echo "[cursor] Finish wiring with /toolkits-initial-setup when skills load."
