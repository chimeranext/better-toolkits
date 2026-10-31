# REL — Release Cut (doctrina)

## Purpose

Standardize the **moment** a coherent set of features leaves `develop` and
enters `main` (PROD). GGT defines the branch model. REL defines the release
event, the QA ownership, and the single human-approval gate to PROD.

## Doctrine

1. The release cut is one consolidated PR from `develop` to `main` (merge
   commit, NSQ). It is the only path by which feature work enters `main`.
2. Before opening the cut, the CTO (release owner) runs the full QA audit
   (QT4L). The CTO freezes `develop`.
3. No per-feature human review happens at the `develop` level. Gates there are
   CI + audit GGT + PRDS. Human approval concentrates at the cut.
4. The cut requires a second human reviewer (a founder, e.g. vcv506). This is
   the single human-approval gate to PROD.
5. Hotfixes to `main` go only via `hotfix/*` branches (their own mini-gate,
   bypassing `develop`), per branching-strategy.
6. The cut carries a SemVer version (`release/<version>`). Its artifacts pass
   checksum verification (CHH) before promotion.

## Why

- Without a cut doctrine, PRs flow directly to `main` (observed: 12 open PRs),
  loading founders with per-PR review and bypassing consolidated QA.
- Concentrating human approval at the cut keeps HITL fail-closed (MPH) while
  keeping `develop` frictionless.

## Application (generic)

- `develop` accumulates features. Gates are CI + audit GGT + PRDS.
- Release cut: CTO runs QA audit → opens ONE `develop`→`main` PR (merge commit)
  → second human reviewer approves → SemVer bump → promote.
- Hotfix: `hotfix/*` → `main` directly (mini-gate), never through `develop`.

## References

- **GGT** (branch model: `develop`→`main` merge commit). **MPH** (fail-closed
  HITL). **QT4L** (QA layers). **SemVer** (version policy). **NSQ** (merge
  method). **CHH** (checksums). **BrS** (branching, `release`/`hotfix`).
- Learner summary: internal-handbook `docs/how-to/engineering-standards/REL.md`.
