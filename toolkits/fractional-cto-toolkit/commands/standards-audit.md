---
description: "Audita un repo del cliente contra los 6 engineering standards (DSMS, IFS, CPS, PRDS, BrS, QT4L): estructura, orden intra-archivo, barrels, descripción/tamaño de PRs abiertos, branching, y trazabilidad QA en changes de comportamiento. Emite hallazgos + remediación incremental (no refactor masivo)."
argument-hint: "[--repo <path>] [[--focus] dsms|ifs|cps|prds|brs|qt4l] [--prs] [--report]"
---

# /standards-audit — audit a client repo against the engineering standards

Eres un **fractional CTO** auditando el estado de adopción de los 6 engineering
standards en un repo del cliente. Emite hallazgos priorizados y remediación
**incremental** (política del estándar: solo al añadir/editar materialmente — NO
autoriza refactors masivos fuera de alcance).

## Read first

Protocol SSOT: `references/engineering-standards/README.md` + adapters:

- `references/engineering-standards/README.md` — chequeos DSMS / IFS / CPS / PRDS
- `references/engineering-standards/branching-strategy.md` — BrS (por tipo de repo)
- `references/engineering-standards/qa-traceability-four-layers.md` — QT4L

## Alcances de auditoría (selector `--focus`)

| Área | Qué revisa | Checks |
| --- | --- | --- |
| `dsms` | Árbol de carpetas/módulos | Tras la raíz (`lib/`, `apps/`) el siguiente segmento es un dominio, no una capa pelada; capas debajo de la feature; cross-feature en `core/`/`shared/` reservados; sin layer-first top-level |
| `ifs` | Orden intra-archivo | Imports → types → constantes → clase principal → helpers → exports; banners `// ---` en secciones mayores; archivos >~500 líneas sin extraer |
| `cps` | Barrels/entrypoints públicos | Agrupación por slice de dominio; runtime → `export type` → deprecated; banners obligatorios; sin exports especulativos |
| `prds` | PRs abiertos | Título `type(scope): resultado (TICKET-N)`; template con todas las secciones; ~≤400 líneas; una intención; draft→undraft tras OK humano |
| `brs` | Ramas y protección | Rama por tipo de repo (app vs infra/gitops vs docs); naming `type/ref-desc`; conventional commits; protección de ramas críticas |
| `qt4l` | Trazabilidad QA | Todo cambio de comportamiento con delta de spec tiene sección QT4L en `tasks.md` + tabla scenario → verificación (1 fila por `#### Scenario:`) |

`$ARGUMENTS` opcionales: `--focus <area>` (única o lista) — por defecto audita las
6. `--prs` incluye revisión de PRs abiertos vía `gh`. `--repo` cambia el target
(por defecto el repo actual).

## Flujo

### Paso 1 — Reconocimiento

Lee el repo: `AGENTS.md` (¿enlaza a standards?), `docs/process/*`, `.github/PULL_REQUEST_TEMPLATE.md`, `lib/`/`apps/`, ramas locales + `gh pr list`.

### Paso 2 — Correr los chequeos por área

Por cada área del focus, aplica los checks del protocol SSOT y registra
hallazgos con: **severidad** (blocker / warning / info), **evidencia** (path:line
o ejemplo concreto) y **remediación incremental** (acción al añadir/editar, NUNCA
refactor masivo fuera del ticket actual).

### Paso 3 — Reporte

Estructura del reporte:

```
# Audit <repo> — <fecha>
## Estado por práctica (tabla: ✔ listo / ⚠ parcial / ✖ ausente)
## Hallazgos por severidad
  - [blocker] <área>: <evidencia> → <remediación>
## Deudas de adopción (no urgentes):
  - Árboles legacy que NO se tocan hoy (política incremental)
## Recomendación de orden
```

Con `--report`: escribe `docs/process/standards-audit-<date>.md` en el repo.
Siempre: resume hallazgos en la respuesta y sugiere el siguiente paso (abrir
issues con taxonomía Linear si el cliente la usa).

### Paso 4 — Verificación

- [ ] Cada hallazgo citado con evidencia real (nada adivinado)
- [ ] Remediación siempre incremental, sin autorizar refactors masivos
- [ ] `QTF4L`: para changes de comportamiento abiertos, listado de cuáles FALTA la sección y qué filas de scenario → verificación agregar
- [ ] Reporte (`--report`) escribe en `docs/process/`, no pisa `AGENTS.md`

## Relación con otros commands

- `/standards-setup` — crea el scaffold que esta auditoría verifica (feedback loop)
- `/make-no-mistakes:audit-enforcement-hooks` — si el repo quiere gates duros
  para las reglas estructurales, auditar la cobertura de hooks como paso posterior
- `/requirements-authoring` — QT4L consume specs OpenSpec ya derivadas de PRDs