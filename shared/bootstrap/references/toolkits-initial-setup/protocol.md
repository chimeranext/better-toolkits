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
- **Bilingual gate (BIB)** — install the deterministic issue-redaction gate across harnesses:
  Claude PreToolUse `shared/hooks/bilingual/pre-linear-save-issue-bilingual.sh` (registrado en
  `hooks.json` matcher `mcp__.*linear.*__save_issue`), Cursor `adapters/cursor-before-shell.sh`,
  OpenCode plugin `adapters/opencode-bilingual.ts`, y CLI fallback `tooluse/enforce-bilingual.sh`.
  (MANDATORY: no opt-in; no lee `.claude/config/hygiene-hooks.json`.)
- **Code-smells detector** — añadir el pre-commit `code-smells` (`scripts/lint/detect_code_smells.py`,
  `pass_filenames: true`) al `.pre-commit-config.yaml` del repo consumidor.
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
3a. **Bilingual gate** — copia `shared/hooks/bilingual/` a cada harness: registra el
    pre-hook en el `hooks.json` de Claude (matcher `mcp__.*linear.*__save_issue`), el adapter
    `cursor-before-shell.sh` en `.cursor/hooks/`, el plugin `opencode-bilingual.ts` en la
    carpeta de plugins de OpenCode, y `enforce-bilingual.sh` como tooluse guard (vía
    `scripts/ci/install-tooluse-guards.sh`).
3b. **Code-smells** — añade el hook pre-commit `code-smells` (`detect_code_smells.py`,
    `pass_filenames: true`) al `.pre-commit-config.yaml` del repo consumidor.
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

7. **Bilingual probe** — ejecuta `python3 shared/hooks/bilingual/detect.py --body "x"` → exit 2; verifica que el matcher/plugin esté registrado en cada harness (Claude hooks.json, Cursor, OpenCode).
8. **Code-smells probe** — `python3 scripts/lint/detect_code_smells.py` sobre archivos cambiados → exit 0 sin HARD.

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
3. **Provision CODEOWNERS** (idempotent, only with permissions):
   - If `.github/CODEOWNERS` is missing or references only individual logins,
     write `* @<org>/founders` (create the team if it does not exist).
   - Verify the team exists (fail-closed); report `GAP` if it cannot be created.
   - This guarantees the `main-founders-only` ruleset has a concrete team to
     auto-assign as reviewer (MPH points 7-8).
4. **Output**: PASS/FAIL table per invariant. `GGT audit: ALL PASS` or `GGT audit: FAILURES` with the failed invariant. If no repo permissions → document `no-enforced` (does not block bootstrap).

## Engineering standards (SSOT)

This setup installs/refers the indexed **engineering standards** at
`shared/references/engineering-standards/` (consumed by the agent profile). The
agent profile (`agents/better.md`) references them. The hooks enforce the key ones:

- **Jidoka** (`jidoka.md`) — stop on anomaly. Record boundary + root-cause hypothesis.
- **StS** (`stderr-stream-standards.md`) — no stream to null. Fold stderr into the
  same sink. `2> file` forbidden (enforced by the stderr hook this setup installs).
- **BIB** — ver `index.md` (#33) y `bilingual-issue-brief.md` (SSOT). Su gate determinístico
  `shared/hooks/bilingual/detect.py` queda instalado por este setup.
- **CLG** (`commit-logic-groups.md`) — commit intermediate work in semantic groups.
- **GGT** (`gitflow-trunk.md`) — branch model provisioned in Phase 7b. Audited by
  `audit-repo-gitflow.sh`.
- **REL** (`release-cut.md`) — release cut. One `develop`→`main` PR. CTO owns QA.
  Second human reviewer is the sole PROD gate.
- **SemVer** (`semver.md`) — monotonic version gate enforced at the release cut
  per monorepo.
- **LTGT** (`local-vs-ground-truth.md`) — search ground truth from the git
  common-dir across all worktrees with hidden paths. Never conclude absence from
  a CWD-only scan.
- **MPH** (`main-protections-hitl.md`) — protected branch + HITL gate. The
  `main-founders-only` ruleset is provisioned in Phase 7b, with CODEOWNERS
  pointing to the `founders` team (Phase 7b step 3; replication workflow in
  `codeowners-replication-workflow.md`).
- **CIS** (`ci-security-standards.md`) — CI security & standards. CodeQL +
  Trivy + MegaLinter gates, vendored from assurance-toolkit templates and the
  `security-scan` composite action (Phase 7).
- **DDD** (`domain-driven-design.md`) — Domain-Driven Design. The structural
  basis for bounded contexts; the parent standard for the RDP "bounded-context
  boundary leakage" family and the Inverse Conway Maneuver.
- **RDP** (`repository-drift-prevention.md`) — Repository Drift Prevention. The
  seven `audit-engine` detector families (SCH/CDC/DDD/ARC/STR/ENF/OWN) and
  their canonical-source rationale.
- **PRDS / BrS / WTD / QT4L / OST / NSQ / TFM** — the other indexed standards.

The setup also installs the scripts/hooks that enforce StS (stderr adapter), the
OpenSpec pipeline discipline, and the GGT audit. `sync-better-profile.sh` syncs
the Better profile to each harness (OpenCode / Claude / Cursor) from
`shared/bootstrap/agents/better.md` (multi-harness schema conversion).

## Mandatory discipline — OpenSpec pipeline (no shortcuts)

This bootstrap installs the agent profile (`agents/better.md`) and the hooks that
enforce the **OpenSpec pipeline**. Any change to a repo (code, docs, policy, config)
MUST go through `/opsx:propose` → worktree isolation → `/opsx:apply` → `/dogfood` →
`/ready-to-review-mergeable` → approved PR. Implementing directly on a working branch
is forbidden — including by this setup's own tooling.

## Engineering standards (SSOT)

This setup installs/refers the indexed **engineering standards** at
`shared/references/engineering-standards/` (consumed by the agent profile). The
agent profile (`agents/better.md`) references them; the hooks enforce the key ones:

- **Jidoka** (`jidoka.md`) — stop on anomaly; record boundary + root-cause hypothesis.
- **StS** (`stderr-stream-standards.md`) — no stream to null; fold stderr into the
  same sink; `2> file` forbidden (enforced by the stderr hook this setup installs).
- **CLG** (`commit-logic-groups.md`) — commit intermediate work in semantic groups.
- **PRDS / BrS / DSMS / IFS / CPS / QT4L / OST** — the other indexed standards.

The setup also installs the scripts/hooks that enforce StS (stderr adapter) and
the OpenSpec pipeline discipline.

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
