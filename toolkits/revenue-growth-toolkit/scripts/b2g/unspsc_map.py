#!/usr/bin/env python3
"""
B2G — mapea un catálogo de productos/servicios del cliente → códigos UNSPSC.

Agnóstico de país. Usa un diccionario de sinónimos ES/EN (el mismo patrón de
hunter-core) para traducir el catálogo a UNSPSC de 8 dígitos, que luego se
cruza contra los tenders normalizados.

Usage:
  python3 unspsc_map.py --catalog catalog.json --synonyms synonyms.json
"""
import argparse
import json
import sys
from pathlib import Path


def load_synonyms(path: Path) -> dict:
    if not path.exists():
        return {}
    return json.loads(path.read_text())


def map_catalog(catalog, synonyms) -> list[dict]:
    out = []
    for item in catalog:
        name = item.get("name", "").strip().lower()
        codes = set()
        if isinstance(item.get("unspsc"), list):
            codes.update(str(c) for c in item["unspsc"])
        # sinónimos a partir del diccionario ES/EN
        for term, code in synonyms.items():
            if term.lower() in name and code not in codes:
                codes.add(str(code))
        out.append({
            "name": item.get("name"),
            "segment": item.get("segment"),
            "unspsc": sorted(codes),
        })
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--catalog", required=True, type=Path)
    ap.add_argument("--synonyms", type=Path, default=None)
    ap.add_argument("--output", type=Path, default=None)
    a = ap.parse_args()

    catalog = json.loads(a.catalog.read_text())
    synonyms = load_synonyms(a.synonyms) if a.synonyms else {}
    out = map_catalog(catalog, synonyms)
    print(json.dumps(out, indent=2, ensure_ascii=False))

    dest = a.output or (Path.cwd() / ".aaarrr" / "b2g" / "catalog-unspsc.json")
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(out, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
