#!/usr/bin/env python3
"""Validate CI check names against the `verb-type-subject` convention.

Canonical catalog: `shared/references/ci/ci-checks.yml`. A check name is
`<verb>-<type>-<subject>` — three lowercase alphanumeric segments, with a verb
from the allowed set:

    ^(check|test|scan|audit|build|verify|validate|enforce|deploy|publish|sync|guard|maintain|review|notify)-[a-z0-9]+-[a-z0-9]+$

Recorded legacy exception: two phase-2 check jobs (`scan-security`,
`scan-static`) were split and merged with 2-segment names before the convention
was fixed. They are NOT renamed (workflow already merged/approved); they pass
only when `--allow-legacy` is given and are reported otherwise. Infra workflow
jobs (deploy, review bots, policy propagation, aggregator linters) are outside
the check-naming contract and are excluded from reporting (see `infra_jobs`).

Usage:
  python3 scripts/ci/check-ci-naming.py          # scan .github/workflows/*.yml
  python3 scripts/ci/check-ci-naming.py FILE ...  # scan explicit workflow files
  python3 scripts/ci/check-ci-naming.py --names NAME [...]  # validate literal names
  python3 scripts/ci/check-ci-naming.py --allow-legacy  # permit legacy names
  python3 scripts/ci/check-ci-naming.py --selftest  # unit tests (exit 0/1)

Exit codes: 0 = all names conform (or are recorded legacy / infra); 1 = violations.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_WORKFLOWS = ROOT / ".github" / "workflows"

VERBS = (
    "check",
    "test",
    "scan",
    "audit",
    "build",
    "verify",
    "validate",
    "enforce",
    "deploy",
    "publish",
    "sync",
    "guard",
    "maintain",
    "review",
    "notify",
)

NAMING_RE = re.compile(r"^(?:%s)-[a-z0-9]+-[a-z0-9]+$" % "|".join(VERBS))

# Recorded decision (Jidoka): pre-convention, already-merged 2-segment check
# jobs. Only accepted when --allow-legacy is passed.
LEGACY_ALLOWLIST = ("scan-security", "scan-static")

# Workflow jobs that are infrastructure, not catalog checks. Keys at 2-space
# indent under `jobs:` that are containers, not job names.
STRUCTURAL_JOB_KEYS = {
    "defaults",
    "permissions",
    "env",
    "strategy",
    "steps",
    "container",
    "services",
    "outputs",
    "concurrency",
}

INFRA_JOBS = {
    "audit",        # bypass-audit.yml
    "build",        # deploy-pages.yml
    "deploy",       # deploy-pages.yml
    "review",       # heimdall-review.yml
    "sync-and-check",  # marketplace-versions.yml
    "megalinter",   # megalinter.yml
    "propagate",    # propagate-policies.yml
    "debrand",      # vendor-invariants.yml
    "toolkit-lint",  # vendor-invariants.yml
}


def validate_name(name: str, allow_legacy: bool = False) -> tuple[bool, str]:
    """Return (ok, reason). ok is True for conforming or (when allowed) legacy names."""
    if NAMING_RE.match(name):
        return True, ""
    if allow_legacy and name in LEGACY_ALLOWLIST:
        return True, f"legacy (allowlisted): {name}"
    return False, (
        f"{name!r} does not match verb-type-subject "
        f"({NAMING_RE.pattern}); legacy allowlist: {sorted(LEGACY_ALLOWLIST)}"
    )


def extract_job_names(path: Path) -> list[str]:
    """Extract check/job names from a GitHub Actions workflow file.

    Intentionally dependency-free: reads top-level job keys at 2-space indent
    under `jobs:` (keys with a trailing value or structural containers are
    skipped). Sufficient for the workflows in this repo.
    """
    if not path.is_file():
        return []
    names: list[str] = []
    in_jobs = False
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not in_jobs:
            if stripped == "jobs:":
                in_jobs = True
            continue
        # A top-level key (column 0) ends the jobs section.
        if stripped and not line.startswith(" "):
            in_jobs = False
            continue
        m = re.match(r"^  ([A-Za-z0-9_.-]+):\s*(?:#.*)?$", line)
        if m and m.group(1) not in STRUCTURAL_JOB_KEYS:
            names.append(m.group(1))
    return names


def scan_workflows(paths: list[Path], allow_legacy: bool) -> tuple[list[str], int]:
    problems: list[str] = []
    checked = 0
    for path in paths:
        for name in extract_job_names(path):
            checked += 1
            if name in INFRA_JOBS:
                continue
            ok, reason = validate_name(name, allow_legacy)
            if not ok:
                problems.append(f"{path.name}: job {reason}")
    return problems, checked


def run_selftest() -> int:
    failures: list[str] = []

    def expect(name: str, expect_ok: bool, allow_legacy: bool = False) -> None:
        ok, _ = validate_name(name, allow_legacy)
        if ok != expect_ok:
            failures.append(
                f"validate_name({name!r}, allow_legacy={allow_legacy}) -> "
                f"ok={ok}, expected {expect_ok}"
            )

    for name in (
        "scan-security-dependencies",
        "enforce-pr-size",
        "check-lint-mega",
        "check-skills-catalog",
        "verify-static-types",
        "check-static-lint",
        "guard-secrets-repo",
        "verify-sbom-manifest",
        "audit-supply-dependencies",
        "test-code-coverage",
        "publish-ui-chromatic",
        "notify-deps-slack",
        "deploy-db-migrations",
    ):
        expect(name, True)
    for name in (
        "check",
        "scan",
        "audit",
        "megalinter",
        "run-dogfood",       # 'run' is not in the verb set
        "stage-promotion-ops",  # 'stage' is not in the verb set
        "stale-prs",         # missing leading verb
        "scan-security",     # legacy 2-segment — fails unless allowed
        "scan-static",       # legacy 2-segment — fails unless allowed
        "Scan-Security-Dependencies",  # uppercase
        "check-bad name",    # space
        "check--double",     # empty segment
        "check-lint-",       # trailing hyphen
        "check-lint",        # 2 segments
        "deploy-migrations",   # 2 segments (normalized to deploy-db-migrations)
        "guard-secrets",     # 2 segments (normalized to guard-secrets-repo)
        "publish-chromatic",   # 2 segments (normalized to publish-ui-chromatic)
    ):
        expect(name, False)
    expect("scan-security", True, allow_legacy=True)
    expect("scan-static", True, allow_legacy=True)

    # Extraction: write a temp workflow and make sure only job names come out.
    import tempfile

    with tempfile.NamedTemporaryFile("w", suffix=".yml", delete=False) as tmp:
        tmp.write(
            "name: sample\n"
            "on:\n  push:\njobs:\n"
            "  scan-security:\n    runs-on: ubuntu-latest\n"
            "  check-skills-catalog:\n    runs-on: ubuntu-latest\n"
            "  defaults:\n    run:\n      shell: bash\n"
            "  steps:\n    - run: echo hi\n",
        )
        tmp_path = Path(tmp.name)
    got = extract_job_names(tmp_path)
    tmp_path.unlink(missing_ok=True)
    if got != ["scan-security", "check-skills-catalog"]:
        failures.append(f"extract_job_names returned {got!r}")

    if failures:
        for f in failures:
            print("  FAIL", f)
        return 1
    print("selftest OK: naming regex + extraction")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("files", nargs="*",
                        help="workflow YAML files (default: .github/workflows/*.yml)")
    parser.add_argument("--names", nargs="+",
                        help="validate literal check names (no file scanning)")
    parser.add_argument("--allow-legacy", action="store_true",
                        help="permit recorded legacy names")
    parser.add_argument("--selftest", action="store_true",
                        help="run unit tests and exit")
    args = parser.parse_args()

    if args.selftest:
        return run_selftest()

    if args.names:
        problems: list[str] = []
        for name in args.names:
            ok, reason = validate_name(name, args.allow_legacy)
            if not ok:
                problems.append(reason)
        if problems:
            for p in problems:
                print("  VIOLATION", p)
            print(f"{len(problems)} naming violation(s)")
            return 1
        print(f"naming OK: {len(args.names)} name(s)")
        return 0

    paths = ([Path(f) for f in args.files] if args.files
             else sorted(DEFAULT_WORKFLOWS.glob("*.yml")))
    if not paths:
        print("no workflow files found to scan", file=sys.stderr)
        return 1

    problems, checked = scan_workflows(paths, args.allow_legacy)
    if problems:
        print("CI CHECK NAMING VIOLATIONS:")
        for p in problems:
            print("  -", p)
        print(f"{len(problems)} violation(s) across {checked} jobs "
              f"(infra jobs excluded)")
        return 1
    print(f"ci check naming OK: {checked} jobs scanned (infra jobs excluded)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
