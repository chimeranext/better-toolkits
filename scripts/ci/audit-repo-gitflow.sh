#!/usr/bin/env bash
# audit-repo-gitflow.sh — audit a repo against GGT (GitFlow + Trunk-based).
#
# Usage: bash scripts/ci/audit-repo-gitflow.sh --repo <owner/repo> [--require-develop]
# Option B: default branch is `develop` (integration); `main` exists as the
# protected trunk. Runs `--require-develop` to also assert `develop` exists.
set -u

REPO=""
REQUIRE_DEVELOP=0
while [ $# -gt 0 ]; do
  case "$1" in
    --repo) REPO="${2:-}"; shift 2 ;;
    --require-develop) REQUIRE_DEVELOP=1; shift ;;
    *) echo "unknown arg: $1"; exit 2 ;;
  esac
done
[ -n "$REPO" ] || { echo "usage: $0 --repo <owner/repo> [--require-develop]"; exit 2; }

FAIL=0
check() {
  if [ "$2" = "PASS" ]; then echo "PASS  $1"; else echo "FAIL  $1 — $3"; FAIL=1; fi
}

DEFAULT=$(gh api "repos/$REPO" --jq .default_branch)
[ "$DEFAULT" = "develop" ] && check "default branch develop" PASS || check "default branch develop" FAIL "default=$DEFAULT"
if gh api "repos/$REPO/branches/main" --jq '.' > /tmp/opencode/ggt-main.json 2>&1; then
  check "main exists (trunk)" PASS
else
  check "main exists (trunk)" FAIL "missing"
fi
if [ "$REQUIRE_DEVELOP" -eq 1 ]; then
  if gh api "repos/$REPO/branches/develop" --jq '.' > /tmp/opencode/ggt-develop.json 2>&1; then
    check "develop exists" PASS
  else
    check "develop exists" FAIL "missing"
  fi
fi

SETTINGS=$(gh api "repos/$REPO" --jq '{sq:.allow_squash_merge, mc:.allow_merge_commit, rb:.allow_rebase_merge}')
SQ=$(printf '%s' "$SETTINGS" | jq -r .sq); MC=$(printf '%s' "$SETTINGS" | jq -r .mc); RB=$(printf '%s' "$SETTINGS" | jq -r .rb)
[ "$SQ" = "false" ] && check "allow_squash_merge=false" PASS || check "allow_squash_merge=false" FAIL "sq=$SQ"
[ "$MC" = "true" ] && check "allow_merge_commit=true" PASS || check "allow_merge_commit=true" FAIL "mc=$MC"
[ "$RB" = "true" ] && check "allow_rebase_merge=true" PASS || check "allow_rebase_merge=true" FAIL "rb=$RB"

RSID=$(gh api "repos/$REPO/rulesets" --jq '.[] | select(.name=="main-founders-only") | .id' | head -1)
if [ -z "$RSID" ]; then
  check "main-founders-only ruleset" FAIL "missing"
else
  check "main-founders-only ruleset" PASS
  METHODS=$(gh api "repos/$REPO/rulesets/$RSID" --jq '[.rules[] | select(.type=="pull_request") | .parameters.allowed_merge_methods[]]' | jq -r '.[]' | tr '\n' ' ')
  echo "$METHODS" | grep -q "merge" && check "ruleset allows merge" PASS || check "ruleset allows merge" FAIL "methods=$METHODS"
  LIN=$(gh api "repos/$REPO/rulesets/$RSID" --jq '[.rules[] | select(.type=="required_linear_history")] | length')
  [ "$LIN" = "0" ] && check "no required_linear_history" PASS || check "no required_linear_history" FAIL "linear=$LIN"
fi

echo "---"
[ "$FAIL" -eq 0 ] && { echo "GGT audit: ALL PASS"; exit 0; }
echo "GGT audit: FAILURES"; exit 1
