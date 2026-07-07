# Dog-Fooding Notes — v1.0.0

**Date**: 2026-04-19
**Status**: v1 implementation complete (T01-T11). Ready for first cohort piloting.

## Implementation Status

| Task | Linear | Status | Files | PR |
|---|---|---|---|---|
| T01 — Plugin skeleton + manifests | legacy-ticket | ✅ Done | 6 | merged inline (no PR) |
| T02 — JSON schemas + examples | legacy-ticket | ✅ Done | 10 | #1 |
| T03 — Reference docs + skill-references | legacy-ticket | ✅ Done | 10 | #2 |
| T04 — Adapter interfaces + CSV + v2 stubs | legacy-ticket | ✅ Done | 11 | #3 |
| T05 — 7 specialized agents | legacy-ticket | ✅ Done | 7 | #4 |
| T06 — /new-course + skill + template | legacy-ticket | ✅ Done | 3 | #5 |
| T07 — 1-on-1 session plans (4 cmds + 4 skills + 3 templates) | legacy-ticket | ✅ Done | 11 | #6 |
| T08 — Audit commands + skills | legacy-ticket | ✅ Done | 4 | #7 |
| T09 — Visualize + slides + 6 templates | legacy-ticket | ✅ Done | 10 | #8 |
| T10 — Iteration commands (revise + retro + diff) | legacy-ticket | ✅ Done | 6 | #9 |
| T11 — README final + dog-fooding notes | legacy-ticket | ✅ Done | 2 | #10 |

**Total**: 80 archivos creados, ~5800 líneas de código/docs across 10 PRs.

## E2E Validation Status (deferred)

El plan original sugería correr el flow E2E completo con un curso real (Flutter
Full-Stack 2026) para validar v1. Sin embargo, este toolkit es ~95% archivos
markdown declarativos (commands, skills, agents, templates, references) — las
"validaciones" más útiles son:

### Validaciones automáticas ya hechas

- ✅ JSON Schema validation: los 4 examples (course-example.json + 3 session-plan
  examples) pasan `ajv validate` contra sus schemas correspondientes (ver T02 PR #1).
- ✅ JSON syntax: todos los archivos JSON pasan `python3 -m json.tool`.
- ✅ Plugin manifest: `plugin.json` y `marketplace.json` válidos.

### Validaciones que requieren ejecución real (post-install)

Estas requieren que el plugin esté instalado vía `claude plugins install
instructional-design-toolkit` y un usuario ejecute los comandos:

- [ ] `/new-course` produce JSON válido contra schema (acceptance: validar el
      output con ajv después).
- [ ] `/course-audit` detecta gaps esperados en cursos parciales.
- [ ] `/course-visualize` genera HTML que abre en Chrome sin errores JS console.
- [ ] `/slides-preview` con `marp-cli` instalado produce .md + .html.
- [ ] `/course-revise` MAJOR bump funciona (masteryScore 0.75 → 0.80) y aplica
      grandfather clause correctamente.
- [ ] `/course-retro` ingiere CSV mockeado y produce retro-report.md con
      Kirkpatrick L1-L4 mapping.
- [ ] `session-type-detector` agent diferencia coach/mentor/tutor desde signals
      reales en un proyecto.

**Plan**: ejecutar estas validaciones cuando el primer curso real (un dog-fooding
target externo, ej. el curso de Flutter de Andrés en su propio repo) se diseñe
con el toolkit. Documentar resultados en una sección extendida acá.

## Known limitations / acceptable for v1

1. **Marp theme customization por business_context**: actualmente usa Marp
   `default` theme. Para v1.1: agregar `assets/templates/marp-themes/` con themes
   por brand (chimera, generic).

2. **xAPI CSV format variability**: cada LRS exporta CSV con columnas distintas.
   El adapter v1 asume el formato canónico documentado. Para v1.1: agregar
   `/course-retro --validate-csv` para sanity check antes de ingestar.

3. **L3 + L4 Kirkpatrick**: requieren follow-up manual (survey 30d post-curso,
   capstone tracking en planilla). v2 podría agregar adapters API-based para Tally
   + Typeform que automaticen la recolección.

4. **HTML visualization markers**: los templates de visualization usan markers
   `<!-- {{...}} -->` que el agent course-visualizer sustituye en runtime. No
   hay template engine externo. Esto funciona pero está testeado solo
   manualmente — un test E2E con browser headless sería deseable para v2.

5. **Greptile/CodeRabbit configuration**: el repo se creó en GitHub pero el setup
   de bots de review está pendiente (pedido a @Daniel Bejarano en
   #doj-repo-health). Los 9 PRs de implementación se mergearon con `--admin`
   sin review automatizado. El repo es ~95% markdown así que el aporte de review
   automático es bajo, pero PRs futuros (especialmente cuando lleguen los HTML
   templates con JS o el v2 xapi-wrapper.js) deberían tener Greptile configurado.

## Next Steps

### Immediate (v1.0.0 → v1.0.1 patches)

- Esperar Greptile config + correr review retroactivo de los PRs ya merged.
- Recolectar feedback del primer dog-fooding real (curso de Flutter de Andrés en
  repo dedicado).
- Iterar templates de visualization si el HTML rendering tiene gaps.

### v1.1.0 (minor)

- Marp theme customization per `business_context.brand_voice`.
- `/course-retro --validate-csv` flag.
- Workshop + masterclass profiles para courses (más allá del default).
- Integración CI: GitHub Action que valide schemas + linkcheck en cada PR.

### v2.0.0 (major)

- `/course-package` command — produce paquete cmi5 `.zip` con `xapi-wrapper.js`
  embebido en cada AU launchable. Validar contra SCORM Cloud sandbox.
- Adapters API-based:
  - `xapi/ralph.md` → `xapi/ralph.ts`
  - `xapi/scorm-cloud.md` → `xapi/scorm-cloud.ts`
  - `feedback/tally-api.md` → `feedback/tally-api.ts`
  - `feedback/reach-360-api.md` → `feedback/reach-360-api.ts` (data liberation
    de Reach 360, referencia CIV-403)
- Skill `atomic-learning-habits` — guía explícita de cue/craving/response/reward
  per lesson; integrado al flow de `new-course` Paso 4.
- Cross-plugin auto-imports: si `srd-framework` está instalado, importar persona
  programáticamente sin diálogo.

## License compliance

- Plugin: BSL-1.1.
- Marp: MIT (uso vía CLI externo, no incluido).
- ajv: MIT (uso vía CLI externo, no incluido).
- All schema/template content: original work + adaptations from public methodology
  (SAM, Bloom's, Kirkpatrick — todos marcos públicos sin restricción de uso).

## Acknowledgments

- **Daniel Bejarano** — repo health setup (Greptile config pending).
- **Equipo Chimera Pathways** — context y direction sobre LRS target (Ralph
  self-hosted vía spike legacy-ticket).
- **Equipo Freedom Academy / DemoLab** — caso de referencia para SCORM 2004 →
  cmi5 migration path.
