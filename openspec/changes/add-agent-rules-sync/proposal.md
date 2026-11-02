# Proposal — add-agent-rules-sync

Change ID: `add-agent-rules-sync`

## Why

Cursor has no global AGENTS.md file; engineering standards must be materialized
per harness as `.cursor/rules/*.mdc` / `.claude/rules/*.md`. `better.md`
profiles were already wired (sync-better-profile.sh) but rules were not —
verified: `install.js` had zero rule wiring.

## What Changes

- New `shared/bootstrap/scripts/sync-agent-rules.sh` (SSOT precedence:
  repo `.agents/rules/*.md` → mono `shared/references/engineering-standards/*.md`).
- Wired as `agent-rules-sync` step in `shared/bootstrap/cli/lib/install.js`.
- Drift gate `--check` (exit 1 on missing/differing destinations), `--copy`
  fallback, `--global` user-level real copies.
- `.gitignore` excludes generated load paths (only harness-authored rules are tracked).

## Impact

- Files: `shared/bootstrap/scripts/sync-agent-rules.sh` (new), `install.js`,
  `shared/bootstrap/cli/test/cli.test.js` (frozen-count asserts made dynamic —
  they were stale on main: 40 pass / 2 fail), `.gitignore`, README,
  `docs/multi-harness-ssot.md`.
