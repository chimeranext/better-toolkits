---
name: new-course
version: 1.0.0
description: >
  Diálogo guiado para diseñar un curso completo con CONTEXT→CONCEPT→BUILD→SHIP→REFLECT,
  Builder's Bloom's progression, Ship-First Design, cmi5-ready metadata y
  Kirkpatrick L1 feedback forms embedded por módulo.
  Use when user asks to "create a course", "design a course", "new course",
  "crear un curso", "diseñar un curso", "nuevo curso", "syllabus", "course structure",
  "armar un curso", "diseñar contenido educativo", "/new-course".
---

# Taller de Diseño de Curso

Diálogo guiado interactivo para diseñar cursos con rigor pedagógico y output
cmi5-compliant. Produce `course.json` (fuente de verdad) + `course.md` (syllabus
denso para humanos).

## Regla de idioma

Todo el contenido generado en **español**. Términos técnicos de instructional design
en formato **"español (English)"** la primera vez que aparecen
(*"Mapa de Progresión de Bloom (Bloom's Progression)"*, *"Hito de Entrega
(Ship Milestone)"*, *"Momento de Verdad (Moment of Truth)"*). Después solo español.
Nombres propios de frameworks y libros mantienen su idioma original (SAM, cmi5,
Kirkpatrick, Ralph LRS, Marp, Atomic Habits).

## Directorio de salida

`docs/instructional-design/courses/{slug-del-curso}/` — contiene `course.json`,
`course.md`, eventualmente `CHANGELOG.md` (creado en PATCH+ via `/course-revise`),
`audits/`, `retros/`, `lessons/` (Marp).

## Estilo de preguntas

Una pregunta a la vez. Opción múltiple cuando sea posible. Esperar respuesta antes
de avanzar.

## Puerta obligatoria

NO generar ningún artefacto hasta que cada paso esté completo Y aprobado por el
usuario. Si el usuario pide saltar un paso, advertir el riesgo (hiring test débil,
Bloom's flat, etc.) antes de proceder.

---

## Paso 0 — Detectar Modo Revise (Optional)

Si `$ARGUMENTS` no está vacío:

1. Buscar `docs/instructional-design/courses/{$ARGUMENTS}/course.json`.
2. Si existe: sugerir
   > "Ya existe un curso `{$ARGUMENTS}`. Para iterar usá `/course-revise {$ARGUMENTS}`.
   > Si querés crear uno nuevo, dame un slug distinto."
   ABORT.
3. Si no existe: continuar al Paso 1 con el slug pre-poblado.

---

## Paso 1 — Detectar Contexto (Context Detection)

### 1a. Business Context

Leer `${CLAUDE_PLUGIN_ROOT}/agents/business-context-detector.md` y despachar el agent.

Evaluar el resultado:

- **FOUND_BUSINESS / FOUND_BUSINESS_MODEL / FOUND_SRD**: Presentar contexto al usuario:

  > "Detecté contexto de negocio en `[source_file]`:
  >
  > Organization: [organization]
  > Brand voice: [brand_voice]
  > Values: [values]
  > Industry: [industry]
  >
  > ¿Usar este contexto?
  > 1. Sí, usar tal cual
  > 2. Sí, pero ajustar [campos]
  > 3. No, para este curso es distinto"

- **NOT_FOUND**: Diálogo fallback (4 preguntas, una a la vez):
  1. "¿Para qué organización es este curso? (escribí 'personal' si no aplica)"
  2. "En una frase, ¿cuál es el tono o brand voice?"
  3. "¿Cuáles son los 2-3 valores core?"
  4. "¿En qué industria opera?"

### 1b. Learner Profile

Leer `${CLAUDE_PLUGIN_ROOT}/agents/learner-profile-builder.md` y despachar.

Evaluar el resultado:

- **FOUND_SRD / FOUND_BMT / FOUND_MAP / FOUND_COURSE**: Presentar persona:

  > "Encontré un learner profile en `[source]`:
  >
  > **[name]**
  > Primary pain: [primary_pain]
  > Entry skills: [entry_skills]
  > Context: [context]
  >
  > ¿Es este el alumno objetivo?
  > 1. Sí
  > 2. Modificar
  > 3. Crear uno nuevo"

- **CREATE_PROTO_PERSONA**: Ejecutar 4-quadrant Lean UX dialogue (una pregunta por
  quadrant a la vez, ver agent doc para detalle).

  El proto-persona resultante lleva `_hypothesis_flag: true`.

**PUERTA DE APROBACIÓN**: confirmar business_context + learner_profile antes de
continuar.

---

## Paso 2 — Capstone Ship-First

Leer `${CLAUDE_PLUGIN_ROOT}/assets/skill-references/ship-first-design.md`.

Explicar al usuario:

> "Vamos a diseñar el curso al revés (backward design). Empezamos por el **Hito de
> Entrega Final (Capstone)** — el artefacto que el alumno shippea al terminar.
> Esto ancla todas las decisiones siguientes."

Preguntar (una a la vez):

1. "¿Qué querés que el alumno shippee al final del curso? (artefacto concreto, no
   capacidad abstracta)"

2. "¿Cuál es el deliverable concreto que vas a poder mirar y decir 'sí, lo logró'?
   (URL, repo, documento, app deployed, hardware funcionando, etc.)"

3. "Dame 3-5 criterios de evaluación medibles. Formato: 'X funciona', 'Y pasa este
   test', 'Z genera este output'. Cada uno debe ser binario verificable."

   Para cada criterio, asignar id estable (`crit:slug-corto`).

4. **Hiring test obligatorio**: "¿Contratarías a alguien que produjo este capstone?
   Dame tu lectura honesta. Si dudás, el capstone está blando — rediseñalo antes
   de seguir."

   Respuestas aceptables:
   - "Sí, absolutamente — es nivel mid/junior contratable"
   - "Sí con condiciones" + las condiciones
   - "Borderline" — STOP y push para fortalecer
   - "No" — STOP y rediseñar

**PUERTA DE APROBACIÓN**: confirmar capstone (id, title, deliverable, criteria,
hiring test response) antes de continuar.

---

## Paso 3 — Module Map + Bloom's Ramp

Leer `${CLAUDE_PLUGIN_ROOT}/assets/skill-references/blooms-taxonomy.md`.

Preguntar:

1. "¿Cuántos módulos planeás? (típico 8-12 para cursos de 30-50h, 4-6 para cursos
   cortos de 10-15h)"

