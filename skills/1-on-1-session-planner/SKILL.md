---
name: 1-on-1-session-planner
version: 1.0.0
description: >
  Diálogo guiado para diseñar un plan de sesión 1-on-1 con auto-detect del tipo
  (coaching/mentoring/tutoring). Use when user asks for "session plan", "1-on-1",
  "one-on-one", "coaching session", "mentoring session", "tutoring session",
  "sesión 1-a-1", "plan de sesión", "sesión de coaching", "sesión de mentoría",
  "sesión de tutoría", "/new-1-on-1-session-plan".
---

# Diseño de Sesión 1-on-1 (Auto-Detect)

Diálogo guiado con detección automática del tipo de sesión usando el agent
`session-type-detector`. Si la detección es ambigua, pregunta al usuario.

## Regla de idioma

Español. Términos técnicos en formato *"español (English)"* primera vez.

## Output

`docs/instructional-design/session-plans/{slug}/session-plan.json` +
`session-plan.md`

## Flujo

### Paso 1 — Learner Profile

Despachar `${CLAUDE_PLUGIN_ROOT}/agents/learner-profile-builder.md`.
Confirmar persona con el usuario antes de seguir.

### Paso 2 — Session Type Detection

Pedir al usuario una descripción breve del propósito de la sesión:

> "En 1-2 oraciones, ¿qué querés lograr en esta sesión 1-on-1?"

Despachar `${CLAUDE_PLUGIN_ROOT}/agents/session-type-detector.md` con la descripción
+ learner_id.

Evaluar resultado:

- **DETECTED + CONFIDENCE high**: Confirmar con el usuario:

  > "Detecté que esta sería una sesión de **{type}**.
  >
  > Razón: {justification}
  >
  > ¿Confirmar?
  > 1. Sí, es {type}
  > 2. No, en realidad es {alternative}
  > 3. Cancelar y elegir manualmente"

- **DETECTED + CONFIDENCE low** O **AMBIGUOUS**: Mostrar tabla comparativa Irby
  (ver `${CLAUDE_PLUGIN_ROOT}/assets/skill-references/coach-mentor-tutor-distinction.md`)
  y pedir al usuario que elija:

  > "El contexto es ambiguo. Elegí el tipo basándote en esta tabla:
  >
  > [tabla comparativa coaching/mentoring/tutoring]
  >
  > 1. Coaching (performance + KPI + time-bound)
  > 2. Mentoring (desarrollo + larga duración + sin KPI)
  > 3. Tutoring (topic específico + corto plazo)"

**PUERTA**: confirmar tipo de sesión.

### Paso 3 — Despachar a skill type-specific

Una vez confirmado el tipo, **delegate al skill correspondiente** pasando los
datos ya recolectados (learner_profile + session_type) para que continúe sin
re-preguntar:

- coaching → `${CLAUDE_PLUGIN_ROOT}/skills/coaching-session/SKILL.md` (saltar al Paso 3 de ese skill)
- mentoring → `${CLAUDE_PLUGIN_ROOT}/skills/mentoring-session/SKILL.md`
- tutoring → `${CLAUDE_PLUGIN_ROOT}/skills/tutoring-session/SKILL.md`

## Recursos

- `${CLAUDE_PLUGIN_ROOT}/agents/learner-profile-builder.md`
- `${CLAUDE_PLUGIN_ROOT}/agents/session-type-detector.md`
- `${CLAUDE_PLUGIN_ROOT}/assets/skill-references/coach-mentor-tutor-distinction.md`
- `${CLAUDE_PLUGIN_ROOT}/assets/schemas/session-plan-core.schema.json`
