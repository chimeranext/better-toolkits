# Proposal — multi-harness better profile sync (OpenCode + Claude + Cursor)

**Change:** `2026-10-31-multi-harness-profile-sync`
**Domain:** `area:meta`
**Status:** Proposed
**Date:** 2026-10-31

## What we will build

Extend `scripts/ci/sync-better-profile.sh` (and `.ps1`) to sync the canonical
profile `shared/bootstrap/agents/better.md` to a runtime copy for **each**
harness, converting the frontmatter schema per harness:

| Harness | Runtime destination | Frontmatter schema |
|---|---|---|
| OpenCode | `~/.config/opencode/agents/better.md` | `mode` / `permission` (native, direct copy) |
| Claude | `~/.claude/agents/better.md` | `name` / `description` / `tools` / `model` / `permissionMode` |
| Cursor | `~/.cursor/agents/better.md` | `name` / `description` / `model` / `readonly` |

The body (system prompt) is shared; the frontmatter is per-harness. The
generator replaces the harness reference in the opening line ("for OpenCode" →
"for Claude" / "for Cursor").

## Why now

The canonical profile currently targets OpenCode only. Claude and Cursor have
their own agent-file mechanisms (verified against official docs); copying the
OpenCode-schema file to those destinations would produce files those harnesses
ignore — a false sync. This change makes the profile actually usable across
harnesses.

## Success criteria

- [ ] `sync-better-profile.sh` syncs 3 destinations; `--check` detects drift per
      destination.
- [ ] A Python generator produces schema-correct frontmatter per harness.
- [ ] `.ps1` mirrors the multi-harness behavior.
- [ ] Empty destination → skip (never fail), same as today.
- [ ] `better-mode.md` and `toolkits-initial-setup` protocol reference the
      multi-harness sync.

## Out of scope

- Installing the profile into plugins (Claude plugin `agents/` scope).
- Team/managed settings distribution.
