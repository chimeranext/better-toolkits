---
name: mentoring-session
version: 1.0.0
description: >
  Diseño guiado de sesión de mentoría (desarrollo integral, larga duración, foco
  en carrera/identidad/red). Use when user asks for "mentoring session", "sesión
  de mentoría", "mentor session", "/new-mentoring-session", o relación de mentoring
  ya establecida.
---

# Sesión de Mentoría

Mentoring per Irby (2018): desarrollo integral del individuo, relación de larga
duración (posiblemente vitalicia), seleccionada por el mentee. Foco en crecimiento,
identidad profesional, red.

## Mensaje de apertura

> "Vamos a diseñar una **Sesión de Mentoría (Mentoring Session)**.
>
> Mentoring es desarrollo integral, larga duración, foco en carrera/identidad/red.
> No tiene KPI time-bound — es proceso, no resultado puntual (Irby, 2018).
>
> Si necesitás performance específica con KPI, `/new-coaching-session`.
> Si es ayuda con topic puntual, `/new-tutoring-session`."

## Flujo

### Paso 1 — Learner Profile

Despachar `learner-profile-builder` (o usar el provisto).

### Paso 2 — Mentoring-Specific Setup

1. "¿Cuál es el **goal de largo plazo** de esta relación? (ej. 'Transición de mid
   a senior en 18 meses con red profesional visible'). Mentoring goals son meses/
   años, no semanas."

2. "¿Cuál es el **historial de la relación**? (cómo se conocieron, cadencia
   típica). Esto contextualiza el tono de la sesión."

3. "¿Cuál es el **focus area** de este período? (ej. 'Identidad profesional',
   'Construcción de red', 'Transición de carrera', 'Leadership development')"

### Paso 3 — Objetivos de la Sesión (suaves)

> "¿Qué querés tocar en ESTA sesión? Mentoring objectives son menos rígidos que
> coaching — pueden ser exploratorios. 2-3 items."

### Paso 4 — Pre-work

> "Mentoring pre-work suele ser reflexivo, no técnico. Ejemplos:
>
> - 'Traer 1 artefacto del que estés orgulloso de los últimos 3 meses'
> - 'Pensar en 2 personas a las que admirás en este path'
>
> ¿Cuál pre-work pedís?"

### Paso 5 — Agenda

Mentoring sessions suelen ser más largas (60-90 min) y menos estructuradas.

Template adaptable:

```
0-15   | Check-in personal y contexto vital
15-50  | Revisión de progreso/artefactos + feedback abierto
50-75  | Brainstorm de oportunidades / siguientes pasos
75-90  | Commitments suaves + cuándo nos volvemos a ver
```

### Paso 6 — Reflection Questions

> "Mentoring reflection es introspectiva. Ejemplos:
>
> - '¿Qué parte de tu trabajo reciente querés que se vea más afuera del equipo?'
> - '¿A quién admirás que haya hecho esta transición? ¿Qué hizo diferente?'
>
> Dame 1-2 específicas a este learner."

### Paso 7 — Follow-up

> "Mentoring follow-up es soft. Próxima fecha (típico mensual o trimestral) + 1-2
> propuestas (no obligaciones)."

### Paso 8 — Generar JSON + MD

Construir siguiendo `session-plan-mentoring.profile.json`. Profile incluye
`mentoring_specific.long_term_goal`, `relationship_history`, `focus_area`.

Validar con ajv. Escribir.

## Recursos

- `${CLAUDE_PLUGIN_ROOT}/assets/schemas/profiles/session-plan-mentoring.profile.json`
- `${CLAUDE_PLUGIN_ROOT}/assets/templates/session-plan-mentoring.md.tmpl`
- `${CLAUDE_PLUGIN_ROOT}/examples/session-plan-mentoring-example.json`
