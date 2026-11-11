---
name: authoring
disable-model-invocation: true
description: >
  Authors a Software Project Management Plan (SPMP) from ISO/IEC/IEEE 16326:2019 §7,
  delegating ISO/IEC/IEEE 16085:2021 risk companions to /software-risks-authoring-16085,
  with an optional PMBOK 8 domain overlay. Use when the user asks for a project
  management plan, plan de gestión de proyecto, SPMP, project plan for a
  software/systems engagement, or "plan de proyecto". For standalone 16085 risk
  management / treatment plans use /software-risks-authoring-16085. NOT for
  SOPs/playbooks/runbooks (use /document-this), NOT for PRD/SRS (use
  /requirements-authoring), NOT for org-wide ISO 31000 GRC alone (use /iso31000).
  Alias: /project-plan/authoring.
---

# Software Project Management Plan — Authoring

Read and follow
[`references/software-project-management-plan/protocol-authoring.md`](../../../references/software-project-management-plan/protocol-authoring.md)
(protocol SSOT). Load
[`catalog.md`](../../../references/software-project-management-plan/catalog.md)
first and let the user choose the template id (default: `iso-16326-spmp`).

## Defaults

- SPMP outline: ISO/IEC/IEEE 16326:2019 §7
- Risk companion: delegate to `/software-risks-authoring-16085`
  (consumes `iso-16085-risk-management-plan` + `iso-16085-risk-treatment-plan`)
- Optional overlay: PMBOK 8 domains (Governance, Scope, Schedule, Finance, Stakeholders, Resources, Risk)
- Atomic PMBOK risk notes stay at `_templates/riesgo.md` (do not replace with 16085/31000)
- Org-wide risk analysis (ISO 31000) is a separate GRC choice — `/iso31000`
- Customer-facing SPMP: no skill/`generated_by`/dogfood attribution; descriptive
  executive voice per
  `shared/references/engineering-standards/customer-facing-management-docs.md` (not STE
  procedure imperatives)

## Alias

`project-plan/authoring` is a thin discoverability alias of this skill.
