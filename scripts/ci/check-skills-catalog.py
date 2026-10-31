#!/usr/bin/env python3
"""Hotfix gate: fail when a skills catalog drifts from disk.

Covers every toolkit with a skills/ folder plus shared/skills. A toolkit with
skills but no package.json is itself drift (a missing catalog). Fix with
`scripts/ci/sync-skills-catalog.py`.
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


def check_unit(label: str, skills_dir: pathlib.Path, pkg_path: pathlib.Path, problems: list[str]) -> None:
    if not skills_dir.is_dir():
        return
    names = sorted(
        p.name for p in skills_dir.iterdir() if p.is_dir() and (p / "SKILL.md").exists()
    )
    if not pkg_path.exists():
        problems.append(f"{label}: NO package.json ({len(names)} skills sin listar)")
        return
    catalog: list[dict] = json.loads(pkg_path.read_text(encoding="utf-8")).get("skills", [])
    ok_source = bool(catalog) and catalog[0].get("source") == CANONICAL_SOURCE
    listed = catalog[0].get("skills", []) if catalog else []
    missing = sorted(set(names) - set(listed))
    extra = sorted(set(listed) - set(names))
    if not ok_source:
        problems.append(f"{label}: source no canónico (esperado {CANONICAL_SOURCE})")
    if missing or extra:
        problems.append(f"{label}: missing_in_catalog={missing} not_on_disk={extra}")


def main() -> int:
    problems: list[str] = []
    checked = 0
    if TOOLKITS.is_dir():
        for tk in sorted(TOOLKITS.iterdir()):
            if not tk.is_dir():
                continue
            check_unit(tk.name, tk / "skills", tk / "package.json", problems)
            if (tk / "skills").is_dir():
                checked += 1
    if SHARED_SKILLS.is_dir():
        check_unit("shared", SHARED_SKILLS, SHARED_PKG, problems)
        checked += 1
    if problems:
        print("SKILLS CATALOG DRIFT:")
        for p in problems:
            print("  -", p)
        return 1
    print(f"skills catalog OK ({checked} units)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
