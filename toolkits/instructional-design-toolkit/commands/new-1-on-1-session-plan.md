---
description: "Diseño de plan de sesión 1-on-1 con auto-detect de tipo (coaching/mentoring/tutoring) según contexto del proyecto"
argument-hint: "[optional: coaching | mentoring | tutoring]"
---

# /new-1-on-1-session-plan — Plan de Sesión 1-on-1

Dispatcher con auto-detection o pasaje a shortcut según `$ARGUMENTS`:

- Si `$ARGUMENTS` matchea `coaching` / `coach` → invocar `instructional-design-toolkit:coaching-session`
- Si `$ARGUMENTS` matchea `mentoring` / `mentor` → invocar `instructional-design-toolkit:mentoring-session`
- Si `$ARGUMENTS` matchea `tutoring` / `tutor` → invocar `instructional-design-toolkit:tutoring-session`
- Si vacío o no reconocido → invocar `instructional-design-toolkit:1-on-1-session-planner` (flow completo con `session-type-detector` agent)

## Output esperado

```
docs/instructional-design/session-plans/{slug}/
├── session-plan.json
└── session-plan.md
```

## Distinción coach/mentor/tutor (Irby 2018)

| Tipo | Foco | Duración | Selección |
|---|---|---|---|
| Coaching | Performance específica + KPI | Time-bound, hasta cumplir goal | Por individuo u organización |
| Mentoring | Desarrollo integral + carrera | Larga (posiblemente vitalicia) | Por el mentee |
| Tutoring | Problema/contenido específico | Corto plazo, tarea-específica | Asignado u opcional |
