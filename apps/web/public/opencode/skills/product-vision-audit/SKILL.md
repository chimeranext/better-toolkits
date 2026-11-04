---
name: product-vision-audit
version: 1.0.0
description: >
  This skill should be used when the user asks to "product vision audit",
  "gap analysis PIBER", "IDCF audit", "auditar vision de producto",
  "gap analysis", "auditoria de producto", "vision vs implementation",
  "PIBER audit", "IDCF gap", "audit my module vs spike",
  "/product-vision-audit", or wants a structured comparison between a
  declared product vision (PIBER + IDCF spike) and the actual state of
  a codebase. Produces evidence-backed reports with Design Theses
  scoring, Capabilities status, Features tier analysis, anti-patterns
  detected, and prioritized recommendations.
---

# Product Vision Audit -- PIBER + IDCF Gap Analysis

Skill que ejecuta una **auditoria de alineacion** entre la vision estrategica de un producto (declarada en un spike PIBER + IDCF) y la **realidad implementada** en un codebase.

El output es un report markdown con evidencia concreta (paths + grep results), scoring por dimension, y recomendaciones priorizadas por impacto estrategico.

## Frameworks

### PIBER (narrativa externa)

| Letra | Significado | Uso en el audit |
|-------|-------------|-----------------|
| **P** | Problem | Contexto: verificar que el codebase apunta al problema declarado |
| **I** | Insight | Contexto: el "secreto" que justifica la existencia del producto |
| **B** | Big Idea | Contexto: la forma del producto en una frase |
| **E** | Execution | Parcialmente auditable: architecture + 3-layer map |
| **R** | Results | No auditable (metricas futuras), pero si **North Star** si aplica |

### IDCF (constitucion interna -- el core del audit)

| Letra | Significado | Auditable |
|-------|-------------|-----------|
| **I** | Insight | Sub-claims -- verificar si violaciones en codigo |
| **D** | Design Theses | SI -- los "musts" son testeables uno por uno |
| **C** | Capabilities | SI -- cada capability es un sistema/subsistema verificable |
| **F** | Features | SI -- features P0/P1/P2/P3 tienen implementacion observable |

**Regla jerarquica**: Feature -> Capability -> Design Thesis -> Insight. Si una feature existe pero no se traza a una thesis, es drift. Si una thesis existe pero no tiene capabilities que la soporten, es vapor.

## Flujo del audit

### Paso 1: Extraccion del spike

Si el input es Linear ID o URL:
1. Usar `mcp__linear-server__get_issue` con el ID.
2. El response puede ser grande (>30k chars). Si excede el limite del tool, usar el archivo en disco devuelto y slicing via Python (ver feedback general del sistema).
3. Extraer sections: `## P`, `## I`, `## B`, `## E`, `## R`, `## D -- Design Theses`, `## C -- Capabilities`, `## F -- Features`, y `Anti-patterns to kill` si existe.

Si el input es un archivo local:
1. `Read` directo.
2. Parsear las mismas secciones.

Si hay contenido en PIBER que sea **constitucionalmente inviolable** (marcado con `⚠️` en algunos spikes), destacarlo en la extraccion.

### Paso 2: Mapeo de la estructura del codebase

Antes de auditar:

1. `ls` en el root del codebase para entender layout.
2. Si existe `CLAUDE.md`, leerlo -- contiene convenciones, stack, rutas criticas.
3. Si existe `package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod` -- leer para entender dependencies.
4. Si existe `README.md`, skim primeras 100 lineas.
5. Si existe un directorio `docs/` o `srd/`, notar su presencia.

Este paso da contexto para interpretar la evidencia del Paso 3.

### Paso 3: Auditoria por dimension

Para cada **Design Thesis** (normalmente 5-7 musts):

1. **Extraer el verbo imperativo**: "Must verify externally", "Must execute via tool calls", etc.
2. **Traducir a busqueda**: que archivos/funciones/tablas deberian existir si la thesis se cumple? Que deberia NO existir?
3. **Ejecutar busqueda** con Grep/Glob:
   - Patterns positivos (lo que confirma la thesis).
   - Patterns negativos (lo que refuta -- anti-patterns).
4. **Asignar status**:
   - `OK` -- evidencia positiva clara + ninguna refutacion.
   - `PARTIAL` -- evidencia positiva parcial (ej: implementado para 3 de 5 modulos).
   - `MISSING` -- ninguna evidencia positiva, y el dominio claramente deberia tenerla.
   - `DRIFT` -- codigo contradice la thesis (ej: thesis dice "never auto-graded" y el codigo tiene auto-grading).
5. **Citar evidencia**: path:line o `Grep pattern=X path=Y -> N matches` o `Glob pattern=Z -> []`.

