---
description: "Remove the OpenCode auto-update plugin (stops background git-pull updates). Idempotent."
priority: 6
---
# /disable-better-toolkits-auto-update

Removes the OpenCode auto-update plugin so opening OpenCode no longer pulls the
monorepo clone in the background. Idempotent — safe to re-run.

```bash
node <clone>/shared/bootstrap/cli/bin/better-toolkits.js auto-update disable
```

The command removes only `<configDir>/plugins/better-toolkits-auto-update/`
(the discovery-dir copy + mode sidecar). It does **not** touch:

- the stderr adapter (`local.mnm-no-stderr-redirect`) — that is a separate plugin;
- `opencode.json(c)` — no `"plugins"`/`"skills"` keys are written or removed;
- `commands/` symlinks or `skills` entries.

OpenCode unloads the plugin on next start (or `opencode service restart`).

Re-enable any time with `/enable-better-toolkits-auto-update`.

**Not** a make-no-mistakes product command — lives in `shared/bootstrap/`.
