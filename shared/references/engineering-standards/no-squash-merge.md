# NSQ — No-Squash Merge (doctrina)

## Purpose

Prohibit squash merges repo-wide and standardize the repository merge settings:
`allow_squash_merge: false` in **every** repository of the portfolio. Merge
commits and rebase merges remain allowed.

## Doctrine

1. Every repo SHALL set `allow_squash_merge: false` and `allow_merge_commit: true`
   and `allow_rebase_merge: true`.
2. Rulesets on protected branches SHALL keep `allowed_merge_methods` excluding
   `squash` (e.g. `merge`, `rebase`).
3. The tool-use guard "no-squash" SHALL block any `--squash` invocation at the
   local harness level (before execution).
4. Rationale: squash collapses per-commit review history; linear history must be
   preserved for audit/bisect.

## Apply

- API: `PATCH /repos/{owner}/{repo}` with
  `allow_squash_merge=false`, `allow_merge_commit=true`, `allow_rebase_merge=true`.
- Replicate across every monorepo of the portfolio (seed: better-toolkits).

## References

- `shared/hooks/no-squash` — guard implementation.
- `main-protections-hitl.md` — ruleset doctrine.
