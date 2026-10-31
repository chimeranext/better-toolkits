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
- **Bootstrap first:** `claude plugin install better-toolkits-bootstrap@better-toolkits` → `/toolkits-initial-setup` (HITL). OpenCode: `npx @chimeranext/better-toolkits setup`. SSOT: `shared/bootstrap/references/toolkits-initial-setup/protocol.md`.
- **Deprecated** as monorepo SSOT: `npx @lapc506/make-no-mistakes install` (legacy single-toolkit scope).
- Each toolkit keeps only `.claude-plugin/plugin.json` (plugin identity + version).
- **Forbidden:** `toolkits/*/.claude-plugin/marketplace.json` — those were standalone-repo leftovers and cause version drift. Do not recreate them.
- When bumping a toolkit version, update **root** `marketplace.json` + that toolkit's `plugin.json` (and `package.json` / CHANGELOG / README when they exist) in the same PR.
- **Pre-push gate:** `scripts/git-hooks/pre-push-marketplace-versions.sh` (or `pre-commit install --hook-type pre-push`) blocks pushes when `commands/`, `references/`, `skills/`, or `hooks/` changed without a semver increase. Apply bumps: `python3 scripts/ci/marketplace_versioning.py write --range origin/main..HEAD`. Cursor refresh: `agent plugin marketplace update better-toolkits` (optional `workspaceOpen` hook in bootstrap adapter).
- **Agent-agnostic catalog:** each toolkit `package.json` `"skills"` field (antfu/skills-npm: `{ source, skills }`) lists its `SKILL.md` folders. Update that list when a skill folder is added or removed. Install with `npx skills add chimeranext/better-toolkits --skill <name> --agent '*' -g -y`, or `--all -g` for every skill.

## Runtime hooks (stderr + PRDS)

| Runtime | Path | Harnesses |
| --- | --- | --- |
| Stderr baseline | [`shared/hooks/stderr/`](shared/hooks/stderr/) | Claude / Cursor / OpenCode |
| PRDS body gate | [`shared/hooks/prds/`](shared/hooks/prds/) | Claude / Cursor / OpenCode |
| No deprecated shims | [`scripts/lint/check_no_stale_deprecated_shims.py`](scripts/lint/check_no_stale_deprecated_shims.py) | CI, pre-commit, pre-push, Cursor `beforeShellExecution` on `git commit` |

Renames of slash commands or bootstrap scripts are **clean-cut** — update references and delete the old path. Do not add “MOVED (shim)” commands or `exec` wrapper scripts. Policy: [`shared/references/engineering-standards/no-deprecated-agent-shims.md`](shared/references/engineering-standards/no-deprecated-agent-shims.md).

Vendor with `scripts/sync-stderr-from-shared.sh` and `scripts/sync-prds-from-shared.sh`
(Windows: `scripts/sync-stderr-from-shared.ps1` / `scripts/sync-prds-from-shared.ps1`, run via `pwsh -File …`).
See [`docs/multi-harness-ssot.md`](docs/multi-harness-ssot.md).

## Issue tracking for this monorepo

`better-toolkits` is a public collaborative monorepo with GitHub Issues enabled
and no associated Linear project. Use this repository's native GitHub Issues:

- Tracker: `Fixes #N` and the canonical `https://github.com/chimeranext/better-toolkits/issues/N` URL.
- Branch: `type/N-short-slug` (for example, `docs/43-prds-native-issues`).
- Title: `<type>(<scope>): <outcome> (#N)`.
- Do not invent `TICKET-*` IDs for work owned by this repository.

This rule applies only to better-toolkits work. `/toolkits-initial-setup` still
configures the Linear MCP server for client workflows; registering that MCP does
not imply this monorepo is attached to a Linear workspace or project.

## Git worktrees (mandatory when parallel)

When more than one branch/PR is active, or the primary checkout is dirty, use an
isolated worktree — never ad-hoc sibling folders under `../chimeranext/`.

**Canonical paths (inside this repo):**

| Harness | Path |
| --- | --- |
| Cursor / generic agents | `.agents/worktrees/<slug>` |
| Claude Code / `/make-no-mistakes:implement` | `.agents/worktrees/<issue-id>` |
| Manual fallback | `.worktrees/<slug>` |

**Create:**

```bash
mkdir -p .agents/worktrees
git worktree add .agents/worktrees/<slug> -b <branch> <base-ref>
cd .agents/worktrees/<slug>
```

**Rules:**

- One worktree per issue/agent; do not `git switch` the primary tree to steal a branch.
- Slug = short kebab case (`feat-og-preview-images`, `43-prds-native-issues`).
- Every mutation: `cd` to the worktree path first (see MNM `feedback_cd_between_worktrees`).
- Remove worktrees after merge (HITL) — `git worktree remove .agents/worktrees/<slug>`.

**Forbidden:** `../better-toolkits-og`, `../better-toolkits-fcto`, or any flat sibling directory under `chimeranext/` — those are accidental, not convention.
