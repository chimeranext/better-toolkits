# Course Iteration Guide

Cómo iterar un syllabus post-release sin romper alumnos enrolados. Versionado
semántico + IDs estables + changelog + grandfather clause.

---

## 1. SAM como metodología de iteración

*SAM (Successive Approximation Model, Allen)* se opone al modelo ADDIE secuencial.
Fases:

1. **Preparation** — Savvy Start (kickoff corto + prototipo inicial).
2. **Iterative Design** — ciclos cortos Design → Proof → Review.
3. **Iterative Development** — Alpha → Beta → Gold, validando contra alumnos reales
   en cada etapa.

**Regla de oro**: ningún curso debe llegar a su primera cohorte de 100+ sin haber
pasado por al menos una cohorte piloto de 3-10 alumnos. El toolkit enforza esto vía
`/course-retro` — cualquier release `v1.0.0` debería tener al menos 1 retro previo.

---

## 2. Semantic versioning adaptado a cursos

| Tipo | Qué cambia | Impacto alumnos enrolados |
|---|---|---|
| **MAJOR** (2.0.0) | AU removido, `masteryScore` aumentado, `moveOn` endurecido, `activityType` cambiado, module reorder, capstone assessment_criteria redefinidos | 🔴 Migration required — pueden perder progreso o requerir re-testeo |
| **MINOR** (1.2.0) | AU agregado, lesson agregada, quiz opcional, campo metadata nuevo backward-compatible, `masteryScore` bajado | 🟡 Re-enrollment opcional, no pierden progreso |
| **PATCH** (1.1.3) | Typo, reescritura de contenido, update de `title`/`slug` (con `id` estable), update de `philosophy_quote` | 🟢 Transparente |

---

## 3. ID Stability Rule

**Inmutables** (NUNCA cambiar):
- `meta.id`
- `modules[].id`, `modules[].au_id`
- `lessons[].id`, `lessons[].au_id`
- `capstone.id`, `capstone.assessment_criteria[].id`
- `classes[].id`

**Mutables**:
- `slug` (cualquier nivel)
- `title` (cualquier nivel)
- Cualquier campo de contenido (context, concept, build, ship, reflect, philosophy_quote)

El agent `cmi5-metadata-writer` aborta con error específico si detecta cambio de ID
inmutable en `/course-revise`. **Razón**: los xAPI statements del LRS referencian los
IDs. Cambiar uno rompe el historial completo del alumno para ese AU.

---

## 4. Diff-friendly JSON practices

Para que `git diff course.json` sea legible:

- **Keys ordenadas alfabéticamente** (determinístico entre runs).
- **Arrays estables**: `modules` ordenado por `order`, `lessons` por `order`, etc.
- **Sin timestamps per-run**: solo `meta.updated` cambia en PATCH+.
- **Enums explícitos sobre booleanos**: `"type": "major"` en vez de `"breaking": true`.

---

## 5. Grandfather clause pattern

Para cambios MAJOR que NO quieras forzar migration:

```json
{
  "meta": { "version": "1.1.0", ... },
  "modules": [
    {
      "id": "module:riverpod",
      "classes_cmi5": {
        "masteryScore": 0.80,
        "legacy_masteryScore": 0.75,
        "grandfather_clause": {
          "applies_to": "enrollments before 2026-04-17",
          "note": "Old enrollments keep 0.75 threshold; new enrollments use 0.80"
        }
      }
    }
  ]
}
```

El LRS usa `legacy_masteryScore` para alumnos cuya enrollment_date es anterior al
corte. El `masteryScore` actual aplica a nuevos enrollments. Esto es MINOR (no MAJOR)
porque no rompe alumnos existentes.

---

## 6. `meta.version_timeline` append-only

Cada `/course-revise` appendea:

```json
"version_timeline": [
  { "version": "1.2.3", "date": "2026-04-17", "type": "patch", "summary": "Fix typo M3" },
  { "version": "1.2.0", "date": "2026-04-10", "type": "minor", "summary": "+AU Riverpod Generator" },
  { "version": "1.0.0", "date": "2026-03-01", "type": "major", "summary": "Release inicial" }
]
```

Array **nunca** se reordena ni se borran entries. Es historial auditable.

---

## 7. `CHANGELOG.md` format

Auto-generado por `changelog-generator` agent. Formato Keep-a-Changelog adaptado:

```markdown
# Changelog — {course title}

## [1.1.0] — 2026-04-17 (Minor)

### Added
- AU `au:riverpod-generator-001` — lección opcional sobre Riverpod generator annotations

### Changed
- M3 `masteryScore`: 0.75 → 0.80 (con grandfather clause, ver `legacy_masteryScore`)

### Impact
- 0 breaking changes para alumnos enrolados en v1.0.0
- Nuevo AU aparece como "opcional" en Moodle; no bloquea completion
```

Para MAJOR con breaking:

```markdown
## [2.0.0] — 2026-06-01 (Major) — BREAKING

### Removed
- `au:deprecated-state-mgmt-001` (Provider manual ya no se enseña)

### Migration required
- 23 alumnos con progreso parcial en `au:deprecated-state-mgmt-001`
- Ralph LRS: re-emitir `Passed` statement con `au:riverpod-intro-001` para afectados
- Moodle mod_cmi5: admin bulk-complete flow en `docs/migrations/v2.0.0.md`
```

---

## 8. Pilot cohort loop

Iteración contra alumnos reales:

1. Publicar v0.1 en LRS sandbox (SCORM Cloud o Ralph dev).
2. Enrolar 3-10 alumnos (beta tester friends, dogfooding team, paid pilot).
3. Durante el curso:
   - Recolectar xAPI statements (L2 Learning).
   - Embedded Tally/Typeform forms per module (L1 Reaction).
4. Post-curso:
   - Follow-up survey 30 días después (L3 Behavior).
   - Tracking de capstones shippeados (L4 Results).
5. Ejecutar `/course-retro` con los datos.
6. Priorizar iteration candidates (impact × ease).
7. Release v1.0.0 con cambios del retro.

**Regla**: entre v0.x y v1.0.0 debe haber al menos 1 pilot cohort + 1 retro
documentado.
