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

Propose append to `plugins` array (**plural** — opencode v2 ignores the v1
singular `plugin` key) for the **shared** stderr baseline adapter, plus one
`skills` entry per selected toolkit (adapters only register the stderr hook;
without `skills` entries opencode2 sees zero monorepo commands).
Use absolute paths. Idempotent: do not duplicate entries.

Stderr (required baseline, shared — same plugin id in every toolkit adapter):

```jsonc
{
  "plugins": [
    "/absolute/path/to/better-toolkits/shared/hooks/stderr/adapters/opencode-plugin.ts"
  ],
  "skills": [
    "/absolute/path/to/better-toolkits/toolkits/<toolkit>/skills"
  ]
}
```

## Marketplace parity

OpenCode users may still use Claude marketplace plugins in hybrid setups — run Claude adapter
audit if `claude` is also detected.

## Verify

```bash
npx @chimeranext/better-toolkits doctor
```

Confirm stderr plugin path exists and OpenCode loads without duplicate `-local.mnm-no-stderr-redirect`
unless user opted out. Confirm the skills resolve: restart (`opencode2 service restart`) and check
that a new session advertises toolkit skills (e.g. `implement`); if none appear, the `skills`
array is missing or points at wrong paths (adapters alone never expose commands).
