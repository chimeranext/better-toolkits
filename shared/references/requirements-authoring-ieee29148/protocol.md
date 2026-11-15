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

1. **SRS ID order** on requirement tables (numeric ascending within each
   prefix per table; duplicates fail; series contiguous from `001` with **no
   gaps**):
   `shared/references/requirements-authoring-ieee29148/scripts/srs-id-order-lint.py --markdown FILE.md`.
   Optional `--cross-section` compares verification / characteristics tables to
   the §3 ID set.
2. **EARS** on requirement statements (SPMP-series ID lines and behavioral
   acceptance criteria): `shared/references/ears/scripts/ears-lint.py --markdown FILE.md`.
   English uses `shall` templates; Spanish uses `debe` templates. See
   [`../ears/README.md`](../ears/README.md).
3. **BDD** on Given/When/Then (or Dado/Cuando/Entonces) scenarios in
   `verification.md` (and any embedded scenario blocks):
   `shared/references/bdd/scripts/bdd-lint.py --markdown FILE.md`. See
   [`../bdd/README.md`](../bdd/README.md).
4. **Controlled prose** on the full customer-facing file: English →
   `shared/references/asd-ste100/scripts/asd-ste100-lint.py`; Spanish →
   `shared/references/esp-ts/scripts/esp-ts-lint.py` (ESP-TS). Do not
   cross-run languages.

Do not skip `srs-id-order-lint.py`, EARS (and BDD when scenarios exist) and rely
only on STE/ESP-TS — ID order and structure first, then voice.

## Output directory

**Default (always try first):** under the engagement vault / business-brain
layout, write only these three client files:

```
projects/<slug>/requirements/
    ├── software-requirements-specification.md
    ├── requirements-checklist.md
    └── verification.md
```

Each of those three files opens with a **Glossary** section before the
introduction (heading `Glossary` in English, `Glosario` in Spanish). The
table defines the status words that file uses. Every output glossary table
shall include these words, in this order. Documented is priority 1 and is
always the first row: the case is written as a requirement because it was
extracted first from the SPMP. The words are documented, covered, analyzed,
incomplete, waived, deferred, functional, and non-functional. A Spanish file
writes them as documentado, cubierto, analizado, incompleto, excluido,
diferido, funcional, and no funcional. The English table is:

| Word | Meaning in that file |
| --- | --- |
| Documented | The case is written as a requirement because it was extracted first from the SPMP. Priority 1. Always the first row. |
| Covered | The particular annex case is already included in the requirement taken from the SPMP. No further ID is added. |
| Analyzed | That requirement was compared with the annex case. |
| Incomplete | The requirement taken from the SPMP does not include that particular case. That case is the next ID. The annex is not copied row by row. |
| Waived | The SPMP places it outside this baseline. It returns only by change order. The annex records it as `DW-`. It is not a §3 requirement. |
| Deferred | It stays in the product problem. A fact or a number is still open, so this version cannot verify it. When that input exists, it is appended as the next ID of its prefix. The annex records the wait as `DW-`. |
| Functional | The requirement states what the system does: a task, an input, an output, or an interaction, including a prohibition. If the row is absent, that task does not exist. |
| Non-functional | The requirement states how the system operates: a quality attribute or a constraint (performance, security, reliability, availability, usability, compatibility, scalability, maintainability). If the row is absent, the task can still exist and fail that quality. |

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

1. **SPMP (ISO/IEC/IEEE 16326)** — engagement Software Project Management Plan
   authored under `/software-project-management-plan-authoring-ieee16326`
   (16326:2019 §7). If missing → **STOP** and run that skill (or point at the
   existing vault SPMP) before continuing.
2. **Risk management plan (ISO/IEC/IEEE 16085)** — the engagement companion from
   the same pipeline (linked from the SPMP), authored under
   `/software-risks-authoring-ieee16085`. Load the risk **profile** (e.g.
   R-01…) for constraints, priorities, and what must **not** become an invented
   SLA. If missing → **STOP** and point the user to that skill / existing vault
   path before continuing.
