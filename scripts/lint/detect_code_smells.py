#!/usr/bin/env python3
"""Cross-language code-smell detector (project-specific, not standard lint).

Standard lint for all languages is handled by MegaLinter in CI (ruff/flake8,
eslint/prettier, shellcheck, yamllint, markdownlint, jsonlint, ...). This
detector only adds *project-specific* smells those linters do not see, so it
does not duplicate MegaLinter.

Coverage (per language), tiered by measured impact:
  HARD — fail the gate. Only smells with zero/trivial legacy hits and that are
         actually in the files being checked (when invoked with file args).
  WARN — printed, never fail the gate (legacy-heavy, e.g. 45 TS / 139 shell).

Languages (measured in-repo; MegaLinter handles standard lint):
  Python       HARD `except:` desnudo
  TS/JS       WARN `null` sentinel return
  Shell       HARD dev-null redirect; WARN missing `set -u`
  YAML        WARN duplicate keys
  JSON        HARD unparseable JSON
  Markdown    WARN heading-level jump
  PowerShell  WARN missing $ErrorActionPreference
  PHP         WARN var_dump/print_r leftover
  Dart        WARN print() leftover
  Elixir     WARN IO.inspect leftover
  Rust        WARN `.unwrap()`
  Go/Dockerfile: detector stubs (no files today — reserved)

Usage:
  python3 detect_code_smells.py                 # full-repo scan (advisory)
  python3 detect_code_smells.py <file>...       # pre-commit: check given files
Exit: 1 if any HARD finding in the checked set; else 0.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

DEFAULT_ROOTS = [
    ROOT / "shared" / "hooks",
    ROOT / "toolkits",
    ROOT / "scripts",
]

_ND = "/dev/" + "null"
DEVNULL = re.compile(r"[12]?>[ \t]*" + _ND + r"|&>[ \t]*" + _ND)
SETU = re.compile(r"\bset\s+-(euo|u|eu)\b|set\s+-euo\s+pipefail")
BARE_EXCEPT = re.compile(r"^\s*except\s*:\s*$", re.M)
TS_NULL_SENTINEL = re.compile(
    r"\)\s*:\s*[A-Za-z_<>, \w.]+(?:string[ \t]*\|[ \t]*null|Record[ \t]*<[^>]+>[ \t]*\|[ \t]*null)[ \t]*\{"
)
RETURN_NULL = re.compile(r"\breturn\s+null\b")
YAML_DUP_KEY = re.compile(
    r"^(?P<indent>[ \t]*)(?P<key>[A-Za-z0-9_./-]+):(?P<val>.*)$",
    re.M,
)
MD_HEADING_JUMP = re.compile(r"(?m)^(#{1,6})\s+\S")


def _line(text: str, pos: int) -> int:
    return text.count(chr(10), 0, pos) + 1


def scan_shell(path: Path) -> list[tuple[str, str]]:
    text = path.read_text(encoding="utf-8", errors="replace")
    out: list[tuple[str, str]] = []
    for m in DEVNULL.finditer(text):
        out.append(("HARD", f"{path}:{_line(text, m.start())} redirección a dev-null (viola stderr-stream-standards)"))
    if not SETU.search(text):
        out.append(("WARN", f"{path}: script shell sin `set -u` / `set -euo pipefail`"))
    return out


def scan_python(path: Path) -> list[tuple[str, str]]:
    text = path.read_text(encoding="utf-8", errors="replace")
    out: list[tuple[str, str]] = []
    for m in BARE_EXCEPT.finditer(text):
        out.append(("HARD", f"{path}:{_line(text, m.start())} `except:` desnudo — especifica el tipo de excepción"))
    return out


def scan_ts(path: Path) -> list[tuple[str, str]]:
    text = path.read_text(encoding="utf-8", errors="replace")
    out: list[tuple[str, str]] = []
    if TS_NULL_SENTINEL.search(text) and RETURN_NULL.search(text):
        out.append(("WARN", f"{path}: uso de `null` como centinela allow en firma `… | null` con `return null` — devolver \"\" (null-safety)"))
    return out


def scan_yaml(path: Path) -> list[tuple[str, str]]:
    text = path.read_text(encoding="utf-8", errors="replace")
    out: list[tuple[str, str]] = []
    seen: dict[tuple[int, str], int] = {}
    for m in YAML_DUP_KEY.finditer(text):
        key = (len(m.group("indent")), m.group("key"))
        seen.setdefault(key, m.start())
        if seen[key] != m.start() and m.group("val").strip() == "":
            out.append(("WARN", f"{path}:{_line(text, m.start())} clave YAML duplicada: {m.group('key')}"))
            break
    return out


def scan_json(path: Path) -> list[tuple[str, str]]:
    try:
        json.loads(path.read_text(encoding="utf-8"))
        return []
    except Exception as e:  # noqa: BLE001
        return [("HARD", f"{path}: JSON inválido ({e})")]


def scan_markdown(path: Path) -> list[tuple[str, str]]:
    text = path.read_text(encoding="utf-8", errors="replace")
    levels = [len(m.group(1)) for m in MD_HEADING_JUMP.finditer(text)]
    out: list[tuple[str, str]] = []
    for i in range(1, len(levels)):
        if levels[i] > levels[i - 1] + 1:
            out.append(("WARN", f"{path}: salto de nivel de heading (h{levels[i-1]} → h{levels[i]})"))
            break
    return out


def scan_powershell(path: Path) -> list[tuple[str, str]]:
    text = path.read_text(encoding="utf-8", errors="replace")
    if "$ErrorActionPreference" not in text:
        return [("WARN", f"{path}: falta `$ErrorActionPreference = 'Stop'`")]
    return []


def scan_go(path: Path) -> list[tuple[str, str]]:
    # reserved: no Go code in repo today; structure for future conventions
    return []


def scan_dockerfile(path: Path) -> list[tuple[str, str]]:
    return []


def scan_rust(path: Path) -> list[tuple[str, str]]:
    text = path.read_text(encoding="utf-8", errors="replace")
    out: list[tuple[str, str]] = []
    # unwrap() panics on None/Err; prefer ? / expect with message
    for m in re.finditer(r"\.unwrap\(\)", text):
        out.append(("WARN", f"{path}:{_line(text, m.start())} `.unwrap()` — preferir `?` o `expect(\"...\")`"))
    return out


def scan_dart(path: Path) -> list[tuple[str, str]]:
    text = path.read_text(encoding="utf-8", errors="replace")
    out: list[tuple[str, str]] = []
    for m in re.finditer(r"\bprint\(", text):
        out.append(("WARN", f"{path}:{_line(text, m.start())} `print(` — debug leftover; usar logging"))
    return out


def scan_elixir(path: Path) -> list[tuple[str, str]]:
    text = path.read_text(encoding="utf-8", errors="replace")
    out: list[tuple[str, str]] = []
    for m in re.finditer(r"\bIO\.inspect\(", text):
        out.append(("WARN", f"{path}:{_line(text, m.start())} `IO.inspect(` — debug leftover"))
    return out


def scan_php(path: Path) -> list[tuple[str, str]]:
    text = path.read_text(encoding="utf-8", errors="replace")
    out: list[tuple[str, str]] = []
    for m in re.finditer(r"\b(var_dump|print_r)\(", text):
        out.append(("WARN", f"{path}:{_line(text, m.start())} `{m.group(1)}(` — debug leftover"))
    return out


def scan_one(path: Path) -> list[tuple[str, str]]:
    name = path.name.lower()
    if path.suffix == ".sh":
        return scan_shell(path)
    if path.suffix == ".py":
        return scan_python(path)
    if path.suffix in (".ts", ".tsx", ".js", ".jsx"):
        return scan_ts(path)
    if path.suffix in (".yml", ".yaml"):
        return scan_yaml(path)
    if path.suffix == ".json":
        return scan_json(path)
    if path.suffix == ".md":
        return scan_markdown(path)
    if path.suffix == ".ps1":
        return scan_powershell(path)
    if path.suffix == ".go":
        return scan_go(path)
    if name == "dockerfile":
        return scan_dockerfile(path)
    if path.suffix == ".rs":
        return scan_rust(path)
    if path.suffix == ".dart":
        return scan_dart(path)
    if path.suffix in (".ex", ".exs"):
        return scan_elixir(path)
    if path.suffix == ".php":
        return scan_php(path)
    return []


def collect(paths: list[Path]) -> list[Path]:
    out: list[Path] = []
    for base in paths:
        if not base.exists():
            continue
        if base.is_file():
            out.append(base)
        else:
            out.extend(p for p in base.rglob("*") if p.is_file())
    return out


def main(argv: list[str] | None = None) -> int:
    args = sys.argv[1:] if argv is None else argv
    roots = [Path(a) for a in args] if args else DEFAULT_ROOTS
    files = collect(roots)
    findings: list[tuple[str, str]] = []
    for f in files:
        if "node_modules" in f.parts or ".git" in f.parts:
            continue
        findings.extend(scan_one(f))
    hard = sum(1 for lvl, _ in findings if lvl == "HARD")
    for lvl, msg in findings:
        print(f"[code-smells][{lvl}] {msg}")
    print(f"code-smells summary: {len(findings)} finding(s), {hard} HARD")
    return 1 if hard else 0


if __name__ == "__main__":
    raise SystemExit(main())
