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
   section: N/A + reason (EVP convention / 16326-16085 wording).
4. **Delegate the 16085 risk companions** to
   `/software-project-management-plan/risk-authoring` (protocol
   `protocol-risk-authoring.md`). That skill **consumes**
   `iso-16085-risk-management-plan` + `iso-16085-risk-treatment-plan`. Do not
   improvise those outlines here — invoke or follow that protocol so the
   templates have a single writer skill.
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
- 16085 RM/treatment Markdown is owned by `risk-authoring` (same catalog paths).
- **Client-facing output:** no skill names, `generated_by`, dogfood, or toolkit
  `ssot:` paths in the emitted body/frontmatter the client reads.
- No copyrighted standard PDF text is copied into the artifact.
- Language follows the engagement working language; frontmatter keys stay stable.
