---
description: "Update better-toolkits marketplace + re-run harness wiring (Cursor CLI, Cursor Desktop, OpenCode). Never purges caches."
priority: 6
---
# /refresh-better-toolkits-cache

Updates the installed better-toolkits to the latest marketplace state and re-runs
per-harness wiring. This command **NEVER deletes anything** — it does not purge
caches and never invokes the prune script. For stale cached copies, see
`/cursor-better-toolkits-cache-refresh` (purge; `/prune-better-toolkits-cache` when shipped) —
separate command, either order, or standalone.

Cursor CLI and Cursor Desktop are treated as **independent targets**: updating one
does not imply the other. Verify each one you use.

## Cursor CLI (`agent`)

```bash
agent plugin marketplace update better-toolkits
```

Verify:

```bash
agent plugin marketplace list
agent plugin list
```

## Cursor Desktop (UI)

Docs: https://cursor.com/docs/plugins (Customize page, Dashboard → Plugins).

1. **Team marketplace**: Dashboard → Plugins → Refresh button (or enable Auto Refresh;
   note it re-indexes at most every 10 min and may miss new plugins — re-import the
   repo URL if a new plugin doesn't appear).
2. **Installed plugins**: Customize page in the sidebar → find the plugin → reinstall
   at the needed scope (user/workspace). Restart or refocus the window afterwards —
   the client re-resolves plugins on startup/focus.
3. Verify on disk: `~/.cursor/plugins/cache/*/*/` dirs are named by commit SHA;
   check `.cursor-plugin/plugin.json` version inside.

Known upstream bugs (do not work around from here, just know them): personal
marketplaces added via `/add-plugin` stay pinned to the original commit and
Update/Reinstall re-applies the same snapshot; team-marketplace Auto Refresh is
unreliable for content updates. If refresh doesn't take, run
`/prune-better-toolkits-cache`, then refresh again.

## OpenCode

OpenCode has no plugin cache to purge — refresh is re-running setup, which rewrites
the skills wiring in `opencode.json` (see
[`setup-opencode.md`](../references/toolkits-initial-setup/adapters/setup-opencode.md)):

```bash
npx @chimeranext/better-toolkits setup
```

## If behavior stays stale

Do **not** purge from here. If old behavior persists after refresh, run
`/cursor-better-toolkits-cache-refresh` (deletes stale Cursor cache trees), then refresh again.

**Not** a make-no-mistakes product command — lives in `shared/bootstrap/`.
