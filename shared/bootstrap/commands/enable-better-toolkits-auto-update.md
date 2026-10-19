---
description: "Install/refresh the OpenCode auto-update plugin (discovery-dir copy + mode sidecar). Idempotent."
priority: 6
---
# /enable-better-toolkits-auto-update

Installs (or refreshes) the OpenCode auto-update plugin so opening OpenCode pulls
the monorepo clone and re-runs the wiring. Idempotent — safe to re-run.

Read and run [`../scripts/update-better-toolkits-marketplace-opencode.sh`](../scripts/update-better-toolkits-marketplace-opencode.sh)
(SSOT for what the plugin does), then:

```bash
node <clone>/shared/bootstrap/cli/bin/better-toolkits.js auto-update enable
```

The command:

1. Copies `shared/bootstrap/opencode-plugins/better-toolkits-auto-update/index.ts`
   to `<configDir>/plugins/better-toolkits-auto-update/index.ts` (a copy, never a
   symlink, never a `"plugins"` array entry).
2. Writes the mode sidecar `<configDir>/plugins/better-toolkits-auto-update/config.json`
   (`cloneRoot`, `expertMode`, `branch`). An existing sidecar keeps its mode, so
   an author clone (`--expert-mode`) stays expert.

Verify:

```bash
opencode plugin list   # shows local.better-toolkits-auto-update
```

To stop background updates without uninstalling, set `BETTER_TOOLKITS_AUTO_UPDATE=0`.
To remove the plugin entirely, use `/disable-better-toolkits-auto-update`.

**Not** a make-no-mistakes product command — lives in `shared/bootstrap/`.
