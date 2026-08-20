#!/bin/bash
# PreToolUse hook (tracker issue): keep observability instrumentation on the
# Observability Layer's canonical path:
#
#   instrument -> resolve -> emit -> retain -> assert -> report -> account
#
# This hook owns the INSTRUMENT stage only. The `resolve` stage (tracker issue,
# "nothing may name what does not exist") is a resolver, not a denylist, and
# gets its own mechanism — do not fold its consumers into the contract below.
#
# Four chokepoints are guarded. Bypassing any of them compiles, passes tests,
# reviews clean, and fails silently in legal compliance or data integrity:
#
#   posthog-js   skips the consent gate and the session wrapper
#   window.fbq   skips the GDPR consent check; without a shared event ID Meta
#                double-counts the conversion, halving reported CPA
#   Sentry.init  a second init disables beforeSend PII scrubbing
#   web-vitals   a component calling onLCP/onINP/onCLS itself reports outside
#                the consent gate and without the event envelope (tracker issue)
#
# posthog-js WARNS (11 live violators on develop 2026-07-27); the other three
# BLOCK (zero violators — web-vitals measured 2026-07-29, one importer and it
# is allowlisted). A blocking gate with a pre-existing backlog gets disabled
# within a week; blocking a clean pattern is free and keeps it clean.
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
CONTRACT_JSON="${OBSERVABILITY_GUARDRAIL_JSON:-${REPO_ROOT}/observability-guardrail.json}"
# Also accept the house path under .claude/config/
if [[ ! -f "$CONTRACT_JSON" && -f "${REPO_ROOT}/.claude/config/observability-guardrail.json" ]]; then
  CONTRACT_JSON="${REPO_ROOT}/.claude/config/observability-guardrail.json"
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "[pre-write-observability-guard.sh] WARN: jq not found; failing open." >&2
  exit 0
fi

if [[ ! -f "$CONTRACT_JSON" ]]; then
  echo "[pre-write-observability-guard.sh] WARN: contract not found at $CONTRACT_JSON; failing open." >&2
  exit 0
fi

HOOK_INPUT=$(cat)

TOOL_NAME=$(printf '%s\n' "$HOOK_INPUT" | jq -r '.tool_name // empty' 2>/dev/null) || {
  echo "[pre-write-observability-guard.sh] WARN: jq parse failed; failing open." >&2
  exit 0
}
FILE_PATH=$(printf '%s\n' "$HOOK_INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null) || {
  echo "[pre-write-observability-guard.sh] WARN: jq parse failed; failing open." >&2
  exit 0
}

[[ -z "$FILE_PATH" ]] && exit 0

case "$TOOL_NAME" in
  Write)
    PAYLOAD=$(printf '%s\n' "$HOOK_INPUT" | jq -r '.tool_input.content // empty' 2>/dev/null) || PAYLOAD=""
    ;;
  Edit)
    PAYLOAD=$(printf '%s\n' "$HOOK_INPUT" | jq -r '.tool_input.new_string // empty' 2>/dev/null) || PAYLOAD=""
    ;;
  MultiEdit)
    PAYLOAD=$(printf '%s\n' "$HOOK_INPUT" | jq -r '[.tool_input.edits[]?.new_string] | join("\n")' 2>/dev/null) || PAYLOAD=""
    ;;
  *)
    exit 0
    ;;
esac

[[ -z "$PAYLOAD" ]] && exit 0

# Only guard source we own. Docs may quote these symbols freely.
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx) ;;
  *) exit 0 ;;
esac

glob_allowlisted() {
  local key="$1"
  local path="$2"
  local entry re

  while IFS= read -r entry; do
    [[ -z "$entry" ]] && continue
    re="${entry//./\\.}"
    # Protect globstars while translating single stars, or the `*` introduced
    # by `**` -> `.*` is translated twice and recursive globs match one segment.
    re="${re//\/\*\*/__OBS_GLOBSTAR_SLASH__}"
    re="${re//\*\*/__OBS_GLOBSTAR__}"
    re="${re//\*/[^/]*}"
    re="${re//__OBS_GLOBSTAR_SLASH__/(/.*)?}"
    re="${re//__OBS_GLOBSTAR__/.*}"
    if [[ "$path" =~ (^|/)${re}$ ]] || [[ "$path" =~ (^|/)${re}(/|$) ]]; then
      return 0
    fi
  done < <(jq -r --arg key "$key" '.[$key][]?' "$CONTRACT_JSON" 2>/dev/null)

  return 1
}

is_content_allowlisted() {
  glob_allowlisted "allowlist" "$1"
}

# Tests, stories and setup files legitimately mock these globals.
if is_content_allowlisted "$FILE_PATH"; then
  exit 0
