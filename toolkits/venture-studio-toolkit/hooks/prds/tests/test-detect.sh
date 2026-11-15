#!/usr/bin/env bash
# Tests for shared/hooks/prds/detect.py (no network gh required for unit cases).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DETECT="$ROOT/detect.py"
PASS=0
FAIL=0

assert_exit() {
  local want="$1" label="$2"
  shift 2
  local log
  log="$(mktemp)"
  set +e
  python3 "$DETECT" "$@" >"$log" 2>"$log.err"
  code=$?
  set -e
  if [ "$code" -eq "$want" ]; then
    echo "OK  $label"
    PASS=$((PASS + 1))
  else
    echo "FAIL $label (want exit $want, got $code)"
    head -5 "$log.err"
    head -5 "$log"
    FAIL=$((FAIL + 1))
  fi
  rm -f "$log" "$log.err"
}

GOOD_BODY='## Summary
- Add login endpoint for the auth service
- Why now: ticket ABC-1 blocks the checkout flow

## Tracker
Fixes ABC-1
- Issue: https://example.com/ABC-1

## Test plan
- [x] unit tests for login

## Scope boundaries (out of scope)
- password reset flow

## Risk / rollout
N/A

## Screenshots / evidence
N/A
'

BAD_BODY='## Summary
only summary
'

STE_BAD_BODY='## Summary
- Spin up the robust auth flow; then verify and check the seamless login

## Tracker
Fixes ABC-1

## Test plan
- [x] unit

## Scope boundaries
- none
'

# Non-trigger → allow
assert_exit 0 "unrelated command" --command 'npm test'

# gh create without body → deny
assert_exit 2 "gh pr create no body" --command 'gh pr create --title "x" --draft'

# gh create with incomplete inline body → deny
assert_exit 2 "gh pr create bad inline body" --command 'gh pr create --body "## Summary
only"'

# bypass → allow even without body
assert_exit 0 "bypass flag" --command 'gh pr create --title x  # hook-bypass: prds-body-deferred'

REF_BODY='## Summary
- Document the Ref tracker path for devel PRs

## Tracker
Ref SCRT-998

## Test plan
- [x] unit

## Scope boundaries
- docs only
'

# body-file
TMP="$(mktemp)"
printf '%s' "$GOOD_BODY" >"$TMP"
assert_exit 0 "gh pr create --body-file good" --command "gh pr create --body-file $TMP"
printf '%s' "$BAD_BODY" >"$TMP"
assert_exit 2 "gh pr create --body-file bad" --command "gh pr create --body-file $TMP"
printf '%s' "$REF_BODY" >"$TMP"
assert_exit 0 "gh pr create devel + Ref tracker" --command "gh pr create --base devel --body-file $TMP"
assert_exit 2 "gh pr create main + Ref only" --command "gh pr create --base main --body-file $TMP"
printf '%s' "$STE_BAD_BODY" >"$TMP"
assert_exit 2 "gh pr create STE prose hard fail" --command "gh pr create --body-file $TMP"
printf '%s' "# hook-bypass: ste-prose-deferred
$STE_BAD_BODY" >"$TMP"
assert_exit 0 "STE prose bypass" --command "gh pr create --body-file $TMP"
printf '%s' "# hook-bypass: prds-body-deferred
$REF_BODY" >"$TMP"
assert_exit 0 "body-file hook-bypass" --command "gh pr create --base main --body-file $TMP"
rm -f "$TMP"

# git push dry-run → allow
assert_exit 0 "git push dry-run" --command 'git push --dry-run origin HEAD'

echo "--- $PASS passed, $FAIL failed ---"
[ "$FAIL" -eq 0 ]
