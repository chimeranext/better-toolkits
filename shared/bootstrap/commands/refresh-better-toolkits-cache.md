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

Evidencia de UI (screenshots, Linux): la página de marketplace solo ofrece
**Add / Added / Remove** por toolkit y un diálogo **Import Marketplace**
(Repository URL + Scope User/Project). **No hay botón Refresh ni Update.**
(A diferencia de lo que sugieren los docs web de Dashboard→Plugins, que
describen otra superficie.)

Refresh en Desktop = reinstalar:

1. En la página del marketplace, menú `...` del toolkit → **Remove**.
2. **Add** de nuevo en el scope necesario (User/Project).
3. Reiniciar o re-enfocar la ventana — el cliente re-resuelve plugins al inicio/foco.
4. Verificar en disco: `~/.cursor/plugins/cache/*/*/` lleva SHA de commit;
   revisar versión en `.cursor-plugin/plugin.json`.

Si tras reinstalar sigue la versión vieja, es el bug de pinning documentado
abajo — pasar a `/prune-better-toolkits-cache` y reinstalar de nuevo.

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
`/cursor-better-toolkits-cache-refresh` (deletes stale Cursor cache trees), then refresh again.

**Not** a make-no-mistakes product command — lives in `shared/bootstrap/`.
