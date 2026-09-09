# Pull Request Description Standards (PRDS)

Protocol SSOT for **how** a pull request is described and **how large** it should be so a human reviewer can approve confidently.

PRDS is the fourth **clean code** practice alongside DSMS, IFS, and CPS. It complements [branching-strategy.md](branching-strategy.md) (BrS) and [qa-traceability-four-layers.md](qa-traceability-four-layers.md) (QT4L).

## Purpose

Client pull requests are **human-in-the-loop (HITL)**. A reviewer must understand the change, trust the test plan, and spot scope creep without re-reading every line of a giant diff.

| Role | Default (configure in client `AGENTS.md`) |
| --- | --- |
| Assignee | Primary engineer or tech lead for the repo |
| Reviewer | Who must OK before merge |
| Merge | Only after explicit human OK — agents never `gh pr merge --admin` unless asked |

**Agents and subagents** must make review easy: scoped diffs, explicit descriptions, evidence for UI, and links to the owning tracker issue. The PR description is part of the deliverable — not an afterthought.

---

## Description template

Copy into every PR body (or mirror in `.github/PULL_REQUEST_TEMPLATE.md`). Fill every section; use `N/A` only when a section truly does not apply.

```markdown
## Summary

- What changed (outcome, not file list)
- Why now (problem, ticket, or spec link)
- How (1–2 sentences on approach — only where the diff is not obvious)
- (optional) 4th bullet for rollout, flags, or follow-ups

## Tracker

Fixes TICKET-N

- Issue: <url>
- OpenSpec (if any): `openspec/changes/YYYY-MM-DD-slug/`
- Cross-repo siblings (if any): link other PR URLs here

## Test plan

- [ ] …
- [ ] …

## Scope boundaries (out of scope)

- Explicitly list what this PR does **not** change (no drive-by refactors, no unrelated fixes).

## Risk / rollout

- Migrations, GitOps digest, feature flags, breaking API, or prod-only config — or `N/A`.

## Screenshots / evidence

- UI: before/after or Storybook capture
- Ops: CI link, plan summary, or log snippet — or `N/A`
```

### Section notes

| Section | Required when |
| --- | --- |
| **Summary** | Always — 2–4 bullets; lead with **what** and **why** |
| **Tracker** | Always — `Fixes TICKET-N` (or `Closes` / `Resolves`) for auto-link |
| **Test plan** | Always — checkboxes reviewers can tick; name commands or environments |
| **Scope boundaries** | Always — prevents surprise files in the diff |
| **Risk / rollout** | When deploy, schema, infra, or user-visible behavior changes |
| **Screenshots / evidence** | UI, design-system, or hard-to-verify backend/infra changes |

**Title:** `<type>(<scope>): <outcome> (TICKET-N)` — not `Fix bug` or `WIP updates`.

**Branch:** `type/ticket-n-slug` (lowercase ticket id). Prefer the tracker’s suggested branch name when available.

---

## Size and scope limits

These limits keep a single human review pass to roughly **15–30 minutes**. If you expect longer, **split the PR** before opening it.

| Rule | Guidance |
| --- | --- |
| One primary tracker issue | One PR per child issue when possible (1:1) |
| Soft size cap | ~**400 lines changed** (additions + deletions) — split if larger |
| Review time target | ~15–30 min on a focused diff |
| No drive-by refactors | Formatting, renames, or cleanup belong in their own PR |
| One intent per PR | Single responsibility — one feature, fix, or doc slice |
| Cross-repo epics | **Separate PR per repo**; link sibling PRs in each description |
| Layer split (default order) | specs → UI/library → app (or docs → gitops → infra) |
| Vertical slice | Prefer end-to-end slice over horizontal “all controllers” dumps |

### When to split

- Diff exceeds ~400 lines **or** touches unrelated domains.
- Mixed **decision record** (OpenSpec) and **implementation** — ship spec PR first unless trivial.
- **DSMS/IFS/CPS** adoption: do not mix a large folder reorg with feature work without a documented cutover plan ([dsms-ifs-cps.md](dsms-ifs-cps.md)).
- Reviewer would need a walkthrough meeting — split or add a design doc link instead of one mega-diff.

### Allowed exceptions

- Mechanical codegen, lockfile-only, or import-path moves **if** the description states that and the test plan is “CI green only”.
- Follow-up PRs marked **part 1 of N** with the same `TICKET-N` only when acceptance criteria are intentionally phased (note in the tracker).

---

## Draft PR workflow

Reviewable work lands in the **owning repo** as a **draft** GitHub PR — not chat paste only.

| Step | Practice |
| --- | --- |
| 1 | Isolated **git worktree** per issue/agent when possible |
| 2 | `gh pr create --draft` as soon as a coherent first cut exists |
| 3 | **Progressive commits** — push incremental commits; do not hoard locally |
| 4 | Assignee/reviewer per client `AGENTS.md` |
| 5 | Undraft / ready-for-review **only after human OK** (or explicit ask) |
| 6 | Ping review channel when ready (Slack/Teams per client playbook) |

---

## Agent checklist (before `gh pr create --draft`)

- [ ] Branch matches `type/ticket-n-slug`; title and body include **TICKET-N**
- [ ] Body uses the [description template](#description-template) (all sections)
- [ ] `Fixes TICKET-N` (or equivalent) for tracker auto-link
- [ ] Test plan lists concrete steps; UI PR includes screenshots/evidence
- [ ] **Scope boundaries** list what is intentionally out
- [ ] Diff is reviewable (~≤400 lines, one intent, no drive-by refactors)
- [ ] Cross-repo work: this repo only; sibling PRs linked in body
- [ ] Commits pushed from the worktree cwd; not only local uncommitted work
- [ ] DSMS/IFS/CPS checklists satisfied when touching structure/barrels ([dsms-ifs-cps.md](dsms-ifs-cps.md))

---

## Audit checks (open PRs)

When auditing with `--focus prds` or `--prs`:

- [ ] Title follows `<type>(<scope>): outcome (TICKET-N)`
- [ ] Body has Summary, Tracker, Test plan, Scope boundaries (minimum)
- [ ] Soft cap ~400 lines; flag mega-diffs
- [ ] One intent — no unrelated file churn
- [ ] Draft workflow respected (undraft only when checks green + human OK)
