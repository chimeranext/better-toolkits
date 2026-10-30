# /parallel-subagents — protocol SSOT

Orquestador **harness-agnóstico** de subagent-driven development en paralelo. Inspirado
en `superpowers/dispatching-parallel-agents`, Oakheart Lab (orchestrator pattern) y
Claude Code sub-agent best practices.

## Detección de harness

```bash
if [ -n "$OPENCODE_..." ] || [ -d "$HOME/.config/opencode" ]; then
    harness=opencode
elif [ -d "$HOME/.claude" ] || command -v claude; then
    harness=claude
else
    harness=opencode   # default; override via $ARGUMENTS
fi
```

- **OpenCode** → `subagents-opencode` (herdr: workers TUI en procesos separados).
- **Claude Code** → `subagents-claude` (`.claude/agents`, `ListAgents`/`SendMessage`,
  `--worktree`).

## Patrón (controlador)

1. **Grafo de dependencias** — antes de despachar nada, construye el grafo. Tasks que
   tocan archivos distintos y sin estado compartido → pueden correr en la misma wave.
   Tasks que comparten archivos/estado → waves secuenciales con commit entre waves.
2. **Aislamiento** — un worktree por tarea:
   `git worktree add .agents/worktrees/<slug> -b <branch> <base>`.
   Bloquear staging amplio (`git add -A` / `git add .`) vía hook. Commit la baseline
   antes de despachar. Preferir **archivos nuevos** sobre edits compartidos.
3. **Despacho en paralelo + background** — cada tarea independiente se despacha con
   **background** (el controlador no se bloquea esperando) y contexto aislado. Prompts
   autocontenidos: scope, referencias de archivos, restricciones, success criteria,
   salida esperada.
4. **Wave gate** — entre waves, correr tests; no avanzar hasta verde.
5. **Review gate** — tras cada implementación, un reviewer (spec + diff) chequea;
   si hay gaps, un fix-agent fresco (los completados no reciben mensajes) los aplica.
   Mark complete solo después de que review pase.
6. **Human finishing** — al terminar todas las tareas verificadas, presentar la
   decisión de integración vía **`/resolve-open-questions`** (ask batch con opciones —
   merge local / push + PR / keep as-is — + recomendación). **Nunca auto-merge**; la
   decisión pertenece al humano.

## Reglas clave

- **Paralelo solo para tareas independientes.** Verificar archivos distintos y sin estado
  compartido antes de paralelizar.
- **Background** ≠ fire-and-forget sin review: el task sigue pasando por review gate y
  wave gate; solo la *espera del controlador* es no bloqueante.
- El controlador conserva su contexto para coordinar; los artefactos se pasan como
  archivos, no pegados en el prompt.
- Un implementer por tarea; el implementer no despacha subagents.
- El controlador no auto-mergea; la integración es decisión humana.

## Wave gate (detalle)

Entre waves: correr suite de tests. Si falla, no avanzar hasta verde. El commit entre
waves asegura que la siguiente wave lea el estado más reciente (no stale state).

## Review gate (detalle)

```
Implementer → commits → reporta done
Reviewer → lee spec + diff → gap report
Fix Agent (si gaps) → recibe gap report → patchea y recommitea
Controlador → mark complete solo tras review OK
```

## Condiciones de parada

Detente y reporta (no improvises) cuando:

- dos tareas necesitan ediciones solapadas que no se pueden secuenciar con seguridad.
- un worker rechaza modelo/auth/directorio.
- una wave no pasa el test gate tras un cap razonable de rounds de fix.
- se requiere una operación irreversible sin aprobación humana.

## Referencias

- superpowers/dispatching-parallel-agents: https://github.com/obra/superpowers/blob/main/skills/dispatching-parallel-agents/SKILL.md
- superpowers/using-git-worktrees: https://github.com/obra/superpowers/blob/main/skills/using-git-worktrees/SKILL.md
- superpowers/finishing-a-development-branch: https://github.com/obra/superpowers/blob/main/skills/finishing-a-development-branch/SKILL.md
- Oakheart Lab — subagent-driven development: https://blog.oakheartlab.com/p/subagent-driven-development-how-to
- Claude Code sub-agent best practices: https://claudefa.st/blog/guide/agents/sub-agent-best-practices
- Capacidades por harness: [`subagents-harness-capabilities.md`](../subagents-harness-capabilities.md)
