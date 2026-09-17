# setup-opencode — OpenCode adapter for /toolkits-initial-setup

**Protocol SSOT** for OpenCode stderr + optional npm plugin registration. Invoked by
`/toolkits-initial-setup` (Claude/Cursor bootstrap) or `npx @chimeranext/better-toolkits setup`
(headless). Default flow: **audit → install → verify**.

## CLI entry (no product plugin required)

```bash
npx @chimeranext/better-toolkits setup
```

| Flag | Behavior |
|------|----------|
| (default) | detect → audit → propose → **wait for TTY confirm** |
| `--dry-run` | Audit + propose only |
| `--yes` | Apply after non-interactive confirm (CI only; not default) |

Until npm publish, from monorepo clone:

```bash
node shared/bootstrap/cli/bin/better-toolkits.js setup
```

## Honest scope (read this to the user once)

OpenCode does **not** consume Claude Code `hooks/hooks.json` / shell matchers.

| Surface | What this adapter does |
| --- | --- |
| **Stderr baseline** (`local.mnm-no-stderr-redirect`) | **Yes** — copy the dependency-free `opencode-plugin.ts` to the global discovery dir as `~/.config/opencode/plugins/mnm-no-stderr-redirect/index.ts` (no `"plugins"` entry - file entries are rejected on v2.0.5) |
| **npm OpenCode packages** (`@lapc506/…`) | **Optional** `--also-npm` — run their `install` (commands/skills assets + package name in `"plugins"`) |
| **Claude-only hooks** (MNM hygiene, atomic, QA, aaarrr spend-safety, …) | **No** — stay on Claude marketplace plugins until dedicated OpenCode adapters exist |

“All toolkit hooks on OpenCode” today means: **one installed stderr adapter
copy for the whole monorepo** (every toolkit vendors the same detector source)
**plus** optional npm CLIs — not ten installed copies of the same plugin
(same plugin id) and not Claude `hooks.json`.

Key name is **`"plugins"`** (OpenCode V2) for npm packages / plugin
directories only. Do not write legacy `"plugin"` (singular), and do not
register the stderr adapter file itself there — the server rejects file
entries (`configured plugin path must be a directory`, observed v2.0.5) and
does not expand `~`. The adapter loads from the discovery dir with no config
entry at all.

## Arguments (slash command or CLI)

```
[audit | install | verify] [--project] [--dry-run] [--also-npm] [--config-dir <path>]
```

- Empty phase list → run **audit → install → verify** in order.
- `--project` → mutate `./opencode.json` or `./opencode.jsonc` in the cwd (HITL —
  shared repo config).
- Default config dir → `~/.config/opencode` (user).
- `--dry-run` → print planned edits; no writes.
- `--also-npm` → after stderr registration, offer/run the four CLI installs:
  `@lapc506/make-no-mistakes`, `@lapc506/atomic-design-toolkit`,
  `@lapc506/business-model-toolkit`, `@lapc506/app-gtm-release-toolkit`
  (each with their own `--dry-run` when requested).

## Resolve stderr adapter path (one only)

Prefer, in order:

1. `$BETTER_TOOLKITS_ROOT/shared/hooks/stderr/adapters/opencode-plugin.ts` if set and exists.
2. Walk up from cwd for `shared/hooks/stderr/adapters/opencode-plugin.ts`
   (monorepo root contains `.claude-plugin/marketplace.json` + `toolkits/`).
3. Fallback: any single toolkit copy under `toolkits/<name>/hooks/stderr/adapters/opencode-plugin.ts`.

**Never** install more than one stderr copy (same plugin id). If audit finds
multiple installed copies or stale `"plugins"` file entries, warn; install
collapses to the single discovery-dir copy (ask HITL before deleting user
files outside the managed dir).

## Install the stderr baseline (discovery dir, no config entry)

Copy (never symlink — the loader follows realpath for resolution) the
resolved adapter file to the global discovery dir, renamed as `index.ts`:

```bash
PLUGIN_DIR=~/.config/opencode/plugins/mnm-no-stderr-redirect
mkdir -p "$PLUGIN_DIR"
cp "$ADAPTER" "$PLUGIN_DIR/index.ts"  # bytes must match the repo source
```

`ADAPTER` is the resolved path from the section above. No `"plugins"` array
entry is needed or wanted: the server auto-loads direct files and package
dirs under `~/.config/opencode/plugins/`, while file entries in the array are
rejected (`configured plugin path must be a directory`, observed v2.0.5) and
`~` is not expanded there. The adapter is dependency-free (no npm install),
so the copy loads standalone.

Idempotent: skip the copy when the installed bytes already match the source.

## `opencode.json(c)` merge

Propose one **`skills`** entry per selected toolkit (adapters only register
the stderr hook; without `skills` entries opencode2 sees zero monorepo
commands). The **`plugins`** array is only for npm packages / plugin
directories — never for the stderr adapter file.

Toolkit skills (the stderr baseline needs no config entry — it loads from the
discovery dir installed above):

```jsonc
{
  "skills": [
    "/absolute/path/to/better-toolkits/toolkits/<toolkit>/skills"
  ]
}
```

Per-toolkit **npm** packages may add their own `plugins` entries — merge all requested toolkits in one
proposal; user approves the combined diff.

### Config file resolution