fi

# Strip comment-only lines before matching. Docstrings legitimately name these
# symbols — `DataRoomUpsellLanding.tsx` documents the fbq rule in a JSDoc block,
# and without this the guard would block every future edit to its own citation.
# A line whose first non-space character is `*`, `//` or `/*` cannot carry
# executable code, so dropping it cannot hide a real call.
PAYLOAD=$(printf '%s\n' "$PAYLOAD" | sed -E '/^[[:space:]]*(\*|\/\/|\/\*)/d')

[[ -z "$PAYLOAD" ]] && exit 0

POSTHOG_IMPORT_REGEX="from[[:space:]]+['\"\`]posthog-js"
META_PIXEL_REGEX="(window\.fbq|(^|[^.[:alnum:]_])fbq[[:space:]]*\()"
SENTRY_INIT_REGEX="Sentry\.init[[:space:]]*\("
# Matches the bare package and its subpath entries (`web-vitals/attribution`).
WEB_VITALS_IMPORT_REGEX="from[[:space:]]+['\"\`]web-vitals"

BLOCK_KIND=""
WARN_KIND=""

if [[ "$PAYLOAD" =~ $POSTHOG_IMPORT_REGEX ]] && ! glob_allowlisted "posthogImportAllowlist" "$FILE_PATH"; then
  WARN_KIND="direct posthog-js import"
fi

if [[ "$PAYLOAD" =~ $META_PIXEL_REGEX ]] && ! glob_allowlisted "metaPixelAllowlist" "$FILE_PATH"; then
  BLOCK_KIND="direct Meta Pixel call (window.fbq)"
fi

if [[ "$PAYLOAD" =~ $SENTRY_INIT_REGEX ]] && ! glob_allowlisted "sentryInitAllowlist" "$FILE_PATH"; then
  BLOCK_KIND="${BLOCK_KIND:+${BLOCK_KIND}, }second Sentry.init"
fi

if [[ "$PAYLOAD" =~ $WEB_VITALS_IMPORT_REGEX ]] && ! glob_allowlisted "webVitalsImportAllowlist" "$FILE_PATH"; then
  BLOCK_KIND="${BLOCK_KIND:+${BLOCK_KIND}, }direct web-vitals import"
fi

if [[ -n "$WARN_KIND" && -z "$BLOCK_KIND" ]]; then
  cat >&2 <<EOF
[pre-write-observability-guard.sh] WARN: ${WARN_KIND} in ${FILE_PATH}

Instrumentation belongs behind a shared hook. A direct posthog-js import skips
the consent gate and the session wrapper, and off-shape events pollute the
funnels that later decide roadmap.

  use: usePostHogAnalytics  (src/hooks/usePostHogAnalytics.ts)

This warns rather than blocks because 11 files already do it (measured
2026-07-27). Do not add a twelfth. Reference: docs/agent-standards/observability.md
EOF
  exit 0
fi

if [[ -z "$BLOCK_KIND" ]]; then
  exit 0
fi

cat >&2 <<EOF
BLOCKED: Observability guardrail rejected instrumentation drift (tracker issue).

Attempted: ${FILE_PATH}
Pattern:   ${BLOCK_KIND}

Instrumentation must go through the shared chokepoint, never a vendor global
inside product code:

  window.fbq    -> useMetaTracking  (src/hooks/useMetaTracking.ts)
  Sentry.init   -> src/lib/sentry.ts | supabase/functions/_shared/sentry.ts
  web-vitals    -> useWebVitals     (src/hooks/useWebVitals.ts)

Why these block instead of warning: all three patterns currently have ZERO
violators outside their own chokepoint, so the state is clean and cheap to
keep. Bypassing them compiles, passes tests and reviews clean, then fails
silently:

  - window.fbq skips the GDPR consent check, and with no shared event ID Meta
    counts the conversion twice, so reported cost-per-acquisition reads at half
    the real figure.
  - A second Sentry.init overrides the shared config and disables beforeSend
    PII scrubbing, shipping user data to an external service.
  - A component calling onLCP/onINP/onCLS itself reports outside the marketing-
    consent gate and without the event envelope, so the measurement carries no
    product/surface and cannot be joined to anything.

Content allowlist:
$(jq -r '.allowlist[] | "  - " + .' "$CONTRACT_JSON" 2>/dev/null)

To approve a real exception, edit observability-guardrail.json in the same
change so the contract stays reviewable.

Reference:
  docs/agent-standards/observability.md
  the project decision record

Blocked by: .claude/hooks/pre-write-observability-guard.sh (PreToolUse: ${TOOL_NAME})
EOF
# exit 2, not 1: only exit 2 BLOCKS a PreToolUse call (tracker issue).
exit 2
