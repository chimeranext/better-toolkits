#!/usr/bin/env bash
# =============================================================================
# pre-linear-save-issue-hygiene.sh — PreToolUse hook on Linear MCP save_issue.
#
# Blocks CREATING a Linear issue without full triage metadata — project,
# assignee, non-zero priority, at least one label, milestone, and an explicit
# non-Backlog state — so no issue ever lands in an orphan/backlog view.
# Updates (calls that carry an `id`) pass through untouched.
#
# OPT-IN PER REPO (house pattern, like hooks/atomic and hooks/cross-cutting):
# reads `.claude/config/hygiene-hooks.json` at the consumer repo root and
# NO-OPS unless it contains `"linear_create_hygiene": true`. Run
# /make-no-mistakes:hygiene-hooks-setup to create that config and verify the
# hook end-to-end.
#
# Origin: born after a tracker issue was created orphaned mid-session
# ("memory alone is not enough — make it a hook"); later extended to also
# require labels/milestone/state. Verified with a 7-payload synthetic suite
# (see the setup command's verify step).
#
# Known MCP limitation: state/assignee/priority writes can be SILENT NO-OPS on
# some Linear MCP relays. This hook still requires the fields so intent is
# always declared; the agent must verify post-write (get_issue) and surface
# manual flips if the write did not apply.
# =============================================================================

set -euo pipefail

INPUT="$(cat)"

command -v jq >/dev/null 2>&1 || exit 0  # fail-open: never block on missing infra

# --- Per-repo opt-in gate (no-op if the consumer repo has not enabled it) ---
REPO_ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
CFG="$REPO_ROOT/.claude/config/hygiene-hooks.json"
[ -f "$CFG" ] || exit 0
ENABLED="$(jq -r '.linear_create_hygiene // false' "$CFG" 2>/dev/null)" || exit 0
[ "$ENABLED" = "true" ] || exit 0

TOOL_INPUT="$(printf '%s' "$INPUT" | jq -r '.tool_input // empty' 2>/dev/null)" || exit 0
[ -n "$TOOL_INPUT" ] || exit 0

# Updates (id present) are out of scope — only creations are gated.
HAS_ID="$(printf '%s' "$TOOL_INPUT" | jq -r 'has("id")' 2>/dev/null)" || exit 0
[ "$HAS_ID" = "true" ] && exit 0

MISSING=()

PROJECT="$(printf '%s' "$TOOL_INPUT" | jq -r '.project // empty')"
[ -n "$PROJECT" ] || MISSING+=("project (the pillar/product project this issue belongs to)")

ASSIGNEE="$(printf '%s' "$TOOL_INPUT" | jq -r '.assignee // empty')"
[ -n "$ASSIGNEE" ] || MISSING+=("assignee (e.g. \"me\")")

# priority must be present AND non-zero (0 = "No priority" = the orphan view)
PRIORITY="$(printf '%s' "$TOOL_INPUT" | jq -r '.priority // 0')"
case "$PRIORITY" in
  1|2|3|4) : ;;
  *) MISSING+=("priority (1=Urgent 2=High 3=Medium 4=Low — 0/absent lands in the no-priority view)") ;;
esac

# labels must carry at least one (Type/Component/Size per the team's taxonomy)
LABELS_COUNT="$(printf '%s' "$TOOL_INPUT" | jq -r '(.labels // []) | if type == "array" then length else 0 end' 2>/dev/null)" || LABELS_COUNT=0
[ "${LABELS_COUNT:-0}" -ge 1 ] 2>/dev/null || MISSING+=("labels (at least one — Type/Component/Size; emoji-prefix labels need the exact emoji)")

# milestone — the project milestone this issue belongs to
MILESTONE="$(printf '%s' "$TOOL_INPUT" | jq -r '.milestone // empty')"
[ -n "$MILESTONE" ] || MISSING+=("milestone (the project milestone this issue belongs to — create one if none fits)")

# state must be EXPLICIT and not Backlog (absent/Backlog = the backlog orphan view)
STATE="$(printf '%s' "$TOOL_INPUT" | jq -r '.state // empty')"
if [ -z "$STATE" ]; then
  MISSING+=("state (explicit — e.g. \"Todo\" / \"In Progress\"; absent defaults to the Backlog orphan view)")
elif [ "$(printf '%s' "$STATE" | tr '[:upper:]' '[:lower:]')" = "backlog" ]; then
  MISSING+=("state must not be \"Backlog\" — set an actionable state (\"Todo\" / \"In Progress\")")
fi

if [ "${#MISSING[@]}" -gt 0 ]; then
  {
    echo "BLOCKED — Linear issue hygiene: every CREATE must declare full triage"
    echo "metadata (project, assignee, priority, labels, milestone, state) so no"
    echo "issue lands in an orphan/backlog view with incomplete triage."
    echo ""
    echo "Missing/invalid fields on this save_issue CREATE:"
    for f in "${MISSING[@]}"; do echo "  - $f"; done
    echo ""
    echo "VERIFY post-write with get_issue — some Linear MCP relays silently"
    echo "no-op state/assignee/priority writes; surface manual flips if so."
  } >&2
  exit 2
fi

exit 0
