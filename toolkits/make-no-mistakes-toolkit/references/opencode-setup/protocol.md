# /opencode-setup — protocol SSOT

Harness-agnostic body. Thin entries: `commands/opencode-setup.md` (Claude),
optional Cursor skill may point here later.

---

You configure **OpenCode** so better-toolkits **runtime hooks that OpenCode can
load** are registered. Default flow: **audit → install → verify**.

## Honest scope (read this to the user once)

OpenCode does **not** consume Claude Code `hooks/hooks.json` / shell matchers.

| Surface | What `/opencode-setup` does |
| --- | --- |
| **Stderr baseline** (`local.mnm-no-stderr-redirect`) | **Yes** — merge **one** absolute path to `opencode-plugin.ts` into `"plugin"` |
| **npm OpenCode packages** (`@lapc506/…`) | **Optional** `--also-npm` — run their `install` (commands/skills assets + package name in `"plugin"`) |
| **Claude-only hooks** (MNM hygiene, atomic, QA, aaarrr spend-safety, …) | **No** — stay on Claude marketplace plugins until dedicated OpenCode adapters exist |

“All toolkit hooks on OpenCode” today means: **one stderr adapter for the whole
monorepo** (every toolkit vendors the same detector) **plus** optional npm CLIs —
not ten copies of the same plugin and not Claude `hooks.json`.

Key name is **`"plugin"`** (singular). Never write `"plugins"`.

## Arguments

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
2. Walk up from cwd / known clone for `shared/hooks/stderr/adapters/opencode-plugin.ts`
   (monorepo root contains `.claude-plugin/marketplace.json` + `toolkits/`).
3. Fallback: `$CLAUDE_PLUGIN_ROOT/hooks/stderr/adapters/opencode-plugin.ts` or the
   make-no-mistakes toolkit path next to this protocol:
   `toolkits/make-no-mistakes-toolkit/hooks/stderr/adapters/opencode-plugin.ts`.

**Never** register more than one stderr path. If audit finds multiple toolkit
copies already in `"plugin"`, warn; install may leave them (safe) or ask HITL
before collapsing to the preferred path.

## Config file resolution

Same as MNM CLI (`resolveConfigFilePath`):

1. Prefer existing `opencode.json`, else `opencode.jsonc`, else create `opencode.json`.
2. Merge with comment-preserving edits when the file is jsonc (`jsonc-parser` /
   `src/lib/merge-opencode-config.ts` → `addPluginToConfig`). Prefer calling:

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

3. Idempotent: skip if the path (or realpath-equal) is already in `"plugin"`.

## Phase 1 — Audit

Report a table:

| Check | Result |
| --- | --- |
| Config file path | … |
| `"plugin"` array | list entries |
| Stderr adapter present | yes / no (+ path) |
| Duplicate stderr paths | none / list |
| Wrong key `"plugins"` | warn if present |
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
4. Opt-out reminder: `"plugin": ["-local.mnm-no-stderr-redirect"]` or
   `MNM_DISABLE_STDERR_HOOK=1`.

## Non-goals (v1)

- Porting Claude PreToolUse/PostToolUse shell catalogs to OpenCode TypeScript plugins.
- Registering all ten vendored `opencode-plugin.ts` copies.
- Integrating third-party `opencode-hooks` / `oh-my-opencode-hooks` npm packages
  (different product — Claude-hook compat layer). Document as optional external
  if the user already uses them; do not require them.

## Related

- [`docs/opencode-stderr.md`](../../../../docs/opencode-stderr.md) (monorepo)
- [`shared/hooks/stderr/README.md`](../../../../shared/hooks/stderr/README.md)
- `/hygiene-hooks-setup` — Claude settings layer (orthogonal)
- `/clean-code-standards-setup` — docs scaffold only; does not touch OpenCode
