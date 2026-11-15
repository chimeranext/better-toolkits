#!/usr/bin/env bash
# Seed better.tex pack into ~/.config/better-toolkits/pandoc-export/
# (and optionally into a vault _templates/export/ when --vault is set and empty).
#
# Called from /toolkits-initial-setup Part L after harness wiring, or manually.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
CACHE_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/better-toolkits/pandoc-export"
VAULT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --vault) VAULT="${2:-}"; shift 2 ;;
    -h|--help)
      sed -n '1,12p' "$0"
      exit 0
      ;;
    *)
      echo "Unknown arg: $1" >&2
      exit 2
      ;;
  esac
done

mkdir -p "$CACHE_DIR"
cp -f "$HERE/better.tex" "$HERE/block-id.lua" "$HERE/README.md" "$HERE/resolve-template.sh" "$CACHE_DIR/"
chmod +x "$CACHE_DIR/resolve-template.sh"
echo "seeded cache: $CACHE_DIR"

if [[ -n "$VAULT" ]]; then
  EXPORT="$VAULT/_templates/export"
  mkdir -p "$EXPORT"
  # Do not overwrite a branded vault template; only seed better.tex if missing
  # and no other .tex exists.
  shopt -s nullglob
  other=( "$EXPORT"/*.tex )
  shopt -u nullglob
  branded=0
  for f in "${other[@]:-}"; do
    [[ -f "$f" ]] || continue
    [[ "$(basename "$f")" == "better.tex" ]] && continue
    branded=1
    break
  done
  if [[ "$branded" -eq 1 ]]; then
    echo "vault already has brand template(s) under $EXPORT — left unchanged"
  elif [[ ! -f "$EXPORT/better.tex" ]]; then
    cp -f "$HERE/better.tex" "$HERE/block-id.lua" "$EXPORT/"
    echo "seeded vault: $EXPORT/better.tex"
  else
    echo "vault already has better.tex — left unchanged"
  fi
fi
