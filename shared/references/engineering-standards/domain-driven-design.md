# DDD — Domain-Driven Design

**Status:** standard.

This standard is written in English and is vendor-neutral. It is the conceptual
**parent** standard for the "bounded-context boundary leakage" detector family and
for the bounded-context half of the "explicit architecture" partition defined in
`repository-drift-prevention.md`. Every claim below traces to a cited source in
the References section; where a claim could not be verified against a primary
source it is explicitly marked **unverified**.

---

## 1. Purpose

Standardize the use of **Domain-Driven Design (DDD)** as the organizing principle
for a repository's boundaries. DDD is not a stylistic preference; it is the
structural basis for *which* boundaries exist and *why*.

A repository's structure should follow the **domain** — the business problem the
software serves — rather than the ad-hoc communication patterns of its builders.
DDD supplies the vocabulary and the boundary-making tools (bounded contexts,
context maps, tactical patterns) that keep code aligned with the domain. When
that alignment is lost, the codebase drifts.

This standard is the **conceptual home** for two families in
`repository-drift-prevention.md` (RDP):

- The **"bounded-context boundary leakage"** family (RDP family 3), which
  mechanically detects imports that cross a bounded-context seam without going
  through the published interface.
- The **bounded-context side of the "explicit architecture" partition** (RDP
  section 3), which decides ownership by bounded context rather than by
  architectural layer.

RDP is the mechanical enforcement layer; this standard is the conceptual source.
A detector that cannot be traced to a rule in this standard is asserting a
boundary that DDD does not define.

---

## 2. Thesis

A repository's structure should mirror the **domain**, not the ad-hoc
communication of its builders. When it does not, the system drifts.

DDD gives the vocabulary and the boundaries to keep the code aligned with the
domain — and **Conway's Law, inverted**, gives the mechanism for making that
happen deliberately. The thesis has two halves:

1. **Structure mirrors domain.** Models are only meaningful inside an explicit
   context; a single model forced across a whole business degenerates into a
   "big ball of mud" (Evans, 2015; Evans, 2003). Boundaries are therefore drawn
   where the domain's meaning changes, not where the technology or the org chart
   happens to split.
2. **Invert Conway.** Because systems tend to copy the communication structure of
   the organization that builds them (Conway, 1968), the way to obtain a target
   architecture is to align team/task structure with the desired boundaries
   *first*, and let the architecture follow. This is the Inverse Conway Maneuver
   (Scrum Manager BoK, 2026; Microsoft Azure Architecture Center, n.d.-a).

This thesis is the direct antecedent of RDP: drift is what happens when the code
stops matching the intended ownership map, and the cure is to re-align ownership
(and the partition of work) with the domain's boundaries.

---

## 3. The domain model & Ubiquitous Language

**Domain model.** DDD models the business domain by creating a *domain model*: an
abstract, selective representation of the domain that distills and organizes
domain knowledge and establishes a shared language for developers and domain
experts (Microsoft Azure Architecture Center, n.d.-a). A domain model is the
"structured knowledge related to a specific problem"; it can be code, prose, or a
diagram — the medium is not the point (Brown, 2014). DDD "rejects a single
unified model for the entire system" and instead divides the system into bounded
contexts, each with its own model (Microsoft Azure Architecture Center, n.d.-b).

**Ubiquitous Language.** Central to DDD is the *ubiquitous language*: a shared
vocabulary that developers and domain experts create together within each bounded
context, used consistently in conversations, documentation, and code (Microsoft
Azure Architecture Center, n.d.-a). Evans (2015) frames it as a command:

> "Use the model as the backbone of a language. Commit the team to exercising
> that language relentlessly in all communication within the team and in the
> code. Within a bounded context, use the same language in diagrams, writing, and
> especially speech. Recognize that a change in the language is a change to the
> model."

Because the same term can mean different things in different contexts (the word
*account* or *meter* differs across contexts), each bounded context carries its
own ubiquitous language (Microsoft Azure Architecture Center, n.d.-a; Evans,
2015). A change in the language is a change to the model — so the language is a
primary driver of where boundaries belong.

