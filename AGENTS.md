# Agent guidance — better-toolkits

Repo-level instructions for Cursor, Claude Code, and other agents working in this
repository. Prefer this file over inventing workspace layouts under the parent
`chimeranext/` folder (that folder is **not** a git root).

Related: [`docs/hitl.md`](docs/hitl.md) (ask-and-wait before shared-state
mutations), [`docs/multi-harness-ssot.md`](docs/multi-harness-ssot.md).

## Marketplace SSOT (mandatory)

**One** Claude Code marketplace manifest exists for this monorepo:

[`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json)

- Install surface: `claude plugin marketplace add chimeranext/better-toolkits`
- Each toolkit keeps only `.claude-plugin/plugin.json` (plugin identity + version).
- **Forbidden:** `toolkits/*/.claude-plugin/marketplace.json` — those were standalone-repo
  leftovers and cause version drift. Do not recreate them.
- When bumping a toolkit version, update **root** `marketplace.json` + that toolkit's
  `plugin.json` (and `package.json` / CHANGELOG / README when they exist) in the same PR.

## Runtime hooks (stderr + PRDS)

| Runtime | Path | Harnesses |
| --- | --- | --- |
| Stderr baseline | [`shared/hooks/stderr/`](shared/hooks/stderr/) | Claude / Cursor / OpenCode |
| PRDS body gate | [`shared/hooks/prds/`](shared/hooks/prds/) | Claude / Cursor / OpenCode |

Vendor with `scripts/sync-stderr-from-shared.sh` and `scripts/sync-prds-from-shared.sh`.
See [`docs/multi-harness-ssot.md`](docs/multi-harness-ssot.md).

## Git worktrees (mandatory when parallel)

When more than one branch/PR is active, or the primary checkout is dirty, use an
isolated worktree — never ad-hoc sibling folders under `../chimeranext/`.

**Canonical paths (inside this repo):**

| Harness | Path |
| --- | --- |
| Cursor / generic agents | `.agents/worktrees/<slug>` |
| Claude Code / `/make-no-mistakes:implement` | `.claude/worktrees/<issue-id>` |
| Manual fallback | `.worktrees/<slug>` |

**Create:**

```bash
mkdir -p .agents/worktrees
git worktree add .agents/worktrees/<slug> -b <branch> <base-ref>
cd .agents/worktrees/<slug>
```

**Rules:**

- One worktree per issue/agent; do not `git switch` the primary tree to steal a branch.
- Slug = short kebab case (`feat-og-preview-images`, `APP-1234-widget`).
- Every mutation: `cd` to the worktree path first (see MNM `feedback_cd_between_worktrees`).
- Remove worktrees after merge (HITL) — `git worktree remove .agents/worktrees/<slug>`.

**Forbidden:** `../better-toolkits-og`, `../better-toolkits-fcto`, or any flat sibling
directory under `chimeranext/` — those are accidental, not convention.
