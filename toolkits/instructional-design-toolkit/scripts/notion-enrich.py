#!/usr/bin/env python3
"""
notion-enrich.py — Enricher for the deep-research pipeline.

Reads a sitemap.yaml (produced by /deep-research) and, for every
external resource, fetches its content using the right tool by `kind`:

  youtube  -> yt-dlp --write-subs --skip-download  (transcript)
  article  -> crw (fast) or webfetch fallback       (markdown)
  pdf      -> crw extract                           (text)
  image    -> download to <out>/assets/
  bookmark -> resolve destination via Notion REST API, then re-classify

Writes per-resource .md files under each guide's local_path and a manifest.json
with status (dumped/enriched/pending) per node.

Usage:
  notion-enrich.py --sitemap docs/vertivo/sitemap.yaml [--out docs/vertivo] [--dry-run]

Prerequisites:
  - yt-dlp (for youtube), crw (optional, for article/pdf), scrapling (optional fallback)
  - NOTION_API_KEY (only needed for bookmark resolution)

No stderr is discarded: every subprocess error is logged to stderr and the
manifest records the failure so the run is resumable.
"""
import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("ERROR: PyYAML is required. Install with: pip install pyyaml", file=sys.stderr)
    sys.exit(1)


def log(msg):
    print(msg, file=sys.stderr, flush=True)


def run_tool(cmd, timeout=120):
    """Run a command, capture stdout+stderr separately, never discard stderr."""
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        return result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return 124, "", f"timeout after {timeout}s"
    except FileNotFoundError as e:
        return 127, "", f"command not found: {e.filename}"
    except Exception as e:  # noqa: BLE001
        return 1, "", str(e)


def classify_url(url):
    """Classify a URL into a kind if not already tagged."""
    low = url.lower()
    if "youtube.com" in low or "youtu.be" in low:
        return "youtube"
    if low.endswith(".pdf"):
        return "pdf"
    if any(low.endswith(ext) for ext in (".png", ".jpg", ".jpeg", ".gif", ".webp")):
        return "image"
    return "article"


def enrich_resource(res, guide_local_path, dry_run=False):
    """Enrich a single resource. Returns (status, detail)."""
    kind = res.get("kind", "article")
    url = res.get("url", "")
    out_dir = Path(guide_local_path)
    if dry_run:
        return "would-enrich", f"[dry-run] {kind}: {url}"

    out_dir.mkdir(parents=True, exist_ok=True)

    if kind == "youtube":
        # yt-dlp: write subtitles, skip download
        cmd = ["yt-dlp", "--write-subs", "--skip-download", "--sub-langs", "es,en", "-o", str(out_dir / "yt_%(id)s"), url]
        rc, stdout, stderr = run_tool(cmd, timeout=180)
        if rc != 0:
            return "failed", f"yt-dlp rc={rc}: {stderr.strip()[:200]}"
        return "enriched", f"yt-dlp: {stdout.strip()[:100]}"

    if kind in ("article", "pdf"):
        # Try crw first (fast), fall back to a simple note
        cmd = ["crw", url]
        rc, stdout, stderr = run_tool(cmd, timeout=120)
        if rc == 0 and stdout.strip():
            slug = url.split("/")[-1][:40] or "resource"
            out_file = out_dir / f"{slug}.md"
            out_file.write_text(f"# {url}\n\n{stdout}\n", encoding="utf-8")
            return "enriched", f"crw: {out_file}"
        # crw unavailable or failed — record for manual fetch
        return "pending", f"crw unavailable/failed (rc={rc}): {stderr.strip()[:120]}"

    if kind == "image":
        # Download to assets/
        assets = out_dir / "assets"
        assets.mkdir(parents=True, exist_ok=True)
        filename = url.split("/")[-1].split("?")[0] or "image.bin"
        cmd = ["curl", "-sS", "-o", str(assets / filename), url]
        rc, stdout, stderr = run_tool(cmd, timeout=60)
        if rc != 0:
            return "failed", f"curl rc={rc}: {stderr.strip()[:120]}"
        return "enriched", f"downloaded: {assets / filename}"

    if kind == "bookmark":
        # Resolve via Notion REST API (requires NOTION_API_KEY)
        token = os.environ.get("NOTION_API_KEY", "")
        if not token:
            return "pending", "NOTION_API_KEY not set — cannot resolve bookmark"
        # Extract block id from the notion page url if present
        return "pending", "bookmark resolution not yet implemented (needs REST call)"

    if kind == "notion_page":
        # Already a Notion page — the wrapper should fetch_tree it; here we just note
        return "pending", "notion_page: fetch via notion-batch fetch_tree"

    return "skipped", f"unknown kind: {kind}"


