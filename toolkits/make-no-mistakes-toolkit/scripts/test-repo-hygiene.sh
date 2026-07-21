#!/usr/bin/env bash
# Smoke tests for repo-hygiene.sh (no network mutations).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$ROOT/scripts/repo-hygiene.sh"

fail() { echo "FAIL: $*" >&2; exit 1; }

[[ -x "$SCRIPT" ]] || chmod +x "$SCRIPT"

"$SCRIPT" --help | grep -q 'repo-hygiene.sh' || fail 'help text missing'

# Unknown subcommand exits non-zero
if "$SCRIPT" definitely-not-a-command 2>/dev/null; then
  fail 'expected error on unknown subcommand'
fi

# parse without gh when only testing help path — audit requires gh auth
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  echo "INFO: gh authenticated — running dry-run audit (may hit API)"
  "$SCRIPT" audit --repo chimeranext/make-no-mistakes-toolkit || fail 'audit dry-run failed'
else
  echo "SKIP: gh not authenticated — network audit skipped"
fi

echo "OK: repo-hygiene smoke tests passed"
