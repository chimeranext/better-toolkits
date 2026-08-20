# OpenCode — stderr baseline (all better-toolkits)

Every toolkit vendors `hooks/stderr/` (synced from monorepo [`shared/hooks/stderr/`](../shared/hooks/stderr/)).

## Register the plugin

In `~/.config/opencode/opencode.jsonc` (or project config), add the **absolute** path to the adapter shipped with the toolkit you installed:

```jsonc
{
  "plugin": [
    "/absolute/path/to/<toolkit>/hooks/stderr/adapters/opencode-plugin.ts"
  ]
}
```

Or from a clone of this monorepo:

```bash
# Example: instructional-design only
node -e '
const fs=require("fs");const path=require("path");
const cfg=path.join(process.env.HOME,".config/opencode/opencode.jsonc");
const plugin=path.resolve("toolkits/instructional-design-toolkit/hooks/stderr/adapters/opencode-plugin.ts");
let raw=fs.existsSync(cfg)?fs.readFileSync(cfg,"utf8"):"{}";
// Prefer manual edit if jsonc has comments; otherwise:
console.log("Add to plugin array:\n  "+JSON.stringify(plugin));
'
```

Disable: `"plugin": ["-local.mnm-no-stderr-redirect"]` or `MNM_DISABLE_STDERR_HOOK=1`.

## Toolkits with npm OpenCode CLI

`make-no-mistakes`, `app-gtm-release`, `atomic-design`, `business-model` — run their `npx @lapc506/<pkg> install` **and** ensure the stderr file plugin path above is present (install registers the package plugin; stderr is the local file adapter).

## Toolkits without npm CLI yet

`aaarrr-flywheel`, `fractional-cto`, `instructional-design`, `launchpad`, `ux-research`, `venture-studio` — Claude plugin install covers hooks.json; for OpenCode use the file-plugin registration above until a full CLI ships.
