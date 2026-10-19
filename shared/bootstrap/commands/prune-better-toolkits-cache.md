---
description: "After any better-toolkits version bump — purge ALL cached plugin trees (Cursor) or managed artifacts (OpenCode), then re-sync. No per-toolkit slug."
priority: 6
---
# /prune-better-toolkits-cache

Maintainers: when `scripts/ci/marketplace_versioning.py write` bumps **any** plugin version in
`.claude-plugin/marketplace.json`, stale copies can survive. Run the script for **each harness
you use** — they are independent targets.

**Always purge the full cache** — not a single toolkit. A bump can touch bootstrap, make-no-mistakes,
assurance, etc.; leaving one slug behind keeps stale skills/commands.

## Cursor

Read and run [`../scripts/prune-better-toolkits-cache-cursor.sh`](../scripts/prune-better-toolkits-cache-cursor.sh).

```bash
bash shared/bootstrap/scripts/prune-better-toolkits-cache-cursor.sh
```

1. Logs every cached `plugin.json` version (via `jq`) to `~/.cursor/hooks/logs/prune-better-toolkits-cache-cursor-*.out.log`.
2. Removes **only** these two fixed paths (entire directories, if present):
   - `~/.cursor/plugins/cache/chimeranext-better-toolkits`
   - `~/.cursor/plugins/cache/better-toolkits`
3. Runs `agent plugin marketplace update better-toolkits`.

It does **not** iterate plugin slugs or delete arbitrary paths under `~/.cursor/plugins/cache/`.

## OpenCode

Read and run [`../scripts/prune-better-toolkits-cache-opencode.sh`](../scripts/prune-better-toolkits-cache-opencode.sh).

```bash
bash shared/bootstrap/scripts/prune-better-toolkits-cache-opencode.sh
```

OpenCode has no marketplace plugin cache; its cached copies are the discovery-dir plugin
copies, the `commands/` symlinks and the npm CLI installs. The script removes **only** these
fixed paths under `<configDir>` (default `~/.config/opencode`, or `$OPENCODE_CONFIG_DIR`):

- `plugins/mnm-no-stderr-redirect/` — stderr adapter copy
- `plugins/better-toolkits-auto-update/` — auto-update plugin copy
- `commands/` — command symlinks
- `node_modules/` — npm CLI installs

It never touches `opencode.json(c)` (`"plugins"`/`"skills"` entries are absolute paths into the
clone, not cached copies), then re-runs the wiring via `better-toolkits self-update --harness
opencode --no-pull`. Pass `--also-npm` to reinstall the four `@chimeranext/*` CLIs afterwards.

If Cursor still shows old behaviour, re-install enabled toolkits per
[`setup-cursor.md`](../references/toolkits-initial-setup/adapters/setup-cursor.md) (bootstrap + product plugins).

## Inspect versions only (Cursor, manual)

```bash
find "${HOME}/.cursor/plugins/cache/chimeranext-better-toolkits" \
  -path '*/.claude-plugin/plugin.json' -print0 \
  | xargs -0 -I{} sh -c 'jq -r ".version" "{}" | xargs -Iver echo "ver\t{}"'
```

**Not** a make-no-mistakes product command — lives in `shared/bootstrap/`.
