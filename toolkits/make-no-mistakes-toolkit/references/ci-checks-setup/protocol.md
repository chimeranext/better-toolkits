# /ci-checks-setup — protocol SSOT

Harness-agnostic body. Thin entry: `commands/ci-checks-setup.md`.

Data source: **`shared/references/ci/ci-checks.yml`** (canonical 10-phase
catalog — phases in list order ARE the invocation order). The catalog is the
single source of truth; this protocol never hard-codes a check list.

---

## Behavior contract (spec SC-4)

- `Given` a repository and the canonical catalog
- `When` `/ci-checks-setup` runs
- `Then` it visits phases 1→10 in order
- `And` in each phase it lists the core checks (always included)
- `And` it asks about that phase's opt-in checks
- `And` it emits only the confirmed opt-in checks, in phase order

Invariants:

- Core checks are **always** included — never skipped, never prompted.
- An opt-in check is included **only** when explicitly confirmed (interactive
  prompt or `--with <check>`).
- Emission order = phase order (1→10), core before opt-in within a phase.
- No generated artifact references a vendor, client organization, or product
  (vendor-neutral).

---

## Step 1 — Read the catalog

Load `shared/references/ci/ci-checks.yml`. If it is missing or unparseable:
**STOP** — report it; do not proceed with an invented list (No-Workarounds).

For each phase `p` in catalog order:

- `p.number`, `p.name`
- `p.core` — the default-on checks
- `p.opt_in` — the opinionated, parameterized checks (may be empty)

---

## Step 2 — Walk phases 1→10

For each phase in order:

1. **List core** — print `p.core` (all of them; this phase is installed as-is).
2. **Ask opt-in** — for each `p.opt_in` check, ask `Enable <check>? (y/N)`.
   - `--with <check>` on `$ARGUMENTS` counts as an explicit `yes` for that check.
   - Any other answer (including default `N`) is **no** — the check is skipped.
   - Never enable an unconfirmed opt-in check.

`--phase N` limits the walk to that phase (for incremental setups); the emitted
manifest then covers only that phase, with its core always included.

---

## Step 3 — Emit the workflow set / manifest

Emit one artifact, in phase order:

- A `ci-checks-manifest.yml` with:
  - `schema_version`, `source: shared/references/ci/ci-checks.yml`
  - `phases`: an ordered list of `{number, name, checks: [ ... ]}` —
    core checks first, then confirmed opt-in checks.
  - `omitted_opt_in`: the opt-in checks that were NOT confirmed (audit
    trail; keeps the decision visible).

Optionally, when the repo uses per-check workflow files, write one workflow per
check under the repo's workflow directory (e.g. `.github/workflows/check-<name>.yml`),
each with the check name as its job name. Job names MUST match the naming regex
(`scripts/ci/check-ci-naming.py`); a name that fails the regex is a **recorded
error** — fix the name, do not ship it.

The manifest is the deliverable; the workflow files are scaffolding on top of it.

---

## Step 4 — Verify the emission

1. Run `python3 scripts/ci/check-ci-naming.py --names $(cat manifest checks)` — all emitted names must pass (use `--allow-legacy` only for the recorded `scan-security`/`scan-static` jobs).
2. Run `/ci-checks-audit` on the repo to confirm the emitted set matches the catalog.
3. Report: phases visited (1→10), core included, opt-in confirmed vs omitted.

---

## Evidence (what to record)

- `phases_visited` — the ordered phase numbers (must equal 1..10 unless `--phase`).
- `core_included` — count of core checks emitted.
- `opt_in_confirmed` / `opt_in_omitted` — the explicit confirmations and refusals.
- `manifest_path` — where the emitted manifest was written.
- `validator_exit` — 0/1 from the naming check.

Never mark a check "included" that was not emitted; never mark a workflow "green"
that was not run.

---

## Anti-patterns

- Hard-coding the check list in this protocol (use the catalog).
- Silently enabling opt-in checks.
- Emitting names that fail the naming regex.
- Referencing a client org/product in generated artifacts.
- Claiming a phase was visited without emitting its core.
