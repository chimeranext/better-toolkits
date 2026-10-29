# /assurance-local-setup — protocol SSOT

Configura el **lado local** del gate de `/assurance`: todo lo que vive en la
máquina del desarrollador. **No** toca GitHub settings ni archivos commiteados
del gate (eso es `/assurance-repo-setup`). Es **idempotente**.

## Ámbito

| In scope | Out of scope |
|----------|--------------|
| Git hooks locales (pre-push / pre-commit) | Ruleset / branch protection |
| Adapters de hooks (stderr/prds/no-squash) en local | `.mega-linter.yml` y workflows CI |
| Dependencias locales del typecheck (`npm ci --include=dev`) | `internal-audits` (repo remoto) |
| Verificación de que los checks corren local | Activación de gates remotos |

## Qué hace

1. **`ensure-local-hooks.sh`** — activa los hooks git locales:
   - si hay `pre-commit` configurado, `pre-commit install`;
   - fallback: `git config core.hooksPath` apuntando a `shared/hooks/git`.
2. **`prepare-typecheck-deps.sh`** — `npm ci --include=dev` en `shared/hooks`
   (obligatorio `--include=dev`: `NODE_ENV=production` omitiría devDeps →
   `TS2688`). Deja listo `npm run typecheck` local.

## Lecciones incorporadas

- El typecheck local comparte el mismo motivo que el CI (`--include=dev`).
- Nunca obliga a permisos remotos; si no hay `shared/hooks` ni `pre-commit`,
  reporta WARN y termina 0.

## Verificación

- `git config core.hooksPath` o `pre-commit` activo.
- `cd shared/hooks && npm run typecheck` pasa.

## Related

- `references/assurance-repo-setup/protocol.md` (lado repo)
- `scripts/assurance-local-setup/` (helpers)
