#!/usr/bin/env bash
# setup-open-ontologies.sh — install Open Ontologies (release binary) globally,
# pinned + SHA-256 verified, idempotent, and register it as a global MCP server.
#
# Open Ontologies is a reasoner that produces re-verifiable certificates (the
# Baka-Yoke recurrence guard for /ishikawa). It is installed GLOBALLY and is
# path-agnostic (no scan root): an agent passes explicit ontology file paths.
#
# Usage: bash setup-open-ontologies.sh
set -euo pipefail

# ---- Pinned release + expected SHA-256 (bump deliberately) ----
OO_VERSION="${OO_VERSION:-0.1.0}"
OO_SHA256="${OO_SHA256:-}"   # set to the expected sha256 to enforce; empty = warn
PLATFORM="$(uname -s)"
ARCH="$(uname -m)"
case "${PLATFORM}-${ARCH}" in
  Linux-x86_64)  OO_ARCH="x86_64-unknown-linux-gnu" ;;
  Darwin-arm64)   OO_ARCH="aarch64-apple-darwin" ;;
  Darwin-x86_64) OO_ARCH="x86_64-apple-darwin" ;;
  *) echo "unsupported platform: ${PLATFORM}-${ARCH}" >&2; exit 1 ;;
esac

BIN_DIR="${OO_BIN_DIR:-$HOME/.local/bin}"
URL="https://github.com/fabio-rovai/open-ontologies/releases/download/v${OO_VERSION}/open-ontologies-${OO_ARCH}"
TARGET="${BIN_DIR}/open-ontologies"

mkdir -p "$BIN_DIR"

echo "[setup-open-ontologies] downloading ${URL}" >&2
# download to a temp file, verify checksum, then atomically move
TMP="$(mktemp)"
trap 'rm -f "$TMP" "$TMP.sha256"' EXIT
curl -fSL --progress-bar "$URL" -o "$TMP"

if [ -n "$OO_SHA256" ]; then
  actual="$(sha256sum "$TMP" | awk '{print $1}')"
  if [ "$actual" != "$OO_SHA256" ]; then
    echo "[setup-open-ontologies] ERROR: sha256 mismatch (expected ${OO_SHA256}, got ${actual})" >&2
    exit 1
  fi
else
  echo "[setup-open-ontologies] WARNING: OO_SHA256 not set — integrity not enforced" >&2
fi

chmod +x "$TMP"
mv "$TMP" "$TARGET"
echo "[setup-open-ontologies] installed ${TARGET}" >&2

# ---- Register as a global MCP server ----
# Global opencode config; insert the server entry idempotently.
OC_CFG="${OPENCODE_CONFIG:-$HOME/.config/opencode/opencode.json}"
if [ ! -f "$OC_CFG" ]; then
  mkdir -p "$(dirname "$OC_CFG")"
  echo '{"mcp":{"servers":{}}}' > "$OC_CFG"
fi

python3 - "$OC_CFG" "$TARGET" <<'PY'
import json, os, sys
path, target = sys.argv[1], sys.argv[2]
with open(path, encoding="utf-8") as fh:
    cfg = json.load(fh)
servers = cfg.setdefault("mcp", {}).setdefault("servers", {})
servers["open-ontologies"] = {
    "type": "local",
    "command": [target, "serve"],
}
with open(path, "w", encoding="utf-8") as fh:
    json.dump(cfg, fh, indent=2, ensure_ascii=False)
print(f"[setup-open-ontologies] registered open-ontologies MCP server in {path}")
PY

echo "[setup-open-ontologies] done." >&2
