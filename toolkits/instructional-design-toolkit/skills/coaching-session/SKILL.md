---
name: coaching-session
version: 1.0.0
description: >
  Diseño guiado de sesión de coaching (performance-focused, time-bound, con KPI y
  withdrawal trigger). Salta detección — el usuario ya declaró tipo.
  Use when user asks for "coaching session", "sesión de coaching",
  "/new-coaching-session", o cuando hay performance plan + KPI explícito.
---

# Sesión de Coaching

Coaching per Irby (2018): performance-focused, time-bound, con KPI específico y
trigger explícito de withdrawal del coach cuando el goal se alcanza.

## Regla de idioma

Español. Términos técnicos en formato *"español (English)"*.

## Output

`docs/instructional-design/session-plans/{slug}/session-plan.json` (profile:
`session-plan-coaching`) + `session-plan.md` (template
`session-plan-coaching.md.tmpl`).

## Mensaje de apertura (obligatorio)

Antes del flow, mostrar:

> "Vamos a diseñar una **Sesión de Coaching (Coaching Session)**.
>
> Coaching es performance-focused: tiene un KPI específico, es time-bound, y el coach
> se retira cuando el goal se alcanza (Irby, 2018).
>
> Si lo que necesitás es desarrollo integral o relación larga sin KPI, querés
> `/new-mentoring-session`. Si es ayuda con un topic puntual, `/new-tutoring-session`."

## Flujo

### Paso 1 — Learner Profile

Despachar `${CLAUDE_PLUGIN_ROOT}/agents/learner-profile-builder.md` (si no fue
provisto por el dispatcher 1-on-1-session-planner).

### Paso 2 — Coaching-Specific Setup

Preguntar (una a la vez):

1. "¿Cuál es el **KPI objetivo** medible de este engagement de coaching?
   (ej. 'Lead time de PR review: de 3d a 1d', 'NPS del equipo de 30 a 50')"

2. "¿Esta es la sesión **N de M**? (ej. '3 of 6'). Coaching debe tener fin claro."

3. "¿Cuál es el **withdrawal trigger** explícito? (la condición bajo la cual
   considerás que el coach se retira; ej. 'KPI sostenido en 1d durante 2 ciclos')"

### Paso 3 — Objetivos de la Sesión

> "¿Cuáles son los 2-3 objetivos específicos para ESTA sesión (no del engagement
> completo)? Cada uno debe ser accionable, no platitudinal."

### Paso 4 — Pre-work

> "¿Qué necesita traer/hacer el learner antes de la sesión? (datos a medir,
> hipótesis a presentar, ejercicio a intentar). Coaching pre-work efectivo es
> data-grounded."

### Paso 5 — Agenda Time-Boxed

> "¿Cuántos minutos dura la sesión? (típico 60-90 min para coaching)"

Proponer agenda template adaptable:

```
0-10  | Check-in + revisión de métricas
10-30 | Identificación de bloqueadores (Five Whys, Root Cause)
30-50 | Diseño del intervention (qué cambia, cuándo, dónde)
50-60 | Commitments específicos + próxima sesión
```

Pedir al usuario que ajuste tiempos y notas por bloque.

### Paso 6 — Reflection Questions

> "Dame 1-2 reflection questions específicas a este KPI/learner. Ejemplos para
> coaching:
>
> - '¿Qué tenés que dejar de hacer para que esto funcione?'
> - '¿A quién vas a rendirle cuentas de este cambio semana a semana?'
>
> Evitá genéricas: NO '¿qué aprendiste?'."

### Paso 7 — Follow-up

> "Próxima sesión date + homework concreto (mínimo 2-3 items con deadline implícito):"

### Paso 8 — Generar JSON + MD

Construir `session-plan.json` siguiendo `session-plan-coaching.profile.json` (extiende
core con `coaching_specific.target_kpi`, `session_n_of_m`, `withdrawal_trigger`).

Validar con `ajv` si está disponible. Escribir JSON + MD.

Presentar resumen + sugerir `/session-plan-audit {slug}` para validar consistencia.

## Recursos

- `${CLAUDE_PLUGIN_ROOT}/agents/learner-profile-builder.md`
- `${CLAUDE_PLUGIN_ROOT}/assets/skill-references/coach-mentor-tutor-distinction.md`
- `${CLAUDE_PLUGIN_ROOT}/assets/schemas/profiles/session-plan-coaching.profile.json`
- `${CLAUDE_PLUGIN_ROOT}/assets/templates/session-plan-coaching.md.tmpl`
- `${CLAUDE_PLUGIN_ROOT}/examples/session-plan-coaching-example.json` (referencia)
