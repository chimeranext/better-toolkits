# Proposal — Release Cut standard (REL) + SemVer enforcement per monorepo

**Change:** `2026-10-31-release-cut-rel`
**Domain:** `area:meta`
**Status:** Proposed
**Date:** 2026-10-31

## What we will build

1. **`release-cut.md` engineering standard (REL)** — doctrine for cutting a
   release. Features accumulate on `develop`. The CTO runs the full QA audit and
   opens **one** consolidated PR `develop`→`main` (the release cut). This PR is
   the single human-approval gate to PROD (second human reviewer, e.g. a
   founder). Hotfixes to `main` flow only via `hotfix/*` with their own
   mini-gate.
2. **SemVer enforcement per monorepo** — generalize the monotonic version gate
   (today only in better-toolkits) to every consumer monorepo as a merge gate on
   `develop`→`main`.
3. **Reindex** the standards index (README + internal-handbook) by Adoption
   Order, adding REL. Re-run the TLA+ adoption-order model (TLC).

## Why now

- The current state has 12 open PRs targeting `main` directly. There is no
  `develop` and no release-cut process. The trunk accumulates feature-by-feature
  instead of cutting consolidated releases.
- SemVer enforcement exists only in better-toolkits. It is "better-toolkits-
  specific and not part of the generic standard". Consumer repos have no version
  gate.
- Risks: unbounded per-PR human review load on founders, no consolidated QA
  gate, version collisions on release.

## Success criteria

- [ ] `release-cut.md` exists and is indexed (README + internal-handbook).
- [ ] `semver.md` documents per-monorepo enforcement (generalized, not
      better-toolkits-only).
- [ ] Adoption-order TLA+ model updated and passes TLC with REL.
- [ ] Internal-handbook learners page covers the CTO-as-QA-owner model.
- [ ] `main-protections-hitl.md` (MPH) reflects: second human reviewer only at
      the release cut. CTO owns QA audit.

## Out of scope

- Migrating the 12 existing PRs away from `main` (separate GGT-apply change).
- Creating `develop` in better-toolkits (separate change).
- Deploying SemVer CI gates to each consumer repo. This change standardizes.
  Per-repo wiring is an apply step.
