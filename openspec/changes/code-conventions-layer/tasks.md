# Tasks — code-conventions-layer

## Implementation

### Molde / schema

- [ ] C1: Crear `shared/references/conventions/_template.md` (plantilla convention-record).
- [ ] C2: Actualizar `shared/references/conventions/README.md` (índice + reglas de casa).
- [ ] C3: Crear record `language/elixir/README.md` v0.1.0 draft.
- [ ] C4: Crear hijo `language/elixir/frameworks/phoenix.md`.
- [ ] C5: Crear record `language/powershell/README.md` (nuevo, linters).

### Auditoría

- [ ] C6: Implementar checks warn-no-block (hooks pre-commit/CI).
- [ ] C7: Implementar registrador warn en make-no-mistakes (batch push).
- [ ] C8: Implementar `/code-conventions-audit` en assurance-toolkit.
- [ ] C9: Actualizar GATES de `language/*` a warn + registro.

### Consolidación

- [ ] C10: Marcar `add-conventions-layer` y `code-conventions-audit` como superseded por `code-conventions-layer`.

## Verification

- [ ] `openspec validate --change code-conventions-layer` pasa.
- [ ] Plantilla + records ejemplares existen con todas las secciones.
- [ ] El módulo sample Elixir pasa los gates pineados en sandbox.
- [ ] Un revisor puede trazar cada RULE a su SOURCE pineada.
- [ ] El registrador escribe `internal-audits/.../code-conventions-audit-YYYY-MM-DD.md`.
- [ ] `/code-conventions-audit` lee el log y reporta.
