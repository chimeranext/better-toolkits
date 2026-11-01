# RDP — Repository Drift Prevention (doctrina)

## Purpose

Standardize the detection and prevention of **structural drift** across a
repository: the tendency of a codebase to silently diverge from its intended
single-source-of-truth ownership. This standard is the doctrine behind the six
`audit-engine` detector families (SCH/CDC/DDD/ARC/STR/ENF). It does not define
the detectors' mechanics (those live in `references/detectors/`); it justifies
WHY each canonical source is cited, so a reader understands the conceptual chain
rather than treating the citations as citation lists.

## The thesis

Drift is not a quality defect you fix once. It is the **default trajectory** of
any codebase that does not actively resist it. The six detector families are a
defense-in-depth response to that trajectory. Each family is anchored to a
canonical source, and each source is cited for a specific, non-arbitrary reason.

---

## 1. The unifying frame: Conway's Law as the root cause

**Source**: Conway (1968), *How Do Committees Invent?*

**Why it is cited.** Conway's Law is not a metaphor here; it is the structural
induction that ties the three drift layers (schema, primitive, component) and
the six detector families together. It states that a system's structure mirrors
the communication structure of the organization that builds it. The actionable
corollary for drift prevention is: when the structure of the code stops matching
the ownership map the organization means to maintain, the system has drifted. A
schema column duplicated across tables, a payload validated twice with divergent
schemas, a module reaching into another team's internals — each is a point where
the code's embedded structure has outrun the org's intended boundaries.

**What it justifies.** It makes drift an *organizational* failure mode, not a
purely technical one. That is why every detector family carries an ownership
dimension (multi-writer-no-owner, missing canonical owner, cross-context
import). Without this frame, the detectors would be a grab-bag of style rules;
with it, they are a single, coherent anti-pattern with three faces.

---

## 2. The three drift layers

### Layer 1 — Schema drift (SCH)

**Sources**: Codd (1970), *A Relational Model of Data for Large Shared Data
Banks*; Hunt & Thomas (1999), *The Pragmatic Programmer* (DRY).

**Why Codd is cited.** First Normal Form (1NF) is not a database nicety; it is
a claim about identity. A logical attribute (a person's bio, an email, an
avatar URL) has one canonical home. Scattering it across tables means the same
fact exists in N places that can disagree. Codd's citation justifies the
detector's core primitive: a duplicated logical column is a normalization
failure, and the detector's job is to surface it.

**Why DRY is cited.** DRY converts Codd's formal claim into an engineering cost
argument: each copy is a place that must be kept in sync, and each sync point is
a drift opportunity. The detector combines both: it looks for the *same logical
attribute* (Codd) realized in *multiple places* (DRY), and flags the absence of
a single owner.

**Why "multiple writers, no owner" is added.** Codd and DRY explain *why* the
duplication is bad; they do not explain *how* it arises. The third leg — a
table written by several teams with no canonical owner — explains the mechanism.
It is the bridge to Conway's Law: a table with no owner is a boundary the org
never drew, so duplication accumulates where convenient.

### Layer 2 — Primitive drift (CDC)

**Sources**: Consumer-Driven Contracts (CDC); DRY.

**Why CDC is cited.** The contract between a producer and its consumer is a
shared, verifiable artifact. When each side owns a private, hand-maintained copy
of the schema, there is no contract — only two guesses. CDC names the *correct*
state (a single, shared contract) and thereby defines what the detector is
looking for: the absence of that shared artifact.

**Why DRY is cited again.** The same payload shape defined in two places (a Zod
schema on the frontend, a JSON-schema/Dart model on the producer) is DRY
violated at the boundary. DRY here justifies treating the two schemas as *one*
logical artifact that has been duplicated — not as two independent things.

**What makes CDC distinct from SCH.** SCH is about a database attribute's home;
CDC is about a *wire contract* between two runtime surfaces. They are different
layers (data model vs. data-in-transit), which is why they are separate
families.

### Layer 3 — Component drift (delegated)

