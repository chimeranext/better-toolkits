#!/usr/bin/env python3
"""Heuristic standards checker for /opsx-living audit columns.

Maps OpenSpec artifacts (proposal, design, spec delta, tasks) to:

- ISO/IEC/IEEE 29148:2018 — requirements well-formed and traceable
- IEEE 29119-3 — test documentation (scenarios + QA pointers)
- ISO 31000:2018 — risk / impact / open questions recorded

This is a **document checker**, not a certified audit. Verdicts:

- ``pass`` — every check for that standard succeeded
- ``partial`` — some succeeded, some failed
- ``fail`` — none succeeded (or the change folder is missing required artifacts)
- ``not-assessed`` — change directory not found on disk
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CHANGES_DIR = ROOT / "openspec" / "changes"
ARCHIVE_DIR = CHANGES_DIR / "archive"

SHALL_RE = re.compile(r"\b(?:SHALL(?:\s+NOT)?|MUST(?:\s+NOT)?)\b")
SCENARIO_HEAD = re.compile(r"^#### Scenario:", re.MULTILINE)
REQUIREMENT_HEAD = re.compile(r"^### Requirement:", re.MULTILINE)
WHEN_RE = re.compile(r"\*\*WHEN\*\*|^\s*-\s+WHEN\b", re.MULTILINE)
THEN_RE = re.compile(r"\*\*THEN\*\*|^\s*-\s+THEN\b", re.MULTILINE)
CHANGE_ID_IN_PROPOSAL = re.compile(
    r"(?:Change ID|Change ID\s*\||\*\*Change ID\*\*)[^\n`]*`(?P<id>20\d{2}-\d{2}-\d{2}-[^`]+)`",
    re.IGNORECASE,
)
QA_HEADING_RE = re.compile(
    r"^#{2,3}\s+.*\b(QA|traceability|test plan|verif)\b",
    re.IGNORECASE | re.MULTILINE,
)
TEST_POINTER_RE = re.compile(
    r"(QA traceability|Scenario → verification|tests/|Pest|PHPUnit|Vitest|"
    r"runbook-|sop-|four layers|HITL|/bug-squash)",
    re.IGNORECASE,
)
RISK_RE = re.compile(
    r"\b(riesgo|risk|avisos? para|non-goals?|fuera de alcance|"
    r"preguntas abiertas|open questions?)\b",
    re.IGNORECASE,
)
IMPACT_RE = re.compile(
    r"^#{2,3}\s+.*(impact|impacto)\b|\b(impact|impacto)\b", re.IGNORECASE | re.MULTILINE
)

VERDICTS = ("pass", "partial", "fail", "not-assessed")


@dataclass
class Check:
    check_id: str
    ok: bool
    detail: str


@dataclass
class StandardResult:
    standard: str
    verdict: str
    checks: list[Check] = field(default_factory=list)

    @property
    def failed(self) -> list[Check]:
        return [c for c in self.checks if not c.ok]


@dataclass
class ChangeAssessment:
    change_id: str
    iso_29148: StandardResult
    ieee_29119_3: StandardResult
    iso_31000: StandardResult

    def cells(self) -> tuple[str, str, str]:
        return (
            self.iso_29148.verdict,
            self.ieee_29119_3.verdict,
            self.iso_31000.verdict,
        )


def resolve_change_dir(change_id: str) -> Path | None:
    for base in (CHANGES_DIR, ARCHIVE_DIR):
        path = base / change_id
        if path.is_dir():
            return path
    return None


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8") if path.is_file() else ""


def _split_requirements(body: str) -> list[tuple[str, str]]:
    parts = re.split(r"(?=^### Requirement:)", body, flags=re.MULTILINE)
    reqs: list[tuple[str, str]] = []
    for part in parts:
        part = part.strip()
        if not part.startswith("### Requirement:"):
            continue
        title = part.split("\n", 1)[0].replace("### Requirement:", "").strip()
        reqs.append((title, part))
    return reqs


def _delta_body(raw: str) -> str:
    for header in (
        "## ADDED Requirements",
        "## MODIFIED Requirements",
        "## REMOVED Requirements",
        "## RENAMED Requirements",
    ):
        if header in raw:
            return raw.split(header, 1)[1].strip()
    return raw.strip()


def load_spec_text(change_dir: Path, capabilities: list[str]) -> str:
    chunks: list[str] = []
    for cap in capabilities:
        path = change_dir / "specs" / cap / "spec.md"
        if path.is_file():
            chunks.append(_delta_body(path.read_text(encoding="utf-8")))
    return "\n\n".join(chunks)


def verdict_from_checks(checks: list[Check], *, missing: bool = False) -> str:
    if missing:
        return "not-assessed"
    if not checks:
        return "not-assessed"
    oks = [c.ok for c in checks]
    if all(oks):
        return "pass"
    if not any(oks):
        return "fail"
    return "partial"


def assess_iso_29148(change_id: str, proposal: str, spec_text: str) -> StandardResult:
    reqs = _split_requirements(spec_text)
    titles = [t for t, _ in reqs]
    checks = [
        Check(
            "delta-has-requirements",
            bool(reqs),
            (
                f"{len(reqs)} requirement(s)"
                if reqs
                else "no ### Requirement: in spec delta"
            ),
        ),
        Check(
            "shall-in-every-requirement",
            bool(reqs) and all(bool(SHALL_RE.search(body)) for _, body in reqs),
            (
                "every requirement uses SHALL/MUST"
                if reqs and all(SHALL_RE.search(b) for _, b in reqs)
                else "one or more requirements lack SHALL/MUST"
            ),
        ),
        Check(
            "unique-requirement-titles",
            bool(titles) and len(titles) == len(set(titles)),
            (
                "titles unique"
                if titles and len(titles) == len(set(titles))
                else "duplicate or empty titles"
            ),
        ),
        Check(
            "has-scenarios",
            bool(SCENARIO_HEAD.search(spec_text)),
            (
                "#### Scenario: present"
                if SCENARIO_HEAD.search(spec_text)
                else "no #### Scenario:"
            ),
        ),
        Check(
            "proposal-exists",
            bool(proposal.strip()),
            "proposal.md present" if proposal.strip() else "missing proposal.md",
        ),
        Check(
            "proposal-change-id",
            change_id in proposal,
            (
                "proposal cites this Change ID"
                if change_id in proposal
                else "proposal does not cite Change ID"
            ),
        ),
    ]
    return StandardResult("ISO 29148", verdict_from_checks(checks), checks)


def assess_ieee_29119_3(spec_text: str, tasks: str) -> StandardResult:
    reqs = _split_requirements(spec_text)
    every_has_scenario = bool(reqs) and all(
        bool(SCENARIO_HEAD.search(body)) for _, body in reqs
    )
    when_then_ok = bool(reqs) and all(
        bool(WHEN_RE.search(body) and THEN_RE.search(body)) for _, body in reqs
    )
    checks = [
        Check(
            "every-requirement-has-scenario",
            every_has_scenario,
            (
                "each requirement has #### Scenario:"
                if every_has_scenario
                else "a requirement has no scenario"
            ),
        ),
        Check(
            "when-then-in-requirements",
            when_then_ok,
            (
                "WHEN/THEN present per requirement"
                if when_then_ok
                else "WHEN/THEN missing in a requirement"
            ),
        ),
        Check(
            "tasks-exists",
            bool(tasks.strip()),
            "tasks.md present" if tasks.strip() else "missing tasks.md",
        ),
        Check(
            "tasks-qa-heading",
            bool(QA_HEADING_RE.search(tasks)),
            (
                "QA heading in tasks.md"
                if QA_HEADING_RE.search(tasks)
                else "no QA heading in tasks.md"
            ),
        ),
        Check(
            "tasks-test-pointer",
            bool(TEST_POINTER_RE.search(tasks)),
            (
                "tasks.md points at tests/SOP/four-layer QA"
                if TEST_POINTER_RE.search(tasks)
                else "no test/SOP/traceability pointer in tasks.md"
            ),
        ),
    ]
    return StandardResult("IEEE 29119-3", verdict_from_checks(checks), checks)


def assess_iso_31000(proposal: str, design: str) -> StandardResult:
    combined = f"{proposal}\n{design}"
    has_impact = bool(IMPACT_RE.search(combined))
    has_risk = bool(RISK_RE.search(combined))
    checks = [
        Check(
            "impact-recorded",
            has_impact,
            (
                "Impact/Impacto present"
                if has_impact
                else "no Impact/Impacto in proposal or design"
            ),
        ),
        Check(
            "risk-or-open-questions",
            has_risk,
            (
                "risk / avisos / open questions present"
                if has_risk
                else "no risk, avisos, non-goals, or open questions"
            ),
        ),
        Check(
            "proposal-or-design-present",
            bool(proposal.strip() or design.strip()),
            (
                "proposal or design present"
                if (proposal.strip() or design.strip())
                else "missing both proposal.md and design.md"
            ),
        ),
    ]
    return StandardResult("ISO 31000", verdict_from_checks(checks), checks)


def assess_change(change_id: str, capabilities: list[str]) -> ChangeAssessment:
    change_dir = resolve_change_dir(change_id)
    if change_dir is None:
        missing = StandardResult(
            "missing",
            "not-assessed",
            [Check("change-dir", False, "change folder not found")],
        )
        return ChangeAssessment(
            change_id,
            StandardResult("ISO 29148", "not-assessed", missing.checks),
            StandardResult("IEEE 29119-3", "not-assessed", missing.checks),
            StandardResult("ISO 31000", "not-assessed", missing.checks),
        )

    proposal = _read(change_dir / "proposal.md")
    design = _read(change_dir / "design.md")
    tasks = _read(change_dir / "tasks.md")
    spec_text = load_spec_text(change_dir, capabilities)
    return ChangeAssessment(
        change_id,
        assess_iso_29148(change_id, proposal, spec_text),
        assess_ieee_29119_3(spec_text, tasks),
        assess_iso_31000(proposal, design),
    )


def apply_verdicts_to_audit_row(row: str, cells: tuple[str, str, str]) -> str:
    """Replace the last three table cells (ISO 29148, IEEE 29119-3, ISO 31000)."""
    parts = row.rstrip().split("|")
    if len(parts) < 11:
        return row
    # split('|') on a markdown row: ['', col1, ..., colN, '']
    parts[-4] = f" {cells[0]} "
    parts[-3] = f" {cells[1]} "
    parts[-2] = f" {cells[2]} "
    return "|".join(parts)


def format_checker_details(assessments: list[ChangeAssessment]) -> str:
    lines = [
        "### Checker de normas (esta corrida)",
        "",
        "Heurística sobre los artefactos del change (`scripts/opsx_living_standards.py`). "
        "No es una auditoría certificada. Las tres columnas de la tabla se **recalculan** "
        "en cada `/opsx-living` (no son historial append-only).",
        "",
        "| Norma | `pass` | Meaning in this workflow |",
        "| --- | --- | --- |",
        "| ISO 29148 | requisitos SHALL + escenarios + proposal con Change ID | spec delta bien formado |",
        "| IEEE 29119-3 | cada requisito tiene WHEN/THEN y `tasks.md` apunta a QA/tests | documentación de prueba |",
        "| ISO 31000 | Impacto y riesgo/avisos/preguntas abiertas en proposal o design | riesgos registrados |",
        "",
    ]
    failed_rows: list[str] = []
    for assessment in assessments:
        for result in (
            assessment.iso_29148,
            assessment.ieee_29119_3,
            assessment.iso_31000,
        ):
            if result.verdict == "pass":
                continue
            misses = "; ".join(f"`{c.check_id}`" for c in result.failed) or "—"
            failed_rows.append(
                f"| `{assessment.change_id}` | {result.standard} | `{result.verdict}` | {misses} |"
            )
    if failed_rows:
        lines.extend(
            [
                "| Change | Norma | Veredicto | Checks que fallaron |",
                "| --- | --- | --- | --- |",
                *failed_rows,
                "",
            ]
        )
    else:
        lines.append(
            "Todos los changes de esta corrida dan **pass** en las tres normas."
        )
        lines.append("")
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Assess OpenSpec changes for living.md ISO columns."
    )
    parser.add_argument(
        "change_id", nargs="?", help="Folder name, or omit to print usage"
    )
    parser.add_argument(
        "--capabilities",
        default="",
        help="Comma-separated capability slugs (spec deltas to read)",
    )
    args = parser.parse_args()
    if not args.change_id:
        print(
            "usage: opsx_living_standards.py <change-id> [--capabilities cap1,cap2]",
            file=sys.stderr,
        )
        raise SystemExit(2)
    caps = [c.strip() for c in args.capabilities.split(",") if c.strip()]
    if not caps:
        change_dir = resolve_change_dir(args.change_id)
        if change_dir is None:
            print(f"change not found: {args.change_id}", file=sys.stderr)
            raise SystemExit(1)
        specs = change_dir / "specs"
        if specs.is_dir():
            caps = sorted(p.name for p in specs.iterdir() if p.is_dir())
    assessment = assess_change(args.change_id, caps)
    iso, ieee, risk = assessment.cells()
    print(
        f"{assessment.change_id}\tISO29148={iso}\tIEEE29119-3={ieee}\tISO31000={risk}"
    )
    for result in (assessment.iso_29148, assessment.ieee_29119_3, assessment.iso_31000):
        for check in result.checks:
            mark = "ok" if check.ok else "FAIL"
            print(f"  [{mark}] {result.standard} {check.check_id}: {check.detail}")


if __name__ == "__main__":
    main()
