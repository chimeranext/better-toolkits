# instructional-design-toolkit

Plugin de Claude Code para diseño instructional guiado — **cursos completos
xAPI + cmi5-compliant**, **contenido de curso end-to-end** (módulos, text
classes, quizzes, challenges, video scripts, workbooks interactivos, storyboards
de video), **Paths con credential OpenBadge 3.0**, y **planes de sesiones 1-on-1**
(coaching / mentoring / tutoring) con rigor pedagógico.

## Qué hace

Guía a creadores de cursos (instructores externos, founders de startups Launchpad,
equipos internos) a través del diseño completo de cursos usando la fórmula
**CONTEXT → CONCEPT → BUILD → SHIP → REFLECT** con **Builder's Bloom's Taxonomy**,
**Ship-First Design**, y evaluación **Kirkpatrick L1-L4**. Produce outputs xAPI +
cmi5 compliant desde el origen, listos para hospedar en LMS estándar (Moodle con
mod_cmi5, Ralph LRS, SCORM Cloud, Cornerstone).

El toolkit es la **capa base**: ship siempre las invariantes cmi5/xAPI y la
pedagogía genérica (SAM, Atomic Habits, Bloom's, Kirkpatrick, Irby). La voz
editorial y los frameworks nombrados viven en **overlays** de plugins consumidores
(p. ej. `chimera-academy`), que se descubren y aplican en runtime sin tocar la base.
Ver "Base + Overlay pattern" más abajo.

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

## Commands (34)

Los comandos escriben a **dos árboles de output** distintos según su origen:

- **`docs/instructional-design/`** — comandos core v1 (diseño y ciclo de vida de
  cursos y session plans a nivel `course.json` / `session-plan.json`). 12 comandos.
- **`content/`** — comandos de authoring de contenido migrados desde
  `chimera-academy` (el árbol de contenido real: módulos, clases, quizzes, workbooks,
  storyboards, paths, tracks, traducciones, ilustraciones, QA de release). 21 comandos.

_(Además existen `commands/_translation-pipeline.md` y
`commands/_translation-strategy.md`: son docs internos de referencia sin
frontmatter, no comandos invocables.)_

### Core — cursos y session plans → `docs/instructional-design/`

| Command | Purpose |
|---|---|
| `/new-course` | Diseño guiado de curso completo — CONTEXT→…→REFLECT, Builder's Bloom's, Ship-First, cmi5-ready, Kirkpatrick L1 embeds |
| `/course-audit [slug]` | Auditoría contra framework: presencia CONTEXT→…→REFLECT, Bloom's progression, Ship-First, hiring test, standalone test, estructura cmi5 |
| `/course-visualize [slug]` | Genera `course.html` interactivo (Bloom's curve + ship milestones + complexity ramp + Kirkpatrick feedback embeds) |
| `/course-revise [slug]` | Aplica cambio + clasifica MAJOR/MINOR/PATCH + bumpea versión + escribe CHANGELOG + flagea impacto si MAJOR |
| `/course-retro [slug]` | Ingiere xAPI + Tally/Typeform CSV de una cohorte → retro report Kirkpatrick L1-L4 con iteration candidates priorizados |
| `/course-diff [slug] v1 v2` | Compara dos versiones (vía git tags), clasifica cada cambio y reporta impacto en alumnos enrolados (read-only) |
| `/slides-preview [slug] [N]` | Renderiza slides Marp por lección desde `course.json` |
| `/new-1-on-1-session-plan` | Diseño de plan de sesión 1-on-1 con auto-detect de tipo (coaching/mentoring/tutoring) |
| `/new-coaching-session` | Shortcut directo a sesión de coaching (performance-focused, time-bound, con KPI y withdrawal_trigger) |
| `/new-mentoring-session` | Shortcut directo a sesión de mentoría (desarrollo integral, larga duración, sin KPI time-bound) |
| `/new-tutoring-session` | Shortcut directo a sesión de tutoría (topic específico, corto plazo, success criterion concreto) |
| `/session-plan-audit [slug]` | Auditoría de plan de sesión contra framework coach/mentor/tutor (Irby 2018) + time-boxing + reflection quality |

### Authoring de contenido (migrados de chimera-academy) → `content/`

| Command | Purpose |
|---|---|
| `/research` | Deep-dive en un topic, framework o stack — produce platform-summary, teaching-context draft y framework extraction |
| `/analyze-repo` | Analiza un repo de referencia — mapea arquitectura, extrae patterns, templates y frameworks para material de curso |
| `/teaching-context-generate` | Genera `teaching-context.md` de un curso — target student, anxiety points, motivación, AI positioning |
| `/new-track` | Plan de track overview — mapea todos los cursos de una categoría con prerequisites, certification path y gap analysis |
| `/new-path` | Diseño guiado de Path — agrupa cursos existentes en milestones ordenados + credential OpenBadge 3.0 (no modifica ningún `course.json`) |
| `/write-module` | Escribe todas las clases de un módulo entero — text classes, video briefs, quiz y challenge |
| `/write-text-class` | Genera una text class (contenido de enseñanza primario) para un módulo |
| `/write-lesson` | Escribe una lección de workbook (track legacy `docs/`). Para contenido nuevo, preferí `/write-text-class` |
| `/write-challenge` | Diseña un deliverable BUILD (challenge) para un módulo |
| `/write-quiz` | Genera un quiz de módulo desde las text classes completadas |
| `/write-video-script` | Genera un video script desde un video brief, con scene tags y filming outline |
| `/new-storyboard` | Orquesta un storyboard de producción de video desde un video-brief — descompone en escenas A-ROLL (avatar talking-head) y B-ROLL (visual generativo), produce prompts para HeyGen + Higgsfield/Kling y exporta tabla + JSON sidecar |
| `/slides-generate` | Genera un slide deck desde un video brief |
| `/workbook-generate` | Genera un workbook HTML interactivo standalone para un curso entero desde sus text classes (modelo Articulate-Rise, chunked por módulo; `--scope course\|module`) |
| `/content-review` | Revisa contenido existente contra quality standards y alineación filosófica |
| `/module-audit` | Valida completitud de módulo — todos los class types, frontmatter, frameworks, resources y continuidad |
| `/course-qa` | QA de release-readiness de un curso **publicado/vivo** en la plataforma (estructura, contenido, videos, links, ejercicios, recorrido como learner) con criterios PASS/FAIL. Complementa `/course-audit`: aquél audita el **diseño** cmi5 en el repo, este el **curso vivo**. Output a `content/courses/<slug>/audits/qa-<env>-<fecha>.md` |
| `/retention-plan` | Genera un retention plan — proyectos post-curso, spaced review y next steps para seguir construyendo |
| `/translate-content` | Traduce un curso o módulo completo a Español LATAM (o el locale que configure el consumidor) |
| `/translate-content-gemini` | Traducción masiva a otro locale con modelo económico (Gemini 3.5 Flash default) vía liteLLM — fan-out de sub-agents por módulo + curación del orquestador. Variante cost-optimized de `/translate-content` |
| `/illustrate` | Genera el asset set de ilustraciones brandeadas de un curso/módulo vía Gemini API — descubre embeds/manifests pendientes, genera, revisa visualmente y promueve a `content/courses/<slug>/assets/`. Paleta de marca por overlay del consumer |
| `/piber-narrative-architect` | Construye, comprime, transpone o audita una narrativa PIBER (Problem, Insight, Big Idea, Execution, Results) — la estructura de case board de Cannes Lions usada como espina comunicacional universal. Cinco modos: `board`, `compressed`, `transposed`, `audit`, `reverse` |

## Skills (21)

Los skills son el motor de cada flujo. **No hay correspondencia 1:1 comando↔skill**:
17 skills respaldan comandos (algunos comparten skill — los 3 shortcuts de session
plan reusan el flow del `1-on-1-session-planner` omitiendo la detección de tipo), y
4 son **reference skills** sin comando propio, que otros skills cargan como canon
metodológico.

### Skills de authoring (respaldan comandos)

| Skill | Rol |
|---|---|
| `new-course` | Diálogo guiado de curso completo (respaldar `/new-course`) |
| `course-audit` | Auditoría de curso contra el framework completo |
| `course-visualize` | HTML interactivo: Bloom's + ships + complexity + Kirkpatrick embeds |
| `course-revise` | Cambio incremental + clasificación semver + ID stability + CHANGELOG |
| `course-retro` | Retro Kirkpatrick L1-L4 con iteration candidates (impact × ease) |
| `course-diff` | Compara versiones vía git tags/commits, reporta impacto (read-only) |
| `slides-preview` | Render Marp por lección desde `course.json` |
| `1-on-1-session-planner` | Diseño de session plan con auto-detect coach/mentor/tutor |
| `coaching-session` | Session plan de coaching (salta detección; tipo ya declarado) |
| `mentoring-session` | Session plan de mentoría (desarrollo integral, larga duración) |
| `tutoring-session` | Session plan de tutoría (topic específico, corto plazo) |
| `session-plan-audit` | Auditoría de session plan contra Irby 2018 + time-boxing |
| `new-path` | Diseño de Path sobre la capa cmi5 + credential OpenBadge 3.0 |
| `teaching-context` | Genera y valida `teaching-context.md` por curso |
| `workbook-generate` | Sistema de diseño de workbooks interactivos — text classes → explainer HTML standalone, accesible y navegable (modelo Rise); voice-neutral, el consumidor aporta brand tokens |
| `slides-generate` | Sistema de slides — tipos, accent rules, tipografía, anti-patterns |
| `piber-narrative-architect` | Narrativa PIBER (Problem, Insight, Big Idea, Execution, Results) — construcción, compresión, transposición y auditoría de argumentos; gate mecánico en `scripts/piber_gate.py` |

### Reference skills (sin comando — canon metodológico)

| Skill | Rol |
|---|---|
| `blooms-taxonomy` | Builder's Bloom's — scaffolding cognitivo para objetivos y progresión |
| `ship-first-design` | Backward design para builders — alineación assessment↔ship milestone |
| `learning-evaluation` | Medir si los cursos funcionan — surveys, métricas, retención, rúbricas |
| `research-methodology` | Estándares de source quality, formatos de artefacto y framework extraction |

## Agents (20)

| Agent | Purpose |
|---|---|
| `business-context-detector` | Detecta organization, brand_voice, values, industry desde BMT/SRD; fallback a diálogo |
| `learner-profile-builder` | Construye o importa persona desde SRD, BMT, ux-research o cursos previos; fallback Lean UX 4-quadrant |
| `session-type-detector` | Detecta coach/mentor/tutor desde el contexto (Irby 2018) con confidence; el skill confirma |
| `content-architect` | Diseña estructuras completas de curso y módulo alineadas a track, prerequisites y certification paths |
| `content-reviewer` | Revisa contenido contra filosofía, quality standards y detección de anti-patterns |
| `text-class-writer` | Escribe text classes — el contenido de enseñanza primario, principles-based |
| `challenge-designer` | Diseña deliverables BUILD (challenges) tangibles y shippables con success criteria claros |
| `quiz-generator` | Genera quizzes de módulo desde text classes, scenario-based en tres tiers de dificultad |
| `framework-extractor` | Extrae frameworks nombrados y enseñables de artefactos de research (decision trees, mental models, matrices) |
| `research-agent` | Deep-dive en topics/frameworks/stacks — fetch docs, arquitectura, terminología, artefactos de research |
| `repo-analyzer` | Analiza repos de referencia — mapea arquitectura, extrae patterns y templates reusables |
| `student-perspective` | Role-play del alumno target — confusión, aburrimiento, motivación, time estimates, completion likelihood |
| `course-visualizer` | Genera `course.html` standalone (sin CDN, vanilla JS) componiendo templates de `visualization/` |
| `workbook-module-composer` | Compone UN módulo de un workbook en un fragmento HTML self-contained + manifest, para el fan-out de `workbook-generate` (DOJ-4835); voice-neutral (Sonnet) |
| `slides-renderer` | Genera Marp decks por lección desde `course.json` + `marp-lesson.md.tmpl` vía marp-cli |
| `cmi5-metadata-writer` | Valida/completa metadata cmi5 (IDs estables, masteryScore, moveOn…); aborta si cambia un ID inmutable |
| `changelog-generator` | Diffea dos `course.json`, clasifica semver, genera CHANGELOG + version_timeline; flagea impacto si MAJOR |
| `proofreader` | Revisa gramática, puntuación y calidad de quiz — pasada editorial antes de traducir |
| `translator` | Traduce contenido a Español LATAM end-to-end preservando estructura, tono y precisión técnica |
| `translation-reviewer` | Revisa traducciones por integridad pedagógica, tono, terminología y corrección de quiz |

## Paths & credentials

`/new-path` (DOJ-4431) diseña una **Path**: una super-estructura **por encima** de
la capa cmi5-curso que agrupa cursos existentes en **milestones ordenados** y los
envuelve en una **credential OpenBadge 3.0**. Es puramente **aditivo** — no agrega
ningún AU ni block, y **no modifica ningún `course.json`**.

- Fuente de verdad: `path.json`, validado contra
  `assets/schemas/path.schema.json`.
- Output: `content/paths/<slug>/path-overview.md` (frontmatter alineado con el
  contrato de contenido de `chimera-academy`).
- Identidad xAPI aditiva (sin colisión con las IRIs de curso): la path es
  `path:<slug>`, cada milestone es `path:<slug>/milestone:<ordinal>`.
- La credential es un achievement OpenBadge 3.0 (`credential.cert_name` /
  `skills_demonstrated` / `earning_criteria` semillan el template).
- `meta.id` y `milestones[].id` son **inmutables** una vez creados — cambiarlos
  rompe el historial xAPI y la emisión de OpenBadge.

## Base + Overlay pattern

El toolkit es **multi-tenant** por diseño: la base ship pedagogía e invariantes
cmi5/xAPI, y cada plugin consumidor aporta su voz editorial vía **overlays** que se
descubren y aplican en runtime. El runtime es Claude leyendo
`assets/runtime/overlay-protocol.md` desde un hand-off de SKILL.md (no hay runtime
compilado).

Tres capas (DOJ-3707):

| Capa | Owner | Regla de overlay |
|---|---|---|
| **L1 — Invariantes estándar** | Base IDT (siempre) | Nunca overridable; el validator aborta si un overlay las muta |
| **L2 — Pedagogía genérica** | Base IDT (siempre) | Los overlays pueden extender/anotar; una contradicción loguea warning pero no aborta |
| **L3 — Voz editorial** | Overlays de consumidores (opt-in) | Vive solo como overlay; la base IDT tiene cero contenido L3 |

Los overlays se ordenan por `overlay_priority` ascendente (menor → aplicado
primero). Tiers por defecto según `kind`:

| Kind | Prioridad | Cuándo corre |
|---|---|---|
| Structural | `50` | Reshape del scaffold temprano — agrega secciones, marca campos load-bearing |
| Generic | `75` | Anota/extiende sin cambiar la voz — locale, accesibilidad, link-checking |
| Voice / editorial | `100` | Corre tarde, sobre el draft ya estructurado — voice transforms, frameworks nombrados |

Referencias: runtime en `assets/runtime/overlay-protocol.md`, schema en
`assets/schemas/overlay-protocol.schema.json`, contrato en
`openspec/changes/2026-05-base-overlay-pattern/design.md`.

## Output

El toolkit escribe a **dos árboles** según el comando (ver "Commands"):

### `docs/instructional-design/` — core v1 (cursos y session plans)

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
│           ├── au-01/index.html   (Marp + xapi-wrapper.js)
│           └── course-package.zip
└── session-plans/
    └── <session-slug>/
        ├── session-plan.json
        └── session-plan.md
```

### `content/` — authoring de contenido (migrados de chimera-academy)

```
content/
├── courses/
│   └── <course-slug>/
│       ├── module-NN/
│       │   └── classes/*.md        (text classes, video scripts, quizzes, challenges)
│       ├── workbook.html           (/workbook-generate — explainer interactivo standalone)
│       ├── <video>/storyboard.*    (/new-storyboard — tabla + JSON sidecar A-ROLL/B-ROLL)
│       ├── audits/qa-<env>-*.md    (/course-qa — QA de release del curso vivo, PASS/FAIL)
│       └── es/                     (traducciones — /translate-content, /translate-content-gemini)
├── paths/
│   └── <slug>/
│       └── path-overview.md        (/new-path — frontmatter + credential OpenBadge)
├── tracks/                         (/new-track — track overviews)
└── _templates/                     (challenge, quiz, slides… templates de contenido)
```

## Arquitectura

```
Diálogo guiado → course.json (truth) → course.md (read) + course.html (visualize)
                                     → lessons/*.md + .html (Marp slides)
                                     → (v2) dist/*.zip (cmi5 package)

Contenido (content/): módulos → text classes + video scripts + quizzes + challenges
                              → workbooks HTML + storyboards de video
                              → paths (milestones + OpenBadge) + tracks + traducciones

Base + Overlay: base ship L1+L2 → overlays de consumidores aplican L3 en runtime

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

34 commands + 21 skills + 20 agents + 8 schemas (4 core: `course`,
`session-plan-core`, `path` 🆕, `overlay-protocol` 🆕 + 4 profiles) + 11 templates
(5 `.tmpl` + 5 visualization HTML + 1 workbook HTML) + 11 adapter docs + 10 reference
docs. Scripts de soporte: `validate_workbook.py` (`/workbook-generate`) y
`gemini-translate.sh` (worker liteLLM de `/translate-content-gemini`).

Ya están shipped: el **overlay protocol** (Base + Overlay pattern), **`/new-path`**
(Paths + credential OpenBadge 3.0), **`/workbook-generate`** (workbooks interactivos,
DOJ-4835), **`/new-storyboard`** (storyboards de video), **`/translate-content-gemini`**
(traducción masiva cost-optimized) y **`/course-qa`** (QA de release del curso vivo,
PASS/FAIL, complementa `/course-audit`).

### v2 (deferred)

- `/course-package` — empaqueta cmi5 .zip con `xapi-wrapper.js` (~80-100 LOC,
  emite los 9 verbos cmi5).
- Adapters API-based: siguen siendo stubs documentados (los 11 docs viven en
  `references/adapters/`) — Ralph, SCORM Cloud, Learning Locker, Tally API,
  Typeform API, Articulate Reach 360 API.
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
- Linear: [DOJ-3270 epic](https://linear.app/chimera-coding/issue/DOJ-3270) — 11
  implementation children DOJ-3271 (T01) → DOJ-3281 (T11).
- Spike relacionado: [DOJ-2573](https://linear.app/chimera-coding/issue/DOJ-2573) —
  Custom LRS xAPI nativo en Supabase (target Pathways).

## License

[BSL-1.1](./LICENSE) — Business Source License 1.1.
