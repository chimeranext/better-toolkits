---
name: new-path
version: 1.0.0
description: >
  Diálogo guiado para diseñar un Path — una super-estructura SOBRE la capa
  cmi5-curso que agrupa cursos existentes en milestones ordenados y los envuelve
  en una credential OpenBadge 3.0. NO modifica ningún course.json (aditivo).
  Produce path.json (fuente de verdad, validado contra path.schema.json) +
  content/paths/<slug>/path-overview.md (frontmatter alineado con el contrato
  chimera-academy). Use when user asks to "create a path", "design a path",
  "new path", "crear un path", "diseñar un path", "nuevo path", "ruta de
  aprendizaje", "learning path", "armar un path", "/new-path".
---

# Taller de Diseño de Path

Diálogo guiado interactivo para diseñar un **Path**: una super-estructura
**ABOVE the cmi5-course layer**. Un path referencia cursos existentes por id/slug,
los agrupa en **milestones** ordenados, y carga metadata de credential
(OpenBadge 3.0) + presentation.

**Invariante central — un path es puramente aditivo:** NO toca ningún
`course.json`. Los AUs cmi5, masteryScore, moveOn y xAPI IRIs de cada curso quedan
intactos. El path vive en su propia capa de identidad:

- path activity IRI       = `path:<slug>`
- milestone activity IRI  = `path:<slug>/milestone:<ordinal>`
- credential              = OpenBadge 3.0 (seeded desde `credential.*`), NO un AU.

Produce `path.json` (fuente de verdad) + `path-overview.md` (frontmatter para
humanos + ingestion chimera-academy).

## Regla de idioma

Todo el contenido generado en **español**. Términos técnicos en formato
**"español (English)"** la primera vez (*"Hito (Milestone)"*,
*"Credencial (Credential)"*). Después solo español. Nombres propios de
frameworks mantienen su idioma (cmi5, xAPI, OpenBadge, Chimera Score).

## Directorio de salida

`content/paths/{slug-del-path}/` — contiene `path.json`, `path-overview.md`,
eventualmente `CHANGELOG.md` (en revise).

## Estilo de preguntas

Una pregunta a la vez. Opción múltiple cuando sea posible. Esperar respuesta
antes de avanzar.

## Puerta obligatoria

NO generar ningún artefacto hasta que cada paso esté completo Y aprobado por el
usuario. Si el usuario pide saltar un paso, advertir el riesgo (milestone sin
cursos, credential sin earning criteria, ordinal gaps) antes de proceder.

---

## Paso 0 — Detectar Modo Revise (Optional)

Si `$ARGUMENTS` no está vacío:

1. Buscar `content/paths/{$ARGUMENTS}/path-overview.md` (o `path.json`).
2. Si existe: sugerir
   > "Ya existe un path `{$ARGUMENTS}`. Para iterar bumpeá versión + changelog.
   > Si querés crear uno nuevo, dame un slug distinto."
   ABORT.
3. Si no existe: continuar al Paso 1 con el slug pre-poblado.

---

## Paso 1 — Identidad del Path

Preguntar (una a la vez):

1. "¿Cuál es el **slug** del path? (`^[a-z0-9-]+$`, estable una vez publicado —
   se vuelve la xAPI IRI `path:<slug>`)."
2. "**Título** del path:"
3. "**Descripción** en 1-2 frases — ¿qué transforma este path en el alumno?"
4. "**Idioma** (es / en):"
5. "**Level** agregado del path (beginner / intermediate / advanced):"
6. "**Faculty** dueño (ej. 'Chimera Academy'):"
7. "**Emblem** — emoji/glyph para la credential cuando no hay imagen:"

Asignar `meta.id = path:<slug>` (IMMUTABLE) y `meta.version = 0.1.0` inicial.
`meta.status` default `draft`.

**PUERTA DE APROBACIÓN**: confirmar identidad antes de continuar.

---

## Paso 2 — Pick de Cursos Miembros

Explicar:

> "Un path NO crea cursos — referencia cursos que ya existen, por slug o por
> `course:<slug>` id. No vamos a tocar ningún `course.json`."

Preguntar:

