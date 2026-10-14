# setup-cursor — Cursor adapter for /toolkits-initial-setup

## Marketplace

```bash
agent plugin marketplace add chimeranext/better-toolkits
agent plugin marketplace list
```

Audit for duplicate registrations (same `gitUrl`, different name). Remove orphans only after HITL
(e.g. `agent plugin marketplace remove <orphan-slug>`).

```bash
agent plugin install better-toolkits-bootstrap@better-toolkits
# Product toolkits (after bootstrap):
agent plugin install make-no-mistakes@better-toolkits
```

## Stderr + PRDS — `beforeShellExecution`

Propose merge into **user** or **project** `hooks.json` (ask which). Idempotent: skip if entries
already point at `cursor-before-shell.sh` from this marketplace.

**better-toolkits monorepo (dogfood):** [`.cursor/hooks.json`](../../../../.cursor/hooks.json)
wires stderr + PRDS via [`.cursor/hooks/`](../../../../.cursor/hooks/) wrappers — same SSOT as
OpenCode plugins under `shared/hooks/*/adapters/`. Reload the workspace after pull.

**From monorepo clone** (consumers without the committed `.cursor` tree):

```json
{
  "version": 1,
  "hooks": {
    "beforeShellExecution": [
      {
        "command": "bash ${workspaceFolder}/shared/hooks/stderr/adapters/cursor-before-shell.sh",
        "failClosed": true
      },
      {
        "command": "bash ${workspaceFolder}/shared/hooks/prds/adapters/cursor-before-shell.sh"
      }
    ]
  }
}
```

**From installed plugin** — if Cursor exposes plugin root, prefer vendored path under the toolkit;
otherwise copy `shared/hooks/stderr` or reference absolute path to clone.

User-global example (`~/.cursor/hooks.json`):

```json
{
  "version": 1,
  "hooks": {
    "beforeShellExecution": [
      {
        "command": "bash /absolute/path/to/better-toolkits/shared/hooks/stderr/adapters/cursor-before-shell.sh"
      }
    ]
  }
}
```

## Optional — marketplace auto-update (checkbox, default OFF)

**Do not** register silently on plugin install. Only when user opts in during Phase 4:

1. Copy or reference `shared/bootstrap/scripts/update-better-toolkits-marketplace.sh` (or user script).
2. Append to `hooks.json`:

```json
"workspaceOpen": [
  {
    "command": "bash ~/.cursor/hooks/update-better-toolkits-marketplace.sh"
  }
]
```

Script requirements (see design):

- Logs to `~/.cursor/hooks/logs/update-better-toolkits-marketplace-*.out|err.log`
- Throttle (~30 min), fail-open (`exit 0`)
- Runs `agent plugin marketplace update better-toolkits`
- No `2>/dev/null`

## After marketplace version bump (maintainers)

CI requires a version bump in `.claude-plugin/marketplace.json` when release-relevant
files change (`scripts/ci/marketplace_versioning.py`). Cursor does not always drop stale
cached plugin trees after `agent plugin marketplace update`.

1. List cached versions (optional):

```bash
find "${HOME}/.cursor/plugins/cache/chimeranext-better-toolkits" \
  -path '*/.claude-plugin/plugin.json' \
  -exec jq -r '.version' {} \;
```

2. Purge the **whole** marketplace cache directories (script logs to `~/.cursor/hooks/logs/`).
   Fixed paths only: `~/.cursor/plugins/cache/chimeranext-better-toolkits` and
   `~/.cursor/plugins/cache/better-toolkits` (legacy). Do not delete individual plugin
   slugs by hand after a bump — stale siblings break skills/commands.

```bash
bash shared/bootstrap/scripts/refresh-cursor-better-toolkits-plugin-cache.sh
```

Slash command SSOT: `/cursor-better-toolkits-cache-refresh` in `shared/bootstrap/commands/`.

## Verify

```bash
agent plugin marketplace list
agent plugin list
```

Confirm stderr hook blocks `2>/dev/null` in a test shell command (HITL-gated).
