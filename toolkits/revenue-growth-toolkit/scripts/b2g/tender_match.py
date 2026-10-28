#!/usr/bin/env python3
"""
B2G — match + scoring de relevancia entre el catálogo UNSPSC del cliente y los
tenders normalizados.

Agnóstico de país. Puntúa cada tender según solapamiento de códigos UNSPSC,
proximidad de cierre y madurez (público vs. invitación).

Usage:
  python3 tender_match.py --tenders tenders.json --catalog catalog-unspsc.json
"""
import argparse
import json
import sys
from datetime import date, datetime
from pathlib import Path


def _parse_d(s) -> date | None:
    if not s:
        return None
    try:
        return datetime.strptime(str(s)[:10], "%Y-%m-%d").date()
    except ValueError:
        return None


def score(tender, catalog_codes, as_of: date):
    t_codes = {c.strip() for c in (tender.get("unspsc") or "").split(",") if c.strip()}
    overlap = t_codes & catalog_codes
    code_score = len(overlap) * 20 if overlap else 0

    # proximidad de cierre: más cercano → más urgente
    deadline = _parse_d(tender.get("deadline"))
    urgency = 0
    if deadline:
        days = (deadline - as_of).days
        if 0 <= days <= 7:
            urgency = 40
        elif days <= 30:
            urgency = 25
        elif days <= 90:
            urgency = 10

    total = code_score + urgency
    return {
        "number": tender.get("number"),
        "description": tender.get("description"),
        "institution": tender.get("institution"),
        "source": tender.get("source"),
        "overlap_codes": sorted(overlap),
        "urgency_points": urgency,
        "total_score": total,
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--tenders", required=True, type=Path)
    ap.add_argument("--catalog", required=True, type=Path)
    ap.add_argument("--output", type=Path, default=None)
    a = ap.parse_args()

    tenders = json.loads(a.tenders.read_text())
    catalog = json.loads(a.catalog.read_text())
    catalog_codes = {c for item in catalog for c in item.get("unspsc", [])}
    as_of = date.today()

    results = [score(t, catalog_codes, as_of) for t in tenders]
    results.sort(key=lambda r: r["total_score"], reverse=True)
    print(json.dumps(results, indent=2, ensure_ascii=False))

    dest = a.output or (Path.cwd() / ".aaarrr" / "b2g" / "matches.json")
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(results, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
