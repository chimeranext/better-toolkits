#!/usr/bin/env bash
# restrictions-check-ready-to-review-mergeable.sh — enforce /ready-to-review-mergeable SSOT (generic, no hardcoded issue ID)
# If any pending step tries to jump ahead, this exits with error.

set -euo pipefail

VERIFIED_PASSES="§1 §2 §2b-testing §2b-security §2b-governance §2b-liveness §2c §3a"
PENDING="§3b §3c"
BLOCKED="§5"

if [ -f "restrictions-ready-to-review-mergeable.json" ]; then
  echo "RESTRICTION ENFORCED (restrictions-ready-to-review-mergeable.json active):"
  python3 -c "
import json, sys
r=json.load(open('restrictions-ready-to-review-mergeable.json'))
for s,v in r['verified_states'].items():
    print(f'  {s}: {v}')
if 'PENDING' in r['verified_states'].values():
    sys.exit(1)
"
  echo "SKIP BLOCKED — pending steps remain before next phase."
else
  echo "RESTRICTION FILE MISSING — cannot verify step order."
  exit 1
fi
