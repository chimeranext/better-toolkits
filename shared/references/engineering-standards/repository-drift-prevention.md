# RDP — Repository Drift Prevention (doctrina)

## Purpose

Standardize the detection and prevention of **structural drift** across a
repository: the tendency of a codebase to silently diverge from its intended
single-source-of-truth ownership. This standard is the doctrine behind the six
`audit-engine` detector families. It does not define the detectors' mechanics
(those live in `references/detectors/`); it justifies WHY each canonical source
is cited, so a reader understands the conceptual chain rather than treating the
citations as citation lists.

---

## The six detector families

Each family is a detector profile of the `audit-engine`. It is validated with
Specula (TLA+ model checking) and vendored with its full name (no abbreviated
family tokens).

### 1. Schema drift

- **Detector:** `schema-drift` (verifier `schema-drift.ts`; command `audit-schema-drift`).
- **Rationale:** The same logical attribute (a `bio`, an `email`, an
  `avatar_url`) realized inconsistently across a data model, with no single
  source of truth. A column duplicated across tables means the fact exists in N
  places that can disagree.
- **Justification:** First Normal Form (Codd) establishes that a logical
  attribute has one canonical home; DRY converts that into an engineering cost
  (each copy is a sync point). The "multiple writers, no owner" leg explains the
  mechanism: a table with no owner is a boundary the organization never drew.
- **Reference:** Codd, E. F. (1970). A relational model of data for large
  shared data banks. *Communications of the ACM*, 13(6), 377–387. Hunt, A.,
  & Thomas, D. (1999). *The pragmatic programmer*. Addison-Wesley.

### 2. Contract drift

- **Detector:** `contract-drift` (verifier `contract-drift.ts`; command `audit-contract-drift`).
- **Rationale:** A producer and a consumer each validate the same payload with
  separate schemas that have silently diverged (a Zod schema on the frontend vs.
  a JSON-schema/Dart model on the producer). Nothing fails until the divergent
  value hits the wire.
- **Justification:** Consumer-Driven Contracts (CDC) define the correct state: a
  shared, verifiable contract. When each side owns a private copy there is no
  contract — only two guesses. DRY qualifies the two schemas as one logical
  artifact that has been duplicated, not two independent things.
- **Reference:** Consumer-driven contracts (pattern). In *ThoughtWorks
  Technology Radar*. (CDC is cited as the pattern; see also Hunt & Thomas,
  1999, for the DRY principle.)

### 3. Bounded-context boundary leakage

- **Detector:** `bounded-context-boundaries` (verifier `bounded-context-boundaries.ts`; command `audit-bounded-context`).
- **Rationale:** A module owned by one bounded context imports the internals of
  another context directly, instead of going through that context's
  shared/published interface. The import graph no longer matches the intended
  ownership map.
- **Justification:** This is Conway's-Law drift: the system's structure has
  drifted away from the ownership boundaries the organization actually
  maintains. The conceptual basis is the Domain-Driven Design standard
  (`domain-driven-design.md`): bounded contexts own their model and expose a
  deliberate published interface; reaching past it couples two models meant to
  evolve independently.
- **Reference:** DDD standard (`shared/references/engineering-standards/domain-driven-design.md`).
  Conway, M. E. (1968). How do committees invent? *Datamation*, 14(4), 28–31.

### 4. Explicit architecture

- **Detector:** `explicit-architecture` (verifier `explicit-architecture.ts`; command `audit-explicit-architecture`).
- **Rationale:** Source dependencies must point inward, toward the most stable,
  most abstract code. A file at rank R may import a target at rank ≤ R;
  importing a higher-rank target points outward and is a violation (e.g.
  `domain` importing `infrastructure`).
- **Justification:** Herberto Graça's Explicit Architecture synthesizes
  Hexagonal (ports & adapters), Onion, and Clean architecture plus CQRS. Its
  deterministic core is the dependency rule, which is directly verifiable.
- **Reference:** Graça, H. (2017). Explicit architecture. Retrieved from
  https://herbertograca.com/2017/11/16/explicit-architecture/ (Hexagonal:
  Ports & Adapters, Cockburn, 2005; Onion: Palermo, 2008; Clean: Martin,
  2012).

### 5. Strangler fig migration health

- **Detector:** `strangler-fig` (verifier `strangler-fig.ts`; command `audit-strangler`).
- **Rationale:** A legacy system should be replaced incrementally behind a
  façade (strangler fig), not in a big-bang rewrite. The detector flags
  big-bang indicators: no façade/seam, no coexistence, a single giant cutover.
