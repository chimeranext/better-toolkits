---
name: course-audit
version: 1.0.0
description: >
  Auditoría de curso contra framework completo. Use when user asks to "audit my
  course", "review my syllabus", "check course quality", "auditar curso",
  "revisar mi syllabus", "validar curso", "/course-audit".
---

# Auditoría de Curso

Valida un curso existente contra: CONTEXT→CONCEPT→BUILD→SHIP→REFLECT presence,
Bloom's progression climb, Ship-First Design alignment, hiring test, standalone
test, cmi5 structure validity, tag taxonomy compliance.

## Regla de idioma

Español. Términos técnicos en formato *"español (English)"*.

## Inputs

- `course-slug` (required, desde `$ARGUMENTS`): nombre del directorio en
  `docs/instructional-design/courses/`.

Si vacío: listar cursos disponibles, pedir al usuario elegir.

## Flujo

### Paso 1 — Load + Validate JSON

1. Verificar que existe `docs/instructional-design/courses/{slug}/course.json`.
2. Validar contra schema:
   ```bash
   ajv validate -s ${CLAUDE_PLUGIN_ROOT}/assets/schemas/course.schema.json -d {course.json} --spec=draft2020 -c ajv-formats
   ```
   Si falla schema → ABORT (no auditar contenido si la estructura está rota).
3. Cargar el JSON en memoria.

### Paso 2 — Run framework checks

Ejecutar TODOS los checks abajo y agruparlos por severidad (PASS / WARN / FAIL).

#### Check 1 — Infrastructure presence

| Field | Criterio |
|---|---|
| `business_context` | Presente y no vacío |
| `learner_profile` | id, name, primary_pain todos presentes |
| `capstone` | id, title, deliverable, ≥3 criteria, hiring_test todos presentes |
| `analysis.blooms_progression` | Array con length == modules.length |
| `analysis.ship_milestones_escalation` | Array con length == modules.length |
| Per módulo: `feedback_form` | Presente con tool + form_id + embed_url |

#### Check 2 — CONTEXT→CONCEPT→BUILD→SHIP→REFLECT presence

Por cada lesson:

| Field | Criterio |
|---|---|
| `context` | ≥100 chars, no arranca con "En la lección anterior" |
| `concept` | ≥200 chars |
| `build` | ≥200 chars Y representa 50-60% del total chars de la lesson |
| `ship` | ≥30 chars |
| `reflect` | ≥1 question, NO genérica (rechazar "¿qué aprendiste?", "¿cómo te fue?", "¿algún comentario?") |

#### Check 3 — Bloom's progression climb

Mapear levels a integers:
Recognize=1, Explain=2, Build=3, Debug=4, Decide=5, Ship=6.

- **PASS**: progresión monotónica creciente (con plateaus OK).
- **WARN**: 3+ módulos en mismo nivel, O regression de 1 nivel.
- **FAIL**: regression de 2+ niveles, O salto de 3+ niveles sin step intermedio.

#### Check 4 — Ship-First alignment

- Cada módulo tiene `ship_milestone` no vacío.
- Ship milestones escalan: commit local → push → deploy staging → prod → capstone público.
- Capstone está alineado con assessment_criteria (ej. si capstone dice "publicada en stores" debe haber criterio sobre publicación).

#### Check 5 — Hiring test no genérico

- `capstone.hiring_test` debe ser >50 chars.
- NO aceptar respuestas tipo "Sí" sin justificación.
- Aceptar respuestas razonadas, incluso "No" si el creador justifica el rediseño pendiente.

#### Check 6 — Standalone test

Por cada lesson:

- ¿BUILD asume conocimiento que NO está en CONCEPT de la misma lesson?
- ¿BUILD referencia conceptos de lessons FUTURAS?

Heurística: si BUILD menciona términos no introducidos en CONCEPT y no hay link a
lesson previa que los haya introducido → WARN.

Caso extremo (BUILD vacío o trivial): FAIL — anti-pattern Hello-Worlder.

#### Check 7 — cmi5 structure

Despachar `${CLAUDE_PLUGIN_ROOT}/agents/cmi5-metadata-writer.md` en mode
**validate-only** (no escribir):

- IDs (`id`, `au_id` en todos los niveles) son únicos en su scope.
- `masteryScore` ∈ [0, 1].
- `moveOn` ∈ enum válido.
- `launchMethod` ∈ enum válido.
- `activityType` is a valid URI.

#### Check 8 — Tag taxonomy compliance

Si existe `tag-taxonomy.md` en el repo (proyecto del usuario, no del plugin):
- Cross-reference que los tags usados en `meta.keywords` (si existen) están en la
  taxonomía.
- WARN si hay tags no listados.

Si no existe tag-taxonomy.md: skip este check (PASS).

### Paso 2.5 — Aplicar overlays al audit (Base + Overlay protocol)

