---
name: course-retro
version: 1.0.0
description: >
  Ingiere xAPI + feedback CSV de una cohorte y produce retro report Kirkpatrick
  L1-L4 con iteration candidates priorizados (impact × ease). Use when user asks
  to "course retrospective", "retro", "post-mortem cohort", "Kirkpatrick analysis",
  "analizar cohort", "retro del curso", "/course-retro".
---

# Retro de Cohort

Análisis post-cohort: ingesta xAPI statements + feedback forms, mapea a
Kirkpatrick L1-L4, prioriza qué iterar.

## Inputs

- `course-slug` (required).

## Flujo

### Paso 1 — Load course + cohort number

1. Cargar `course.json`.
2. Detectar siguiente N para `retros/retro-cohort-{N}.md` (incrementar desde el último).

### Paso 2 — Ingest xAPI

> "¿Tenés un CSV con xAPI statements de la cohort? (ver formato esperado en
> `${CLAUDE_PLUGIN_ROOT}/references/adapters/xapi/csv.md`).
>
> Path al archivo (o 'skip' si no tenés):"

Si provisto: leer y parsear según `adapters/xapi/csv.md`.
Si skip: WARN "L2 Learning no podrá ser medido sin xAPI data" y continuar.

### Paso 3 — Ingest feedback (Tally/Typeform)

> "¿Tenés CSVs de Tally o Typeform por módulo? (uno por módulo, formato
> documentado en `${CLAUDE_PLUGIN_ROOT}/references/adapters/feedback/`).
>
> Lista de paths (uno por línea, o 'skip'):"

Si provistos: parsear según `adapters/feedback/{tally,typeform}-csv.md`.
Si skip: WARN "L1 Reaction no podrá ser medido sin feedback data" y continuar.

### Paso 4 — L3 + L4 manual prompts (opcional)

> "Kirkpatrick L3 (Behavior 30 días después) y L4 (Results / capstone tracking)
> requieren input manual.
>
> L3: ¿hiciste follow-up survey 30 días post-curso? Si sí, dame los datos clave
> (ej. '5/8 siguen usando Riverpod en proyectos personales').
>
> L4: ¿cuántos alumnos completaron el capstone? ¿Con qué calidad?"

### Paso 5 — Mapear a Kirkpatrick L1-L4

Por cada level, agregar la data:

- **L1 Reaction**: por módulo — avg rating, top 3 feedback recurrentes (free text
  cluster), confusion points.
- **L2 Learning**: por AU — pass rate (passed / launched), score distribution,
  time-on-task vs estimated.
- **L3 Behavior** (si data manual provista): summary qualitativo.
- **L4 Results** (si data manual provista): capstone completion rate + quality
  highlights/lowlights.

### Paso 6 — Priorize iteration candidates

Para cada signal anómalo (rating < 3.5, pass rate < 60%, time 2x estimated, etc.),
generar un iteration candidate con:
- Descripción del problema
- Impact estimate (cuántos alumnos afectados)
- Ease estimate (1-5: trivial → architectural change)
- Score = impact × ease

Ordenar por score descendente. Top 5 al usuario.

### Paso 7 — Generate report

`docs/instructional-design/courses/{slug}/retros/retro-cohort-{N}.md`:

```markdown
# Retro: {course title}, Cohort {N}
**Date**: {today}
**Cohort size**: {N learners}
**Course version at cohort start**: {version}

## L1 Reaction
| Módulo | Rating avg | N | Top feedback |
|---|---|---|---|

## L2 Learning
| AU | Pass rate | Score distribution | Time vs estimate |
|---|---|---|---|

## L3 Behavior (manual)
[summary]

## L4 Results (manual)
[summary]

## Top 5 Iteration Candidates (impact × ease)
1. ...
```

**PUERTA** (sola): confirmar antes de escribir el report.

## Recursos

- `${CLAUDE_PLUGIN_ROOT}/references/adapters/xapi/csv.md`
- `${CLAUDE_PLUGIN_ROOT}/references/adapters/feedback/tally-csv.md`
- `${CLAUDE_PLUGIN_ROOT}/references/adapters/feedback/typeform-csv.md`
- `${CLAUDE_PLUGIN_ROOT}/assets/skill-references/kirkpatrick-evaluation.md`
- `${CLAUDE_PLUGIN_ROOT}/references/kirkpatrick-feedback-tools.md`
