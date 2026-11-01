---
description: >
  Audit a repo for context-map integrity drift (family 8) — the machine-readable
  context map (contexts + relationship declarations) vs the code's actual
  inter-context communication: declared relationships (e.g. ACLs) that were
  never built, direct communication where "separate ways" was declared, and
  real edges with no declared relationship at all. Emits a findings doc, an
  OpenSpec remediation change, Bilingual Linear issues, and 4-cure scaffold
  proposals. Accepts a target path as $ARGUMENTS.
---

# /audit-context-map-integrity

Trigger the **`audit-engine`** skill with the `context-map-integrity` (`CTX`)
detector profile (`references/detectors/context-map-integrity.md`) against
$ARGUMENTS (default: the current repo).

The engine owns the full flow (preflight → scope → detect → verify → cure-map →
emit). Deterministic verification uses `verifyContextMapRelationships` from
`src/audit/verifiers/context-map-integrity.ts` — it takes the declared context
map (`ContextMap`, contexts + relationship declarations) and the graph of
actual inter-context edges (`ActualEdge[]`) read from the code, and reports
undeclared relationships (real communication with no declaration), missing
implementations (a declared integration, e.g. an ACL, that was never built),
and violated constraints (e.g. "separate-ways" contexts that talk directly, or
a declared anti-corruption layer bypassed by a direct call).

## Usage

```
/audit-context-map-integrity [path]
```
