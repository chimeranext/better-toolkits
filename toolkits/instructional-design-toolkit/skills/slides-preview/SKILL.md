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
4. Despachar `${CLAUDE_PLUGIN_ROOT}/agents/slides-renderer.md` con:
   - course_json_path
   - module_order (opcional)
   - lesson_order (opcional)
5. El agent itera lessons, sustituye variables del template
   `${CLAUDE_PLUGIN_ROOT}/assets/templates/marp-lesson.md.tmpl`, escribe `.md`,
   ejecuta `marp ... --html -o ....html`.
6. Reportar paths generados al usuario:

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
- Marp docs: <https://marp.app>
