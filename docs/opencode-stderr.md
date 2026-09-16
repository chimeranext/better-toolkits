# OpenCode — stderr baseline

Every toolkit vendors `hooks/stderr/` (synced from monorepo [`shared/hooks/stderr/`](../shared/hooks/stderr/)).

## Preferred: bootstrap (`/toolkits-initial-setup` or CLI)

Install bootstrap first, then run the OpenCode adapter:

```bash
claude plugin install better-toolkits-bootstrap@better-toolkits
# /toolkits-initial-setup
```

Headless / OpenCode-only:

```bash
npx @chimeranext/better-toolkits setup
npx @chimeranext/better-toolkits setup --dry-run
# optional npm CLIs after stderr:
npx @chimeranext/better-toolkits setup --also-npm
# shared repo config (HITL):
npx @chimeranext/better-toolkits setup --project
```

Protocol SSOT:
[`shared/bootstrap/references/toolkits-initial-setup/adapters/setup-opencode.md`](../shared/bootstrap/references/toolkits-initial-setup/adapters/setup-opencode.md).

That flow merges **one** absolute path to `opencode-plugin.ts` into the OpenCode
**`"plugins"`** array. Do not register every toolkit’s vendored copy (same plugin id).

## Manual registration

In `~/.config/opencode/opencode.jsonc` (or project config):

```jsonc
{
  "plugins": [
    "/absolute/path/to/better-toolkits/shared/hooks/stderr/adapters/opencode-plugin.ts"
  ]
}
```

Or any single toolkit copy under `toolkits/<name>/hooks/stderr/adapters/opencode-plugin.ts`.

Disable: `"plugins": ["-local.mnm-no-stderr-redirect"]` or `MNM_DISABLE_STDERR_HOOK=1`.

## Toolkits with npm OpenCode CLI

`make-no-mistakes`, `app-gtm-release`, `atomic-design`, `business-model` — run their
`npx @lapc506/<pkg> install` **and** ensure the stderr file plugin path above is
present (or use bootstrap `setup --also-npm`). Install registers the package plugin;
stderr is the local file adapter.

## Toolkits without npm CLI yet

`aaarrr-flywheel`, `fractional-cto`, `instructional-design`, `launchpad`, `ux-research`,
`venture-studio` — Claude plugin install covers `hooks.json`; for OpenCode use
`/toolkits-initial-setup` (or the file-plugin path above). Claude-only hooks are **not**
ported by the bootstrap adapter.

## Deprecated

**`/make-no-mistakes:opencode-setup`** — removed; use bootstrap above.

## Not this command

Third-party packages such as [`opencode-hooks`](https://www.npmjs.com/package/opencode-hooks)
(Claude-hook compatibility for OpenCode) are optional and separate — bootstrap setup
does not install them.
