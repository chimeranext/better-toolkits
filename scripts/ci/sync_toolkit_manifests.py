#!/usr/bin/env python3
"""Agent-agnostic toolkit catalog.

Each marketplace plugin gets a ``toolkit.json`` next to its ``plugin.json`` tree.
That file is the catalog any agent can install: skill names, slash-command names,
and hook packages. Claude ``marketplace.json`` and Cursor's plugin list stay
adapters of the same tree.

``shared/skills/toolkit.json`` lists transversal skills that are not a plugin.

Subcommands:
  write — regenerate every manifest from the tree
  check — exit 1 if a committed manifest differs from the tree
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MARKETPLACE = ROOT / ".claude-plugin" / "marketplace.json"
REPOSITORY = "chimeranext/better-toolkits"
SHARED_SOURCE = "shared/skills"
SHARED_NAME = "better-toolkits-shared"


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


def discover_commands(commands_dir: Path) -> list[str]:
    if not commands_dir.is_dir():
        return []
    names = [
        path.stem
        for path in commands_dir.glob("*.md")
        if path.is_file() and path.stem != "README"
    ]
    return sorted(names)


def discover_hooks(hooks_dir: Path) -> list[str]:
    if not hooks_dir.is_dir():
        return []
    names = [
        child.name
        for child in hooks_dir.iterdir()
        if child.is_dir() and not child.name.startswith(".")
    ]
    return sorted(names)


def manifest_for_plugin(root: Path, entry: dict) -> tuple[Path, dict]:
    source = str(entry["source"])
    rel = source.removeprefix("./").rstrip("/")
    base = root / rel
    plugin_json = base / ".claude-plugin" / "plugin.json"
    if not plugin_json.is_file():
        raise FileNotFoundError(plugin_json)
    plugin = _read_json(plugin_json)
    version = str(plugin.get("version") or entry["version"])
    doc = {
        "schemaVersion": 1,
        "name": str(entry["name"]),
        "version": version,
        "source": source if source.startswith("./") else f"./{rel}",
        "repository": REPOSITORY,
        "skills": discover_skills(base / "skills"),
        "commands": discover_commands(base / "commands"),
        "hooks": discover_hooks(base / "hooks"),
    }
    return base / "toolkit.json", doc


def manifest_for_shared(root: Path) -> tuple[Path, dict]:
    base = root / SHARED_SOURCE
    doc = {
        "schemaVersion": 1,
        "name": SHARED_NAME,
        "source": f"./{SHARED_SOURCE}",
        "repository": REPOSITORY,
        "skills": discover_skills(base),
        "commands": [],
        "hooks": [],
    }
    return base / "toolkit.json", doc


def expected_manifests(root: Path) -> dict[Path, dict]:
    marketplace = root / ".claude-plugin" / "marketplace.json"
    data = _read_json(marketplace)
    out: dict[Path, dict] = {}
    for entry in data.get("plugins", []):
        path, doc = manifest_for_plugin(root, entry)
        out[path] = doc
    path, doc = manifest_for_shared(root)
    out[path] = doc
    return out


def cmd_write(root: Path) -> int:
    for path, doc in expected_manifests(root).items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(_dump(doc), encoding="utf-8")
        print(f"wrote {path.relative_to(root)}")
    return 0


def cmd_check(root: Path) -> int:
    bad = 0
    for path, doc in expected_manifests(root).items():
        rel = path.relative_to(root)
        if not path.is_file():
            print(f"MISSING {rel}", file=sys.stderr)
            bad += 1
            continue
        actual = _read_json(path)
        if actual != doc:
            print(
                f"DRIFT {rel} — run: python3 scripts/ci/sync_toolkit_manifests.py write",
                file=sys.stderr,
            )
            bad += 1
    return 1 if bad else 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT, help="monorepo root")
    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("write", help="regenerate toolkit.json files")
    sub.add_parser("check", help="exit 1 on drift")
    ns = parser.parse_args(argv)
    root = ns.root.resolve()
    if ns.cmd == "write":
        return cmd_write(root)
    return cmd_check(root)


if __name__ == "__main__":
    raise SystemExit(main())
