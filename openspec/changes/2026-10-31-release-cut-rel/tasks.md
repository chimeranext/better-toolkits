# Tasks — Release Cut (REL) standard

## T1 — Create the REL standard
- [ ] Write `shared/references/engineering-standards/release-cut.md` (doctrine)
      with REL-1..REL-5.
- [ ] STE-lint 0 hard.

## T2 — Update MPH for the new approval model
- [ ] In `main-protections-hitl.md`, state: second human reviewer ONLY at the
      release cut. CTO owns the QA audit (no per-feature founder review).

## T3 — Generalize SemVer enforcement
- [ ] Update `semver.md`: enforcement applies per consumer monorepo at the
      `develop`→`main` merge. Better-toolkits remains the reference
      implementation.

## T4 — Reindex by Adoption Order (README + handbook)
- [ ] Add REL to README index (18 practices) + flowchart node.
- [ ] Mirror in internal-handbook `engineering-standards/index.md`.
- [ ] Add CTO-as-QA-owner learner note in internal-handbook.
- [ ] Create internal-handbook learner pages for TFM + REL (fix broken links).

## T5 — TLA+ adoption order validation
- [ ] Add REL to `scripts/tla/adoption-order/AdoptionOrder.tla` (ORD + edges).
- [ ] Re-run TLC. PASS required.

## T6 — Verify
- [ ] STE-lint 0 new hard on all edited markdown.
- [ ] `git diff` shows only intended changes.
