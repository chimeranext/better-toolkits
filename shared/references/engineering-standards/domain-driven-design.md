# DDD — Domain-Driven Design (doctrina)

**Status:** draft — skeleton. Will be enriched by deep-research with the
canonical sources (Evans Reference, Microsoft Architecture, bounded-context
canvas, etc.) and subsequently referenced by `repository-drift-prevention.md`.

## Purpose

Standardize the use of **Domain-Driven Design** as the organizing principle for
a repository's boundaries. DDD is not a style; it is the structural basis for
*which* boundaries exist and *why* — the very thing the repository-drift
detector families enforce. This standard is the **parent** of the "bounded-context
boundary leakage" family in `repository-drift-prevention.md`.

## Thesis

A repository's structure should mirror the **domain** (the business problem), not
the ad-hoc communication of its builders. When it does not, the system drifts.
DDD gives the vocabulary and the boundaries to keep the code aligned with the
domain — and Conway's Law (inverted) gives the mechanism for making that happen
deliberately.

## Doctrine (esqueleto)

### D1 — Bounded contexts are the primary seam
- The domain is decomposed into **bounded contexts**, each owning its Ubiquitous
  Language and its model.
- A bounded context exposes a **published interface**; other contexts depend on
  that interface, never on internals (this is what the RDP "bounded-context
  boundary leakage" detector enforces).

### D2 — Context maps and anti-corruption layers
- Contexts relate via a **context map** (partnership, shared kernel, customer/
  supplier, conformist, anticorruption layer, open-host service, published
  language).
- Where two contexts must interoperate with different Ubiquitous Languages, an
  **anti-corruption layer** translates.

### D3 — Tactical patterns apply within a context
- Entities, value objects, aggregates, repositories, domain events, services,
  factories — each with its tactical rules inside a single bounded context.

### D4 — The Inverse Conway Maneuver is the organizational mechanism
- Conway's Law: system structure mirrors communication structure. The
  **Inverse Conway Maneuver** (a.k.a. the "Inverse Conway Maneuver") is: to get
  the target architecture, **change the team structure first** so communication
  matches the desired boundaries, then the architecture follows.
- Application to `/parallel-subagents`: when work is delegated to parallel
  subagents, the **task partition must mirror the bounded contexts/domain
  boundaries**, not the existing code layout. Each subagent should own a
  bounded context (or a slice of one), so its output matches the desired
  architecture instead of reinforcing drift.
- **Connection to `/parallel-subagents`:** if tasks are partitioned aligned with
  the domain's bounded contexts, the subagents' output respects the desired
  boundaries. If partitioned by existing code modules, it replicates the current
  organization (and its drift). The Inverse Conway principle: define the desired
  team/task structure first; the architecture follows.

### D5 — DDD is the parent standard; RDP is the enforcement
- `repository-drift-prevention.md` **references** this standard for the
  "bounded-context boundary leakage" family and for the DDD/ARC partition. This
  standard is the conceptual source; RDP is the mechanical application
  (detectors).

## Gates (skeleton)

- [ ] Specula (TLA+) validation of the bounded-context invariant (prove: no
      import crosses a context without going through the published interface).
- [ ] Every `bounded-context-*` detector traces to a rule of this standard.

## References (esqueleto — se completará)

- Evans, E. (2003). *Domain-driven design*. Addison-Wesley.
- Evans, E. (2015). *Domain-driven design reference: Definitions and pattern
  summaries*. Domain Language.
- Conway, M. E. (1968). How do committees invent? *Datamation*.
- Inverse Conway Maneuver — source will be added by deep-research.
- Microsoft Azure Architecture Center — microservices model/domain-analysis.

## Learner summary

- internal-handbook `docs/how-to/engineering-standards/DDD.md`.
