# HITL doctrine (repo-wide)

**Human-in-the-loop is a pillar of better-toolkits**, orthogonal to [multi-harness SSOT](multi-harness-ssot.md). It applies to every toolkit, agent, command, and skill in this monorepo — not only make-no-mistakes.

Public surface: [toolkits.chimeranext.dev/doctrine](https://toolkits.chimeranext.dev/doctrine/).

## The rule

After an agent produces a **plan whose natural next step mutates shared state**, it must **ask and wait** before acting. The approval question *is* the product. Do not bury execution behind a flag nobody will discover (`--execute`, `--apply` as the only path to the obvious follow-through, silent “here are the commands for you to run” endings when the user just asked for the outcome).

Shared-state mutations include (non-exhaustive): `gh pr merge`, `gh pr create` mode, force-with-lease pushes that rewrite published history, tracker status → Done, deleting worktrees, regenerating base-anchored artifacts that every open PR must re-derive, production / prod-project ops.

Local autonomous work (edit files, run tests, draft OpenSpec, measure merge order) does **not** need per-action approval — until the boundary above.

## How to ask (by harness)

| Harness | Surface |
|---------|---------|
| Claude Code | `AskUserQuestion` |
| Cursor | Equivalent in the **main** conversation: numbered options + wait for an **explicit** reply (never treat silence as yes) |
| Background sub-agent | Do **not** ask the user. Emit a structured `pause` signal; the orchestrator asks and relays |

Same pattern as make-no-mistakes [`references/implement/hitl-boundaries.md`](../toolkits/make-no-mistakes-toolkit/references/implement/hitl-boundaries.md) — that file is an implementation of this doctrine for `/implement`, not the doctrine’s only home.

## What HITL is not

- Not a second command for the obvious follow-through (e.g. “merge-advisor then somehow separately merge”).
- Not an opt-in CLI flag for the default happy path.
- Not a menu that offers `--admin` / `--force` / merge-past-red-checks as choices. If blocked, the block is the finding.

## Reference implementations in this monorepo

- `/implement` hard STOP gates — `toolkits/make-no-mistakes-toolkit/references/implement/hitl-boundaries.md`
- `/merge-advisor` — measure, then always HITL before each `gh pr merge` (re-measure between merges) — `references/merge-advisor/protocol.md`
