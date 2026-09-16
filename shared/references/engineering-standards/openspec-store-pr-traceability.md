# OpenSpec store PR traceability (OST)

Portable rule for clients that use an **OpenSpec store** (canonical repo or path
with `openspec/changes/`). Complements [PRDS](prds.md) (one PR per tracker issue)
and [branching-strategy.md](branching-strategy.md) (branch naming).

**Provenance:** Seacrets remediation after specs PR closed without merge while a
change folder was bundled into a sibling PR (SCRT-803 / SCRT-671, 2026-09-16).
Client-specific repo names and URLs belong in the client `AGENTS.md` / docs — not
here.

---

## Chain (mandatory 1:1)

```text
TICKET-N  →  <changesPath>/YYYY-MM-DD-TICKET-N-{slug}/  →  one store PR  →  one merge on store default branch
```

| Layer | Rule |
| --- | --- |
| **Tracker** | One **primary** issue `TICKET-N` owns the change |
| **Change folder** | `YYYY-MM-DD-{TEAM}-{N}-{slug}/` — `{N}` must match that issue (team key uppercase in folder, e.g. `SCRT-803`) |
| **Store repo** | **One PR → one merge commit** on the store default branch (often `main`) **per change folder** |
| **Satellites** | One PR per child issue in app/docs/infra/etc.; link siblings in the description — **never** copy another issue's change folder |

Resolve paths from client config when present:

- `linear-setup.json` → `openspec.changesPath`, `openspec.storeRepo`, `team.key`
- Client `AGENTS.md` → OpenSpec SSOT block

---

## Traceability table (fill per change)

| Tracker | Change folder | Store PR | Store merge |
| --- | --- | --- | --- |
| `TICKET-N` | `<changesPath>/YYYY-MM-DD-TICKET-N-{slug}/` | `#…` on store repo | one commit on default branch |

PR body on the store PR must include `Fixes TICKET-N` (or client-equivalent magic words).

---

## Required

- Open the store PR as soon as a coherent first cut of the change folder exists ([PRDS draft workflow](prds.md#draft-pr-workflow)).
- Branch on the store repo: `*/{issue-id-lowercase}-*` (e.g. `feat/scrt-803-agency-bounded-context-scaffold`).
- Merge (or explicitly abandon in the tracker) **before** closing the store PR.
- Satellite implementation PRs may land on integration branches (`devel`, etc.) **after** or in parallel — but **do not** treat merged app code as a substitute for promoting the decision record on the store default branch.

---

## Forbidden (OpenSpec store)

| Anti-pattern | Why it fails |
| --- | --- |
| Bundling another issue's `<changesPath>/…` folder into a sibling store PR | Breaks audit trail; one merge commit cannot own two tracker issues |
| Closing a store PR **without merge** while the folder is still off the store default branch | Decision record never lands; agents assume "done" from app code alone |
| Canceling the tracker issue while the OpenSpec change is still open | Orphans the folder; reviewers lose the owning `TICKET-N` |
| Assuming satellite code on `devel` (or any integration branch) **replaces** store promotion | Runtime ≠ durable spec; store `main` (or equivalent) is SSOT for changes |
| Reusing a store branch/PR for a **different** `TICKET-N` | Branch automation and folder name no longer match the owner |

When splitting is unavoidable (mechanical move only), document **part 1 of N** in the tracker and keep **one primary `TICKET-N` per change folder** — do not merge two folders in one store PR.

---

## Agent checklist (store PR)

Before `gh pr create --draft` on the **store** repo:

- [ ] Exactly **one** change folder in the diff, and its name includes the primary `TICKET-N`
- [ ] PR title and body include `TICKET-N`; `Fixes TICKET-N` for auto-link
- [ ] No other issue's `openspec/changes/` tree in the same PR
- [ ] `openspec validate --change …` green (when CLI is configured)
- [ ] Satellite PRs (if any) link this store PR URL — they do not duplicate the folder

Before closing or abandoning a store PR:

- [ ] Folder is on the store default branch **or** the tracker issue is explicitly abandoned with human OK

---

## Audit checks (open store PRs)

When auditing with `--focus prds`, `--prs`, or store-specific review:

- [ ] Diff touches at most one `*/openspec/changes/YYYY-MM-DD-*-TICKET-N-*` directory (or configured `changesPath`)
- [ ] Folder `{N}` matches the `Fixes TICKET-N` in the PR body
- [ ] Flag **BLOCK** if two different `TICKET-N` values appear in added change folders
- [ ] Flag **WARN** if PR is closed without merge and folder is not on default branch

---

## Related

- [PRDS](prds.md) — description template, size limits, forbidden bundling cross-repo
- [QA traceability (QT4L)](qa-traceability-four-layers.md) — scenario → verification in `tasks.md`
- Client how-to: `openspec-flow` / `/opsx-propose` → `/opsx-apply` (not duplicated here)
