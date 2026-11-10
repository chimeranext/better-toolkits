# Skill `software-project-management-plan/risk-authoring` — protocol SSOT

## Purpose

Produce the **ISO/IEC/IEEE 16085:2021** project risk deliverables that accompany a
16326 SPMP:

1. Risk management plan (§8.1.2) — template `iso-16085-risk-management-plan`
2. Risk treatment plan(s) (§8.2.2) — template `iso-16085-risk-treatment-plan`
   when a risk (or risk class) crosses the treatment threshold

This skill **consumes** those catalog templates. It is the writer for project
lifecycle risk docs. Org-wide ISO 31000 registers stay under `/iso31000`.

## When to use

- User asks for a plan de gestión de riesgos / risk management plan for a
  software or systems **project** (16085, not 31000).
- User asks for a plan de tratamiento / risk treatment plan for one or more
  unacceptable risks.
- SPMP authoring needs the default risk companion emitted or refreshed.
- Remediating an SPMP audit finding that §8.3 is thin vs 16085 strategy/profile.

## When not to use

- Enterprise / CRO risk program → `/iso31000`
- Atomic vault note only → brain `_templates/riesgo.md` (`pmbok-risk-note`)
- Full SPMP body without focusing on risk → `/software-project-management-plan/authoring`
  (that skill **delegates** companion emission here)

## Method

1. **Load** `catalog.md`. Confirm risk template ids (defaults above).
2. **Locate the SPMP** (path from user, or create stub link if authoring both).
   Cite ISO/IEC/IEEE 16085 in the SPMP §2 when the companion is adopted.
3. **Emit the RM plan** from `templates/iso-16085-risk-management-plan.md`:
   purpose/policies, strategy (criteria, thresholds, measures, improvement),
   context, roles, process (ID → analysis → priority → treatment → monitor →
   profile → communication), resources schedule. Empty required sections: N/A +
   reason.
4. **Decide treatment:** any risk at/above the stated threshold gets a §8.2
   treatment plan (one plan may cover risks that share characteristics).
5. **Emit treatment plan(s)** from `templates/iso-16085-risk-treatment-plan.md`.
6. **Link both ways:** SPMP §8.3 → RM plan; RM plan → SPMP + treatment paths;
   treatment → RM plan.
7. **Language** = engagement working language. Do not copy copyrighted standard
   prose — clause citations only.

## Artifact

| Artifact | Typical path |
| --- | --- |
| Risk management plan | `plans/<YYYY-MM-DD>-gestion-riesgos-<slug>-16085.md` |
| Treatment plan(s) | `plans/<YYYY-MM-DD>-tratamiento-riesgos-<slug>-<topic>.md` |

## Contract

- Templates are read from this toolkit SSOT (or an export with banner).
- **Client-facing output:** do **not** put skill names, `generated_by`,
  “Generado por…”, dogfood, or toolkit `ssot:` paths in the emitted Markdown
  body or frontmatter the client reads. Keep `standard`, dates, links, status.
- Catalog choice is explicit before writing.
- Does not replace `/iso31000` and does not claim 31000 alone satisfies 16326.
