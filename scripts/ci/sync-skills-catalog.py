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
CANONICAL_SOURCE = "chimeranext/better-toolkits"


def canonical_pkg(tk: pathlib.Path, names: list[str]) -> dict:
    name = tk.name.removesuffix("-toolkit") or tk.name
    return {
        "name": name,
        "version": "0.1.0",
        "private": True,
        "type": "module",
        "description": "",
        "scripts": {},
        "skills": [{"source": CANONICAL_SOURCE, "skills": names}],
    }


def main() -> int:
    if not TOOLKITS.is_dir():
        print("no toolkits/ dir", file=sys.stderr)
        return 1
    changed: list[str] = []
    rows: list[str] = []
    for tk in sorted(TOOLKITS.iterdir()):
        if not tk.is_dir():
            continue
        skills_dir = tk / "skills"
        pkg_path = tk / "package.json"
        if not skills_dir.is_dir():
            rows.append(f"  skipped  {tk.name} (sin carpeta skills/)")
            continue
        names = sorted(p.name for p in skills_dir.iterdir() if p.is_dir() and (p / "SKILL.md").exists())
        if not pkg_path.exists():
            pkg_path.write_text(
                json.dumps(canonical_pkg(tk, names), ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            changed.append(tk.name)
            rows.append(f"  CHANGED  {tk.name} (package.json creado, {len(names)} skills)")
            continue
        pkg = json.loads(pkg_path.read_text(encoding="utf-8"))
        catalog = pkg.get("skills") or []
        current = (
            {
                "source": catalog[0].get("source"),
                "skills": sorted(catalog[0].get("skills", [])),
            }
            if catalog and isinstance(catalog[0], dict)
            else None
        )
        expected = {"source": CANONICAL_SOURCE, "skills": names}
        if current != expected:
            pkg["skills"] = [expected]
            pkg_path.write_text(
                json.dumps(pkg, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            changed.append(tk.name)
            rows.append(f"  CHANGED  {tk.name}")
        else:
            rows.append(f"  in-sync  {tk.name}")
    print(f"toolkits scanned: {len(rows)}")
    for row in rows:
        print(row)
    print(f"summary: changed={len(changed)} in-sync={len(rows)-len(changed)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
