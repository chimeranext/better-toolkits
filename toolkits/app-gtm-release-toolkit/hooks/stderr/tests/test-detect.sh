#!/usr/bin/env bash
# Synthetic allow/deny matrix for hooks/stderr/detect.py
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"
DETECT="$DIR/detect.py"
pass=0
fail=0

expect_deny() {
  local cmd="$1"
  if python3 "$DETECT" --command "$cmd" >/tmp/mnm-stderr-out.txt 2>/tmp/mnm-stderr-err.txt; then
    echo "FAIL expect deny: $cmd"
    fail=$((fail + 1))
  else
    pass=$((pass + 1))
  fi
}

expect_allow() {
  local cmd="$1"
  if python3 "$DETECT" --command "$cmd" >/tmp/mnm-stderr-out.txt 2>/tmp/mnm-stderr-err.txt; then
    pass=$((pass + 1))
  else
    echo "FAIL expect allow: $cmd"
    cat /tmp/mnm-stderr-err.txt
    fail=$((fail + 1))
  fi
}

expect_deny 'gh api foo 2>/dev/null'
expect_deny 'cmd &>/dev/null'
expect_deny 'cmd >/dev/null 2>&1'
expect_deny 'cmd >/dev/null'
expect_deny 'cmd 2>&1'
expect_allow 'cmd 2>&1 >/dev/null'
expect_allow 'cmd 2>&1 | tee /tmp/run.log'
expect_allow 'cmd > /tmp/out.log 2> /tmp/err.log'
expect_allow "echo 'use 2>/dev/null in docs'"
expect_allow 'ls'

echo "pass=$pass fail=$fail"
[ "$fail" -eq 0 ]
