# Skill `software-project-management-plan/authoring` — protocol SSOT

## Purpose

Produce a Software Project Management Plan (SPMP) the engagement can approve and
operate. Default normative skeleton: ISO/IEC/IEEE 16326:2019. Default risk
companion: ISO/IEC/IEEE 16085:2021.

## When to use

- A systems/software project needs a management plan (SPMP / plan de gestión).
- A brain or engagement folder needs `plans/<date>-plan-proyecto-<slug>.md`.
- The user asks to “fill the ISO project plan” or align to 16326.

## Method

1. **Load the catalog** (`catalog.md`). Confirm template id (default
   `iso-16326-spmp`) and risk companion (default
   `iso-16085-risk-management-plan`).
2. **Gather inputs.** Charter facts, SPEC/PRD links (`/requirements-authoring`
   outputs when present), constraints, org interfaces, acceptance criteria.
   Do not invent client facts — mark assumptions.
3. **Emit the SPMP** from `templates/iso-16326-spmp.md`. Every empty required
   section: N/A + reason (engagement convention / 16326-16085 wording). Write
   the filled body in **customer-facing voice** — see
   [CFM — Customer-facing management docs](../../../../shared/references/engineering-standards/customer-facing-management-docs.md). Do not emit STE procedure
   imperatives (“Direct…”, “Keep…”, “Measure…”) in the client plan.
4. **Delegate the 16085 risk companions** to `/software-risks-authoring-16085`
   (protocol `references/software-risks-authoring-16085/protocol.md`). That
   skill **consumes** `iso-16085-risk-management-plan` +
   `iso-16085-risk-treatment-plan`. Do not improvise those outlines here —
   invoke or follow that protocol so the templates have a single writer skill.
   Risk plans use the **same** customer-facing voice rules.
5. **Optional PMBOK 8 overlay** — fill gaps called out by `pmbok8-crosswalk.md`
   without restructuring the SPMP into PMBOK knowledge areas.
6. **Atomic notes** — if the vault uses `_templates/riesgo.md`, create/link
   notes; do not replace the 16085 RM plan with those notes alone.
7. **Org GRC** — if the client also wants an ISO 31000 enterprise register,
   invoke `/iso31000` separately.

## Artifact

- Primary: `plans/<YYYY-MM-DD>-plan-proyecto-<slug>.md` (or user path)
- Risk companion: inline §risk or linked `…-gestion-riesgos-16085.md`
- Optional treatment plans per unacceptable risk / risk class

## Contract

- Catalog choice is explicit before writing.
- Templates are read from this toolkit SSOT (or an export with banner), never
  invented ad hoc in `business-brain-template`.
- 16085 RM/treatment Markdown is owned by `software-risks-authoring-16085`
  (same catalog template paths).
- **Customer-facing output:** no skill names, `generated_by`, dogfood, or toolkit
  `ssot:` paths in the emitted body/frontmatter the client reads.
- **Customer-facing voice:** filled SPMP / 16085 plans follow
  [CFM — Customer-facing management docs](../../../../shared/references/engineering-standards/customer-facing-management-docs.md) (descriptive executive
  prose; no bare imperatives; table-safe links; plain-language glosses). Do not
  name unrelated customer brands or people from other engagements in toolkit
  docs or examples.
- No copyrighted standard PDF text is copied into the artifact.
- Toolkit SSOT templates under `templates/` are **English**. When you emit a
  client plan, write the filled body in the engagement working language.
  Frontmatter keys stay stable (`status: draft` in SSOT. Map to local labels
  only in the client copy if the vault requires it).
- All `templates/*.md` (bare and fill) must pass
  `make-no-mistakes-toolkit/references/explain/scripts/ste-lint.py` (ASD-STE100
  **structural** rules) before merge. That lint does **not** authorize STE
  procedure-imperative voice in the **filled client** SPMP or risk plans.
