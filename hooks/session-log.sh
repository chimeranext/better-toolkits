#!/usr/bin/env bash
# AAARRR Flywheel — Session Log Hook
# Al cerrar sesión, registra qué archivos en .aaarrr/ se modificaron.
# Always exit 0 — nunca bloquea cierre.

set -uo pipefail

find_aaarrr_dir() {
  local dir="$PWD"
  while [ "$dir" != "/" ]; do
    if [ -d "$dir/.aaarrr" ]; then
      echo "$dir/.aaarrr"
      return 0
    fi
    dir="$(dirname "$dir")"
  done
  return 1
}

AAARRR_DIR=$(find_aaarrr_dir 2>/dev/null) || exit 0

LEARNINGS_DIR="$AAARRR_DIR/learnings"
SESSION_LOG="$LEARNINGS_DIR/session-log.md"

mkdir -p "$LEARNINGS_DIR"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

if [ ! -f "$SESSION_LOG" ]; then
  cat > "$SESSION_LOG" << 'HEADER'
# AAARRR Session Log

Timestamped entries auto-appended by the AAARRR Flywheel stop hook.
Cada entry registra cuándo terminó una sesión y qué áreas del flywheel se tocaron.

---

HEADER
fi

CHANGED_FILES=""
if command -v git &>/dev/null && git rev-parse --is-inside-work-tree &>/dev/null 2>&1; then
  CHANGED_FILES=$(git status --porcelain "$AAARRR_DIR" 2>/dev/null | head -20 || true)
fi

AREAS_TOUCHED=""
for area in plans metrics learnings diagnoses experiments cohorts; do
  if echo "$CHANGED_FILES" | grep -q "$area/" 2>/dev/null; then
    AREAS_TOUCHED="${AREAS_TOUCHED}${area}, "
  fi
done
if echo "$CHANGED_FILES" | grep -q "config.json" 2>/dev/null; then
  AREAS_TOUCHED="${AREAS_TOUCHED}config, "
fi
AREAS_TOUCHED=$(echo "$AREAS_TOUCHED" | sed 's/, $//')

CHANGE_COUNT=0
if [ -n "$CHANGED_FILES" ]; then
  CHANGE_COUNT=$(echo "$CHANGED_FILES" | wc -l | tr -d ' ')
fi

{
  echo "## Session: ${TIMESTAMP}"
  echo ""
  if [ -n "$AREAS_TOUCHED" ]; then
    echo "- **Áreas tocadas:** ${AREAS_TOUCHED}"
  else
    echo "- **Áreas tocadas:** none detected"
  fi
  echo "- **Files changed:** ${CHANGE_COUNT}"
  if [ -n "$CHANGED_FILES" ]; then
    echo "- **Changes:**"
    echo '```'
    echo "$CHANGED_FILES"
    echo '```'
  fi
  echo ""
  echo "---"
  echo ""
} >> "$SESSION_LOG"

exit 0
