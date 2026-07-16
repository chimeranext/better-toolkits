---
description: "Drive issues to bot-approved, mergeable PRs (confidence-gated reviewer loop) — or, with no issue IDs, leave the current branch PR-ready. Never merges."
argument-hint: "<ISSUE-123 [ISSUE-456 ...]> [--confidence 4.0] | [overrides / upstream PR URLs]"
priority: 85
---

# /ready-to-review-mergeable: $ARGUMENTS

Two modes, one invariant: **never merge**.

- **Issue-pipeline mode** (primary — any issue IDs in `$ARGUMENTS`): implement
  each tracker issue to a **bot-approved, mergeable PR** and refuse to stop
  until every PR is green at the confidence threshold.
- **Branch-ready mode** (fallback — no issue IDs): prepare the **current git
  work** so a human can review and merge it (CI green where fixable in-scope,
  pushed, PR open/updated, not draft).

The user input can be provided directly by the agent or as a command argument —
you MUST consider it before proceeding (if not empty).

---

## Mode 1 — Issue pipeline (current behavior when issue IDs are present)

### Parse arguments

- Issue IDs: every `<TEAM>-<number>` token in `$ARGUMENTS` (one PR per issue).
- Threshold: `--confidence X.X` if present, else **5.0** (default) — exigent by
  default.
  - `--confidence` is the **relaxer**: pass a lower value to accept the review
    bot's strict curve. **Usage guidance:** a strict reviewer bot typically
    scores genuinely mergeable PRs `4.20`–`4.80`, so the default `5.0` gate
    will keep iterating on cosmetic findings. If you don't want that, pass
    `--confidence 4.0`. Never silently raise the threshold above what the
    caller asked for.

### Run the pipeline

Invoke the **`make-no-mistakes:implement`** skill with the parsed issue IDs.
That skill owns the disciplined flow and you must let it:

- one worktree + one branch per issue (worktree isolation),
- the reviewer loop,
- **HITL on push / PR / merge** per the repo's non-negotiables (never
  auto-push, auto-open, or auto-merge without the per-action approval the repo
  requires).

### Tracker hygiene (per issue)

Keep every issue out of the team's orphan views (unassigned / no-project /
no-priority) and in sync with the pipeline. These are steps **for you**, not
the Stop hook.

