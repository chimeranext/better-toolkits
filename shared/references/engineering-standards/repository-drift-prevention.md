# RDP — Repository Drift Prevention (doctrina)

## Purpose

Standardize the detection and prevention of **structural drift** across a
repository: the tendency of a codebase to silently diverge from its intended
single-source-of-truth ownership. This standard is the doctrine behind the
seven
`audit-engine` detector families. It does not define the detectors' mechanics
(those live in `references/detectors/`); it justifies WHY each canonical source
is cited, so a reader understands the conceptual chain rather than treating the
citations as citation lists.

---

## The seven detector families

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
- **Rationale:** A module owned by one declared context imports the internals of
  another declared context directly, instead of going through that context's
  shared/published interface. The import graph no longer matches the declared
  ownership map.
- **Justification (provenance — separation of concerns).** This detector
  enforces the **declared ownership map** (CODEOWNERS / Linear project / top-
  level pillar), which is an *organizational* boundary. It is NOT, by itself,
  a DDD semantic boundary. The DDD standard defines the *ideal* (a bounded
  context drawn where the domain's meaning changes); this detector only checks
  that imports respect whatever map is declared. To avoid overclaiming:
  - **What the detector enforces:** the declared map — imports must not cross
    it except through a published interface.
  - **What it does NOT certify:** that the declared map is a valid DDD
    bounded-context map. That is a separate, upstream question (provenance):
    "is this boundary domain-derived or org-derived?"
  - **The context-map substrate (§5):** to distinguish a *legitimate published
    relationship* from an *illegitimate crossing*, the detector consumes a
    machine-readable context-map artifact (contexts, published interfaces,
    relationships). Without that artifact, the detector can only flag crossings
    against the raw ownership map and cannot apply §5 relationship semantics.
  - **Provenance check:** the audit MUST report whether the ownership map is
    domain-derived (from a context map) or org-derived (CODEOWNERS/Linear), so
    the result is not mistaken for a DDD validation.
- **Reference:** DDD standard (parent) —
  `shared/references/engineering-standards/domain-driven-design.md` (esp. §4
  "Bounded contexts — published interface", §5 "Context maps & relationships",
  and the context-map artifact). Conway, M. E. (1968). How do committees invent?
  *Datamation*, 14(4), 28–31. Evans, E. (2003). *Domain-driven design*.
  Addison-Wesley.

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
- **Extension — intra-repo subtree migration (no ratchet):** This family also
  covers migrating one logical domain/pillar at a time between trees (e.g.
  `app/Domain/*` vs legacy `app/Services/*`; `courses/` → `pathways/`). The
  detector measures migration progress (what % of a domain lives in the
  canonical tree) and flags residue. It does **NOT** use a ratchet /
  monotonic-shrink allowlist as the enforcement mechanism: maintaining such an
  allowlist on every PR is a process anti-pattern (observed to block merges and
  burn team velocity). Progress is tracked by the grandfather list shrinking
  only when a module is genuinely migrated and deleted; there is no
  bookkeeping burden per PR.
- **Reference:** Fowler, M. (2004). Strangler fig application. Retrieved from
  https://martinfowler.com/bliki/StranglerFigApplication.html

**Plain-language terminology (grandfather list vs. ratchet).**

- **Grandfather list** — a list of the legacy pieces that still exist and have
  not yet been migrated. It only ever gets shorter, and only shrinks when a
  piece is actually migrated and deleted. It imposes no per-PR bookkeeping:
  you work normally, and the list simply reflects what remains to migrate.
- **Ratchet / monotonic-shrink allowlist** — an automated, stricter version: it
  *blocks* the merge unless the list shrank, forcing you to update it on every
  PR. It turns technical debt into a standing maintenance tax that stalls each
  merge until you touch the list.
- **Why grandfather-list wins here.** The grandfather list informs (and shrinks
  on genuine progress); the ratchet blocks and demands maintenance. A process
  anti-pattern is when the automated penalty costs more than the debt it
  prevents. The ratchet is therefore NOT used; the grandfather list is.

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

### 7. Ownership / placement drift

- **Detector:** `ownership-placement-drift` (verifier `ownership-placement-drift.ts`; command `audit-ownership-placement`).
- **Rationale:** A module is **not assigned to the boundary it should belong
  to** — files/components placed in a junk drawer, a misnamed/misplaced folder,
  a dead unintegrated duplicate, or a module whose declared owner is wrong. This
  is distinct from family 3: family 3 detects imports *crossing* a boundary;
  this family detects that a module is *assigned to the wrong boundary in the
  first place*.
- **Justification:** This is the most-documented drift failure in real client
  ecosystems (e.g. `src/components/dashboard/` as a junk drawer, `courses/`
  misnamed vs `pathways/`, dead duplicated components). It validates the
  ownership map itself, not just the import graph. It also supports ownership
  personas (decision-owner vs code-owner vs reviewer) and the "multiple
  writers, one canonical owner with a publish step" model.
- **Reference:** Domain-Driven Design standard (ownership / bounded-context
  assignment); Atomic Design (component placement); observed patterns in
  pillar-ownership ecosystems.

---

## 1. The unifying frame: Conway's Law as the root cause

**Source**: Conway (1968), *How Do Committees Invent?* (see family 3).

**Why it is cited.** Conway's Law is the structural induction that ties the
three drift layers and the seven detector families together: a system's structure
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

Each detector explicitly states it does NOT audit the other's concern.

The **bounded-context column's conceptual home is the DDD standard**
(`domain-driven-design.md`): it defines *which bounded context owns this module*,
the published interface, and the Inverse Conway Maneuver for partitioning work
across `/parallel-subagents` (DDD standard §7). RDP only enforces that standard —
it does not redefine it. The **explicit-architecture column** (dependency rule,
layers) is documented in RDP itself via Graça and is not a DDD claim; the two
axes are complementary, and each detector audits only its own question.

---

## 4. Why enforcement hooks runs last

It is not a detector of drift; it is a detector of the *cure*. It runs after
the other five because it consumes their confirmed findings.

---

## 5. How this standard is vendored

- The seven detector families live in
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
