#!/usr/bin/env python3
"""Hotfix: regenerate skills catalogs from on-disk skill folders.

Covers every toolkit with a `skills/` folder plus the repo-level `shared/skills`
(owned by `shared/package.json`). Idempotent. Only prints toolkits whose catalog
changed, and enumerates every scanned unit with its delta status.
"""

from __future__ import annotations

import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
TOOLKITS = ROOT / "toolkits"
SHARED_SKILLS = ROOT / "shared" / "skills"
SHARED_PKG = ROOT / "shared" / "package.json"
CANONICAL_SOURCE = "chimeranext/better-toolkits"


def canonical_pkg(name: str, names: list[str]) -> dict:
    return {
        "name": name,
        "version": "0.1.0",
        "private": True,
        "type": "module",
        "description": "",
        "scripts": {},
        "skills": [{"source": CANONICAL_SOURCE, "skills": names}],
    }


def sync_unit(label: str, skills_dir: pathlib.Path, pkg_path: pathlib.Path) -> tuple[bool, str]:
    if not skills_dir.is_dir():
        return False, f"  skipped  {label} (sin carpeta skills/)"
    names = sorted(
        p.name for p in skills_dir.iterdir() if p.is_dir() and (p / "SKILL.md").exists()
    )
    if not pkg_path.exists():
        pkg_path.write_text(
            json.dumps(canonical_pkg(label, names), ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        return True, f"  CHANGED  {label} (package.json creado, {len(names)} skills)"
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
        return True, f"  CHANGED  {label}"
    return False, f"  in-sync  {label}"


def main() -> int:
    units: list[tuple[str, pathlib.Path, pathlib.Path]] = []
    if TOOLKITS.is_dir():
        for tk in sorted(TOOLKITS.iterdir()):
            if tk.is_dir():
                units.append((tk.name, tk / "skills", tk / "package.json"))
    if SHARED_SKILLS.is_dir():
        units.append(("shared", SHARED_SKILLS, SHARED_PKG))
    if not units:
        print("no skill units found", file=sys.stderr)
        return 1
    changed = 0
    rows: list[str] = []
    for label, skills_dir, pkg_path in units:
        did_change, row = sync_unit(label, skills_dir, pkg_path)
        changed += int(did_change)
        rows.append(row)
    print(f"units scanned: {len(rows)}")
    for row in rows:
        print(row)
    print(f"summary: changed={changed} in-sync={len(rows)-changed}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
