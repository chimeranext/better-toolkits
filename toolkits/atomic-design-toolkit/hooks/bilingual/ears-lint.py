#!/usr/bin/env python3
"""Deterministic linter for EARS requirement statements (EN shall / ES debe).

Order in the requirements pipeline: run this **before** ASD-STE100 / ESP-TS
on generated requirement prose (SRS FR lines, bilingual issue Acceptance
Criteria that express system behavior).

Usage:
  ears-lint.py --requirement "When X, the system shall Y."
  ears-lint.py --file requirements.txt          # one requirement per line
  ears-lint.py --markdown FILE.md               # extract FR-/AC candidates
  ears-lint.py --json --requirement "..."
  ears-lint.py --selftest

Exit 0 all valid; exit 1 any invalid; exit 2 usage error.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

WEAK_EN = (
    "as appropriate", "if possible", "etc", "normally", "quickly",
    "user-friendly", "easily", "sufficiently",
)
WEAK_ES = (
    "si es posible", "etc", "normalmente", "rápidamente", "amigable",
    "fácilmente", "suficientemente", "según corresponda",
)

AC_HEADING = re.compile(r"(?im)^[ \t]*###[ \t]*Acceptance[ \t]+Criteria\b")
NEXT_HEADING = re.compile(r"(?m)^[ \t]*#{1,3}[ \t]+")
BULLET = re.compile(r"^[ \t]*(?:[-*+]|\d+[.)])[ \t]+(?:\[[ xX]\][ \t]+)?(.+)$")
FR_LINE = re.compile(
    r"(?im)^[ \t]*(?:\*\*)?"
    r"(?:FR|NFR|REQ|EI|QS|CLI|SRV|TUR|SUC|DIS|RES|EJE|EXC|CMP|CAN|NOT|INT|REP)"
    r"[-_]?\d+(?:\*\*)?[ \t]*[:.—\-]*[ \t]*(.+)$"
)
# Markdown table row: | ID | requirement text | optional acceptance |
TABLE_REQ = re.compile(
    r"(?im)^[ \t]*\|[ \t]*"
    r"((?:FR|NFR|REQ|EI|QS|CLI|SRV|TUR|SUC|DIS|RES|EJE|EXC|CMP|CAN|NOT|INT|REP)"
    r"[-_]?\d+)[ \t]*\|[ \t]*(.+?)[ \t]*\|"
)
EARS_OPENER = re.compile(
    r"(?i)^(when|while|where|if|the|cuando|mientras|donde|si|el|la|los|las|antes|sin|cada|un|una)\b"
)
OBLIGATION = re.compile(r"(?i)\b(shall|debe|deberá)\b")


def classify_pattern(text: str) -> str:
    lowered = text.strip().lower()
    if lowered.startswith(("if ", "si ")):
        return "unwanted-behavior"
    if (lowered.startswith("while ") and " when " in lowered) or (
        lowered.startswith("mientras ") and " cuando " in lowered
    ):
        w = lowered.find("while ") if "while " in lowered else lowered.find("mientras ")
        k = lowered.find(" when ") if " when " in lowered else lowered.find(" cuando ")
        if 0 <= w < k:
            return "complex"
    if lowered.startswith(("while ", "mientras ")):
        return "state-driven"
    if lowered.startswith(("when ", "cuando ", "antes de ", "antes ", "sin ")):
        if re.search(r"\b(shall|debe|deberá)\s+continue\b", lowered) or re.search(
            r"\b(shall|debe|deberá)\s+seguir\b", lowered
        ):
            return "continue"
        return "event-driven"
    if lowered.startswith(("where ", "donde ")):
        return "optional-feature"
    if lowered.startswith(
        ("the ", "el ", "la ", "los ", "las ", "cada ", "un ", "una ")
    ):
        return "ubiquitous"
    return "unknown"


def validate_requirement(text: str) -> dict:
    issues: list[str] = []
    stripped = text.strip().rstrip(".")
    # Normalize trailing period for matching; keep original in output.
    lowered = stripped.lower()
    pattern = classify_pattern(stripped)

    shall_count = len(re.findall(r"\bshall\b", lowered))
    debe_count = len(re.findall(r"\b(?:debe|deberá)\b", lowered))
    oblig = shall_count + debe_count
    if oblig == 0:
        issues.append("Missing obligation keyword ('shall' or 'debe'/'deberá').")
    elif oblig > 1:
        issues.append("Use one behavior per statement: multiple obligation keywords.")

    if pattern == "unwanted-behavior":
        if not (
            re.search(
                r"^if\s+.+,\s*then\s+the\s+.+\s+shall\s+.+", lowered
            )
            or re.search(
                r"^si\s+.+,\s*entonces\s+(?:el|la|los|las)\s+.+\s+(?:debe|deberá)\s+.+",
                lowered,
            )
        ):
            issues.append(
                "Unwanted-behavior form: If ..., then the <system> shall ... "
                "/ Si ..., entonces el|la <sistema> debe ..."
            )
    elif pattern == "complex":
        if not (
            re.search(
                r"^while\s+.+,\s*when\s+.+,\s*the\s+.+\s+shall\s+.+", lowered
            )
            or re.search(
                r"^mientras\s+.+,\s*cuando\s+.+,\s*(?:el|la|los|las)\s+.+\s+(?:debe|deberá)\s+.+",
                lowered,
            )
        ):
            issues.append(
                "Complex form: While ..., when ..., the <system> shall ... "
                "/ Mientras ..., cuando ..., el|la <sistema> debe ..."
            )
    elif pattern == "state-driven":
        if not (
            re.search(r"^while\s+.+,\s*the\s+.+\s+shall\s+.+", lowered)
            or re.search(
                r"^mientras\s+.+,\s*(?:el|la|los|las)\s+.+\s+(?:debe|deberá)\s+.+",
                lowered,
            )
        ):
            issues.append(
                "State-driven form: While ..., the <system> shall ... "
                "/ Mientras ..., el|la <sistema> debe ..."
            )
    elif pattern == "event-driven":
        if not (
            re.search(r"^when\s+.+,\s*the\s+.+\s+shall\s+.+", lowered)
            or re.search(
                r"^cuando\s+.+,\s*(?:el|la|los|las)\s+.+\s+(?:debe|deberá)\s+.+",
                lowered,
            )
            or re.search(
                r"^antes\s+de\s+.+,\s*(?:el|la|los|las)\s+.+\s+(?:debe|deberá)\s+.+",
                lowered,
            )
            or re.search(
                r"^sin\s+.+,\s*(?:el|la|los|las)\s+.+\s+(?:debe|deberá)\s+.+",
                lowered,
            )
        ):
            issues.append(
                "Event-driven form: When/Antes de/Sin ..., the|el|la <system> shall|debe ..."
            )
    elif pattern == "continue":
        if not (
            re.search(
                r"^when\s+.+,\s*the\s+.+\s+shall\s+continue\s+to\s+.+", lowered
            )
            or re.search(
                r"^cuando\s+.+,\s*(?:el|la|los|las)\s+.+\s+(?:debe|deberá)\s+seguir\s+.+",
                lowered,
            )
        ):
            issues.append(
                "Continue form: When ..., the <system> shall continue to ... "
                "/ Cuando ..., el|la <sistema> debe seguir ..."
            )
    elif pattern == "optional-feature":
        if not (
            re.search(r"^where\s+.+,\s*the\s+.+\s+shall\s+.+", lowered)
            or re.search(
                r"^donde\s+.+,\s*(?:el|la|los|las)\s+.+\s+(?:debe|deberá)\s+.+",
                lowered,
            )
        ):
            issues.append(
                "Optional-feature form: Where ..., the <system> shall ... "
                "/ Donde ..., el|la <sistema> debe ..."
            )
    elif pattern == "ubiquitous":
        if not (
            re.search(r"^the\s+.+\s+shall\s+.+", lowered)
            or re.search(
                r"^(?:el|la|los|las)\s+.+\s+(?:debe|deberá)\s+.+", lowered
            )
            or re.search(
                r"^(?:cada|un|una)\s+.+\s+(?:debe|deberá)\s+.+", lowered
            )
        ):
            issues.append(
                "Ubiquitous form: The|El|La|Cada|Un <system> shall|debe ..."
            )
    else:
        issues.append("Cannot classify EARS pattern from leading clause.")

    if re.search(r"\bif\b", lowered) and pattern != "unwanted-behavior":
        if " if " in f" {lowered} " and not lowered.startswith("if "):
            issues.append("Use 'If ..., then ...' only for unwanted-behavior.")
    # Spanish mid-sentence "si" ("si se usa") is common; only flag clause-leading Si without Entonces.
    if pattern == "unwanted-behavior" and lowered.startswith("si "):
        if " entonces " not in lowered:
            issues.append(
                "Unwanted-behavior form needs 'Si ..., entonces el|la <sistema> debe ...'."
            )

    if " while " in lowered and " when " in lowered:
        if lowered.find(" when ") < lowered.find(" while "):
            issues.append("Clause order: place 'While ...' before 'when ...'.")
    if " mientras " in lowered and " cuando " in lowered:
        if lowered.find(" cuando ") < lowered.find(" mientras "):
            issues.append(
                "Orden de cláusulas: 'Mientras ...' antes de 'cuando ...'."
            )

    for term in WEAK_EN:
        if term in lowered:
            issues.append(f"Avoid weak wording: '{term}'.")
    for term in WEAK_ES:
        if term in lowered:
            issues.append(f"Evita wording débil: '{term}'.")

    # Flag English "and" in the response clause (after shall). Spanish "y" is too
    # common in single behaviors ("debe identificar al cliente y mostrar la ficha")
    # to hard-fail; authors still split independent obligations manually.
    after = re.search(r"\bshall\b(.+)$", lowered)
    if after and re.search(r"\band\b", after.group(1)):
        issues.append(
            "Potential multiple behaviors in one requirement; split if independent."
        )

    return {
        "requirement": text.strip(),
        "pattern": pattern,
        "valid": len(issues) == 0,
        "issues": issues,
    }


def looks_like_ears_candidate(text: str) -> bool:
    t = text.strip()
    if len(t) < 12:
        return False
    if OBLIGATION.search(t):
        return True
    return bool(EARS_OPENER.match(t))


def extract_from_markdown(md: str) -> list[str]:
    """Pull FR-/NFR- lines, table requirement cells, and behavioral AC bullets."""
    found: list[str] = []
    for line in md.splitlines():
        m = FR_LINE.match(line)
        if m:
            cand = m.group(1).strip()
            # Drop trailing table cells if someone used FR-001: text | more |
            cand = cand.split("|")[0].strip()
            if looks_like_ears_candidate(cand):
                found.append(cand)
            continue
        t = TABLE_REQ.match(line)
        if t:
            cand = t.group(2).strip()
            # First cell after ID is the requirement; ignore acceptance column
            if looks_like_ears_candidate(cand):
                found.append(cand)

    ac = AC_HEADING.search(md)
    if ac:
        rest = md[ac.end():]
        stop = NEXT_HEADING.search(rest)
        block = rest[: stop.start()] if stop else rest
        for line in block.splitlines():
            b = BULLET.match(line)
            if not b:
                continue
            cand = b.group(1).strip()
            if looks_like_ears_candidate(cand):
                found.append(cand)
    return found


def selftest() -> None:
    ok = validate_requirement(
        "When mute is selected, the laptop shall suppress all audio output."
    )
    assert ok["valid"] and ok["pattern"] == "event-driven", ok
    ok_es = validate_requirement(
        "Cuando se selecciona silencio, el portátil debe silenciar toda la salida de audio."
    )
    assert ok_es["valid"] and ok_es["pattern"] == "event-driven", ok_es
    bad = validate_requirement("The system should be fast.")
    assert not bad["valid"], bad
    cont = validate_requirement(
        "When a form is submitted, the system shall continue to validate the email field."
    )
    assert cont["valid"] and cont["pattern"] == "continue", cont
    md = (
        "### Acceptance Criteria\n"
        "- [ ] When mute is selected, the laptop shall suppress all audio output.\n"
        "- [ ] unit tests pass\n"
        "### Context Files\n"
        "- a.ts\n"
    )
    extracted = extract_from_markdown(md)
    assert len(extracted) == 1, extracted
    print("selftest OK")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--requirement", help="Single requirement text")
    parser.add_argument("--file", help="Text file, one requirement per line")
    parser.add_argument(
        "--markdown",
        help="Markdown file: extract FR-/NFR- lines and behavioral AC bullets",
    )
    parser.add_argument("--json", action="store_true", help="JSON output")
    parser.add_argument("--selftest", action="store_true")
    args = parser.parse_args(argv)

    if args.selftest:
        selftest()
        return 0

    modes = [bool(args.requirement), bool(args.file), bool(args.markdown)]
    if sum(modes) != 1:
        print("Provide exactly one of --requirement, --file, --markdown.", file=sys.stderr)
        return 2

    requirements: list[str] = []
    if args.requirement:
        requirements = [args.requirement.strip()]
    elif args.file:
        path = Path(args.file)
        if not path.is_file():
            print(f"File not found: {path}", file=sys.stderr)
            return 2
        requirements = [
            ln.strip() for ln in path.read_text(encoding="utf-8").splitlines() if ln.strip()
        ]
    else:
        path = Path(args.markdown)
        if not path.is_file():
            print(f"File not found: {path}", file=sys.stderr)
            return 2
        requirements = extract_from_markdown(path.read_text(encoding="utf-8"))
        if not requirements:
            print(
                "ears-lint: no EARS candidates found in markdown "
                "(FR-/NFR- lines or AC bullets with shall/debe / EARS openers).",
                file=sys.stderr,
            )
            return 1

    results = [validate_requirement(item) for item in requirements]
    if args.json:
        print(json.dumps(results, ensure_ascii=False, indent=2))
    else:
        for idx, result in enumerate(results, start=1):
            status = "PASS" if result["valid"] else "FAIL"
            print(f"[{status}] #{idx} pattern={result['pattern']}")
            print(f"  {result['requirement']}")
            for issue in result["issues"]:
                print(f"  - {issue}")

    return 0 if all(r["valid"] for r in results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
