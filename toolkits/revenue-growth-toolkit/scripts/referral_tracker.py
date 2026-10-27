#!/usr/bin/env python3
"""
Measures real referral K-factor.

Requires product-side attribution: each purchase records the referrer. Reads
`.aaarrr/referrals.csv` with columns: referrer_id, referee_id, signup_date,
purchase_date, amount.

Calculation:
  K = (referidos_que_compraron / buyers_que_invitaron)
      × (buyers_que_invitaron / total_buyers)

Usage:
  python3 referral_tracker.py --window 30d [--csv .aaarrr/referrals.csv]
"""
import argparse
import csv
import json
import sys
import math
from datetime import date, datetime, timedelta
from pathlib import Path

REQUIRED = ["referrer_id", "referee_id", "signup_date"]


def load_csv(path: Path) -> list[dict]:
    if not path.exists():
        raise SystemExit(
            f"Referral CSV not found at {path}. Columns: referrer_id, referee_id, "
            f"signup_date, purchase_date, amount."
        )
    with path.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    return rows


def k_factor(rows: list[dict], window_days: int):
    cutoff = date.today() - timedelta(days=window_days)
    invited = {}          # referrer_id -> set of referee_ids
    purchased = {}        # referrer_id -> set of referee_ids who purchased
    total_buyers = set()  # all purchasers in window

    for r in rows:
        signup = r.get("signup_date", "")[:10]
        try:
            sd = datetime.strptime(signup, "%Y-%m-%d").date()
        except ValueError:
            continue
        if sd < cutoff:
            continue
        referrer = r.get("referrer_id", "").strip()
        referee = r.get("referee_id", "").strip()
        if not referrer or not referee:
            continue
        invited.setdefault(referrer, set()).add(referee)
        if r.get("purchase_date", "").strip():
            purchased.setdefault(referrer, set()).add(referee)
            total_buyers.add(referee)

    buyers_who_invited = {k for k, v in invited.items() if len(v) > 0}
    total_buyers_count = len(total_buyers) or 1  # avoid div-by-zero

    # K = (referral purchasers / buyers who invited) × (buyers who invited / total buyers)
    referral_purchasers = sum(len(v) for v in purchased.values())
    buyers_inviting = len(buyers_who_invited)
    invite_conversion = referral_purchasers / buyers_inviting if buyers_inviting else 0.0
    invite_spread = buyers_inviting / total_buyers_count
    k = invite_conversion * invite_spread

    return {
        "window_days": window_days,
        "cutoff": cutoff.isoformat(),
        "inviters": buyers_inviting,
        "referral_purchasers": referral_purchasers,
        "total_buyers": total_buyers_count,
        "invite_conversion": round(invite_conversion, 4),
        "invite_spread": round(invite_spread, 4),
        "k_factor": round(k, 4),
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--window", default="30d")
    ap.add_argument("--csv", type=Path, default=Path(".aaarrr/referrals.csv"))
    ap.add_argument("--output", type=Path, default=None)
    a = ap.parse_args()

    days = int(a.window.rstrip("d")) if a.window.rstrip("d").isdigit() else 30
    result = k_factor(load_csv(a.csv), days)
    print(json.dumps(result, indent=2))

    out = a.output or (Path.cwd() / ".aaarrr" / "metrics" / f"kfactor-{date.today().isoformat()}.json")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(result, indent=2, ensure_ascii=False))
    print(f"\nSaved to {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
