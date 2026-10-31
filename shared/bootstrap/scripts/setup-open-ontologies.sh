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

# ---- Pinned release (the version is the pin; integrity comes from the
#      release's own SHASUMS.txt — never a hand-copied constant) ----
OO_VERSION="${OO_VERSION:-2.1.0}"

PLATFORM="$(uname -s)"
ARCH="$(uname -m)"
case "${PLATFORM}-${ARCH}" in
  Linux-x86_64)  OO_ARCH="x86_64-unknown-linux-gnu" ;;
  Darwin-arm64)   OO_ARCH="aarch64-apple-darwin" ;;
  Darwin-x86_64) OO_ARCH="x86_64-apple-darwin" ;;
  *) echo "unsupported platform: ${PLATFORM}-${ARCH}" >&2; exit 1 ;;
esac

BIN_DIR="${OO_BIN_DIR:-$HOME/.local/bin}"
BASE_URL="https://github.com/fabio-rovai/open-ontologies/releases/download/v${OO_VERSION}"
TARGET="${BIN_DIR}/open-ontologies"
CERT_TARGET="${BIN_DIR}/oo-cert"

mkdir -p "$BIN_DIR"

# Fetch the release's own checksum manifest once (source of truth).
SHASUMS="$(mktemp)"
trap 'rm -f "$SHASUMS"' EXIT
echo "[setup-open-ontologies] fetching ${BASE_URL}/SHASUMS.txt" >&2
curl -fSL "$BASE_URL/SHASUMS.txt" -o "$SHASUMS"

# Resolve the expected sha256 for an asset from the manifest (exact match).
manifest_sha() {
  local asset="$1"
  awk -v a="$asset" '$2 == a { print $1; exit }' "$SHASUMS"
}

# Download a release asset, verify its sha256 against the release manifest,
# then atomically install it. Fails hard on a mismatch (never proceeds).
install_asset() {
  local asset="$1" final_path="$2"
  local url="${BASE_URL}/${asset}"
  local expected_sha
  expected_sha="$(manifest_sha "$asset")"
  if [ -z "$expected_sha" ]; then
    echo "[setup-open-ontologies] ERROR: no sha256 in release manifest for ${asset}" >&2
    return 1
  fi
  echo "[setup-open-ontologies] downloading ${url}" >&2
  local tmp
  tmp="$(mktemp)"
  curl -fSL --progress-bar "$url" -o "$tmp"
  local actual
  actual="$(sha256sum "$tmp" | awk '{print $1}')"
  if [ "$actual" != "$expected_sha" ]; then
    echo "[setup-open-ontologies] ERROR: sha256 mismatch for ${asset} (manifest ${expected_sha}, got ${actual})" >&2
    rm -f "$tmp"
    return 1
  fi
  chmod +x "$tmp"
  mv "$tmp" "$final_path"
  echo "[setup-open-ontologies] installed ${final_path} (sha256 verified from release manifest)" >&2
}

case "${PLATFORM}-${ARCH}" in
  Linux-x86_64)
    install_asset "open-ontologies-${OO_ARCH}" "$TARGET"
    install_asset "oo-cert-${OO_ARCH}" "$CERT_TARGET"
    ;;
  *)
    install_asset "open-ontologies-${OO_ARCH}" "$TARGET"
    ;;
esac

# ---- Register as a global MCP server ----
OC_CFG="${OPENCODE_CONFIG:-$HOME/.config/opencode/opencode.json}"
if [ ! -f "$OC_CFG" ]; then
  mkdir -p "$(dirname "$OC_CFG")"
  echo '{"mcp":{"servers":{}}}' > "$OC_CFG"
fi

python3 - "$OC_CFG" "$TARGET" <<'PY'
import json, sys
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
