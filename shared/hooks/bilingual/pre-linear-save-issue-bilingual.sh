#!/usr/bin/env bash
# PreToolUse hook — Bilingual gate (MANDATORY, no opt-in) on Linear MCP save_issue.
#
# Blocks CREATING a Linear issue whose body is not a substantive Bilingual brief
# (## 👤 HUMAN LAYER / ## 🤖 AGENT LAYER / ### Acceptance Criteria / ### Context Files).
# Updates (calls that carry an `id`) pass through untouched.
#
# MANDATORY: this is not opt-in. It runs whenever the Linear MCP save_issue tool
# is used. There is no config flag to enable/disable it (except the global
# harness kill-switches for ALL hooks).
#
# Protocol SSOT:
#   shared/references/engineering-standards/bilingual-issue-brief.md
# Detector (deterministic):
#   shared/hooks/bilingual/detect.py
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DETECT="$ROOT/shared/hooks/bilingual/detect.py"

[ -f "$DETECT" ] || exit 0   # fail-open: never block on missing infra

INPUT="$(cat)"

command -v jq || exit 0  # fail-open: never block on missing infra

TOOL_INPUT="$(printf '%s' "$INPUT" | jq -r '.tool_input // empty' )" || exit 0
[ -n "$TOOL_INPUT" ] || exit 0

# Updates (id present) are out of scope — only creations are gated.
HAS_ID="$(printf '%s' "$TOOL_INPUT" | jq -r 'has("id")' )" || exit 0
[ "$HAS_ID" = "true" ] && exit 0

DESC="$(printf '%s' "$TOOL_INPUT" | jq -r '.description // .body // empty')"

if [ -z "$DESC" ]; then
  {
    echo "BLOCKED — Bilingual: el issue no tiene description. Todo CREATE en Linear"
    echo "debe abrirse con un brief Bilingual (## 👤 HUMAN LAYER / ## 🤖 AGENT"
    echo "LAYER / ### Acceptance Criteria / ### Context Files). Corre"
    echo "/make-no-mistakes:spike-recommend {ID} para regenerar el brief."
  } >&2
  exit 2
fi

if ! python3 "$DETECT" --body "$DESC"; then
  {
    echo "BLOCKED — Bilingual: el cuerpo del issue no pasa el gate determinístico."
    echo "Ejecuta /make-no-mistakes:spike-recommend {ID} para normalizar el brief."
  } >&2
  exit 2
fi

exit 0
