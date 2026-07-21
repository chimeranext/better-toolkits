---
description: "Audit and prune merged PR branches; enforce delete_branch_on_merge. Runnable locally (CLI/script) or via scheduled GitHub Action with auditable logs."
priority: 85
---

# /repo-hygiene — merged-branch audit + policy

Keep GitHub repos tidy: report stale head branches whose PRs are already merged, enable **`delete_branch_on_merge`** where it is off, and optionally delete remote/local branches. **Default is dry-run** — pass `--apply` to mutate.

Complements `/rebase` (team release sync) and `/hygiene-hooks-setup` (Linear create triage). This command targets **Git branch clutter**, not tracker field hygiene.

## Quick start (local)

From the plugin checkout or any clone of `make-no-mistakes-toolkit`:

```bash
# Audit only (safe, read-only)
./scripts/repo-hygiene.sh audit

# Or via npm bin after install
npx @lapc506/make-no-mistakes repo-hygiene audit

# Enable delete_branch_on_merge on repos where false
./scripts/repo-hygiene.sh policy --apply

# Delete remote branches whose PRs are merged (never protected / open PR heads)
./scripts/repo-hygiene.sh prune-remote --apply

# Local gone-upstream branches + worktree prune
./scripts/repo-hygiene.sh prune-local --local-path ~/path/to/repo --apply

# Full sweep
./scripts/repo-hygiene.sh all --apply --local-path ~/path/to/seacrets.online-gitops
```

Requires **`gh`** (authenticated) and **`jq`**.

## Subcommands

| Subcommand | What it does |
|------------|--------------|
| `audit` | Report `delete_branch_on_merge` + count/list stale merged-PR head branches still on remote |
| `policy` | Set `delete_branch_on_merge=true` where not already true |
| `prune-remote` | Delete remote head refs for merged PRs (skips protected + open PR heads) |
| `prune-local` | `git fetch --prune`, delete local branches whose upstream is `: gone]`, `git worktree prune` |
| `all` | audit → policy → prune-remote (+ prune-local when `--local-path` set) |

## Options

| Flag | Description |
|------|-------------|
| `--apply` | Apply mutations (default: dry-run) |
| `--org ORG` | Default org for docs (default: `Seacrets-Online`) |
| `--repo OWNER/NAME` | Repeatable; limits scope (default: Seacrets platform list) |
| `--local-path PATH` | Git repo for `prune-local` / `all` |
| `--json` | Machine-readable summary line per repo (audit) |
| `--summary-file PATH` | Markdown report file (Actions sets `GITHUB_STEP_SUMMARY`) |

### Default repo set (Seacrets)

- `Seacrets-Online/seacrets.online-app`
- `Seacrets-Online/seacrets.online-gitops`
- `Seacrets-Online/seacrets.online-infra`
- `Seacrets-Online/seacrets.online-docs`
- `Seacrets-Online/seacrets.online-specs`
- `Seacrets-Online/seacrets.online-storybook`
- `Seacrets-Online/seacrets.online-clean`

### Protected branches (never deleted)

`main`, `master`, `develop`, `devel`, `stage`

## GitHub Action (auditable logs)

Two patterns — use **one or both**:

### A. Central org sweep (make-no-mistakes-toolkit)

Workflow: `.github/workflows/repo-hygiene.yml` in this repo.

- **Schedule:** Mondays 15:00 UTC (`audit` dry-run)
- **Manual:** `workflow_dispatch` with `subcommand` + `apply` boolean
- **Logs:** `$GITHUB_STEP_SUMMARY` + artifact `repo-hygiene-report.md`
- **Token:** org secret `REPO_HYGIENE_GH_TOKEN` (PAT with `repo` + `delete_ref` on target repos). Falls back to `GITHUB_TOKEN` (single-repo only).

Setup once in org settings:

```text
Organization → Settings → Secrets → Actions → REPO_HYGIENE_GH_TOKEN
```

### B. Per-repo reusable workflow (consumer repos)

Copy `examples/repo-hygiene-consumer-workflow.yml` into each Seacrets repo as `.github/workflows/repo-hygiene.yml`:

```yaml
jobs:
  hygiene:
    uses: chimeranext/make-no-mistakes-toolkit/.github/workflows/repo-hygiene-reusable.yml@main
    with:
      subcommand: audit
      apply: false
    secrets:
      gh_token: ${{ secrets.GITHUB_TOKEN }}
```

`GITHUB_TOKEN` is enough for **that repo only** — good for weekly self-audit without org PAT.

## Agent execution protocol

When the user invokes `/make-no-mistakes:repo-hygiene`:

1. **Pre-flight:** `gh auth status`, `command -v jq`
2. **Default:** run `audit` dry-run first; show summary table
3. **Never `--apply`** without explicit user confirmation
4. **Policy first:** if `delete_branch_on_merge` is false on docs/specs, recommend `policy --apply` before bulk prune
5. **Protected / open PR heads:** script skips these — do not bypass manually
6. **Actions:** if user wants scheduled runs, guide them to add org secret + enable workflow (or copy consumer snippet)

## Related

- [`/rebase`](rebase.md) — post-release branch sync (deletes branch on PR merge during sync)
- [`/hygiene-hooks-setup`](hygiene-hooks-setup.md) — Linear create triage hooks
- Skill: [`repo-hygiene-advisor`](../skills/repo-hygiene-advisor/SKILL.md)