1. "Listame los cursos miembros de este path, en orden de enseñanza. Cada uno por
   slug (ej. `flutter-fundamentals`) o por id (`course:flutter-fundamentals`)."

Si el repo consumidor tiene `content/courses/`, verificar que cada slug resuelva
a un directorio existente. Si alguno falta, advertir:

> "El curso `{slug}` no existe todavía en `content/courses/`. Podés crearlo con
> `/new-course {slug}` antes de publicar el path, o dejarlo referenciado como
> placeholder (el path queda en `draft`)."

NO crear ni modificar ningún curso.

**PUERTA DE APROBACIÓN**: confirmar la lista de cursos miembros.

---

## Paso 3 — Agrupar en Milestones

Explicar:

> "Los milestones son fases nombradas y ordenadas que agrupan los cursos. Cada
> milestone tiene su propia identidad xAPI (`path:<slug>/milestone:<ordinal>`)
> pero NO es un AU cmi5 — es agrupación + presentación."

Para cada milestone (uno a la vez), preguntar:

a. "**Título** del milestone:"
b. "**Descripción** (opcional) — qué desbloquea esta fase:"
c. "¿Qué cursos (de la lista del Paso 2) entran en este milestone, en orden?"

Asignar `ordinal` 1-based incremental y `id`:
- forma corta `milestone:<slug-corto>`, o
- forma calificada `path:<slug>/milestone:<ordinal>` (= la xAPI IRI). IMMUTABLE.

**Validación**:
- Cada curso del Paso 2 debe caer en exactamente un milestone (warn si un curso
  queda huérfano o duplicado).
- `ordinal` debe ser contiguo desde 1 (warn si hay gaps).
- Ningún milestone vacío (cada uno ≥ 1 curso).

**PUERTA DE APROBACIÓN**: confirmar el mapa de milestones.

---

## Paso 4 — Credential (OpenBadge 3.0)

Explicar:

> "La credential es la metadata OpenBadge 3.0 del path. NO es un AU cmi5 nuevo —
> es el achievement que el alumno gana al completar el path. Estos tres campos
> seedean el template OpenBadge."

Preguntar (una a la vez):

1. "**Cert name** — nombre de la credencial (ej. 'Agentic AI Engineer'):"
2. "**Skills demonstrated** — 3-6 skills nivel-path que el alumno demuestra
   (distintas de los tags por-curso):"
3. "**Earning criteria** — cómo se gana la credencial (bullet list verificable):"

**Validación**:
- `cert_name` presente si `status` será `published` (warn si vacío).
- Al menos 1 earning criterion (warn si vacío).

**PUERTA DE APROBACIÓN**: confirmar la credential.

---

## Paso 5 — Presentation

Preguntar:

1. "**Tech pills** — 3-4 tecnologías más reconocibles que enseña el path (para la
   path card):"
2. "**Reward points** — Chimera Score reward al completar (int ≥ 0):"
3. "**Credential badge URL** (opcional — overridea el emblem si está):"
4. "**Banner image URL** (opcional):"

**PUERTA DE APROBACIÓN**: confirmar presentation.

---

## Paso 6 — Generar JSON + MD + Validar

1. Construir el objeto `path.json` siguiendo
   `${CLAUDE_PLUGIN_ROOT}/assets/schemas/path.schema.json`.

   El objeto resultante es el **base draft (Layer 1 + Layer 2)** — cmi5/xAPI-safe
   (capa de identidad path aditiva, contrato de curso intacto), voice-neutral.

2. **Aplicar overlays (Base + Overlay protocol).** Antes de tocar disco, leer
   `${CLAUDE_PLUGIN_ROOT}/assets/runtime/overlay-protocol.md` y ejecutar el
   procedimiento completo (Discovery + Invocation + Layer 1 validator) sobre el
   base draft:

   - `command` = `"new-path"`
   - `cwd` = directorio donde se invocó `/new-path`
   - `baseDraft` = objeto `path.json`
   - `context.locale` = `path.meta.language` (`es` | `en`)

   Layer 1 invariants (`meta.id` = `path:<slug>`, `milestones[].id`, semver,
   identidad OpenBadge de la credential) se revalidan después de cada overlay. Si
   un overlay los muta: ABORT con error apuntando al `SKILL.md` ofensor. NO se
   escribe nada.

