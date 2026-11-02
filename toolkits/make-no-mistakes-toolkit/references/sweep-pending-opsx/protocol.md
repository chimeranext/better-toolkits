# /sweep-pending-opsx — protocol SSOT

Harness-agnostic body. Thin entry: `commands/sweep-pending-opsx.md`, `skills/sweep-pending-opsx/SKILL.md`.
Engine: `scripts/ci/sweep-pending-opsx.sh` (single source; scripts must not be duplicated).

---

## /sweep-pending-opsx: $ARGUMENTS

Roams **outside** `/opsx-apply`. `/opsx-apply` executes one change's tasks one
by one; this sweep answers **which OpenSpec changes are pending work**
(any not-fully-`[x]` checklists), so the agent can route them to the correct
next command of the OpenSpec flow rather than guessing or skipping.

**Invariant: read-only sweep.** This protocol **never** mutates a change,
spec, or repo. It only reports a status table and exits.

## Why

- Tasks are the bootstrapper for the flow: work not yet done inside
  `openspec/changes/**` is invisible to almost every other tool.
- `/opsx-apply` executes task by task; this **sweep** complements it by enumerating pending
  changes set-wide, so the agent can pick the next change to apply without
  forgetting one.

## What it scans

For every folder under `openspec/changes/` excluding `archive/` (top level; each change = one folder):

1. **tasks.md checklist completeness** — count `- [ ]` vs `- [x]` checkboxes.
2. **spec drift** — does the change have delta specs (under `specs/`) that are
   not reflected in `openspec/specs/`? (missing main spec files)
3. **unarchived-changes** — changes whose tasks are all `[x]` but are still in
   `openspec/changes/` (candidates for `/opsx-archive`).

Invariants: nothing pending here ever *forces* a change to run away from you;
the sweep is only congress-level evidence for `/opsx-apply` and `/opsx-archive`.

## Stages (the gates prior to apply)

1. **Pending tasks** — one row per change with pending work.
2. **Spec drift** — count deltas not yet reflected in `openspec/specs/`.
3. **Archive-ready** — count changes whose tasks are all `[x]` yet remain unrest in
   `openspec/changes/` (not archived yet).

## Engine

```bash
bash scripts/ci/sweep-pending-opsx.sh [--json]
```

Behavior:

- exit 0 → nothing pending; exit 1 → at least one pending row (a handy CI/agent signal).
- exit 2 → engine/infra failure — **never suppress**; report stderr; no mask.
- Output format: human-readable plain text (markdown-ish) by default; `--json`
  emits a machine envelope with the same fields.

## Rules (enables the sweep to act as part of the pipeline)

- The sweep runs **after** `/sweep-unstaged` and **before any** `/opsx-apply`.
- No sub-change inside a pending entry is proposed here: this layer never
  executes the change — that is what `/opsx-apply` is for.
- Never edit task checkboxes, spec.md files, or mark change-ids on rows —
  read-only sweep.
- Standard Error list: preserve any actionable stderr; never drop stdout/stderr
  through /dev/null (see StS standard).

## Contexts to not maintain (forbid)

- Don't attempt to parse `weights`, `assign`, `owners` markdown labels —
  OpenSpec uses no metadata fields; only checkbox state is authoritative.
- Don't parse the `opsx-apply` immutability docstring; the sweep binds to the
  counts above, not to the executor.

## OpenSpec delta expectations

After merging, `/sweep-pending-opsx` becomes the shared gate for:

- `/opsx-apply` chooses the next change to work on;
- `/opsx-sync` / `/opsx-living` chain gets a constant view of "what's pending"
  before it runs (living spec data can be computed before sync).
