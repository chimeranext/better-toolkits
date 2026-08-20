#!/usr/bin/env bash
# post-linear-save-issue-state-landed.sh — PostToolUse hook on Linear MCP
# save_issue. WARNS (never blocks) when a write did NOT land.
#
# TWO checks, added a month apart because the relay drops more than one field:
#
#   1. STATE (tracker issue) — a non-Backlog state was requested and the issue came
#      back in Backlog, or in a different state. Create and update alike.
#   2. TRIAGE FIELDS on CREATE (tracker issue) — `project`, `milestone`, `assignee`
#      or `labels` were in the request and are absent from the response.
#
# The filename still says `state-landed`. It is not renamed because the hook
# path is registered in `.claude/settings.json` and quoted in two other files;
# a rename that misses one of them silently unregisters the guard, which is a
# worse outcome than a filename that undersells what it covers.
#
# Why this exists (verified 2026-07-21, tracker issue):
#
# The Linear MCP relay silently NO-OPS `state` writes made BY NAME, on the
# current relay, INTERMITTENTLY. In one session, 8 creates with state:"Todo"
# landed 4 in Todo and 4 in Backlog — same call, different outcome. The call
# returns 200 and the field is accepted, but the issue lands in Backlog (on
# CREATE) or stays in the old state (on UPDATE). tracker issue/5981/5985/5986 fell
# into Backlog and had to be flipped by hand.
#
# The sibling PreToolUse hook (pre-linear-save-issue-hygiene.sh) cannot catch
# this: it runs BEFORE the call and only checks that `state` is PRESENT in the
# request. It has no way to see whether the write actually landed. This hook is
# the POST-write half — it reads the state the response came back with and
# compares it to what was asked.
#
# ── Detection (precision over recall — a noisy warn-mode hook gets tuned out) ──
#
# Fires only when a `state` was requested AND the landed state is knowable AND:
#
#   A. Backlog landing (THE documented bug): a non-Backlog state was requested
#      but the issue came back in Backlog. Near-zero false positives.
#   B. State mismatch (the UPDATE "stayed in the old state" case): the request
#      was a plain state NAME and the landed state name differs from it.
#
# Deliberately NOT covered (to avoid false positives, since these are correct):
#   - Requests made by state ID (a UUID) — this is the RELIABLE workaround, not
#     the bug; we cannot name-compare a UUID, so we skip.
#   - Requests made by state TYPE keyword (unstarted/started/completed/…) — a
#     type request is compared against the landed *type*, not the name, so
#     "unstarted" landing as "Todo" is correctly treated as a match.
#
# ── Robustness ────────────────────────────────────────────────────────────────
#
# No in-repo precedent reads `.tool_response`, and its exact shape for MCP tools
# is not documented here, so the extractor tries every plausible Claude Code
# shape: `.tool_response` as an object, as a JSON string, or as the MCP
# content-wrapper `{content:[{text:"<json>"}]}`. If none yields a status, the
# hook exits 0 (no warning) — a wrong-shape assumption degrades to a silent
# no-op, NEVER to a false block. NEVER blocks on any path (exit 0 always).
#
# Dependencies: bash, jq (fails open if missing).

set -u

command -v jq >/dev/null 2>&1 || exit 0  # fail-open: never interfere on missing infra

INPUT="$(cat 2>/dev/null || true)"
[ -n "$INPUT" ] || exit 0

# Scope: Linear save_issue only (the matcher already scopes this, but be defensive).
TOOL_NAME="$(printf '%s' "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null)" || exit 0
case "$TOOL_NAME" in
  *linear*save_issue*) : ;;
  *) exit 0 ;;
esac

# If the MCP call errored, there is nothing landed to trust — fail open.
IS_ERROR="$(printf '%s' "$INPUT" | jq -r '.tool_response.isError // false' 2>/dev/null)" || IS_ERROR="false"
[ "$IS_ERROR" = "true" ] && exit 0

# ── The triage fields, not just the state (tracker issue, measured 2026-08-06) ─────
#
# `state` was the only field this hook checked, because tracker issue measured the
# no-op on `state`. On 2026-08-06 a CREATE carrying `project` and `milestone`
# — both accepted, call returned 200 — came back with NEITHER, and the issue
# sat with no project until it was noticed by eye. An UPDATE with the same two
# fields applied them immediately, so the drop is specific to CREATE.
#
# That matters for what the sibling PreToolUse hook can promise. It BLOCKS a
# create missing any of these, so it guarantees the fields were ASKED FOR — and
# its own header says the agent must verify afterwards. Today's create passed
# that gate and still landed orphaned: a hook that validates the REQUEST cannot
# see the RESULT, and "the agent verifies" is not a mechanism.
#
# Precision, since a warn-mode hook that cries wolf gets tuned out: a field is
# only reported when it was REQUESTED and is ABSENT from the response. A field
# nobody asked for is silent, and an unparseable response is silent.
report_missing() {
  local requested="$1" landed="$2" name="$3" fix="$4"
  [ -n "$requested" ] || return 0
  [ -n "$landed" ] && return 0
  DROPPED+=("$name — requested, absent from the response. $fix")
}

