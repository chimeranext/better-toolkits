# Design — Release Cut standard (REL) + SemVer enforcement per monorepo

## Context

GGT defines the branch model (`develop` integration, `main` trunk) but does not
define **when/how** a `develop`→`main` merge happens. In practice, PRs flow
directly to `main` (12 open today), bypassing the release-cut discipline.
SemVer enforcement exists only in better-toolkits.

## Decision 1 — Release Cut (REL) doctrine

A **release cut** is the moment a coherent set of features leaves `develop` and
enters `main` (PROD). The doctrine:

1. `develop` accumulates features continuously. Gates at the `develop` PR level
   are CI + audit GGT + PRDS (no human approval bottleneck).
2. The **CTO** (release owner) runs the full QA audit (QT4L: Req → automated →
   manual QA → HITL) and freezes `develop`.
3. Exactly **one** consolidated PR opens `develop`→`main` (merge commit, NSQ).
   This PR is the release cut.
4. That PR requires a **second human reviewer** (a founder, e.g. vcv506). This
   is the single human-approval gate to PROD. No per-feature human review is
   required.
5. Hotfixes to `main` flow only via `hotfix/*` branches (own mini-gate,
   bypassing `develop`), per branching-strategy.
6. The cut carries a SemVer version (`release/1.4.0`). Its artifacts pass
   checksum verification (CHH).

## Decision 2 — SemVer enforcement per monorepo

Today `marketplace_versioning.py check --range origin/main..HEAD` runs only in
better-toolkits. Generalize: every consumer monorepo SHALL enforce a monotonic
version gate on the `develop`→`main` merge (release cut). The version source is
the repo's canonical manifest. The better-toolkits implementation remains the
reference implementation. Other repos wire their own equivalent.

## Decision 3 — Reindexing

- README index becomes 18 practices (add REL). Exact position is decided by
  TLA+ adoption order.
- Flowchart adds REL node.
- Internal-handbook index mirrors the numbering.
- TLA+ adoption-order model adds REL, re-runs TLC, and PASS is required.

## Out of scope

- Migrating existing PRs. Creating `develop` in better-toolkits. Deploying CI
  gates (apply step, not this standard).

## Open questions

- Exact adoption-order position of REL (resolved by TLA+ edges).
