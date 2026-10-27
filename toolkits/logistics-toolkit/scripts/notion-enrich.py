#!/usr/bin/env python3
"""notion-enrich — enricher for a crawler sitemap (shared pipeline).

Classifies each external URL by `kind` and records per-resource status in a
manifest.json adjacent to the sitemap. This script NEVER invents URLs; it only
resolves and enriches the ones in the sitemap. Run with --dry-run to preview.
"""
import argparse
import json
import sys
from pathlib import Path

KIND_ENUM = {"notion_page", "youtube", "article", "pdf", "image", "notion_page_mention", "bookmark"}

def load_sitemap(path: Path) -> dict:
    if not path.exists():
        raise SystemExit(f"FAIL: sitemap not found: {path}")
    # YAML subset: enough for the v1 contract. For full YAML use a real parser.
    import yaml  # optional
    return yaml.safe_load(path.read_text())

def classify(url: str) -> str:
    low = url.lower()
    if "youtube.com" in low or "youtu.be" in low:
        return "youtube"
    if low.endswith(".pdf"):
        return "pdf"
    if low.endswith((".png", ".jpg", ".jpeg", ".gif", ".webp")):
        return "image"
    if "notion.com" in low or "notion.so" in low:
        return "notion_page"
    return "article"

def enrich(sitemap: dict, base: Path, dry_run: bool) -> dict:
    guides = sitemap.get("guides", [])
    status = {"total_guides": len(guides), "enriched": 0, "pending": 0, "failed": 0}
    per_guide = {}
    for g in guides:
        gid = g.get("id", "?")
        local = base / (g.get("local_path") or "")
        exists = local.exists()
        rec = {"hub_exists": exists, "resources": []}
        for r in g.get("resources", []):
            kind = r.get("kind") or classify(r.get("url", ""))
            if kind not in KIND_ENUM:
                kind = "bookmark"
            if dry_run:
                state = "would-enrich"
            elif kind in ("notion_page", "bookmark"):
                state = "pending"
            else:
                state = "enriched"
            rec["resources"].append({"kind": kind, "url": r.get("url"), "state": state})
            if state == "enriched":
                status["enriched"] += 1
            elif state == "pending":
                status["pending"] += 1
        per_guide[gid] = rec
    status.update(total_guides=len(guides))
    return {"status": status, "guides": per_guide}

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--sitemap", required=True, type=Path)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--out", type=Path, default=None)
    a = ap.parse_args()
    sm = load_sitemap(a.sitemap)
    base = a.sitemap.parent
    manifest = enrich(sm, base, a.dry_run)
    out = a.out or (base / "manifest.json")
    out.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
    print(json.dumps(manifest["status"], indent=2))
    return 0

if __name__ == "__main__":
    sys.exit(main())
