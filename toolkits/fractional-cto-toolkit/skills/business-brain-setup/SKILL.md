---
name: business-brain-setup
description: >
  Bootstraps or converts a venture's "business brain" — a Git-versioned, Obsidian-compatible
  Markdown vault that holds all business knowledge (decisions, assumptions, risks, KPIs,
  procedures, retros) as atomic linked notes. Use this skill when the user mentions
  "business brain", "set up our business brain", "second brain for the company",
  "convert our business model folder", "migrate the BMC to the brain", "knowledge vault
  for the venture", "cerebro de negocio", "configura el business brain", or when a venture
  needs a single source of truth that both humans and AI agents can read. Two modes:
  greenfield scaffold, or migration of an existing business-model output folder
  (./business/) into the brain. NOT for personal note-taking setups, and NOT for writing
  the business model itself (that is the business-model-toolkit).
---

# Business Brain Setup

Creates the operating knowledge system of a venture: one Git repo (or one `business-brain/`
folder inside it) where every meaningful business idea — a decision, an assumption, a risk,
a metric, a learning — lives as an **atomic Markdown note** with YAML frontmatter, connected
by `[[wikilinks]]` and indexed by per-unit **MOCs** (Maps of Content). The vault is
Obsidian-compatible but tool-agnostic: plain Markdown in Git, readable by humans and by
AI agents as the venture's source of truth.

Methodology: **CODE** (Capture → Organize → Distill → Express) as the workflow,
**Zettelkasten** atomic notes as the content unit, **MOC hubs** as navigation, and
**PARA** as an actionability layer expressed in frontmatter — never as extra folders.

## Language rule

The skill's questions and working notes are in **English**. Generated vault content follows
the **venture's working language** — Spanish for ChimeraNext/LATAM ventures, English
otherwise. Folder names and frontmatter keys are always in the canonical form shown below
(Spanish domain terms, English metadata keys). Confirm with the user if unclear.

## Output directory

Everything goes in `./business-brain/` within the current working directory (or the repo
root itself when the user says the whole repo IS the brain — e.g. a repo renamed from
`business-model` to `business-brain`). Ask which of the two when ambiguous.

## Canonical vault structure

| Folder | Domain | PARA bias |
|---|---|---|
| `00-inbox/` | Capture zone ("Limbo") — everything enters here unclassified | capture |
| `0-gerencia/` | Management: strategy, OKRs, board, legal compliance, alliances | areas + projects |
| `1-operaciones/` | Operations: procedures in motion, logistics, HR/talent | areas |
| `2-ingenieria-producto/` | Product engineering: features, spikes, internal tooling | projects |
| `3-experiencia-cliente/` | Customer experience: marketing, journeys, research, satisfaction | areas + resources |
| `4-finanzas/` | Finance: metrics, financial model, tax management | areas |
| `modelo-negocio/` | Business Model Canvas modules + corporate purpose | resources → projects |
| `identidad-marca/` | Brand identity | resources |
| `_procedimientos/` | SOPs (versioned standards; pairs with /process-standardization) | areas |
| `_retros-minutas/` | Retrospectives, meeting minutes, daily/weekly logs | archives |
| `_templates/` | Note templates (see below) | infra |
| `assets/` | Images and binary attachments | infra |

Numbered prefixes impose flow order, not alphabetical order. The folder locates a note;
the links connect it — cross-unit `[[wikilinks]]` are where the value emerges.

## Note conventions

Every note is atomic — one business idea per `.md` file — with this frontmatter:

```yaml
---
id: 202607101430            # YYYYMMDDHHMM timestamp
title: Supuesto de pricing B2B
aliases: [pricing-b2b]
type: decision | supuesto | riesgo | kpi | aprendizaje | procedimiento | minuta | retro | moc
unidad: 0-gerencia | 1-operaciones | 2-ingenieria-producto | 3-experiencia-cliente | 4-finanzas | transversal
para: project | area | resource | archive
status: activo | validado | descartado | archivado
date: 2026-07-10
tags: [hipotesis, cliente]
---
```

Cross-cutting tags: `#riesgo`, `#decision`, `#okr`, `#cliente`, `#hipotesis`. The
frontmatter is mandatory from day 1: it is what lets Obsidian Bases (or any tool, or an
agent) generate the decision log, the risk register, and the hypothesis backlog as
filtered views without rework.

## Flujo del skill

### Step 1 — Detect mode

Look for existing business-model output in the working directory:

- `./business/` with numbered BMC module files (business-model-toolkit output), or a repo
  named `business-model` → offer **migrate mode**.
- Neither → **greenfield mode**.

Confirm the detected mode and the output location with the user before writing anything.

### Step 2 — Scaffold the structure

Create every folder from the canonical table, each with a `_MOC.md` (type: `moc`) that
will serve as its hub: a short purpose line plus empty sections for the notes that will
link into it. Create the root `README.md` explaining the methodology in one screen
(CODE flow, atomicity rule, weekly inbox sweep) and the root `_MOC.md` linking the
per-unit MOCs — the entry point for humans and agents alike.

### Step 3 — Templates

In `_templates/`, create: `nota-atomica.md`, `decision.md`, `riesgo.md`, `minuta.md`,
`retro.md`, `procedimiento.md`, `moc.md` — each pre-filled with the frontmatter above
using `{{date}}`-style placeholders. Keep them minimal; templates lower capture friction,
they must never raise it.

### Step 4 — Migrate (migrate mode only)

Map each BMC module file from `./business/` into the vault, as atomic notes linked to
their MOC — never as monolithic copies:

| BMC content | Destination |
|---|---|
| Propósito / visión / founder profile | `modelo-negocio/` + cite from `0-gerencia/_MOC` |
| Segmentos de mercado, perfil del cliente, fuerzas del cliente | `3-experiencia-cliente/` (linked from `modelo-negocio/`) |
| Propuesta de valor, problemática | `modelo-negocio/` |
| Canales, relación con clientes | `3-experiencia-cliente/` |
| Ingresos, costos, métricas | `4-finanzas/` (linked from `modelo-negocio/`) |
| Recursos, actividades, alianzas clave | `1-operaciones/` and `0-gerencia/` per topic |
| Identidad de marca | `identidad-marca/` |

Each migrated note keeps its original content but gains frontmatter and `[[links]]` to its
unit MOC and to `modelo-negocio/_MOC`. Show the user the mapping table filled with the
actual files found and get approval before moving. Preserve the originals under
`00-inbox/migrated-backup/` until the user confirms deletion.

### Step 5 — Git

If the vault is not inside a Git repo, `git init` and make the initial commit. Add a
`.gitignore` for `.obsidian/workspace*` (device-local state) while keeping shared config
versioned. The commit history is the venture's auditable decision memory.

### Step 6 — Verify and hand off

Checklist to print at the end:

- [ ] All canonical folders exist, each with its `_MOC.md`
- [ ] Templates present and frontmatter-complete
- [ ] (migrate) Every source file mapped, linked, and backed up
- [ ] Root README + root MOC explain the system in one screen
- [ ] Initial commit done

Close by reminding the governance rule: **capture always to `00-inbox/`, never classify
at capture time; sweep the inbox once per cycle (weekly), moving each note to its unit and
linking it to the MOC.**

## Relationship to other skills

- `/process-standardization` and `/sop-authoring` write their outputs into
  `_procedimientos/` when a business brain exists — same pipeline, shared home.
- The business-model-toolkit produces the `./business/` folder this skill migrates;
  run it first for a venture that has no business model yet.
