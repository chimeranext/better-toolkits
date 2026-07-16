---
description: Leave the current branch PR-ready and mergeable — default Diátaxis status=review, fix CI, push; never merge.
argument-hint: "[overrides / upstream PR URLs / Linear IDs]"
priority: 85
---

# /ready-to-review-mergeable: $ARGUMENTS

You are preparing the **current git work** so a human can review and merge it.
Leave the branch **ready for review and mergeable** (CI green where fixable in-scope, pushed, PR open / updated, not draft). **Do not merge.**

The user input can be provided directly by the agent or as a command argument —
you MUST consider it before proceeding (if not empty).

**Input**: `$ARGUMENTS` — optional overrides (e.g. `status=draft`, skip-push, upstream PR URLs for chain, Linear IDs). Empty = apply defaults below.

**Output**: PR URL(s), mergeability / remaining failing checks, and the next human action. No merge.

---

## Defaults (do not re-ask unless `$ARGUMENTS` overrides)

1. **Diátaxis `status`:** when the change set includes docs that use YAML front matter with a Diátaxis schema, set `status: review` on pages meant for review (not `draft`, not invalid values like `active`). Allowed enum when the repo enforces it: `draft` | `review` | `accepted` | `deprecated`.
2. **Push:** after local fixes and commit(s), `git push -u origin HEAD` (or push to the existing PR branch).
3. **No merge:** never merge the PR; never mark Linear Done unless `$ARGUMENTS` explicitly asks in this invocation.
4. **No draft:** if a PR exists and is draft, mark it ready (`gh pr ready`) unless `$ARGUMENTS` says keep-draft.

---

## Execution steps

### 1. Context

Identify:
- repo root and remote (`gh repo view`)
- current branch
- whether a PR already exists (`gh pr view` / `gh pr list --head "$(git branch --show-current)"`)
- base branch (`main` unless the branch tracks another base)

### 2. Diff

Diff vs base. List changed files. Decide which validators apply.

### 3. Docs / Diátaxis (when applicable)

If this repo (or the diff) includes Diátaxis-style markdown with required YAML front matter:

- Set `status: review` on **changed** doc pages intended for publication/review.
- Respect repo exemptions (do **not** invent front matter for meta files). Common patterns: `AGENTS.md`, `openspec/`, `templates/`, `archive/`, root `README.md` / `MAINTENANCE.md` / `index.md`, and any paths listed in the repo's front-matter checker / pre-commit `exclude`.
- Run the validators CI runs (`pre-commit`, `npm run check:front-matter`, markdownlint with `--fix` as configured). Commit autofixes.

If the repo has no Diátaxis front-matter schema, skip this step (do not invent a schema).

### 4. Non-docs repos

Run the **minimal CI-equivalent checks** for the change set (e.g. `terraform validate`, lint, unit tests, gitops validate). Fix failures that are clearly in scope of this branch.

If a check fails due to **repo-wide misconfiguration unrelated to the change set** (wrong cache path, missing sibling checkout, org secrets), report it explicitly as out-of-scope and continue — do not silently claim mergeable.

### 5. Commit

If there are uncommitted fixes, create a conventional commit focused on **why** (CI / ready-for-review), not a file laundry list.

### 6. Push

Push the branch (`git push -u origin HEAD` or update the existing PR remote). Push is the default; only skip if `$ARGUMENTS` says so.

### 7. PR create / update

- If no PR: `gh pr create` with Summary, Test plan, and chain links when applicable.
- If PR exists: ensure **not draft** (`gh pr ready`); update body with chain links if missing.
- Chain / stack (when `$ARGUMENTS` or session context lists upstream PRs / Linear blockers):
  - Put `Depends on: <url>` in the PR body.
  - Set Linear `blockedBy` when the issue graph requires it.
  - Do **not** merge the chain.

### 8. Report

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
- Marking Linear issues Done

---

## Anti-patterns

- Claiming "ready" while required CI is red for in-scope failures
- Inventing Diátaxis front matter on exempt/meta files
- Merging "just to unblock the next wave"
- Re-asking defaults that this command already defines
