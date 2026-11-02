# Tasks — `ci-checks-setup` (vendored CI checks)

## Catalog & naming

- [x] Define the canonical 10-phase catalog (table in `design.md`) and persist it
      as a machine-readable reference (`shared/references/ci/ci-checks.yml`).
      Canonical check names are normalized to the strict 3-segment
      `verb-type-subject` regex (design-table originals kept in `was:` comments);
      only `scan-security`/`scan-static` remain 2-segment (recorded legacy).
- [x] Enforce the `verb-type-subject` naming convention; add a linter/validator
      (`scripts/ci/check-ci-naming.py`) that rejects check names not matching
      `^(check|test|scan|audit|build|verify|validate|enforce|deploy|publish|sync|guard|maintain|review|notify)-[a-z0-9]+-[a-z0-9]+$`.
      `--allow-legacy` permits the two recorded legacy names; `--selftest` runs
      the unit tests (`scripts/ci/tests/test_check_ci_naming.sh`).

## Fix current defects

- [x] Split `skillspector.yml`'s `scan` job into `scan-security`, `verify-sbom`,
      `audit-dependencies`, `scan-static` (each a named job) — implemented in
      `b1483cab` (already merged/approved; `verify-sbom`/`audit-dependencies`
      correctly excluded as no real tooling exists — No-Workarounds).
- [x] Rename `skills-catalog-check.yml`'s job from `check` to
      `check-skills-catalog` (matches phase-1 catalog check).
- [x] De-duplicate trigger sets so a PR head does not produce duplicate
      check-runs (evidence: `skills-catalog-check.yml` ran `push` on every
      branch + `pull_request` → same head double-run; fixed with `push` scoped
      to main + `concurrency`/`cancel-in-progress`). Other workflows audited:
      no same-head duplicates (push scoped to default branch).

## `/ci-checks` command family

- [x] Scaffold `/ci-checks-setup` (`commands/ci-checks-setup.md` + `references/ci-checks-setup/protocol.md`).
- [x] Implement setup phase walk 1→10 with an interactive opt-in prompt per phase
      (core always included; only confirmed opt-in checks added; `--with <check>` shortcut).
- [x] Emit the resulting workflow set / manifest (`ci-checks-manifest.yml`) in phase order.
- [x] Scaffold `/ci-checks-verify` (`commands/ci-checks-verify.md` + `references/ci-checks-verify/protocol.md`) — resolves the check in the catalog, runs/queries the real check, returns cause + ranked actionables.
- [x] Scaffold `/ci-checks-audit` (`commands/ci-checks-audit.md` + `references/ci-checks-audit/protocol.md`) — compares actual workflows vs catalog → gap report (missing core, extra/unnamed, duplicates, naming).
- [x] Extend `references/ready-to-review-mergeable/protocol.md` with the
      CI-check awareness section (route failing checks through `/ci-checks-verify`;
      optional `/ci-checks-audit` before tagging remote bots).
- [x] Wire all three skills into the toolkit `package.json` skills catalog
      (`ci-checks-audit`, `ci-checks-setup`, `ci-checks-verify`).

## Vendoring (startup-agnostic)

- [ ] Port the core (default-on) checks from the upstream catalogs into the repo
      under `verb-type-subject` names.
      **Recorded decision (Jidoka):** the catalog inventories all core checks,
      and `/ci-checks-audit` reports the implementation gap. Creating workflow
      files for checks with no real tooling would fabricate passing gates
      (No-Workarounds); actual ports land as real jobs in follow-up changes.
- [x] Catalog the opt-in checks as parameterized, DSL-style conventions in
      `ci-checks.yml` (not shipped enabled) — `opt_in` per phase.
- [x] Keep all generated artifacts vendor-neutral (no client/org/product names;
      grep of vendor-prohibited strings clean on new files).

## Docs

- [x] Add a one-page reference of the 10 phases + invocation order
      (`shared/references/ci/README.md`).
- [x] Update contributor/onboarding notes (`CONTRIBUTING.md`) to point at
      `/ci-checks-setup` (and `/ci-checks-verify`, `/ci-checks-audit`).

## Testing

- [x] BDD spec coverage for `/ci-checks-setup` (SC-4 scenarios) —
      `toolkits/make-no-mistakes-toolkit/tests/ci-checks-setup.bdd.md`.
- [x] Validator unit tests for the naming regex (`--selftest` + shell wrapper).
- [x] Dogfood: run `/ci-checks-setup` on this repo and review the emitted set —
      `toolkits/make-no-mistakes-toolkit/tests/ci-checks-setup-dogfood.md`
      (10 phases walked, core included, 0 opt-in confirmed, gaps reviewed).
