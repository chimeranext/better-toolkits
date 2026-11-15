# Skill `requirements-authoring-ieee29148` — protocol SSOT

---

# Software requirements specification

Turn a client's product idea into a versioned `software-requirements-specification.md`.
The engagement parallelogram cites **ISO/IEC/IEEE 29148:2018**. Section structure
inherits the ISO/IEEE 830 template. That file is the **source of truth** for
requirements. Do not emit a separate `PRD.md`: the product vision already lives in
the Product Overview section. OpenSpec, issues, branches, and PRs are **derived
from that specification**.

## Critical order (requirements first)

```
1. software-requirements-specification.md → written FIRST (29148; structure inherited from 830), author = Product Owner
2. OpenSpec        → DERIVED from the specification (implementation guides for the issues)
3. Linear issue    → Bilingual Layer brief (HUMAN LAYER + AGENT LAYER)
4. /opsx-explore   → think, do NOT implement
5. /opsx-propose   → planning only (drafts the plan; human reviews)
6. human review    → human-in-the-loop (HITL) — DO NOT skip
7. /opsx-apply     → code in the satellite repos (working repos)
8. linked PR       → new PR linked to the Linear issue
9. /opsx-sync      → optional; reconciles specs
10. /opsx-archive  → ONLY with a human yes
```

> **Forbidden anti-pattern:** derive the specification from OpenSpec, or treat
> OpenSpec as the requirements source of truth. OpenSpec describes *how* the
> system implements the requirements that `software-requirements-specification.md`
> already fixed.

## Normative references

| Standard | Role |
| --- | --- |
| **ISO/IEC/IEEE 29148:2018** | Current standard — *Systems and software engineering — Life cycle processes — Requirements engineering*. Replaces the SRS portion of IEEE 830. |
| **ISO/IEEE 830:1998** | Historical standard — *IEEE Recommended Practice for Software Requirements Specifications*. Withdrawn, still cited; its section structure is the base of the template. |

In practice: write with the **bare template structure** (inherited from 830) and
meet the **29148 requirement-quality criteria** (unique, atomic, verifiable,
traceable, unambiguous, free of implementation jargon). In the file the client
reads, the obligation words are in the engagement working language. In Spanish:
**debe / no debe / debería / puede**. The bare template keeps shall / should / may.

## Template structure

Blank template: [`srs-bare-template.md`](srs-bare-template.md) — vendored from
[`jam01/SRS-Template`](https://github.com/jam01/SRS-Template) (`srs-template-bare.md`,
CC0 1.0, credited in the file header).

Sections (canonical order):

1. **Introduction** — document purpose, product scope, glossary, references, overview.
2. **Product Overview** — perspective, functions, constraints, user characteristics,
   assumptions and dependencies, apportioning.
3. **Requirements** — external interfaces, functional, quality of service (performance,
   security, reliability, availability, observability), compliance, design and
   implementation, AI/ML.
4. **Verification** — Requirement × Verification method × Evidence.
5. **Appendixes**.

Each file generated for the client says that the engineering standards are the
index of 36 norms
([`engineering-standards/index.md`](../engineering-standards/index.md))
and that the client does not operate them yet. Implementing them is part of the
value the consulting team adds in the deliverable. Do not write that the client
already adopts them, and do not present them as the norms of an internal codename.
The file does not list four code practices as if they were that index. This
specification does not rewrite the index.

## Language and voice

The bare template stays in English. The file the client reads is in the engagement
working language (default **Spanish**). The header uses `Preparado por` and
`Versión`. The first version of that file is **0.1**, and that number does not
continue the project-plan version series. A technical term with no plain equivalent
is glossed in the same section.

Voice follows
[CFM — Customer-facing management docs](../engineering-standards/customer-facing-management-docs.md):
descriptive prose, named subjects, no procedure imperatives. The file carries no
skill names, no `generated_by`, no dogfood, and no toolkit `ssot:` paths. A table
cell does not use `[[path|alias]]`.

**Mechanical gates (filled client SRS / checklist / verification), in order:**

1. **EARS** on requirement statements (FR/NFR lines and behavioral acceptance
   criteria): `shared/references/ears/scripts/ears-lint.py --markdown FILE.md`.
   English uses `shall` templates; Spanish uses `debe` templates. See
   [`../ears/README.md`](../ears/README.md).
