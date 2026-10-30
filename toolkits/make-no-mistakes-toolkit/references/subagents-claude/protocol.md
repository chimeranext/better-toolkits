# /subagents-claude — protocol SSOT

Patrón **agnóstico** de **desarrollo dirigido por subagents** para el harness
**Claude Code**, usando las primitivas nativas de Claude. Es el peer de
`/subagents-opencode` (herdr) para el harness Claude.

## Patrón (controlador)

1. **Despachar un implementer fresco por tarea** — contexto aislado; se construye solo lo
   que necesita (no hereda la sesión).
2. Tras cada tarea, **task review**: compliance a la spec + calidad de código (nunca
   saltarla; la auto-review del implementer no la reemplaza).
3. **Fix loop** si la review reporta hallazgos (cap de rondas; si no converge, **Ruling**
   y a seguir). Usa un **fix-agent fresco** — los subagents completados no reciben
   mensajes de seguimiento, así que el fix es un dispatch nuevo con el gap report.
4. **Revisión final** de toda la rama al terminar todas las tareas.
5. **Ledger** (`progress.md`) como mapa de recuperación — sobrevive a la compactación;
   registrar cada `Ruling`.

## Reglas clave

- Un implementer por tarea; **no** despachar implementers en paralelo sobre los mismos
  archivos (conflictos).
- El implementer **no** despacha subagents (ni helpers, ni reviewer).
- El controlador ejecuta todas las tareas sin pausar a preguntar; solo se detiene por:
  operaciones irreversibles/destructivas, acciones sensibles de seguridad, o efectos
  externos (merge/push a rama compartida/publish).
- El controlador conserva su contexto para coordinar; los artefactos se pasan como
  archivos, no pegados en el prompt.

## Subagents (Claude Code)

Los subagents son archivos Markdown en `.claude/agents/*.md` (proyecto) o
`~/.claude/agents/*.md` (usuario), con frontmatter YAML:

```yaml
---
name: implementer
description: Implementa una tarea con contexto aislado.
tools: Read, Edit, Bash, Grep, Glob
model: sonnet
---
```

- El controlador invoca subagents con **invocaciones de alta calidad**: scope específico,
  referencias de archivos, restricciones, y success criteria explícitas. Un subagent no
  puede pausar a preguntar, así que la primera invocación debe llevar todo lo que necesita.
- `CLAUDE_CODE_SUBAGENT_MODEL` permite correr subagents en un modelo más barato.

## Cross-session messaging

Para coordinar hallazgos entre sesiones (por ejemplo, el reviewer pasando gaps al fix
agent, o un worker reportando a otro):

- `ListAgents` / `SendMessage` — pasar contexto entre sesiones/subagents.
- En el patrón controlador+implementer, el controlador es quien orquesta; los workers
  se reportan al controlador, no entre sí (salvo necesidad explícita).

## Aislamiento con worktrees

Cada tarea que edite archivos debe correr en un worktree aislado:

```bash
git worktree add .agents/worktrees/<slug> -b <branch> <base-ref>
```

- La convención canónica es `.agents/worktrees/<slug>` (según AGENTS.md).
- Claude Code soporta `claude --worktree` para trabajar en un worktree nativamente.
- Bloquear staging amplio (`git add -A` / `git add .`) vía hook.
- Commit antes de despachar; commit entre handoffs para que el siguiente worker lea el
  estado más reciente.
- Preferir **archivos nuevos** sobre edits compartidos cuando sea posible.

## Verificación

- Trata el output del worker como no confiable hasta verificar (Jidoka).
- Revisa el diff final antes de aceptar cualquier patch de worker.
- El controlador corre checks de integración no cubiertos por el worker.
- El **reviewer** lee spec + diff y emite un gap report; un fix-agent fresco lo aplica.

## Retire workers

Una delegación termina con el worker retirado. Para subagents de Claude, cierra/retira la
sesión del worker al registrar la disposición (accepted, rejected, superseded, blocked).
Archivos, diffs y worktrees sobreviven en disco.

## Condiciones de parada

Detente y reporta (no improvises) cuando:

- un subagent rechaza el modelo, estado de auth o directorio de trabajo.
- la auth bloquea la sesión.
- el status de un worker es ambiguo y no puede confirmarse.
- los workers necesitan ediciones solapadas que el controlador no puede integrar con
  seguridad.
- se requiere una operación irreversible sin aprobación humana.

## Plan-first delegation (opt-in)

Solo cuando el usuario la active ("plan first"/"plan mode"). El default es directo.

## Capacidades por harness

Ver [`subagents-harness-capabilities.md`](../subagents-harness-capabilities.md) — matriz
harness-agnostic. La convención de worktrees es `.agents/worktrees`.

## Referencias

- Claude Code sub-agents: https://code.claude.com/docs/en/sub-agents
- Cross-session messaging: https://code.claude.com/docs/en/cross-session-messaging
- Worktrees: https://code.claude.com/docs/en/worktrees
- Workflows: https://code.claude.com/docs/en/workflows
- superpowers/subagent-driven-development: https://github.com/obra/superpowers/blob/main/skills/subagent-driven-development/SKILL.md
