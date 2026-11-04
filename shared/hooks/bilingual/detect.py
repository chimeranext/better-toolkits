#!/usr/bin/env python3
"""Deterministic Bilingual-format gate for issue bodies.

Protocol SSOT:
  shared/references/engineering-standards/bilingual-issue-brief.md

Used by:
  - Linear MCP default path: OpenCode plugin `opencode-hygiene.ts` and Claude
    hook `pre-linear-save-issue-hygiene.sh` (execute.before → detect.py);
  - CLI fallback guard `shared/hooks/tooluse/enforce-bilingual.sh` (linear CLI, gh);
  - `/make-no-mistakes:implement` redaction guard, `/ready-to-review-mergeable`.

A Bilingual brief is machine-checkable: it carries two voices (Human Layer +
Agent Layer). Required markers (order-aware):

  ## 👤 HUMAN LAYER
  ## 🤖 AGENT LAYER
  ### Acceptance Criteria        (under AGENT LAYER)
  ### Context Files              (under AGENT LAYER)

Exit codes when run as CLI:
  0 — allow
  2 — deny (print reason to stderr)
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

BYPAASS = re.compile(r"#\s*hook-bypass:\s*bilingual-body-deferred\b", re.I)

# Heading markers (flexible: optional emoji; depth-agnostic for the two layers)
HUMAN = re.compile(r"(?im)^[ \t]*#{1,3}[ \t]*👤?[ \t]*HUMAN[ \t]+LAYER")
AGENT = re.compile(r"(?im)^[ \t]*#{1,3}[ \t]*🤖?[ \t]*AGENT[ \t]+LAYER")
ACCEPTANCE = re.compile(r"(?im)^[ \t]*###[ \t]*Acceptance[ \t]+Criteria")
CONTEXT = re.compile(r"(?im)^[ \t]*###[ \t]*Context[ \t]+Files")

# Next heading at depth 2 (## …), not ###/####.
NEXT_TOP = re.compile(r"(?m)^[ \t]*##(?![ \t]*#)[ \t]+")
# Next heading at depth 2 or 3.
NEXT_SUB = re.compile(r"(?m)^[ \t]*#{2,3}[ \t]+")

STUB = re.compile(r"(?i)\b(TBD|TODO)\b|^\s*[?…N/A]{1,4}\s*$")


def _capture(markdown: str, heading: re.Pattern[str], stop: re.Pattern[str]) -> str | None:
    m = heading.search(markdown)
    if not m:
        return None
    rest = markdown[m.end():]
    next_h = stop.search(rest)
    if next_h:
        rest = rest[: next_h.start()]
    return rest.strip()


def top_section(markdown: str, heading: re.Pattern[str]) -> str | None:
    """Content of a top-level (##) layer section, until the next ## heading."""
    return _capture(markdown, heading, NEXT_TOP)


def sub_section(markdown: str, heading: re.Pattern[str]) -> str | None:
    """Content of a ### sub-section, until the next ## or ### heading."""
    return _capture(markdown, heading, NEXT_SUB)


def missing_markers(body: str) -> list[str]:
    if not body or not body.strip():
        return ["body vacío (sin HUMAN LAYER / AGENT LAYER / AC / Context Files)"]
    hm = HUMAN.search(body)
    am = AGENT.search(body)
    missing: list[str] = []
    if not hm:
        missing.append("## 👤 HUMAN LAYER")
    if not am:
        missing.append("## 🤖 AGENT LAYER")
    if not (hm and am):
        return missing
    agent_block = body[am.end():]
    if not ACCEPTANCE.search(agent_block):
        missing.append("### Acceptance Criteria (bajo AGENT LAYER)")
    if not CONTEXT.search(agent_block):
        missing.append("### Context Files (bajo AGENT LAYER)")
    return missing


def substantive_check(body: str) -> list[str]:
    issues: list[str] = []
    for name, pat, getter in (
        ("HUMAN LAYER", HUMAN, top_section),
        ("AGENT LAYER", AGENT, top_section),
        ("Acceptance Criteria", ACCEPTANCE, sub_section),
        ("Context Files", CONTEXT, sub_section),
    ):
        txt = getter(body, pat)
        if txt is None:
            continue
        if STUB.search(txt) or len(txt) < 12:
            issues.append(f"{name}: sin contenido sustantivo (stub)")
    return issues


def evaluate(body: str) -> str | None:
    if BYPAASS.search(body):
        return None
    missing = missing_markers(body)
    if missing:
        return (
            "BILINGUAL: faltan marcadores obligatorios: " + ", ".join(missing)
            + ". Redacta el issue con la plantilla `templates/bilingual-issue-brief.md` "
            "(## 👤 HUMAN LAYER / ## 🤖 AGENT LAYER / ### Acceptance Criteria / "
            "### Context Files). Ejecuta `/make-no-mistakes:spike-recommend {ID}` "
            "para regenerar el brief. Bypass explícito: `# hook-bypass: bilingual-body-deferred`."
        )
    stub = substantive_check(body)
    if stub:
        return "BILINGUAL: " + "; ".join(stub) + " (stub ≠ brief sustantivo)"
    return None


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    src = parser.add_mutually_exclusive_group(required=True)
    src.add_argument("--body", help="Issue body text")
    src.add_argument("--body-file", help="Path to file containing the issue body")
    args = parser.parse_args(argv)
    if args.body_file:
        try:
            body = Path(args.body_file).expanduser().read_text(encoding="utf-8")
        except OSError as e:
            print(f"BILINGUAL: no se puede leer --body-file ({e})", file=sys.stderr)
            return 2
    else:
        body = args.body or ""
    reason = evaluate(body)
    if reason:
        print(reason, file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
