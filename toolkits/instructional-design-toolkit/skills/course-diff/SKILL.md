---
name: course-diff
version: 1.0.0
description: >
  Compara dos versiones de un curso (via git tags o commits), clasifica cada
  cambio, y reporta impacto en alumnos enrolados. Read-only — no modifica state.
  Use when user asks to "diff course", "compare versions", "comparar versiones",
  "qué cambió", "/course-diff".
---

# Diff de Curso entre Versiones

Lee dos versiones de `course.json` desde git history y produce un reporte de
diferencias clasificadas.

## Inputs

- `course-slug` (required)
- `v1` (required): versión vieja (tag git o commit, ej. `v1.0.0`, `HEAD~5`)
- `v2` (required): versión nueva (tag git o commit, ej. `v2.0.0`, `HEAD`)

## Flujo

### Paso 1 — Verificar git context

```bash
cd docs/instructional-design/courses/{slug}/
git log --oneline {v1}..{v2} -- course.json
```

Si no hay diff, mensaje al usuario "No hay cambios entre {v1} y {v2} en course.json".

### Paso 2 — Extraer ambas versiones

```bash
git show {v1}:docs/instructional-design/courses/{slug}/course.json > /tmp/course-{v1}.json
git show {v2}:docs/instructional-design/courses/{slug}/course.json > /tmp/course-{v2}.json
```

### Paso 3 — Despachar changelog-generator

Despachar `${CLAUDE_PLUGIN_ROOT}/agents/changelog-generator.md` con ambos paths.

Recibir:
- Classification global (major/minor/patch)
- Lista de cambios clasificados individualmente
- Impact analysis si MAJOR

### Paso 4 — Detectar ID stability violations

Si el agent reporta ID changes inmutables: marcarlos como **ERRORS** críticos en
el reporte (no solo "BREAKING" — son inválidos en el modelo cmi5).

### Paso 5 — Generate diff-report.md

`docs/instructional-design/courses/{slug}/diffs/diff-{v1}-to-{v2}.md`:

```markdown
# Course Diff: {course} {v1} → {v2}
**Generated**: {date}
**Classification**: MAJOR | MINOR | PATCH | NO_CHANGE

## Changes

### Removed
- ...

### Changed
- ...

### Added
- ...

## ID Stability Errors (críticos si presentes)
- {if any}: estos IDs no debieron cambiar — rompen historial xAPI

## Impact Analysis (solo si MAJOR)
- N alumnos enrolados podrían verse afectados
- Migration path sugerido: ...
```

Sin gates — read-only, idempotente. Mostrar el path generado al usuario al final.

## Recursos

- `${CLAUDE_PLUGIN_ROOT}/agents/changelog-generator.md`
- `${CLAUDE_PLUGIN_ROOT}/references/course-iteration-guide.md`
