#!/usr/bin/env python3
"""Marketplace plugin version discipline for the better-toolkits monorepo.

SSOT: `.claude-plugin/marketplace.json` + each plugin's `.claude-plugin/plugin.json`.

When agent-facing toolkit files change, the plugin version MUST increase (patch by
default) so Cursor/Claude can fetch updates via `agent plugin marketplace update`.

After bumping, maintainers on Cursor should run
`shared/bootstrap/scripts/prune-better-toolkits-cache.sh` with **no
arguments** (see `/prune-better-toolkits-cache`). That script `rm -rf`s only
`~/.cursor/plugins/cache/chimeranext-better-toolkits` and
`~/.cursor/plugins/cache/better-toolkits`, then runs
`agent plugin marketplace update better-toolkits`.

Subcommands:
  check  — fail if release-relevant files changed in --range but version did not increase
  write  — bump patch version for plugins with release-relevant changes in --range
  sync   — ensure marketplace.json versions match each plugin.json (always)

Range examples: `origin/main..HEAD`, `@{upstream}..HEAD`
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MARKETPLACE = ROOT / ".claude-plugin" / "marketplace.json"

# Paths under a plugin tree that do not require a marketplace bump by themselves.
IGNORE_SUFFIXES = (
    "/CHANGELOG.md",
    "/README.md",
    "/.skillspector-baseline.yaml",
    "/.claude-plugin/plugin.json",
)

RELEASE_PREFIXES = (
    "commands/",
    "references/",
    "skills/",
    "hooks/",
    "agents/",
    "rules/",
    ".claude-plugin/",
)


@dataclass(frozen=True)
class Plugin:
    name: str
    version: str
    source: str  # e.g. ./toolkits/make-no-mistakes-toolkit

    @property
    def rel_source(self) -> str:
        return self.source.removeprefix("./").rstrip("/")

    @property
    def root(self) -> Path:
        return ROOT / self.rel_source

    @property
    def plugin_json(self) -> Path:
        return self.root / ".claude-plugin" / "plugin.json"


def _run_git(args: list[str]) -> str:
    proc = subprocess.run(
        ["git", "-C", str(ROOT), *args],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.strip() or proc.stdout.strip() or "git failed")
    return proc.stdout


def load_plugins() -> list[Plugin]:
    data = json.loads(MARKETPLACE.read_text(encoding="utf-8"))
    out: list[Plugin] = []
    for entry in data.get("plugins", []):
        out.append(
            Plugin(
                name=entry["name"],
                version=str(entry["version"]),
                source=str(entry["source"]),
            )
        )
    return out


def plugin_for_path(path: str, plugins: list[Plugin]) -> Plugin | None:
    norm = path.strip()
    if norm == ".claude-plugin/marketplace.json":
        return None
    for p in plugins:
        prefix = p.rel_source + "/"
        if norm == p.rel_source or norm.startswith(prefix):
            return p
    return None


def is_release_relevant(path: str) -> bool:
    for suf in IGNORE_SUFFIXES:
        if path.endswith(suf):
            return False
    plugins = load_plugins()
    pl = plugin_for_path(path, plugins)
    if not pl:
        return False
    rel = path
    prefix = pl.rel_source + "/"
    if rel.startswith(prefix):
        rel = rel[len(prefix) :]
    elif rel != pl.rel_source:
        return False
    else:
        return False
    return any(rel.startswith(pref) for pref in RELEASE_PREFIXES)


def changed_files(range_spec: str) -> list[str]:
    out = _run_git(["diff", "--name-only", range_spec])
    files = [line.strip() for line in out.splitlines() if line.strip()]
    return files


def version_at_rev(plugin: Plugin, rev: str) -> str | None:
    path = f".claude-plugin/marketplace.json"
    try:
        blob = _run_git(["show", f"{rev}:{path}"])
    except RuntimeError:
        return None
    data = json.loads(blob)
    for entry in data.get("plugins", []):
        if entry.get("name") == plugin.name:
            return str(entry.get("version"))
    return None


def parse_semver(v: str) -> tuple[int, int, int]:
    m = re.fullmatch(r"(\d+)\.(\d+)\.(\d+)", v.strip())
    if not m:
        raise ValueError(f"not a semver patch triple: {v!r}")
    return int(m.group(1)), int(m.group(2)), int(m.group(3))


def bump_patch(v: str) -> str:
    major, minor, patch = parse_semver(v)
    return f"{major}.{minor}.{patch + 1}"


def plugins_needing_bump(range_spec: str) -> list[Plugin]:
    plugins = load_plugins()
    touched: set[str] = set()
    for f in changed_files(range_spec):
        if not is_release_relevant(f):
            continue
        pl = plugin_for_path(f, plugins)
        if pl:
            touched.add(pl.name)
    base_rev = range_spec.split("..", 1)[0]
    need: list[Plugin] = []
    for pl in plugins:
        if pl.name not in touched:
            continue
        old = version_at_rev(pl, base_rev)
        if old is None:
            # Added in this range: the plugin had no version at the base rev,
            # so its initial version IS the release — no further bump required.
            continue
        if not pl.root.exists():
            # Toolkit files removed in this range (entry pending removal from
            # marketplace.json — `sync` warns about that separately).
            # Nothing to version-bump for a plugin being deleted.
            continue
        cur = pl.version
        try:
            if parse_semver(cur) <= parse_semver(old):
                need.append(pl)
        except ValueError:
            need.append(pl)
    return need


def write_marketplace_version(plugin_name: str, new_version: str) -> None:
    data = json.loads(MARKETPLACE.read_text(encoding="utf-8"))
    for entry in data["plugins"]:
        if entry["name"] == plugin_name:
            entry["version"] = new_version
            break
    else:
        raise KeyError(plugin_name)
    MARKETPLACE.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def write_plugin_json(plugin: Plugin, new_version: str) -> None:
    path = plugin.plugin_json
    if not path.is_file():
        raise FileNotFoundError(path)
    data = json.loads(path.read_text(encoding="utf-8"))
    data["version"] = new_version
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def cmd_sync(_: argparse.Namespace) -> int:
    plugins = load_plugins()
    bad = 0
    for pl in plugins:
        if not pl.plugin_json.is_file():
            print(f"WARN: missing {pl.plugin_json}", file=sys.stderr)
            continue
        pj = json.loads(pl.plugin_json.read_text(encoding="utf-8"))
        if str(pj.get("version")) != pl.version:
            print(
                f"DRIFT: {pl.name} marketplace={pl.version} "
                f"plugin.json={pj.get('version')}",
                file=sys.stderr,
            )
            bad += 1
    return 1 if bad else 0


def cmd_check(ns: argparse.Namespace) -> int:
    need = plugins_needing_bump(ns.range)
    if not need:
        return 0
    print(
        "Marketplace version bump required for plugin(s) with release-relevant "
        f"changes in {ns.range}:",
        file=sys.stderr,
    )
    for pl in need:
        base = ns.range.split("..", 1)[0]
        old = version_at_rev(pl, base) or "?"
        print(
            f"  - {pl.name}: still {pl.version} (was {old} at {base}); "
            f"run: python3 scripts/ci/marketplace_versioning.py write --range {ns.range}",
            file=sys.stderr,
        )
    return 1


def cmd_write(ns: argparse.Namespace) -> int:
    need = plugins_needing_bump(ns.range)
    if not need:
        print("No marketplace version bumps needed.")
        return 0
    for pl in need:
        new_v = bump_patch(pl.version)
        write_marketplace_version(pl.name, new_v)
        write_plugin_json(pl, new_v)
        print(f"Bumped {pl.name}: {pl.version} -> {new_v}")
    return 0


def _add_range(p: argparse.ArgumentParser) -> None:
    p.add_argument(
        "--range",
        default="origin/main..HEAD",
        help="git rev range (default: origin/main..HEAD)",
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="cmd", required=True)
    p_check = sub.add_parser("check", help="exit 1 if bump missing")
    _add_range(p_check)
    p_check.set_defaults(func=cmd_check)
    p_write = sub.add_parser("write", help="apply patch bumps for pending plugins")
    _add_range(p_write)
    p_write.set_defaults(func=cmd_write)
    p_sync = sub.add_parser("sync", help="marketplace.json vs plugin.json")
    p_sync.set_defaults(func=cmd_sync)
    ns = parser.parse_args()
    return ns.func(ns)


if __name__ == "__main__":
    raise SystemExit(main())
