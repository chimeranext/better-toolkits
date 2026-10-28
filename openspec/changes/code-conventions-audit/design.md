# Design — code-conventions-audit

## Contexto

Hoy las convenciones de código se enforcean como blockers. Esto impide auditar el
incumplimiento acumulado. Se une la auditoría en un solo `code-conventions-audit`, se pasa a
warn (no-block) y se registra en `internal-audits` (log fechado append-only).

## Decisiones

### D1: Warn no-block + registro, en vez de block

- **Por qué:** medir deuda requiere acumular incidentes; bloquear no deja registro.
- **Alternativa rechazada:** mantener block (no auditable).
- **Efecto:** los hooks emiten `warn` y registran; no frenan el merge.

### D2: Registro versionado — default por entidad, centralización opt-in

- **Por qué:** por defecto cada venture/startup/serial entrepreneur independiente escribe a su
  propio `<org>/internal-audits` (autonomía). La centralización en un repo compartido
  (p.ej. `chimeranext/internal-audits`) es opt-in: solo cuando una entidad adopta
  explícitamente el modelo de shared services — decisión opinionated del studio, no un
  requisito universal.
- **Formato:** `conventions/code-conventions-audit-YYYY-MM-DD.md`, append-only, filename ISO.
- **Mecanismo (precedencia):** 1) si `auditsRepo` explícito → usa ese (habilita
  centralización opt-in); 2) sino → default `<org>/internal-audits`.
- **Alternativa rechazada:** wiki de GitHub (no versionable con PRs); centralizar por default
  (impondría shared services a quien no lo adopta).

### D3: Sin ranking persistente

- **Por qué:** el log histórico es el SSOT; cualquier agregación se deriva en la salida del
  comando.
- **Alternativa rechazada:** archivo de ranking persistente (capa extra no justificada).

### D4: Comando en assurance-toolkit; registrador en make-no-mistakes

- **Por qué:** el audit es QA/gobernanza (assurance); el registro warn vive en los hooks de
  MNM. Separación datos/reporte.
- **Alternativa rechazada:** todo en un solo toolkit.

### D5: Fusión bajo un solo comando

- `code-conventions-audit` agrega repo-health (6 familias vía audit-engine) + clean-code
  standards + records de lenguaje.

## Arquitectura

```
hooks pre-commit/CI (MNM) ──warn──► registrador ──batch──► <org>/internal-audits/   (default)
                                                          conventions/code-conventions-audit-YYYY-MM-DD.md
                                                          (append-only)
                                                          └─ opt-in: repo compartido
                                                             (p.ej. chimeranext/internal-audits)
                                                             — solo si la entidad adopta
                                                             shared services (opinionated)

/code-conventions-audit (assurance) ──lee──► <org>/internal-audits/ ──► reporte de cumplimiento
```

## Componentes

1. **Registrador warn** (MNM): buffer local de violaciones + push batch al repo de auditoría
   de la entidad (`<org>/internal-audits` default; centralización opt-in vía `auditsRepo`).
2. **`/code-conventions-audit`** (assurance): comando que lee el log del repo de la
   entidad y reporta.
3. **GATES de records de lenguaje**: warn + registro en vez de block.
