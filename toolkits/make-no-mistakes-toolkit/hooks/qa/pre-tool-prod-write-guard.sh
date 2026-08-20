#!/bin/bash
# PreToolUse hook: block a browser-driven MUTATION against a PRODUCTION origin
# unless a human has armed it.
#
# Origin: tracker issue, implementing Decision 7 of the tracker issue decision record
# (the project decision record).
#
# The failure it prevents
# -----------------------
# A /bug-squash Phase-2 round drives the owner's REAL production account
# through a destructive journey (enroll -> complete -> certificate). Review
# finding B1: the "confirm before every PROD write" that authorized this was
# PROSE in a Markdown command — an instruction, with nothing structurally
# enforcing it. A looping or misbehaving agent could move a real production score and
# mint a publicly-verifiable certificate with no mechanism able to stop it.
#
# This hook is that mechanism. The confirm is now a file only a human can
# create, and it is spent on first use.
#
# Logic
# -----
#   1. Tool is not browser-mutating (per mutatingToolPatterns) -> allow.
#   2. Page origin is NOT a PROD origin -> allow. Local and staging rounds run
#      with zero friction; this is deliberate, because a round runs LOCAL FIRST
#      (the only way to cover the free / pro-vip / anon / instructor matrix)
#      and PROD is only the confirmation pass.
#   3. PROD origin and NO armed token -> block (exit 2) with guidance. This is
#      the Phase-1 default: read-only.
#   4. PROD origin and an armed token -> allow ONCE, then consume the token
#      (renamed to <name>.consumed-<epoch>, leaving a residue-inventory trail).
#
# Honest limits
# -------------
#   - The guard sees TOOL CALLS, not INTENT. `evaluate_script` is gated because
#     page JS can mutate, but a mutation disguised inside a read-shaped script
#     payload is not statically decidable.
#   - Origin resolution reads FOUR sources as a UNION, not a precedence chain:
#     the call's own url, $MNM_QA_ORIGIN, .claude/qa/.current-origin, and a
#     URL-shaped scan of the serialized tool_input. Any one of them naming a
#     PROD host blocks. This matters because .current-origin is written by a
#     prose instruction in the adapter, so it CAN go stale — and until 2026-07-25
#     a stale value silently disabled the payload scan, making a wrong origin
#     file strictly worse than no origin file. It is now corroborating evidence,
#     never an authority that can clear a call.
#   - An origin that no source resolves is still treated as NON-PROD and allowed.
#     Failing closed on every browser call would make the tool unusable, and
#     local-first rounds must run without friction.
#   - It raises the floor from "nothing" to "an explicit human act per PROD
#     write". That is precisely the gap B1 identified, and no more.
#
# Dependencies: bash 4+, jq. Missing jq / absent contract / malformed stdin
# -> FAILS OPEN (exit 0), same convention as every hook in this directory.
#
# Contract: .claude/qa/prod-origins.json
#
# EXIT CODES: a blocking PreToolUse hook exits **2**. Exit 1 is reported by the
# harness as a NON-blocking error and the tool call runs anyway, so this hook
# printed BLOCKED and enforced nothing from the day it shipped until tracker issue.
# Its test suite asserts 2 — do not "simplify" the blocking path back to 1.
# Tooling failures (missing jq, malformed stdin, absent contract) still exit 0:
# a hook bug must never block all work.

set -u

HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Consumer repo root (plugin install path ≠ project). Fail-open without contract.
REPO_ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
CONTRACT_JSON="${REPO_ROOT}/.claude/qa/prod-origins.json"

if ! command -v jq >/dev/null 2>&1; then
  echo "[pre-tool-prod-write-guard.sh] WARN: jq not found; failing open." >&2
  exit 0
fi

if [[ ! -f "$CONTRACT_JSON" ]]; then
  echo "[pre-tool-prod-write-guard.sh] WARN: contract not found at $CONTRACT_JSON; failing open." >&2
  exit 0
fi

HOOK_INPUT=$(cat)

TOOL_NAME=$(printf '%s\n' "$HOOK_INPUT" | jq -r '.tool_name // empty' 2>/dev/null) || {
  echo "[pre-tool-prod-write-guard.sh] WARN: jq parse failed; failing open." >&2
  exit 0
}
[[ -z "$TOOL_NAME" ]] && exit 0

# --- (1) Is this a browser-mutating tool? -----------------------------------
IS_MUTATING=""
while IFS= read -r pat; do
  [[ -z "$pat" ]] && continue
  if printf '%s' "$TOOL_NAME" | grep -qE "$pat"; then
    IS_MUTATING="yes"
    break
  fi
done < <(jq -r '.mutatingToolPatterns[]?' "$CONTRACT_JSON" 2>/dev/null)
[[ -z "$IS_MUTATING" ]] && exit 0

