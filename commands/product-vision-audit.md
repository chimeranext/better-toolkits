---
description: "Gap analysis de un modulo de producto vs. su vision estrategica PIBER + IDCF. Audita codebase contra Design Theses, Capabilities y Features declarados en el spike de vision."
argument-hint: "<spike-id | path/to/spike.md> <path/to/codebase> [--pillar <slug>] [--scope <subdir>] [--out <path>]"
---

# /product-vision-audit -- Gap Analysis PIBER + IDCF

Ejecuta una auditoria estructurada que compara la **vision estrategica** de un producto (expresada en los frameworks PIBER + IDCF) contra la **realidad implementada** en un codebase.

## Frameworks base

- **PIBER**: Problem / Insight / Big Idea / Execution / Results -- narrativa externa (VCs, media, hires).
- **IDCF**: Insight / Design Theses / Capabilities / Features -- constitucion interna de producto (product, eng, org).

El audit se concentra en **IDCF** para el gap analysis tecnico, y usa **PIBER** como contexto narrativo para validar alineacion estrategica.

## Modo de invocacion

```bash
/business-model-toolkit:product-vision-audit ACME-101 ./acme-platform
# -> ./acme-platform/audits/pathways/vision-audit-2026-04-17.md

/business-model-toolkit:product-vision-audit ./vision-pathways.md ./acme-platform --scope src/app/pathways
# -> ./acme-platform/audits/pathways/vision-audit-2026-04-17.md

/business-model-toolkit:product-vision-audit ACME-102 ./acme-agent-plugin --pillar agent-assistant
# -> ./acme-agent-plugin/audits/agent-assistant/vision-audit-2026-04-17.md

/business-model-toolkit:product-vision-audit ACME-101 ./acme-platform --out /tmp/one-off-audit.md
# override explicito a path arbitrario
```

## Parsing de argumentos