---

## 4. Bounded contexts

**Definition.** A *bounded context* is the explicitly defined boundary within
which a specific domain model applies and is consistent (Evans, 2015; Microsoft
Azure Architecture Center, n.d.-a). Evans (2015):

> "Explicitly define the context within which a model applies. Explicitly set
> boundaries in terms of team organization, usage within specific parts of the
> application, and physical manifestations such as code bases and database
> schemas."

A bounded context is the *primary seam* of DDD: within it, terms have one meaning
and the model is coherent; outside it, the same term may — and often should —
mean something else (architecti.blog, 2025; Bories, 2025). In a microservices
architecture, the governing rule is that a microservice should be **no smaller
than an aggregate and no larger than a bounded context** (Microsoft Azure
Architecture Center, n.d.-b).

**Why the primary seam.** DDD classifies subdomains into *core*, *supporting*,
and *generic* to prioritize where to invest (Microsoft Azure Architecture Center,
n.d.-a). The bounded context is where that strategy becomes concrete: it delimits
the model, the language, and — critically — the ownership. Because "a bounded
context is a business domain concept" while "a microservice is a technical
implementation unit" (Bories, 2025), the boundary is a *semantic* seam first; the
technical realization (module, service, monolith module) follows the semantic one
(Suleymani, 2026).

**Published interface.** A bounded context communicates with others through a
deliberate **published interface** — the interaction it exposes to the rest of
the system. This is exactly what RDP's "bounded-context boundary leakage" family
enforces: other contexts depend on that interface, never on internals. If a
module owned by one context reaches into another context's internals, two models
that were meant to evolve independently become coupled.

**The Bounded Context Canvas.** The **Bounded Context Canvas** (ddd-crew) is the
standard analysis tool for documenting a single bounded context. It is a
collaborative template that guides designing and documenting one context, from
naming to responsibilities to its public interface and dependencies (Tune & DDD
Crew, 2020). Its sections are (Tune & DDD Crew, 2020):

- **Name & Purpose** — why the context exists, in business language.
- **Strategic Classification** — core / supporting / generic, plus role in the
  business model (revenue generator, engagement creator, compliance enforcer)
  and evolution stage.
- **Domain Roles** — how the context behaves (e.g., analysis vs. execution).
- **Inbound / Outbound Communication** — the messages (commands, queries,
  events) received and produced; this documents the public interface.
- **Ubiquitous Language** — the key domain terms and their meaning here.
- **Business Decisions** — the business rules and policies.
- **Assumptions**, **Verification Metrics**, **Open Questions**.

A later revision formalized communication as *messages consumed and produced*
using three message types — **command** (an instruction that can fail), **domain
event** (a significant thing that happened, with no obligation of response), and
**query** (a request for information) — and added a *dependencies and
relationships* section (Tune, 2020). The canvas is also extended with BDD
examples: formalized acceptance criteria (Given/When/Then) are attached to the
canvas so a context's behavior is explicit and testable, turning the canvas into
living documentation (Baas-Schwegler, 2020).

---

## 5. Context maps & relationships

A **context map** is the global view of the application as a whole: it shows the
bounded contexts and how they communicate and share data (Brown, 2014; Evans,
2015). Evans (2015) directs: "Identify each model in play on the project and
define its bounded context… Describe the points of contact between the models,
outlining explicit translation for any communication, highlighting any sharing,
isolation mechanisms, and levels of influence."

Evans (2015) defines the canonical relationship patterns between bounded
contexts:

- **Partnership** — two teams will succeed or fail together; they coordinate
  planning and jointly manage integration.
- **Shared Kernel** — a small, explicitly bounded subset of the model (and its
  code/database design) is shared; it must stay small and cannot be changed
  without consultation.
- **Customer/Supplier Development** — a clear upstream/downstream relationship;
  downstream priorities factor into upstream planning, often validated by
  jointly developed automated acceptance tests.
- **Conformist** — the downstream team eliminates translation complexity by
  "slavishly adhering" to the upstream model, sharing the upstream language.
