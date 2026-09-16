# OpenCode — stderr baseline + `/opencode-setup`

Every toolkit vendors `hooks/stderr/` (synced from monorepo [`shared/hooks/stderr/`](../shared/hooks/stderr/)).

## Preferred: `/opencode-setup`

From a checkout that has **make-no-mistakes** available (marketplace plugin or this
monorepo):

```text
/make-no-mistakes:opencode-setup
/make-no-mistakes:opencode-setup install --dry-run
/make-no-mistakes:opencode-setup --also-npm
/make-no-mistakes:opencode-setup --project   # HITL — shared repo opencode.json(c)
```

Protocol SSOT:
[`toolkits/make-no-mistakes-toolkit/references/opencode-setup/protocol.md`](../toolkits/make-no-mistakes-toolkit/references/opencode-setup/protocol.md).

That command merges **one** absolute path to `opencode-plugin.ts` into the OpenCode
**`"plugin"`** array (singular — not `"plugins"`). Do not register every toolkit’s
vendored copy (same plugin id).

## Manual registration

In `~/.config/opencode/opencode.jsonc` (or project config):

```jsonc
{
  "plugin": [
    "/absolute/path/to/better-toolkits/shared/hooks/stderr/adapters/opencode-plugin.ts"
  ]
}
```

Or any single toolkit copy under `toolkits/<name>/hooks/stderr/adapters/opencode-plugin.ts`.

Disable: `"plugin": ["-local.mnm-no-stderr-redirect"]` or `MNM_DISABLE_STDERR_HOOK=1`.

## Toolkits with npm OpenCode CLI

`make-no-mistakes`, `app-gtm-release`, `atomic-design`, `business-model` — run their
`npx @lapc506/<pkg> install` **and** ensure the stderr file plugin path above is
present (or use `/opencode-setup --also-npm`). Install registers the package plugin;
stderr is the local file adapter.

## Toolkits without npm CLI yet

`aaarrr-flywheel`, `fractional-cto`, `instructional-design`, `launchpad`, `ux-research`,
`venture-studio` — Claude plugin install covers `hooks.json`; for OpenCode use
`/opencode-setup` (or the file-plugin path above). Claude-only hooks are **not**
ported by this command.

## Not this command

Third-party packages such as [`opencode-hooks`](https://www.npmjs.com/package/opencode-hooks)
(Claude-hook compatibility for OpenCode) are optional and separate — `/opencode-setup`
does not install them.