def process_guide(guide, out_root, dry_run=False):
    """Process a single guide: check local_path, enrich resources."""
    local_path = guide.get("local_path")
    if not local_path:
        return {"id": guide["id"], "status": "no-local-path", "resources": []}

    lp = Path(local_path)
    status = "exists" if lp.exists() else "missing"
    res_results = []
    for res in guide.get("resources", []) or []:
        st, detail = enrich_resource(res, local_path, dry_run=dry_run)
        res_results.append({"url": res.get("url", ""), "kind": res.get("kind", ""), "status": st, "detail": detail})

    # Recurse into children
    child_results = []
    for child in guide.get("children", []) or []:
        if child.get("kind") == "notion_page" and child.get("local_path"):
            child_lp = Path(child["local_path"])
            child_status = "exists" if child_lp.exists() else "missing"
            child_results.append({"title": child.get("title"), "local_path": child["local_path"], "status": child_status})
            # Recurse (children of children)
            if child.get("children"):
                for gc in child["children"]:
                    if isinstance(gc, dict) and gc.get("local_path"):
                        gc_lp = Path(gc["local_path"])
                        child_results.append({"title": gc.get("title", gc.get("kind")), "local_path": gc["local_path"], "status": "exists" if gc_lp.exists() else "missing"})

    return {
        "id": guide["id"],
        "skill": guide.get("skill"),
        "local_path": local_path,
        "hub_status": status,
        "children": child_results,
        "resources": res_results,
    }


def main():
    parser = argparse.ArgumentParser(description="Enrich Notion sitemap resources")
    parser.add_argument("--sitemap", required=True, help="Path to sitemap.yaml")
    parser.add_argument("--out", default=None, help="Output root (default: sitemap's parent)")
    parser.add_argument("--dry-run", action="store_true", help="Report only, no writes")
    args = parser.parse_args()

    sitemap_path = Path(args.sitemap)
    if not sitemap_path.is_file():
        print(f"ERROR: sitemap not found: {sitemap_path}", file=sys.stderr)
        sys.exit(1)

    with open(sitemap_path, encoding="utf-8") as f:
        data = yaml.safe_load(f)

    guides = data.get("guides", [])
    manifest = {"guides": [], "summary": {"total": len(guides), "enriched": 0, "pending": 0, "failed": 0}}

    for guide in guides:
        result = process_guide(guide, args.out or str(sitemap_path.parent), dry_run=args.dry_run)
        manifest["guides"].append(result)
        for r in result.get("resources", []):
            if r["status"] in ("enriched", "would-enrich"):
                manifest["summary"]["enriched"] += 1
            elif r["status"] == "pending":
                manifest["summary"]["pending"] += 1
            elif r["status"] == "failed":
                manifest["summary"]["failed"] += 1

    # Write manifest
    manifest_path = sitemap_path.parent / "manifest.json"
    if not args.dry_run:
        manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
        log(f"Manifest written: {manifest_path}")

    log(f"Summary: {manifest['summary']}")
    # Print summary to stdout
    print(json.dumps(manifest["summary"], indent=2))


if __name__ == "__main__":
    main()