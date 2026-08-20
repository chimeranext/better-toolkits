---
name: slides-preview
version: 1.0.0
description: >
  Renderiza slides Marp por lección desde course.json. Produce .md (Marp source) +
  .html (rendered deck). Use when user asks to "preview slides", "see slides",
  "render Marp", "ver slides", "slides preview", "/slides-preview".
---

# Preview de Slides Marp

Convierte cada lección del course.json en un Marp deck standalone con estructura
CONTEXT → CONCEPT (N slides) → BUILD → SHIP → REFLECT.

## Prerequisito

`marp-cli` debe estar disponible globalmente. Si falta:

```
ERROR: marp-cli no encontrado. Instalalo con:

  npm install -g @marp-team/marp-cli

(o ver alternativas en https://marp.app)
```

ABORT si falta.

## Inputs

- `course-slug` (required, desde `$ARGUMENTS`).
- Optional filter: `module-N` (renderiza solo ese módulo), `lesson-N` (renderiza
  solo esa lesson — global N o "module-X.lesson-Y").

## Flujo

1. Verificar `course.json` existe.
2. Verificar `marp-cli` (abort si falta).
3. Parsear `$ARGUMENTS` para filtros opcionales.
4. **Aplicar overlays al deck (Base + Overlay protocol).** Antes de invocar al
   `slides-renderer`, leer `${CLAUDE_PLUGIN_ROOT}/assets/runtime/overlay-protocol.md`
   y ejecutar Discovery §2 + Invocation §3 + Layer 1 validator §5 sobre el
   payload de slides:

   - `command` = `"slides-preview"`
   - `cwd` = directorio de trabajo desde donde se invocó `/idt:slides-preview`
   - `baseDraft` = objeto con forma `{ course, lessons: [...] }` donde cada
     `lesson` ya está estructurada (CONTEXT/CONCEPT/BUILD/SHIP/REFLECT como
     bloques de texto, `marp_slide_count` calculado). Un overlay de voz puede
     reemplazar texto dentro de bloques (p.ej. "the learner will" → "you will
     ship") sin tocar `lesson.id`, `module.au_id`, ni `course.meta.id`. Un
     overlay estructural puede insertar slides adicionales (p.ej. una slide
     "BUILD section header" entre CONCEPT y BUILD).
   - `context.locale` derivado de `course.meta.language`.

   Reglas clave:

   - Layer 1 invariants (todos los IDs estables, `au_id`, semver) se
     revalidan después de cada overlay. Si un overlay los muta: ABORT con
     error apuntando al `SKILL.md` ofensor. NO se renderiza nada.
   - Si discovery devuelve cero overlays: el deck es voice-neutral
     cmi5-compliant. Ningún warning.
   - Warnings de overlays se acumulan y se presentan al final junto al
     listado de paths generados.

5. Despachar `${CLAUDE_PLUGIN_ROOT}/agents/slides-renderer.md` con:
   - course_json_path
   - module_order (opcional)
   - lesson_order (opcional)
   - overlaid_lessons (opcional) — el array de lessons post-overlay del paso 4
     si discovery encontró overlays. Sin este parámetro, el agent renderiza
     lessons del `course.json` tal cual.
6. El agent itera lessons (overlaid o base), sustituye variables del template
   `${CLAUDE_PLUGIN_ROOT}/assets/templates/marp-lesson.md.tmpl`, escribe `.md`,
   ejecuta `marp ... --html -o ....html`.
7. Reportar paths generados al usuario (incluyendo cualquier warning surgido
   de overlays en el paso 4):

   > "Slides renderizados:
   > - `lessons/lesson-01-{slug}.md` (Marp source)
   > - `lessons/lesson-01-{slug}.html` (deck preview)
   > - ...
   >
   > Abrí cualquier `.html` en Chrome para ver el deck. Para presentar:
   > `marp --preview lessons/lesson-01-*.md`."

## Sin gates

Idempotente con warning si sobrescribe.

## Recursos

- `${CLAUDE_PLUGIN_ROOT}/agents/slides-renderer.md`
- `${CLAUDE_PLUGIN_ROOT}/assets/templates/marp-lesson.md.tmpl`
- `${CLAUDE_PLUGIN_ROOT}/assets/schemas/overlay-protocol.schema.json` — contrato `OverlayInput`/`OverlayOutput` para el paso 4
- `${CLAUDE_PLUGIN_ROOT}/assets/runtime/overlay-protocol.md` — discovery + invocation + Layer 1 invariant validator
- Marp docs: <https://marp.app>
