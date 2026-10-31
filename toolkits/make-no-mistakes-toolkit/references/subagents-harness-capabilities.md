# subagents — capacidades por harness (referencia)

Matriz **harness-agnostic** de capacidades para el patrón de desarrollo dirigido por
subagents. Claude Code (code.claude.com/docs) es la referencia más completa; cada
harness (OpenCode, etc.) implementa equivalentes.

## Capacidades

| Capacidad | Qué resuelve | Claude Code | Harness-agnostic / OpenCode |
|---|---|---|---|
| **Subagents** | worker con contexto aislado; devuelve resumen | `.claude/agents/*.md` (name/description/tools/model) | herdr: `agent start <name> --kind <runtime> --pane <id>` (worker TUI, contexto aislado por tarea) |
| **Cross-session messaging** | pasar hallazgos entre sesiones | `ListAgents`/`SendMessage` | herdr: `agent prompt <name> "<text>" --wait`; notificaciones (`notification show`) |
| **Worktrees** | aislamiento de archivos entre sesiones paralelas | `--worktree` (Claude Code) | herdr `worktree create` + convención **`.agents/worktrees/`** de este monorepo |
| **Workflows** | orquestación scripteada de muchos subagents (`agent()/pipeline()/parallel()`) | `/workflows`, `agent()`, `pipeline()` | herdr: controlador despacha workers por tab; tracking con `agent wait --until done|blocked` |
| **Channels** | push de eventos externos (CI/chat) a una sesión | channels | herdr: notificaciones (`notification show`) |

## Nota de convención (importante)

La **ubicación canónica de worktrees independiente del harness** es:

```
.agents/worktrees/<slug>
```

(según AGENTS.md de better-toolkits).

## Cómo usar

- **Subagents**: un worker por tarea, contexto aislado (despacho desde el controlador).
- **Worktrees**: un worktree por tarea/rama (`git worktree add .agents/worktrees/<slug> -b <branch> <base>`).
- **Workflows**: cuando hay docenas/cientos de tareas → script orquestador (pipeline).
- **Messaging/channels**: coordinar hallazgos entre sesiones o empujar eventos externos.

## Fuentes (Claude Code)

- Subagents: https://code.claude.com/docs/en/sub-agents
- Cross-session messaging: https://code.claude.com/docs/en/cross-session-messaging
- Worktrees: https://code.claude.com/docs/en/worktrees
- Workflows: https://code.claude.com/docs/en/workflows
- Channels: https://code.claude.com/docs/en/channels
