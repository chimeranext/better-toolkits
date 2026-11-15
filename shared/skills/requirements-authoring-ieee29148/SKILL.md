---
name: requirements-authoring-ieee29148
description: >
  Write software-requirements-specification.md per ISO/IEC/IEEE 29148:2018,
  using the bare template vendored from jam01/SRS-Template (CC0). The product
  overview is a section of that file. Do not emit a separate PRD.md.
  Use this skill when the user mentions "PRD", "SRS", "product requirements", "software
  requirements specification", "especificación de requisitos", "requisitos de producto",
  "requisitos de software", "29148", "IEEE 830", "write the requirements", "requirement
  spec", "write the spec for this feature", "convertir la idea en requisitos", or any
  situation where a fractional CTO needs to formalize a client's product idea into
  verifiable, testable requirements BEFORE any code or OpenSpec is written.
  This is the front door of the requirements file: the specification first, OpenSpec
  derived from it, then Linear issues with bilingual briefs. The /opsx-* command
  order stays explore, propose, human review, apply, PR, optional sync, archive
  only with a human yes.
  NOT for authoring operational SOPs (that is /sop-authoring) nor contracts.
---

# Requirements Authoring (shared)

Turns a fuzzy product idea into `software-requirements-specification.md`
(ISO/IEC/IEEE 29148:2018). The section structure comes from the jam01 template.
That file is the source of truth. Do not emit a separate PRD.

```
software-requirements-specification.md (fuente de verdad, autor: Product Owner)
   │  se genera DERIVADO de la especificación  (NO al revés)
   ▼
OpenSpec specs + changes  (guías de implementación de los issues)
   │
   ▼
Issue Linear (formato Bilingual Layer)  →  /opsx-explore → /opsx-propose
   → revisión humana → /opsx-apply → PR vinculado → /opsx-sync → /opsx-archive
```

> OpenSpec is not the requirements source of truth. The specification is written
> first. OpenSpec is derived from it.

Shared home (deduped from `fractional-cto-toolkit`, same as engineering-standards):
read and follow [`references/requirements-authoring-ieee29148/protocol.md`](../../references/requirements-authoring-ieee29148/protocol.md)
(protocol SSOT), the vendored
[`references/requirements-authoring-ieee29148/srs-bare-template.md`](../../references/requirements-authoring-ieee29148/srs-bare-template.md),
and
[`references/requirements-authoring-ieee29148/openspec-quick-guide.md`](../../references/requirements-authoring-ieee29148/openspec-quick-guide.md).
Frontmatter triggers unchanged.

## Defaults

