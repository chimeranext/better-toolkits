# better-toolkits — OpenSpec Project Governance

> **Source of truth** for how decisions are recorded, tracked, and shipped in this
> monorepo. Same convention as `chimeranext/better-microservices`.

## Overview

`better-toolkits` is a monorepo of source-available Claude Code toolkits. Each
toolkit keeps its own license and lifecycle, but they share one repo, one
marketplace manifest, one landing page, and **one decision-record convention**
(this document).

- **Remote (canonical):** `github.com/chimeranext/better-toolkits`
- **Tracker:** GitHub Issues on this repo (`toolkit:*` labels)
- **Install surface:** `.claude-plugin/marketplace.json` (10 plugins) — `claude plugin marketplace add chimeranext/better-toolkits`

## Spec Domains

Every change belongs to exactly one **domain**, mapped 1:1 to a `toolkit:*` /
`area:*` label:

| Domain | Label | Scope |
|---|---|---|
| One of the 10 toolkits | `toolkit:<name>` | `toolkits/<name>/**` |
| `web` | `area:web` | `apps/web/**` — landing toolkits.chimeranext.dev |
| `docs` | `area:docs` | `docs/**`, README |
| `meta` | `area:meta` | root manifests, marketplace.json, governance, hooks |

## Change lifecycle

1. **Propose** — create `openspec/changes/<YYYY-MM-DD>-<slug>/` with `proposal.md`
   (why + decisions), `design.md` (what, in detail), `tasks.md` (how, checklist).
2. **Implement** — tasks reference the change slug in commit messages.
3. **Archive** — when shipped, move the change dir to `openspec/changes/archive/`.
   Planning artifacts for shipped work do NOT live at the top level (lesson from
   the toolkit consolidation: stale plans/specs for shipped features are debt).

## Enforcement (not just convention)

A `PreToolUse` hook (`.claude/hooks/pre-write-require-openspec.sh`, registered in
`.claude/settings.json`) enforces two rules for Claude Code sessions in this repo:

1. `*-spec.md` / `*-adr.md` / `proposal.md` / `design.md` files may only be
   created inside `openspec/changes/` — specs don't float around the tree.
2. Writes under `apps/` require at least one **active** (non-archived) change in
   `openspec/changes/` — engineering work traces to a recorded decision.

Business artifacts produced by toolkit commands (e.g. `/landing-page` copy decks
under `business/`) are exempt content outputs; their *decisions* still live in a
change record.
