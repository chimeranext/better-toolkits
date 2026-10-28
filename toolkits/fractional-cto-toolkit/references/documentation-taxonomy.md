# Documentation Taxonomy — Diátaxis + SOP vs Playbook vs Runbook

Shared single source of truth for documenting decisions used by `sop-authoring`,
`playbook-authoring`, `runbook-authoring`, and `document-this`. The three authoring skills
delegate their routing test to this page instead of duplicating it. This reference combines
two layers:

1. **Diátaxis** [^diataxis] — how to *organize a documentation site/handbook* into four
   quadrants. This is **how ChimeraNext resolved the problem**: the internal-handbook and the
   startup monorepo docs are organized this way (Docusaurus is the recommended platform). For
   **your startup these are only recommendations — opinionated, not enforced**; adopt what
   fits your context.
2. The **three-way ops taxonomy** — how to *classify a single document* as SOP / playbook /
   runbook before authoring.

[^diataxis]: Diátaxis. (s.f.). *Diátaxis — a systematic approach to technical documentation
    authoring*. https://diataxis.fr/

---

## 1. Diátaxis — organizing a handbook/docs site

Diátaxis identifies four distinct user needs and four corresponding documentation forms.
Documentation should be organized around these structures:

| Quadrant | User need | Form | Example |
|---|---|---|---|
| **Tutorials** | Learning (acquisition of skill) | Guided, progressive, for a *learner* | "Get started with the SDK", "Onboarding path" |
| **How-to guides** | Solving a *task* | Directions, steps, goal-oriented | "How to open a PR", "How to deploy" |
| **Reference** | Information (look-up) | Dry, accurate, exhaustive | API reference, config schema, glossary |
| **Explanation** | Understanding (why) | Discursive, contextual, background | "Why we use a shared-services LLC" |

**Rules of thumb:**

- A page usually belongs to exactly **one** quadrant (not mixed). If it mixes, split it.
- **Tutorials** and **How-to** are both practical, but tutorials are for *acquisition of
  skill* (learner) while how-to solves *a task* (task-doer).
- **Reference** and **Explanation** are both conceptual, but reference is *look-up* while
  explanation is *understanding*.
- Navigation/sidebars mirror the quadrants. The compass: *Tutorials* (start), *How-to*
  (do), *Reference* (check), *Explanation* (understand).

### Mapping the ops types onto Diátaxis

| Ops type | Diátaxis quadrant | Because… |
|---|---|---|
| **Runbook** | **How-to** | step-by-step task execution (the "how") |
| **Playbook** | **How-to** (+ explanation flavor) | choosing the right task/path under uncertainty — a decision-oriented how-to |
| **SOP** | **Reference** (company process) | the authoritative statement of how a recurring company process runs |
| **Post-mortem** | **Explanation** (dated narrative) | understanding why an incident happened; extract reusable judgment into a playbook |
| **PDR / ADR** | **Explanation** / **Reference** | decision records — why/how something was decided |

---

## 2. The three-way ops taxonomy

| Type | It answers | Shape | Requires engineering context? | Canonical home |
|---|---|---|---|---|
| **SOP** | How the **company** operates a recurring business process | Roles, phases, gates; no code | **No** | Corporate handbook / business brain (`_procedimientos/`) |
| **Playbook** | *When / why* to choose a path under uncertainty; which runbook/script to run | Decision tree, options, RACI, linked execute artifacts | Judgment, not execution | The unit / repo that owns the judgment |
| **Runbook** | *How* to execute a specific trigger-driven procedure | Sequential, testable steps; verbatim commands; bus-factor-1 | **Yes** | The repo / system that executes it |

### The dividing line: execute vs decide vs company process

- **A software engineer must understand it to execute it** → **Runbook** (numbered steps).
- **The reader must choose among branches before acting** → **Playbook** (decision tree).
- **No code required to understand; a company-level recurring process** → **SOP**.

This is not about "process vs event" — it is about *who needs what to act*.

---

## 3. Placement rule by level

The level of the owning unit decides where the document lives:

- **SOPs live at corporate/handbook level.** They document how the *company* (or the shared
  services studio) operates a repeatable process. Their home is the corporate handbook or the
  business brain's `_procedimientos/`.
- **Playbooks and runbooks live with the unit that owns them** — a startup/venture repo, a
  system, or a product team. They are **not** corporate handbook content; the handbook may
  index them but not host them.

A *corporate handbook* should therefore contain **SOPs** (and a taxonomy page). Its playbooks
and runbooks belong to each startup's own repo.

---

## 4. Related document types (not in the three-way taxonomy)

| If the draft is really about… | It is a… | Route it to… |
|---|---|---|
| A one-off timeline of a single incident | **Post-mortem** | write a post-mortem; extract reusable judgment via `/playbook-authoring` |
| *What* to build, for whom, and why | **PDR** (Product Decision Record) | `openspec/changes/{date-slug}/proposal.md` |
| *How* it is built technically (stack, schema, infra, APIs) | **ADR** (Architecture Decision Record) | `openspec/changes/{date-slug}/design.md` |
| How an end user *uses* the finished product | **Product Documentation** | product docs |
| How to security-test a system (authorized engagement) | **Security playbook** | `/pentest-playbook-setup` |

