# Proposal — shared/bootstrap + /toolkits-initial-setup

**Change:** `2026-09-16-shared-bootstrap-toolkits-initial-setup`
**Domain:** `area:meta`
**Status:** Proposed
**Date:** 2026-09-16

## What we will build

A **bootstrap layer** under `shared/bootstrap/` — outside `toolkits/` — that solves the
install chicken-and-egg problem for the `better-toolkits` marketplace:

1. **Marketplace plugin** `better-toolkits-bootstrap` (`source: ./shared/bootstrap`) —
   install **first** after `marketplace add`.
2. **Slash command** `/toolkits-initial-setup` (thin entry → `references/toolkits-initial-setup/protocol.md`).
3. **Harness adapters** — `adapters/setup-{cursor,claude,opencode}.md` for IDE-specific wiring.
4. **CLI** `@chimeranext/better-toolkits` (`shared/bootstrap/cli/`) — OpenCode / headless
   entry when no plugin is installed yet.
5. **HITL flow** — detect → audit → propose diffs → explicit human OK → install → verify.
6. **Deprecate** per-toolkit `npx @lapc506/make-no-mistakes install` as the OpenCode SSOT.

## For whom

- Developers onboarding to any of the 10 product toolkits on Claude Code, Cursor, or OpenCode.
- Maintainers who need one consent-first setup path instead of README fragments.

## Why now

- `npx @lapc506/make-no-mistakes install` is legacy (personal scope, single toolkit).
- Putting setup inside `make-no-mistakes-toolkit` is impossible before that plugin exists.
- Cursor marketplace auto-update and stderr hooks need consent-first merge, not silent `workspaceOpen`.

## Success criteria

- [ ] `better-toolkits-bootstrap` appears in root `marketplace.json` (11th plugin).
- [ ] `/toolkits-initial-setup` documents full HITL phases; adapters cover Cursor, Claude, OpenCode.
- [ ] README + MNM README point to bootstrap plugin + `@chimeranext/better-toolkits setup`.
- [ ] Optional Cursor marketplace auto-update is a **checkbox** in adapter, not a separate command.
- [ ] No new setup command lives under `toolkits/make-no-mistakes-toolkit/`.

## Out of scope

- Publishing `@chimeranext/better-toolkits` to npm registry (CLI stub in-repo only in this change).
- Cursor native post-install consent UI (platform gap — we document + HITL in command).
- Migrating all `@lapc506/*` package names in one PR.