1. Prefer existing `opencode.json`, else `opencode.jsonc`, else create `opencode.json`.
2. Merge with comment-preserving edits when the file is jsonc (`jsonc-parser` /
   `toolkits/make-no-mistakes-toolkit/src/lib/merge-opencode-config.ts` → `addPluginToConfig`). Prefer calling:

   ```bash
   # From make-no-mistakes package root (after build), or via tsx in a clone:
   node --import tsx -e '
   import { addPluginToConfig } from "./src/lib/merge-opencode-config.ts";
   import { resolveConfigDir } from "./src/lib/paths.ts";
   const dir = resolveConfigDir(process.env.OPENCODE_CONFIG_DIR);
   const plugin = process.env.MNM_STDERR_PLUGIN_PATH;
   console.log(JSON.stringify(await addPluginToConfig(dir, plugin, process.argv.includes("--dry-run")), null, 2));
   '
   ```

   Set `OPENCODE_CONFIG_DIR` for `--project` (cwd) or `--config-dir`.
   `addPluginToConfig` is for npm packages / plugin directories only - never for the stderr adapter file (it loads from the discovery dir).

3. Idempotent: skip entries already present; never duplicate.

## Phase 1 — Audit

Report a table:

| Check | Result |
| --- | --- |
| Config file path | … |
| `"plugins"` array | list entries (the stderr adapter file must NOT be here) |
| Stderr discovery copy | `~/.config/opencode/plugins/mnm-no-stderr-redirect/index.ts` present + bytes match source? |
| Plugin loaded | `opencode plugin list` shows `local.mnm-no-stderr-redirect`? (present is not loaded) |
| Duplicate stderr installs | none / list |
| Legacy key `"plugin"` (singular) | warn if present — migrate to `"plugins"` |
| `skills` entries (one per installed toolkit) | list / missing → agent cannot auto-invoke toolkit skills (note: skills do NOT appear in `/` autocomplete — see `commands/` row) |
| `commands/` autocomplete wiring | `~/.config/opencode/commands/<plugin>/<cmd>.md` symlinks present? missing → nothing in `/` suggestions despite skills loading; fix with `shared/bootstrap/scripts/setup-opencode-commands.sh` |
| npm packages registered | which of the four |
| Claude hooks.json in repo | note: not loaded by OpenCode |

## Phase 2 — Install

1. If `--project`: **HITL** — ask before writing shared `opencode.json(c)`.
2. Resolve adapter path; fail if missing on disk.
3. Copy the adapter to the discovery dir per the section above (or `--dry-run` preview of the copy).
4. Wire slash commands for autocomplete (skills alone never surface in `/`
   suggestions — OpenCode only discovers Markdown under `commands/` dirs):

   ```bash
   shared/bootstrap/scripts/setup-opencode-commands.sh        # link all
   shared/bootstrap/scripts/setup-opencode-commands.sh --dry-run  # preview
   ```

   Idempotent; names follow install names in `.claude-plugin/marketplace.json`
   (e.g. `/make-no-mistakes/implement`). Skills-only toolkits
   (e.g. `venture-studio-toolkit`) contribute no commands — expected.
5. If `--also-npm`: for each package, run `npx --yes <pkg> install` with matching
   `--config-dir` / `--dry-run` / force policy consistent with existing CLIs.
   Do not claim stderr is covered by npm install alone.

## Phase 3 - Verify

 1. Discovery copy exists and bytes match the repo source; `opencode plugin list`
    shows `local.mnm-no-stderr-redirect` (loaded - presence alone is not enough).
 2. `shared/bootstrap/scripts/setup-opencode-commands.sh --check` -> `CHECK OK`
    (exit 0 = every expected symlink resolves; orphans pruned on next run).
 3. Offline gate: `python3 shared/hooks/stderr/detect.py --command "$(cat /tmp/opencode/probe.txt)"`
    -> exit **2**, where probe.txt holds a silenced-stderr command written with
    your editor (never type the literal in the shell - the live hook blocks it
    before it runs; that block IS the next check).
 4. Live gate: submit any silenced-stderr command -> expect rejection with
    `PROHIBIDO: no se permite redirigir stderr ...`. A clean command still runs.
 5. No restart needed in the common case - the server hot-reloads the discovery
    dir. If the id is missing from `plugin list`, `opencode service restart`
    is the fallback.
 6. Opt-out reminder: `"plugins": ["-local.mnm-no-stderr-redirect"]` or
    `MNM_DISABLE_STDERR_HOOK=1`.

```bash
npx @chimeranext/better-toolkits doctor
```

Confirm `opencode plugin list` shows `local.mnm-no-stderr-redirect` loaded,
without duplicates unless the user opted out. Then confirm a new session
advertises toolkit skills (e.g. `implement`) - if none appear, the `skills`
array is missing or mispointed (restart is only a fallback).

## Marketplace parity

OpenCode users may still use Claude marketplace plugins in hybrid setups — run the Claude adapter
audit if `claude` is also detected.

## Non-goals (v1)

- Porting Claude PreToolUse/PostToolUse shell catalogs to OpenCode TypeScript plugins.
- Registering all ten vendored `opencode-plugin.ts` copies.
- Integrating third-party `opencode-hooks` / `oh-my-opencode-hooks` npm packages
  (different product — Claude-hook compat layer). Document as optional external
  if the user already uses them; do not require them.

## Deprecated command

**`/make-no-mistakes:opencode-setup` was removed** — use this adapter via
`/toolkits-initial-setup` or `npx @chimeranext/better-toolkits setup`.

## Related

- [`docs/opencode-stderr.md`](../../../../docs/opencode-stderr.md) (monorepo)
- [`shared/hooks/stderr/README.md`](../../../../shared/hooks/stderr/README.md)
- [`protocol.md`](../protocol.md) — bootstrap orchestration
- [`../opencode-mcp-config/protocol.md`](../opencode-mcp-config/protocol.md) —
  remote MCP servers with OAuth on OpenCode (Slack worked example)
