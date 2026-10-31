# Linear / OPSX Playbook — protocol SSOT

Portable, harness-agnostic workflow for **Linear + OpenSpec OPSX** on a GitFlow
application monorepo. Corrects the sequence shown in client playbooks
(e.g. AltruPets `docs/playbooks/linear-ops-playbook.md`), where the merge step
incorrectly targets `main` instead of `develop`.

The OpenSpec step commands are thin entries; their detailed SSOT lives in
[`references/opsx-*`](../opsx-*/protocol.md). This playbook only wires the
**order** and the **GitFlow base**, plus the parity rule.

---

## Environment model

| Branch | Role | Merge gate |
| --- | --- | --- |
| `develop` | Dev / integration (default for features) | PR recommended; no manual approval gate |
| `staging` | Staging | PR only (port from `develop`) |
| `main` | Production | PR only + manual approval gate |

Feature branches are created **from `develop`**, never from `main`. Merging a
ready feature to `develop` is an automated step and does **not** require a
human-in-the-loop approval. The manual HITL gate applies only to `main`
(production).

## Parity (mandatory)

```text
1 issue = 1 branch = 1 worktree = 1 PR
```

The sequence is the *order of appearance* of each artifact, not a suggestion.

## Sequence

| # | Step | Creates / acts on | Mandatory |
| --- | --- | --- | --- |
| 1 | **Tracker** — create the primary issue (`#N` / Linear `TICKET-N`) | issue | yes |
| 2 | **Feature branch from `develop`** — `feat/{issue}-{slug}` | branch | yes |
| 3 | **`/opsx-explore`** — clarify requirements before proposing | none | yes |
| 4 | **Open draft PR** — `gh pr create --draft` with `Fixes #N` | PR | yes |
| 5 | **`/opsx-propose`** — proposal + design + specs + tasks | change artifacts | yes |
| 6 | **Change folder + intermediate commit** — `openspec/changes/YYYY-MM-DD-{TEAM}-{N}-{slug}/` | OpenSpec folder | yes |
| 7 | **`/opsx-apply`** — implement with discipline | code | yes |
| 8 | **Isolated worktree** — `.agents/worktrees/<slug>`, from a clean base | worktree | yes |
| 9 | **Per change: intermediate commits** — push each to the same branch/PR | commits | yes |
| 10 | **`/ready-to-review-mergeable`** — dogfood proof gate | gate | yes |

After step 10 the feature is mergeable to `develop` **without** asking the user
for HITL approval. `main` still requires the manual approval gate.

## Corrections vs. the AltruPets playbook

| AltruPets playbook (as-is) | Corrected |
| --- | --- |
| Feature/PR merged to `main` (section 05 step 7) | Feature merged to `develop`; `main` only via `develop → staging → main` with manual gate |
| Worktree not sequenced into the OpenSpec flow | Worktree is created at `/opsx-apply` (step 8), not at the start |
| Draft PR not shown as an early step | Draft PR opened right after `/opsx-explore` (step 4), before propose |

## Related

- [OST](../../../../shared/references/engineering-standards/openspec-store-pr-traceability.md) — one store PR per change folder, merge on the store default branch (here `develop`).
- [BrS](../../../../shared/references/engineering-standards/branching-strategy.md) — Environment Branching / GitFlow; `develop` is the dev default.
- [PRDS](../../../../shared/references/engineering-standards/prds.md) — draft-PR workflow; push every intermediate commit to the draft PR.
- `_/opsx-*` — OpenSpec step protocol SSOT.
- `/dogfood` — proof gate before `/ready-to-review-mergeable`.
