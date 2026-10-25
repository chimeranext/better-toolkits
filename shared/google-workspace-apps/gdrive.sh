#!/usr/bin/env bash
# /gdrive-mcp wrapper — future-proof (no embedded client_id, .json only)
set -euo pipefail

JSON_FILE="${HOME}/.config/google-workspace/google-oauth-client.json"
CONFIG_FILE="${HOME}/.config/google-workspace/.rclone-config.json"
RCLONE_BIN="${HOME}/.local/bin/rclone"
[ -f "${HOME}/.local/bin/rclone" ] || RCLONE_BIN="$(command -v rclone || echo rclone)"

if [ ! -f "${JSON_FILE}" ]; then
  echo "gdrive-mcp: .json missing (${JSON_FILE})"
  exit 1
fi

CID=$(python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); c=d.get("installed") or d; print(c.get("client_id",""))' "${JSON_FILE}")
CS=$(python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); c=d.get("installed") or d; print(c.get("client_secret",""))' "${JSON_FILE}")

echo "gdrive-mcp: verify() .json (${JSON_FILE}, $(ls -l "${JSON_FILE}" | awk '{print $5}') B) -> loadRemote() .rclone-config (${CONFIG_FILE})"
echo "client_id prefix: ${CID:0:15}... secret prefix: ${CS:0:10}..."

if [ ! -f "${CONFIG_FILE}" ]; then
  echo "gdrive-mcp: .rclone-config missing (${CONFIG_FILE})"
  exit 1
fi

echo "gdrive-mcp: running rclone ls gdrive: (no 2>/dev/null, exit visible)"
exec "${RCLONE_BIN}" --drive-client-id "${CID}" --drive-client-secret "${CS}" ls gdrive:
