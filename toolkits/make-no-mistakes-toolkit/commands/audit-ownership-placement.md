---
description: >
  Audit a repo for ownership/placement drift (family 7) — modules sitting in a
  junk drawer, misnamed folders that don't reflect their declared owner, and
  code placed under an owner that contradicts the declared ownership map.
  Emits a findings doc, an OpenSpec remediation change, Bilingual Linear issues,
  and 4-cure scaffold proposals. Accepts a target path as $ARGUMENTS.
---

# /audit-ownership-placement

Trigger the **`audit-engine`** skill with the `ownership-placement` (`OWN`)
detector profile (`references/detectors/ownership-placement.md`) against
$ARGUMENTS (default: the current repo).

The engine owns the full flow (preflight → scope → detect → verify → cure-map →
emit). Deterministic verification uses `findMisplacedModules` from
`src/audit/verifiers/ownership-placement-drift.ts` — it takes the found modules
(`SourceModule[]`, with optional declared owners) and the declared
ownership/placement map (`OwnershipPlacement[]`, from CODEOWNERS / an explicit
map / folder layout), and reports every module whose placement is wrong: a junk
drawer (generic catch-all directory), a misnamed folder that doesn't reflect its
declared owner, or a module whose declared owner contradicts the placement map.

## Usage

```
/audit-ownership-placement [path]
```
