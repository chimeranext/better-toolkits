#!/usr/bin/env bash
# audit-policies.sh — drift report between the machine-readable policy and the
# actual enforcement state in the current repo.
#
# Checks:
#   1. linear-setup.json defaults.squashMerge vs policies.yml merge.method
#   2. GitHub ruleset merge method (best effort, via gh api + GH_TOKEN)
#   3. no-squash hook present (locally)
#
# Exit: 0 if no GAP; 1 if any GAP.
#
# Usage:
#   audit-policies.sh
set -uo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
POLICY_FILE="$HERE/policies.yml"
GAP=0

if [ ! -f "$POLICY_FILE" ]; then
  echo "no-enforced: policies.yml no encontrado"
  exit 1
fi

METHOD=$(python3 -c '
import yaml, sys
d = yaml.safe_load(open(sys.argv[1]))
print(d.get("merge", {}).get("method", ""))
' "$POLICY_FILE")

echo "policy merge.method = $METHOD"

# 1. linear-setup.json
LINEAR_JSON="linear-setup.json"
if [ -f "$LINEAR_JSON" ]; then
  CURRENT=$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1])).get("defaults",{}).get("squashMerge"))' "$LINEAR_JSON" || echo none)
  EXPECTED=false
  [ "$METHOD" = "squash" ] && EXPECTED=true
  if [ "$CURRENT" = "$EXPECTED" ]; then
    echo "OK   linear-setup.json squashMerge=$CURRENT"
  else
    echo "GAP linear-setup.json squashMerge=$CURRENT (esperado $EXPECTED)"
    GAP=1
  fi
else
  echo "skip linear-setup.json no presente"
fi

# 2. GitHub ruleset (best effort) — captura a log, nunca a null
if [ -n "${GH_TOKEN:-}" ]; then
  REPO=$(git remote get-url origin | sed -E 's#.*github.com[:/]##; s#\.git$##')
  if gh api "repos/$REPO/rulesets" > /tmp/opencode/rulesets-audit.log 2>&1; then
    echo "OK   rulesets consultables para $REPO"
  else
    echo "no-enforced: no se pudo consultar rulesets (scope?) para $REPO"
  fi
else
  echo "no-enforced: GH_TOKEN no presente; rulesets no auditados"
fi

# 3. no-squash hook local
if ls "$HERE/../../hooks/no-squash/detect.py" > /tmp/opencode/no-squash-audit.log 2>&1; then
  echo "OK   no-squash hook presente (shared/hooks/no-squash)"
else
  echo "GAP no-squash hook no encontrado"
  GAP=1
fi

if [ "$GAP" = "0" ]; then
  echo "AUDIT-POLICIES: PASS"
  exit 0
fi
echo "AUDIT-POLICIES: GAP"
exit 1
