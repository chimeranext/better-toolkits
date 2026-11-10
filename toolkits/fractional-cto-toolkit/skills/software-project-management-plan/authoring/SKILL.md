---
name: authoring
disable-model-invocation: true
description: >
  Authors a Software Project Management Plan (SPMP) from ISO/IEC/IEEE 16326:2019 §7,
  with ISO/IEC/IEEE 16085:2021 as the default risk companion and an optional PMBOK 8
  domain overlay. Use when the user asks for a project management plan, plan de
  gestión de proyecto, SPMP, project plan for a software/systems engagement, or
  "plan de proyecto". NOT for SOPs/playbooks/runbooks (use /document-this), NOT for
  PRD/SRS (use /requirements-authoring), NOT for org-wide ISO 31000 GRC registers
  alone (use /iso31000). Alias: /project-plan/authoring.
---

# Software Project Management Plan — Authoring

Read and follow
[`references/software-project-management-plan/protocol-authoring.md`](../../../references/software-project-management-plan/protocol-authoring.md)
(protocol SSOT). Load
[`catalog.md`](../../../references/software-project-management-plan/catalog.md)
first and let the user choose the template id (default: `iso-16326-spmp`).

## Defaults

- SPMP outline: ISO/IEC/IEEE 16326:2019 §7
- Risk companion: ISO/IEC/IEEE 16085:2021 §8.1 (risk management plan) + §8.2 when treatment is needed
- Optional overlay: PMBOK 8 domains (Governance, Scope, Schedule, Finance, Stakeholders, Resources, Risk)
- Atomic PMBOK risk notes stay at `_templates/riesgo.md` (do not replace with 16085/31000)
- Org-wide risk analysis (ISO 31000) is a separate GRC choice — `/iso31000`

## Alias

`project-plan/authoring` is a thin discoverability alias of this skill.
