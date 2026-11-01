# DDD — Domain-Driven Design (doctrina)

**Status:** draft — esqueleto. Será enriquecido por deep-research con las
fuentes canónicas (Evans Reference, Microsoft Architecture, bounded-context
canvas, etc.) y posteriormente referenciado por `repository-drift-prevention.md`.

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
- **Vínculo con /parallel-subagents:** si se particionan las tareas alineadas
  con los bounded-contexts del dominio, el resultado de los subagents respeta las
  fronteras deseadas. Si se particionan por módulos de código existentes, se
  replica la organización actual (y su drift). El principio Inverse Conway dice:
  define primero la estructura de equipos/tareas deseada; la arquitectura la
  sigue.

### D5 — DDD is the parent standard; RDP is the enforcement
- `repository-drift-prevention.md` **referencias** este estándar para la familia
  "bounded-context boundary leakage" y para la partición DDD/ARC. Este estándar
  es la fuente conceptual; RDP es la aplicación mecánica (detectores).

## Gates (esqueleto)

- [ ] Validación Specula (TLA+) del invariante de bounded-context (prove: no
      import cruza un contexto sin pasar por la interface publicada).
- [ ] Todo detector `bounded-context-*` traza a una regla de este estándar.

## References (esqueleto — se completará)

- Evans, E. (2003). *Domain-driven design*. Addison-Wesley.
- Evans, E. (2015). *Domain-driven design reference: Definitions and pattern
  summaries*. Domain Language.
- Conway, M. E. (1968). How do committees invent? *Datamation*.
- Inverse Conway Maneuver — source will be added by deep-research.
- Microsoft Azure Architecture Center — microservices model/domain-analysis.

## Learner summary

- internal-handbook `docs/how-to/engineering-standards/DDD.md`.
