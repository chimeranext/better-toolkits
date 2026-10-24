#!/usr/bin/env bash
# audit-stderr-redirects.sh — determinista, paso a paso, sin redireccion de stderr
# Prohibe: 2>/dev/null, 2> /dev/null, 2>>/dev/null, &>/dev/null
set -uo pipefail
PROHIBITED=('2>/dev/null' '2> /dev/null' '2>>/dev/null' '&>/dev/null')
EXCLUDES='--exclude-dir=.git --exclude-dir=node_modules --exclude-dir=.dart_tool --exclude-dir=.opencode --exclude-dir=.claude --exclude-dir=.cursor --exclude-dir=.next --exclude-dir=.agents --exclude-dir=.worktrees --exclude="*.jpg" --exclude="*.png" --exclude="*.pack" --exclude="*.swp"'

for v in "${PROHIBITED[@]}"; do
  hits=$(grep -rln $EXCLUDES "$v" . | wc -l || true)
  files=$(grep -rln $EXCLUDES "$v" . || true)
  echo "PATTERN: $v -> $hits hits"
  echo "$files"
done

echo "VERDICT: BLOCKED (stderr redirect found in repo source)"
exit 1
