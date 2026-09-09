# Generalize `/bug-squash` to make-no-mistakes-toolkit — Proposal

| Field | Value |
| --- | --- |
| Change ID | `2026-09-09-generalize-bug-squash` |
| Status | Proposed |
| Supersedes (conceptually) | Seacrets-only v1 embedded in `seacrets.online-app/.cursor/commands/bug-squash.md` (SCRT-525) |
| Owners | MNM toolkit + per-startup overlays |

## Problem

HITL bug-squash was implemented as a **monolithic Seacrets Cursor command** with four environment hops hardcoded (localhost → devel → stage → main). That blocks reuse by other startups, couples the protocol to Seacrets URLs/Pest/Slack, and conflates **multi-environment coverage** with **one round traversing multiple origins** — which is unsafe and hard to resume.

Startups also lack a bootstrap path: missing `bug-squash.config.json` should not fail opaquely or invent hops.

## Proposal

1. **Toolkit (SSOT):** `commands/bug-squash.md` + `references/bug-squash/*` — generic HITL protocol (UDD, N1/N2/N3, Chrome DevTools MCP headed-only, negative evidence, `.write-armed` for non-local writes).
2. **Per-repo config:** `bug-squash.config.json` at project root (URLs, enabled environments, round dir, test runner hints). **Bootstrap on first run** if missing — scaffold from `bug-squash.config.example.json`, do not fail closed.
3. **Single environment per round (MUST):** each round selects **one** environment at open (`localhost` | `devel` | `staging` | `prod`) and completes the full cycle there. Multi-environment coverage = **multiple rounds**, not hop-switching inside one round.
4. **Default environments:** `localhost`, `devel`, `staging` enabled; **`prod` opt-in only** (`enabled: false` until human enables in config).
5. **Waivers:** document skipping a **round** in an environment (`qa/waivers.md`); never waive mid-round origin changes.
6. **Startup overlay:** thin command (e.g. Seacrets `/bug-squash-seacrets`) points at toolkit + local profile; deprecate monolithic app command to a 5-line pointer.

## Success criteria

- OpenSpec `round.md` schema requires `environment` (single) and forbids `Current hop` progression within one round file.
- Command runs bootstrap when config absent; operator confirms URLs once.
- Seacrets PR renames overlay to `bug-squash-seacrets.md` without duplicating this OpenSpec in `seacrets.online-specs`.
- Existing `pre-tool-prod-write-guard.sh` remains compatible (prod origin + `.write-armed`).

## Non-goals

- Replacing formal QA systems (Kiwi, `qa-ready`, etc.) — overlays may reference them.
- Mandating Pest or a specific test runner in the base toolkit (profile in config/overlay).
- Running prod rounds by default.
