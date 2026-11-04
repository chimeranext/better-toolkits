#!/usr/bin/env bash
# Pre-tool-use guard: deterministic Bilingual-format enforcement for issues.
#
# This is the FALLBACK transport guard. The PRIMARY path is Linear MCP
# (save_issue) via the OpenCode plugin / Claude PreToolUse hook:
#   - opencode-hygiene.ts  (execute.before → detect.py)
#   - pre-linear-save-issue-hygiene.sh
#
# This shell guard covers the CLI transports that bypass the MCP hook:
#   - `linear ... create` (Linear CLI) — primary-of-the-CLI
#   - `gh issue create|edit`        (GitHub CLI fallback)
#
# If the issue body (from --body / --body-file / -b) does not contain the
# mandatory Bilingual markers, the tool use is BLOCKED (exit 1).
#
# Protocol SSOT: shared/references/engineering-standards/bilingual-issue-brief.md
# Detector: shared/hooks/bilingual/detect.py
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DETECTOR="$ROOT/shared/hooks/bilingual/detect.py"

CMD="$*"
case "$CMD" in
  *"gh issue create"*|*"gh issue edit"*|*"linear"*create*|*"linear"*edit*) ;;
  *) exit 0 ;;
esac

[ -f "$DETECTOR" ] || { echo "[bilingual-local] detector ausente: $DETECTOR" >&2; exit 1; }

# Extract body from common CLI forms (crude but deterministic)
BODY=""
BODY_FILE=""
if printf '%s' "$CMD" | grep -qE -- '--body-file[ =]+[^ ]+'; then
  BODY_FILE=$(printf '%s' "$CMD" | sed -nE 's/.*--body-file[ =]+([^ ]+).*/\1/p')
elif printf '%s' "$CMD" | grep -qE -- '--body[ =]+.+'; then
  BODY=$(printf '%s' "$CMD" | sed -nE 's/.*--body[ =]+(.*)$/\1/p')
elif printf '%s' "$CMD" | grep -qE -- '(^|[ -])-b[ =]+.+'; then
  BODY=$(printf '%s' "$CMD" | sed -nE 's/.*(^|[ -])-b[ =]+(.*)$/\2/p')
fi

status=0
if [ -n "$BODY_FILE" ]; then
  if [ -f "$BODY_FILE" ]; then
    python3 "$DETECTOR" --body-file "$BODY_FILE" || status=1
  else
    echo "[bilingual-local] --body-file no existe: $BODY_FILE" >&2
    status=1
  fi
elif [ -n "$BODY" ]; then
  python3 "$DETECTOR" --body "$BODY" || status=1
else
  echo "[bilingual-local] comando de creación de issue sin --body / --body-file (se requiere brief Bilingual)." >&2
  status=1
fi

if [ "$status" -ne 0 ]; then
  echo "[bilingual-local] BLOCKED: redacta el issue en formato Bilingual (HUMAN LAYER / AGENT LAYER / Acceptance Criteria / Context Files)." >&2
  exit 1
fi
exit 0