**Source**: Brad Frost (2013), Atomic Design; Conway's Law.

**Why it is delegated.** The component layer (atoms/molecules/organisms/
templates) is owned by the `atomic-design-toolkit`, not by the audit-engine. The
six families are the architecture/process layers; the component layer is a
separate concern with its own taxonomy. RDP records this delegation so it is
explicit: `audit` composes the component sweep from the toolkit, it does not
absorb it.

**Why Conway is cited again.** The component layer is where Conway's Law shows
up most visibly: components are organized by team structure, not by domain. A
`src/components/` junk-drawer with 57 root folders is the component-layer
expression of the same anti-pattern that produced schema and primitive drift.

---

## 3. The six detector families

### SCH — Schema Drift
Detects duplicated logical columns + multi-writer-no-owner tables. Verify:
`findDuplicatedColumns(sql, { minTables: 2 })`.

### CDC — Contract Drift
Detects producer/consumer payload schemas that diverged. Verify: paired-schema
comparison.

### DDD — Bounded-Context Boundaries
Detects imports that cross a bounded-context seam (a module reaching into
another context's internals instead of its published interface). This is the
**Conway's-Law drift** detector: the import graph no longer matches the
ownership map. Verify: `findCrossContextImports(files, ownership)`.

### ARC — Explicit Architecture
Detects layer-direction violations: source dependencies must point inward
(domain → application → infrastructure → ui). Anchored to Herberto Graça's
Explicit Architecture (2017): Hexagonal (ports & adapters) + Onion + Clean +
CQRS. **This is DDD's complement**: DDD audits *which context*, ARC audits
*which layer direction*.

### STR — Strangler Fig
Detects migration health: whether a legacy system is being strangler
incrementally (Fowler, 2004) or big-bang rewritten. Anchored to the Strangler
Fig pattern.

### ENF — Enforcement Hooks
Detects detection-without-enforcement: whether the cures the other five families
recommend are actually installed as hooks. Runs LAST, cross-referencing the
other five's confirmed findings.

---

## 4. The partition: why DDD and ARC are separate

The two architecture families are deliberately complementary, not overlapping:

| | DDD | ARC |
|---|---|---|
| Question | Which bounded context owns this module? | In which layer does this file live? |
| Violation | Import crosses a context seam | Dependency points outward (inner imports outer) |
| The smell | `pathways` imports `hackathons/internal` | `domain` imports `infrastructure` |
| Verify | `findCrossContextImports` | layer-rank check |

Each detector's header explicitly states it does NOT audit the other's concern.
RDP records this so the partition is a documented contract, not an accident.

---

## 5. Why ENF runs last

ENF is not a detector of drift; it is a detector of the *cure*. Its job is to
verify the hooks the other five recommend actually exist. It runs after the
other five because it consumes their confirmed findings. This is the
defense-in-depth closing step: the other five say "here is drift"; ENF says
"and here is whether you installed the enforcement to stop it returning."

---

## 6. How this standard is vendored

- The six detector families live in
  `toolkits/make-no-mistakes-toolkit/references/detectors/` (+ verifiers in
  `src/audit/verifiers/`, commands in `commands/audit-*.md`).
- The meta-dispatcher is `commands/audit.md` (runs SCH→CDC→DDD→ARC→STR→ENF).
- The component layer is delegated to `atomic-design-toolkit`.
- The report contract is `references/audit-report-schema.md` (findings
  namespaced `SCH-###`…`ENF-###`).

## References

- The thesis that motivated the audit engine: Atomic Design Drift Thesis
  (Conway's Law as the bankruptcy chain).
- Sources cited per family: Conway (1968), Codd (1970), Hunt & Thomas (1999),
  Evans (Domain-Driven Design), Fowler (Strangler Fig, 2004), Herberto Graça
  (Explicit Architecture, 2017), Brad Frost (Atomic Design, 2013).
- Learner summary: internal-handbook `docs/how-to/engineering-standards/RDP.md`.
