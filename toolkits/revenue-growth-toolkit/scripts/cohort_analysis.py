#!/usr/bin/env python3
"""
Cohort analysis — revenue/retention series by signup cohort.

Reads an input JSON/CSV of purchase events (customer_id, purchase_date, amount,
cohort_date). Emits per-cohort revenue and a retention curve.

Usage:
  python3 cohort_analysis.py --input purchases.json [--output out.json]
"""
import argparse
import json
import sys
from collections import defaultdict
from datetime import date, datetime
from pathlib import Path


def parse_d(s: str) -> date:
    return datetime.strptime(s[:10], "%Y-%m-%d").date()


def analyze(rows):
    cohort_revenue = defaultdict(float)
    cohort_customers = defaultdict(set)
    cohort_retention = defaultdict(lambda: defaultdict(int))

    for r in rows:
        purchase_date = parse_d(r.get("purchase_date") or r.get("date"))
        cohort = parse_d(r.get("cohort_date") or r.get("signup_date") or purchase_date.isoformat())
        key = cohort.isoformat()
        cohort_revenue[key] += float(r.get("amount", 0))
        customer = r.get("customer_id", "?")
        cohort_customers[key].add(customer)
        month = purchase_date.strftime("%Y-%m")
        cohort_retention[key][month] += 1

    # retention: for each cohort, month-0 = signup month
    result = {"cohorts": {}}
    for key, revenue in sorted(cohort_revenue.items()):
        months = sorted(cohort_retention[key])
        month0 = months[0] if months else ""
        retention = {
            m: round(len(cohort_retention[key][m]) / max(len(cohort_customers[key]), 1), 3)
            for m in months
        }
        result["cohorts"][key] = {
            "revenue": round(revenue, 2),
            "customers": len(cohort_customers[key]),
            "retention": retention,
        }
    return result


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, type=Path)
    ap.add_argument("--output", type=Path, default=None)
    a = ap.parse_args()

    data = json.loads(a.input.read_text())
    rows = data if isinstance(data, list) else data.get("purchases", [])
    result = analyze(rows)
    print(json.dumps(result, indent=2, ensure_ascii=False))

    out = a.output or (Path.cwd() / ".aaarrr" / "metrics" / f"cohorts-{date.today().isoformat()}.json")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(result, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
