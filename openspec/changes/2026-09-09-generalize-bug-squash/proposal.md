# Generalize `/bug-squash` to make-no-mistakes-toolkit — Proposal

| Field | Value |
| --- | --- |
| Change ID | `2026-09-09-generalize-bug-squash` |
| Status | Proposed |
| Supersedes (conceptually) | Monolithic product-specific Cursor commands with multi-environment hops embedded in consumer repos |
| Owners | MNM toolkit + per-startup overlays |

## Problem

HITL bug-squash was often implemented as a **monolithic Cursor command** with multiple environment hops hardcoded in one round (e.g. localhost → staging → production). That blocks reuse across startups, couples the protocol to product-specific URLs/test runners/Slack, and conflates **multi-environment coverage** with **one round traversing multiple origins** — which is unsafe and hard to resume.

Startups also lack a bootstrap path: missing `bug-squash.config.json` should not fail opaquely or invent hops.

## Proposal

1. **Toolkit (SSOT):** `commands/bug-squash.md` + `references/bug-squash/*` — generic HITL protocol (UDD, N1/N2/N3, Chrome DevTools MCP headed-only, negative evidence, `.write-armed` for non-local writes).
2. **Per-repo config:** `bug-squash.config.json` at project root (URLs, enabled environments, round dir, test runner hints). **Bootstrap on first run** if missing — scaffold from `bug-squash.config.example.json`, do not fail closed.
3. **Single environment per round (MUST):** each round selects **one** environment at open (`localhost` | `devel` | `staging` | `prod`) and completes the full cycle there. Multi-environment coverage = **multiple rounds**, not hop-switching inside one round.
4. **Default environments:** `localhost`, `devel`, `staging` enabled; **`prod` opt-in only** (`enabled: false` until human enables in config).
5. **Waivers:** document skipping a **round** in an environment (`qa/waivers.md`); never waive mid-round origin changes.
6. **Consumer overlay:** thin repo-local command (e.g. `/bug-squash-<product>`) points at toolkit + local profile; product-specific runbooks stay in the consumer repo — not in this toolkit.

## Success criteria

- OpenSpec `round.md` schema requires `environment` (single) and forbids `Current hop` progression within one round file.
- Command runs bootstrap when config absent; operator confirms URLs once.
- Consumer repos adopt overlays and config without duplicating this OpenSpec change in their own stores.
- Existing `pre-tool-prod-write-guard.sh` remains compatible (prod origin + `.write-armed`).

## Non-goals

- Replacing formal QA systems (Kiwi, `qa-ready`, etc.) — overlays may reference them.
- Mandating Pest or a specific test runner in the base toolkit (profile in config/overlay).
- Running prod rounds by default.
- Implementing consumer-repo overlays, URLs, or product docs inside better-toolkits (separation of concerns).