Para cada **Capability** (tabla del spike):

1. Normalizar el nombre (ej: "Agent orchestration" -> buscar "agent", "orchestrat", "router").
2. Buscar archivos que matcheen.
3. Verificar contra columnas del spike: `Build / Buy / Partner`, `Timeline`, `Priority`.
4. Status:
   - `OK` -- existe + esta en priority esperada.
   - `PARTIAL` -- existe pero en scope reducido.
   - `MISSING` -- no existe.
   - `WRONG TIER` -- existe pero en priority inesperada (ej: P2 shipped mientras P0 falta).

Para cada **Feature** (P0/P1/P2/P3):

1. Traducir feature a artefacto observable (ruta, componente, endpoint, tabla, job).
2. Chequear existencia.
3. Status: `SHIPPED / PARTIAL / MISSING`.
4. Si un P0 esta `MISSING` y un P2 esta `SHIPPED`, eso es prioridad invertida -- flaggear.

Para cada **Anti-pattern**:

1. Buscar explicitamente el patron prohibido.
2. Si se encuentra, es un `VIOLATION` de la thesis relacionada -- critico.

### Paso 4: North Star check

Si el spike define una metrica North Star (ej: WVSE, SEOD, WCC):

1. Buscar tablas, events, analytics que la midan.
2. Status: `INSTRUMENTED / PARTIAL / MISSING`.
3. Si esta `MISSING`, es un gap critico -- sin medicion, no se puede gobernar.

### Paso 5: Scoring global

Calcular un score global simple:

```
Design Theses:   X/N OK, Y/N PARTIAL, Z/N MISSING, W/N DRIFT
Capabilities:    X/N OK, ...
Features P0:     X/N SHIPPED, ...
Anti-patterns:   X violations detected
North Star:      INSTRUMENTED | PARTIAL | MISSING
```

**Alineacion global**:
- `FUERTE`: >80% OK en theses, 0 drift, 0 violations, North Star instrumented.
- `PARCIAL`: 50-80% OK en theses, 0-1 drift, 0 violations.
- `DEBIL`: <50% OK en theses, >=1 drift, o >=1 anti-pattern violation.
- `CRITICO`: >=1 violation de anti-pattern hard (⚠️) o >=2 drift sobre theses marcadas como killshots.

### Paso 6: Recommendations

Top 5 gaps ordenados por impacto estrategico (no effort). Para cada uno:

1. **Gap**: una linea describiendo la brecha.
2. **Evidencia**: path + linea o ausencia.
3. **Thesis/Capability/Feature afectada**.
4. **Next action**: accion concreta (ej: "Crear migracion `peer_verifications` con schema X", "Eliminar auto-grading fallback en `quiz.service.ts:142`").
5. **Owner sugerido**: si el spike declara owners (org table), usar; sino, dejar abierto.

Nunca estimar tiempo (ver feedback `no_time_estimates`). Siempre sequential ordering con milestones conceptuales.

## Template del report

```markdown
# Product Vision Audit -- {Module Name}

**Vision source**: {Spike ID} -- {Spike title}
**Codebase**: {absolute path}
**Scope**: {subdir or "full repo"}
**Fecha**: {YYYY-MM-DD}
**Auditor**: Claude Code (product-vision-audit skill)

---

## Resumen ejecutivo

**Alineacion global**: {FUERTE | PARCIAL | DEBIL | CRITICO}

{1 parrafo sintesis: que esta fuerte, que esta debil, cual es el riesgo principal}

### Scorecard

| Dimension | OK | PARTIAL | MISSING | DRIFT |
|-----------|----|----|---------|-------|
| Design Theses | X/N | X/N | X/N | X/N |
| Capabilities | X/N | X/N | X/N | - |
| Features P0 | X/N | X/N | X/N | - |
| Features P1 | X/N | X/N | X/N | - |
| Anti-patterns | - | - | - | X violations |
| North Star | {status} | | | |

---

## 1. PIBER alignment (contexto narrativo)

{Para cada seccion PIBER, 2-3 lineas evaluando si el codebase apunta al mismo problem/insight/big-idea. No scoring duro, solo nota cualitativa.}

---

## 2. IDCF matrix

### 2.1 Insight -- sub-claims

{Por cada sub-claim, status + evidencia.}

### 2.2 Design Theses

| # | Thesis | Status | Evidencia | Gap |
|---|--------|--------|-----------|-----|
| 1 | {thesis statement} | OK/PARTIAL/MISSING/DRIFT | {path:line or grep result} | {que falta} |

### 2.3 Capabilities

| Capability | Build/Buy/Partner | Status | Evidencia | Notas |
|------------|-------------------|--------|-----------|-------|
| {name} | {declared} | OK/PARTIAL/MISSING/WRONG TIER | {path} | {notes} |

### 2.4 Features by tier

**P0**
- [x] {feature} -- SHIPPED -- evidencia
- [ ] {feature} -- MISSING -- no se encontro en grep X ni Y

**P1** ... **P2** ... **P3**

### 2.5 Anti-patterns

| Anti-pattern declarado | Detectado? | Evidencia |
|------------------------|------------|-----------|
| {pattern} | NO | `Grep pattern=X -> 0 matches` |
| {pattern} | YES (VIOLATION) | `path:line` |

---

## 3. North Star instrumentation

**Metric**: {name} ({definition})

**Status**: {INSTRUMENTED / PARTIAL / MISSING}

**Evidencia**: {tablas, analytics events, dashboards encontrados}

---

## 4. Recommendations (top 5)

### Recommendation 1: {titulo}

- **Gap**: {una linea}
- **Evidencia**: {path + grep}
- **Thesis/Capability afectada**: {referencia}
- **Next action**: {accion concreta}
- **Owner sugerido**: {rol del spike org table}

{Repetir 5 veces, ordenadas por impacto estrategico descendente}

---

## Appendix A: Evidencia raw

{Comandos ejecutados y outputs relevantes para reproducibilidad}

## Appendix B: Archivos revisados

{Lista de paths principales revisados}
```

