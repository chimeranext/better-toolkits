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

That flow copies the dependency-free adapter to the global discovery dir
`~/.config/opencode/plugins/mnm-no-stderr-redirect/index.ts` (no `"plugins"`
array entry - file entries are rejected on v2.0.5). Do not install every
toolkit's vendored copy (same plugin id) - one installed copy only.

## Manual registration

Copy the adapter (never symlink) to the discovery dir:

```bash
PLUGIN_DIR=~/.config/opencode/plugins/mnm-no-stderr-redirect
mkdir -p "$PLUGIN_DIR"
cp shared/hooks/stderr/adapters/opencode-plugin.ts "$PLUGIN_DIR/index.ts"
```

From any single toolkit copy, replace the source path with
`toolkits/<name>/hooks/stderr/adapters/opencode-plugin.ts`.

Verify the plugin id is LOADED (presence is not enough):

```bash
opencode plugin list  # must show local.mnm-no-stderr-redirect
```

Then submit any silenced-stderr command and expect the PROHIBIDO rejection;
a clean command still runs. No restart needed in the common case
(hot-reload); `opencode service restart` is the fallback.

> v1 key `"plugin"` (singular) is ignored by opencode v2 - entries under it
> silently do nothing. Verified on opencode v2.0.4.

Disable: `"plugins": ["-local.mnm-no-stderr-redirect"]` or `MNM_DISABLE_STDERR_HOOK=1`.

## Register toolkit skills (or commands stay invisible)

The stderr adapters only register the hook — they never expose toolkit
commands. Opencode v2 discovers skills in `toolkits/*/skills/` via explicit
`skills` config entries (alternatively: drop/symlink them into an
auto-discovery dir — `~/.config/opencode/skills`, `~/.claude/skills`,
`~/.agents/skills`, project `.opencode/skills`). Without either,
`/toolkits-initial-setup` completes but opencode2 sees zero monorepo
commands. Add one entry per installed toolkit:

```jsonc
{
  "skills": [
    "/absolute/path/to/better-toolkits/toolkits/make-no-mistakes-toolkit/skills"
  ]
}
```

Verify: restart (`opencode2 service restart`) — new sessions advertise the
skills (e.g. `implement`, `sync-advisor`).

## Toolkits with npm OpenCode CLI

`make-no-mistakes`, `app-gtm-release`, `atomic-design`, `business-model` — run their
`npx @chimeranext/<pkg> install` **and** ensure the stderr file plugin path above is
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
