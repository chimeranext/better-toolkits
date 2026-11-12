# ci-checks-setup Specification

## Purpose
TBD - created by archiving change ci-checks-setup-vendored. Update Purpose after archive.

## Requirements

### Requirement: Canonical catalog (10 phases)

The repository SHALL maintain a canonical catalog of CI checks, grouped into 10
ordered phases with a defined invocation order. Each check SHALL have a canonical
name in the form `verb-type-subject` and SHALL be classified either **core**
(startup-agnostic, default-on) or **opinionated opt-in** (DSL-style,
parameterized, enabled on request).

#### Scenario: Catalog exists and carries the phase model

- Given the canonical catalog
- When it is read
- Then it lists 10 phases in order
- And each check has a `verb-type-subject` name
- And each check is marked core or opt-in

### Requirement: Naming convention

No check SHALL be named just `check` or `scan`. Every check name SHALL match
`verb-type-subject` (e.g. `scan-security-dependencies`, `enforce-pr-size`,
`deploy-migrations`).

#### Scenario: Names are meaningful and parsable

- Given a check name
- When it is validated
- Then it matches the `verb-type-subject` pattern
- And it is not `check` or `scan`

### Requirement: No duplicate check-runs

A single PR head SHALL NOT produce duplicate check-runs for the same logical
check. Trigger sets SHALL be chosen so that `push` and `pull_request` do not
double-run the same check.

#### Scenario: One run per logical check

- Given a PR head
- When CI evaluates its checks
- Then each logical check appears exactly once per head

### Requirement: Split the monolithic scan

The monolithic `scan` check SHALL be split into the phase-2 named checks:
`scan-security`, `verify-sbom`, `audit-dependencies`, `scan-static`.

#### Scenario: Named security checks

- Given the security phase
- When `scan` is evaluated
- Then it is reported as four distinct named checks
- And none is a monolithic `scan`

### Requirement: `/ci-checks-setup` skill

The skill SHALL visit phases 1→10 in order; in each phase it SHALL report the
core checks (always included) and ask whether to enable that phase's opt-in
checks. It SHALL emit a workflow set reflecting exactly the confirmed opt-in
selections, in phase order, and SHALL never enable an unconfirmed opt-in check.

#### Scenario: Phase walk with opt-in prompts

- Given a repository and the canonical catalog
- When `/ci-checks-setup` runs
- Then it visits phases 1→10 in order
- And in each phase it lists the core checks
- And it asks about that phase's opt-in checks
- And it emits only the confirmed opt-in checks, in phase order

### Requirement: Vendor-neutrality

No check name or generated artifact SHALL reference a specific vendor, client
organization, or proprietary product. Opt-in check bodies SHALL be parameterized
conventions, not hard-bound to a single product.

#### Scenario: Neutral output

- Given the generated workflow set
- When it is inspected
- Then no name or step references a vendor, client, or product
- And opt-in bodies are parameterized per stack

### Requirement: `/ci-checks-verify` — diagnose check failures

The `/ci-checks-verify` command SHALL, given a failing check name, resolve it in
the canonical catalog and run the real check (or report how to), then return the
cause and ranked actionables — consistent with the `/explain` behavior for CI
failures.

#### Scenario: Diagnose a failing check

- Given a failing check name
- When `/ci-checks-verify` runs
- Then it locates the check in the catalog
- And it reports the cause
- And it returns ranked actionables

### Requirement: `/ci-checks-audit` — audit CI config against catalog

The `/ci-checks-audit` command SHALL compare the repository's actual workflow
jobs against the canonical catalog (core vs opt-in) and report: missing
required checks, extra/unnamed checks, duplicate runs, and naming violations.

#### Scenario: Audit produces a gap report

- Given the repository's workflows and the catalog
- When `/ci-checks-audit` runs
- Then it lists missing core checks
- And it lists extra or misnamed checks
- And it flags duplicate check-runs

### Requirement: RTR protocol CI-check awareness

The `/ready-to-review-mergeable` protocol SHALL be aware of the `/ci-checks`
family: when a required CI check fails, it SHALL route diagnosis through
`/ci-checks-verify <failing-check>` (cause + actionables) and SHALL NOT paper
over the failure; before tagging remote bots it MAY use `/ci-checks-audit` to
confirm the workflow set matches the canonical catalog.

#### Scenario: Failing check is diagnosed via the catalog

- Given a PR with a failing required check
- When `/ready-to-review-mergeable` runs
- Then it diagnoses the failure with `/ci-checks-verify`
- And it does not proceed to §5 while the required check is red