2. **BDD** on Given/When/Then (or Dado/Cuando/Entonces) scenarios in
   `verification.md` (and any embedded scenario blocks):
   `shared/references/bdd/scripts/bdd-lint.py --markdown FILE.md`. See
   [`../bdd/README.md`](../bdd/README.md).
3. **Controlled prose** on the full customer-facing file: English →
   `shared/references/asd-ste100/scripts/asd-ste100-lint.py`; Spanish →
   `shared/references/esp-ts/scripts/esp-ts-lint.py` (ESP-TS). Do not
   cross-run languages.

Do not skip EARS (and BDD when scenarios exist) and rely only on STE/ESP-TS —
structure first, then voice.

## Output directory

**Default (always try first):** under the engagement vault / business-brain
layout, write only these three client files:

```
projects/<slug>/requirements/
    ├── software-requirements-specification.md
    ├── requirements-checklist.md
    └── verification.md
```

If the vault also keeps an SPMP plan, it stays outside that folder (for
example `plans/<YYYY-MM-DD>-plan-proyecto-<slug>.md`). Cross-links are
Obsidian wikilinks `[[projects/<slug>/requirements/...]]`. Inside a table
cell, do not add an alias: `[[path]]` only, because `|` splits the cell.

**Fallback:** when there is no brain vault, or `projects/<slug>/requirements/`
cannot be created there, write the same three files under the customer's
existing document tree — typically
`Documentos/<cliente-o-engagement>/projects/<slug>/requirements/` (or next to
the source draft the user pointed at). Do not invent a `fractional-cto/`
directory. Ask only when neither the default nor a clear `Documentos/*` folder
is available.

This skill emits **documents only**. It does not create or edit Linear or
GitHub Issues. Tracker write-back belongs to later workflow steps after human
approval of the specification.

**PDF export (optional):** after Markdown gates pass, resolve the Pandoc
template with
[`../pandoc-export/resolve-template.sh`](../pandoc-export/resolve-template.sh)
(**vault `_templates/export/*.tex` first** — the engagement brand pack when
present; then seeded/`better.tex` / setup cache / shared SSOT). Standalone CLI;
no Obsidian required. See [`../pandoc-export/README.md`](../pandoc-export/README.md).

## Skill flow

### Step 0 — Required inputs (hard stop)

**Mandatory inputs before any SRS write or rewrite:**

1. **SPMP** — engagement Software Project Management Plan.
2. **Risk management plan (ISO/IEC/IEEE 16085)** — the engagement companion from
   the same pipeline (linked from the SPMP). Load it for constraints, treatments
   that become product obligations, and what must **not** become an invented
   SLA. If missing → **STOP** and point the user to the risk-plan authoring
   skill / existing vault path before continuing.

**Shared pack rule:** this protocol and its skill stay **brand-neutral**. Do not
embed client names, product codenames, or engagement-specific filenames here.

Resolve the SPMP, in order:

1. Vault plan: `plans/<YYYY-MM-DD>-plan-proyecto-<slug>.md` (or the dated SPMP
   path the engagement already uses).
2. Path the user names explicitly.
3. If none exists → **STOP**. Tell the user to run
   `/software-project-management-plan-authoring-ieee16326` (or point at the
   existing SPMP) before this skill continues. Do not invent scope, phases, or
   out-of-scope lists without the SPMP.

Resolve the risk plan from the SPMP reference, then the vault
`plans/` companion for the same engagement (16085 / risk-management naming the
engagement uses), then a path the user names. Cite both SPMP and risk plan in
§1.4.

Also load, when present (never instead of SPMP + risk plan):

- Prior `projects/<slug>/requirements/software-requirements-specification.md`
  only if it already uses the SPMP-derived ID series (clean).
- Inventory / workshop drafts the user attaches (MoSCoW tables, prior-system
  reviews) — **after** the clean baseline Markdown exists.

**Clean baseline before secondary sources (hard rule):**

1. **Generate** a **new clean** `software-requirements-specification.md` from
   the SPMP first, then fold in risk-plan constraints/treatments that bind
   product behavior. §3 IDs are **only** the SPMP-derived series (`EI-` /
   `FR-` / `QS-` …). Path: `projects/<slug>/requirements/` in the engagement
   vault. Do not skip this emit by “confirming” a dirty file.
2. **Delete** any dirty draft that adopted secondary-source prefixes as
   governing IDs. Do not keep it as a parallel SRS.
3. **Only after** that clean Markdown exists, **re-read** secondary sources and
   consider **append-only** candidates (next free SPMP-series ID). Secondary
   prefixes are **never** governing (discard as product IDs; optional trace
   only). Secondary phase labels are **not** SPMP stages.
