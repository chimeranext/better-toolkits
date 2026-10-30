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
| Quality gate via `/assurance-local-setup` + `/assurance-repo-setup` | Per-repo policy decisions (destino de evidencia, enforcement level) |

## Frontera local vs repo

| Dominio | Qué cubre | Permiteos clave |
|---------|-----------|-----------------|
| **LOCAL** (máquina del dev) | harness detection, marketplace/plugin installs, hooks locales, auto-update, deps typecheck | sin privilegios remotos |
| **REPO** (remoto/protección) | gate CI (`.mega-linter.yml`, workflows), tsconfig base, ruleset `required_status_checks`, `internal-audits` | admin del repo (si se va a enforce) |

La Parte L y la Parte R son independientes: un dev puede hacer la Parte L sin permisos
remotos; la Parte R reporta `no-enforced`/`GAP` si no puede activar protección.

---

# Parte L — Local (máquina del dev)

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
- **OpenCode notifier (recommended for opencode harness)** — install + configure
  `@mohak34/opencode-notifier@latest` (event-rich popups: `permission`/`complete`/
  `subagent_complete`/`question`/`error`). Opinionated config template (SSOT) at
  `adapters/opencode-notifier.json`; copy it to
  `~/.config/opencode/opencode-notifier.json` (see `adapters/setup-opencode.md`):
  - `showSessionTitle: true` (alerts show the session subject, not the project folder).
  - `showIcon: false` (no OpenCode logo).
  - `suppressWhenFocused: false` (**opt-in** — default OFF; the user explicitly opts in
    if they want quiet-while-focused).
  - `focusOnClick: true` (click-to-jump back to the session).
  - HITL label only on `question`/`permission` (they need the human).
  - If herdr is also present, set herdr `[ui.toast] delivery = "terminal"` (or disable its
    system toast) to avoid duplicate alerts for the same event.
- **herdr prefix key (avoid `ctrl+b` collision)** — opencode binds `ctrl+b` to
  `session.background` ("move running work to the background"). herdr uses `ctrl+b`
  as its prefix key by default, which intercepts the keystroke before opencode sees
  it. When both are present, set herdr `[keys] prefix = "ctrl+a"` (in
  `~/.config/herdr/config.toml`) so opencode keeps `ctrl+b` for backgrounding.
- **Branch mode** — default **consumer**: always converge the clone on `main` and
  fast-forward. `--expert-mode` (author) never switches branch and never touches a
  dirty tree. The mode is persisted in the sidecar so background runs honor it.
- **Assurance local** — `/assurance-local-setup` (git hooks locales + typecheck deps).

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

# Parte R — Repo (remoto/protección)

## Phase 7 — Assurance repo gate

Invoke `/assurance-repo-setup` (toolkit assurance). It:

- generates `.mega-linter.yml`, `.github/workflows/megalinter.yml`, `.github/workflows/bypass-audit.yml`,
  and `shared/hooks/tsconfig.json` (if TS) from `scripts/assurance-repo-setup/templates/`;
- ensures the ruleset `required_status_checks` via `scripts/assurance-repo-setup/ensure-rule-set.sh`
  (idempotente; solo si hay permisos);
- verifies `internal-audits` via `ensure-audit-repo.sh` (emite GAP si falta).

**No bloquea el bootstrap**: si la activación del ruleset no está permitida o el repo de
evidencia no existe, reporta estado `no-enforced` / `GAP` y continúa.

## Arguments

```
/toolkits-initial-setup [cursor|claude|opencode] [--expert-mode] [--no-auto-update] [--no-ruleset] [toolkit names…]
```

- `--expert-mode` — author flow: never switch the clone's branch, never touch a dirty tree.
- `--no-auto-update` — do not install the auto-update plugin (or `BETTER_TOOLKITS_AUTO_UPDATE=0`).
- `--no-ruleset` — pass through to `/assurance-repo-setup`: generate files but do not touch ruleset.

## Related

- [multi-harness-ssot.md](../../../../docs/multi-harness-ssot.md)
- `/assurance-local-setup` y `/assurance-repo-setup` (`toolkits/assurance-toolkit/commands/`)
- OpenSpec: `openspec/changes/2026-09-16-shared-bootstrap-toolkits-initial-setup/`
