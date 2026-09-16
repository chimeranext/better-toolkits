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
| **Stderr baseline** (`local.mnm-no-stderr-redirect`) | **Yes** — merge **one** absolute path to `opencode-plugin.ts` into `"plugins"` |
| **npm OpenCode packages** (`@lapc506/…`) | **Optional** `--also-npm` — run their `install` (commands/skills assets + package name in `"plugins"`) |
| **Claude-only hooks** (MNM hygiene, atomic, QA, aaarrr spend-safety, …) | **No** — stay on Claude marketplace plugins until dedicated OpenCode adapters exist |

“All toolkit hooks on OpenCode” today means: **one stderr adapter for the whole
monorepo** (every toolkit vendors the same detector) **plus** optional npm CLIs —
not ten copies of the same plugin and not Claude `hooks.json`.

Key name is **`"plugins"`** (OpenCode V2). Do not write legacy `"plugin"` (singular).

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

**Never** register more than one stderr path. If audit finds multiple toolkit
copies already in `"plugins"`, warn; install may leave them (safe) or ask HITL
before collapsing to the preferred path.

## `opencode.jsonc` merge

Propose append to the **`plugins`** array with the **shared** stderr baseline
(one path — never one adapter per toolkit, same plugin id), plus one **`skills`**
entry per selected toolkit (adapters only register the stderr hook; without
`skills` entries opencode2 sees zero monorepo commands).
Use absolute paths. Idempotent: do not duplicate entries.

Stderr (required baseline) + toolkit skills:

```jsonc
{
  "plugins": [
    "/absolute/path/to/better-toolkits/shared/hooks/stderr/adapters/opencode-plugin.ts"
  ],
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
   Set `MNM_STDERR_PLUGIN_PATH` to the resolved absolute adapter path.

3. Idempotent: skip if the path (or realpath-equal) is already in `"plugins"`.

## Phase 1 — Audit

Report a table:

| Check | Result |
| --- | --- |
| Config file path | … |
| `"plugins"` array | list entries |
| Stderr adapter present | yes / no (+ path) |
| Duplicate stderr paths | none / list |
| Legacy key `"plugin"` (singular) | warn if present — migrate to `"plugins"` |
| `skills` entries (one per installed toolkit) | list / missing → commands invisible |
| npm packages registered | which of the four |
| Claude hooks.json in repo | note: not loaded by OpenCode |

## Phase 2 — Install

1. If `--project`: **HITL** — ask before writing shared `opencode.json(c)`.
2. Resolve adapter path; fail if missing on disk.
3. `addPluginToConfig` (or `--dry-run`).
4. If `--also-npm`: for each package, run `npx --yes <pkg> install` with matching
   `--config-dir` / `--dry-run` / force policy consistent with existing CLIs.
   Do not claim stderr is covered by npm install alone.

## Phase 3 — Verify

1. Config still parses; stderr path still listed and `test -e` succeeds.
2. Optional: `python3 <adapter-dir>/../detect.py --command 'echo hi 2>/dev/null'`
   → expect exit **2** (blocked). Allowed example: `… 2>&1 | tee /tmp/opencode-setup.log`.
3. Tell the user to **restart OpenCode** so plugins reload.
4. Opt-out reminder: `"plugins": ["-local.mnm-no-stderr-redirect"]` or
   `MNM_DISABLE_STDERR_HOOK=1`.

```bash
npx @chimeranext/better-toolkits doctor
```

Confirm stderr plugin path exists and OpenCode loads without duplicate
`-local.mnm-no-stderr-redirect` unless user opted out. After `opencode2 service
restart`, confirm a new session advertises toolkit skills (e.g. `implement`) —
if none appear, the `skills` array is missing or mispointed.

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