# --- (2) Resolve the page origin --------------------------------------------
TOOL_INPUT_RAW=$(printf '%s\n' "$HOOK_INPUT" | jq -c '.tool_input // {}' 2>/dev/null) || TOOL_INPUT_RAW="{}"

ORIGIN=""
ORIGIN_SOURCE=""

# (a) An explicit URL on the call itself.
CANDIDATE=$(printf '%s\n' "$HOOK_INPUT" | jq -r '.tool_input.url // .tool_input.href // empty' 2>/dev/null) || CANDIDATE=""
if [[ -n "$CANDIDATE" ]]; then
  ORIGIN="$CANDIDATE"
  ORIGIN_SOURCE="tool_input.url"
fi

# (b) Environment pin.
if [[ -z "$ORIGIN" && -n "${MNM_QA_ORIGIN:-}" ]]; then
  ORIGIN="$MNM_QA_ORIGIN"
  ORIGIN_SOURCE="MNM_QA_ORIGIN"
fi

# (c) The adapter's recorded current origin.
if [[ -z "$ORIGIN" ]]; then
  ORIGIN_FILE_REL=$(jq -r '.currentOriginFile // empty' "$CONTRACT_JSON" 2>/dev/null) || ORIGIN_FILE_REL=""
  if [[ -n "$ORIGIN_FILE_REL" && -f "${REPO_ROOT}/${ORIGIN_FILE_REL}" ]]; then
    ORIGIN=$(head -1 "${REPO_ROOT}/${ORIGIN_FILE_REL}" 2>/dev/null | tr -d '[:space:]')
    ORIGIN_SOURCE="$ORIGIN_FILE_REL"
  fi
fi

# Reduce a URL to its host.
host_of() {
  local raw="$1"
  raw="${raw#*://}"
  raw="${raw%%/*}"
  raw="${raw%%\?*}"
  raw="${raw%%:*}"
  raw="${raw##*@}"
  printf '%s' "$raw"
}
HOST=""
[[ -n "$ORIGIN" ]] && HOST=$(host_of "$ORIGIN")

IS_PROD=""
MATCHED_ORIGIN=""
while IFS= read -r prod; do
  [[ -z "$prod" ]] && continue
  # Exact host match — never a substring, so `prod.example.com.attacker.test` and a
  # localhost page that merely mentions the domain do not both collapse here.
  if [[ -n "$HOST" && "$HOST" == "$prod" ]]; then
    IS_PROD="yes"
    MATCHED_ORIGIN="$prod"
    break
  fi
done < <(jq -r '.prodOrigins[]?' "$CONTRACT_JSON" 2>/dev/null)

# (d) Independent corroboration from the payload itself.
#
# This runs whenever (a)-(c) did not already resolve to PROD — INCLUDING when
# they resolved to a non-PROD host. That is the whole point, and it used to be
# gated on `-z "$HOST"`, which made a resolved-but-WRONG origin authoritative:
#
#   `.claude/qa/.current-origin` says `localhost:5173` because the round
#   navigated to production without re-running the line that records the
#   origin. A click naming `https://www.example.com/...` resolved cleanly to a
#   non-PROD host, this scan never ran, and the mutation went through.
#
# Measured: with the stale file present the same payload PASSED; with no origin
# file at all it BLOCKED. A stale origin file was strictly worse than none —
# the inverse of what a safety control must do. Sources are now a UNION, not a
# precedence chain: any one of them naming PROD is enough.
#
# The match is URL-SHAPED (`scheme://host` or `//host`, ending at a delimiter),
# never a bare substring. A local page that merely mentions the domain in prose,
# a selector, or an assertion string does not trip it; an actual navigation or
# fetch target does. Errs toward blocking, which is the safe direction — a false
# block costs one armed token, a false pass costs a production mutation.
if [[ -z "$IS_PROD" ]]; then
  while IFS= read -r prod; do
    [[ -z "$prod" ]] && continue
    prod_re=$(printf '%s' "$prod" | sed 's/[].[^$*\/]/\\&/g')
    if printf '%s' "$TOOL_INPUT_RAW" | grep -qE "(https?:)?//${prod_re}([/:?#\"']|\\\\|$)"; then
      IS_PROD="yes"
      MATCHED_ORIGIN="$prod"
      if [[ -n "$HOST" ]]; then
        # The recorded origin and the payload disagree. The payload wins, and
        # the operator needs to know their origin file is lying — that stale
        # file is the actual defect to fix, not this block.
        ORIGIN_SOURCE="tool_input URL (OVERRIDES ${ORIGIN_SOURCE:-recorded origin} = ${HOST}, which is STALE)"
      else
        ORIGIN_SOURCE="tool_input URL"
      fi
      break
    fi
  done < <(jq -r '.prodOrigins[]?' "$CONTRACT_JSON" 2>/dev/null)
