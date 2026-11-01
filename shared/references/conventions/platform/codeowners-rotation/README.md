# convention: codeowners-rotation
id: codeowners-rotation · version: 0.1.0 · status: draft · level: platform
extracted_at: 2026-10-31 · ttl_expires: 2027-04-30
parent: none

## GOAL

A `.github/CODEOWNERS` (or `CODEOWNERS`) file that is "well written" under this
record has no dead rules: every pattern matches at least one tracked file.

## SOURCES

| # | kind | ref (ID + versión/fecha) | weight | purpose |
|---|------|--------------------------|--------|----------|
| S1 | repo | CODEOWNERS rotation incident (a typo'd pattern stayed inert and invisible) | load-bearing | motivation for the check |
| S2 | repo | `git ls-files` as the corpus of tracked files | load-bearing | basis for matching |
| S3 | repo | git wildmatch semantics (reference for deep matching) | context | real basis for the check |

## RULES

- R1 [pipe-discipline] Every pattern in CODEOWNERS MUST match ≥1 tracked file
  → S2
- R2 [pipe-discipline] A dead pattern (0 matches) is a defect and MUST be
  reported as an error, not a warning → S1
- R3 [pipe-discipline] Typo'd patterns (renamed or misspelled path) are detected
  as dead, not as "coverage" → S1, S2
- R4 [pipe-discipline] If matching is shallow (glob), the repo MUST explicitly
  decide whether it needs sandbox matching (`git check-ignore` in an empty repo)
  for large repos with complex `.gitignore` files → S3

## COUNTEREXAMPLES

```text
# ❌ wrong: pattern that matches nothing (rest of file intact)
infrastructure/terraform/**/removed-path/ @org/founders

# ✅ right: pattern that matches existing files
infrastructure/terraform/** @org/founders
```

## GATES

- local: `node scripts/check-codeowners-rotation.mjs` (exit 0) + `git ls-files`
- CI: `pull_request` trigger (path-filtered to CODEOWNERS) + daily `schedule`
  (to catch rot that happens when other files move)

## LESSONS

- L1: A dead rule is worse than a missing one: it makes the file APPEAR
  covered, so nobody notices it. → RULE R2
- L2: Rot happens when OTHER files move, not when CODEOWNERS is edited — so the
  `schedule` trigger is necessary. → RULE R2

## RECEIPT

<!-- candidate_sha + risk tier + lenses + verdict — emitted in the dogfood of
     check-codeowners-rotation.mjs.tpl -->
