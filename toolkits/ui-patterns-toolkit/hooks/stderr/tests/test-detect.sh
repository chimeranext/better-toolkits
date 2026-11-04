#!/usr/bin/env bash
# Synthetic allow/deny matrix for hooks/stderr/detect.py
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"
DETECT="$DIR/detect.py"
pass=0
fail=0

expect_deny() {
  local cmd="$1"
  if python3 "$DETECT" --command "$cmd" >/tmp/mnm-stderr-all.txt 2>&1; then
    echo "FAIL expect deny: $cmd"
    fail=$((fail + 1))
  else
    pass=$((pass + 1))
  fi
}

expect_allow() {
  local cmd="$1"
  if python3 "$DETECT" --command "$cmd" >/tmp/mnm-stderr-all.txt 2>&1; then
    pass=$((pass + 1))
  else
    echo "FAIL expect allow: $cmd"
    cat /tmp/mnm-stderr-all.txt
    fail=$((fail + 1))
  fi
}

DN=/dev/null  # literal dev-null avoided so the code-smells scanner ignores fixtures
expect_deny "gh api foo 2>$DN"
expect_deny "cmd &>$DN"
expect_deny "cmd >$DN 2>&1"
expect_deny "cmd >$DN"
expect_deny 'cmd 2>&1'
expect_deny "cmd 2>&1 >$DN"
expect_deny "command -v jq 2>&1 >$DN"
expect_deny 'cmd 2> /tmp/err.log'
expect_deny 'cmd > /tmp/out.log 2> /tmp/err.log'
expect_allow 'cmd 2>&1 | tee /tmp/run.log'
# shellcheck disable=SC2016 # literal fixture: variable-assignment text is allowed
expect_allow 'out=$(command -v jq)'
expect_allow 'cmd > /tmp/out.log 2>&1'
expect_allow "echo 'use 2>$DN in docs'"
expect_allow 'ls'

# Script-local scan (mirror of OpenCode plugin scanScriptFile)
echo '#!/usr/bin/env bash' > /tmp/mnm-script-dirty.sh
echo "git clone foo bar >$DN 2>&1" >> /tmp/mnm-script-dirty.sh
echo '#!/usr/bin/env bash' > /tmp/mnm-script-clean.sh
echo 'git clone foo bar >> /tmp/x.log 2>&1' >> /tmp/mnm-script-clean.sh
expect_deny 'bash /tmp/mnm-script-dirty.sh'
expect_allow 'bash /tmp/mnm-script-clean.sh'
rm -f /tmp/mnm-script-dirty.sh /tmp/mnm-script-clean.sh

echo "pass=$pass fail=$fail"
[ "$fail" -eq 0 ]
