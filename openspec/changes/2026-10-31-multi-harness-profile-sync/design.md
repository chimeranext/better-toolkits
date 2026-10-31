# Design — multi-harness better profile sync

## Context

`shared/bootstrap/agents/better.md` is the canonical Better profile. Its
frontmatter uses the OpenCode schema (`mode`, `permission`). Claude Code
(`~/.claude/agents/`) and Cursor (`~/.cursor/agents/`) use their own schemas
(`name`, `description`, and harness-specific fields). Copying the OpenCode file
verbatim to those destinations would be ignored by the target harness — a false
sync.

## Decision — per-harness schema conversion

Generate each runtime copy from the canonical file with a schema conversion step:

| Harness | Destination | Converted frontmatter |
|---|---|---|
| OpenCode | `~/.config/opencode/agents/better.md` | direct copy (native schema) |
| Claude | `~/.claude/agents/better.md` | `name: better`, `description: <from canonical>`, `tools: Read, Grep, Glob, Bash, Edit, Write`, `permissionMode: default` |
| Cursor | `~/.cursor/agents/better.md` | `name: better`, `description: <from canonical>`, `model: inherit`, `readonly: false` |

The markdown body (system prompt) is shared across harnesses. The conversion
only changes the frontmatter and the opening "for OpenCode" reference →
"for Claude" / "for Cursor".

## Conversion implementation

A small Python generator (deterministic, no YAML dependency beyond stdlib `re`)
reads the canonical file, extracts `description`, and emits the three targets.
The bash/`.ps1` sync scripts call the generator for each destination.

## Sync semantics (unchanged from today)

- `sync` (default): generate + copy each destination; idempotent.
- `--check`: compare each destination against the canonical-derived expected
  content; report drift per destination; exit 1 on any drift.
- Missing destination → skip (never fail), preserving machine-local behavior.
- Never discard stderr; no redirections to null (StS).

## Files

- `scripts/ci/sync-better-profile.sh` — orchestrator (3 destinations).
- `scripts/ci/sync-better-profile.ps1` — Windows orchestrator.
- `scripts/ci/sync-better-profile-generate.py` — schema conversion.
- `commands/better-mode.md` — update references to multi-harness.
- `toolkits-initial-setup/protocol.md` — reference multi-harness sync.
