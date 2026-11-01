# /code-conventions-audit — protocol SSOT

## Purpose

Unified code-convention compliance report: repo-health (6 families) +
clean-code standards + language records. Reads the entity's audit log
(`internal-audits`) and produces a compliance report. **Warn no-block** — never blocks, only
records.

## Invariant

`code-conventions-audit` does **not merge** anything. It reports from the log. The log is the SSOT; the
ranking (if requested) is derived in the output, not persisted.

## Audit log — location (per-entity, opt-in centralization)

| Case | Audit repo |
|---|---|
| Default (every entity) | `<org>/internal-audits` — the org of the audited repo |
| Opt-in centralization | explicit `auditsRepo` (e.g. `chimeranext/internal-audits`) — only if the entity explicitly adopts the shared services model (opinionated) |

Format: `conventions/code-conventions-audit-YYYY-MM-DD.md` (append-only, ISO filename).

## Report sources

1. **Repo-health (6 families)**: detectors from `make-no-mistakes-toolkit/references/detectors/`
   (schema-drift, contract-drift, ddd-boundaries, explicit-architecture, strangler-fig,
   enforcement-hooks).
2. **Clean-code standards**: PRDS / DSMS / IFS / CPS / BrS / QT4L
   (`shared/references/engineering-standards/`).
3. **Language records**: `shared/references/conventions/language/*`.

## Flow

1. Resolve the audit repo (default `<org>/internal-audits`; `auditsRepo` if configured).
2. Read `conventions/code-conventions-audit-*.md` from the log.
3. Aggregate by convention and by author (from the dated log).
4. Produce the compliance report (without persistent ranking).

## Warn no-block

Convention checks emit `warn` and record the violation in the log; they do not block the
merge. The registrar (make-no-mistakes) accumulates and pushes in batch.

## Out of scope

- Does not merge PRs.
- Does not persist ranking (only derives in output).
- Does not migrate existing audits to another repo.
