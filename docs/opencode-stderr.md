# OpenCode — stderr baseline + skills wiring (all better-toolkits)

Every toolkit vendors `hooks/stderr/` (synced from monorepo [`shared/hooks/stderr/`](../shared/hooks/stderr/)).

## Register the plugin (opencode v2: `plugins`, plural)

In `~/.config/opencode/opencode.json` (or project config), add the **absolute**
path to the **shared** baseline adapter (all toolkit adapters share the same
plugin id `local.mnm-no-stderr-redirect` — registering more than one is
redundant):

```jsonc
{
  "plugins": [
    "/absolute/path/to/better-toolkits/shared/hooks/stderr/adapters/opencode-plugin.ts"
  ]
}
```

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

`make-no-mistakes`, `app-gtm-release`, `atomic-design`, `business-model` — run their `npx @lapc506/<pkg> install` **and** ensure the stderr file plugin path above is present (install registers the package plugin; stderr is the local file adapter).

## Toolkits without npm CLI yet

`aaarrr-flywheel`, `fractional-cto`, `instructional-design`, `launchpad`, `ux-research`, `venture-studio` — Claude plugin install covers hooks.json; for OpenCode use the file-plugin registration above until a full CLI ships.
