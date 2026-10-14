---
description: "Update better-toolkits marketplace + re-run harness wiring (Cursor CLI, Cursor Desktop, OpenCode). Never purges caches."
priority: 6
---
# /refresh-better-toolkits-cache

Updates the installed better-toolkits to the latest marketplace state and re-runs
per-harness wiring. This command **NEVER deletes anything** — it does not purge
caches and never invokes the prune script. For stale cached copies, see
`/prune-better-toolkits-cache` (separate command, either order, or standalone).

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

UI evidence (screenshots, Linux): the marketplace page only offers **Add / Added / Remove**
per toolkit and an **Import Marketplace** dialog (Repository URL + Scope User/Project).
**There is no Refresh or Update button.** (Unlike Dashboard→Plugins web docs, which describe
a different surface.)

Desktop refresh = reinstall:

1. On the marketplace page, toolkit `...` menu → **Remove**.
2. **Add** again in the needed scope (User/Project).
3. Restart or refocus the window — the client re-resolves plugins on startup/focus.
4. Verify on disk: `~/.cursor/plugins/cache/*/*/` dirs are named by commit SHA;
   check version in `.cursor-plugin/plugin.json`.

If the old version persists after reinstall, that is the pinning bug documented below —
run `/prune-better-toolkits-cache` and reinstall again.

Known upstream bugs (forum reports, not official docs — including vendor repro
acknowledgment; re-verify before citing elsewhere):
- https://forum.cursor.com/t/plugin-update-version-management-how-are-installed-plugins-updated/166454
- https://forum.cursor.com/t/plugin-marketplace-sync-is-stale-causing-update-reinstall-in-settings-to-have-no-effect/165660
- https://forum.cursor.com/t/team-marketplace-auto-refresh-does-not-pick-up-plugin-changes-manual-refresh-cache-clear-reinstall-required/154675

In short: personal marketplaces added via `/add-plugin` stay pinned to the
original commit and Update/Reinstall re-applies the same snapshot;
team-marketplace Auto Refresh is unreliable for content updates. If refresh
doesn't take, run `/prune-better-toolkits-cache`, then refresh again.

## OpenCode

OpenCode has no plugin cache to purge — refresh is re-running setup, which rewrites
the skills wiring in `opencode.json` (see
[`setup-opencode.md`](../references/toolkits-initial-setup/adapters/setup-opencode.md)):

```bash
npx @chimeranext/better-toolkits setup
```

## If behavior stays stale

Do **not** purge from here. If old behavior persists after refresh, run
`/prune-better-toolkits-cache` (deletes stale Cursor cache trees), then refresh again.

**Not** a make-no-mistakes product command — lives in `shared/bootstrap/`.
