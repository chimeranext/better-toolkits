---
name: course-revise
version: 1.0.0
description: >
  Aplica cambio incremental a un curso existente: clasifica MAJOR/MINOR/PATCH,
  valida ID stability, bumpea version, append version_timeline, escribe
  CHANGELOG entry. Si MAJOR: impact analysis con grandfather clause option.
  Use when user asks to "revise course", "update course", "bump version",
  "edit syllabus", "actualizar curso", "iterar curso", "/course-revise".
---

# Revisar Curso (Iteration)

Aplica un cambio al syllabus de un curso ya creado, respetando semantic versioning
y ID stability.

## Inputs

- `course-slug` (required): nombre del directorio en `docs/instructional-design/courses/`.

## Flujo

### Paso 1 — Load course

Verificar que `docs/instructional-design/courses/{slug}/course.json` existe.
Si no: ABORT con sugerencia de `/new-course`.

### Paso 2 — Describe el cambio

> "¿Qué querés cambiar? Describilo en lenguaje natural. Ejemplos:
>
> - 'Subir el masteryScore del Módulo 3 de 0.75 a 0.80'
> - 'Agregar una lección nueva en el Módulo 5 sobre testing'
> - 'Reescribir el CONCEPT del Lesson 12 con mejor analogía'
> - 'Quitar el Módulo 7 (deprecated)'
>
> Detalles del cambio:"

### Paso 3 — Aplicar el cambio en memoria

Construir el `course.json` propuesto (new_course_json) en memoria, no escribir aún.

### Paso 4 — Classify via changelog-generator

Despachar `${CLAUDE_PLUGIN_ROOT}/agents/changelog-generator.md` con:
- new_course_json (en memoria)
- old_course_json_path (current file en disk)

Recibir CLASSIFICATION (major/minor/patch) + impact analysis.

### Paso 5 — Validate ID stability via cmi5-metadata-writer

Despachar `${CLAUDE_PLUGIN_ROOT}/agents/cmi5-metadata-writer.md` en mode revise:
- new_course_json
- old_course_json_path

Si ABORT por ID stability violation: presentar el error al usuario, ofrecer:
1. Revertir el cambio de ID (mantener slug/title nuevo, ID viejo)
2. Cancelar la revisión completa

### Paso 6 — Si MAJOR, presentar impact analysis + decisión

> "Este cambio es **MAJOR** (breaking).
>
> Razón: [del classifier]
>
> Impact estimado: [N alumnos afectados o "depende del LRS"]
>
> Opciones:
> 1. **Breaking change** (bump 1.x.x → 2.0.0) — alumnos viejos requieren migration
> 2. **Grandfather clause** (bump 1.x.x → 1.x+1.0) — el campo viejo se preserva en
>    `legacy_*`; nuevos enrollments usan el valor nuevo, alumnos enrolados mantienen
>    el viejo
> 3. Cancelar la revisión"

**PUERTA**: confirmar opción.

### Paso 7 — Apply + write

1. Bump version según classification.
2. Append entry a `meta.version_timeline`.
3. Update `meta.updated`.
4. Escribir `course.json`.
5. Append entry a `CHANGELOG.md` (crear si no existe, formato Keep-a-Changelog).

### Paso 8 — Report

> "Revisión aplicada:
> - Versión: {old} → {new}
> - Type: {major|minor|patch}
> - CHANGELOG.md actualizado
>
> Próximos pasos:
> - Tip: `/course-audit {slug}` para validar que el cambio no introdujo gaps
> - Si querés ver impacto en alumnos: `/course-retro {slug}` con CSVs de la cohort
>   afectada"

## Recursos

- `${CLAUDE_PLUGIN_ROOT}/agents/changelog-generator.md`
- `${CLAUDE_PLUGIN_ROOT}/agents/cmi5-metadata-writer.md`
- `${CLAUDE_PLUGIN_ROOT}/references/course-iteration-guide.md`
