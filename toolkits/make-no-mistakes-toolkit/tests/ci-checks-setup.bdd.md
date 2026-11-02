# BDD coverage — `/ci-checks-setup` (spec SC-4)

Behavior contract from `openspec/changes/ci-checks-setup-vendored/specs/ci-checks-setup/spec.md`
(SC-4: Phase walk with opt-in prompts). Given/When/Then scenarios in natural
language, with the observable evidence each scenario requires.

---

## Scenario SC-4.1 — Catalog exists and carries the phase model

- **Given** the canonical catalog `shared/references/ci/ci-checks.yml`
- **When** it is read
- **Then** it lists 10 phases in order (numbers 1→10)
- **And** each check has a `verb-type-subject` name
- **And** each check is marked core or opt-in

*Evidence:* `phases` array length == 10 and ordered by `number`; every entry in
`core`/`opt_in` matches `scripts/ci/check-ci-naming.py` (strict), except the
recorded legacy `scan-security`/`scan-static`. Verified by the catalog validator;
(see `scripts/ci/check-ci-naming.py --selftest`).

## Scenario SC-4.2 — Phase walk with opt-in prompts

- **Given** a repository and the canonical catalog
- **When** `/ci-checks-setup` runs
- **Then** it visits phases 1→10 in order
- **And** in each phase it lists the core checks
- **And** it asks about that phase's opt-in checks
- **And** it emits only the confirmed opt-in checks, in phase order

*Evidence:* the emitted manifest (`ci-checks-manifest.yml`) contains every phase
number exactly once in ascending order; each phase lists its `core` checks in
full; `omitted_opt_in` records refusals; no unconfirmed opt-in appears in
`checks`. Reproduced by the dogfood run (`ci-checks-setup-dogfood.md`).

## Scenario SC-4.3 — Names are meaningful and parsable

- **Given** a check name
- **When** it is validated
- **Then** it matches the `verb-type-subject` pattern
- **And** it is not `check` or `scan`

*Evidence:* `scripts/ci/check-ci-naming.py --selftest` (strict regex; rejects
bare `check`/`scan`, non-verb prefixes, uppercase, and 2-segment names except
the recorded legacy pair).

## Scenario SC-4.4 — One run per logical check

- **Given** a PR head
- **When** CI evaluates its checks
- **Then** each logical check appears exactly once per head

*Evidence:* workflow trigger sets scope `push` to the default branch and rely on
`pull_request` for PR heads, plus `concurrency`/`cancel-in-progress` (see
`.github/workflows/skills-catalog-check.yml`). `/ci-checks-audit` flags any job
whose trigger set could double-run the same head.