- **Anticorruption Layer** — the downstream client creates an isolating layer
  that provides upstream functionality in terms of its own domain model,
  translating in one or both directions (Evans, 2015; Microsoft Azure
  Architecture Center, n.d.-c).
- **Open-host Service** — a subsystem defines an open protocol, a set of
  services, that all who need to integrate can use; the provider is upstream.
- **Published Language** — a well-documented shared language, often combined with
  open-host service, used as a common medium for translation (Evans, 2015).
- **Separate Ways** — two contexts have no connection at all and evolve
  independently (Evans, 2015).

In a microservices architecture, **open-host service and published language** are
especially relevant because microservices communicate through well-defined APIs
(Microsoft Azure Architecture Center, n.d.-a). Standard industry practice is to
express that language with an OpenAPI/OpenAPI-style contract for REST (Microsoft
Azure Architecture Center, n.d.-a).

---

## 6. Tactical patterns

Tactical patterns apply **within** a single bounded context. They are the
building blocks of an expressive domain model (Evans, 2015).

- **Entities** — objects distinguished by a **unique identity** that persists
  over time, not by their attributes. Evans (2015): "When an object is
  distinguished by its identity, rather than its attributes, make this primary
  to its definition in the model." Entities should encapsulate behavior, not
  only carry data; putting business logic outside them produces an *anemic
  domain model* (Microsoft Azure Architecture Center, n.d.-b).
- **Value objects** — objects with **no conceptual identity**, defined only by
  their attributes, treated as **immutable**, with side-effect-free operations
  (Evans, 2015; Microsoft Azure Architecture Center, n.d.-b). Evans: "Treat the
  value object as immutable… Don't give a value object any identity."
- **Aggregates** — a cluster of entities and value objects with a **consistency
  boundary** and one **root entity**; external objects hold references only to
  the root, and invariants are enforced by the root. Consistency rules apply
  synchronously inside the boundary; updates across boundaries are handled
  asynchronously (Evans, 2015). In microservices design, aggregates are strong
  candidates for service boundaries (Microsoft Azure Architecture Center,
  n.d.-b).
- **Repositories** — services that provide the illusion of an in-memory
  collection of an aggregate's root type, encapsulating storage and query
  technology and expressing access in the ubiquitous language (Evans, 2015).
- **Domain events** — "a full-fledged part of the domain model, a representation
  of something that happened in the domain"; a record of the past, typically
  immutable, with a timestamp and the identities of the entities involved
  (Evans, 2015). Domain events are the primary way to coordinate work **across**
  aggregate boundaries; internal domain events stay within a bounded context,
  while integration events are published asynchronously across service boundaries
  (Microsoft Azure Architecture Center, n.d.-b).
- **Services** — standalone interfaces declared when a significant domain process
  is not a natural responsibility of an entity or value object (Evans, 2015).
  DDD distinguishes **domain services** (business rules spanning multiple
  entities/aggregates) from **application services** (thin orchestration of use
  cases, with no business logic) (Microsoft Azure Architecture Center, n.d.-b).
- **Factories and Modules** — factories encapsulate complex creation (especially
  of whole aggregates); modules (packages) carry names that become part of the
  ubiquitous language and should tell the story of the system (Evans, 2015).

The boundary warnings from the microservice literature reinforce these: **content
coupling** (a service reading another's internal data/table) and **shared
persistence** are the strongest coupling smells, and each is a violation of a
bounded-context seam (sidartaoss, 2024-a).

---

## 7. The Inverse Conway Maneuver

**Conway's Law** observes that organizations that design systems are constrained
to produce designs that copy the communication structures of those organizations:
the architecture of software tends to reflect the organizational structure of the
team that builds it (Conway, 1968; Scrum Manager BoK, 2026). Fred Brooks
popularized the observation in *The Mythical Man-Month*, naming it "Conway's
Law" (Scrum Manager BoK, 2026).

**The Inverse Conway Maneuver** is the practical consequence: rather than
designing the system first and then organizing teams to build it, **design the
team/task structure you want first** and let the system reflect that structure
(Scrum Manager BoK, 2026). In the microservices context: if you want independent,
autonomously deployable services, you need teams organized to operate with real
autonomy over their services (Scrum Manager BoK, 2026).

The Inverse Conway Maneuver is not a one-time exercise; it is a standing
discipline. The common failure is to "change the architecture without changing
the organizational structure": teams may agree on a new technical architecture,
but if the organization of work and communication does not change, the code tends
to gradually regress to a structure that reflects the real organization —
"architectural refactoring without organizational change is a permanent battle
against gravity" (Scrum Manager BoK, 2026). Microsoft's guidance makes the same
point for DDD: "You can use DDD to your advantage by defining service boundaries
through domain analysis and then intentionally aligning team ownership to those
boundaries. This proactive approach ensures that your team structure supports the
architecture rather than conflicting with it" (Microsoft Azure Architecture
Center, n.d.-a).

