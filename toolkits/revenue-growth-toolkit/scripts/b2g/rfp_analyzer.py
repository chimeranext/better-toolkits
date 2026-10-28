#!/usr/bin/env python3
"""
B2G — analiza un pliego/RFP y extrae requisitos accionables → trabajo agent-ready.

Agnóstico de país. Toma el texto del pliego (o un tender normalizado con el
documento) y produce una lista de requisitos clasificados: habilitantes,
documentales, técnicos, financieros (fianzas), y de compliance/firma digital.
Alimenta `revenue-ops-triage` dentro del revenue-growth-toolkit.

Usage:
  python3 rfp_analyzer.py --rfp rfp.md [--output requirements.json]
"""
import argparse
import json
import re
import sys
from pathlib import Path

CATEGORIES = {
    "habilitante": ["requisito", "habilitante", "elegibilidad", "obligatorio"],
    "documental": ["documento", "certificado", "constancia", "escritura", "registro"],
    "tecnico": ["especificación", "especificacion", "norma", "técnico", "tecnico", "norma técnica"],
    "financiero": ["fianza", "garantía", "garantia", "capital", "flujo", "estado financiero"],
    "compliance": ["firma digital", "firma electrónica", "firma electronica", "licencia", "permiso", "cumplimiento"],
}


def analyze(text: str) -> list[dict]:
    bullets = re.findall(r"(?m)^\s*[-*•]\s+(.+)", text)
    if not bullets:
        # fallback: oraciones que contengan palabras clave
        bullets = re.findall(r"([^.\n]+(?:requisito|fianza|documento|certificado|firma)[^.\n]*)", text)
    reqs = []
    for b in bullets:
        low = b.lower()
        cat = "general"
        for name, kw in CATEGORIES.items():
            if any(k in low for k in kw):
                cat = name
                break
        reqs.append({"requirement": b.strip(), "category": cat})
    return reqs


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--rfp", required=True, type=Path)
    ap.add_argument("--output", type=Path, default=None)
    a = ap.parse_args()
    reqs = analyze(a.rfp.read_text(errors="replace"))
    print(json.dumps({"requirements": reqs, "count": len(reqs)}, indent=2, ensure_ascii=False))
    dest = a.output or (Path.cwd() / ".aaarrr" / "b2g" / "rfp-requirements.json")
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps({"requirements": reqs}, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
