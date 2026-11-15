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

Behavioral Acceptance Criteria (shall/debe / EARS openers) are also checked
with `shared/references/ears/scripts/ears-lint.py` when that pack is present.
Informal AC bullets are ignored. Pipeline: EARS structure, then STE/ESP-TS
at the producer skill (not in this detector).

Exit codes when run as CLI:
  0 — allow
  2 — deny (print reason to stderr)
"""
from __future__ import annotations

import argparse
import importlib.util
import re
import sys
from pathlib import Path
from typing import Any, Callable, cast

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

HERE = Path(__file__).resolve().parent


def _find_ears_lint() -> Path | None:
    """Locate ears-lint.py: monorepo shared/, or bundled next to this detector."""
    candidates = [
        HERE / "ears-lint.py",
        HERE / "ears" / "ears-lint.py",
        HERE / "ears" / "scripts" / "ears-lint.py",
    ]
    for parent in [HERE, *HERE.parents]:
        candidates.append(
            parent / "shared" / "references" / "ears" / "scripts" / "ears-lint.py"
        )
        candidates.append(
            parent / "references" / "ears" / "scripts" / "ears-lint.py"
        )
    seen: set[Path] = set()
    for path in candidates:
        if path in seen:
            continue
        seen.add(path)
        if path.is_file():
            return path
    return None


def _load_ears():
    path = _find_ears_lint()
    if path is None:
        return None
    spec = importlib.util.spec_from_file_location("ears_lint_bib", path)
    if spec is None or spec.loader is None:
        return None
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


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


def ears_ac_check(body: str) -> list[str]:
    """Lint behavioral AC bullets with EARS when the pack is available.

    Informal AC (tests pass, docs updated) are not candidates. Missing pack
    → no findings (fail-open for lean plugin installs without shared/).
    """
    ears = _load_ears()
    if ears is None:
        return []
    extract = getattr(ears, "extract_from_markdown", None)
    validate = getattr(ears, "validate_requirement", None)
    if not callable(extract) or not callable(validate):
        return []
    # callable() is the runtime guard. Pylint does not narrow getattr results.
    extract_fn = cast(Callable[[str], list[Any]], extract)
    validate_fn = cast(Callable[[Any], dict[str, Any]], validate)
    candidates = extract_fn(body)  # pylint: disable=not-callable
    findings: list[str] = []
    for cand in candidates:
        result = validate_fn(cand)  # pylint: disable=not-callable
        if result.get("valid"):
            continue
        issues = "; ".join(result.get("issues") or ["invalid EARS form"])
        findings.append(f"AC EARS FAIL: {cand} ({issues})")
    return findings


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
    ears = ears_ac_check(body)
    if ears:
        return (
            "BILINGUAL+EARS: "
            + " | ".join(ears)
            + ". Reescribe criterios de comportamiento en forma EARS "
            "(When/While/If/Where … shall / Cuando/Mientras/Si/Donde … debe). "
            "Ver shared/references/ears/README.md. Informal AC (tests, docs) sin "
            "shall/debe se dejan igual."
        )
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