DROPPED=()
IS_CREATE="$(printf '%s' "$INPUT" | jq -r '(.tool_input | has("id")) | not' 2>/dev/null)" || IS_CREATE="false"

if [ "$IS_CREATE" = "true" ]; then
  # One jq pass over both sides, joined on US (0x1f) and NOT on a tab.
  #
  # `@tsv` + `IFS=$'\t' read` looks right and silently corrupts this: TAB is an
  # IFS *whitespace* character, so bash collapses runs of them into one
  # delimiter. Every empty field — which is exactly the case this hook exists to
  # detect — vanishes, and the remaining values shift left. The first version
  # read the milestone as the landed project and reported nothing at all.
  # 0x1f is not IFS whitespace, so empty fields stay positional. The test suite
  # carries the all-fields-dropped case specifically to pin this.
  FIELDS="$(printf '%s' "$INPUT" | jq -r '
    def parse: if type == "string" then (fromjson? // {}) elif type == "object" then . else {} end;
    (.tool_response | parse) as $raw
    | (if ($raw.content? | type) == "array" then (($raw.content[0].text) | parse) else $raw end) as $r
    | .tool_input as $in
    # An unparseable or unrecognised response is UNKNOWABLE, not "everything was
    # dropped". A successful create always returns the issue id, so its absence
    # means we are looking at something other than the issue — emit nothing and
    # let the hook stay silent. Without this the string "garbage" reads as four
    # dropped fields.
    | select((($r.id // $r.identifier // "") | tostring) != "")
    | [ ($in.project // ""       | tostring), (($r.project // $r.projectId // "") | tostring)
      , ($in.milestone // ""     | tostring), (($r.projectMilestone.id // $r.projectMilestone // "") | tostring)
      , ($in.assignee // ""      | tostring), (($r.assignee // $r.assigneeId // "") | tostring)
      , (($in.labels // []) | length | tostring), (($r.labels // []) | length | tostring)
      ] | join("")
  ' 2>/dev/null)" || FIELDS=""

  if [ -n "$FIELDS" ]; then
    IFS=$'\037' read -r REQ_PROJ GOT_PROJ REQ_MS GOT_MS REQ_ASG GOT_ASG REQ_LBL GOT_LBL <<<"$FIELDS"

    report_missing "$REQ_PROJ" "$GOT_PROJ" "project" \
      "Re-apply with save_issue {id, project} — an UPDATE with the same value applies it."
    report_missing "$REQ_MS" "$GOT_MS" "milestone" \
      "Re-apply with save_issue {id, milestone} — pass the milestone UUID, not its name."
    report_missing "$REQ_ASG" "$GOT_ASG" "assignee" \
      "Re-apply with save_issue {id, assignee}."
    # Labels are a COUNT, not a presence test: a partial application (3 asked,
    # 1 landed) is the same defect and an absence test would call it fine.
    if [ "${REQ_LBL:-0}" -gt 0 ] && [ "${GOT_LBL:-0}" -lt "${REQ_LBL:-0}" ]; then
      DROPPED+=("labels — asked for ${REQ_LBL}, ${GOT_LBL} landed. Re-apply with save_issue {id, labels}.")
    fi
  fi
fi

if [ "${#DROPPED[@]}" -gt 0 ]; then
  CREATED_ID="$(printf '%s' "$INPUT" | jq -r '
    def parse: if type == "string" then (fromjson? // {}) elif type == "object" then . else {} end;
    (.tool_response | parse) as $raw
    | (if ($raw.content? | type) == "array" then (($raw.content[0].text) | parse) else $raw end) as $r
    | (($r.identifier) // ($r.id) // "")
  ' 2>/dev/null)" || CREATED_ID=""
  [ -n "$CREATED_ID" ] || CREATED_ID="<the issue you just created>"
  {
    echo ""
    echo "─── [tracker issue] Triage fields did NOT land on CREATE — WARN ───"
    echo ""
    echo "The create was accepted and returned 200. These fields were in the"
    echo "request and are NOT in the issue:"
    echo ""
    for d in "${DROPPED[@]}"; do echo "  • $d"; done
    echo ""
    echo "The PreToolUse hygiene hook passed, and could not have caught this: it"
    echo "checks the REQUEST. Verify with get_issue $CREATED_ID before treating"
    echo "the issue as triaged — an issue with no project sits in an orphan view."
    echo ""
    echo "This is a warning, not a block. The save_issue result is unaffected."
    echo "Hook: .claude/hooks/post-linear-save-issue-state-landed.sh"
    echo "────────────────────────────────────────────"
    echo ""
  } >&2
fi

# ── The state check (tracker issue) ───────────────────────────────────────────────
# The state the request ASKED for. No state requested → nothing to verify.
REQ_STATE="$(printf '%s' "$INPUT" | jq -r '.tool_input.state // empty' 2>/dev/null)" || exit 0
REQ_STATE="$(printf '%s' "$REQ_STATE" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
[ -n "$REQ_STATE" ] || exit 0

# The state the response CAME BACK with. Robust to object / JSON-string / MCP
# content-wrapper shapes; empty when unknowable (→ fail open below).
LANDED="$(printf '%s' "$INPUT" | jq -r '
  def parse: if type == "string" then (fromjson? // {}) elif type == "object" then . else {} end;
  (.tool_response | parse) as $r
  | (($r.status)     // (try (($r.content[0].text) | parse | .status)     catch null) // "") as $s
  | (($r.statusType) // (try (($r.content[0].text) | parse | .statusType) catch null) // "") as $t
  | [$s, $t] | @tsv
' 2>/dev/null)" || exit 0

LANDED_STATUS="$(printf '%s' "$LANDED" | cut -f1 | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
LANDED_TYPE="$(printf '%s' "$LANDED" | cut -f2 | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"

# Cannot determine where it landed → fail open (silent no-op, never a false warn).
[ -n "$LANDED_STATUS" ] || [ -n "$LANDED_TYPE" ] || exit 0

lower() { printf '%s' "$1" | tr '[:upper:]' '[:lower:]'; }
REQ_LC="$(lower "$REQ_STATE")"
STATUS_LC="$(lower "$LANDED_STATUS")"
TYPE_LC="$(lower "$LANDED_TYPE")"

# Requests made by state ID (UUID) are the reliable workaround, not the bug — skip.
case "$REQ_STATE" in
  [0-9a-fA-F]*-[0-9a-fA-F]*-[0-9a-fA-F]*-[0-9a-fA-F]*-[0-9a-fA-F]*) exit 0 ;;
esac

REASON=""

case "$REQ_LC" in
  started|unstarted|completed|canceled|cancelled|backlog|triage|duplicate)
    # Request was a TYPE keyword — compare against the landed TYPE, not the name.
    if [ -n "$TYPE_LC" ]; then
      if [ "$REQ_LC" != "backlog" ] && [ "$TYPE_LC" = "backlog" ]; then
        REASON="requested type \"$REQ_STATE\" but the issue landed in Backlog (status \"$LANDED_STATUS\")"
      elif [ "$REQ_LC" != "$TYPE_LC" ]; then
        REASON="requested type \"$REQ_STATE\" but the issue landed with type \"$LANDED_TYPE\" (status \"$LANDED_STATUS\")"
      fi
    fi
    ;;
  *)
    # Request was a state NAME — compare against the landed name.
    if [ -n "$STATUS_LC" ]; then
      if [ "$REQ_LC" != "backlog" ] && { [ "$STATUS_LC" = "backlog" ] || [ "$TYPE_LC" = "backlog" ]; }; then
        REASON="requested \"$REQ_STATE\" but the issue landed in Backlog"
      elif [ "$REQ_LC" != "$STATUS_LC" ]; then
        REASON="requested \"$REQ_STATE\" but the issue landed in \"$LANDED_STATUS\""
      fi
    fi
    ;;
esac

[ -n "$REASON" ] || exit 0  # landed where it was asked → silence (no noise on the happy path)

ISSUE_ID="$(printf '%s' "$INPUT" | jq -r '
  def parse: if type == "string" then (fromjson? // {}) elif type == "object" then . else {} end;
  (.tool_response | parse) as $r
  | (($r.identifier) // ($r.id) // (try (($r.content[0].text) | parse | (.identifier // .id)) catch null) // "")
' 2>/dev/null)" || ISSUE_ID=""
[ -n "$ISSUE_ID" ] || ISSUE_ID="<the issue you just saved>"

{
  echo ""
  echo "─── [tracker issue] Linear state did NOT land — WARN ───"
  echo ""
  echo "save_issue $REASON."
  echo ""
  echo "The Linear MCP relay SILENTLY and INTERMITTENTLY no-ops \`state\` writes"
  echo "made by NAME. The call returned 200 and accepted the field, but the state"
  echo "did not stick. Do NOT trust the write — fix it now:"
  echo ""
  echo "  1. Re-set the state with the EXPLICIT the product status ID (IDs bypass the"
  echo "     name-resolution path that no-ops):"
  echo "       Todo        = db2bff57-cee9-456c-93a2-6bdc02d9812e"
  echo "       In Progress = 8062bb95-e0c7-4ba4-aedb-4d5e791256e9"
  echo "       Done        = ebed9ace-d145-4839-9110-c60f6e5c13a1"
  echo "     (Other states: list_issue_statuses team:\"the product\".)"
  echo "  2. VERIFY with get_issue $ISSUE_ID that \`status\` is what you intended."
  echo ""
  echo "This is a warning, not a block. The save_issue result is unaffected."
  echo "Hook: .claude/hooks/post-linear-save-issue-state-landed.sh"
  echo "────────────────────────────────────────────"
  echo ""
} >&2

exit 0
