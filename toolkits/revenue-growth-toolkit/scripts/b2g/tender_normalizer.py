#!/usr/bin/env python3
"""
B2G — normalizador de tenders/RFP desde plataformas de compras públicas.

Agnóstico de país: convierte registros crudos (SICOP/CR, CompraNet/MX,
Guatecompras/GT, SECOP/CO, ComprasNet/BR, COMPR.AR/AR, Mercado Público/CL…)
al modelo normalizado `Tender`. Ingresa a la skill b2g del
revenue-growth-toolkit.

Usage:
  python3 tender_normalizer.py --input raw.json --source sicop --output tender.json
"""
import argparse
import json
import sys
from datetime import date
from pathlib import Path


# Mapeo de campos crudos por plataforma → campos normalizados.
KEYS = {
    # Costa Rica — SICOP (datos abiertos)
    "sicop": {
        "number": "numero_procedimiento",
        "description": "descripcion",
        "institution": "institucion",
        "unspsc": "unspsc",
        "published": "fecha_publicacion",
        "deadline": "fecha_cierre",
    },
    # México — CompraNet
    "compranet": {
        "number": "expediente",
        "description": "objeto_contratacion",
        "institution": "dependencia",
        "unspsc": "clave_unspsc",
        "published": "fecha_publicacion",
        "deadline": "fecha_limite",
    },
    # Colombia — SECOP
    "secop": {
        "number": "numero_proceso",
        "description": "objeto_contratar",
        "institution": "entidad",
        "unspsc": "codigo_unspsc",
        "published": "fecha_publicacion",
        "deadline": "fecha_cierre",
    },
    # Chile — Mercado Público
    "mercado-publico": {
        "number": "codigo_licitacion",
        "description": "nombre_licitacion",
        "institution": "organismo_comprador",
        "unspsc": "categoria_unspsc",
        "published": "fecha_publicacion",
        "deadline": "fecha_cierre",
    },
}


def _get(row, key):
    v = row.get(key)
    if v in (None, "", "null", "NULL"):
        return None
    return str(v).strip()


def normalize(row: dict, source: str) -> dict:
    k = KEYS.get(source)
    if not k:
        raise ValueError(f"Fuente desconocida: {source}. Válidas: {', '.join(KEYS)}")
    return {
        "source": source,
        "number": _get(row, k["number"]),
        "description": _get(row, k["description"]),
        "institution": _get(row, k["institution"]),
        "unspsc": _get(row, k["unspsc"]),
        "published": _get(row, k["published"]),
        "deadline": _get(row, k["deadline"]),
        "raw": row,
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, type=Path)
    ap.add_argument("--source", required=True, choices=list(KEYS))
    ap.add_argument("--output", type=Path, default=None)
    a = ap.parse_args()

    raw = json.loads(a.input.read_text())
    rows = raw if isinstance(raw, list) else raw.get("records", [])
    out = [normalize(r, a.source) for r in rows]
    print(json.dumps(out, indent=2, ensure_ascii=False))

    dest = a.output or (Path.cwd() / ".aaarrr" / "b2g" / f"tenders-{source}.json".replace("source", a.source))
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(out, indent=2, ensure_ascii=False))
    print(f"\nSaved to {dest}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
