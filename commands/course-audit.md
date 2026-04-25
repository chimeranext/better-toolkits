---
description: "Auditoría de curso contra framework: CONTEXT→...→REFLECT presence, Bloom's progression, Ship-First, hiring test, standalone test, cmi5 structure"
argument-hint: "[course-slug]"
---

# /course-audit — Auditoría de Curso

Invocar skill `instructional-design-toolkit:course-audit` con `$ARGUMENTS` como
slug del curso a auditar (ej. `flutter-fullstack-2026`).

Si `$ARGUMENTS` está vacío: skill lista los cursos disponibles en
`docs/instructional-design/courses/` y pide al usuario elegir.

## Output

`docs/instructional-design/courses/{slug}/audits/audit-{YYYY-MM-DD}.md` con:
- Tabla pass/warning/fail por check
- Top 5 fixes priorizados (impact × ease)
- Comparison contra audits previos (si existen)
