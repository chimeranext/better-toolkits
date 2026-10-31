#!/usr/bin/env python3
"""Hotfix gate: fail when a toolkit package.json skills catalog drifts from disk.

Runs at pre-commit/pre-push. Fix with `scripts/ci/sync-skills-catalog.py`.
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
    problems: list[str] = []
    for tk in sorted(TOOLKITS.iterdir()):
        if not tk.is_dir():
            continue
        skills_dir = tk / "skills"
        pkg_path = tk / "package.json"
        if not (skills_dir.is_dir() and pkg_path.exists()):
            continue
        names = sorted(p.name for p in skills_dir.iterdir() if p.is_dir())
        catalog: list[str] = []
        for entry in json.loads(pkg_path.read_text(encoding="utf-8")).get("skills", []):
            catalog.extend(entry.get("skills", []))
        missing = sorted(set(names) - set(catalog))
        extra = sorted(set(catalog) - set(names))
        if missing or extra:
            problems.append(
                f"{tk.name}: missing_in_catalog={missing} not_on_disk={extra}"
            )
    if problems:
        print("SKILLS CATALOG DRIFT:")
        for p in problems:
            print("  -", p)
        return 1
    print("skills catalog OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
