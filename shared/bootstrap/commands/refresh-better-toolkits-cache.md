---
description: "Update better-toolkits (git pull --ff-only the monorepo clone) + re-run harness wiring (Cursor, OpenCode). Never purges caches."
priority: 6
---
# /refresh-better-toolkits-cache

Updates the installed better-toolkits to the latest clone state and re-runs
per-harness wiring. This command **NEVER deletes anything** — it does not purge
caches and never invokes a prune script. For stale cached copies, see
`/prune-better-toolkits-cache` (separate command, either order, or standalone).

The source of truth is **`git pull --ff-only` on the monorepo clone** — never an
npm publish. Branch policy: always converge on `main` unless the clone was set
up with `--expert-mode` (author flow), which never switches branch and never
touches a dirty tree.

## OpenCode

Read and run [`../scripts/update-better-toolkits-marketplace-opencode.sh`](../scripts/update-better-toolkits-marketplace-opencode.sh).

```bash
bash shared/bootstrap/scripts/update-better-toolkits-marketplace-opencode.sh
```

Equivalent direct invocation:

```bash
node <clone>/shared/bootstrap/cli/bin/better-toolkits.js self-update --harness opencode
```

1. Fast-forwards the clone's `main` (skips a dirty tree, never force-merges).
2. Re-syncs the wiring idempotently: discovery-dir stderr copy, `commands/`
   symlinks, `skills` entries, auto-update plugin.
3. **Restart automático** — el script ejecuta `opencode service restart` tras un
   self-update exitoso (sí o sí), para que los plugins re-sincronizados
   (`mnm-no-stderr-redirect`, `auto-update`) queden cargados. No requiere acción
   manual.

## Cursor CLI + Cursor Desktop

Cursor CLI and Cursor Desktop are **independent targets**: updating one does not
imply the other. Verify each one you use.

Read and run [`../scripts/update-better-toolkits-marketplace-cursor.sh`](../scripts/update-better-toolkits-marketplace-cursor.sh).

```bash
bash shared/bootstrap/scripts/update-better-toolkits-marketplace-cursor.sh
```

1. Fast-forwards the clone's `main`.
2. Runs `agent plugin marketplace update better-toolkits`.

Verify:

```bash
agent plugin marketplace list
agent plugin list
```

## Cursor Desktop (UI)

UI evidence (screenshots, Linux): the marketplace page only offers **Add / Added / Remove**
per toolkit and an **Import Marketplace** dialog (Repository URL + Scope User/Org).
There is no **Refresh** button — so the OpenCode-style `marketplace update` path does not
exist in the Desktop UI. After a bump, either run the Cursor CLI line above or use
**Remove + Add** for each toolkit.

## Background (no command needed)

With the auto-update plugin installed, OpenCode runs this refresh itself at startup
(`better-toolkits-auto-update` in the discovery dir). Control it with:

```bash
better-toolkits auto-update enable | disable
BETTER_TOOLKITS_AUTO_UPDATE=0   # soft-disable without uninstalling
```

**Not** a make-no-mistakes product command — lives in `shared/bootstrap/`.
