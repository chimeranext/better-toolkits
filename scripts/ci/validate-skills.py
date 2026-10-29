#!/usr/bin/env python3
"""Validate SKILL.md files against the Agent Skills specification (agentskills.io).

Deterministic, offline, no external tool required. Checks the structural minimums:
frontmatter YAML, `name` (regex, no '--', <=64, matches parent dir), `description`
(non-empty, <=1024), `compatibility` (<=500). Docs: agentskills.io/specification.

Usage:
  python3 scripts/ci/validate-skills.py [roots...]   # default: shared/skills + toolkits/*/skills

Exit: 0 = all OK; 1 = problems found; 2 = PyYAML missing.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    print("PyYAML required: pip install pyyaml", file=sys.stderr)
    raise SystemExit(2)

NAME_RE = re.compile(r"^[a-z][a-z0-9-]*[a-z0-9]$")


def validate(skill_md: Path) -> list[str]:
    problems: list[str] = []
    try:
        text = skill_md.read_text(encoding="utf-8")
    except OSError as e:
        return [f"{skill_md}: unreadable: {e}"]

    if not text.startswith("---"):
        return [f"{skill_md}: missing YAML frontmatter (must start with ---)"]
    parts = text.split("---", 2)
    if len(parts) < 3:
        return [f"{skill_md}: malformed frontmatter"]
    try:
        fm = yaml.safe_load(parts[1]) or {}
    except Exception as e:  # noqa: BLE001
        return [f"{skill_md}: YAML error in frontmatter: {e}"]
    if not isinstance(fm, dict):
        return [f"{skill_md}: frontmatter must be a YAML mapping"]

    name = str(fm.get("name") or "")
    if not name:
        problems.append(f"{skill_md}: missing 'name'")
    elif not NAME_RE.match(name) or "--" in name or len(name) > 64:
        problems.append(
            f"{skill_md}: invalid name {name!r} (expect ^[a-z][a-z0-9-]*[a-z0-9]$, no '--', <=64)"
        )
    else:
        parent = skill_md.parent.name
        if parent != name:
            problems.append(f"{skill_md}: parent dir {parent!r} != name {name!r}")

    desc = str(fm.get("description") or "")
    if not desc:
        problems.append(f"{skill_md}: missing 'description'")
    elif len(desc) > 1024:
        problems.append(f"{skill_md}: description >1024 chars ({len(desc)})")

    compat = fm.get("compatibility")
    if compat is not None and len(str(compat)) > 500:
        problems.append(f"{skill_md}: compatibility >500 chars")

    return problems


def main(argv: list[str]) -> int:
    if argv[1:]:
        roots = [Path(r) for r in argv[1:]]
    else:
        roots = [Path("shared/skills")] + sorted(Path("toolkits").glob("*/skills"))

    count = 0
    all_problems: list[str] = []
    for root in roots:
        if not root.is_dir():
            continue
        for skill_md in sorted(root.rglob("SKILL.md")):
            count += 1
            all_problems.extend(validate(skill_md))

    if all_problems:
        for p in all_problems:
            print(p)
        print(f"\n{len(all_problems)} problem(s) across {count} skills", file=sys.stderr)
        return 1
    print(f"OK: {count} skills validated")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
