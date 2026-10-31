#!/usr/bin/env bash
# Sync shared/hooks/<mod> into every toolkit (vendored for independent publish).
# SSOT: shared/hooks is the single source; toolkits keep generated copies.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC_BASE="$ROOT/shared/hooks"
MODS="stderr prds no-squash"
if [ "$#" -gt 0 ] && [ "$1" != "--all" ]; then
  MODS="$*"
fi
for mod in $MODS; do
  [ -d "$SRC_BASE/$mod" ] || { echo "skip: no shared/hooks/$mod"; continue; }
  for tk in "$ROOT"/toolkits/*/; do
    dest="$tk/hooks/$mod"
    rm -rf "$dest"
    mkdir -p "$tk/hooks"
    cp -a "$SRC_BASE/$mod" "$dest"
  done
  echo "synced hooks/$mod"
done