**On start:** read the issue via the tracker MCP; backfill missing **project**
(inherit parent's / infer from area), **assignee** (the invoker), **priority**
(inherit parent's, else Medium). Report which fields you set. Flip **state →
"In Progress"** as you begin.

**On reaching the goal (PR hits the threshold):** flip **state → "In Review"**.
**Never set "Done"** — that is always the PO's HITL call.

**Verify, don't assume:** some tracker MCPs silently no-op certain field writes
(observed: Linear `state`/`assignee` writes with unchanged `updatedAt`). After
every state/assignee write, re-read the issue and compare. If it did not apply,
collect `issue → target value` into a **"manual flips pending"** list and
surface it explicitly in the final report.

### Per-PR contract

1. **Ready for Review**, never Draft — unless the repo's rules require Draft
   for that class of change (e.g. cross-cutting/cross-pillar); don't tag the
   review bot on a Draft.
2. Trigger the review bot per the repo's convention (e.g. comment
   `@<review-bot> review`).
3. **Append the PR number** to `.claude/.implement-prs`. Create the file if
   missing; its **first line is the threshold** (write it once, before the
   first PR number). This file is the Stop-hook's state — keep it accurate.

### Exit condition (the whole point)

You are **not done** until *every* PR listed in `.claude/.implement-prs` is:

- not a Draft, **and**
- has a review from the repo's **review bot** — read the verdict from the PR's
  **`.reviews[*]`**, never `.comments[*]`, and beware login-suffix mismatches
  (a bot may appear without the `[bot]` suffix in reviews) — whose state is
  **APPROVED**, **and**
- carries **Confidence ≥ threshold** (the review body has
  `Confidence: X.XX/5.00`).

If any PR's confidence is below threshold: read the bot's findings, fix them,
push, re-trigger the review, and iterate. **Do not lower the bar.**

The `stop-prs-green.sh` Stop hook enforces this — it blocks the session from
ending while `.claude/.implement-prs` lists any PR that is draft, unreviewed,
not APPROVED, or below threshold.

### On success

1. Delete `.claude/.implement-prs` (the hook also clears it once everything is
   green, but delete it explicitly when you finish).
2. Report a table, one row per issue: **Issue → PR → Confidence → tracker
   state**, marking each state flip **applied** (verified by re-read) or
   **PENDING-MANUAL** (the MCP no-op'd the write). End with the explicit
   "manual flips pending" list — `issue → target state` — so the user can flip
   by hand.

---

## Mode 2 — Branch-ready (no issue IDs in `$ARGUMENTS`)

**Input**: `$ARGUMENTS` — optional overrides (e.g. `status=draft`, skip-push, upstream PR URLs for chain, tracker IDs). Empty = apply defaults below.

**Output**: PR URL(s), mergeability / remaining failing checks, and the next human action. No merge.

### Defaults (do not re-ask unless `$ARGUMENTS` overrides)

1. **Diátaxis `status`:** when the change set includes docs that use YAML front matter with a Diátaxis schema, set `status: review` on pages meant for review (not `draft`, not invalid values like `active`). Allowed enum when the repo enforces it: `draft` | `review` | `accepted` | `deprecated`.
2. **Push:** after local fixes and commit(s), `git push -u origin HEAD` (or push to the existing PR branch).
3. **No merge:** never merge the PR; never mark tracker issues Done unless `$ARGUMENTS` explicitly asks in this invocation.
4. **No draft:** if a PR exists and is draft, mark it ready (`gh pr ready`) unless `$ARGUMENTS` says keep-draft.

### Execution steps

#### 1. Context

Identify:
- repo root and remote (`gh repo view`)
- current branch
- whether a PR already exists (`gh pr view` / `gh pr list --head "$(git branch --show-current)"`)
- base branch (`main` unless the branch tracks another base)

#### 2. Diff

Diff vs base. List changed files. Decide which validators apply.

#### 3. Docs / Diátaxis (when applicable)

If this repo (or the diff) includes Diátaxis-style markdown with required YAML front matter:

- Set `status: review` on **changed** doc pages intended for publication/review.
- Respect repo exemptions (do **not** invent front matter for meta files). Common patterns: `AGENTS.md`, `openspec/`, `templates/`, `archive/`, root `README.md` / `MAINTENANCE.md` / `index.md`, and any paths listed in the repo's front-matter checker / pre-commit `exclude`.
- Run the validators CI runs (`pre-commit`, `npm run check:front-matter`, markdownlint with `--fix` as configured). Commit autofixes.

If the repo has no Diátaxis front-matter schema, skip this step (do not invent a schema).

#### 4. Non-docs repos

Run the **minimal CI-equivalent checks** for the change set (e.g. `terraform validate`, lint, unit tests, gitops validate). Fix failures that are clearly in scope of this branch.

If a check fails due to **repo-wide misconfiguration unrelated to the change set** (wrong cache path, missing sibling checkout, org secrets), report it explicitly as out-of-scope and continue — do not silently claim mergeable.

#### 5. Commit

If there are uncommitted fixes, create a conventional commit focused on **why** (CI / ready-for-review), not a file laundry list.

#### 6. Push

Push the branch (`git push -u origin HEAD` or update the existing PR remote). Push is the default; only skip if `$ARGUMENTS` says so.

#### 7. PR create / update

- If no PR: `gh pr create` with Summary, Test plan, and chain links when applicable.
- If PR exists: ensure **not draft** (`gh pr ready`); update body with chain links if missing.
- Chain / stack (when `$ARGUMENTS` or session context lists upstream PRs / tracker blockers):
  - Put `Depends on: <url>` in the PR body.
  - Set the tracker's `blockedBy` when the issue graph requires it.
  - Do **not** merge the chain.

#### 8. Report

Report:
- PR URL
- `mergeable` / `mergeStateStatus` / failing checks (name + one-line cause)
- whether it meets **ready-to-review-mergeable** (all required checks green or explicitly waived as out-of-scope)
- next human action

**Never merge.**

---

## Out of scope (unless `$ARGUMENTS` says otherwise)

- Slack status posts
- Applying terraform / promoting environments
- Granting GitHub org/team ACL
- Marking tracker issues Done

---

## Anti-patterns

- Claiming "ready" while required CI is red for in-scope failures
- Inventing Diátaxis front matter on exempt/meta files
- Merging "just to unblock the next wave"
- Re-asking defaults that this command already defines
- Silently raising the confidence threshold above what the caller asked for
- Reading the bot verdict from `.comments[*]` instead of `.reviews[*]`
- Assuming a tracker MCP write applied without re-reading the issue
