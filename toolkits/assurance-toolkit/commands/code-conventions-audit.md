---
description: >
  Unified code-conventions audit — aggregates repo-health (6 families), clean-code
  standards, and language records into one compliance report, reading the per-entity audit
  log (internal-audits). Warn no-block enforcement. Accepts a repo path as $ARGUMENTS.
priority: 30
---
# /code-conventions-audit

Read and follow [`references/conventions/code-conventions-audit/protocol.md`](../references/conventions/code-conventions-audit/protocol.md) (protocol SSOT).

`$ARGUMENTS` is the repo path to audit (default: current directory).

This command produces a **code-conventions compliance report** from the per-entity audit log (default
`<org>/internal-audits`, centralization opt-in via `auditsRepo`). It aggregates:

1. **Repo-health (6 families)** — schema-drift, contract-drift, DDD boundaries, explicit
   architecture, strangler fig, enforcement-hooks (via the audit-engine detectors).
2. **Clean-code standards** — PRDS / DSMS / IFS / CPS / BrS / QT4L.
3. **Language records** — `shared/references/conventions/language/*` (e.g. prescriptive error
   messages, per-language RULES).

Checks are **warn no-block**: they emit warnings and record violations, but never block the
merge. The log is the SSOT; this command derives the report from it (no persistent ranking).

## Log location (per-entity, opt-in centralization)

- Default: `<org>/internal-audits` (the org of the repo being audited).
- Centralization: set `auditsRepo` (e.g. `chimeranext/internal-audits`) only when the entity
  explicitly adopts the shared-services model (opinionated, opt-in).

This command does **not** merge anything. It reports.
