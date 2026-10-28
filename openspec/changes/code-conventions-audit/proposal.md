# Proposal — code-conventions-audit

Change ID: `code-conventions-audit`

## Why

Las convenciones de código (repo-health: schema-drift/contract-drift/DDD/arquitectura,
clean-code: PRDS/DSMS/IFS/CPS/BrS/QT4L, y los records de lenguaje: mensajes prescriptivos)
se enforcean hoy como **blockers** de pre-commit/CI. Eso impide auditar a futuro **quién
incumple más** y con qué tendencia: al bloquear, no queda registro acumulado del
incumplimiento, y la deuda de convenciones se vuelve invisible. Además, la auditoría está
fragmentada en varios comandos separados (`/audit`, `/clean-code-standards-audit`, sin
cobertura de los records de lenguaje).

Esta change unifica la auditoría de convenciones en un solo `code-conventions-audit`,
mueve el enforcement de **blocker a warn (no-block)**, y registra cada violación en un log
versionado `internal-audits` (archivos fechados YYYY-MM-DD, append-only) para auditar el
cumplimiento histórico.

## What Changes

- **Checks warn no-block**: los hooks pre-commit/CI de convenciones emiten `warn` (no
  bloquean el merge) y registran cada violación.
- **Registrador warn (make-no-mistakes)**: un registrador acumula las violaciones en un
  buffer local y las pushea en batch al repo de auditoría de la entidad.
- **Repo de auditoría — default por entidad, centralización opt-in**: por defecto cada
  venture/startup escribe a su propio `<org>/internal-audits`
  (`conventions/code-conventions-audit-YYYY-MM-DD.md`, append-only). La centralización en
  `chimeranext/internal-audits` solo ocurre si se configura explícitamente (`auditsRepo`
  opt-in, justificado por el shared services opinionated de ChimeraNext).
- **`/code-conventions-audit` (assurance-toolkit)**: comando que lee el log histórico del
  repo de auditoría de la entidad y produce un reporte de cumplimiento (sin ranking
  persistente; el log es el SSOT).
- **Fusión**: el comando agrega las 6 familias repo-health (vía audit-engine), los
  clean-code standards, y los records de lenguaje (`shared/references/conventions/language/*`).
- **GATES de records de lenguaje**: se actualizan para usar warn-no-block + registro en vez
  de block.

## Capabilities

### New Capabilities

- `shared/conventions-audit`: protocolo de auditoría unificada de convenciones — registro
  versionado en `internal-audits` (log fechado append-only), checks warn no-block,
  reporte de cumplimiento histórico.

### Modified Capabilities

- `assurance-governance` / `assurance-testing-audit`: se extienden para incluir el
  `code-conventions-audit` como audit de QA/gobernanza.
- records de lenguaje (`shared/references/conventions/language/*`): GATES pasan de block a
  warn + registro.

## Impact

- Afecta: `assurance-toolkit` (nuevo comando `code-conventions-audit`),
  `make-no-mistakes-toolkit` (registrador warn), `shared/references/conventions/language/*`
  (GATES), nuevo repo `chimeranext/internal-audits`.
- Sistemas: GitHub (repo privado internal-audits), hooks pre-commit/CI.
- Non-goals: ranking persistente (el log es el SSOT); migrar los audits existentes a otro
  repo; cambiar la taxonomía de convenciones.
- Éxito verificable: `openspec validate --change code-conventions-audit` pasa; el
  registrador escribe `internal-audits/conventions/code-conventions-audit-YYYY-MM-DD.md`;
  `/code-conventions-audit` lee el log y reporta; los checks emiten warn sin bloquear.
