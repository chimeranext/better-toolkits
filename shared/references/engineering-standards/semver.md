# SemVer — Semantic Versioning policy (doctrine)

## Purpose

Define how versions are owned and bumped for packaged toolkits/plugins so that
concurrent PRs cannot produce conflicting versions. The mechanics are built for
high-throughput repos (1000+ PRs/week): no human micro-decision per bump.

## Doctrine

1. **Single source of truth:** the version lives only in the plugin manifest
   (e.g. `plugin.json`). `marketplace.json` is a **generated artifact** — it is
   never edited by hand; it is regenerated from the manifests by
   `scripts/ci/marketplace_versioning.py sync`.
2. **Monotonic vs the default branch:** a plugin's version must be **strictly
   greater** than the version on the default branch (`main`) at the moment the
   change lands. It is never compared against other open PRs.
3. **Enforcement point = merge queue:** the check runs on the merged head of the
   queue (`marketplace_versioning.py check --range origin/main..HEAD`): O(1) per
   merge attempt, serialized, global. No pairwise open-PR scan.
4. **Rebase + re-bump mechanics:** when two PRs touch the same plugin, the first
   to land takes the patch. The second rebases onto the new `main` and re-bumps
   (patch+1) so its head satisfies the monotonic rule. This is deterministic and
   requires no human reconciliation.
5. **No local cross-PR gate:** a local hook cannot reliably see other open PRs;
   the default-branch monotonic check inside the queue is the authority.

## Example

```
main: plugin.json 0.1.20 → marketplace generated 0.1.20

PR-A lands → queue head 0.1.21 (> main) → merge → main 0.1.21
PR-B (based on old main) → queue head equals or ≤ 0.1.21 → fails monotonic
  → rebase + re-bump to 0.1.22 → passes → merge
```

## Relation to other standards

- **CvC** (`conventional-commits.md`) defines commit message format, not version
  policy. This standard is the version policy.
- **PCH** / pre-commit hooks run `marketplace_versioning.py sync` (generation)
  and `check` (pre-push per-branch sanity against `main`).
- `scripts/ci/marketplace_versioning.py` implements the mechanics.

## Application

- **Vendored toolkits/plugins:** version in `plugin.json`; never hand-edit
  `marketplace.json`.
- **CI/merge queue:** `check --range origin/main..HEAD` must pass before merge.
- **Agents:** never "resolve" a version conflict by picking a side; bump vs
  `main` (rebase + re-bump).

## Implementation note (better-toolkits, repo-internal)

The generic policy above is separate from better-toolkits' own tooling. The
monorepo implements it with `scripts/ci/marketplace_versioning.py`, wired
**outside** `/opsx-*`:

- pre-commit: `marketplace-version-sync` (generates `marketplace.json` from
  `plugin.json`).
- pre-push: `marketplace-version-check-push` (per-branch sanity vs `main`).
- merge queue: `check --range origin/main..HEAD` on the combined head.

This tool is better-toolkits-specific and not part of the generic standard.
