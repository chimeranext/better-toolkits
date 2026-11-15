#!/usr/bin/env bash
# Resolve which Pandoc LaTeX template to use for client PDF export.
#
# Priority (first hit wins):
#   1. Engagement vault branded template: <root>/_templates/export/*.tex
#      excluding better.tex (e.g. the vault brand pack used for client drafts)
#   2. Engagement vault seeded neutral: <root>/_templates/export/better.tex
#   3. Local cache from /toolkits-initial-setup:
#        ~/.config/better-toolkits/pandoc-export/better.tex
#   4. Toolkit SSOT: shared/references/pandoc-export/better.tex
#
# Usage:
#   resolve-template.sh [--root PATH] [--print-resource-path]
# Prints absolute template path on stdout. Resource-path companion dir on stderr
# when --print-resource-path (or always as second line when TEMPLATE_RESOURCE_PATH=1).
set -euo pipefail

ROOT=""
PRINT_RP=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --root) ROOT="${2:-}"; shift 2 ;;
    --print-resource-path) PRINT_RP=1; shift ;;
    -h|--help)
      sed -n '1,20p' "$0"
      exit 0
      ;;
    *)
      echo "Unknown arg: $1" >&2
      exit 2
      ;;
  esac
done

if [[ -z "$ROOT" ]]; then
  ROOT="$(pwd)"
fi
ROOT="$(cd "$ROOT" && pwd)"

pick_branded() {
  local dir="$1"
  [[ -d "$dir" ]] || return 1
  local f
  # Prefer any .tex that is not the neutral seed name.
  for f in "$dir"/*.tex; do
    [[ -f "$f" ]] || continue
    [[ "$(basename "$f")" == "better.tex" ]] && continue
    printf '%s\n' "$f"
    return 0
  done
  return 1
}

emit() {
  local tmpl="$1"
  local rp
  rp="$(cd "$(dirname "$tmpl")" && pwd)"
  printf '%s\n' "$tmpl"
  if [[ "$PRINT_RP" -eq 1 ]] || [[ "${TEMPLATE_RESOURCE_PATH:-0}" == "1" ]]; then
    printf '%s\n' "$rp"
  fi
}

EXPORT="$ROOT/_templates/export"
if branded="$(pick_branded "$EXPORT")"; then
  emit "$branded"
  exit 0
fi
if [[ -f "$EXPORT/better.tex" ]]; then
  emit "$EXPORT/better.tex"
  exit 0
fi

CACHE="${XDG_CONFIG_HOME:-$HOME/.config}/better-toolkits/pandoc-export/better.tex"
if [[ -f "$CACHE" ]]; then
  emit "$CACHE"
  exit 0
fi

HERE="$(cd "$(dirname "$0")" && pwd)"
if [[ -f "$HERE/better.tex" ]]; then
  emit "$HERE/better.tex"
  exit 0
fi

echo "resolve-template.sh: no Pandoc template found (vault export / cache / shared)." >&2
exit 1