1. **Primer argumento** (`<spike>`):
   - Si matchea patron `[A-Z]+-\d+` -> es un Linear issue ID, usar `mcp__linear-server__get_issue` para obtenerlo.
   - Si es un path a archivo `.md` existente -> leer con Read.
   - Si es URL de Linear (https://linear.app/.../issue/XXX-NNN/...) -> extraer ID y usar MCP.

2. **Segundo argumento** (`<codebase-path>`):
   - Path absoluto o relativo al repo/modulo a auditar.
   - Validar que existe con Bash `ls` antes de proceder.

3. **Flags opcionales**:
   - `--pillar <slug>`: slug kebab-case del pillar que se esta auditando (`pathways`, `agent-assistant`, `community`, `launchpad`, `hackathons`, `marketplace`, `score`, etc.). Si no se pasa, se infiere del titulo del spike (ej: `[Spike] Product Vision PIBER + IDCF -- Learning Pathways` -> `pathways`). Si la inferencia falla, preguntar al usuario antes de escribir el report.
   - `--scope <subdir>`: restringe la auditoria a un subdirectorio dentro del codebase (ej: `src/app/pathways`).
   - `--out <path>`: override explicito de la ruta de salida. Si el path empieza con `~/`, expandir al home del usuario.

## Convencion de output (default)

El report vive **dentro del repo auditado**, organizado por pillar:

```
<codebase-root>/audits/<pillar-slug>/vision-audit-<YYYY-MM-DD>.md
```

Razon de esta convencion:

- **Dentro del repo**: el audit es un artefacto del producto, no del auditor. Se versiona con el codigo que describe, entra en PRs, y cualquier colaborador del repo lo encuentra sin setup adicional.
- **Por pillar**: un repo puede contener multiples pillars (ej: `acme-platform` audita Pathways + Community + Launchpad separadamente). Subcarpeta por pillar evita colisiones y permite ver la evolucion de cada uno con `ls audits/<pillar>/`.
- **Fecha al final del filename**: ordena cronologicamente con `ls`, y el ultimo audit es facil de encontrar (`ls -t audits/<pillar>/ | head -1`).
- **Sin redundancia en el filename**: el pillar ya esta en el path de la subcarpeta; repetirlo en el filename es ruido.

Si el directorio `audits/<pillar-slug>/` no existe, crearlo antes de escribir. No crear `.gitkeep` ni `README` automaticamente dentro — solo el report.

Si `--out` esta presente, se respeta literalmente (escape hatch para audits one-off o destinos externos). Si `--out` no esta, se usa la convencion de arriba.

## Flujo del comando

Delega a la skill `product-vision-audit`. La skill se encarga de:

1. **Extraccion**: parsear el spike, aislar Design Theses (musts), Capabilities table, Features tiers.
2. **Dog-fooding opcional**: si el codebase tiene `CLAUDE.md`, leerlo para entender el stack y convenciones.
3. **Auditoria por dimension**:
   - Design Theses -> busqueda de evidencia afirmativa o refutatoria en el codigo.
   - Capabilities -> verificar existencia de archivos/rutas/endpoints/tablas por capability.
   - Features (P0/P1/P2/P3) -> chequear si cada feature tiene implementacion visible.
   - Anti-patterns -> buscar patrones prohibidos explicitos en el spike.
   - North Star metric -> verificar si hay instrumentacion (telemetry, analytics, DB) que la mida.
4. **Scoring**: cada dimension recibe `OK / PARTIAL / MISSING / DRIFT`.
5. **Recommendations**: ranking de gaps por impacto estrategico (no por effort).

## Regla de idioma

Report en **espanol**. Quotes del spike y nombres propios (PIBER, IDCF, North Star) quedan en original.

## Regla de evidencia

**Toda afirmacion en el report debe apuntar a evidencia concreta**:
- Path del archivo + numero de linea cuando aplica.
- Ausencia documentada con comando de busqueda ejecutado (`Grep pattern=X path=Y -> no matches`).
- Nunca afirmar "no esta implementado" sin haber buscado. Nunca afirmar "esta implementado" sin haber visto el codigo.

## Output del report

Default: `<codebase>/audits/<pillar-slug>/vision-audit-<YYYY-MM-DD>.md` (ver seccion "Convencion de output" arriba).

Estructura del report (ver skill para template completo):

1. Metadata (spike, codebase, fecha, auditor)
2. Resumen ejecutivo (1 parrafo + score global)
3. PIBER alignment (check narrativo)
4. IDCF matrix:
   - Design Theses table (thesis -> status -> evidencia -> gap)
   - Capabilities table (capability -> build/buy/partner status -> evidencia)
   - Features by tier (P0/P1/P2/P3 -> shipped/partial/missing)
5. Anti-patterns detected
6. North Star instrumentation check
7. Recommendations prioritizadas (top 5, con siguiente accion concreta)
8. Appendix: evidencia raw (grep outputs, file listings)

## Modo sin argumentos

Si el usuario invoca `/product-vision-audit` sin args, preguntar interactivamente:

1. "Cual es la vision a auditar? (Linear ID, URL, o path a .md)"
2. "Cual es el codebase a auditar? (path absoluto o relativo)"
3. "Cual es el slug del pillar? (enter para inferir del titulo del spike)"
4. "Queres restringir el scope a un subdirectorio? (enter para auditar todo)"
5. "Donde guardo el report? (enter para default: `<codebase>/audits/<pillar>/vision-audit-<fecha>.md`)"

Luego proceder como si los args hubieran sido pasados.

## Dog-fooding

Este comando esta pensado para auditar los pilares de una plataforma multi-producto contra sus spikes PIBER+IDCF maestros (ej: un spike raiz `ACME-100` con hijos `ACME-101` a `ACME-103`). Un flujo de audit tipico produce:

- `acme-platform` vs `ACME-101` (Learning Pathways) -> `acme-platform/audits/pathways/vision-audit-2026-04-17.md`
- `acme-agent-plugin` vs `ACME-102` (Agent/Assistant) -> `acme-agent-plugin/audits/agent-assistant/vision-audit-2026-04-17.md`

Estos reports sirven de referencia viva del formato esperado. `/prioritize` (del make-no-mistakes-toolkit) consume estos mismos paths por convencion.

Ver `${CLAUDE_PLUGIN_ROOT}/references/product-vision-audit-examples.md` si existe, para ejemplos de reports generados.
