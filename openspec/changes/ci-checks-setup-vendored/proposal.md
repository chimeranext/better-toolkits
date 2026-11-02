# Proposal — `ci-checks-setup` (vendored CI checks, phase-gated)

## Problem

The current CI surface in better-toolkits has three defects:

1. **Monolithic `scan`** — `skillspector.yml` runs one job named `scan` that
   bundles the whole security scan; failures are not granular or diagnosable.
2. **Generic/duplicated check names** — `skills-catalog-check.yml` names its job
   `check` and triggers on both `push` and `pull_request`, producing multiple
   identical `check` runs on the same PR.
3. **No catalog of checks** — there is no single, ordered list of CI checks to
   compare against, so gaps (missing checks that upstream repos already have) are
   invisible.

Separately, upstream ecosystems already vendor a large set of CI checks that we
do not have — two independent upstream vendor catalogs (one toolkit monorepo and
one app fleet) provide ~30 and ~50 workflows respectively. We should incorporate
them as **startup-agnostic** building blocks, not re-invent them.

## Scope

- Establish a **canonical catalog** of CI checks grouped into 10 logical phases
  with a defined invocation order.
- Mark each check as **core** (startup-agnostic, default-on) or **opinionated
  opt-in** (DSL-style, parameterized for specific stacks; enabled only on request).
- Provide a new skill **`/ci-checks-setup`** that walks phases 1–10 and asks the
  user, per phase, whether to enable the opt-in checks of that phase.
- Fix the current defects: split `scan`; give checks meaningful names; remove
  the duplicate `check` runs.

## Non-goals

- Not implementing the bespoke runtime behavior or business state of any single
  deployed application. The opt-in CI checks are **DSL-style conventions** —
  declarative, reusable, and parameterized — and are in scope as such.
- Not changing the `main-founders-only` ruleset.

## Why now

We are mid-way through merging the open PR queue. The CI surface is the gate
every PR crosses; making it named, ordered, and complete is the prerequisite for
the remaining merges and for onboarding apprentices.
