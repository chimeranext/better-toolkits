# Tasks — code-conventions-audit

## Fase 1 — Registrador warn + registro (make-no-mistakes)

- [x] T1: Implementar registrador warn en `make-no-mistakes-toolkit` que acumula
      violaciones y pushea batch al repo de auditoría de la entidad
      (`conventions/code-conventions-audit-YYYY-MM-DD.md`, append-only; default
      `<org>/internal-audits`, centralización opt-in vía `auditsRepo`).
      → `hooks/conventions/conventions-warn-recorder.sh`.
- [x] T2: Documentar el registrador (README) con la convención de filename ISO, append-only
      y la precedencia default-per-entidad / centralización opt-in.
      → `hooks/conventions/README.md`.

## Fase 2 — Comando /code-conventions-audit (assurance-toolkit)

- [x] T3: Crear comando `/code-conventions-audit` en `assurance-toolkit/commands/` que lee
      el log de `internal-audits` y produce reporte de cumplimiento.
      → `commands/code-conventions-audit.md`.
- [x] T4: Unificar en el comando: repo-health (6 familias vía audit-engine) + clean-code
      standards + records de lenguaje (`shared/references/conventions/language/*`).
      → en `commands/code-conventions-audit.md` + protocol.
- [x] T5: Documentar el comando con su flujo y salida (reporte por convención/autor, sin
      ranking persistente).
      → `references/conventions/code-conventions-audit/protocol.md`.

## Fase 3 — GATES de records de lenguaje

- [x] T6: Actualizar GATES de `shared/references/conventions/language/{rust,typescript,dart,php,elixir}`
      para usar warn-no-block + registro a `internal-audits` en vez de block.

## Fase 4 — Validación

- [x] T7: `openspec validate --change code-conventions-audit` pasa.
- [x] T8: Simular una violación → el registrador escribe el archivo fechado; el comando lo
      lee y reporta; los checks emiten warn sin bloquear.
      → verificado: `conventions-warn-recorder.sh rust/R9 src/auth.rs @lapc506` registra warn,
      no bloquea, y resuelve `chimeranext/internal-audits`.
