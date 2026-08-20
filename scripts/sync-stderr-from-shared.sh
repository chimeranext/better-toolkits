#!/usr/bin/env bash
# Sync shared/hooks/stderr into every toolkit (vendored for independent publish).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/shared/hooks/stderr"
test -d "$SRC"
for tk in "$ROOT"/toolkits/*/; do
  dest="$tk/hooks/stderr"
  rm -rf "$dest"
  mkdir -p "$tk/hooks"
  cp -a "$SRC" "$dest"
  echo "synced $(basename "$tk")"
done
