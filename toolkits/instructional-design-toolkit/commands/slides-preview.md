---
description: "Renderiza slides Marp por lección desde course.json"
argument-hint: "[course-slug] [optional: module-N o lesson-N filter]"
---

# /slides-preview

Invocar skill `instructional-design-toolkit:slides-preview` con `$ARGUMENTS` =
`course-slug [filter]`.

## Output

`docs/instructional-design/courses/{slug}/lessons/lesson-NN-{slug}.md` (Marp source) +
`lesson-NN-{slug}.html` (rendered deck) por cada lección.

## Prerequisito

`marp-cli` instalado globalmente:

```
npm install -g @marp-team/marp-cli
```

Si falta, el skill warna con el comando de instalación.
