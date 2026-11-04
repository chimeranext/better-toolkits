---
name: subagents-opencode
description: Desarrollo dirigido por subagents en el harness OpenCode (patrón agnóstico, inspirado en superpowers y en herdr-orchestration), ejecutado vía herdr para procesos independientes — despachar implementers frescos por tarea, task review, fix loop y ledger. Integra la orquestación herdr real (preflight, lanzamiento de workers TUI, packets de delegación, tracking, verificación, retire, plan-first). Use when executing an implementation plan with independent tasks from OpenCode, delegating to parallel agents, or mentions "subagent-driven development", "multi-agent", "herdr", "herdr-orchestration".
---
# /subagents-opencode

Read and follow [`references/subagents-opencode/protocol.md`](../references/subagents-opencode/protocol.md) (protocol SSOT).

Patrón agnóstico de subagent-driven development (controlador + implementer + reviewer +
ledger) para el harness OpenCode; **herdr** es el mecanismo para correr los subagents como
workers TUI en procesos independientes. El protocol integra las capacidades de
`herdr-orchestration` (compozy/kb) adaptadas al CLI real `herdr`.

- Preflight: `herdr status`, `herdr integration status` (runtime debe estar `current`),
  `herdr pane current --current`, `herdr agent list`. Instala/actualiza la integración del
  runtime seleccionado (`herdr integration install <runtime>`) si está `outdated`.
- Workers son TUIs (no headless): `herdr agent start <name> --kind <runtime> --pane <id>`
  tras `herdr tab create … --label "<model>: <slice>" --no-focus`.
- Packets de delegación como contrato standalone (ver protocol). Tracking con
  `herdr agent wait <name> --until done|blocked --timeout <check-in>`.
- Notificación/atención: opencode-notifier / herdr-terminal-notifier (eventos
  `permission|complete|subagent_complete|question|error`, `showSessionTitle: true`,
  `focusOnClick`, `suppressWhenFocused` opt-in; evitar duplicados con el toast de herdr).
- Orquestación multi-sesión: cambio de sesión herdr solo desde shell cruda (nested launch
  prohibido), naming de ventana por OSC 2, y session_name en el ledger.
- Verificación read-only (`agent read`), diff review antes de aceptar, y `herdr tab close`
  al retirar. Plan-first: opcional, ver `references/subagents-opencode/plan-mode.md`.