4. **Do not** run Jidoka drift enumeration against a dirty secondary-ID SRS.
   Drift HITL compares **secondary claims** to the **clean SPMP + risk
   baseline**, after the clean file exists.

**ID precedence (hard rule):**

1. Derive the SRS ID scheme and baseline requirements **from the SPMP first**
   (engagement series such as `EI-` / `FR-` / `QS-`, starting at the next free
   number in that series). Risk-plan treatments that bind product behavior enter
   that same series when they are requirements.
2. **Only after** that baseline Markdown exists, **append / concatenate** new
   EARS from secondary sources (workshop MoSCoW, docx inventory, prior-system
   review). New rows take the **next** ID in the SPMP-derived series.
3. **Never** adopt the secondary source’s ID prefixes or row order as the SRS
   scheme. Secondary IDs are irrelevant as product IDs.
4. Within each SRS table, sort by the SPMP-derived ID numerically within prefix.

**Conflict / drift rule — Jidoka HITL (hard stop):**

**Prerequisite:** clean SPMP-series Markdown already exists (see above). Then,
when a secondary **claim** (not its ID scheme) diverges from the SPMP, the risk
plan, or an SPMP-derived EARS, **STOP**. Do **not** write a separate
divergences file, do **not** auto-resolve, do **not** summarize, do **not**
batch into themes, do **not** drip “one question at a time”, and do **not** use
AskQuestion / questionnaire UI. In **one** chat reply, **enumerate every
divergence as its own numbered item** (full list, complete text; secondary IDs
optional as trace only) and, on **each** item, state the same three dispositions
so the human can answer per ID (e.g. `D-012: b`):

- **(a)** Correct the SPMP (and risk plan if needed) and request a new version
  that absorbs the external source.
- **(b)** Keep the EARS derived from the SPMP; discard the conflicting claim
  from the secondary source for this SRS version.
- **(c)** Keep both only if they are not contradictory and do not create an
  incongruent state or race condition — state how they coexist.

Do not continue appending to §3.2 until the human has answered for the open
items.

### Step 1 — Get the product context

From the **SPMP first**, extract product purpose, baseline stages, in/out of
scope, users/roles, assumptions, constraints, deliverables, and acceptance.
Then enrich with assessment / business-model / project folder context and any
draft inventory. If the SPMP is loaded but product facts are still thin, ask
the user (Step 1b) — do not skip the SPMP.

### Step 1b — Gather input (when it is missing)

Confirm with the user only what the SPMP and vault still leave open:

- Product name and version (if not already in the SPMP)
- Purpose and boundaries deltas vs the SPMP (change-order material)
- Users, roles, and access gaps
- External integrations (APIs, prior systems)
- Compliance constraints (regulatory, accounting, privacy)
- Deadline / MVP milestones vs SPMP stages

### Step 2 — Write software-requirements-specification.md

Use `srs-bare-template.md` as the section shell. Fill each section per 29148.
Cite the SPMP in §1.4 References and in the revision history (version, path).

- Verifiable requirements in **EARS** form: Spanish
  `El sistema debe <observable behavior>` (or Cuando/Mientras/Si/Donde …);
  English `The system shall …` (or When/While/If/Where …). Run
  `ears-lint.py` on those lines before the CFM prose linter. Plus an
  acceptance criterion per requirement.
- No implementation jargon in §3.2 (functional). Technical decisions go to §3.5
  (Design and Implementation) and to OpenSpec `design.md`.
- Each important functional requirement carries an ID (for example `FR-001`) for
  the verification table. Keep a stable ID scheme for the engagement; map draft
  inventory IDs in an annex when they differ.
- Explicit quality-of-service requirements: performance, security, reliability,
  availability, observability — only when the SPMP or stakeholder input gives a
  measurable criterion (do not invent SLAs the SPMP does not support).

### Step 3 — 29148 checklist and verification table

Generate `requirements-checklist.md`: for each requirement mark unique / atomic /
verifiable / traceable / unambiguous / implementation-free. Fill `verification.md`
with the method (test, user test, review, demo) and the artifact per requirement.

### Step 4 — Derive OpenSpec from the specification (not the reverse)

Once a human has approved the specification, derive:

- `openspec/config.yaml` — stack context.
- `openspec/specs/{domain}/spec.md` — requirements **derived** from the
  specification in OpenSpec form: each requirement with `MUST/SHALL/SHOULD`
  (RFC 2119) plus GIVEN/WHEN/THEN scenarios. Those words stay in the derived
  OpenSpec. They do not go back into the file the client reads.
