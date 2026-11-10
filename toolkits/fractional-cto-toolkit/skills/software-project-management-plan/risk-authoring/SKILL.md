---
name: risk-authoring
disable-model-invocation: true
description: >
  Authors ISO/IEC/IEEE 16085:2021 project risk deliverables — the risk management
  plan (§8.1.2) and risk treatment plan(s) (§8.2.2) — from the catalog templates
  iso-16085-risk-management-plan and iso-16085-risk-treatment-plan. Use when the
  user asks for a plan de gestión de riesgos de proyecto, risk management plan for
  a software/systems engagement, risk treatment plan, companion 16085 for an SPMP,
  or to remediate thin SPMP §8.3 vs 16085. NOT for org-wide ISO 31000 GRC (use
  /iso31000). Alias: /project-plan/risk-authoring.
---

# Software Project Management Plan — Risk Authoring (ISO/IEC/IEEE 16085)

Read and follow
[`references/software-project-management-plan/protocol-risk-authoring.md`](../../../references/software-project-management-plan/protocol-risk-authoring.md)
(protocol SSOT). Load
[`catalog.md`](../../../references/software-project-management-plan/catalog.md)
and consume:

- `templates/iso-16085-risk-management-plan.md` (§8.1)
- `templates/iso-16085-risk-treatment-plan.md` (§8.2, when treatment is required)

## Defaults

- Normative: ISO/IEC/IEEE 16085:2021 (satisfies 16326 Clause 7 risk-management plan content via §8.1.2)
- Always emit or refresh the RM plan when this skill runs for an engagement project
- Emit treatment plans only for risks at/above the RM plan threshold
- Link from/to the SPMP §8.3; cite 16085 in SPMP §2 when adopting the companion
- Client-facing artifacts: no skill/`generated_by`/dogfood attribution in body or frontmatter

## Alias

`project-plan/risk-authoring` is a thin discoverability alias of this skill.
