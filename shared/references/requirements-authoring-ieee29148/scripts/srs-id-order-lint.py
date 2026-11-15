#!/usr/bin/env python3
"""Deterministic linter for SRS requirement ID order (IEEE 29148 pack).

Checks each Markdown table that carries requirement IDs:
  - IDs within a table are unique
  - Within each prefix the SPMP named, numeric order is strictly increasing
    in table row order
  - Within each prefix in a table, numbers are contiguous from 1..N (no gaps;
    SPMP-derived series must not skip)

Does **not** require the same ID set across §3 / §4 / §5 (use --cross-section
for that). Does **not** validate EARS prose (use ears-lint.py).

Usage:
  srs-id-order-lint.py --markdown FILE.md
  srs-id-order-lint.py --json --markdown FILE.md
  srs-id-order-lint.py --cross-section --markdown FILE.md
  srs-id-order-lint.py --selftest

Exit 0 all valid; exit 1 any invalid; exit 2 usage error.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

ID_CELL = re.compile(
    r"(?i)^[ \t]*\|[ \t]*"
    r"((?:FR|NFR|REQ|EI|QS|CLI|SRV|TUR|SUC|DIS|RES|EJE|EXC|CMP|CAN|NOT|INT|REP)"
    r"[-_]?\d+)"
    r"[ \t]*\|"
)
TABLE_ROW = re.compile(r"^[ \t]*\|")
SEP_ROW = re.compile(r"^[ \t]*\|[ \t]*:?-{3,}")
HEADING = re.compile(r"^[ \t]*#{1,6}[ \t]+(.+?)\s*$")


@dataclass
class IdHit:
    prefix: str
    number: int
    raw: str
    line: int


@dataclass
class TableResult:
    heading: str
    start_line: int
    ids: list[IdHit] = field(default_factory=list)
    issues: list[str] = field(default_factory=list)

    @property
    def valid(self) -> bool:
        return not self.issues


def _parse_id(raw: str) -> IdHit | None:
    m = re.match(
        r"(?i)^(FR|NFR|REQ|EI|QS|CLI|SRV|TUR|SUC|DIS|RES|EJE|EXC|CMP|CAN|NOT|INT|REP)"
        r"[-_]?(\d+)$",
        raw.strip(),
    )
    if not m:
        return None
    return IdHit(prefix=m.group(1).upper(), number=int(m.group(2)), raw=raw.strip(), line=0)


def extract_tables(md: str) -> list[TableResult]:
    """Split markdown into tables that contain at least one requirement ID row."""
    tables: list[TableResult] = []
    current_heading = "(document start)"
    buf_lines: list[tuple[int, str]] = []
    start_line = 0

    def flush() -> None:
        nonlocal buf_lines
        if not buf_lines:
            return
        hits: list[IdHit] = []
        for ln, text in buf_lines:
            if SEP_ROW.match(text):
                continue
            m = ID_CELL.match(text)
            if not m:
                continue
            hit = _parse_id(m.group(1))
            if hit:
                hit.line = ln
                hits.append(hit)
        if hits:
            tables.append(
                TableResult(heading=current_heading, start_line=start_line, ids=hits)
            )
        buf_lines = []

    for idx, line in enumerate(md.splitlines(), start=1):
        hm = HEADING.match(line)
        if hm:
            flush()
            current_heading = hm.group(1).strip()
            continue
        if TABLE_ROW.match(line):
            if not buf_lines:
                start_line = idx
            buf_lines.append((idx, line))
            continue
        flush()
    flush()
    return tables


def validate_table(table: TableResult) -> TableResult:
    seen: dict[str, int] = {}
    last_num: dict[str, int] = {}
    by_prefix: dict[str, list[int]] = {}
    for hit in table.ids:
        key = f"{hit.prefix}-{hit.number}"
        if key in seen:
            table.issues.append(
                f"Duplicate ID {key} in table under '{table.heading}' "
                f"(lines {seen[key]} and {hit.line})."
            )
        else:
            seen[key] = hit.line
        prev = last_num.get(hit.prefix)
        if prev is not None and hit.number <= prev:
            table.issues.append(
                f"Out-of-order {hit.prefix}: {hit.prefix}-{hit.number} at line "
                f"{hit.line} follows {hit.prefix}-{prev} (must increase within prefix)."
            )
        last_num[hit.prefix] = hit.number
        by_prefix.setdefault(hit.prefix, []).append(hit.number)

    for prefix, nums in by_prefix.items():
        unique = sorted(set(nums))
        if unique[0] != 1:
            table.issues.append(
                f"Series {prefix} under '{table.heading}' must start at "
                f"{prefix}-001 (found {prefix}-{unique[0]:03d})."
            )
        expected = list(range(1, unique[-1] + 1))
        missing = [n for n in expected if n not in unique]
        if missing:
            gaps = ", ".join(f"{prefix}-{n:03d}" for n in missing)
            table.issues.append(
                f"Gap in {prefix} under '{table.heading}': missing {gaps} "
                f"(series must be contiguous 1..{unique[-1]})."
            )
    return table


def _is_section3_heading(heading: str) -> bool:
    h = heading.lower()
    if re.search(r"\b3\.\d+", h):
        return True
    return any(
        k in h
        for k in (
            "extern",
            "funcional",
            "functional",
            "calidad",
            "quality",
            "nfr",
            "interfaces",
        )
    )


def _is_trace_heading(heading: str) -> bool:
    h = heading.lower()
    return any(
        k in h
        for k in ("verific", "caracter", "29148", "checklist", "trazab", "trace")
    ) or bool(re.search(r"\b[45]\.\d+", h))


def cross_section_issues(tables: list[TableResult]) -> list[str]:
    """Optional: union of §3 requirement tables vs verification / characteristics."""
    issues: list[str] = []
    req_ids: set[str] = set()
    for t in tables:
        if _is_section3_heading(t.heading) and not _is_trace_heading(t.heading):
            req_ids |= {f"{h.prefix}-{h.number}" for h in t.ids}
    if not req_ids:
        issues.append(
            "cross-section: no §3 requirement tables found to build baseline ID set."
        )
        return issues
    for t in tables:
        if not _is_trace_heading(t.heading):
            continue
        keys = {f"{h.prefix}-{h.number}" for h in t.ids}
        missing = sorted(req_ids - keys, key=lambda s: (s.split("-")[0], int(s.split("-")[1])))
        extra = sorted(keys - req_ids, key=lambda s: (s.split("-")[0], int(s.split("-")[1])))
        if missing:
            issues.append(
                f"Table '{t.heading}' missing IDs present in §3 baseline: "
                + ", ".join(missing)
            )
        if extra:
            issues.append(
                f"Table '{t.heading}' has IDs not in §3 baseline: "
                + ", ".join(extra)
            )
    return issues


def lint_markdown(md: str, *, cross_section: bool = False) -> dict:
    tables = [validate_table(t) for t in extract_tables(md)]
    extra = cross_section_issues(tables) if cross_section else []
    return {
        "tables": [
            {
                "heading": t.heading,
                "start_line": t.start_line,
                "ids": [h.raw for h in t.ids],
                "valid": t.valid,
                "issues": t.issues,
            }
            for t in tables
        ],
        "cross_section_issues": extra,
        "valid": all(t.valid for t in tables) and not extra,
    }


def selftest() -> None:
    ok_md = (
        "## 3.2 Funcionales\n"
        "| ID | Requisito |\n"
        "| --- | --- |\n"
        "| REQ-001 | El sistema debe a. |\n"
        "| REQ-002 | El sistema debe b. |\n"
        "| REQ-003 | El sistema debe c. |\n"
        "\n"
        "## 4. Verificación\n"
        "| Requisito | Método |\n"
        "| --- | --- |\n"
        "| REQ-001 | Prueba |\n"
        "| REQ-002 | Prueba |\n"
        "| REQ-003 | Prueba |\n"
    )
    r = lint_markdown(ok_md)
    assert r["valid"], r

    bad_order = (
        "| ID | Requisito |\n"
        "| --- | --- |\n"
        "| REQ-002 | x |\n"
        "| REQ-001 | y |\n"
    )
    r2 = lint_markdown(bad_order)
    assert not r2["valid"], r2
    assert any("Out-of-order" in i for i in r2["tables"][0]["issues"]), r2

    bad_dup = (
        "| ID | Requisito |\n"
        "| --- | --- |\n"
        "| NFR-001 | a |\n"
        "| NFR-001 | b |\n"
    )
    r3 = lint_markdown(bad_dup)
    assert not r3["valid"], r3
    assert any("Duplicate" in i for i in r3["tables"][0]["issues"]), r3

    # Gaps forbidden
    gap = (
        "| ID | Requisito |\n"
        "| --- | --- |\n"
        "| REQ-001 | a |\n"
        "| REQ-003 | b |\n"
    )
    r4 = lint_markdown(gap)
    assert not r4["valid"], r4
    assert any("Gap" in i for i in r4["tables"][0]["issues"]), r4

    cross_md = (
        "## 3.1 Interfaces externas\n"
        "| ID | Requisito |\n| --- | --- |\n| NFR-001 | a |\n\n"
        "## 3.2 Funcionales\n"
        "| ID | Requisito |\n| --- | --- |\n| REQ-001 | b |\n\n"
        "## 4. Verificación\n"
        "| Requisito | Método |\n| --- | --- |\n| NFR-001 | P |\n| REQ-001 | P |\n"
    )
    r5 = lint_markdown(cross_md, cross_section=True)
    assert r5["valid"], r5

    print("selftest OK")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--markdown", help="SRS (or checklist) Markdown path")
    parser.add_argument(
        "--cross-section",
        action="store_true",
        help="Also compare later verification/characteristics tables to §3 ID set",
    )
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--selftest", action="store_true")
    args = parser.parse_args(argv)

    if args.selftest:
        selftest()
        return 0

    if not args.markdown:
        print("Provide --markdown FILE.md (or --selftest).", file=sys.stderr)
        return 2

    path = Path(args.markdown)
    if not path.is_file():
        print(f"File not found: {path}", file=sys.stderr)
        return 2

    result = lint_markdown(
        path.read_text(encoding="utf-8"), cross_section=args.cross_section
    )

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        if not result["tables"]:
            print(
                "srs-id-order-lint: no requirement-ID tables found.",
                file=sys.stderr,
            )
            return 1
        for idx, table in enumerate(result["tables"], start=1):
            status = "PASS" if table["valid"] else "FAIL"
            print(
                f"[{status}] table#{idx} under '{table['heading']}' "
                f"(line {table['start_line']}, {len(table['ids'])} IDs)"
            )
            for issue in table["issues"]:
                print(f"  - {issue}")
        for issue in result["cross_section_issues"]:
            print(f"[FAIL] cross-section: {issue}")
        if result["valid"]:
            print("ALL PASS")

    return 0 if result["valid"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
