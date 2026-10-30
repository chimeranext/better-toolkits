# CLG — Commit Logic Groups (doctrina)

> Policy/doctrine SSOT para **cómo agrupar commits intermedios**. Complementa
> Conventional Commits (formato del mensaje, ver `branching-strategy.md`); esta
> doctrina rige la **agrupación semántica**.

## Doctrina

1. **Un commit = un cambio lógico.** Cada commit agrupa cambios que pertenecen a
   una **misma semántica** (una feature, un fix, una doc, un refactor, un lint,
   un estándar). No se mezclan cambios no relacionados en un mismo commit.
2. **Grupos lógicos, no "todo junto".** Los commits intermedios se separan por
   propósito, de modo que cada uno sea **revisable de forma independiente** y
   auditable desde fuera (p.ej. en el draft PR).
3. **Preservar la trazabilidad intermedia.** Cada commit debe poder entenderse por
   sí mismo; no se acumulan cambios dispares que solo se explican juntos.
4. **La rama/PR refleja los grupos.** El draft PR muestra los commits agrupados
   por semántica — nunca un único commit gigante con todo, ni múltiples commits
   revueltos.

## Racional (por qué)

- Un commit lógico facilita el **review** (se puede aprobar/rechazar por pieza),
  el **bisect** y la **auditoría externa** (cada cambio es trazable).
- Los commits "todo junto" ocultan intención y hacen imposible revertir una sola
  decisión.

## Aplicación

- **Agentes** (Claude/OpenCode/Cursor): al implementar, crear commit por grupo
  semántico y push al draft PR.
- **`/disk-cleanup` / scripts**: los fixes se separan por estándar.
- **CI/auditorías**: el diff del PR debe mostrar grupos lógicos.

## Referencias

- Formato de mensaje: **Conventional Commits** (`branching-strategy.md` §Commits).
- Disciplina de draft PR: `/opsx-sync` y `implement/branch-and-worktree.md`.
