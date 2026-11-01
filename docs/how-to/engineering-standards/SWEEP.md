# SWEEP — `/sweep-unstaged` (nota operativa, español)

Esta es la nota en español para operadores del sweep de ground truth. El protocolo
canónico (SSOT) vive en inglés en
`toolkits/make-no-mistakes-toolkit/references/sweep-unstaged/protocol.md`.

## Qué hace

Audita **todos** los worktrees del repo (checkout principal + `.agents/worktrees/*`
+ `.worktrees/*`) y marca cada uno como `CLEAN` o `DIRTY` según tres predicados:

1. **uncommitted** — hay trabajo sin commitear (incluye sin trackear).
2. **unpushed** — hay commits que no están en `origin/<branch>`.
3. **PR coverage** — la rama no tiene una PR abierta, no-draft y mergeable.

Además detecta **drift de OpenSpec**: cuando un change activo tiene specs delta
(`openspec/changes/<change>/specs/**/spec.md`) que no están reflejadas en las
main specs (`openspec/specs/`). En ese caso el sweep aplica una **sync
obligatoria** (nunca deja drift atrás) mediante el motor compartido
`scripts/ci/opsx-sync-apply.sh` (bash) / `opsx-sync-apply.ps1` (PowerShell).

## Qué NO hace

- No commitea, no pushea, no abre PRs, no mergea, no rebasea.
- No cuenta una PR draft como cobertura.
- Pushear y abrir PR es el siguiente paso humano, no del sweep.

## Salida

Imprime un bloque por worktree (rama, origin-branch, uncommitted, unpushed, PR,
drift, veredicto) y un veredicto final:

- `SWEEP: CLEAN` → exit 0.
- `SWEEP: DIRTY` → exit 1 (queda trabajo por resolver).
- Sync obligatoria aplicada → `SWEEP: OpenSpec sync applied.`

## Uso

```bash
bash scripts/ci/sweep-unstaged.sh            # modo texto
bash scripts/ci/sweep-unstaged.sh --json     # un objeto JSON por worktree
# Windows / PowerShell:
pwsh -File scripts/ci/sweep-unstaged.ps1
```

Stderr nunca se descarta: capturá ambos streams en un mismo archivo de log
(combinados en un solo sink).

## Relación con estándares

- **LTGT (#19)** — la búsqueda y medición parten del git common-dir, no del CWD.
- **StS** — el stream de errores se preserva; nunca a `/dev/null`.

## Notas

- Tras un sweep con drift, quedarán main specs nuevas/actualizadas en
  `openspec/specs/`; forman parte del change y se commitean con él.
- Si el sweep reporta `unpushed` o falta de cobertura: pusheá la rama y abrí/actualizá
  la PR, y volvé a correr el sweep.
