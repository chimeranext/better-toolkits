#!/usr/bin/env python3
"""
Budget pacing check — delivery vs budget over last N days; flags over/underdelivery.
Proposes only. Input: JSON from MCP pacing_review.
"""
import argparse
import json
import sys
from pathlib import Path


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, type=Path)
    ap.add_argument("--under-threshold", type=float, default=0.8)
    ap.add_argument("--over-threshold", type=float, default=1.2)
    a = ap.parse_args()

    data = json.loads(a.input.read_text())
    rows = data if isinstance(data, list) else data.get("rows", [])
    flags = []
    for r in rows:
        delivery = float(r.get("delivery_ratio", 1) or 1)
        if delivery < a.under_threshold:
            flags.append({"campaign_id": r.get("campaign_id"), "issue": "underdelivery", "ratio": delivery})
        elif delivery > a.over_threshold:
            flags.append({"campaign_id": r.get("campaign_id"), "issue": "overspend", "ratio": delivery})
    print(json.dumps({"flags": flags, "note": "proposals only"}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
