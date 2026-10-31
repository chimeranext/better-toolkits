#!/usr/bin/env python3
"""Hotfix gate: fail when a toolkit package.json skills catalog drifts from disk.

Covers every toolkit with a skills/ folder, including toolkits that lack a
package.json (a missing catalog is itself drift). Fix with
`scripts/ci/sync-skills-catalog.py`.
"""

from __future__ import annotations

import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
TOOLKITS = ROOT / "toolkits"
CANONICAL_SOURCE = "chimeranext/better-toolkits"


def main() -> int:
    if not TOOLKITS.is_dir():
        print("no toolkits/ dir", file=sys.stderr)
        return 1
    problems: list[str] = []
    checked = 0
    for tk in sorted(TOOLKITS.iterdir()):
        if not tk.is_dir():
            continue
        skills_dir = tk / "skills"
        if not skills_dir.is_dir():
            continue
        names = sorted(
            p.name for p in skills_dir.iterdir() if p.is_dir() and (p / "SKILL.md").exists()
        )
        pkg_path = tk / "package.json"
        if not pkg_path.exists():
            problems.append(f"{tk.name}: NO package.json ({len(names)} skills sin listar)")
            continue
        catalog: list[dict] = json.loads(pkg_path.read_text(encoding="utf-8")).get("skills", [])
        ok_source = bool(catalog) and catalog[0].get("source") == CANONICAL_SOURCE
        listed = catalog[0].get("skills", []) if catalog else []
        missing = sorted(set(names) - set(listed))
        extra = sorted(set(listed) - set(names))
        if not ok_source:
            problems.append(f"{tk.name}: source no canónico (esperado {CANONICAL_SOURCE})")
        if missing or extra:
            problems.append(f"{tk.name}: missing_in_catalog={missing} not_on_disk={extra}")
        checked += 1
    if problems:
        print("SKILLS CATALOG DRIFT:")
        for p in problems:
            print("  -", p)
        return 1
    print(f"skills catalog OK ({checked} toolkits)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
