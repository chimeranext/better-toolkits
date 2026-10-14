---
description: "Update better-toolkits marketplace + re-run harness wiring (Cursor and OpenCode). Never purges caches."
priority: 6
---
# /refresh-better-toolkits-cache

Updates the installed better-toolkits to the latest marketplace state and re-runs
per-harness wiring. This command **NEVER deletes anything** — it does not purge
caches and never invokes the prune script. For stale cached copies, see
`/cursor-better-toolkits-cache-refresh` (purge; `/prune-better-toolkits-cache` when shipped) —
separate command, either order, or standalone.

## Cursor

```bash
agent plugin marketplace update better-toolkits
```

Then re-install enabled toolkits per
[`setup-cursor.md`](../references/toolkits-initial-setup/adapters/setup-cursor.md)
(bootstrap + product plugins).

Verify:

```bash
agent plugin marketplace list
agent plugin list
```

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