3. **Risk treatment plans (16085 §8.2)** — every written treatment the risk plan
   (or SPMP) links for risks over the treatment threshold (same 16085 skill /
   `iso-16085-risk-treatment-plan`). Load them for product obligations that
   become EARS (mitigations that bind observable system behavior). If the risk
   plan says a treatment exists and the file is missing → **STOP** and obtain it
   before writing §3. Do **not** invent treatment behavior from the profile row
   alone when a treatment document is required.

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

Resolve the risk plan from the SPMP reference, then the vault `plans/` companion
for the same engagement (16085 / risk-management naming the engagement uses),
then a path the user names. Resolve **treatment** paths from links in that risk
plan / SPMP (and any path the user names). Cite SPMP, risk plan, and each loaded
treatment in §1.4.

Also load, when present (never instead of SPMP + risk plan + required
treatments):

- Prior `projects/<slug>/requirements/software-requirements-specification.md`
  only if it already uses the SPMP-derived ID series (clean).
- Inventory / workshop drafts the user attaches (MoSCoW tables, prior-system
  reviews) — **after** the clean baseline Markdown exists.

**Clean baseline before secondary sources (hard rule):**

1. **Generate** a **new clean** `software-requirements-specification.md` from
   the SPMP first, then the risk **profile**, then each **treatment** that binds
   product behavior. §3 IDs are **only** the prefixes the SPMP defines for
   that engagement (`{PREFIX}-001`, contiguous). Do not copy prefixes from
   another engagement or from this protocol. Path: `projects/<slug>/requirements/` in the engagement
   vault. Do not skip this emit by “confirming” a dirty file.
2. **Delete** any dirty draft that adopted secondary-source prefixes as
   governing IDs. Do not keep it as a parallel SRS.
3. **Only after** that clean Markdown exists, **re-read** secondary sources
   (workshop MoSCoW, **docx** inventory, prior-system review, …) and consider
   **append-only** candidates. Secondary prefixes are **never** governing
   (discard as product IDs; optional trace only). Secondary phase labels are
   **not** SPMP stages.
4. **Do not** run Jidoka drift enumeration against a dirty secondary-ID SRS.
   Conflict HITL compares an annex claim with what the **clean SPMP + risk
   baseline** affirms, after the clean file exists. Silence is not a conflict.

**ID precedence (hard rule):**

1. Derive the SRS ID scheme and baseline requirements **from the SPMP first**
   (whatever prefixes the SPMP names, each contiguous from `001`). Do not
   reuse another engagement's prefixes as the default. Risk-profile constraints and **treatment-plan** obligations that
   bind product behavior enter that same series when they are requirements.
   Profile rows without a required treatment do not invent §3 behavior beyond
   what the SPMP already states.
2. **Only after** that baseline Markdown exists, **append / concatenate**
   annex cases the SPMP does not contradict. A **conflict** (defined below)
   waits for Jidoka HITL (a)/(b)/(c) before it enters §3. Assignment rule (mandatory):
   - For **each** SPMP prefix independently, take
     `last = max(existing numbers in that prefix)` in the clean SRS.
   - The first accepted append for that prefix is `{PREFIX}-{last+1}`; each
     further accepted append increments by one (`last+2`, `last+3`, …).
   - **Never** insert into a hole, renumber the baseline to make room, or
     reuse / translate the secondary source’s own IDs as governing product IDs.
   - After append, the series for that prefix remains contiguous `001..N`
     (`srs-id-order-lint.py` PASS).
3. **Never** adopt the secondary source’s ID prefixes or row order as the SRS
   scheme. Secondary IDs are irrelevant as product IDs (trace in annex / HITL
   item only).
4. Within each SRS table, sort by the SPMP-derived ID numerically within prefix.

**Annex is first-additive (hard rule):**

When the SPMP does not affirm the contrary, the annex is first-additive. Silence, a missing number, or “the plan does not fix this” is not a discrepancy. Append that annex case as the next `{PREFIX}-nnn`.

