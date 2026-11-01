# Detector Profile — `CMI` (Context-Map Integrity)

This is the **`CMI`** detector profile for the `audit-engine` skill. It defines
the anti-pattern, the LLM detection prompt, the deterministic verify recipe,
default severity, and the `cure_map` template. Field definitions and finding-ID
rules come from the contract: `references/audit-report-schema.md`.

---

## Anti-pattern

**Context-map integrity drift** = a relationship **declared** in the DDD
context map is not **realized** in the code, or an undeclared relationship
exists. The context map declares relationships (partnership, shared kernel,
customer/supplier, conformist, **anti-corruption layer**, open-host service,
published language, separate ways); the code must honor them.

- **Missing ACL** — the map declares an anti-corruption layer between A and B,
  but no such layer exists; A talks to B directly.
- **Violated constraint** — the map declares `separate ways` (no communication),
  yet A imports B directly; or a shared kernel is used outside the declared
  subset.
- **Undeclared relationship** — two contexts communicate, but the map does not
  declare any relationship between them.

---

## Stage 2 — LLM detection prompt

Run this prompt against the machine-readable context map and the actual
inter-context communication:

> You are auditing a codebase for context-map integrity.
>
> 1. **Read the context map** (contexts, published interfaces, relationships).
> 2. **Read the actual edges** — how contexts communicate in code (imports, API
>    calls, messages).
> 3. **Flag mismatches:** a declared relationship with no implementation; a
>    constraint violated (separate-ways communicating, ACL bypassed); or
>    communication with no declared relationship.
>
> For every finding, emit a `file:line` evidence anchor on the communication
> site. A finding without an anchor is invalid — drop it.

Output: candidate integrity violations, each with `{ file, line }` evidence.

---

## Stage 3 — Deterministic verify recipe

`CMI` has a deterministic check. Run it; do **not** fall back to a refutation
agent unless the deterministic check can't be applied.

1. **Assemble inputs.** Build `ContextMap` (contexts + relationships) and
   `ActualEdges[]` (the observed inter-context communication).
2. **Call the verifier:**
   ```ts
   import { verifyContextMapRelationships } from "../../src/audit/verifiers/context-map-integrity";
   const findings = verifyContextMapRelationships(contextMap, actualEdges);
   // -> [{ relation, issue: "missing_relationship" | "violated_constraint" | "undeclared_relationship" }]
   ```
   The verifier flags a declared relationship with no implementation
   (`missing_relationship`), a constraint that is violated (separate-ways
   talking, ACL bypassed by a direct call) (`violated_constraint`), and
   communication with no declared relationship (`undeclared_relationship`).
3. **Reconcile** verifier output with LLM candidates. Keep only what the
   verifier confirms.
4. **Stamp `confidence`:** `confirmed` when the verifier returns the mismatch and
   the anchor resolves; `probable` otherwise; never emit `unverified`.

---

## Default severity

| Condition | Severity |
| --- | --- |
| Violated constraint (separate-ways communicating) / missing ACL | `high` |
| Undeclared relationship | `medium` |

---

## `cure_map` template

| Cure | Why |
| --- | --- |
| `ownership` | Declare the missing relationship in the context map, or add the ACL. |
| `ci_guard` | Add a check that fails when an undeclared/violating edge appears. |