- **Justification:** The Strangler Fig pattern (Fowler) defines the correct,
  reversible migration path; the anti-pattern is the all-or-nothing rewrite.
- **Reference:** Fowler, M. (2004). Strangler fig application. Retrieved from
  https://martinfowler.com/bliki/StranglerFigApplication.html

### 6. Enforcement hooks

- **Detector:** `enforcement-hooks` (verifier `enforcement-hooks.ts` + `enforcement-hooks-efficacy.ts`; command `audit-enforcement-hooks`).
- **Rationale:** Detection-without-enforcement: the cures the other five
  families recommend are documented but no hook is installed to enforce them, so
  the drift returns. This family runs LAST, cross-referencing the other five's
  confirmed findings.
- **Justification:** The drift thesis holds that structural drift is never cured
  by a one-time fix; the load-bearing cure is `hPreToolUse/PostToolUse hooks.
  ENF verifies the cure is installed, not re-detects the drift.
- **Reference:** The 4-cure defense-in-depth model (see the Atomic Design Drift
  Thesis; hooks pattern in better-toolkits' `enforcement-hooks` detector).

---

## 1. The unifying frame: Conway's Law as the root cause

**Source**: Conway (1968), *How Do Committees Invent?* (see family 3).

**Why it is cited.** Conway's Law is the structural induction that ties the
three drift layers and the six detector families together: a system's structure
mirrors the communication structure of the organization that builds it. When the
code's structure stops matching the intended ownership map, the system has
drifted. Every detector family therefore carries an ownership dimension; without
this frame they would be a grab-bag of style rules.

---

## 2. The three drift layers

### Layer 1 — Schema drift (family 1)
A database attribute's home. Anchored to Codd (1NF) and DRY.

### Layer 2 — Primitive drift (family 2)
A wire contract between two runtime surfaces. Distinct from schema drift: data
model vs. data-in-transit.

### Layer 3 — Component drift (delegated)
The component layer (atoms/molecules/organisms/templates) is owned by the
`atomic-design-toolkit`, not by the audit-engine. RDP records this delegation so
it is explicit: `audit` composes the component sweep from the toolkit.

---

## 3. The partition: bounded-context vs. explicit architecture

The two architecture families are deliberately complementary:

| | Bounded-context | Explicit architecture |
|---|---|---|
| Question | Which bounded context owns this module? | In which layer does this file live? |
| Violation | Import crosses a context seam | Dependency points outward (inner imports outer) |
| The smell | a module imports another context's internals | `domain` imports `infrastructure` |

Each detector explicitly states it does NOT audit the other's concern. The
conceptual basis for bounded-context (and for the Inverse Conway Maneuver when
partitioning work across `/parallel-subagents`) lives in the dedicated DDD
standard (`domain-driven-design.md`); RDP only enforces it.

---

## 4. Why enforcement hooks runs last

It is not a detector of drift; it is a detector of the *cure*. It runs after
the other five because it consumes their confirmed findings.

---

## 5. How this standard is vendored

- The six detector families live in
  `toolkits/make-no-mistakes-toolkit/references/detectors/` (+ verifiers in
  `src/audit/verifiers/`, commands in `commands/audit-*.md`).
- The meta-dispatcher is `commands/audit.md`.
- The component layer is delegated to `atomic-design-toolkit`.
- Each family SHALL be backed by a Specula (TLA+) model that proves its
  detector invariant (e.g. "no duplicated logical column", "no outward
  dependency", "every pattern owns ≥1 tracked file"). The TLA+ models live under
  `scripts/tla/` (existing precedent: `BranchDefault.tla`,
  `AdoptionOrder.tla`), installed via `shared/bootstrap/scripts/setup-specula.sh`
  (see `formal-model-tla.md`). A family without a passing TLA+ model is
  **draft**, not validated.
- The report contract is `references/audit-report-schema.md`.

## References (full list)

- Conway, M. E. (1968). How do committees invent? *Datamation*, 14(4), 28–31.
- Codd, E. F. (1970). A relational model of data for large shared data banks.
  *Communications of the ACM*, 13(6), 377–387.
- Hunt, A., & Thomas, D. (1999). *The pragmatic programmer*. Addison-Wesley.
- Evans, E. (2003). *Domain-driven design*. Addison-Wesley.
- Fowler, M. (2004). Strangler fig application.
- Graça, H. (2017). Explicit architecture.
- Frost, B. (2013). *Atomic design*.
- Learner summary: internal-handbook `docs/how-to/engineering-standards/RDP.md`.