- **Mandatory inputs** — (1) **SPMP (ISO/IEC/IEEE 16326)** via `/software-project-management-plan-authoring-ieee16326`; (2) engagement **risk management plan** (ISO/IEC/IEEE 16085) via `/software-risks-authoring-ieee16085`, same pipeline / linked from the SPMP; (3) every linked **risk treatment plan** (16085 §8.2) that binds product behavior. Paths come from the vault / user — **never** hard-code client or product names in this skill. If SPMP missing → STOP → that 16326 skill. If risk plan or a required treatment is missing → STOP until the vault companion exists. Cite SPMP, risk plan, and treatments in §1.4. Protocol Step 0 is SSOT.
- **Clean baseline first** — **generate a new** `software-requirements-specification.md` from the SPMP, then risk profile, then treatments, using only the ID prefixes that SPMP defines (`{PREFIX}-001`). Do not invent or copy another engagement's prefixes. At `projects/<slug>/requirements/`. **Do not** read secondary inventories for append until that clean file exists. **Delete** dirty drafts that used secondary prefixes as governing IDs. Secondary prefixes are not the SRS scheme.
- **ID precedence** — SPMP-derived series first. After clean baseline + HITL answers, secondary sources (incl. docx) only **append / concatenate**: for each SPMP prefix, next ID = `max(existing)+1`, then `+2`, … — contiguous, no holes, no reuse of secondary IDs. Never adopt secondary prefixes or row order.
- **Annex is first-additive** — when the SPMP does not affirm the contrary, append the annex case as the next `{PREFIX}-nnn`. Silence or a missing number is not a discrepancy. A discrepancy is only a conflict when the SPMP affirms one thing and the annex affirms the contrary. Do not copy the annex row by row. If the case is already included, it is covered: do not add an ID. Documented is priority 1: the case is written as a requirement because it was extracted first from the SPMP.
- **Glossary first** — every generated file (`software-requirements-specification.md`, `requirements-checklist.md`, `verification.md`) opens with Glossary / Glosario before the introduction. Documented is priority 1 and always the first glossary row. Then covered, analyzed, incomplete, waived, deferred, functional, and non-functional. A Spanish file writes them as documentado, cubierto, analizado, incompleto, excluido, diferido, funcional, and no funcional. Waived (excluido): the SPMP places it outside this baseline; it returns only by change order. Deferred (diferido): it stays in the product problem while a fact or a number is still open. Both are recorded as `DW-` and are not §3 requirements. Functional: what the system does, including a prohibition. Non-functional: how the system operates, a quality attribute or a constraint.
- **Class and justification** — every §3 requirement table uses ID, requirement, class, justification, acceptance, in that order. The requirement stays the first cell after the ID. Class is Functional or Non-functional (Spanish: Funcional or No funcional). The justification applies that test to the row and does not repeat the class word. The section heading does not decide the class.
- **Jidoka HITL** — only **after** the clean baseline exists, and only on a **conflict** when the SPMP, the risk plan, or a treatment affirms one thing and the annex affirms the contrary. Plan silence is first-additive and does not open HITL. In **one** reply, list **every conflict** as its own numbered item (full text; no summary; no themes; no side file; no AskQuestion; no paso-a-paso; no drift dump against a dirty SRS). On each item:
  - **(a)** Correct the SPMP (and risk plan / treatments if needed) and request a new version from the external source?
  - **(b)** Keep the SPMP-derived EARS and discard the conflicting secondary claim for this SRS version?
  - **(c)** Keep both only if not contradictory and with no incongruent state / race — explain coexistence?
  Human answers per ID (e.g. `D-012: b`). Do not append that conflict until the answer lands. An additive case does not wait.
- **Brand-neutral pack** — shared protocol/skill must not name clients, products, engagement-specific filenames, or an engagement's requirement-ID prefixes. Examples use `{PREFIX}-001` only.
- **Documents only** — write `software-requirements-specification.md`, `requirements-checklist.md`, and `verification.md`. Do not create or edit Linear / GitHub Issues from this skill.
- **Output path:** default `projects/<slug>/requirements/` in the engagement vault; fallback `Documentos/<…>/projects/<slug>/requirements/` (or next to the user draft). See protocol.
- Sort SPMP-derived requirement IDs numerically within each prefix in every table — gate: `shared/references/requirements-authoring-ieee29148/scripts/srs-id-order-lint.py --markdown FILE.md`.
- **Do not drop** candidates outside this baseline or blocked on an open fact. Annex register, prefix `DW-` (not governing): **WAIVED** (SPMP out of baseline; re-entry = change order) or **DEFERRED** (still in the problem; re-entry = next ID once the fact exists).
- Customer-facing specification, checklist, and verification: no skill/`generated_by`/dogfood attribution; descriptive executive voice per `shared/references/engineering-standards/customer-facing-management-docs.md` (not STE/ESP-TS procedure imperatives). Gates in order: `srs-id-order-lint.py` → EARS → BDD (when scenarios exist) → English `asd-ste100-lint.py` / Spanish `esp-ts-lint.py`. Optional PDF: resolve via `shared/references/pandoc-export/resolve-template.sh` (vault brand `_templates/export/*.tex` first; `better.tex` only as fallback).
- The filled file says the engineering standards index is implemented as added value of the deliverable. It does not say the client already operates them, and it does not attribute them to an internal team codename. It does not list four code practices as that index.
- Filled body in the engagement working language. Default Spanish: Preparado por, Versión, debe / no debe / debería / puede. The bare template stays English.
