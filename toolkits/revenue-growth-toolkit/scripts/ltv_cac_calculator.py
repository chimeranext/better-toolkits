#!/usr/bin/env python3
"""
LTV, CAC, payback, LTV:CAC per platform (FB/IG/blended) for a time window.

Source-independent: reads an input JSON (from a revenue_source adapter or the MCP
insights), not direct Graph API. This is the Python port of the legacy TS
ltv-cac-calculator, adapted to the shared-MCP/PostHog architecture.

Usage:
  python3 ltv_cac_calculator.py --input aggregates.json [--output out.json]
  python3 ltv_cac_calculator.py --input aggregates.json --gross-margin 0.7
"""
import argparse
import json
import sys
from datetime import date, datetime, timedelta
from pathlib import Path


def days_between(since: str, until: str) -> int:
    fmt = "%Y-%m-%d"
    s = datetime.strptime(since, fmt).date()
    u = datetime.strptime(until, fmt).date()
    return max(1, (u - s).days)


def compute_ratios(aggregates, gross_margin: float, since: str, until: str):
    days = days_between(since, until)
    rows = []
    for a in aggregates:
        spend = float(a.get("spend", 0))
        customers = float(a.get("customers", 0))
        revenue = float(a.get("revenue", 0))
        cac = spend / customers if customers > 0 else 0.0
        aov = revenue / customers if customers > 0 else 0.0
        gross_revenue = revenue * gross_margin
        revenue_per_customer = gross_revenue / customers if customers > 0 else 0.0
        daily_contribution = revenue_per_customer / days if days > 0 else 0.0
        estimated_ltv = revenue_per_customer * (365 / max(days, 1))
        ltv_cac = estimated_ltv / cac if cac > 0 else 0.0
        payback_days = (cac / daily_contribution
                        if daily_contribution > 0 else float("inf"))
        rows.append({
            "platform": a.get("platform", "?"),
            "spend": round(spend, 2),
            "customers": customers,
            "revenue": round(revenue, 2),
            "cac": round(cac, 2),
            "aov": round(aov, 2),
            "revenue_per_customer": round(revenue_per_customer, 2),
            "estimated_ltv_12mo": round(estimated_ltv, 2),
            "ltv_cac": round(ltv_cac, 2),
            "payback_days": round(payback_days, 2) if payback_days != float("inf") else None,
        })
    return rows


def blend(rows):
    total_spend = sum(r["spend"] for r in rows)
    total_customers = sum(r["customers"] for r in rows)
    total_revenue = sum(r["revenue"] for r in rows)
    cac = total_spend / total_customers if total_customers > 0 else 0.0
    aov = total_revenue / total_customers if total_customers > 0 else 0.0
    weighted_ltv = (
        sum(r["estimated_ltv_12mo"] * r["customers"] for r in rows) / total_customers
        if total_customers > 0 else 0.0
    )
    ltv_cac = weighted_ltv / cac if cac > 0 else 0.0
    weighted_payback = (
        sum((r["payback_days"] or 0) * r["customers"] for r in rows) / total_customers
        if total_customers > 0 else 0.0
    )
    return {
        "platform": "blended",
        "spend": round(total_spend, 2),
        "customers": total_customers,
        "revenue": round(total_revenue, 2),
        "cac": round(cac, 2),
        "aov": round(aov, 2),
        "revenue_per_customer": round(total_revenue / total_customers, 2) if total_customers > 0 else 0.0,
        "estimated_ltv_12mo": round(weighted_ltv, 2),
        "ltv_cac": round(ltv_cac, 2),
        "payback_days": round(weighted_payback, 2) if weighted_payback else None,
    }


def print_table(rows, target_cpa=0, target_ltv=0):
    fmt = lambda n: "∞" if n is None else f"{n:.2f}"
    print("\n| Platform | Spend | Customers | Revenue | CAC | AOV | Est LTV | LTV:CAC | Payback (d) |")
    print("|---|---|---|---|---|---|---|---|---|")
    for r in rows:
        cac = r["cac"]
        ltv = r["estimated_ltv_12mo"]
        ratio = r["ltv_cac"]
        cac_status = "🔴" if target_cpa and cac > target_cpa else ("🟡" if target_cpa and cac > target_cpa * 0.8 else "🟢")
        ltv_status = "🔴" if target_ltv and ltv < target_ltv else "🟢"
        ratio_status = "🔴" if ratio < 2 else ("🟡" if ratio < 3 else "🟢")
        print(f"| {r['platform']} | ${fmt(r['spend'])} | {r['customers']} | ${fmt(r['revenue'])} | ${fmt(cac)} {cac_status} | ${fmt(r['aov'])} | ${fmt(ltv)} {ltv_status} | {fmt(ratio)} {ratio_status} | {fmt(r['payback_days'])} |")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, type=Path)
    ap.add_argument("--output", type=Path, default=None)
    ap.add_argument("--gross-margin", type=float, default=0.7)
    ap.add_argument("--breakdown", default="platform")
    a = ap.parse_args()

    data = json.loads(a.input.read_text())
    aggregates = data.get("aggregates", data if isinstance(data, list) else [])
    since = data.get("window", {}).get("since") or (date.today() - timedelta(days=30)).isoformat()
    until = data.get("window", {}).get("until") or date.today().isoformat()
    window_label = data.get("window_label", f"{since} → {until}")

    rows = compute_ratios(aggregates, a.gross_margin, since, until)
    all_rows = rows + [blend(rows)]
    print_table(all_rows)

    out = a.output or (Path.cwd() / ".aaarrr" / "metrics" / f"cohorts-{date.today().isoformat()}.json")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({
        "generated_at": datetime.now().isoformat(),
        "window": {"since": since, "until": until},
        "window_label": window_label,
        "gross_margin": a.gross_margin,
        "rows": all_rows,
    }, indent=2, ensure_ascii=False))
    print(f"\nSnapshot saved to {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
