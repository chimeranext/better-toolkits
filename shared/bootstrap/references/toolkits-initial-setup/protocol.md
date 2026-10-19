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

## Phase 5 — Install

Only after OK:

1. Run marketplace / plugin install commands.
2. Merge hooks idempotently (see adapter for paths).
3. For OpenCode, run or guide `npx @chimeranext/better-toolkits setup` (same protocol; `--yes` only when user pre-approved).
4. Never use `2>/dev/null` or bare `2>&1` without a log file — stderr hooks doctrine applies to the agent too.

## Phase 6 — Verify

1. `claude plugin marketplace list` / `agent plugin marketplace list` — `better-toolkits`, N plugins indexed.
2. Bootstrap + requested product plugins appear in `plugin list`.
3. **Stderr probe** — attempt a forbidden pattern in a dry explanation or run toolkit's stderr test if present:
   `shared/hooks/stderr/tests/test-detect.sh`
4. `npx @chimeranext/better-toolkits doctor` when CLI is available.
5. **Auto-update** — `opencode plugin list` shows `local.better-toolkits-auto-update`; the sidecar
   records the chosen branch mode; `better-toolkits self-update --dry-run` reports the planned pull.

Report pass/fail per harness. If verify fails, propose rollback diffs (HITL again).

## Arguments

```
/toolkits-initial-setup [cursor|claude|opencode] [--expert-mode] [--no-auto-update] [toolkit names…]
```

- `--expert-mode` — author flow: never switch the clone's branch, never touch a dirty tree.
- `--no-auto-update` — do not install the auto-update plugin (or `BETTER_TOOLKITS_AUTO_UPDATE=0`).

## Related

- [multi-harness-ssot.md](../../../../docs/multi-harness-ssot.md)
- OpenSpec: `openspec/changes/2026-09-16-shared-bootstrap-toolkits-initial-setup/`
