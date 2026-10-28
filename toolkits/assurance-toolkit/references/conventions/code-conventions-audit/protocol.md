# /code-conventions-audit — protocol SSOT

## Propósito

Reporte unificado de cumplimiento de convenciones de código: repo-health (6 familias) +
clean-code standards + records de lenguaje. Lee el log de auditoría de la entidad
(`internal-audits`) y produce compliance report. **Warn no-block** — nunca bloquea, solo
registra.

## Invariante

`code-conventions-audit` **no mergea** nada. Reporta desde el log. El log es el SSOT; el
ranking (si se pide) se deriva en la salida, no se persiste.

## Log de auditoría — ubicación (per-entity, centralización opt-in)

| Caso | Repo de auditoría |
|---|---|
| Default (toda entidad) | `<org>/internal-audits` — el org del repo auditado |
| Centralización opt-in | `auditsRepo` explícito (p.ej. `chimeranext/internal-audits`) — solo si la entidad adopta explícitamente el modelo de shared services (opinionated) |

Formato: `conventions/code-conventions-audit-YYYY-MM-DD.md` (append-only, filename ISO).

## Fuentes del reporte

1. **Repo-health (6 familias)**: detectores de `make-no-mistakes-toolkit/references/detectors/`
   (schema-drift, contract-drift, ddd-boundaries, explicit-architecture, strangler-fig,
   enforcement-hooks).
2. **Clean-code standards**: PRDS / DSMS / IFS / CPS / BrS / QT4L
   (`shared/references/engineering-standards/`).
3. **Language records**: `shared/references/conventions/language/*`.

## Flujo

1. Resolver el repo de auditoría (default `<org>/internal-audits`; `auditsRepo` si se
   configura).
2. Leer `conventions/code-conventions-audit-*.md` del log.
3. Agregar por convención y por autor (a partir del log fechado).
4. Producir el reporte de cumplimiento (sin ranking persistente).

## Warn no-block

Los checks de convención emiten `warn` y registran la violación en el log; no bloquean el
merge. El registrador (make-no-mistakes) acumula y pushea en batch.

## Fuera de alcance

- No mergea PRs.
- No persiste ranking (solo deriva en salida).
- No migra los audits existentes a otro repo.