A discrepancy is only a **conflict**: the SPMP affirms one thing and the annex affirms the contrary. Compare the annex sentence with what the SPMP affirms. Do not compare it with the absence of a sentence.

Do not copy each annex requirement into §3 as its own ID when that case is already included.

Take each requirement already extracted from the SPMP. Compare it with each annex sentence about the same behavior.

1. Read that requirement and its acceptance criterion.
2. Read the particular case in the annex sentence.
3. If that case is already included in the requirement, do not add an ID.
4. If that case is not included, and the SPMP does not affirm the contrary, the requirement is **incomplete** for that case, or the case is a new additive row. Append one next `{PREFIX}-nnn`.
5. If the SPMP affirms the contrary, the case is a **conflict**. Do not append it. Stop under the conflict rule below.
6. Name the result with the Glossary. Documented is priority 1: the case is written as a requirement because it was extracted first from the SPMP. Analyzed: the requirement was compared with the annex case. Covered: that case is already included; do not add an ID. Incomplete: that case is not included; append one next `{PREFIX}-nnn`.
7. Secondary **should** and **could** do not become **shall** until the human accepts that priority for this baseline. **Won't** does not enter §3.

**Conflict rule — Jidoka HITL (hard stop):**

**Prerequisite:** clean SPMP-series Markdown already exists (see above). Then,
when an annex **claim** (not its ID scheme) conflicts with what the SPMP, the risk
plan, or a loaded **treatment** affirms, **STOP**. Do **not** stop because the
plan is silent. Do **not** write a separate
divergences file, do **not** auto-resolve, do **not** summarize, do **not**
batch into themes, do **not** drip “one question at a time”, and do **not** use
AskQuestion / questionnaire UI. In **one** chat reply, **enumerate every
conflict as its own numbered item** (full list, complete text; secondary IDs
optional as trace only) and, on **each** item, state the same three dispositions
so the human can answer per ID (e.g. `D-012: b`):

- **(a)** Correct the SPMP (and risk plan / treatments if needed) and request a
  new version that absorbs the external source.
- **(b)** Keep the EARS derived from the SPMP; discard the conflicting claim
  from the secondary source for this SRS version.
- **(c)** Keep both only if they are not contradictory and do not create an
  incongruent state or race condition — state how they coexist.

Do not append a conflict to §3 until the human has answered for that item. An additive case does not wait.

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

- **Class and justification.** Every §3 requirement table uses these columns, in this order: ID, requirement statement, class, justification, acceptance criterion. The requirement statement stays the first cell after the ID. Class is **Functional** or **Non-functional** (Spanish file: **Funcional** or **No funcional**). Functional: the row states what the system does, including a prohibition. If that row is absent, the task does not exist. Non-functional: the row states how the system operates, a quality attribute or a constraint (performance, security, reliability, availability, usability, compatibility, scalability, maintainability). If that row is absent, the task can still exist and fail that quality. The justification applies that test to the row and does not repeat the class word: the class column already states it. The section heading does not decide the class: a quality-of-service row is Functional when it states a task.
- Verifiable requirements in **EARS** form: Spanish
  `El sistema debe <observable behavior>` (or Cuando/Mientras/Si/Donde …);
  English `The system shall …` (or When/While/If/Where …). Run mechanical
  gates in order on the filled file: `srs-id-order-lint.py` (table ID order
  within each prefix), then `ears-lint.py` on requirement lines, then the CFM
  prose linter (STE/ESP-TS). Plus an acceptance criterion per requirement.
- No implementation jargon in §3.2 (functional). Technical decisions go to §3.5
  (Design and Implementation) and to OpenSpec `design.md`.
- Each important functional requirement carries an ID (`{PREFIX}-001`, prefix
  taken from the SPMP, not from this protocol) for the verification table.
  Keep that scheme stable; sort IDs numerically within each prefix in every
  table (`srs-id-order-lint.py` PASS); map draft inventory IDs in an annex
  when they differ.
