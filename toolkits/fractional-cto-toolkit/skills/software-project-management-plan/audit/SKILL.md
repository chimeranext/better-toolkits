---
name: audit
disable-model-invocation: true
description: >
  Gap-audits a Software Project Management Plan against ISO/IEC/IEEE 16326:2019 §7,
  scores linked risk content against ISO/IEC/IEEE 16085:2021 §8.1/§8.2, and optionally
  overlays PMBOK 8 domains. Use when the user asks to audit a project plan, SPMP,
  plan de gestión de proyecto, or check ISO 16326 / 16085 conformance. Outputs a gap
  matrix only — never commits confidential client plans. Alias: /project-plan/audit.
---

# Software Project Management Plan — Audit

Read and follow
[`references/software-project-management-plan/protocol-audit.md`](../../../references/software-project-management-plan/protocol-audit.md)
(protocol SSOT). Load
[`catalog.md`](../../../references/software-project-management-plan/catalog.md)
and
[`audit-rubric.md`](../../../references/software-project-management-plan/audit-rubric.md)
before scoring.

## Defaults

- Score the SPMP body against ISO/IEC/IEEE 16326:2019 §7
- Score risk section / linked RM plan against ISO/IEC/IEEE 16085:2021 §8.1.2 (treatment plans against §8.2.2 when claimed)
- Optional PMBOK 8 domain overlay from `pmbok8-crosswalk.md`
- If the engagement claims an org ISO 31000 program, score it via `/iso31000` — not as a substitute for 16085 on a software project plan

## Alias

`project-plan/audit` is a thin discoverability alias of this skill.
