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

In `~/.config/opencode/opencode.json` (or project config):

```jsonc
{
  "plugins": [
    "/absolute/path/to/better-toolkits/shared/hooks/stderr/adapters/opencode-plugin.ts"
  ]
}
```

Or any single toolkit copy under `toolkits/<name>/hooks/stderr/adapters/opencode-plugin.ts`.

> v1 key `"plugin"` (singular) is ignored by opencode v2 — entries under it
> silently do nothing. Verified on opencode v2.0.4.

Or from a clone of this monorepo:

```bash
# Shared baseline only (same plugin id in every toolkit adapter)
node -e '
const fs=require("fs");const path=require("path");
const cfg=path.join(process.env.HOME,".config/opencode/opencode.json");
const plugin=path.resolve("shared/hooks/stderr/adapters/opencode-plugin.ts");
let raw=fs.existsSync(cfg)?fs.readFileSync(cfg,"utf8"):"{}";
// Prefer manual edit if jsonc has comments; otherwise:
console.log("Add to plugins array:\n  "+JSON.stringify(plugin));
'
```

Disable: `"plugins": ["-local.mnm-no-stderr-redirect"]` or `MNM_DISABLE_STDERR_HOOK=1`.

## Register toolkit skills (or commands stay invisible)

The stderr adapters only register the hook — toolkit slash-commands/skills live
in `toolkits/*/skills/` and opencode v2 discovers them **only** via explicit
`skills` config entries (plus `~/.config/opencode/skills`,
`~/.claude/skills`, `~/.agents/skills`, project `.opencode/skills`). Without
this, `/toolkits-initial-setup` completes but opencode2 sees zero monorepo
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
