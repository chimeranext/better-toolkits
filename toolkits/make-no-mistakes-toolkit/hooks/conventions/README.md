# Conventions warn recorder (make-no-mistakes)

Accumulates code-convention violations and pushes them **in batch** to the entity's audit
repo. Emits **warn** — never blocks.

## Why

Convention checks used to be hard blockers. That left no accumulated record of who violates
which convention over time. This recorder keeps enforcement as **warn no-block** and builds a
versioned audit log for future review.

## Usage

```bash
conventions-warn-recorder.sh <convention-id> <file> <author>
```

Example:

```bash
conventions-warn-recorder.sh rust/R9 src/auth.rs @lapc506
```

## Behavior

- Appends to a local batch buffer (`${TMPDIR:-/tmp}/conventions-audits/`).
- When the buffer reaches `CONVENTIONS_BATCH_THRESHOLD` (default 10) — or
  `CONVENTIONS_FLUSH=1` — it clones/pulls the audit repo, appends to today's dated file
  `conventions/code-conventions-audit-YYYY-MM-DD.md`, and pushes.
- **Append-only**: never edits prior days.
- **Never blocks**: always exits 0 (warn), even if the push is deferred.

## Audit repo resolution (per-entity, centralization opt-in)

| Case | Repo |
|---|---|
| Default | `<org>/internal-audits` (org of the repo being audited) |
| Centralization opt-in | `auditsRepo` explicit (e.g. `chimeranext/internal-audits`) — only when the entity explicitly adopts the shared-services model (opinionated) |

Set `auditsRepo` in `make-no-mistakes.config.json` to opt in to centralization.

## Env

- `CONVENTIONS_BATCH_THRESHOLD` (default 10)
- `CONVENTIONS_FLUSH=1` to force a push
