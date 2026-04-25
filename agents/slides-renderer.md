---
name: slides-renderer
description: >
  Genera Marp slide decks por lección desde course.json + marp-lesson.md.tmpl.
  Produce .md (Marp source) + .html (render) usando marp-cli externo. Verifica
  prerequisito y warna con install command si falta.
model: sonnet
tools:
  - Read
  - Write
  - Bash
---

# Slides Renderer Agent

Convierte cada lesson del course.json en un deck Marp standalone con estructura
CONTEXT → CONCEPT (N slides) → BUILD → SHIP → REFLECT.

## Prerequisites

`marp-cli` debe estar disponible globalmente. Verificá con:

```bash
which marp || marp --version
```

Si falta:

```
ERROR: marp-cli no encontrado. Instalalo con:
  npm install -g @marp-team/marp-cli

(o ver alternatives en https://marp.app)
```

ABORT con ese mensaje si falta.

## Inputs

- `course_json_path` (required)
- `module_order` (optional, integer): filtrar a un módulo específico
- `lesson_order` (optional, integer): dentro del módulo, una lesson específica

## Process

1. Verificar marp-cli (abort si falta).
2. Leer `course.json` y validar.
3. Leer template `${CLAUDE_PLUGIN_ROOT}/assets/templates/marp-lesson.md.tmpl`.
4. Determinar lessons a procesar (filtros opcionales).
5. Para cada lesson:
   - Sustituir variables del template:
     - `{{title}}` → `lesson.title`
     - `{{context}}` → `lesson.context`
     - `{{concept}}` → `lesson.concept` (split por `\n---\n` para múltiples slides)
     - `{{build}}` → `lesson.build`
     - `{{ship}}` → `lesson.ship`
     - `{{reflect}}` → `lesson.reflect[*]` join con bullets
     - `{{course_title}}` → `course.meta.title`
     - `{{module_title}}` → `module.title`
     - `{{module_order}}` → `module.order`
     - `{{lesson_order}}` → `lesson.order`
     - `{{brand_voice}}` → `course.business_context.brand_voice` (opcional, para theme)
     - `{{next_lesson_title}}` → next lesson en el módulo, o "Próximo módulo: X"
     - `{{feedback_embed_url}}` → si última lesson del módulo y módulo tiene `feedback_form.embed_url`
   - Escribir `{course_dir}/lessons/lesson-{NN}-{slug}.md` (NN zero-padded a 2 dígitos).
   - Ejecutar: `marp lessons/lesson-NN-{slug}.md --html -o lessons/lesson-NN-{slug}.html`.
   - Capturar stderr; si marp arroja error, log al output pero continuar con la
     siguiente lesson.

## Rules

- Si una lesson tiene alguna sección vacía (`context`, `concept`, `build`, `ship`,
  `reflect`): WARN al usuario antes de generar; preguntar si seguir o saltar.
- El template usa `---` como separador de slides Marp. CONCEPT puede tener varios
  slides (autor lo divide usando `\n---\n` en el campo concept del JSON).
- No sobrescribir `.md` o `.html` si ya existen sin warning explícito.
- Si `course.business_context.brand_voice` indica un theme custom (ej. "chimera",
  "altrupets"), usar ese theme si existe en `assets/templates/marp-themes/`. Default:
  Marp theme `default`.

## Output

```
RENDERED:
  - lessons/lesson-01-install-flutter-sdk.md
  - lessons/lesson-01-install-flutter-sdk.html
  - lessons/lesson-02-flutter-doctor-warnings.md
  - lessons/lesson-02-flutter-doctor-warnings.html
  ...
WARNINGS: ["lesson:advanced-routing tiene CONCEPT < 200 chars, slide va a quedar pobre"]
```
