# instructional-design-toolkit

Plugin de Claude Code para diseño instructional guiado — **cursos completos
xAPI + cmi5-compliant** y **planes de sesiones 1-on-1** (coaching / mentoring /
tutoring) con rigor pedagógico.

## Qué hace

Guía a creadores de cursos (instructores externos, founders de startups Launchpad,
equipos internos) a través del diseño completo de cursos usando la fórmula
**CONTEXT → CONCEPT → BUILD → SHIP → REFLECT** con **Builder's Bloom's Taxonomy**,
**Ship-First Design**, y evaluación **Kirkpatrick L1-L4**. Produce outputs xAPI +
cmi5 compliant desde el origen, listos para hospedar en LMS estándar (Moodle con
mod_cmi5, Ralph LRS, SCORM Cloud, Cornerstone).

## Core Methodology Insights

Antes de usar el toolkit, vale la pena internalizar estos 5 insights:

### 1. SAM supera ADDIE

*SAM (Successive Approximation Model)* de Allen Interactions es la antítesis de
ADDIE: iteración rápida con prototipos en vez de diseño completo pre-desarrollo.
**Ningún curso debería llegar a su primera cohorte de 100+ sin haber pasado por al
menos una cohorte piloto de 3-10**. Ref: *Leaving ADDIE for SAM* (Allen, 2012).

### 2. Atomic Habits aplicado a cursos

Cada lección es un ciclo *cue → craving → response → reward* (Clear, 2018). El
`cue` suele ser notificación o bloque de calendario; el `craving` es curiosidad
por un concepto nombrado; el `response` es la sección BUILD; el `reward` es el
SHIP milestone compartible. **Los cursos que omiten el reward mueren en silencio**
— la tasa de abandono entre lesson 2 y 3 es típicamente 60-80%.

### 3. xAPI Stability Rule

Los `id` y `au_id` en el JSON son **inmutables**. Los `title` y `slug` son
mutables. Si renombrás "Lesson 3: Widgets" a "Lesson 3: Composición de Widgets",
el `id` debe permanecer `lesson:widgets-001`. **Confundirlos rompe el historial
xAPI de todos los alumnos que ya pasaron por ese AU**. El agent
`cmi5-metadata-writer` aborta automáticamente si detecta cambio de ID inmutable.

### 4. Semantic Versioning para cursos

| Tipo | Qué cambia | Impacto en alumnos enrolados |
|---|---|---|
| **MAJOR** (2.0.0) | AU removido, masteryScore aumentado, moveOn endurecido, module reorder | 🔴 Migration required |
| **MINOR** (1.2.0) | AU agregado, lesson agregada, quiz opcional | 🟡 Re-enrollment opcional |
| **PATCH** (1.1.3) | Typo, reescritura de contenido, update de title/slug | 🟢 Transparente |

`/course-revise` clasifica automáticamente y aplica grandfather clauses cuando es
posible.

### 5. Irby 2018 — Coach ≠ Mentor ≠ Tutor

Del editorial *Mentoring & Tutoring: Partnership in Learning* (Irby, 2018, p. 297):

> *"mentors can coach, but coaches hardly ever mentor, and mentors and coaches
> can tutor, but tutors rarely mentor or coach."*

El toolkit detecta el tipo automáticamente vía `session-type-detector` agent pero
respeta la distinción pedagógica: cada tipo tiene estructura de session plan
distinta (coaching = KPI + withdrawal trigger; mentoring = long-term goal +
relationship history; tutoring = specific topic + success criterion).

## Commands (12)

