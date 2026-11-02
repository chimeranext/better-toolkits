# ODT — Ops Documentation Taxonomy (Diátaxis + complementary frameworks)

## Purpose

Classify every document before authoring. The goal is structural clarity: no
page mixes procedure, explanation, reference, and tutorial.
Diátaxis is the top-level sort. Other frameworks fill the gaps it leaves open.

A document that mixes types must be split.

## Diátaxis — top-level sort (per page)

Diátaxis (Procida) splits all technical content into four types, by two axes:
acquisition vs application, and action vs cognition.

| Type | Axis | Question | Use |
| --- | --- | --- | --- |
| **Tutorial** | learning + practical | "let's build together" | build capability, not a real task |
| **How-to** | task + practical | "how do I do X" | deliver steps, no explanation |
| **Reference** | task + theoretical | "what are the facts" | lookup: endpoints, params, options — no narrative |
| **Explanation** | learning + theoretical | "why does it work this way" | deepen understanding, design tradeoffs |

Rule: ask "who reads this and what are they trying to do right now" for every
page. Always a category for a page. Do not let a fact and a procedure share a
page.

## Complementary frameworks (fill Diátaxis gaps)

Diátaxis sorts content by purpose (tutorial / how-to / reference / explanation).
It does not say how to structure *inside* a page, nor how to handle arrival
(search landing). Four frameworks fill these gaps. They are not alternatives to
Diátaxis; they are layered on top of it.

### DITA (Darwin Information Typing Architecture, OASIS)

DITA extends Diátaxis with **topic-based authoring**: content is written as
standalone topics, each typed as *concept*, *task*, or *reference*, then
assembled into deliverables with maps.

- Why it extends: DITA gives the structural machinery Diátaxis leaves open —
  content reuse and conditional publishing across many outputs.
- Use it when: the same content must publish to multiple products/outputs, or
  reuse matters more than simplicity.
- Don't over-use it: most teams do not need DITA's XML tooling; the *idea* of
  separate, typed topics is enough.

### Information Mapping (Horn)

Information Mapping extends Diátaxis one level down: where Diátaxis types the
whole page, Information Mapping types each **block of information inside it**
(procedure, process, principle, concept, structure, fact) and insists each
block is labeled and kept separate.

- Why it extends: it stops a fact and a procedure from sharing a paragraph —
  the same instinct Diátaxis applies to whole pages, applied to chunks.
- Use it when: writing dense reference or operational content where block-level
  discipline matters.
- The core discipline: name what each block is before writing it; keep blocks of
  different type apart.

### Minimalism (Carroll, *The Nurnberg Funnel*)

Minimalism extends Diátaxis by governing **how steps are written**: get the user
acting immediately, cut the throat-clearing preamble, and support error recovery
instead of trying to prevent every error with warnings.

- Why it extends: Diátaxis says a how-to contains steps and nothing else; it
  does not say how to write those steps. Minimalism does.
- Use it when: writing how-to and tutorial content (key and quickstart paths).
- It pairs naturally with the how-to and tutorial quadrants.

### Every Page Is Page One (Baker)

Every Page Is Page One extends Diátaxis by addressing **arrival**: most readers
arrive via search and land mid-site on one page, with no memory of prior pages.

- Why it extends: it demands that every topic stands on its own — establish its
  context, state its scope, and link to what it assumes.
- Use it when: docs are read by search rather than front-to-back (true for most
  open-source and developer docs).
- It is a problem of arrangement, not content type; it governs how each page
  orients the reader.

### Summary table

| Framework | What it adds | Where it applies |
| --- | --- | --- |
| **DITA** (OASIS) | topic-based authoring: concept/task/reference, maps, reuse | large multi-output doc sets; content reuse |
| **Information Mapping** (Horn) | types each *block* inside a page, labeled and separate | page internal structure; don't mix a fact and a procedure in one paragraph |
| **Minimalism** (Carroll) | how to write steps: act immediately, drop preamble, support error recovery | how-to and tutorial quadrants |
| **Every Page Is Page One** (Baker) | each page stands alone (arrival via search), states its own context and scope | arrangement; orient the reader on every page |

## More taxonomy: Playbook vs Runbook vs SOP

Operational docs are classified into three types before authoring:

1. **Runbook** — *how* to execute a specific trigger-driven procedure. Sequential,
   testable steps; verbatim commands; bus-factor-1. Requires engineering context.
2. **Playbook** — *when/why* to choose a path under uncertainty. Decision tree,
   options, RACI, judgment (not execution). Human-readable; links to runbooks.
3. **SOP** — how the company operates a recurring business process. No code
   required; corporate/handbook level.

### Decision rule

- The reader must execute fixed steps → Runbook.
- The reader must choose among branches before acting → Playbook.
- No code needed; company-level recurring process → SOP.

### Mapping to Diátaxis

- Runbook → How-to quadrant.
- Playbook → How-to (+ explanation flavor).
- SOP → Reference quadrant.

## Navigation vs content

Diátaxis guides **content type per page**. It does not dictate the sidebar shape.
Navigation is ordered by user journey and task, not by content type. Use a
declarative index (e.g. `docs.json` / Holocron / Mintlify) as the single source
of truth for the sidebar. Keep a top-level limit of ~7 sections; group content
by domain or task, not by internal product folders.

## Vendored SSOT

- `toolkits/fractional-cto-toolkit/references/documentation-taxonomy.md` (diagram,
  templates, examples).
- Templates: `references/08-runbook-template.md`, `references/09-playbook-template.md`,
  `references/01-takeover-sop-template.md`.

## Enforcement

- Author via `/document-this` routing; do not hand-mix pages.
- Reference this standard from any ops doc that must be classified.
- A page that mixes two Diátaxis types must be split; move explanation to its own
  page and link to it from the how-to.
