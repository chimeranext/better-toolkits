---
description: "Genera course.html interactivo (Bloom's curve + ship milestones + complexity ramp + Kirkpatrick feedback embeds)"
argument-hint: "[course-slug]"
---

# /course-visualize

Invocar skill `instructional-design-toolkit:course-visualize` con `$ARGUMENTS` =
slug del curso.

## Output

`docs/instructional-design/courses/{slug}/course.html` — abrir en Chrome o Edge.

HTML standalone (sin CDN, sin framework). Renderiza:
- Header con metadata del curso
- Bloom's progression curve (SVG)
- Ship milestones timeline
- Complexity curve (line chart)
- CONTEXT→CONCEPT→BUILD→SHIP→REFLECT distribution per lesson (stacked bars)
- Kirkpatrick L1 feedback embeds (Tally/Typeform iframes)
