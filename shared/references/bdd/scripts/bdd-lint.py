#!/usr/bin/env python3
"""Deterministic linter for BDD Given / When / Then assertions (EN + ES).

Use on verification tables, dogfood reports, OpenSpec scenarios, and other
natural-language assertion blocks — after EARS on requirement lines, before or
beside STE/ESP-TS on full prose.

Usage:
  bdd-lint.py --scenario $'Given ...\\nWhen ...\\nThen ...'
  bdd-lint.py --markdown FILE.md
  bdd-lint.py --json --markdown FILE.md
  bdd-lint.py --selftest

Exit 0 all valid; exit 1 any invalid; exit 2 usage error.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

GIVEN = re.compile(r"(?im)^\s*(?:Given|Dado(?:\/a)?|Dados|Dadas)\b[:\s]*(.+)$")
WHEN = re.compile(r"(?im)^\s*(?:When|Cuando|Cuando se)\b[:\s]*(.+)$")
THEN = re.compile(r"(?im)^\s*(?:Then|Entonces)\b[:\s]*(.+)$")
AND = re.compile(r"(?im)^\s*(?:And|Y|Pero|But)\b[:\s]*(.+)$")

WEAK_THEN = (
    "should work",
    "works correctly",
    "as expected",
    "funciona bien",
    "funciona correctamente",
    "como se espera",
    "sin errores",
    "ok",
)

IMPL_LEAK = (
    "database",
    "postgres",
    "redis",
    "endpoint",
    "rest api",
    "graphql",
    "microservice",
    "class ",
    "function ",
    "base de datos",
    "microservicio",
)


def _clauses(block: str) -> dict[str, list[str]]:
    out: dict[str, list[str]] = {"given": [], "when": [], "then": [], "and": []}
    for raw in block.splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or line.startswith("|"):
            continue
        for kind, pat in (
            ("given", GIVEN),
            ("when", WHEN),
            ("then", THEN),
            ("and", AND),
        ):
            m = pat.match(line)
            if m:
                out[kind].append(m.group(1).strip())
                break
    return out


def looks_like_scenario(block: str) -> bool:
    c = _clauses(block)
    return bool(c["given"] or c["when"] or c["then"])


def validate_scenario(block: str) -> dict:
    issues: list[str] = []
    c = _clauses(block)
    if not c["given"]:
        issues.append("Missing Given / Dado precondition.")
    if not c["when"]:
        issues.append("Missing When / Cuando action.")
    if not c["then"]:
        issues.append("Missing Then / Entonces observable outcome.")

    for then in c["then"]:
        low = then.lower()
        if len(then) < 8:
            issues.append(f"Then too short to be falsifiable: '{then}'")
        for weak in WEAK_THEN:
            if weak in low:
                issues.append(f"Weak Then wording: '{weak}' — name observable evidence.")
        for leak in IMPL_LEAK:
            if leak in low:
                issues.append(
                    f"Then leaks implementation ('{leak}'); assert observable behavior."
                )

    for when in c["when"]:
        low = when.lower()
        if "should" in low or "debería" in low:
            issues.append("When describes intent with should/debería; use a concrete action.")

    return {
        "scenario": block.strip(),
        "clauses": {k: v for k, v in c.items() if v},
        "valid": len(issues) == 0,
        "issues": issues,
    }


SCENARIO_SPLIT = re.compile(
    r"(?im)^(?:#{1,3}\s*)?(?:Scenario|Escenario|Feature|Historia)\b.*$"
)


def extract_scenarios(md: str) -> list[str]:
    """Pull fenced ```bdd / ```gherkin blocks and Scenario:/Escenario: sections."""
    found: list[str] = []
    fence = re.compile(r"(?is)```(?:bdd|gherkin|cucumber)\s*\n(.*?)```")
    for m in fence.finditer(md):
        body = m.group(1).strip()
        if looks_like_scenario(body):
            found.append(body)

    # Loose Given/When/Then triples in verification.md style
    lines = md.splitlines()
    buf: list[str] = []
    scenarios: list[str] = []

    def flush() -> None:
        nonlocal buf
        text = "\n".join(buf).strip()
        if text and looks_like_scenario(text):
            scenarios.append(text)
        buf = []

    for line in lines:
        if SCENARIO_SPLIT.match(line.strip()):
            flush()
            continue
        if GIVEN.match(line) and buf and any(THEN.match(x) for x in buf):
            flush()
        if GIVEN.match(line) or WHEN.match(line) or THEN.match(line) or AND.match(line):
            buf.append(line)
        elif buf and not line.strip():
            flush()
        elif buf and line.strip().startswith("#"):
            flush()
    flush()
    found.extend(scenarios)
    # de-dupe preserving order
    seen: set[str] = set()
    out: list[str] = []
    for s in found:
        key = s.strip()
        if key in seen:
            continue
        seen.add(key)
        out.append(key)
    return out


def selftest() -> None:
    ok = validate_scenario(
        "Given a registered client with phone 8888-0000\n"
        "When the operator starts an interaction with that phone\n"
        "Then the agenda shows that client's record"
    )
    assert ok["valid"], ok
    ok_es = validate_scenario(
        "Dado un cliente registrado con teléfono 8888-0000\n"
        "Cuando el operador inicia la interacción con ese teléfono\n"
        "Entonces la agenda muestra la ficha de ese cliente"
    )
    assert ok_es["valid"], ok_es
    bad = validate_scenario(
        "Given a client\nWhen something happens\nThen it works correctly"
    )
    assert not bad["valid"], bad
    md = (
        "```bdd\n"
        "Given X\nWhen Y\nThen the screen shows the booking summary\n"
        "```\n"
    )
    assert len(extract_scenarios(md)) == 1
    print("selftest OK")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--scenario", help="Single scenario text")
    parser.add_argument("--markdown", help="Markdown file with scenarios")
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--selftest", action="store_true")
    args = parser.parse_args(argv)

    if args.selftest:
        selftest()
        return 0

    if bool(args.scenario) == bool(args.markdown):
        print("Provide exactly one of --scenario or --markdown.", file=sys.stderr)
        return 2

    if args.scenario:
        blocks = [args.scenario]
    else:
        path = Path(args.markdown)
        if not path.is_file():
            print(f"File not found: {path}", file=sys.stderr)
            return 2
        blocks = extract_scenarios(path.read_text(encoding="utf-8"))
        if not blocks:
            print(
                "bdd-lint: no Given/When/Then scenarios found "
                "(fenced ```bdd or Scenario blocks).",
                file=sys.stderr,
            )
            return 1

    results = [validate_scenario(b) for b in blocks]
    if args.json:
        print(json.dumps(results, ensure_ascii=False, indent=2))
    else:
        for idx, result in enumerate(results, start=1):
            status = "PASS" if result["valid"] else "FAIL"
            print(f"[{status}] #{idx}")
            for issue in result["issues"]:
                print(f"  - {issue}")

    return 0 if all(r["valid"] for r in results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
