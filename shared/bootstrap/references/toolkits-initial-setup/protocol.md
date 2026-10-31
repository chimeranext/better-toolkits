# /toolkits-initial-setup — protocol SSOT

Bootstrap the **better-toolkits** marketplace and harness wiring before installing product toolkits.
Follow [HITL doctrine](../../../../docs/hitl.md): **no filesystem writes outside the active workspace
without explicit human OK** — including `~/.cursor/hooks.json`, `~/.config/opencode/opencode.jsonc`,
and global plugin installs.

## Scope boundary

| In scope | Out of scope |
|----------|--------------|
| Marketplace registration, bootstrap plugin, stderr hooks, auto-update (per harness, default ON) | `/make-no-mistakes:*` product commands |
| Installing N product toolkit plugins / OpenCode merges (`setup-opencode.md`) | Repo-specific `/hygiene-hooks-setup` |
| OpenCode stderr + optional npm CLIs via `setup-opencode.md` | `/make-no-mistakes:opencode-setup` (removed — use bootstrap) |
| OpenCode: `npx @chimeranext/better-toolkits setup` | Per-toolkit `npx @lapc506/* install` (deprecated) |
| Auto-update: `git pull --ff-only` the clone + per-harness wiring re-sync | Third-party `opencode-plugin-auto-update` (migrates `"plugins"`→`"plugin"`, npm-registry only) |
| Quality gate via `/assurance-local-setup` + `/assurance-repo-setup` | Per-repo policy decisions (evidence destination, enforcement level) |
| **Repo-initial-setup (GGT):** provisions the GitFlow+trunk model (default branch `main`, NSQ, ruleset) and runs `audit-repo-gitflow.sh` | Harness-local-only concerns (never repo-scoped) |

## Local vs repo boundary

| Domain | Covers | Key permissions |
|---------|-----------|-----------------|
| **LOCAL** (dev machine) | harness detection, marketplace/plugin installs, local hooks, auto-update, deps typecheck | no remote privileges |
| **REPO** (remote/protection) | CI gate (`.mega-linter.yml`, workflows), tsconfig base, ruleset `required_status_checks`, `internal-audits`, **GGT repo-initial-setup** (default branch `develop`, NSQ, audit `audit-repo-gitflow.sh`) | repo admin (if enforcing) |

Part L and Part R are independent: a developer can run Part L without remote
permissions; Part R reports `no-enforced`/`GAP` when it cannot activate protection.

---

# Part L — Local (dev machine)

## Phase 1 — Detect harness

Infer active harness(es) from context:

| Signal | Harness |
|--------|---------|
| Cursor workspace, `.cursor/` present | **cursor** |
| `CLAUDE_PLUGIN_ROOT`, Claude Code session | **claude** |
| User invoked CLI or `opencode.jsonc` context | **opencode** |

If `$ARGUMENTS` names a harness (`cursor`, `claude`, `opencode`), use only that adapter.
Otherwise run all detected adapters.

Load the matching adapter(s) from `adapters/setup-{harness}.md` (e.g. `setup-cursor.md`).
Filename prefix `setup-` avoids collisions with generic harness names when grepping the monorepo
or adding sibling protocol docs (e.g. `agents.md`).

## Phase 2 — Audit

For each harness, collect **read-only** state:

1. **Marketplace** — `claude plugin marketplace list` / `agent plugin marketplace list`
   - Registered? Canonical name `better-toolkits` (not duplicate slugs for same `gitUrl`).
   - `gitRef` present? Plugin count indexed?
2. **Bootstrap plugin** — `better-toolkits-bootstrap` installed?
3. **Product plugins** — which of the 10 toolkits are installed?
4. **Stderr hooks** — `beforeShellExecution` (Cursor), PreToolUse Bash (Claude), OpenCode `plugins` array.
5. **Auto-update** — Cursor: `workspaceOpen` hook for `update-better-toolkits-marketplace-cursor.sh`?
   OpenCode: `better-toolkits-auto-update` discovery plugin + mode sidecar present?
6. **Clone state** — a better-toolkits clone resolvable (env / walk-up / OS-aware GitHub roots)?
   On which branch, and is the tree dirty?

Emit an audit table. Do not fix anything yet.

## Phase 3 — Propose

Produce explicit **diffs** and command lists:

- `claude plugin marketplace add chimeranext/better-toolkits` (if missing)
- `claude plugin install better-toolkits-bootstrap@better-toolkits` (if missing)
- `agent plugin install better-toolkits-bootstrap@better-toolkits` (Cursor, if applicable)
- Product toolkit installs the user selected (or recommend defaults: `make-no-mistakes`, etc.)
- Merged `hooks.json` / `opencode.jsonc` snippets (idempotent append, never clobber unrelated hooks)
- **Auto-update plugin (default ON)** — install the OpenCode discovery-dir plugin
  `better-toolkits-auto-update` + its mode sidecar; register the Cursor `workspaceOpen`
  hook. Opt out with `--no-auto-update` or `BETTER_TOOLKITS_AUTO_UPDATE=0`.
- **Branch mode** — default **consumer**: always converge the clone on `main` and
  fast-forward. `--expert-mode` (author) never switches branch and never touches a
  dirty tree. The mode is persisted in the sidecar so background runs honor it.
