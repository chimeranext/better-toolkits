#!/usr/bin/env python3
"""
Kill rule engine — evaluates thresholds (CPA 2x, ROAS<1, LTV:CAC collapse) and
proposes kills/pauses. Never auto-executes. Input: JSON of aggregate metrics.
"""
import argparse
import json
import sys
from pathlib import Path


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, type=Path)
    ap.add_argument("--min-days", type=int, default=7)
    a = ap.parse_args()

    data = json.loads(a.input.read_text())
    rows = data if isinstance(data, list) else data.get("entities", [])
    proposals = []
    for r in rows:
        days = int(r.get("days_observed", 0) or 0)
        if days < a.min_days:
            continue
        cpa = float(r.get("cpa", 0) or 0)
        roas = float(r.get("roas", 0) or 0)
        ltv_cac = float(r.get("ltv_cac", 0) or 0)
        if r.get("target_cpa") and cpa > float(r["target_cpa"]) * 2:
            proposals.append({"entity_id": r.get("entity_id"), "rule": "cpa_2x", "cpa": cpa})
        if roas and roas < 1:
            proposals.append({"entity_id": r.get("entity_id"), "rule": "roas_below_1", "roas": roas})
        if ltv_cac and ltv_cac < 1.5:
            proposals.append({"entity_id": r.get("entity_id"), "rule": "ltv_cac_collapse", "ltv_cac": ltv_cac})
    print(json.dumps({"min_days": a.min_days, "proposals": proposals, "note": "propose, never auto-execute"}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
