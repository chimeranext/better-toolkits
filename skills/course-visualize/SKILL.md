---
name: course-visualize
version: 1.0.0
description: >
  Genera HTML interactivo de un curso para validar Bloom's progression + ship
  milestones + complexity curve + CONTEXT→...→REFLECT distribution + Kirkpatrick
  feedback embeds. Use when user asks to "visualize course", "see course curve",
  "render course HTML", "visualizar curso", "ver Bloom's", "/course-visualize".
---

# Visualizar Curso

Genera `course.html` standalone (sin CDN, sin framework) que permite al diseñador
validar la ramp pedagógica en un pantallazo.

## Inputs

- `course-slug` (required, desde `$ARGUMENTS`).

## Flujo

1. Verificar que existe `docs/instructional-design/courses/{slug}/course.json`.
2. Despachar `${CLAUDE_PLUGIN_ROOT}/agents/course-visualizer.md` con el path
   absoluto al course.json.
3. El agent compone `course.html` desde los templates en
   `${CLAUDE_PLUGIN_ROOT}/assets/templates/visualization/`.
4. Mostrar al usuario el path generado + instrucciones para abrir:

   > "course.html generado en `docs/instructional-design/courses/{slug}/course.html`.
   > Abrilo en Chrome o Edge para ver:
   > - Bloom's progression curve
   > - Ship milestones timeline
   > - Complexity ramp
   > - CONTEXT→...→REFLECT distribution per lesson
   > - Kirkpatrick L1 feedback embeds (Tally/Typeform iframes per módulo)
   >
   > El HTML es standalone — podés abrir directo desde el filesystem o servir con
   > `python3 -m http.server` desde el course directory."

## Idempotencia

Sin gates. Sobrescribe `course.html` si ya existe.

## Recursos

- `${CLAUDE_PLUGIN_ROOT}/agents/course-visualizer.md`
- `${CLAUDE_PLUGIN_ROOT}/assets/templates/visualization/*.html`
