---
name: software-risks-authoring-16085
disable-model-invocation: true
description: >
  Authors ISO/IEC/IEEE 16085:2021 software/systems project risk deliverables —
  the risk management plan (§8.1.2) and risk treatment plan(s) (§8.2.2) — from
  catalog templates iso-16085-risk-management-plan and iso-16085-risk-treatment-plan.
  Use for plan de gestión de riesgos de proyecto, 16085 companion to an SPMP, risk
  treatment plans, or PSA Hito 1 Discovery risk artifacts. NOT for org-wide ISO 31000
  GRC (use /iso31000). NOT for the operational risk/ family (audit, IR, DR, resilience).
---

# Software Risks Authoring — ISO/IEC/IEEE 16085

Read and follow
[`references/software-risks-authoring-16085/protocol.md`](../../references/software-risks-authoring-16085/protocol.md)
(protocol SSOT). Templates live in the SPMP catalog:

[`references/software-project-management-plan/catalog.md`](../../references/software-project-management-plan/catalog.md)

Consume:

- `templates/iso-16085-risk-management-plan.md` (§8.1)
- `templates/iso-16085-risk-treatment-plan.md` (§8.2, per Eisenhower / threshold rules)

## Defaults

- Normative: ISO/IEC/IEEE 16085:2021 (satisfies 16326 Clause 7 risk-management plan content via §8.1.2)
- Always emit or refresh the RM plan when this skill runs for an engagement project
- Treatments: **required** for critical (urgent ∧ important); **offer** for only-urgent or only-important; **acceptable** (no §8.2) when neither
- Link from/to the SPMP §8.3; cite 16085 in SPMP §2 when adopting the companion
- Client-facing artifacts: no skill/`generated_by`/dogfood attribution in body or frontmatter
