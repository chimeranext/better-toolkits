#!/usr/bin/env bash
# kicad-cli — thin wrapper around kicad-cli for common batch operations.
# Usage: kicad-cli.sh <erc|drc|gerbers|bom> <file>
set -euo pipefail

cmd="${1:-}"; file="${2:-}"
if [[ -z "$cmd" || -z "$file" ]]; then
  echo "usage: $0 <erc|drc|gerbers|bom> <file>" >&2
  exit 2
fi
if ! command -v kicad-cli >/dev/null; then
  echo "ERROR: kicad-cli not found on PATH" >&2
  exit 1
fi

case "$cmd" in
  erc)
    kicad-cli sch erc --output /tmp/erc_report.json "$file"
    echo "ERC done -> /tmp/erc_report.json";;
  drc)
    kicad-cli pcb drc --output /tmp/drc_report.json "$file"
    echo "DRC done -> /tmp/drc_report.json";;
  gerbers)
    out="${3:-Gerbers}"
    mkdir -p "$out"
    kicad-cli pcb export gerbers --output "$out" "$file"
    echo "Gerbers -> $out";;
  bom)
    kicad-cli sch export bom --output /tmp/bom.csv "$file"
    echo "BOM -> /tmp/bom.csv";;
  *)
    echo "ERROR: unknown command '$cmd' (expected erc|drc|gerbers|bom)" >&2
    exit 2;;
esac