- **Do not drop** a known candidate that is outside this baseline or blocked on
  an open fact. Record it in the SRS annex (non-governing prefix `DW-`, never
  a §3 prefix): **WAIVED** when the SPMP places it outside the baseline
  (re-entry = change order); **DEFERRED** when it stays in the product problem
  but this version cannot verify it yet (re-entry = append `last+1` on the
  governing prefix once the fact or number exists). Platform and hosting
  choices stay constraints, not DW rows and not §3 requirements.
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
7. **Adopting secondary-source ID schemes or draft row order as the SRS scheme** — SPMP-derived IDs first; secondary sources (docx, MoSCoW, …) only append after `max(ID)` **per prefix** (`last+1`, contiguous); leave secondary IDs as trace only.
8. **Treating plan silence as a conflict** — or auto-resolving a real conflict, or dumping conflicts into a side file without HITL. Forbidden. If the SPMP does not affirm the contrary, append the annex case. Enumerate only conflicts, one-by-one; ask (a)/(b)/(c) per item; wait.
9. **Dirty SRS with secondary ID schemes** — emitting or keeping a parallel SRS whose governing IDs are docx/workshop prefixes. Forbidden. Delete it; clean SPMP-series Markdown first.
10. **Skipping the engagement risk management plan (16085)** — SPMP without its risk companion. Forbidden.
11. **Skipping required risk treatment plans** — using only the profile table when the risk plan / SPMP links a written treatment. Forbidden.
12. **Skipping `srs-id-order-lint.py`** — unsorted, duplicate, or gapped IDs within a prefix in any requirement table. Forbidden. Delete/retire by renumbering the series; do not leave holes.
13. **Dropping out-of-baseline or open-fact candidates** — omitting them from the SRS because they are not §3 yet. Forbidden. Record **WAIVED** or **DEFERRED** (`DW-`) in the annex.
14. **Copying the annex row by row into §3** — or adding an ID when the particular case is already included in the SPMP requirement. Forbidden. Append only the case that requirement does not include.

## Final checklist

- [ ] SPMP, engagement risk management plan (16085), and required risk **treatment** plans loaded and cited (§1.4 + revision history)
- [ ] Clean SPMP-series Markdown exists at `projects/<slug>/requirements/` before any secondary append; dirty secondary-ID drafts deleted
- [ ] Annex cases the SPMP does not contradict were appended. Only conflicts (the SPMP affirms one thing and the annex affirms the contrary) were enumerated one-by-one; human answered (a)/(b)/(c) per conflict before that conflict enters §3
- [ ] Baseline IDs and order come from the SPMP-derived series; secondary prefixes never governing; tables sorted by SPMP-derived ID within prefix (`srs-id-order-lint.py` PASS)
- [ ] Each §3 requirement table has columns ID, requirement, class, justification, acceptance. Class is Functional or Non-functional. The justification applies that test to the row. The requirement statement stays the first cell after the ID.
- [ ] Each generated file opens with a Glossary table. Documented is priority 1 and the first row (the case is written as a requirement because it was extracted first from the SPMP). Then covered, analyzed, incomplete, waived, deferred, functional, and non-functional (Spanish file: documentado, cubierto, analizado, incompleto, excluido, diferido, funcional, no funcional). Covered = the annex case is already included in the SPMP requirement; analyzed = that comparison was made; incomplete = the case is not included and is the next ID; waived = outside this baseline, return by change order, recorded as `DW-`; deferred = still in the product problem, fact or number still open, recorded as `DW-`
- [ ] An annex case already included in an SPMP requirement did not get a new ID; a case that is not included was appended as the next `{PREFIX}-nnn` only
- [ ] Specification written from the bare template (830 structure); version per engagement (0.1 only on first emit)
- [ ] Requirements with an ID, EARS form (`ears-lint.py` PASS), obligation word in the engagement language, and an acceptance criterion (29148)
- [ ] Filled client file passes gates in order: `srs-id-order-lint.py` → EARS → BDD (when scenarios exist) → language-routed STE/ESP-TS
- [ ] Out-of-baseline items are **WAIVED** and open-fact items are **DEFERRED** in the SRS annex (`DW-`); neither list is dropped
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
