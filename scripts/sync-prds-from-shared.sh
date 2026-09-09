#!/usr/bin/env bash
# Sync shared/hooks/prds into every toolkit (vendored for independent publish).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/shared/hooks/prds"
test -d "$SRC"
for tk in "$ROOT"/toolkits/*/; do
  dest="$tk/hooks/prds"
  rm -rf "$dest"
  mkdir -p "$tk/hooks"
  cp -a "$SRC" "$dest"
  chmod +x "$dest/detect.py" \
    "$dest/adapters/claude-pre-bash.sh" \
    "$dest/adapters/cursor-before-shell.sh" \
    "$dest/tests/test-detect.sh" 2>/dev/null || true
  echo "synced $(basename "$tk")"
done
