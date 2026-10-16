#!/usr/bin/env python3
"""Fail when agent-facing commands/scripts are deprecated rename shims.

Policy: renames are clean-cut (update references); do not add thin alias commands
or exec wrappers. Grandfathered paths live in baselines/stale_deprecated_shims.txt.
"""
from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
BASELINE = REPO_ROOT / "scripts/lint/baselines/stale_deprecated_shims.txt"

WATCH_SUFFIXES = {".md", ".sh"}

COMMAND_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("command title MOVED (shim)", re.compile(r"#\s+/[^\n]+\s+MOVED\s*\(shim\)", re.IGNORECASE)),
    ("thin shim callout", re.compile(r"\bthin shim\b", re.IGNORECASE)),
    ("deprecated alias in frontmatter", re.compile(r"^description:\s*[^\n]*deprecated\s+alias", re.IGNORECASE | re.MULTILINE)),
    ("command title (deprecated)", re.compile(r"^#\s+/[^\n]+\(deprecated\)", re.IGNORECASE | re.MULTILINE)),
]

SCRIPT_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("deprecated wrapper comment", re.compile(r"deprecated\s+wrapper", re.IGNORECASE)),
    ("deprecated alias comment", re.compile(r"^#\s*deprecated\s+alias\b", re.IGNORECASE | re.MULTILINE)),
]


def rel(path: Path) -> str:
    try:
        return path.relative_to(REPO_ROOT).as_posix()
    except ValueError:
        return path.as_posix()


def is_watched(path: Path) -> bool:
    if path.suffix not in WATCH_SUFFIXES:
        return False
    parts = path.parts
    if "CHANGELOG" in path.name:
        return False
    if ".cursor" in parts and "commands" in parts:
        return True
    if "shared" in parts and "bootstrap" in parts and ("commands" in parts or "scripts" in parts):
        return True
    if "toolkits" in parts and ("commands" in parts or "scripts" in parts):
        return True
    return False


def load_baseline() -> set[str]:
    if not BASELINE.is_file():
        return set()
    allowed: set[str] = set()
    for line in BASELINE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        allowed.add(line)
    return allowed


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def violations_in_file(path: Path) -> list[str]:
    text = read_text(path)
    hits: list[str] = []
    patterns = COMMAND_PATTERNS if path.suffix == ".md" else SCRIPT_PATTERNS
    for label, pattern in patterns:
        if pattern.search(text):
            hits.append(label)
    if path.suffix == ".sh" and re.search(r"\bdeprecated\b", text, re.IGNORECASE):
        lines = text.splitlines()
        header = "\n".join(lines[:12])
        body = "\n".join(lines[12:])
        if re.search(r"\bexec\b", body) and re.search(r"\bdeprecated\b", header, re.IGNORECASE):
            if "deprecated wrapper" not in hits and "deprecated alias comment" not in hits:
                hits.append("exec wrapper with deprecated header")
    return hits


def git_changed_files(range_spec: str) -> list[Path]:
    proc = subprocess.run(
        ["git", "diff", "--name-only", "--diff-filter=ACMR", range_spec],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        print(f"check-no-stale-deprecated-shims: git diff failed: {proc.stderr.strip()}", file=sys.stderr)
        raise SystemExit(2)
    paths: list[Path] = []
    for line in proc.stdout.splitlines():
        line = line.strip()
        if not line:
            continue
        paths.append(REPO_ROOT / line)
    return paths


def discover_watched_files() -> list[Path]:
    roots = [
        REPO_ROOT / "shared/bootstrap/commands",
        REPO_ROOT / "shared/bootstrap/scripts",
        REPO_ROOT / ".cursor/commands",
    ]
    for toolkit in (REPO_ROOT / "toolkits").glob("*"):
        if toolkit.is_dir():
            roots.append(toolkit / "commands")
            scripts = toolkit / "scripts"
            if scripts.is_dir():
                roots.append(scripts)
    files: list[Path] = []
    for root in roots:
        if not root.is_dir():
            continue
        for path in root.rglob("*"):
            if path.is_file() and is_watched(path):
                files.append(path)
    return sorted(files)


def check_repo() -> list[str]:
    baseline = load_baseline()
    failures: list[str] = []
    for path in discover_watched_files():
        hits = violations_in_file(path)
        if not hits:
            continue
        key = rel(path)
        if key in baseline:
            continue
        failures.append(f"{key}: {', '.join(hits)} (not in baseline — remove shim or add only via explicit debt PR)")
    return failures


def check_paths(paths: list[Path], *, strict_touched: bool) -> list[str]:
    baseline = load_baseline()
    failures: list[str] = []
    for path in paths:
        if not path.is_file() or not is_watched(path):
            continue
        hits = violations_in_file(path)
        if not hits:
            continue
        key = rel(path)
        if strict_touched:
            failures.append(
                f"{key}: {', '.join(hits)} — do not add or extend deprecated shims; update references and delete aliases",
            )
        elif key not in baseline:
            failures.append(f"{key}: {', '.join(hits)} (not in baseline)")
    return failures


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", action="store_true", help="Scan all watched paths; allow baseline only")
    parser.add_argument("--range", metavar="REV..REV", help="Fail on any changed watched file that matches shim patterns")
    parser.add_argument("files", nargs="*", help="Explicit paths (pre-commit)")
    args = parser.parse_args()

    if args.repo:
        failures = check_repo()
    elif args.range:
        failures = check_paths(git_changed_files(args.range), strict_touched=True)
    elif args.files:
        failures = check_paths([Path(p) for p in args.files], strict_touched=True)
    else:
        print("check-no-stale-deprecated-shims: pass --repo, --range, or file paths", file=sys.stderr)
        return 2

    if failures:
        print("check-no-stale-deprecated-shims: FAILED", file=sys.stderr)
        for msg in failures:
            print(f"  {msg}", file=sys.stderr)
        print(
            "Policy: shared/references/engineering-standards/no-deprecated-agent-shims.md",
            file=sys.stderr,
        )
        return 1
    print("check-no-stale-deprecated-shims: OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
