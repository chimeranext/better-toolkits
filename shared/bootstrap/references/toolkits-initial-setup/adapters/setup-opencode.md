# setup-opencode — OpenCode adapter for /toolkits-initial-setup

## CLI entry (no plugin required)

**SSOT** (replaces deprecated `npx @lapc506/make-no-mistakes install`):

```bash
npx @chimeranext/better-toolkits setup
```

Flags (when CLI implemented):

| Flag | Behavior |
|------|----------|
| (default) | detect → audit → propose → **wait for TTY confirm** |
| `--dry-run` | Audit + propose only |
| `--yes` | Apply after non-interactive confirm (CI only; not default) |

Until npm publish, from monorepo clone:

```bash
node shared/bootstrap/cli/bin/better-toolkits.js setup
```

## `opencode.jsonc` merge

Propose append to `plugin` array for **each** selected toolkit's OpenCode adapter path(s).
Use absolute paths. Idempotent: do not duplicate entries.

Stderr (required baseline):

```jsonc
{
  "plugin": [
    "/absolute/path/to/better-toolkits/shared/hooks/stderr/adapters/opencode-plugin.ts"
  ]
}
```

Per-toolkit packages may add their own `plugin` entries — merge all requested toolkits in one
proposal; user approves the combined diff.

## Marketplace parity

OpenCode users may still use Claude marketplace plugins in hybrid setups — run Claude adapter
audit if `claude` is also detected.

## Verify

```bash
npx @chimeranext/better-toolkits doctor
```

Confirm stderr plugin path exists and OpenCode loads without duplicate `-local.mnm-no-stderr-redirect`
unless user opted out.
