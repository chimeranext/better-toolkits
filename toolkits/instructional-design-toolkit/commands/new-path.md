---
description: "Diseño guiado de Path — super-estructura sobre la capa cmi5: agrupa cursos existentes en milestones ordenados y los envuelve en una credential OpenBadge 3.0. No modifica ningún course.json."
argument-hint: "[optional: path-slug si querés revisar/continuar uno existente]"
---

# /new-path — Diseño Guiado de Path

Dispatcher que invoca el skill `instructional-design-toolkit:new-path`.

Un **Path** es una **super-estructura ABOVE the cmi5-course layer**: referencia
cursos existentes por id/slug, los agrupa en **milestones** ordenados, y carga
metadata de credential + presentation. El contrato cmi5/xAPI por-curso queda
**INTACTO** — un path NO agrega ningún AU ni block; es puramente aditivo.

Si `$ARGUMENTS` matchea un path existente en
`content/paths/{slug}/path-overview.md`, el skill detecta el modo revise (sugiere
bumpear versión + changelog). Si vacío o slug nuevo, arranca diálogo guiado desde
cero.

## Qué hace (y qué NO hace)

- **Hace**: pickear cursos miembros (por slug), agruparlos en milestones nombrados
  y ordenados, autorear la credential (cert name, skills demonstrated, earning
  criteria = metadata OpenBadge 3.0), setear level / emblem / reward.
- **NO hace**: NO modifica ningún `course.json`. Los cursos se referencian por
  id/slug; sus AUs cmi5, masteryScore, moveOn y xAPI IRIs quedan tal cual. El path
  vive en una capa de identidad propia (`path:<slug>` + `path:<slug>/milestone:<n>`)
  que no colisiona con los IRIs de curso.

## Output esperado

```
content/paths/{slug}/
├── path.json          ← fuente de verdad (validado contra path.schema.json)
└── path-overview.md   ← frontmatter alineado con el contrato chimera-academy
                          (schemas/path.schema.yml)
```

`path.json` lleva los campos de identidad cmi5 (`meta.id` = `path:<slug>`,
`meta.version` semver) que el YAML de chimera-academy omite. El frontmatter de
`path-overview.md` usa exactamente el shape del contrato chimera-academy
(`slug` / `title` / `description` / `status` / `level` / `emblem` / `faculty` /
`cert_name` / `skills_demonstrated` / `earning_criteria` / `tech_pills` /
`reward_points` / `milestones[{title, description, courses[]}]`) para que
`bun run path:import` lo consuma sin branching.

## Próximos comandos sugeridos

- `/new-track {category}` — mapear el catálogo de cursos + prerequisite graph
- `/course-audit {slug}` — validar un curso miembro contra el framework
- `/new-course {slug}` — crear un curso miembro que todavía no existe

## Overlay invocation (post-base-draft)

Después de producir el base draft (Layer 1 cmi5/xAPI-shaped + Layer 2) de este
comando, seguir `${CLAUDE_PLUGIN_ROOT}/assets/runtime/overlay-protocol.md` para
descubrir y aplicar consumer overlays. El runtime camina
`<cwd>/.claude-plugin/plugin.json`, encuentra skills que declaran
`overlay_target: ["new-path"]` en su frontmatter, los ordena por
`overlay_priority`, y los aplica en orden.

Layer 1 invariants (`meta.id` = `path:<slug>`, `milestones[].id`, semver, la
identidad OpenBadge 3.0 de la credential) permanecen inmutables — outputs de
overlay que los muten abortan el run con un error que apunta al `SKILL.md`
ofensor. Layer 2 contradictions (milestones sin cursos, ordinal gaps, credential
sin earning criteria) loguean un warning visible pero no abortan. Discovery
devuelve cero overlays en un consumer sin `.claude-plugin/plugin.json` — el base
draft del path se escribe directo, voice-neutral, sin warning.
