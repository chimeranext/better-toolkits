#!/usr/bin/env bash
# Synthetic allow/deny matrix for hooks/no-squash/detect.py
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"
DETECT="$DIR/detect.py"
pass=0
fail=0

expect_deny() {
  local cmd="$1"
  if python3 "$DETECT" --command "$cmd" >/tmp/mnm-nosquash-all.txt 2>&1; then
    echo "FAIL expect deny: $cmd"
    fail=$((fail + 1))
  else
    pass=$((pass + 1))
  fi
}

expect_allow() {
  local cmd="$1"
  if python3 "$DETECT" --command "$cmd" >/tmp/mnm-nosquash-all.txt 2>&1; then
    pass=$((pass + 1))
  else
    echo "FAIL expect allow: $cmd"
    cat /tmp/mnm-nosquash-all.txt
    fail=$((fail + 1))
  fi
}

# Deny: explicit squash flags
expect_deny 'gh pr merge 155 --squash'
expect_deny 'gh pr merge --repo chimeranext/x --squash'
expect_deny 'gh pr merge 3 --squash --delete-branch'
expect_deny 'gh pr merge 2 -s'
expect_deny 'git merge --squash feature-branch'
expect_deny 'git merge feature-branch --squash'
expect_deny 'git merge --strategy squash feature-branch'
expect_deny 'git merge --strategy=squash feature-branch'
expect_deny 'gh pr merge 7 --squash --admin'

# Allow: non-squash merges and unrelated commands
expect_allow 'gh pr merge 155 --merge --delete-branch'
expect_allow 'gh pr merge 155 --rebase'
expect_allow 'git merge feature-branch'
expect_allow 'git merge --no-ff feature-branch'
expect_allow 'git pull --rebase'
expect_allow 'git push origin main'
expect_allow 'gh pr create --title "merge" --body "use --squash?"'
expect_allow 'echo "gh pr merge --squash"'
expect_allow "echo 'git merge --squash'"
expect_allow 'ls -la'
expect_allow 'git rebase -i HEAD~3'

echo "pass=$pass fail=$fail"
[ "$fail" -eq 0 ]