2. "¿Tenés fuentes de inspiración? (otros cursos, libros, repos open source, papers).
   Si sí, mencionalos para basar la ramp en evidencia."

Basándose en capstone + sources, **proponer una ramp tentativa**. Ejemplo:

```
Módulo 0 — Setup                     → Recognize    (2h)
Módulo 1 — Fundamentos               → Recognize    (3h)
Módulo 2 — Componentes básicos       → Explain      (4h)
Módulo 3 — Construir feature         → Build        (5h)
Módulo 4 — Persistencia + estado     → Build        (5h)
Módulo 5 — Debugging avanzado        → Debug        (4h)
Módulo 6 — Trade-offs arquitectónicos → Decide      (4h)
Módulo 7 — Deploy + observabilidad   → Ship         (4h)
Módulo 8 — Capstone                  → Ship         (8h)
```

Para cada módulo, preguntar (uno a la vez):

a. "Título del módulo:"
b. "Philosophy quote — 1 frase ethos del módulo (ej. 'Un buen test es la primera línea de docs'):"
c. "Bloom level (Recognize / Explain / Build / Debug / Decide / Ship):"
d. "Estimated hours (2-5 típico):"
e. "Ship milestone — qué shippea el alumno al terminar este módulo (concreto):"

Asignar `id` estable (`module:slug`) y `au_id` (`au:slug-001`) — el agent
`cmi5-metadata-writer` los completa si los dejo vacíos.

Iterar hasta que el usuario apruebe la ramp completa.

**Validación**:
- Bloom's progression debe climb (Recognize → Ship). Flag si hay regression.
- Ship milestones deben escalar: commit local → push → deploy staging → prod →
  capstone público. Flag si están todos en el mismo nivel.

**PUERTA DE APROBACIÓN**: confirmar module map + Bloom's ramp + ship milestones.

---

## Paso 4 — Lesson Drill-down (CONTEXT→CONCEPT→BUILD→SHIP→REFLECT)

Leer `${CLAUDE_PLUGIN_ROOT}/references/methodology.md` (sección fórmula
CONTEXT→CONCEPT→BUILD→SHIP→REFLECT).

Para cada módulo (uno a la vez), preguntar:

> "Vamos al Módulo {N}: {title}. ¿Cuántas lecciones tiene? (4-7 típico, máximo 9)"

Para cada lección dentro del módulo (una a la vez), preguntar las 5 secciones de
la fórmula. **Crítico**: respetar la regla Load-Bearing (la lección enseña el
concepto en CONCEPT; BUILD aplica con Claude como partner, no como profesor).

a. "**Título de la lección:**"

