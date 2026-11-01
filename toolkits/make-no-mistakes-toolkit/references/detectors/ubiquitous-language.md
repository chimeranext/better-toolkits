# Detector Profile — `ULC` (Ubiquitous-Language Consistency)

This is the **`ULC`** detector profile for the `audit-engine` skill. It defines
the anti-pattern, the LLM detection prompt, the deterministic verify recipe,
default severity, and the `cure_map` template. Field definitions and finding-ID
rules come from the contract: `references/audit-report-schema.md`.

---

## Anti-pattern

**Ubiquitous-language inconsistency** = the DDD `ubiquitous language` (one
concept, one name within a bounded context) is violated:

- **Cross-context synonym** — the same domain concept is named differently across
  contexts (`Enrollment` vs `Registration`), revealing a model bled into another
  without an anti-corruption layer.
- **Ambiguous term within a context** — one term has two meanings inside a single
  bounded context, breaking the single-meaning contract.

---

## Stage 2 — LLM detection prompt

Run this prompt against the per-context vocabulary and the model:

> You are auditing a codebase for ubiquitous-language inconsistency.
>
> 1. **Per context, collect the terms** used for domain concepts (class names,
>    entities, concepts, API terms).
> 2. **Find cross-context synonyms** — the same concept with different names in
>    different contexts.
> 3. **Find intra-context ambiguity** — a term that means two different things
>    within one context.
>
> For every finding, emit a `file:line` evidence anchor on the term's usage. A
> finding without an anchor is invalid — drop it.

Output: candidate language inconsistencies, each with `{ file, line }` evidence.

---

## Stage 3 — Deterministic verify recipe

`ULC` has a deterministic check. Run it; do **not** fall back to a refutation
agent unless the deterministic check can't be applied.

1. **Assemble inputs.** Build `Context[]` — each with its term dictionary
   (`term` → meaning).
2. **Call the verifier:**
   ```ts
   import { findUbiquitousLanguageInconsistencies } from "../../src/audit/verifiers/ubiquitous-language-consistency";
   const findings = findUbiquitousLanguageInconsistencies(contexts);
   // -> [{ contextA, termA, contextB, termB, issue: "cross_context_synonym" | "ambiguous_term_within_context" }]
   ```
   The verifier flags a term that maps to two meanings within one context
   (`ambiguous_term_within_context`) and the same meaning named differently
   across contexts (`cross_context_synonym`).
3. **Reconcile** verifier output with LLM candidates. Keep only what the
   verifier confirms.
4. **Stamp `confidence`:** `confirmed` when the verifier returns the
   inconsistency and the anchor resolves; `probable` otherwise; never emit
   `unverified`.

---

## Default severity

| Condition | Severity |
| --- | --- |
| Cross-context synonym | `medium` |
| Ambiguous term within a context | `high` |

---

## `cure_map` template

| Cure | Why |
| --- | --- |
| `ownership` | Align the vocabulary to the canonical ubiquitous language; add an anti-corruption layer where contexts must rename. |
| `ci_guard` | Add a check that fails when a new synonym for a known concept appears in a context. |
