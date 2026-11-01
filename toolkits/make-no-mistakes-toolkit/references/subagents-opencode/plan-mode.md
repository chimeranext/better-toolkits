# Plan Mode — lanzamiento y aceptación (Claude Code & Codex)

Mecánica para correr un worker por una fase de planificación interactiva antes de la
implementación hands-off: lanzar la TUI en plan mode, enviar el packet de delegación,
observar y responder preguntas, revisar el plan, aceptarlo y supervisar hasta que el
worker reporte done. Plan-first es opt-in — el gate de activación de la skill padre
(pedido explícito o `--plan-mode`) decide si corre. El CLI es `herdr` (no `rtk herdr`).
Todos los comandos están prefijados con `herdr`. Scope al workspace del caller; nunca
cambia focus.

## Shared rules (ambas TUIs)

- Strings de TUI (líneas de status, menús, labels de opción) dependen del build. Verifica
  con `agent read` en el primer uso contra la versión instalada
  (`herdr agent start <name> --kind claude --pane <id> -- --version` / `--kind codex`).
- Envía dentro de una TUI en marcha según `agent prompt` (texto + Enter atómico); un `\n`
  final solo no envía.
- Detecta menús/preguntas de dos formas, semántica primero: `agent wait <name>
  --until blocked` dispara cuando el worker se detiene por input; `pane wait-output
  <pane_id> --match "<título de menú>"` fija el menú exacto. En cualquiera, `agent read
  <name> --source visible` antes de actuar.
- Plan mode es interactivo. El worker puede preguntar antes de presentar plan — responde
  con el contexto de la tarea. No respondas preguntas que no hizo.
- Revisa el plan antes de aceptar: corrección, scope contra los file claims del packet y
  sin ediciones fuera de scope. Lee con `agent read <name> --source recent-unwrapped
  --lines 200` si el plan pasa de una pantalla.
- **Después de aceptar, no interrumpas.** Desde la aceptación hasta `done`, solo observa
  vía `agent read` read-only y waits de status. Envía input solo para responder una
  pregunta bloqueante directa o una condición de parada.

## Claude Code: lanzar en plan mode

`claude` tiene flag de primera clase: `--permission-mode plan`. Compone con
`--dangerously-skip-permissions` (obligatorio para workers), así el worker planea primero
y corre desatendido tras aceptación.

Crea la pestaña nombrada y pasa el packet como argv de lanzamiento (arranca a planear de
inmediato):

```bash
herdr tab create --workspace "$HERDR_WORKSPACE_ID" --cwd "$PWD" \
  --label "opus: fix loops (plan)" --no-focus

herdr agent start fix-loops --kind claude --pane <root_pane_id> -- \
  --dangerously-skip-permissions --permission-mode plan \
  "<packet, single block>"
```

Para lanzar sin prompt inicial, omite el packet y envía con `agent prompt` cuando
`agent start` devuelva. Confirma plan mode con `agent read <name> --source visible`: la
zona de status del input box debe indicar plan mode (builds actuales: `plan mode on`). Si
una sesión ya corre fuera de plan mode, **shift+tab** cicla modos (default → accept edits →
plan → bypass); presiona y verifica hasta ver plan mode:

```bash
herdr agent send-keys fix-loops shift+tab
```

## Claude Code: aceptar el plan

Cuando el worker termina de planear presenta un menú de aceptación (builds actuales lo
titulan `Would you like to proceed?`):

```
> 1. Yes, and auto-accept edits
  2. Yes, and manually approve edits
  3. No, keep planning
```

Atrápalo con `herdr pane wait-output <pane_id> --match "Would you like to proceed?"` (o el
wait de `blocked`). Revisa el plan primero, luego elige **auto-accept** (los workers corren
desatendidos; aprobación manual estancaría el tab). Presiona Enter con auto-accept
resaltado (mueve con `agent send-keys <name> down`/`up` si hay otra opción):

```bash
herdr agent send-keys fix-loops enter
```

Confirma con `agent read` que plan mode está apagado y el worker trabaja. Para rechazar y
seguir planeando, elige "keep planning" y envía feedback con `agent prompt`.

## Codex: lanzar y entrar a Plan mode

Codex no tiene flag CLI para plan mode — se entra dentro de la TUI con **shift+tab**. Por
eso, **no** pases el packet como argv (empezaría a trabajar en el modo por defecto antes
del switch). Lanza bare en su pestaña nombrada, entra a Plan mode y luego envía el packet:

```bash
herdr tab create --workspace "$HERDR_WORKSPACE_ID" --cwd "$PWD" \
  --label "codex: audit auth (plan)" --no-focus

herdr agent start audit-auth --kind codex --pane <root_pane_id> -- --yolo
```

`agent start` devuelve solo cuando la TUI está lista. Entra a Plan mode:

```bash
herdr agent send-keys audit-auth shift+tab
```

`agent read` otra vez — la línea de status inferior debe decir **`Plan mode`**. Si no,
envía shift+tab de nuevo (la tecla cicla). No envíes el packet hasta confirmar `Plan mode`:

```bash
herdr agent prompt audit-auth "<packet, single block>" --wait --timeout 300000
```

## Codex: aceptar el plan

Cuando el worker presenta el menú:

```
Implement this plan?
> 1. Yes, implement this plan          Switch to Default and start coding.
  2. Yes, clear context and implement  Fresh thread.
  3. No, stay in Plan mode             Continue planning with the model.
```

Atrápalo con `herdr pane wait-output <pane_id> --match "Implement this plan?"` (o el wait
de `blocked`). Revisa el plan primero, luego elige opción **1** (conserva contexto de
investigación) presionando Enter mientras está resaltada:

```bash
herdr agent send-keys audit-auth enter
```

Confirma que la línea de status ya no muestra `Plan mode` y el worker está `Working`. Para
rechazar, elige opción 3 y envía feedback con `agent prompt`.

## Observar plan mode y responder preguntas

Bloquea en `agent wait <name> --until blocked` en intervalos de check-in de 3–5 min
mientras el worker investiga (el timeout es check-in, nunca deadline); al expirar,
`agent read <name> --source visible` y re-entra. Si el worker pregunta, responde con
`agent prompt` usando el contexto del packet. Actualiza el ledger: `planning` mientras
investiga, `plan-review` al aparecer el menú, `plan-accepted` una vez aceptado.

## Monitoreo hands-off y completitud

Tras aceptar, solo observa. Bloquea en estados terminales en intervalos de 3–5 min
(implementación, validación y QA suelen cruzar muchos intervalos; el worker nunca se corta
porque un wait expire):

```bash
herdr agent wait fix-loops --until done --timeout 300000
herdr agent wait fix-loops --until blocked --timeout 300000
```

Al expirar, lee la pantalla y re-entra. En `blocked`, lee y responde solo una pregunta
bloqueante directa; en condición de parada (errores que no resuelve, request fuera de
scope), detente y reporta. Cuando el worker reporte done, verifica sus claims según la
skill padre: reabre archivos citados, inspecciona evidencia de comandos y revisa el diff
antes de aceptar el patch. Re-ejecuta solo checks cuya evidencia falte, esté obsoleta o sea
no confiable, más checks de integración no cubiertos. Conserva el worker para follow-ups de
integración planeados; registra la disposición final y retíralo según la skill padre.