- For each change: `openspec/changes/{slug}/{proposal,design,tasks}.md` —
  `proposal.md` cites the specification as the upstream source.

See [`openspec-quick-guide.md`](openspec-quick-guide.md) for the full `/opsx-*` flow.

### Step 5 — Linear issues (Bilingual Layer) and workflow

With the specification approved, create the Linear issue from
**bilingual-issue-brief.md** (see
`make-no-mistakes-toolkit/templates/bilingual-issue-brief.md`), assigning
Type/Size/Strategy from the tracker taxonomy. Then:

```
/opsx-explore (optional, think) → /opsx-propose → human review → /opsx-apply
→ new PR linked to the issue → /opsx-sync (optional) → /opsx-archive (human yes only)
```

### Step 6 — Hand off

Executive summary (Minto): one sentence for the decision, then the arguments and
the evidence. Paths of the files. Next action (step 5).

## Anti-patterns

1. **Writing the SRS from a workshop draft alone** — skipping the SPMP. Forbidden.
2. **OpenSpec as the requirements source of truth** — the specification governs; OpenSpec is derived.
3. **Vague or unverifiable requirements** ("the system must be fast" violates 29148).
4. **Skipping the checklist** — each requirement passes unique / atomic / verifiable / traceable.
5. **Writing the specification already as implementation** — §3.2 is functional, not design; the "how" goes to §3.5 and to OpenSpec `design.md`.
6. **Generating the specification after the issues** — the order is software-requirements-specification.md → OpenSpec → issues → PRs.
7. **Adopting secondary-source ID schemes or draft row order as the SRS scheme** — SPMP-derived IDs first; secondary sources only append with the next free ID and leave their own IDs as trace.
8. **Auto-resolving SPMP ↔ secondary-source divergences** — or dumping them into a side file without HITL. Forbidden. Enumerate one-by-one; ask (a)/(b)/(c) per item; wait.
9. **Dirty SRS with secondary ID schemes** — emitting or keeping a parallel SRS whose governing IDs are docx/workshop prefixes. Forbidden. Delete it; clean SPMP-series Markdown first.
10. **Skipping the engagement risk management plan (16085)** — SPMP without its risk companion. Forbidden.

## Final checklist

- [ ] SPMP and engagement risk management plan (16085) loaded and cited (§1.4 + revision history)
- [ ] Clean SPMP-series Markdown exists at `projects/<slug>/requirements/` before any secondary append; dirty secondary-ID drafts deleted
- [ ] Every secondary **claim** ↔ clean baseline divergence enumerated one-by-one after the clean file exists; human answered (a)/(b)/(c) per item before append
- [ ] Baseline IDs and order come from the SPMP-derived series; secondary prefixes never governing; tables sorted by SPMP-derived ID within prefix
- [ ] Specification written from the bare template (830 structure); version per engagement (0.1 only on first emit)
- [ ] Requirements with an ID, EARS form (`ears-lint.py` PASS), obligation word in the engagement language, and an acceptance criterion (29148)
- [ ] Filled client file passes language-routed STE/ESP-TS after EARS (and BDD when scenarios exist)
- [ ] Checklist unique / atomic / verifiable / traceable / unambiguous / implementation-free
- [ ] Verification table Requirement × Method × Evidence filled
- [ ] Human review of the specification before deriving OpenSpec
- [ ] OpenSpec derived from the specification (the proposal cites the specification as the upstream source)
- [ ] Tracker issues only after human approval of the specification (this skill does not open them)
- [ ] The client file says the engineering standards index is implemented as value of the deliverable, and that the client does not operate them yet

## Related

| Resource | Topic |
| --- | --- |
| [`srs-bare-template.md`](srs-bare-template.md) | Blank template (vendored from jam01, CC0) |
| [`openspec-quick-guide.md`](openspec-quick-guide.md) | `/opsx-*` flow and specification → OpenSpec derivation |
| [`../engineering-standards/index.md`](../engineering-standards/index.md) | Engineering standards index (36 norms) |
| [`../engineering-standards/customer-facing-management-docs.md`](../engineering-standards/customer-facing-management-docs.md) | Voice of the file the client reads |
| `jam01/SRS-Template` | Upstream template repo (CC0) |
| `Fission-AI/OpenSpec` | OpenSpec framework (docs/getting-started.md) |
