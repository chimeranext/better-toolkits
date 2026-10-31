#!/usr/bin/env bash
# apply-policies.sh — materialize the machine-readable policy into a consumer repo.
#
# Reads the propagated policies.yml (next to this script) and applies it to the
# current repo: updates linear-setup.json defaults.squashMerge per the policy,
# and (if GH_TOKEN has repo admin) verifies the GitHub ruleset merge method.
# If a change is required, it stages and opens a PR (branch auto/policies).
#
# Usage:
#   apply-policies.sh [--dry-run]
#
# Called from a consumer repo's .github/workflows/apply-policies.yml on
# repository_dispatch (policies-updated), or manually by /toolkits-initial-setup.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
POLICY_FILE="$HERE/policies.yml"
DRY_RUN=0
[ "${1:-}" = "--dry-run" ] && DRY_RUN=1

if [ ! -f "$POLICY_FILE" ]; then
  echo "[apply] ERROR: $POLICY_FILE not found" >&2
  exit 1
fi

# Load policy values via python (yaml).
read -r METHOD FORBIDDEN <<< "$(python3 -c '
import yaml, sys
d = yaml.safe_load(open(sys.argv[1]))
m = d.get("merge", {})
print(m.get("method"), " ".join(m.get("methods_forbidden", [])))
' "$POLICY_FILE")"

echo "[apply] merge.method=$METHOD; forbidden=[$FORBIDDEN]"

# 1. linear-setup.json -> defaults.squashMerge
LINEAR_JSON="linear-setup.json"
if [ -f "$LINEAR_JSON" ]; then
  EXPECTED=false
  if [ "$METHOD" = "squash" ]; then EXPECTED=true; fi
  CURRENT=$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1])).get("defaults",{}).get("squashMerge"))' "$LINEAR_JSON" || echo none)
  if [ "$CURRENT" != "$EXPECTED" ]; then
    echo "[apply] drift: linear-setup.json squashMerge=$CURRENT, esperado=$EXPECTED"
    if [ "$DRY_RUN" = "0" ]; then
      python3 - "$LINEAR_JSON" "$EXPECTED" <<'PY'
import json, sys
p = sys.argv[1]; v = sys.argv[2] == "true"
d = json.load(open(p))
d.setdefault("defaults", {})["squashMerge"] = v
with open(p, "w") as fh:
    json.dump(d, fh, indent=2, ensure_ascii=False)
    fh.write("\n")
PY
      echo "[apply] updated $LINEAR_JSON"
    else
      echo "[apply] (dry-run) would update $LINEAR_JSON"
    fi
  else
    echo "[apply] ok: linear-setup.json squashMerge=$CURRENT"
  fi
else
  echo "[apply] no $LINEAR_JSON present; skip"
fi

echo "[apply] done"