### 7.1 Application to `/parallel-subagents`

When work is delegated to parallel subagents, the **task partition MUST mirror
the bounded-context / domain boundaries**, not the existing code layout.

This is the Inverse Conway Maneuver applied to the partition of work. Conway's
Law operates on *communication structure*; in a parallel-agent setting, the task
partition *is* the communication structure. Therefore:

- If a subagent owns a **bounded context** (or a slice of one), its output is
  shaped by the desired boundaries: it produces code that respects the context's
  published interface and does not reach into other contexts. Output respects
  the desired architecture.
- If work is partitioned by **existing code modules** (the current drift), each
  subagent replicates the current organization — including its drift. The
  resulting output reproduces the very coupling the architecture is meant to
  remove.

So the rule for `/parallel-subagents` is: **define the desired bounded-context
structure first, then partition tasks along those boundaries.** A subagent
should own a whole bounded context or a slice of one, and should be handed the
context's contract (its published interface and ubiquitous language) rather than
a list of files. This is a direct application of the Inverse Conway Maneuver: the
task structure is set to the target architecture *before* the code is written, so
the architecture follows (Scrum Manager BoK, 2026; Microsoft Azure Architecture
Center, n.d.-a).

> **Note.** The precise mechanics of `/parallel-subagents` (how a task slice is
> named and dispatched) are defined by the agent harness, not by this standard.
> This standard only fixes the partitioning *principle*: domain-first, not
> layout-first.

---

## 8. Relationship to repository-drift-prevention

`repository-drift-prevention.md` (RDP) is the **mechanical enforcement layer**;
this standard is the **conceptual source**. RDP turns DDD's boundaries into
auditable detector invariants.

Which RDP families depend on DDD:

- **RDP family 3 — "bounded-context boundary leakage"** depends directly on DDD.
  Its detector, `bounded-context-boundaries`, flags a module that imports the
  internals of another bounded context instead of going through that context's
  published interface. The *justification* for that detector is precisely the
  DDD rule "bounded contexts own their model and expose a deliberate published
  interface" (see §4 and §5 of this standard). RDP enforces the DDD seam
  mechanically; this standard defines it.
- **RDP family 4 — "explicit architecture"**, and specifically the
  **bounded-context side of the partition** (§3 of RDP), depends on DDD for the
  bounded-context ownership question. (The dependency-rule side of explicit
  architecture is documented in RDP itself via Graça, and is not a DDD claim.)
- The **partition** between "bounded-context" and "explicit architecture" in RDP
  is a partition between two *different* questions: *which bounded context owns
  this module?* (DDD) versus *in which layer does this file live?* (explicit
  architecture). RDP records that the bounded-context question's conceptual home
  is this standard.

RDP's remaining families (schema drift, contract drift, strangler fig,
enforcement hooks) are not DDD-defined; their justification lives in RDP itself.

---

## 9. Gates

- [ ] **Specula (TLA+) invariant for bounded-context.** A Specula model must
      prove the bounded-context invariant: *no import crosses a context seam
      without passing through that context's published interface*. The model is
      the formal statement of §4's "published interface" rule.
- [ ] **Every `bounded-context-*` detector traces to a rule in this standard.**
      Each such detector must cite the specific DDD rule (section) it enforces;
      a detector that cannot be traced is asserting a boundary DDD does not
      define and must not ship.
