---- MODULE BranchDefault ----
(*
  BranchDefault — determinism of feature-PR base selection under GGT.

  Question: for a feature PR, does the base branch resolve deterministically to
  `develop` (the integration lane), regardless of whether the operator passes an
  explicit --base flag?

  Model:
    - DefaultBranch = 1 means the repo default branch is `develop`.
    - DefaultBranch = 2 means the repo default branch is `main`.
    - flag = whether the operator explicitly passed `--base develop` (TRUE)
      or omitted it (FALSE).
    - base = the resolved PR base: explicit flag wins; otherwise the repo's
      default branch.

  Safety: every feature PR's base is `develop` (1). Run with DefaultBranch = 1
  (expect TLC PASS) and DefaultBranch = 2 (expect a counterexample: with flag =
  FALSE, base resolves to main, i.e. the non-deterministic hazard).
*)
EXTENDS Naturals

CONSTANT DefaultBranch

VARIABLES flag, base

TypeOK == base \in {1, 2} /\ flag \in {FALSE, TRUE}

Init == flag \in {FALSE, TRUE}
        /\ base = IF flag THEN 1 ELSE DefaultBranch

Next == flag' \in {FALSE, TRUE}
        /\ base' = IF flag' THEN 1 ELSE DefaultBranch

Safety == base = 1
====
