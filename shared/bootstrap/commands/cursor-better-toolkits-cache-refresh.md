---
description: "After any better-toolkits marketplace version bump — purge ALL cached Cursor plugin trees, then marketplace update (no per-toolkit slug)."
priority: 6
---
# /cursor-better-toolkits-cache-refresh

Maintainers: when `scripts/ci/marketplace_versioning.py write` bumps **any** plugin version in
`.claude-plugin/marketplace.json`, Cursor may keep old copies under
`~/.cursor/plugins/cache/chimeranext-better-toolkits/` (legacy: `.../better-toolkits/`).

**Always purge the full cache** — not a single toolkit. A bump can touch bootstrap, make-no-mistakes,
assurance, etc.; leaving one slug behind keeps stale skills/commands.

Read and run [`../scripts/refresh-cursor-better-toolkits-plugin-cache.sh`](../scripts/refresh-cursor-better-toolkits-plugin-cache.sh).

## Run (no arguments)

```bash
bash shared/bootstrap/scripts/refresh-cursor-better-toolkits-plugin-cache.sh
```

The script:

1. Logs every cached `plugin.json` version (via `jq`) to `~/.cursor/hooks/logs/`.
2. Removes **only** these two fixed paths (entire directories, if present):
   - `~/.cursor/plugins/cache/chimeranext-better-toolkits`
   - `~/.cursor/plugins/cache/better-toolkits`
3. Runs `agent plugin marketplace update better-toolkits`.

It does **not** iterate plugin slugs or delete arbitrary paths under `~/.cursor/plugins/cache/`.

If Cursor still shows old behaviour, re-install enabled toolkits per
[`setup-cursor.md`](../references/toolkits-initial-setup/adapters/setup-cursor.md) (bootstrap + product plugins).

## Inspect versions only (manual)

```bash
find "${HOME}/.cursor/plugins/cache/chimeranext-better-toolkits" \
  -path '*/.claude-plugin/plugin.json' -print0 \
  | xargs -0 -I{} sh -c 'jq -r ".version" "{}" | xargs -Iver echo "ver\t{}"'
```

**Not** a make-no-mistakes product command — lives in `shared/bootstrap/`.