b. "**CONTEXT** — vivid hook, 100-200 palabras. ¿Cuál es la escena que hace al
   alumno FEEL la urgencia? NO arrancar con 'En la lección anterior...'. NO arrancar
   con teoría. Arrancar con un escenario que el alumno reconozca."

c. "**CONCEPT** — el mental model, 300-500 palabras. ¿Cuál es el concepto core?
   Tablas, frameworks, worked examples, código anotado. La lección **enseña
   directamente** acá. Si necesitás múltiples slides Marp, separá el texto con
   `\n---\n` (cada `---` es nuevo slide)."

d. "**BUILD** — 50-60% del contenido. ¿Qué ejercicio aplica el concepto con Claude
   como partner? Importante: Claude NO es el profesor (eso ya lo hizo CONCEPT).
   Claude es el partner que el alumno usa para experimentar. Bold inline labels
   para los pasos, no sub-headers rígidos. NUNCA escribir 'Pedile a Claude que te
   explique X' — eso es el anti-pattern Prompt Outsourcer."

e. "**SHIP** — deliverable concreto, 50-100 palabras. ¿Qué guarda/crea/deployea/
   commitea/comparte? Debe ser tangible y verificable (no 'reflexioná sobre…')."

f. "**REFLECT** — 1-2 preguntas provocativas específicas a ESTA lección. NUNCA
   genéricas tipo '¿qué aprendiste?'. Deben referenciar el contenido específico:
   '¿Cuál de las warnings de flutter doctor te tentó posponer que después te daría
   problema en producción?'"

g. "**Estimated minutes** (15-60 típico):"

Asignar `id` estable (`lesson:slug`).

**Validación**:
- CONTEXT ≥ 100 chars (warn si menos).
- CONCEPT ≥ 200 chars (warn si menos).
- BUILD ≥ 200 chars Y representa 50-60% del total (warn si proporciones raras).
- SHIP ≥ 30 chars.
- REFLECT al menos 1 pregunta no-genérica.

**PUERTA DE APROBACIÓN** (por módulo): confirmar todas las lessons del módulo antes
de pasar al siguiente.

---

## Paso 5 — Assessment Design

Para cada módulo:

1. "¿Este módulo tiene **quiz** (assessment)? (Sí/No)"
   - Si Sí: "Passing score (default 0.75 = 75%)? ¿Cuántas preguntas aproximadamente?"
   - Si Sí: asignar `id` (`quiz:slug`) — preguntas concretas se diseñan después.

2. "¿Este módulo tiene **challenge** (build deliverable)? (Sí/No)"
   - Si Sí: "Dame los criterios de evaluación del challenge (3-5)."
   - Si Sí: asignar `id` (`chal:slug`).

3. "¿Este módulo tiene **video class**? (Sí/No)"
   - Si Sí: "Título + minutos estimados."
   - Si Sí: asignar `id` (`vid:slug`).

   Nota: el toolkit NO produce el video — solo registra metadata para que el LMS
   sepa que existe y traquee completion.

`cmi5-metadata-writer` (Paso 7) completa `classes_cmi5` defaults basándose en si
hay quiz o no.

**PUERTA DE APROBACIÓN**: confirmar assessments por módulo.

---

## Paso 6 — Kirkpatrick Feedback Forms (L1)

Leer `${CLAUDE_PLUGIN_ROOT}/references/kirkpatrick-feedback-tools.md`.

Explicar al usuario:

> "Los feedback forms al final de cada módulo son la fuente de Kirkpatrick L1
> (Reaction). Sin ellos perdemos la señal más fácil de iterar. Recomendación:
> Tally.so (free tier ilimitado) o Typeform (más bonito pero free tier limitado)."

Para cada módulo, preguntar:

1. "¿Tenés un form ya creado en Tally o Typeform para este módulo?"
   - **Sí**: "Dame `tool` (tally/typeform), `form_id`, y `embed_url`."
   - **No, crear ahora**: mostrar template de preguntas L1 sugerido (abajo) y
     pedir al usuario que cree el form en su tool, después volver con los datos.
   - **No, posponer**: marcar `feedback_form` como vacío en el JSON; flagear en
     `analysis.identified_risks`. `course-audit` después va a recordárselo.

Template L1 preguntas sugeridas:

```
1. ¿Qué tan útil fue este módulo? (Rating 1-5)
2. ¿Qué te llevás del módulo? (Short text)
3. ¿Qué te confundió o te frustró? (Short text)
4. Tiempo real vs estimado: (Multiple choice: menos / igual / más)
5. ¿Qué cambiarías de este módulo? (Optional, long text)
```

