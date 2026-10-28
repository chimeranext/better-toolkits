#!/usr/bin/env python3
"""
RevOps — pipeline analyzer (B2B). Coverage ratios, stage conversion, velocity,
aging, and concentration risk. Port/reference aligned with the revenue-operations
skill pattern (alirezarezvani). Pure Python stdlib.

Usage:
  python3 pipeline_analyzer.py --input pipeline.json
"""
import argparse
import json
import sys
from pathlib import Path


def analyze(data):
    quota = float(data.get("quota", 0) or 0)
    stages = data.get("stages", [])
    avg_cycle = float(data.get("average_cycle_days", 45) or 45)
    deals = data.get("deals", [])

    total_value = sum(float(d.get("value", 0) or 0) for d in deals)
    coverage = total_value / quota if quota else 0.0

    # stage conversion rates
    stage_counts = {s: 0 for s in stages}
    for d in deals:
        stage = d.get("stage")
        if stage in stage_counts:
            stage_counts[stage] += 1
    conversions = {}
    for i in range(1, len(stages)):
        prev = stage_counts.get(stages[i - 1], 0)
        cur = stage_counts.get(stages[i], 0)
        conversions[f"{stages[i-1]}→{stages[i]}"] = round(cur / prev, 3) if prev else 0.0

    # velocity = (opportunities × avg deal × win rate) / avg cycle
    opps = stage_counts.get(stages[0], 0)
    avg_deal = total_value / len(deals) if deals else 0.0
    won = sum(1 for d in deals if d.get("stage") == "Closed Won")
    win_rate = won / len(deals) if deals else 0.0
    velocity = (opps * avg_deal * win_rate) / avg_cycle if avg_cycle else 0.0

    # aging flags (>2x avg cycle per stage)
    aging = []
    for d in deals:
        if int(d.get("age_days", 0) or 0) > 2 * avg_cycle:
            aging.append(d.get("id"))

    # concentration risk (>40% in single deal)
    concentration = []
    if deals:
        top = max(float(d.get("value", 0) or 0) for d in deals)
        if total_value and top / total_value > 0.4:
            concentration = [d.get("id") for d in deals if float(d.get("value", 0) or 0) == top]

    return {
        "total_value": round(total_value, 2),
        "quota": quota,
        "coverage_ratio": round(coverage, 2),
        "coverage_healthy": 3.0 <= coverage <= 4.0,
        "stage_conversion": conversions,
        "velocity": round(velocity, 2),
        "aging_deals": aging,
        "concentration_deals": concentration,
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, type=Path)
    ap.add_argument("--output", type=Path, default=None)
    a = ap.parse_args()
    data = json.loads(a.input.read_text())
    result = analyze(data)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    dest = a.output or (Path.cwd() / ".aaarrr" / "metrics" / "pipeline.json")
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(result, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
