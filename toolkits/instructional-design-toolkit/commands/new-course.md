---
description: "Diseño guiado de curso completo — CONTEXT→CONCEPT→BUILD→SHIP→REFLECT, Builder's Bloom's, Ship-First Design, cmi5-ready, Kirkpatrick L1 feedback embeds"
argument-hint: "[optional: course-slug si querés revisar/continuar uno existente]"
---

# /new-course — Diseño Guiado de Curso

Dispatcher que invoca el skill `instructional-design-toolkit:new-course`.

Si `$ARGUMENTS` matchea un curso existente en
`docs/instructional-design/courses/{slug}/course.json`, el skill detecta el modo
revise (sugiere usar `/course-revise` en su lugar). Si vacío o slug nuevo, arranca
diálogo guiado desde cero.

## Output esperado

```
docs/instructional-design/courses/{slug}/
├── course.json   ← fuente de verdad (validado contra course.schema.json)
└── course.md     ← syllabus denso + scannable (export tipo chimera-academy)
```

## Próximos comandos sugeridos

- `/course-audit {slug}` — validar contra framework
- `/course-visualize {slug}` — Bloom's curve + ship milestones HTML
- `/slides-preview {slug} [N]` — render slides Marp por lección
- `/course-revise {slug}` — bumpear versión + changelog
