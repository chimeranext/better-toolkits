# /subagents-opencode — protocol SSOT

Patrón **agnóstico** de **desarrollo dirigido por subagents** (inspirado en
`superpowers/subagent-driven-development`). Herdr (Linux/WSL) / HerdrM (macOS) son el
**mecanismo recomendado** para ejecutar los subagents en procesos independientes, pero el
patrón no depende de ellos.

## Patrón (controlador)

1. **Despachar un implementer fresco por tarea** — contexto aislado; se construye solo lo
   que necesita (no hereda la sesión).
2. Tras cada tarea, **task review**: compliance a la spec + calidad de código (nunca
   saltarla; la auto-review del implementer no la reemplaza).
3. **Fix loop** si la review reporta hallazgos (cap de rondas; si no converge, **Ruling**
   y a seguir).
4. **Revisión final** de toda la rama al terminar todas las tareas.
5. **Ledger** (`progress.md`) como mapa de recuperación — sobrevive a la compactación;
   registrar cada `Ruling`.

## Ejecución de subagents (mecanismo)

| Plataforma | Mecanismo |
|---|---|
| Linux / WSL | **herdr** (workspaces/panes; lanzar `opencode`/`claude` por pane, detach + monitoreo) |
| macOS | **herdrm** (consola nativa) sobre herdr |

Detalles operativos: herdr agent-guide (https://herdr.dev/agent-guide.md) y
`missuo/herdrm`.

## Reglas clave (del patrón)

- Un implementer por tarea; **no** despachar implementers en paralelo (conflictos).
- El implementer **no** despacha subagents (ni helpers, ni reviewer).
- El controlador ejecuta todas las tareas sin pausar a preguntar; solo se detiene por:
  operaciones irreversibles/destructivas, acciones sensibles de seguridad, o efectos
  externos (merge/push a rama compartida/publish).
- El controlador conserva su contexto para coordinar; los artefactos se pasan como
  archivos, no pegados en el prompt.

## Referencias

- superpowers/subagent-driven-development: https://github.com/obra/superpowers/blob/main/skills/subagent-driven-development/SKILL.md
- herdr agent guide: https://herdr.dev/agent-guide.md
- herdrm: https://github.com/missuo/herdrm