Antes de componer el report, leer
`${CLAUDE_PLUGIN_ROOT}/assets/runtime/overlay-protocol.md` y ejecutar el
procedimiento (Discovery §2 + Invocation §3 + Layer 1 validator §5,
**específicamente §5.4** porque el `baseDraft` es findings-shaped, NO el
`course.json`) sobre el conjunto de findings producido en el Paso 2:

- `command` = `"course-audit"`
- `cwd` = directorio de trabajo desde donde se invocó `/idt:course-audit`
- `baseDraft` = objeto con forma `{ findings: [...], summary: {...} }` que
  resume los 8 checks de framework. Cada `finding` tiene al menos los campos
  `check`, `severity` (`pass`/`warn`/`fail`), `description`, y opcionalmente
  `recommended_change` (texto libre o JSON Pointer-shaped) que el overlay
  puede usar para proponer fixes. Un overlay puede AGREGAR findings — p.ej.
  un overlay `content-standards` desde `chimera-academy` puede inyectar findings
  Chimera-específicos como "Módulo 2 carece de text-classes load-bearing,
  contradice la regla 'text classes carry the course'".
- `context.cwd` y `context.repo` per la convención general.
- `context.locale` derivado de `course.meta.language` cuando esté presente.
- `context._sourceArtifact` = el `course.json` cargado en el Paso 1
  (side-channel del runtime, no parte del contrato público de
  `OverlayInput.context` — ver overlay-protocol.md §5.4).

Reglas (§5.4):

- El validator Layer 1 toma el snapshot contra `context._sourceArtifact`
  (el `course.json`), NO contra `baseDraft`. El snapshot queda fijo durante
  todo el run — los overlays agregan findings, no tocan el source.
- Después de cada overlay, además del snapshot-compare estándar, el runtime
  escanea cada `finding` nuevo y mira sus campos `recommended_change` /
  `proposed_diff` / equivalentes. Si el texto del finding referencia
  cualquier path Layer 1 de §4 con intención de mutar (p.ej.
  `set meta.id = ...`, `replace modules[0].au_id`, `delete capstone.id`):
  ABORT con error apuntando al `SKILL.md` del overlay AND al índice del
  finding ofensor en el array `findings[]`.
- Findings que proponen cambios sobre campos mutables (titles, slugs,
  description text, `analysis.identified_risks`, copy de lessons): OK — solo
  los path L1 disparan el abort.
- Los findings de overlays se mezclan con los findings base en el report
  (Paso 3) bajo una sub-sección "Overlay findings" por overlay aplicado, con
  el `SKILL.md` path del overlay como header.
- Si discovery devuelve cero overlays: el report contiene solo los 8 checks
  base (auditoría voice-neutral cmi5/xAPI). Ningún warning.
- Warnings de overlays se acumulan y se incluyen en la presentación final
  (Paso 4) junto al "N fixes prioritarios identificados".

### Paso 3 — Compose audit report

Generar `docs/instructional-design/courses/{slug}/audits/audit-{YYYY-MM-DD}.md` con
estructura:

```markdown
# Course Audit: {course title}
**Date**: {date}
**Auditor**: instructional-design-toolkit:course-audit
**Course version**: {version}

## Summary
- Infrastructure: {pass/total}
- Lesson formula compliance: {pass/total} lessons
- Bloom's progression: PASS | WARN | FAIL
- Ship-First alignment: PASS | WARN | FAIL
- Hiring test: PASS | WARN | FAIL
- Standalone test: {pass/total} lessons
- cmi5 structure: PASS | WARN | FAIL
- Tag taxonomy: PASS | WARN | SKIPPED

## Detail (por check)
[tablas detalladas]

## Top 5 Fixes Priorizados (impact × ease)

1. **{Most impactful fix}** — file + what to change + estimated effort
2. ...
```

### Paso 4 — Present + gate

> "Auditoría completa. {N} fixes prioritarios identificados. ¿Querés que proponga
> los cambios concretos?
> 1. Sí, proponer fixes
> 2. No, solo el report"

**PUERTA**: si el usuario dice sí, proceder a Paso 5. Si no, terminar.

### Paso 5 — Propose fixes

Para cada fix priorizado, mostrar el diff propuesto al usuario. Aplicar solo con
confirmación explícita por fix. NO bulk-apply.

## Recursos

- `${CLAUDE_PLUGIN_ROOT}/references/methodology.md`
- `${CLAUDE_PLUGIN_ROOT}/assets/skill-references/blooms-taxonomy.md`
- `${CLAUDE_PLUGIN_ROOT}/assets/skill-references/ship-first-design.md`
- `${CLAUDE_PLUGIN_ROOT}/agents/cmi5-metadata-writer.md`
- `${CLAUDE_PLUGIN_ROOT}/assets/schemas/course.schema.json`
- `${CLAUDE_PLUGIN_ROOT}/assets/schemas/overlay-protocol.schema.json` — contrato `OverlayInput`/`OverlayOutput` para el Paso 2.5
- `${CLAUDE_PLUGIN_ROOT}/assets/runtime/overlay-protocol.md` — discovery + invocation + Layer 1 invariant validator
