---
name: session-plan-audit
version: 1.0.0
description: >
  Auditoría de plan de sesión 1-on-1 contra framework Irby (2018) coach/mentor/tutor
  + agenda time-boxing + reflection quality. Use when user asks to "audit my
  session plan", "review session plan", "auditar sesión", "/session-plan-audit".
---

# Auditoría de Plan de Sesión 1-on-1

Valida session plan existente contra distinción Irby (2018), consistency con tipo
declarado, agenda time-boxing, calidad de reflection questions, accionabilidad
del follow-up.

## Inputs

- `session-slug` (required): nombre del directorio en `docs/instructional-design/session-plans/`.

## Flujo

### Paso 1 — Load + validate JSON

1. Cargar `docs/instructional-design/session-plans/{slug}/session-plan.json`.
2. Identificar `meta.type` (coaching / mentoring / tutoring).
3. Validar contra profile correspondiente:
   ```bash
   ajv validate -s assets/schemas/profiles/session-plan-{type}.profile.json \
                -r assets/schemas/session-plan-core.schema.json \
                -d session-plan.json --spec=draft2020 -c ajv-formats
   ```

### Paso 2 — Framework checks

#### Check 1 — Type consistency

- Si `meta.type=coaching`:
  - `coaching_specific.target_kpi` presente y específico (no "mejorar performance").
  - `coaching_specific.withdrawal_trigger` presente y measurable.
  - WARN si falta `session_n_of_m` (coaching debe ser time-bound).

- Si `meta.type=mentoring`:
  - `mentoring_specific.long_term_goal` presente, escala mensual o anual.
  - WARN si tiene KPI con número (ej. "subir lead time a 1d") — eso es coaching.

- Si `meta.type=tutoring`:
  - `tutoring_specific.specific_topic` presente, **preciso** (rechazar topics
    abstractos como "state management"; aceptar "Riverpod autoDispose vs keepAlive").
  - `tutoring_specific.success_criterion` measurable.

#### Check 2 — Agenda time-boxing

- `sum(agenda[].time_block_duration) ≤ meta.duration_minutes`.
- WARN si los bloques no cubren toda la duración (gaps).
- WARN si un solo bloque ocupa >50% del time (sub-optimal pacing).

#### Check 3 — Reflection questions calidad

- Rechazar genéricas (regex):
  - `^¿qué aprendiste\??$`
  - `^¿cómo te fue\??$`
  - `^¿algún comentario\??$`
  - `^¿feedback\??$`
- Aceptar preguntas que referencian el contexto específico del session
  (KPI, topic, learner, decision pendiente).

#### Check 4 — Follow-up accionable

- Coaching: `follow_up.next_session_date` presente Y `homework` no vacío.
- Mentoring: `follow_up.homework` puede ser optional propositions.
- Tutoring: `follow_up.homework` debe contener al menos 1 item específico al
  `success_criterion`.

#### Check 5 — Pre-work alineado

- Pre-work items deben ser ejecutables ANTES de la sesión sin asistencia del
  coach/mentor/tutor.
- Coaching pre-work debe ser data-grounded (medir métrica, traer evidencia).
- Mentoring pre-work suele ser reflexivo (artefacto, lista mental).
- Tutoring pre-work suele ser diagnostic (intentar el ejercicio, marcar confusión).

### Paso 3 — Compose report

```markdown
# Session Plan Audit: {session id}
**Type**: {coaching|mentoring|tutoring}
**Date**: {audit date}

## Summary
- Type consistency: PASS|WARN|FAIL
- Agenda time-boxing: PASS|WARN|FAIL
- Reflection quality: PASS|WARN|FAIL
- Follow-up actionable: PASS|WARN|FAIL
- Pre-work alignment: PASS|WARN|FAIL

## Top 3 Fixes
1. ...
```

### Paso 4 — Present + optional fixes

Igual al `course-audit`: presentar report + gate antes de proponer fixes.

## Recursos

- `${CLAUDE_PLUGIN_ROOT}/assets/skill-references/coach-mentor-tutor-distinction.md`
- `${CLAUDE_PLUGIN_ROOT}/assets/schemas/profiles/session-plan-{coaching,mentoring,tutoring}.profile.json`
