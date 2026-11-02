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
    ROOT / "shared",
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


LANG_ASSERT_LENGTH = {
    # TS/JS
    ".ts": [
        re.compile(r"toHaveLength\(\s*(\d+)\s*\)"),
        re.compile(r"assert\.(?:equal|strictEqual)\(\s*\w+\.length\s*,\s*(\d+)"),
        re.compile(r"expect\(\s*\w+\.length\s*\)\.toBe\((\d+)\)"),
    ],
    ".tsx": None,
    ".js": None,
    ".jsx": None,
    ".mjs": None,
    # Python
    ".py": [re.compile(r"\bassert\s+len\(\s*\w+\s*\)\s*==\s*(\d+)")],
    # Shell
    ".sh": [re.compile(r"\$\{#[\w]+\[@\]\}\s+(?:-eq|-ne|-lt|-le|-gt|-ge)\s+(\d+)")],
    # PHP (PHPUnit)
    ".php": [re.compile(r"\bassertCount\(\s*(\d+)\s*,\s*\$?\w+\)")],
    # PowerShell (Pester)
    ".ps1": [re.compile(r"\$[\w]+\.Count\s+-(?:eq|ne|gt|ge|lt|le)\s+(\d+)")],
    # Dart
    ".dart": [
        re.compile(r"expect\(\s*\w+\.length\s*,\s*(\d+)\s*\)"),
        re.compile(r"expect\(\s*\w+\s*,\s*hasLength\(\s*(\d+)\s*\)"),
    ],
    # Elixir
    ".ex": [re.compile(r"\bassert\s+length\(\s*\w+\s*\)\s*==\s*(\d+)")],
    ".exs": None,
    # Rust
    ".rs": [re.compile(r"assert_eq!\(\s*\w+\.len\(\)\s*,\s*(\d+)\s*\)")],
    # Go
    ".go": [
        re.compile(r"len\(\s*\w+\s*\)\s*!=\s*(\d+)"),
        re.compile(r"(?:require|assert)\.Len\(\s*t\s*,\s*\w+\s*,\s*(\d+)\s*\)"),
    ],
}


def _lang_patterns(suffix: str):
    base = LANG_ASSERT_LENGTH.get(suffix)
    if base is not None:
        return base
    if suffix in (".tsx", ".js", ".jsx", ".mjs"):
        return LANG_ASSERT_LENGTH[".ts"]
    if suffix == ".exs":
        return LANG_ASSERT_LENGTH[".ex"]
    return []


def scan_test_assertions(path: Path) -> list[tuple[str, str]]:
    """TAS multi-lenguaje: flag conteos literales en aserción de longitud (snapshot de registro)."""
    pats = _lang_patterns(path.suffix)
    if not pats:
        return []
    text = path.read_text(encoding="utf-8", errors="replace")
    out: list[tuple[str, str]] = []
    for pat in pats:
        for m in pat.finditer(text):
            num = next((g for g in m.groups() if g is not None), "?")
            out.append((
                "WARN",
                f"{path}:{_line(text, m.start())} conteo literal ({num}) en aserción de longitud — "
                "TAS: derivar del source of truth; no snapshot",
            ))
    return out


def scan_one(path: Path) -> list[tuple[str, str]]:
    name = path.name.lower()
    out: list[tuple[str, str]] = []
    if path.suffix == ".sh":
        out.extend(scan_shell(path))
    elif path.suffix == ".py":
        out.extend(scan_python(path))
    elif path.suffix in (".ts", ".tsx", ".js", ".jsx"):
        out.extend(scan_ts(path))
    elif path.suffix in (".yml", ".yaml"):
        out.extend(scan_yaml(path))
    elif path.suffix == ".json":
        out.extend(scan_json(path))
    elif path.suffix == ".md":
        out.extend(scan_markdown(path))
    elif path.suffix == ".ps1":
        out.extend(scan_powershell(path))
    elif path.suffix == ".go":
        out.extend(scan_go(path))
    elif name == "dockerfile":
        out.extend(scan_dockerfile(path))
    elif path.suffix == ".rs":
        out.extend(scan_rust(path))
    elif path.suffix == ".dart":
        out.extend(scan_dart(path))
    elif path.suffix in (".ex", ".exs"):
        out.extend(scan_elixir(path))
    elif path.suffix == ".php":
        out.extend(scan_php(path))
    if ("test" in name or "spec" in name) and _lang_patterns(path.suffix):
        out.extend(scan_test_assertions(path))
    return out


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
