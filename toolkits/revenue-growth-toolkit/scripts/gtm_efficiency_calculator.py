#!/usr/bin/env python3
"""
RevOps — GTM efficiency calculator (B2B). Magic Number, LTV:CAC, CAC payback,
burn multiple, Rule of 40, NDR. Pure Python stdlib.

Usage:
  python3 gtm_efficiency_calculator.py --input gtm.json
"""
import argparse
import json
import sys
from pathlib import Path


def analyze(data):
    rev = data.get("revenue", {})
    cost = data.get("costs", {})
    cust = data.get("customers", {})

    net_new_arr = float(rev.get("net_new_arr", 0) or 0)
    sm_spend = float(cost.get("sales_marketing_spend", 1) or 1)
    magic = net_new_arr / sm_spend if sm_spend else 0.0

    arpa = float(rev.get("arpa_monthly", 0) or 0) * 12
    gm = float(cost.get("gross_margin_pct", 0) or 0) / 100
    churn = float(cust.get("annual_churn_rate_pct", 8) or 8) / 100
    cac = float(cost.get("cac", 0) or 0)
    ltv = (arpa * gm / churn) if churn else 0.0
    ltv_cac = (ltv / cac) if cac else 0.0
    payback = (cac / (arpa * gm / 12)) if (arpa * gm) else None

    burn = float(cost.get("net_burn", 0) or 0)
    burn_multiple = burn / net_new_arr if net_new_arr else None

    growth = float(rev.get("revenue_growth_pct", 0) or 0)
    fcf = float(cost.get("fcf_margin_pct", 0) or 0)
    rule40 = growth + fcf

    begin_arr = float(cust.get("beginning_arr", 0) or 0)
    expansion = float(cust.get("expansion_arr", 0) or 0)
    contraction = float(cust.get("contraction_arr", 0) or 0)
    churned = float(cust.get("churned_arr", 0) or 0)
    ndr = ((begin_arr + expansion - contraction - churned) / begin_arr * 100) if begin_arr else None

    return {
        "magic_number": round(magic, 2),
        "ltv_cac": round(ltv_cac, 2),
        "cac_payback_months": round(payback, 1) if payback is not None else None,
        "burn_multiple": round(burn_multiple, 2) if burn_multiple is not None else None,
        "rule_of_40": round(rule40, 1),
        "ndr": round(ndr, 1) if ndr is not None else None,
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, type=Path)
    ap.add_argument("--output", type=Path, default=None)
    a = ap.parse_args()
    data = json.loads(a.input.read_text())
    result = analyze(data)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    dest = a.output or (Path.cwd() / ".aaarrr" / "metrics" / "gtm.json")
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(result, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
