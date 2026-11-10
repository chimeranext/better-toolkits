#!/usr/bin/env bash
# Export SPMP + 16085 + ISO 31000 templates into business-brain-template.
# SSOT remains in fractional-cto-toolkit. Does NOT overwrite _templates/riesgo.md.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOOLKIT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SPMP_SRC="$TOOLKIT_ROOT/references/software-project-management-plan/templates"
ISO31000_SRC="$TOOLKIT_ROOT/references/grc/iso31000/templates"

# Default: sibling checkout under chimeranext/
DEFAULT_BRAIN_TEMPLATE="$(cd "$TOOLKIT_ROOT/../../.." && pwd)/business-brain-template"
BRAIN_TEMPLATE="${BRAIN_TEMPLATE:-$DEFAULT_BRAIN_TEMPLATE}"

BANNER_FILE="$(mktemp)"
trap 'rm -f "$BANNER_FILE"' EXIT

cat >"$BANNER_FILE" <<'EOF'
<!--
EXPORTED from fractional-cto-toolkit — edit SSOT there.
Source: toolkits/fractional-cto-toolkit/references/...
Do not author lasting template changes in business-brain-template.
-->
EOF

if [[ ! -d "$BRAIN_TEMPLATE" ]]; then
  echo "business-brain-template not found at: $BRAIN_TEMPLATE" >&2
  echo "Set BRAIN_TEMPLATE=/path/to/business-brain-template" >&2
  exit 1
fi

DEST_SPMP="$BRAIN_TEMPLATE/_templates/spmp"
DEST_ROOT="$BRAIN_TEMPLATE/_templates"
mkdir -p "$DEST_SPMP"

export_file() {
  local src="$1"
  local dest="$2"
  local tmp
  tmp="$(mktemp)"
  {
    cat "$BANNER_FILE"
    echo
    cat "$src"
  } >"$tmp"
  mv "$tmp" "$dest"
  echo "exported $(basename "$src") -> $dest"
}

# SPMP + 16085 (+ pmbok8 set)
while IFS= read -r -d '' f; do
  rel="${f#"$SPMP_SRC/"}"
  dest="$DEST_SPMP/$rel"
  mkdir -p "$(dirname "$dest")"
  export_file "$f" "$dest"
done < <(find "$SPMP_SRC" -type f -name '*.md' -print0)

# ISO 31000 templates at _templates/ root (separate from riesgo.md)
for f in "$ISO31000_SRC"/*.md; do
  [[ -f "$f" ]] || continue
  export_file "$f" "$DEST_ROOT/$(basename "$f")"
done

# Guard: never touch riesgo.md
if [[ -f "$DEST_ROOT/riesgo.md" ]]; then
  if rg -q "EXPORTED from fractional-cto-toolkit" "$DEST_ROOT/riesgo.md"; then
    echo "ERROR: riesgo.md looks exported — restore the PMBOK atomic note; export must not own it" >&2
    exit 1
  fi
fi

echo "Done. Left untouched: $DEST_ROOT/riesgo.md (if present)."
