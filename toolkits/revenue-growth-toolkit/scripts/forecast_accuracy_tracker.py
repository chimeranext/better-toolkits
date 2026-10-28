#!/usr/bin/env python3
"""
RevOps — forecast accuracy tracker (B2B). MAPE, bias, weighted accuracy, trends.
Pure Python stdlib.

Usage:
  python3 forecast_accuracy_tracker.py --input forecast.json
"""
import argparse
import json
import sys
from pathlib import Path


def analyze(data):
    periods = data.get("forecast_periods", [])
    mape_scores = []
    for p in periods:
        f = float(p.get("forecast", 0) or 0)
        a = float(p.get("actual", 0) or 0)
        if a == 0:
            continue
        mape_scores.append(abs(a - f) / abs(a))

    mape = (sum(mape_scores) / len(mape_scores) * 100) if mape_scores else None

    # bias: positive = over-forecasting
    bias_diffs = [float(p.get("forecast", 0) or 0) - float(p.get("actual", 0) or 0) for p in periods]
    bias = sum(bias_diffs) / len(bias_diffs) if bias_diffs else 0.0

    rating = None
    if mape is not None:
        if mape < 10: rating = "excellent"
        elif mape <= 15: rating = "good"
        elif mape <= 25: rating = "fair"
        else: rating = "poor"

    return {"mape_pct": round(mape, 2) if mape is not None else None,
            "rating": rating,
            "bias": round(bias, 2),
            "bias_tendency": "over-forecast" if bias > 0 else ("under-forecast" if bias < 0 else "none")}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, type=Path)
    ap.add_argument("--output", type=Path, default=None)
    a = ap.parse_args()
    data = json.loads(a.input.read_text())
    result = analyze(data)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    dest = a.output or (Path.cwd() / ".aaarrr" / "metrics" / "forecast.json")
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(result, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
