# /ci-checks-audit — protocol SSOT

Harness-agnostic body. Thin entry: `commands/ci-checks-audit.md`.

Data source: **`shared/references/ci/ci-checks.yml`** (canonical catalog). This
protocol compares the repository's **actual** workflow jobs against the catalog
and reports: missing required (core) checks, extra/unnamed jobs, duplicate
check-runs, and naming violations. It is **read-only** — it never edits
workflows.

---

## Behavior contract (spec SC-6)

- `Given` the repository's workflows and the catalog
- `When` `/ci-checks-audit` runs
- `Then` it lists missing core checks
- `And` it lists extra or misnamed checks
- `And` it flags duplicate check-runs

---

## Step 1 — Load the catalog

Read `shared/references/ci/ci-checks.yml`:

- `phases` — the 10 ordered phases (core + opt-in check names).
- `infra_jobs` — documented infra jobs (excluded from check reporting).
- `naming.legacy_allowlist` — recorded legacy names (`scan-security`,
  `scan-static`).

## Step 2 — Collect actual jobs

Parse every `<workflows>/*.yml` (default `.github/workflows`) for job names —
use the same extraction as `scripts/ci/check-ci-naming.py` (2-space keys under
`jobs:`, structural keys excluded).

For each job, also record its trigger events (`on:` block) so duplicates can be
detected.

## Step 3 — Compute the gap report

| Report section | Rule |
| --- | --- |
| Missing core checks | a catalog `core` name (or its recorded `was:` spelling) with no matching job |
| Opt-in not enabled | an opt-in check with no matching job — informational, not a violation |
| Extra / unnamed jobs | a job name that is neither a catalog check, nor in `infra_jobs`, nor a recorded legacy name |
| Naming violations | run `python3 scripts/ci/check-ci-naming.py` (strict) over the workflow dir; legacy names listed only with `--allow-legacy` |
| Duplicate check-runs | a job whose trigger set runs both `push` (unscoped to the default branch) and `pull_request` on the same head — the same logical check appears twice per head |

## Step 4 — Report

Emit a markdown table per section with the concrete names. For each finding
include the nearest actionable (e.g. "add `check-docs-links` to
`.github/workflows/check-docs-links.yml`", "rename job `check` →
`check-skills-catalog`", "scope `push` to the default branch + add
`concurrency`").

Exit with a summary line: `N missing core · M extra/unnamed · K duplicate runs ·
V naming violations` (all counts may be 0).

---

## Evidence (what to record)

- `catalog_checks` — count from the catalog.
- `actual_jobs` — count parsed from workflows.
- For each section: the list of names and the workflow file(s) they came from.
- `validator_exit` — from `check-ci-naming.py` (strict), plus the legacy names
  that only pass with `--allow-legacy`.

---

## Anti-patterns

- Editing workflows from this audit (read-only).
- Counting infra jobs as "extra checks".
- Treating the recorded legacy names as new violations.
- Claiming "no duplicates" without checking trigger events.
- Using the audit as a substitute for `/ci-checks-verify` when a check is red.
