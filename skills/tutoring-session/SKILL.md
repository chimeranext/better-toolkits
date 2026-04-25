---
name: tutoring-session
version: 1.0.0
description: >
  Diseño guiado de sesión de tutoría (topic específico, problema-focused, corto
  plazo, success criterion concreto). Use when user asks for "tutoring session",
  "sesión de tutoría", "tutor session", "ayuda con [topic]", "/new-tutoring-session",
  o ayuda puntual con un concepto.
---

# Sesión de Tutoría

Tutoring per Irby (2018): topic-específico, problema-focused, corto plazo. Mejora
medible en un skill o concepto puntual.

## Mensaje de apertura

> "Vamos a diseñar una **Sesión de Tutoría (Tutoring Session)**.
>
> Tutoring es topic-específico, problema-focused, corto plazo (Irby, 2018). El
> objetivo es resolver una confusión o gap puntual con success criterion concreto.
>
> Si necesitás KPI/performance, `/new-coaching-session`.
> Si es desarrollo integral de carrera, `/new-mentoring-session`."

## Flujo

### Paso 1 — Learner Profile + Diagnóstico

Despachar `learner-profile-builder`.

Adicionalmente, preguntar:

> "¿Hay un **diagnóstico previo**? (ej. 'falló quiz X 2 veces', 'no entiende
> autoDispose'). Si sí, descibilo. Si no, la sesión empieza con diagnostic step."

### Paso 2 — Tutoring-Specific Setup

1. "¿Cuál es el **specific topic** que vamos a tutorear? (preciso: 'Riverpod
   providers: autoDispose vs keepAlive', no 'state management')."

2. "¿Cuál es el **diagnostic result**? (qué identificaste como gap concreto)"

3. "¿Cuál es el **success criterion** concreto? (resolución medible: 'Resuelve 3
   ejercicios sin preguntar', 'Pasa quiz M3 con 80%+', 'Explica el concepto a otra
   persona')"

### Paso 3 — Objetivos

> "Objetivos para ESTA sesión (típico 2-3):
>
> - Aclarar la confusión específica
> - Practicar con N ejercicios escalonados
> - Validar comprensión con success criterion"

### Paso 4 — Pre-work

> "Tutoring pre-work es típicamente:
>
> - Releer el material del topic (5-10 min)
> - Intentar el ejercicio/quiz que falló (sin presión, para diagnóstico fino)
> - Marcar específicamente qué pregunta confundió
>
> ¿Qué pre-work pedís?"

### Paso 5 — Agenda

Tutoring sessions suelen ser más cortas y enfocadas (30-60 min).

Template:

```
0-5     | Diagnóstico fino: qué parte del tema sentís más confusa
5-15    | Walk-through guiado del concepto con código vivo
15-35   | Ejercicios escalonados (fácil → medio → difícil) con Claude como partner
35-45   | Validación contra success criterion
```

### Paso 6 — Reflection Questions

> "Tutoring reflection consolida el aprendizaje. Ejemplos:
>
> - '¿Qué analogía propia te quedaste con vos para recordar X?'
> - '¿Qué señal usarías la próxima vez para detectar este patrón antes?'
>
> Dame 1 pregunta específica al topic."

### Paso 7 — Follow-up

> "Tutoring follow-up es action-oriented:
>
> - 'Pasar el quiz M3 con 80%+ antes de iniciar M4'
> - 'Si te trabás de nuevo en este topic, avisame antes de que se vuelva bloqueo'
>
> ¿Qué homework asignás?"

### Paso 8 — Generar JSON + MD

Construir siguiendo `session-plan-tutoring.profile.json`. Profile incluye
`tutoring_specific.specific_topic`, `diagnostic_result`, `success_criterion`.

Validar con ajv. Escribir.

## Recursos

- `${CLAUDE_PLUGIN_ROOT}/assets/schemas/profiles/session-plan-tutoring.profile.json`
- `${CLAUDE_PLUGIN_ROOT}/assets/templates/session-plan-tutoring.md.tmpl`
- `${CLAUDE_PLUGIN_ROOT}/examples/session-plan-tutoring-example.json`