fi

# Not PROD (or origin unresolvable) -> allow. Local-first rounds run unimpeded.
if [[ -z "$IS_PROD" ]]; then
  exit 0
fi

# --- (3)/(4) Armed token ------------------------------------------------------
SEARCH_ROOT=$(jq -r '.armedTokenSearchRoot // empty' "$CONTRACT_JSON" 2>/dev/null) || SEARCH_ROOT=""
TOKEN_NAME=$(jq -r '.armedTokenFilename // empty' "$CONTRACT_JSON" 2>/dev/null) || TOKEN_NAME=""

if [[ -z "$SEARCH_ROOT" || -z "$TOKEN_NAME" ]]; then
  echo "[pre-tool-prod-write-guard.sh] WARN: could not read armed-token config; failing open." >&2
  exit 0
fi

TOKEN_PATH=""
if [[ -n "${MNM_QA_ARMED_TOKEN:-}" && -f "${MNM_QA_ARMED_TOKEN}" ]]; then
  TOKEN_PATH="${MNM_QA_ARMED_TOKEN}"
elif [[ -d "${REPO_ROOT}/${SEARCH_ROOT}" ]]; then
  TOKEN_PATH=$(find "${REPO_ROOT}/${SEARCH_ROOT}" -maxdepth 2 -type f -name "$TOKEN_NAME" 2>/dev/null | head -1)
fi

TOKEN_REASON=""
if [[ -n "$TOKEN_PATH" && -f "$TOKEN_PATH" ]]; then
  TOKEN_REASON=$(tr -d '\000' < "$TOKEN_PATH" 2>/dev/null | grep -v '^[[:space:]]*$' | head -3)
fi

if [[ -n "$TOKEN_PATH" && -n "$TOKEN_REASON" ]]; then
  # Consume it: single-use, with an audit trail for the residue inventory.
  CONSUMED="${TOKEN_PATH}.consumed-$(date -u +%s)"
  if mv "$TOKEN_PATH" "$CONSUMED" 2>/dev/null; then
    echo "[pre-tool-prod-write-guard.sh] PROD write ARMED and CONSUMED (${TOOL_NAME} on ${MATCHED_ORIGIN})." >&2
    echo "  authorized: ${TOKEN_REASON}" >&2
    echo "  token spent -> ${CONSUMED#"${REPO_ROOT}/"}" >&2
    echo "  Re-arm for the NEXT write, and record this in the round's residue inventory." >&2
    exit 0
  fi
  echo "[pre-tool-prod-write-guard.sh] WARN: could not consume ${TOKEN_PATH}; failing open." >&2
  exit 0
fi

EMPTY_NOTE=""
if [[ -n "$TOKEN_PATH" ]]; then
  EMPTY_NOTE="
An armed token EXISTS but is EMPTY: ${TOKEN_PATH#"${REPO_ROOT}/"}
The token IS the written authorization — it must name the action. An empty
file is not a decision, so it does not arm anything."
fi

cat >&2 <<EOF
BLOCKED: browser MUTATION against a PRODUCTION origin, with no armed token.

Tool:   ${TOOL_NAME}
Origin: ${MATCHED_ORIGIN}${ORIGIN_SOURCE:+  (resolved from ${ORIGIN_SOURCE})}
${EMPTY_NOTE}
A /bug-squash round is READ-ONLY by default (Phase 1). Writes against real
production data — a real production score, a publicly-verifiable certificate, real
enrollment rows — are Phase 2, and Phase 2 is opt-in per action.

To proceed, a HUMAN (not the agent) creates the armed token:

    echo "<the exact action being authorized>" \\
      > ${SEARCH_ROOT}/<pillar>-<date>/${TOKEN_NAME}

It is SINGLE-USE: this guard consumes it on the first PROD mutation and the
next one blocks again. The agent must not create it on its own authority —
that is what makes this a mechanism rather than an instruction.

If you did not intend a PROD write:
  - Re-run the case against local (a round is local-first by design; local is
    also the ONLY way to cover the free / pro-vip / anon / instructor matrix).
  - Or use a read-shaped tool (screenshot / snapshot / read_page / network).

Every Phase-2 write must land in the round's residue inventory
(docs/qa/rounds/<pillar>-<date>/round.md). The journey is one-shot per account:
certificates are unique on (user, course).

Contract: .claude/qa/prod-origins.json
Blocked by: .claude/hooks/pre-tool-prod-write-guard.sh (PreToolUse: ${TOOL_NAME})
EOF
# exit 2, not 1: only exit 2 BLOCKS a PreToolUse call (tracker issue).
exit 2