| Command | Purpose |
|---|---|
| `/new-course` | Diálogo guiado para diseñar un curso completo |
| `/course-audit [slug]` | Auditoría contra framework + cmi5 structure |
| `/new-1-on-1-session-plan` | Plan de sesión 1-on-1 con auto-detect de tipo |
| `/new-coaching-session` | Shortcut directo a sesión de coaching |
| `/new-mentoring-session` | Shortcut directo a sesión de mentoría |
| `/new-tutoring-session` | Shortcut directo a sesión de tutoría |
| `/session-plan-audit [slug]` | Auditoría de plan de sesión contra su tipo |
| `/course-visualize [slug]` | HTML interactivo (Bloom's + ships + Kirkpatrick embeds) |
| `/slides-preview [slug] [N]` | Renderiza slides Marp por lección |
| `/course-revise [slug]` | Aplica cambio + bumpea versión + genera changelog |
| `/course-retro [slug]` | Ingesta xAPI + feedback, análisis Kirkpatrick L1-L4 |
| `/course-diff [slug] v1 v2` | Compara dos versiones, clasifica cambios |

## Skills (12)

Cada comando tiene un skill correspondiente. Los 3 shortcuts de session plan
(`coaching-session`, `mentoring-session`, `tutoring-session`) reusan el flow del
skill principal omitiendo la detección de tipo.

## Agents (7)

| Agent | Purpose |
|---|---|
| `business-context-detector` | Busca contexto en `business/`, `business-model/`, `srd/` con dialogue fallback |
| `learner-profile-builder` | Personas de SRD, BMT, ux-research maps; Lean UX 4-quadrant fallback |
| `session-type-detector` | Detecta coach/mentor/tutor desde contexto (Irby 2018) |
| `course-visualizer` | Genera course.html standalone (sin CDN, vanilla JS) |
| `slides-renderer` | Marp decks via marp-cli con CONTEXT→...→REFLECT |
| `cmi5-metadata-writer` | Enforce ID stability + completa defaults cmi5 |
| `changelog-generator` | Diff JSON + classify semver + Keep-a-Changelog adapted |

## Output

```
docs/instructional-design/
├── courses/
│   └── <course-slug>/
│       ├── course.json            (fuente de verdad — schema-validable)
│       ├── course.md              (syllabus denso scannable)
│       ├── course.html            (visualización interactiva)
│       ├── CHANGELOG.md           (auto-gen por /course-revise)
│       ├── lessons/
│       │   ├── lesson-01-*.md     (Marp source)
│       │   └── lesson-01-*.html   (Marp render)
│       ├── audits/
│       │   └── audit-2026-04-17.md
│       ├── retros/
│       │   └── retro-cohort-01.md
│       ├── diffs/
│       │   └── diff-v1.0.0-to-v1.1.0.md
│       └── dist/                  (v2)
│           ├── cmi5.xml
│           ├── au-01/index.html (Marp + xapi-wrapper.js)
│           └── course-package.zip
└── session-plans/
    └── <session-slug>/
        ├── session-plan.json
        └── session-plan.md
```

## Arquitectura

```
Diálogo guiado → course.json (truth) → course.md (read) + course.html (visualize)
                                     → lessons/*.md + .html (Marp slides)
                                     → (v2) dist/*.zip (cmi5 package)

Iteración:
  /course-revise → bump semver → CHANGELOG.md
  /course-retro  → xAPI CSV + feedback CSV → retro-report.md (Kirkpatrick L1-L4)
  /course-diff   → clasificar cambios → diff-report.md

Adapters:
  v1: xapi/csv, feedback/tally-csv, feedback/typeform-csv
  v2 (stubs documented): Ralph, SCORM Cloud, Learning Locker, Tally API,
                         Typeform API, Articulate Reach 360 API
```

## Instalación

```
claude plugins install instructional-design-toolkit
```

## Requisitos

- **`marp-cli`** (para `/slides-preview`):
  ```
  npm install -g @marp-team/marp-cli
  ```
- **Chrome o Edge** (para visualizar HTML interactivo).
- **`ajv-cli`** (opcional, para validación de schemas en testing):
  ```
  npm install -g ajv-cli ajv-formats
  ```
- **Opcional**: `srd-framework`, `business-model-toolkit`, `ux-research-toolkit`
  instalados en el mismo proyecto para auto-detección de context y personas.
- **Opcional (v2)**: SCORM Cloud account (sandbox free) para validar paquetes
  cmi5; Ralph LRS para ambiente de producción estilo Pathways.

## Scope

### v1 (current release)

12 commands + 12 skills + 7 agents + 6 schemas + 6 templates + 11 adapter docs +
10 reference docs.

### v2 (deferred)

- `/course-package` — empaqueta cmi5 .zip con `xapi-wrapper.js` (~80-100 LOC,
  emite los 9 verbos cmi5).
- Adapters API-based: Ralph, SCORM Cloud, Learning Locker, Tally API, Typeform
  API, Articulate Reach 360 API.
- Skill `atomic-learning-habits` — guía cue/craving/response/reward por lesson.
- Perfiles adicionales: `workshop.profile.json`, `masterclass.profile.json`.

## References

### Pedagogical
- Allen, M. (2012). *Leaving ADDIE for SAM*. ATD Press.
- Clear, J. (2018). *Atomic Habits*. Avery.
- Irby, B. J. (2018). *Editor's Overview: Differences and Similarities with
  Mentoring, Tutoring, and Coaching*. **Mentoring & Tutoring: Partnership in
  Learning**, 26(2), 115-121. DOI: 10.1080/13611267.2018.1489237.
- Kirkpatrick, D. L. (1959/1994). *Evaluating Training Programs: The Four Levels*.

### Technical
- cmi5 spec: <https://aicc.github.io/CMI-5_Spec_Current/>
- xAPI spec: <https://github.com/adlnet/xAPI-Spec>
- Ralph LRS: <https://ralph.io>
- Moodle xAPI subsystem: <https://moodledev.io/docs/4.4/apis/subsystems/xapi>
- Marp: <https://marp.app>

### Internal references
- Sibling plugins: `ux-research-toolkit`, `business-model-toolkit`, `srd-framework`,
  `chimera-academy` (philosophy reference).
- Linear: [legacy-ticket epic](https://linear.app/chimera-coding/issue/legacy-ticket) — 11
  implementation children legacy-ticket (T01) → legacy-ticket (T11).
- Spike relacionado: [legacy-ticket](https://linear.app/chimera-coding/issue/legacy-ticket) —
  Custom LRS xAPI nativo en Supabase (target Pathways).

## License

[BSL-1.1](./LICENSE) — Business Source License 1.1.
