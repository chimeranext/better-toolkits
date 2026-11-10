---
name: takeover-assessment
description: >
  Evaluacion de riesgo para takeover de proyectos de software. Usa este skill
  cuando el usuario mencione "evaluacion de riesgo", "assessment", "evaluar proyecto",
  "risk assessment", "matriz de amenazas", "threat matrix", "que tan riesgoso es",
  "analisis de riesgo", "evaluacion tecnica", "evaluate project", "project evaluation",
  "assessment wizard", o cualquier situacion donde un CTO necesita evaluar el riesgo
  de asumir un proyecto existente antes de comprometerse.
---

# takeover-assessment

English ASD-STE100 skill body. Protocol SSOT:
[`references/takeover-assessment/protocol.md`](../../references/takeover-assessment/protocol.md).

## Purpose

Assess takeover risk for an existing software project before the CTO commits.
Produce assessment outputs under `./fractional-cto/assessment/`.

## Hard rules

- Follow the protocol. Do not invent threat rows outside the protocol matrix.
- This skill does not emit the handover pack. That is `/project-takeover`.
- This skill does not emit SPMP or 16085 plans. That is `/contract-psa` Milestone 1.

## Next step

After assessment, run `/project-takeover` for the operational pack.