- **Assurance local** — `/assurance-local-setup` (local git hooks + typecheck deps).

Show full proposed file contents or unified diff. Link [stderr README](../../../../hooks/stderr/README.md).

## Phase 4 — Ask (HITL)

Stop. Present numbered options:

1. Apply all proposed changes
2. Apply stderr hooks only
3. Apply marketplace + bootstrap only
4. Auto-update plugin: install (default) / skip (`--no-auto-update`)
5. Branch mode: consumer `main` (default) / `--expert-mode` (author — never switch branch, leave a dirty tree alone)
6. Cancel — no writes

Wait for an **explicit** reply. Silence is not approval.

## Phase 5 — Install (local)

Only after OK:

1. Run marketplace / plugin install commands.
2. Agent-agnostic skill install (skills CLI). Plugin install does not publish the skill set to other agents. `--all` installs every skill for every agent; `--agent '*'` with `--skill` installs the names from that toolkit's `package.json` `"skills"` field:

```bash
npx skills add chimeranext/better-toolkits --all -g
npx skills add chimeranext/better-toolkits --skill merge-advisor --agent '*' -g -y
```

`setup --skills --toolkit <name>` plans the same `npx skills add` from the package.json filter.
3. Merge hooks idempotently (see adapter for paths).
4. For OpenCode, run or guide `npx @chimeranext/better-toolkits setup` (same protocol; `--yes` only when user pre-approved).
5. Never use `2>/dev/null` or bare `2>&1` without a log file — stderr hooks doctrine applies to the agent too.
6. **Assurance local** — invoke `/assurance-local-setup` (`scripts/assurance-local-setup/ensure-local-hooks.sh` + `prepare-typecheck-deps.sh`).

## Phase 6 — Verify (local)

1. `claude plugin marketplace list` / `agent plugin marketplace list` — `better-toolkits`, N plugins indexed.
2. Bootstrap + requested product plugins appear in `plugin list`.
3. **Stderr probe** — attempt a forbidden pattern in a dry explanation or run toolkit's stderr test if present:
   `shared/hooks/stderr/tests/test-detect.sh`
4. `npx @chimeranext/better-toolkits doctor` when CLI is available.
5. **Auto-update** — `opencode plugin list` shows `local.better-toolkits-auto-update`; the sidecar
   records the chosen branch mode; `better-toolkits self-update --dry-run` reports the planned pull.
6. **Assurance local** — `cd shared/hooks && npm run typecheck` passes; git hooks active.

Report pass/fail per harness. If verify fails, propose rollback diffs (HITL again).

---

# Part R — Repo (remote/protection)

## Phase 7 — Assurance repo gate

Invoke `/assurance-repo-setup` (toolkit assurance). It:

- generates `.mega-linter.yml`, `.github/workflows/megalinter.yml`, `.github/workflows/bypass-audit.yml`,
  and `shared/hooks/tsconfig.json` (if TS) from `scripts/assurance-repo-setup/templates/`;
- ensures the ruleset `required_status_checks` via `scripts/assurance-repo-setup/ensure-rule-set.sh`
  (idempotent; only with permissions);
- verifies `internal-audits` via `ensure-audit-repo.sh` (emits GAP if missing).

**Does not block bootstrap:** if ruleset activation is not allowed or the evidence
repo does not exist, report `no-enforced` / `GAP` and continue.

## Phase 7b — Repo-initial-setup (GGT)

Split from harness-initial-setup: this step provisions the **GGT** model on the repo and runs the audit.

1. **Provision GGT invariants** (idempotent, only with permissions):
   - default branch = `develop`. `main` exists as the protected trunk (invariant 1).
   - `allow_squash_merge: false`, `allow_merge_commit: true`, `allow_rebase_merge: true` (NSQ).
   - Ruleset `main-founders-only` on `refs/heads/main`: `allowed_merge_methods=["merge"]`,
     without `required_linear_history` (MPH).
2. **Audit**: `scripts/ci/audit-repo-gitflow.sh --repo <owner/repo> [--require-develop]`
   - Report PASS/FAIL per invariant. If FAIL → `GAP` (do not fake compliance).
3. **Output**: PASS/FAIL table per invariant. `GGT audit: ALL PASS` or `GGT audit: FAILURES` with the failed invariant. If no repo permissions → document `no-enforced` (does not block bootstrap).

## Arguments

```
/toolkits-initial-setup [cursor|claude|opencode] [--expert-mode] [--no-auto-update] [--no-ruleset] [--skip-ggt] [toolkit names…]
```

- `--expert-mode` — author flow: never switch the clone's branch, never touch a dirty tree.
- `--no-auto-update` — do not install the auto-update plugin (or `BETTER_TOOLKITS_AUTO_UPDATE=0`).
- `--no-ruleset` — pass through to `/assurance-repo-setup`: generate files but do not touch ruleset.
- `--skip-ggt` — skip Phase 7b repo-initial-setup (GGT provisioning + audit). Report `skipped`.

## Related

- [multi-harness-ssot.md](../../../../docs/multi-harness-ssot.md)
- `/assurance-local-setup` and `/assurance-repo-setup` (`toolkits/assurance-toolkit/commands/`)
- OpenSpec: `openspec/changes/2026-09-16-shared-bootstrap-toolkits-initial-setup/`
