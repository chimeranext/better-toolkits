# /ci-checks-verify — protocol SSOT

Harness-agnostic body. Thin entry: `commands/ci-checks-verify.md`.

Data source: **`shared/references/ci/ci-checks.yml`** (canonical catalog). This
protocol diagnoses a **named failing check** and returns the cause + ranked
actionables — consistent with `/explain` for CI failures. It never asserts a
cause without observable evidence.

---

## Behavior contract (spec SC-5)

- `Given` a failing check name
- `When` `/ci-checks-verify` runs
- `Then` it locates the check in the catalog
- `And` it reports the cause
- `And` it returns ranked actionables

Invariants:

- The check MUST be resolved against the catalog (or an explicit infra job).
- The diagnosis MUST be grounded in a **real run/query** of the check — never
  a guess.
- If the check cannot be run/queried, the verdict is `NOT VERIFIABLE` with the
  exact reason — never a fabricated cause.

---

## Step 1 — Resolve the check

Given `$ARGUMENTS` `<check-name>`:

1. Look it up in the catalog (`phases[].core` + `phases[].opt_in`). Record the
   phase number and whether it is core or opt-in.
2. If it is not in the catalog, check `infra_jobs` (documented infra jobs, e.g.
   `review`, `deploy`, `megalinter`). Infra jobs are diagnosed the same way, but
   flagged as outside the check-naming contract.
3. If it matches neither, the name itself is a finding (naming violation) — see
   the decision table.

## Step 2 — Locate the real check

Determine the **source of truth** for the check:

| Source | How to find it |
| --- | --- |
| Workflow job | `grep -rn "<check-name>" .github/workflows/` — the job that runs it |
| Local runner script | a `scripts/ci/*.py|sh` referenced by that job |
| PR status checks | `gh pr checks <PR>` / `gh run view --job <id>` (when diagnosing a PR) |

## Step 3 — Run/query the real check (evidence, never assertion)

Run the actual thing and capture its real output:

- If there is a PR: `gh pr checks <PR>` lists every check and its state; drill
  into the failing run with `gh run view <run-id> --log-failed` (or
  `--job <id>`).
- If the check has a local runner (`python3 scripts/ci/…`), execute it directly
  and capture both stdout and stderr to a log file (`run.log`) so errors are
  preserved, not swallowed.
- Record the exact command and its exit code.

If none of the above can execute (no PR, no run, no script): verdict is
`NOT VERIFIABLE` — state what could not be run and why.

## Step 4 — Classify the cause (decision table)

| Observation | Cause | Actionable (ranked) |
| --- | --- | --- |
| Name fails `scripts/ci/check-ci-naming.py` (strict) | Naming violation / legacy name | 1. Rename to `verb-type-subject` (or confirm it is a recorded legacy name). 2. Update branch protection if the old name was required. 3. Re-run the validator. |
| Job/script file missing (checkout path absent) | Check not actually implemented | 1. Create the real runner (or wire the existing one). 2. Never simulate a pass. 3. Re-run the check. |
| Script exists, exit != 0 | Failing check | 1. Read the failed log lines (first error). 2. Fix the defect it points to. 3. Re-run locally until exit 0. 4. Push + re-run CI. |
| Trigger set runs same head twice (push + pull_request both fire) | Duplicate check-runs | 1. Scope `push` to the default branch + `pull_request`. 2. Add `concurrency`/`cancel-in-progress`. 3. Verify via `gh pr checks` that one run remains. |
| Check green locally but red on CI | Environment/config drift | 1. Compare CI env (versions, secrets, caches) vs local. 2. Re-run with CI env. 3. Fix the drift. |
| Check not resolvable (neither catalog nor infra) | Unnamed/extra job | 1. Name it per the convention or move it to infra. 2. Re-run audit. |

## Step 5 — Report (cause + ranked actionables)

Output, `/explain`-style:

1. **Plain prose** — what failed, in one or two sentences, naming the tool and
   the verb (e.g. "The skills-catalog check `check-skills-catalog` exited 1
   because `scripts/ci/check-skills-catalog.py` reported catalog drift.").
2. **Technical evidence** — the exact command, exit code, and the offending log
   lines (observed, not inferred).
3. **Ranked actionables** — the fixes from the table, ordered by
   cost-of-delay (cheapest unblock first), each with a verify step.

---

## Evidence (what to record)

- `check` — resolved name + phase (or infra).
- `source` — workflow/script/PR that was queried.
- `command` and `exit_code` — the real run.
- `cause` — from the decision table.
- `actionables` — ranked, each with a verify step.
- `verdict` — DIAGNOSED / NOT VERIFIABLE (with reason).

---

## Anti-patterns

- Claiming a cause without running/querying the check.
- Reporting `NOT VERIFIABLE` as a pass.
- Recommending "merge anyway" (papering over a red check).
- Skipping the catalog lookup and diagnosing an unknown name as "infra".
- Silencing stderr (redirecting it to a null sink) when capturing the run — the
  hook policy forbids dropping stderr entirely.
