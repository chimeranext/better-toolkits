#!/usr/bin/env bash
# Sync shared/hooks/no-squash into every toolkit (vendored for independent publish).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/shared/hooks/no-squash"
test -d "$SRC"
for tk in "$ROOT"/toolkits/*/; do
  dest="$tk/hooks/no-squash"
  rm -rf "$dest"
  mkdir -p "$tk/hooks"
  cp -a "$SRC" "$dest"
  find "$dest" -type d -name '__pycache__' -exec rm -rf {} + || true
  chmod +x "$dest/detect.py" \
    "$dest/adapters/claude-pre-bash.sh" \
    "$dest/adapters/cursor-before-shell.sh" \
    "$dest/tests/test-detect.sh" || true
  echo "synced $(basename "$tk")"
done
