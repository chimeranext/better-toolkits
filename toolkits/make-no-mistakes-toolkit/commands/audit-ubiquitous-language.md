---
description: >
  Audit a repo for ubiquitous-language consistency drift (family 9) — the same
  domain concept named differently across bounded contexts, or a single term
  carrying two meanings within one context. Consumes per-context term
  dictionaries. Emits a findings doc, an OpenSpec remediation change, Bilingual
  Linear issues, and 4-cure scaffold proposals. Accepts a target path as
  $ARGUMENTS.
---

# /audit-ubiquitous-language

Trigger the **`audit-engine`** skill with the `ubiquitous-language` (`UL`)
detector profile (`references/detectors/ubiquitous-language.md`) against
$ARGUMENTS (default: the current repo).

The engine owns the full flow (preflight → scope → detect → verify → cure-map →
emit). Deterministic verification uses `findUbiquitousLanguageInconsistencies`
from `src/audit/verifiers/ubiquitous-language-consistency.ts` — it consumes the
per-context term dictionaries (`UbiquitousLanguageContext[]`, term → concept
meaning) and reports every inconsistency: an ambiguous term (one term with two
meanings within a single context) and cross-context synonyms (one concept named
differently in different contexts).

## Usage

```
/audit-ubiquitous-language [path]
```
