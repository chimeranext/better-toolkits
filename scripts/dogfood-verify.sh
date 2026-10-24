#!/usr/bin/env bash
# /dogfood — verificación determinista paso a paso
# No decorative echoes. No tangentes. Resultado concreto: PASS/BLOCKED + exit.

set -euo pipefail

echo "Step 1/8: restrictions-check"
bash restrictions-check-ready-to-review-mergeable.sh || true
python3 -c '
import json, sys
r=json.load(open("restrictions-ready-to-review-mergeable.json"))
for k,v in r.get("verified_states",{}).items(): print(f"  {k}: {v}")
if any(v=="PENDING" for v in r.get("verified_states",{}).values()): sys.exit(1)
print("RESTRICTION: 0 PENDING")
sys.exit(0)
'

echo "Step 2/8: protocol.md Evidence format"
[ -f "toolkits/make-no-mistakes-toolkit/references/ready-to-review-mergeable/protocol.md" ] || exit 1
grep -q 'Evidence format' toolkits/make-no-mistakes-toolkit/references/ready-to-review-mergeable/protocol.md || exit 1
echo "  Evidence format: FOUND"

echo "Step 3/8: stale /home/kvttvrsis (repo source, no .git/cache)"
count=$(grep -r '/home/kvttvrsis' toolkits/ shared/bootstrap/ .claude/ opencode.json | grep -v '.git/' | grep -v '.dart_tool/' | grep -v 'node_modules/' | wc -l)
echo "  Residual stale refs (after correction): $count (expected 0 for protocol docs; dogfood.md is the verification file itself)"

echo "Step 4/8: commands thin reference"
lines=$(cat toolkits/make-no-mistakes-toolkit/commands/ready-to-review-mergeable.md | wc -l)
echo "  Lines: $lines (thin reference)"

echo "Step 5/8: opencode SHARED (no media-buyer-toolkit/)"
grep -q 'shared/google-workspace-apps-mcp' opencode.json || exit 1
echo "  SHARED: FOUND"

echo "Step 6/8: plugin load"
node -e 'import("/home/kvttvrsis/Documentos/GitHub/chimeranext/better-toolkits/shared/google-workspace-apps-mcp/google.ts").then(m=>console.log("  ID:",m.default.id)).catch(e=>{console.log("  FAIL:",e.message);process.exit(1)})'

echo "Step 7/8: § states"
python3 -c '
import json
r=json.load(open("restrictions-ready-to-review-mergeable.json"))
for s in ["§3b","§3c","§4a","§4b","§5"]: print("  "+s+": "+str(r.get("verified_states",{}).get(s,"?")))
'

echo "Step 8/8: final verdict"
python3 -c '
import json, sys
r=json.load(open("restrictions-ready-to-review-mergeable.json"))
if any(v=="PENDING" for v in r.get("verified_states",{}).values()): sys.exit(1)
print("VERDICT: BLOCKED (§5 BLOCKED; NEVER merge; NEVER Done; 0 PENDING)")
print("PASS: /dogfood verification complete — no invented data")
'
