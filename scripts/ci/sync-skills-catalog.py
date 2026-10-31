#!/usr/bin/env python3
"""Hotfix: regenerate toolkit package.json -> skills catalog from on-disk skill folders.

Idempotent. Keeps the existing catalog `source` for each toolkit. Writes each
affected `package.json` in place so later commits/pushes carry a fresh catalog.
"""

from __future__ import annotations

import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
TOOLKITS = ROOT / "toolkits"


def main() -> int:
    if not TOOLKITS.is_dir():
        print("no toolkits/ dir", file=sys.stderr)
        return 1
    changed: list[str] = []
    for tk in sorted(TOOLKITS.iterdir()):
        if not tk.is_dir():
            continue
        skills_dir = tk / "skills"
        pkg_path = tk / "package.json"
        if not (skills_dir.is_dir() and pkg_path.exists()):
            continue
        names = sorted(p.name for p in skills_dir.iterdir() if p.is_dir())
        pkg = json.loads(pkg_path.read_text(encoding="utf-8"))
        catalog = pkg.get("skills") or []
        source = (
            catalog[0].get("source")
            if catalog and isinstance(catalog[0], dict) and catalog[0].get("source")
            else f"{ROOT.name}/{tk.name}"
        )
        new_catalog = [{"source": source, "skills": names}]
        if catalog != new_catalog:
            pkg["skills"] = new_catalog
            pkg_path.write_text(
                json.dumps(pkg, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            changed.append(tk.name)
    print("synced catalogs:", ", ".join(changed) if changed else "(none)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
