# Detector Profile — `OWN` (Ownership / Placement Drift)

This is the **`OWN`** detector profile for the `audit-engine` skill. It defines
the anti-pattern, the LLM detection prompt, the deterministic verify recipe,
default severity, and the `cure_map` template. Field definitions and finding-ID
rules come from the contract: `references/audit-report-schema.md`.

---

## Anti-pattern

**Ownership / placement drift** = a module exists in the **wrong boundary**:
it is not assigned to the context it should belong to. This is distinct from
`DDD` (which detects imports *crossing* a boundary) — `OWN` detects that a
module is *assigned to the wrong boundary in the first place*.

- **Junk drawer** — files accumulate in a catch-all folder (`src/components/dashboard/`)
  instead of their owning context.
- **Misnamed / misplaced folder** — a path promises one thing but holds another
  (`courses/` vs the canonical `pathways/`).
- **Dead unintegrated duplicate** — two copies of the same component exist, one
  obsolete, neither deleted.
- **Wrong owner** — a module whose declared owner (CODEOWNERS / ownership map)
  does not match the domain it actually implements.

---

## Stage 2 — LLM detection prompt

Run this prompt against the module list and the declared placement/ownership map:

> You are auditing a codebase for ownership / placement drift — a module that
> is not assigned to the boundary it should belong to.
>
> 1. **List modules.** Enumerate source directories and files.
> 2. **Map intended placement.** Use, in priority order: CODEOWNERS, an
>    explicit ownership/placement map, or the top-level folder convention.
> 3. **Flag misplacement.** A module is a candidate when its actual folder does
>    not match its intended owning context, or it sits in a junk drawer, or it is
>    a dead duplicate of another module elsewhere.
>
> For every candidate, emit a `file:line` evidence anchor on the module's
> declaration/header. A candidate without an anchor is invalid — drop it.

Output: candidate misplaced modules, each with `{ file, line }` evidence.

---

## Stage 3 — Deterministic verify recipe

`OWN` has a deterministic check. Run it; do **not** fall back to a refutation
agent unless the deterministic check can't be applied.

1. **Assemble inputs.** Build `Module[]` (path + declared owner/placement) and
   the `PlacementMap` (prefix → intended context).
2. **Call the verifier:**
   ```ts
   import { findMisplacedModules } from "../../src/audit/verifiers/ownership-placement-drift";
   const findings = findMisplacedModules(modules, placementMap);
   // -> [{ file, placement: "junk_drawer" | "wrong_owner" | "misnamed_folder" }]
   ```
   The verifier flags `junk_drawer`, `wrong_owner`, and `misnamed_folder`.
3. **Reconcile** verifier output with LLM candidates. Keep only what the
   verifier confirms.
4. **Stamp `confidence`:** `confirmed` when the verifier returns the module and
   the anchor resolves; `probable` otherwise; never emit `unverified`.

---

## Default severity

| Condition | Severity |
| --- | --- |
| Dead duplicate / junk drawer on a core domain path | `high` |
| Wrong owner / misnamed folder | `medium` |

---

## `cure_map` template

| Cure | Why |
| --- | --- |
| `ownership` | Assign the module to its canonical context (CODEOWNERS / move). |
| `ci_guard` | Add a CI check that fails when a new file lands in a junk drawer or off-map folder. |