3. Crear directorio `content/paths/{slug}/`.

4. Escribir `path.json` (el draft final post-overlays).

5. Generar `path-overview.md` con frontmatter YAML que matchea el contrato
   chimera-academy `schemas/path.schema.yml`:

   ```yaml
   ---
   slug: { meta.slug }
   title: { meta.title }
   description: { meta.description }
   status: { meta.status }
   level: { meta.level }
   emblem: { meta.emblem }
   faculty: { meta.faculty }
   cert_name: { credential.cert_name }
   skills_demonstrated: { credential.skills_demonstrated }
   earning_criteria: { credential.earning_criteria }
   tech_pills: { presentation.tech_pills }
   reward_points: { presentation.reward_points }
   credential_badge_url: { presentation.credential_badge_url }
   banner_image_url: { presentation.banner_image_url }
   milestones:
     - title: { ... }
       description: { ... }
       courses: [ ... ]
   ---
   ```

   El cuerpo del MD resume el path para humanos (milestones + cursos en orden).
   NO incluir `meta.id` / `meta.version` en el frontmatter del MD — esos son
   campos de identidad cmi5 que solo viven en `path.json` (el YAML de chimera-academy
   los omite por contrato).

6. Validar `path.json` con `ajv` si está disponible:

   ```bash
   ajv validate -s ${CLAUDE_PLUGIN_ROOT}/assets/schemas/path.schema.json -d content/paths/{slug}/path.json --spec=draft2020 -c ajv-formats
   ```

   Si falla: report al usuario, NO marcar como done.

7. Presentar resumen:

   > "Path generado en `content/paths/{slug}/`:
   >
   > - **{N} milestones**, **{M} cursos** referenciados (sin modificar)
   > - **Credential**: {credential.cert_name} (OpenBadge 3.0)
   > - **Level**: {meta.level}  ·  **Reward**: {presentation.reward_points} pts
   > - **xAPI identity**: `path:{slug}` + milestones `path:{slug}/milestone:<n>`
   >
   > ✅ JSON válido contra path.schema.json
   > ✅ IDs estables asignados (meta.id, milestones[].id)
   > ✅ Contrato cmi5 por-curso INTACTO (ningún course.json tocado)
   > {Si overlays aplicados: bullet list de SKILL.md path que corrieron + warnings}
   >
   > Próximos pasos sugeridos:
   > - `/new-track {category}` — ver el catálogo + prerequisite graph
   > - `/new-course {slug}` — crear un curso miembro faltante"

**PUERTA DE APROBACIÓN**: confirmar output con el usuario antes de cerrar el flow.

---

## Recursos

### Esquemas
- `${CLAUDE_PLUGIN_ROOT}/assets/schemas/path.schema.json` — contrato de authoring del path
- `${CLAUDE_PLUGIN_ROOT}/assets/schemas/course.schema.json` — contrato cmi5 por-curso (NO se modifica)
- `${CLAUDE_PLUGIN_ROOT}/assets/schemas/overlay-protocol.schema.json` — contrato `OverlayInput`/`OverlayOutput` para el Paso 2 (Base + Overlay)

### Runtime
- `${CLAUDE_PLUGIN_ROOT}/assets/runtime/overlay-protocol.md` — discovery + invocation + Layer 1 invariant validator

## Principios clave

- **Aditivo, no destructivo** — un path NUNCA modifica un `course.json`.
- **IDs son forever** — `meta.id` (`path:<slug>`) y `milestones[].id` son inmutables.
- **Identidad xAPI propia** — `path:<slug>` + `path:<slug>/milestone:<n>`, sin colisión con IRIs de curso.
- **Credential = OpenBadge 3.0** — `credential.*` seedea el achievement template, NO un AU cmi5.
- **Consistencia con chimera-academy** — el frontmatter del MD matchea `schemas/path.schema.yml`; `path.json` agrega solo los campos de identidad cmi5.
- **Datos antes que visualización** — `path.json` es fuente de verdad, el MD es derivado.
- **No fabricar** — si un curso miembro no existe, marcarlo placeholder y mantener `draft`, no inventar.