Hidden fields recomendados (pre-populated por URL params en el embed):
- `module_id` — para mapping en `/course-retro`.
- `learner_email` — para mapping cross-source con xAPI statements.

**PUERTA DE APROBACIÓN**: confirmar feedback_forms (incluyendo decisión de
posponer si aplica).

---

## Paso 7 — Generar JSON + MD + Validar cmi5

1. Construir el objeto `course.json` siguiendo `${CLAUDE_PLUGIN_ROOT}/assets/schemas/course.schema.json`.

2. Despachar `cmi5-metadata-writer` agent para validar IDs + completar defaults.
   Si aborta: revisar el error, corregir, re-correr. NO escribir hasta que pase.

3. Crear directorio `docs/instructional-design/courses/{slug}/`.

4. Escribir `course.json`.

5. Generar `course.md` aplicando el template
   `${CLAUDE_PLUGIN_ROOT}/assets/templates/course-overview.md.tmpl`. Sustituir todos
   los markers `{{course.field.path}}` con los valores reales.

6. Validar `course.json` con `ajv` si está disponible:

   ```bash
   ajv validate -s ${CLAUDE_PLUGIN_ROOT}/assets/schemas/course.schema.json -d docs/instructional-design/courses/{slug}/course.json --spec=draft2020 -c ajv-formats
   ```

   Si falla: report al usuario, NO marcar como done.

7. Presentar resumen:

   > "Curso generado en `docs/instructional-design/courses/{slug}/`:
   >
   > - **{N} módulos**, **{M} lecciones**, **{K} classes** (videos+quizzes+challenges)
   > - **Bloom's ramp**: {primer level} → {último level}
   > - **Estimated total**: {hours}h
   > - **Capstone**: {capstone.title}
   >
   > ✅ JSON válido contra schema cmi5
   > ✅ IDs estables asignados
   > ✅ Defaults cmi5 aplicados (masteryScore, moveOn, launchMethod)
   >
   > Próximos pasos sugeridos:
   > - `/course-audit {slug}` — validar contra framework completo
   > - `/course-visualize {slug}` — ver Bloom's curve + ship milestones en HTML
   > - `/slides-preview {slug}` — render slides Marp por lección
   > - `/course-revise {slug}` — cuando quieras iterar"

**PUERTA DE APROBACIÓN**: confirmar output con el usuario antes de cerrar el flow.

---

## Recursos

### Agentes
- `${CLAUDE_PLUGIN_ROOT}/agents/business-context-detector.md`
- `${CLAUDE_PLUGIN_ROOT}/agents/learner-profile-builder.md`
- `${CLAUDE_PLUGIN_ROOT}/agents/cmi5-metadata-writer.md`

### Referencias
- `${CLAUDE_PLUGIN_ROOT}/references/methodology.md`
- `${CLAUDE_PLUGIN_ROOT}/references/cmi5-packaging-guide.md`
- `${CLAUDE_PLUGIN_ROOT}/references/kirkpatrick-feedback-tools.md`
- `${CLAUDE_PLUGIN_ROOT}/assets/skill-references/blooms-taxonomy.md`
- `${CLAUDE_PLUGIN_ROOT}/assets/skill-references/ship-first-design.md`
- `${CLAUDE_PLUGIN_ROOT}/assets/skill-references/sam-methodology.md`

### Esquemas
- `${CLAUDE_PLUGIN_ROOT}/assets/schemas/course.schema.json`
- `${CLAUDE_PLUGIN_ROOT}/assets/schemas/profiles/course.profile.json`

### Templates
- `${CLAUDE_PLUGIN_ROOT}/assets/templates/course-overview.md.tmpl`

### Examples (referencia)
- `${CLAUDE_PLUGIN_ROOT}/examples/course-example.json`

## Principios clave

- **Una pregunta a la vez** — nunca abrumar.
- **Backward design** — capstone primero, luego assessments, luego contenido.
- **Hiring test no negociable** — capstones blandos no se aceptan.
- **Bloom's debe climb** — no estancarse 3+ módulos en mismo nivel.
- **Load-Bearing Rule** — CONCEPT enseña, BUILD aplica con Claude. NO confundir.
- **IDs son forever** — `cmi5-metadata-writer` valida; no cambiar IDs nunca.
- **Datos antes que visualización** — JSON es fuente de verdad, MD/HTML son derivados.
- **No fabricar** — si no tenés data para un campo (ej. feedback_form), marcalo
  como pendiente, no inventes URL.
