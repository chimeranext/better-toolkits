---
description: "Compara dos versiones de un curso (vía git tags), clasifica cada cambio, y reporta impacto en alumnos enrolados"
argument-hint: "[course-slug] [v1] [v2]"
---

# /course-diff

Invocar skill `instructional-design-toolkit:course-diff` con `$ARGUMENTS` =
`course-slug v1 v2`.

Ejemplos:
- `/course-diff flutter-fullstack-2026 v1.0.0 v2.0.0`
- `/course-diff flutter-fullstack-2026 HEAD~5 HEAD`

Output: `docs/instructional-design/courses/{slug}/diffs/diff-{v1}-to-{v2}.md`
