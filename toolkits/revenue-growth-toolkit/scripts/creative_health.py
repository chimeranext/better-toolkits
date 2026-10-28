#!/usr/bin/env python3
"""
Creative health — reviews creatives (frequency, CPA, fatigue) and proposes refresh.
Proposes only; never auto-executes. Input: JSON from MCP get_insights / list_ads.
"""
import argparse
import json
import sys
from pathlib import Path


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, type=Path)
    ap.add_argument("--freq-threshold", type=float, default=5.0)
    a = ap.parse_args()

    data = json.loads(a.input.read_text())
    ads = data if isinstance(data, list) else data.get("ads", [])
    flag = []
    for ad in ads:
        freq = float(ad.get("frequency", 0) or 0)
        cpa = float(ad.get("cpa", 0) or 0)
        if freq > a.freq_threshold:
            flag.append({"ad_id": ad.get("ad_id"), "issue": "high_frequency", "frequency": freq})
        if cpa and ad.get("target_cpa") and cpa > float(ad["target_cpa"]) * 2:
            flag.append({"ad_id": ad.get("ad_id"), "issue": "cpa_2x", "cpa": cpa})
    print(json.dumps({"flags": flag, "note": "proposals only; no auto-execute"}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
