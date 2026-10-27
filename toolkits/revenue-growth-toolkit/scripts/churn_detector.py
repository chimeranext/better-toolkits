#!/usr/bin/env python3
"""
Churn detector — buckets D30/D60/D90 and MoM churn.

Reads an input JSON/CSV of customer lifecycle rows (customer_id, last_active_date,
signup_date, or subscription events). Emits bucket counts and MoM churn rate.

Usage:
  python3 churn_detector.py --input customers.json [--output out.json]
"""
import argparse
import json
import sys
from collections import defaultdict
from datetime import date, datetime, timedelta
from pathlib import Path


def parse_d(s: str) -> date:
    return datetime.strptime(s[:10], "%Y-%m-%d").date()


def detect(rows, as_of: date):
    buckets = {"d30": 0, "d60": 0, "d90": 0}
    churned_30d = 0
    active = 0
    for r in rows:
        last = parse_d(r.get("last_active_date") or r.get("last_seen") or r.get("event_date"))
        days = (as_of - last).days
        if days < 0:
            days = 0
        if days <= 30:
            active += 1
        if 30 < days <= 60:
            buckets["d30"] += 1
            churned_30d += 1
        elif 60 < days <= 90:
            buckets["d60"] += 1
        elif days > 90:
            buckets["d90"] += 1
    total = len(rows) or 1
    return {
        "as_of": as_of.isoformat(),
        "active_30d": active,
        "churn_buckets": buckets,
        "churn_30d_rate": round(churned_30d / total, 4),
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, type=Path)
    ap.add_argument("--output", type=Path, default=None)
    ap.add_argument("--as-of", default=None)
    a = ap.parse_args()

    data = json.loads(a.input.read_text())
    rows = data if isinstance(data, list) else data.get("customers", [])
    as_of = date.fromisoformat(a.as_of) if a.as_of else date.today()
    result = detect(rows, as_of)
    print(json.dumps(result, indent=2))

    out = a.output or (Path.cwd() / ".aaarrr" / "metrics" / f"churn-{date.today().isoformat()}.json")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(result, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
