---
name: subagents-claude
description: Desarrollo dirigido por subagents en el harness Claude Code (patrón agnóstico, controlador + implementer + reviewer + ledger), usando primitivas nativas de Claude Code (.claude/agents, ListAgents/SendMessage, --worktree). Peer de /subagents-opencode para el harness Claude. Use when executing an implementation plan with independent tasks from Claude Code, delegating to parallel agents, or mentions "subagent-driven development", "multi-agent", "claude subagents", "agent teams fallback".
---
# /subagents-claude

Read and follow [`references/subagents-claude/protocol.md`](../references/subagents-claude/protocol.md) (protocol SSOT).

Patrón agnóstico de subagent-driven development (controlador + implementer + reviewer +
ledger) para el harness **Claude Code**. Es el peer de `/subagents-opencode` (que usa
herdr) pero implementado con las primitivas nativas de Claude:

- **Subagents**: `.claude/agents/*.md` (name/description/tools/model) — contexto aislado.
- **Cross-session messaging**: `ListAgents` / `SendMessage` para pasar hallazgos entre sesiones.
- **Worktrees**: `claude --worktree` (o `git worktree add`) en `.agents/worktrees/<slug>`.
- **Workflows** (cuando docenas/cientos de tareas): `/workflows`, `agent()`, `pipeline()`, `parallel()`.

Reglas clave (mismas que `subagents-opencode`):
- Un implementer por tarea; no despachar implementers en paralelo sobre los mismos archivos.
- El implementer **no** despacha subagents (ni helpers, ni reviewer).
- El controlador ejecuta las tareas sin pausar a preguntar; solo se detiene por operaciones
  irreversibles, seguridad, o efectos externos (merge/push/publish).
- Tras cada tarea, **task review** (spec + calidad). **Fix loop** con un fix-agent fresco (los
  subagents completados no reciben mensajes de seguimiento). **Ledger** (`progress.md`) como mapa
  de recuperación.

Worktrees canónicos: `.agents/worktrees/<slug>` (según AGENTS.md de better-toolkits).

Capacidades por harness: ver [`references/subagents-harness-capabilities.md`](../references/subagents-harness-capabilities.md).
