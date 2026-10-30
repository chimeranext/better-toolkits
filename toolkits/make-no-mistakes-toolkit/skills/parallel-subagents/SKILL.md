---
name: parallel-subagents
description: Orquestador harness-agnóstico para desarrollo dirigido por subagents en paralelo con ejecución en background — detecta el harness (OpenCode → subagents-opencode; Claude → subagents-claude), construye un grafo de dependencias, aísla cada tarea en su worktree, despacha independientes en paralelo con background, gatea waves en tests, reviewa cada implementación, y termina con menú de integración humano (sin auto-merge). Use when dispatching multiple independent tasks concurrently, running parallel agents with background execution, "parallel subagents", "dispatch waves", or delegating to parallel agents across harnesses.
---
# /parallel-subagents

Read and follow [`references/parallel-subagents/protocol.md`](../references/parallel-subagents/protocol.md) (protocol SSOT).

Orquestador **harness-agnóstico** de subagent-driven development en paralelo, inspirado
en superpowers `dispatching-parallel-agents`, Oakheart Lab (orchestrator pattern) y
Claude Code sub-agent best practices.

Invoca el skill por-harness correcto:
- **OpenCode** → `subagents-opencode` (herdr).
- **Claude Code** → `subagents-claude` (`.claude/agents`, `ListAgents`/`SendMessage`, `--worktree`).

Flujo: detectar harness → grafo de dependencias → waves → aislamiento (worktree) →
despacho en paralelo con **background** → gate de tests → review por implementación →
menú de integración humano (nunca auto-merge).

Reglas clave:
- **Paralelo solo para tareas independientes** (archivos distintos, sin estado compartido).
- Tareas que comparten archivos/estado → **secuenciales por waves** con commit entre waves.
- **Background**: el controlador no se bloquea esperando; recibe notificación al completar.
- **Aislamiento**: un worktree por tarea; bloquear `git add -A`; commit-before-dispatch.
- **Review gate**: reviewer tras cada implementer; fix-agent fresco si hay gaps.
- **Human finishing**: menú de integración; sin auto-merge.