## Reglas de oro del audit

1. **Evidencia siempre** -- ninguna afirmacion sin path + grep/read. Si no se busco, no se puede concluir.
2. **No time estimates** -- nunca decir "2 sprints", "1 mes". Usar sequential ordering ("despues de X", "antes de Y").
3. **Strategic impact > effort** -- recommendations se ordenan por impacto a la vision, no por lo que es facil de arreglar.
4. **Multi-producto friendly** -- el skill esta pensado para auditar una plataforma con varios pilares (Learning Pathways, Agent/Assistant, etc.) pero debe funcionar para cualquier producto con un spike PIBER+IDCF.
5. **Respect the jerarquia** -- Feature -> Capability -> Thesis -> Insight. Si una feature existe sin thesis trazable, es drift reportable.
6. **Hard vs soft theses** -- theses marcadas con `⚠️` son killshots: violarlas es CRITICO, no solo WARN.
7. **Output determinista** -- el mismo spike + mismo codebase debe dar el mismo report. No especular.

## Output path convention

**Default**: `<codebase-root>/audits/<pillar-slug>/vision-audit-<YYYY-MM-DD>.md`

- El report vive **dentro del repo auditado**, en subcarpeta por pillar (ej: `pathways`, `agent-assistant`, `community`, `launchpad`, `hackathons`, `marketplace`, `score`).
- Si el directorio no existe, crearlo antes de escribir (`mkdir -p`).
- Pillar slug: si el invocador no lo paso explicitamente, inferir del titulo del spike (ej: `[Spike] Product Vision PIBER + IDCF -- Learning Pathways` -> `pathways`). Si la inferencia es ambigua, preguntar al usuario antes de escribir.
- Override: si el invocador paso `--out <path>` (o el equivalente en la skill-api), respetar literal. Expandir `~/` al home del usuario.

Esta convencion permite que `/prioritize` (make-no-mistakes-toolkit) encuentre los audits automaticamente al recibir `<pillar>` como argumento. No romper la convencion sin coordinar con ese comando.

## Interaccion con el usuario

El skill es **menos conversacional** que `problem-validation` o `solution-design` -- es mas parecido a `srd-analysis` en que ejecuta un analisis estructurado. Aun asi:

- Confirmar args al inicio (spike + codebase + pillar + scope + out).
- Mostrar progreso: "Extrayendo spike...", "Mapeando codebase...", "Auditando Design Theses (3/7)...".
- Al final, presentar el path del report y un TLDR de 3 lineas.
- Preguntar: "Queres que cree un issue de Linear por cada recommendation? (yes/no)" -- si yes, usar `mcp__linear-server__save_issue` para cada una bajo el project del modulo auditado.

## Fallbacks

Si el codebase es muy grande (>10k files):
- No grep-ear toda la raiz. Usar `--scope` para acotar.
- Si el usuario no paso scope, preguntar: "Codebase grande, cual es el subdirectorio principal del modulo a auditar?"

Si el spike no tiene seccion IDCF clara:
- Reportar que el spike no sigue el formato PIBER+IDCF esperado.
- Ofrecer: "Queres que haga solo un audit de PIBER alignment (mas narrativo, menos tecnico)?"

Si el codebase no tiene CLAUDE.md ni README.md:
- Inferir stack por `package.json` / `Cargo.toml` / etc.
- Notar en el report: "Codebase sin documentacion auto-descubrible -- evidencia limitada a grep."