- [ ] This standard is the parent; RDP is the enforcement. Any new detector in
      the "bounded-context boundary leakage" family or the bounded-context side
      of the partition must update RDP to point here.

---

## References

- Baas-Schwegler, K. (2020). *Extending the Bounded Context Canvas with BDD
  examples*. WeaveIT. https://weave-it.org/blog/extending-the-bounded-context-canvas-with-bdd-examples/
- Bories, L. (2025). *Understanding Bounded Context in microservices
  architecture: A key to scalable software design*. IT Architecture Blog.
  https://architecti.blog/en/articles/2025/004-comprendre-le-bounded-context-en-architecture-microservices/
- Brown, P. (2014). *What are Bounded Contexts and Context Maps in Domain Driven
  Design?* Culttt. https://culttt.com/2014/11/19/bounded-contexts-context-maps-domain-driven-design
- Conway, M. E. (1968). How do committees invent? *Datamation*, 14(4), 28–31.
- Evans, E. (2003). *Domain-driven design: Tackling complexity in the heart of
  software*. Addison-Wesley.
- Evans, E. (2015). *Domain-driven design reference: Definitions and pattern
  summaries* (v2015.03). Domain Language.
  https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf
- Fowler, M. (2014). *BoundedContext*. martinfowler.com.
  https://martinfowler.com/bliki/BoundedContext.html
- Khononov, V. (2021). *Learning domain-driven design*. O'Reilly Media.
  (Cited by Microsoft Azure Architecture Center as a practical modern treatment.)
- Microsoft Azure Architecture Center. (n.d.-a). *Use domain analysis to model
  microservices*. Microsoft Learn.
  https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis
- Microsoft Azure Architecture Center. (n.d.-b). *Use tactical DDD to design
  microservices*. Microsoft Learn.
  https://learn.microsoft.com/en-us/azure/architecture/microservices/model/tactical-domain-driven-design
- Microsoft Azure Architecture Center. (n.d.-c). *Anti-corruption layer
  pattern*. Microsoft Learn.
  https://learn.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer
- Microsoft Azure Architecture Center. (n.d.-d). *Identify microservice
  boundaries*. Microsoft Learn.
  https://learn.microsoft.com/en-us/azure/architecture/microservices/model/microservice-boundaries
- Scrum Manager BoK. (2026). *Conway's Law* (including the Inverse Conway
  Maneuver).
  https://www.scrummanager.com/bok/index.php?title=Conway%27s_Law
- Souza, S. O. (2024-a). *Fronteiras de microsserviços* [GitHub repository].
  https://github.com/sidartaoss/fronteiras-de-microsservicos
- Souza, S. O. (2024-b). *Design estratégico com DDD* [GitHub repository].
  https://github.com/sidartaoss/design-estrategico-com-ddd
- Suleymani, T. (2026). *Bounded context and microservices: From theory to real
  practice*. DEV Community.
  https://dev.to/turalsuleymani/bounded-context-and-microservices-from-theory-to-real-practice-4775
- Tune, N. (2020). *Bounded Context Canvas V3: Simplifications and additions*.
  Medium (Nick Tune's Weird Ideas).
  https://medium.com/nick-tune-tech-strategy-blog/bounded-context-canvas-v2-simplifications-and-additions-229ed35f825f
- Tune, N., & DDD Crew. (2020). *Bounded Context Canvas* [GitHub repository].
  https://github.com/ddd-crew/bounded-context-canvas

**Unverified.** The exact coinage and first attribution of the *Inverse Conway
Maneuver* name (commonly credited to ThoughtWorks' Technology Radar) could not be
verified against a primary source for this revision; the maneuver's *content* is
verified via the Scrum Manager BoK (2026) description and Microsoft Azure
Architecture Center (n.d.-a) team-alignment guidance. The `levelup.gitconnected.com`
Laravel article listed in the enrichment brief returned HTTP 403 and was not used.

---

## Learner summary

- internal-handbook `docs/how-to/engineering-standards/DDD.md`.