---

## 5. Quick decision tree (the "document-this" path)

```
"Quiero documentar X"
      │
      ▼
¿Requiere contexto técnico/ingenieril para ejecutarse?
      │
  No ──► Proceso de negocio recurrente, sin código → **SOP**
      │                                          → `/sop-authoring`
      │                                          → vive en: handbook corporativo / brain
      │
    Sí ──► ¿Se trata de ELEGIR entre caminos bajo incertidumbre?
      │      (cuándo/por qué, árbol de decisión)
      │
    No ──► Secuencia de pasos concretos → **Runbook**
      │                              → `/runbook-authoring`
      │                              → vive en: el repo/unidad
      │
    Sí ──► Decisión + juicio → **Playbook**
              → `/playbook-authoring`
              → vive en: la unidad/repo
```

---

## 6. Notes

- Never treat "playbook" as a synonym for runbook or post-mortem.
- A playbook answers *which* runbook or script to run and *when*; a runbook performs *how*
  with guardrails; an SOP documents how the company operates a repeatable process.
- Promote a playbook to an SOP only once the work is a recurring company process with no
  engineering context required.
- **Docusaurus** is the recommended docs platform for ChimeraNext and the startup monorepos,
  but it is a recommendation, not an enforcement.
- Use the Acme universe for examples (e.g. "AcmePay public-edge timeout playbook",
  "RapidEats refund SOP").

---

## 7. Agent-friendly frontmatter (OKF-inspired)

Every documentation file carries a YAML frontmatter block. Mirroring the Open Knowledge Format
(OKF), keep it minimal but first-class for agent consumption:

```yaml
---
type: SOP | Playbook | Runbook | Reference | Explanation | Tutorial # REQUIRED
title: Display name
description: One-line summary
tags: [category, common]
status: draft | stable | deprecated            # default stable
owner: role (not a person)                     # Responsible (RACI) — mantiene el doc
approver: role (not a person)                  # Accountable (RACI) — aprueba cambios
last_updated: 2026-10-27
verified: human | machine | unverified          # trust signal
sources:                                        # optional provenance
  - { resource: "...", title: "..." }
---
```

- **`type` is required.** It is the routing key for agents (and for `document-this`).
- **`owner` is the Responsible role (RACI)** — who maintains the doc (role, not a person),
  same discipline as the SOP templates.
- **`approver` is the Accountable role (RACI)** — who approves changes. Add it whenever the
  document has a sign-off gate (SOPs, playbooks, reference). For docs without a formal gate, it
  may be omitted or equal to `owner`.
- **`last_updated` + `verified`** give readers/agents the trust signal (Plane: "trusted and
  current").
- Keep extra keys minimal; consumers tolerate unknown keys (OKF §11).

**Naming conventions** (Databricks + Plane):

- Use `kebab-case.md` — never `PascalCase`, `snake_case`, or `ALL_CAPS`.
- Date-prefix only historical/dated records: `YYYY-MM-DD-description.md`.
- Prefer outcome/task-focused titles over vague ones (`how-to-open-a-pr.md`, not `notes.md`).
- One canonical home per document; link, don't duplicate (Plane step 3).

**Reserved filenames** (OKF §3.1): `index.md` (directory listing / progressive disclosure) and
`log.md` (chronological append-only update history). Use them at directory level.

---

## 8. Referencias

Citas en formato APA (adaptado para recursos web, gists y repos). Las menciones en línea en este
documento referencian esta lista.

- Diátaxis. (s.f.). *Diátaxis — a systematic approach to technical documentation authoring*.
  https://diataxis.fr/
- Google Cloud Platform. (2026). *Open Knowledge Format (OKF) v0.2 — Specification*.
  https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md
- Karpathy, A. (2026). *LLM Wiki — a pattern for building personal knowledge bases with LLMs*
  [GitHub gist]. https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
- GitBook. (s.f.). *How to structure technical documentation: information architecture best
  practices*. https://gitbook.com/docs/guides/docs-best-practices/documentation-structure-tips
- Kanojia, S. (2026). *How to organize team documentation: a complete guide for growing teams*.
  Plane. https://plane.so/blog/how-to-organize-team-documentation-a-complete-guide-for-growing-teams
- Read the Docs. (s.f.). *How-to guides: best practices*.
  https://docs.readthedocs.com/platform/stable/guides/best-practice/index.html
- Subrahmanyam, P. (2026). *Documentation Organization & Framework Authoring* [Databricks
  skill]. https://github.com/databricks-solutions/vibe-coding-workshop-template/blob/main/data_product_accelerator/skills/admin/documentation-organization/SKILL.md
- Pena Castillo, L. A. (2026). *Playbook vs runbook — taxonomy* [Obra original interna, doc de
  procesos operativos].
