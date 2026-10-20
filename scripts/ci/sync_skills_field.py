#!/usr/bin/env python3
"""Keep package.json `skills` aligned with SKILL.md directories.

Grammar: antfu/skills-npm, as read by the skills CLI (`package.json` `skills`
field). Each toolkit declares the GitHub source plus the skill folder names it
ships. Install with `npx skills add chimeranext/better-toolkits --skill <name>
--agent '*'`. `--all` installs every skill in the repo to every agent.

Subcommands:
  write — set the skills field from the tree
  check — exit 1 if a package.json skills list drifted
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = "chimeranext/better-toolkits"
SHARED_SOURCE = "shared/skills"
SHARED_NAME = "@chimeranext/better-toolkits-shared"


def _read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def _dump(doc: dict) -> str:
    return json.dumps(doc, indent=2, ensure_ascii=False) + "\n"


def discover_skills(skills_dir: Path) -> list[str]:
    if not skills_dir.is_dir():
        return []
    names: list[str] = []
    for child in skills_dir.iterdir():
        if child.name.startswith("."):
            continue
        if (child / "SKILL.md").is_file():
            names.append(child.name)
    return sorted(names)


def skills_field(names: list[str]) -> list[dict]:
    return [{"source": SOURCE, "skills": names}]


def expected_packages(root: Path) -> dict[Path, dict]:
    marketplace = _read_json(root / ".claude-plugin" / "marketplace.json")
    out: dict[Path, dict] = {}
    for entry in marketplace.get("plugins", []):
        rel = str(entry["source"]).removeprefix("./").rstrip("/")
        base = root / rel
        names = discover_skills(base / "skills")
        if not names:
            continue
        path = base / "package.json"
        if path.is_file():
            doc = _read_json(path)
        else:
            plugin = _read_json(base / ".claude-plugin" / "plugin.json")
            doc = {
                "name": str(plugin["name"]),
                "version": str(plugin["version"]),
                "private": True,
                "description": plugin.get("description", ""),
                "license": plugin.get("license", "BSL-1.1"),
            }
        doc["skills"] = skills_field(names)
        out[path] = doc

    shared = root / SHARED_SOURCE
    shared_names = discover_skills(shared)
    shared_doc = {
        "name": SHARED_NAME,
        "private": True,
        "description": "Transversal skills for the better-toolkits monorepo.",
        "license": "BSL-1.1",
        "skills": skills_field(shared_names),
    }
    out[shared / "package.json"] = shared_doc
    return out


def cmd_write(root: Path) -> int:
    for path, doc in expected_packages(root).items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(_dump(doc), encoding="utf-8")
        print(f"wrote {path.relative_to(root)}")
    return 0


def cmd_check(root: Path) -> int:
    bad = 0
    for path, doc in expected_packages(root).items():
        rel = path.relative_to(root)
        if not path.is_file():
            print(f"MISSING {rel}", file=sys.stderr)
            bad += 1
            continue
        actual = _read_json(path)
        if actual.get("skills") != doc["skills"]:
            print(
                f"DRIFT {rel} skills — run: python3 scripts/ci/sync_skills_field.py write",
                file=sys.stderr,
            )
            bad += 1
    return 1 if bad else 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("write")
    sub.add_parser("check")
    ns = parser.parse_args(argv)
    root = ns.root.resolve()
    if ns.cmd == "write":
        return cmd_write(root)
    return cmd_check(root)


if __name__ == "__main__":
    raise SystemExit(main())
