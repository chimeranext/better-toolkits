# Spec — Release Cut (REL) standard

## Overview

Defines when and how `develop`→`main` (release cut) happens, the QA ownership,
and the single human-approval gate to PROD. Complements GGT (branch model) and
MPH (protection/HITL) with the *release moment* doctrine.

## Requirements

### REL-1: Release cut definition
- A release cut is exactly one consolidated PR from `develop` to `main`
  (merge commit. NSQ).
- The cut is the only path by which feature work enters `main`.

### REL-2: QA ownership
- The CTO (release owner) runs the full QA audit (QT4L) before opening the cut.
- Per-feature human review is not required at the `develop` level. CI + audit
  GGT + PRDS gates apply there.

### REL-3: Human-approval gate
- The release-cut PR requires a second human reviewer (a founder).
- No other human approval is needed to reach PROD.

### REL-4: Hotfixes
- Direct-to-`main` changes only via `hotfix/*` branches with their own
  mini-gate. They bypass `develop`.

### REL-5: Versioning + checksums
- The cut carries a SemVer version (`release/<version>`).
- Release artifacts pass checksum verification (CHH) before promotion.

## Acceptance tests (BDD)

- Given 12 feature PRs merged into `develop`, when the CTO runs the QA audit,
  then exactly one `develop`→`main` PR exists with a second human reviewer.
- Given a hotfix, then it targets `main` directly via `hotfix/*` and does not
  wait on `develop`.
- Given a release cut, then the merge is a merge commit (never squash) and the
  version is monotonic vs `main`.
