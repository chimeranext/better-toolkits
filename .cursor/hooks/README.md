# Cursor hooks (better-toolkits dogfood)

This monorepo wires the same **shared** adapters consumers install from toolkits:

| Hook | Wrapper | SSOT |
| --- | --- | --- |
| stderr preserve | `stderr-before-shell.sh` | [`shared/hooks/stderr/`](../../shared/hooks/stderr/) |
| PRDS body / push gate | `prds-before-shell.sh` | [`shared/hooks/prds/`](../../shared/hooks/prds/) |

Registered in [`.cursor/hooks.json`](../hooks.json). OpenCode uses the TypeScript plugins under `shared/hooks/*/adapters/opencode-plugin.ts` instead.

Opt-out: `MNM_DISABLE_STDERR_HOOK=1`, `FCTO_DISABLE_PRDS_HOOK=1`, or per-repo JSON under `.claude/config/` (see each hook README).
