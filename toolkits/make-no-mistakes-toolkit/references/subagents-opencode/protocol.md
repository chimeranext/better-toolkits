# /subagents-opencode — protocol SSOT

Patrón **agnóstico** de **desarrollo dirigido por subagents** (inspirado en
`superpowers/subagent-driven-development`). **herdr** (Linux/WSL) / **herdrm** (macOS)
son el **mecanismo** para ejecutar los subagents como workers TUI en procesos
independientes. Este protocol integra las capacidades de orquestación herdr
(`herdr-orchestration`), adaptadas al CLI real `herdr` (no `rtk herdr`).

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

## Reglas clave (del patrón)

- Un implementer por tarea; **no** despachar implementers en paralelo (conflictos).
- El implementer **no** despacha subagents (ni helpers, ni reviewer).
- El controlador ejecuta todas las tareas sin pausar a preguntar; solo se detiene por:
  operaciones irreversibles/destructivas, acciones sensibles de seguridad, o efectos
  externos (merge/push a rama compartida/publish).
- El controlador conserva su contexto para coordinar; los artefactos se pasan como
  archivos, no pegados en el prompt.

---

# Orquestación herdr (referencia operativa)

> CLI real: **`herdr <sub> …`** (el CLI de compozy/kb usa `rtk herdr …`; aquí va
> precedido solo por `herdr`). Todas las capacidades verificadas contra `herdr 0.9.5`.

## Invariantes herdr

- Adminístrate al workspace del caller (`HERDR_WORKSPACE_ID`) salvo que el usuario nombre
  otro objetivo.
- Resuelve contexto desde `HERDR_WORKSPACE_ID`, `HERDR_TAB_ID`, `HERDR_PANE_ID`
  (inyectados en cada pane) antes de cualquier fallback.
- Direcciona workers por ids parseados de JSON: agent name para `agent …`, `w2:t3` /
  `w2:p4` para tab/pane — nunca por posición adivinada.
- `--no-focus` en todo verbo creador (`tab create`, `worktree create`); usa verbos de
  focus solo si el usuario lo pide.
- Retira cada worker al terminar su asignación (ver Retire workers).

## Preflight

```bash
herdr status                 # server corriendo + socket
herdr integration status     # el runtime seleccionado debe mostrar `current`
herdr pane current --current # ids de caller pane / tab / workspace
herdr agent list             # agents ya corriendo
```

Instala/actualiza **solo** la integración del runtime seleccionado:
`herdr integration install <runtime>` (p.ej. `opencode`, `claude`, `codex`). Si un
runtime aparece `outdated (vN < vM)`, actualízalo antes de delegar — la detección de
estado (agent-state) falla si la integración está desactualizada. La preflight se reutiliza
en el mismo workspace mientras daemon e integraciones no cambien.

## Trabajadores son TUIs — no headless

Un worker es una TUI interactiva (`opencode`, `claude`, `codex`…) lanzada con
`herdr agent start`, que valida la identidad y devuelve solo cuando la TUI está lista.
Los runners headless (`claude -p`, `codex exec`, streams JSON en un pane) **no** reportan
estado; `agent wait` nunca dispara y la delegación muere en silencio. Si un pane se llena
de líneas JSON, interrumpe (`pane send-keys <id> ctrl+c`) y relanza con `agent start`.

## Lanzar workers

Un worker, una pestaña nombrada. Dos nombres por worker, ambos requeridos:

- **tab label** — `<model>: <slice>`, p.ej. `opus: fix loops`. Texto libre, corto.
- **agent name** — el slice como slug, p.ej. `fix-loops`. Debe cumplir
  `[a-z][a-z0-9_-]{0,31}` y ser único entre agents vivos.

```bash
# 1. pestaña nombrada → devuelve .result.tab.tab_id y .result.root_pane.pane_id
herdr tab create --workspace "$HERDR_WORKSPACE_ID" --cwd "$PWD" \
  --label "opus: fix loops" --no-focus

# 2. worker TUI en el pane raíz de esa pestaña; flags nativos después de `--`
herdr agent start fix-loops --kind opencode --pane <root_pane_id> -- \
  --dangerously-skip-permissions "<packet>"
herdr agent start audit-auth --kind codex --pane <root_pane_id> -- --yolo
```

Captura `tab_id`, `pane_id` y el agent name en el ledger (retire y lecturas los necesitan).
`agent start` devuelve éxito solo cuando herdr detecta el worker listo; exit no-cero =
fallo de lanzamiento — lee el pane raíz (`pane read <pane_id> --source visible`) antes de
reintentar. Confirma la label con `herdr tab list --workspace "$HERDR_WORKSPACE_ID"`; si
sale por defecto, `tab rename <tab_id> "opus: fix loops"`.

> Nota: `--kind` soporta `opencode`, `claude`, `codex`, etc. (ver `herdr agent start --help`).
> El flag de opencode para workers desatendidos es documentado por la integración; para
> claude/codex se usan `--dangerously-skip-permissions` / `--yolo`.

## Enviar prompts a TUIs en marcha

Pasa el packet inicial como argv de lanzamiento (arriba) — la sesión trabaja de inmediato.
Para follow-ups usa `agent prompt` (envía texto + Enter atómicamente; `--wait` bloquea
hasta que el worker se asienta):

```bash
herdr agent prompt fix-loops "<follow-up prompt>" --wait --timeout 300000
```

Un `\n` final en `pane send-text` no envía (la TUI lo renderiza como soft newline).
Si `--wait` devuelve `agent_prompt_stalled`, el worker nunca cambió de estado — lee la
pantalla y reenvía.

## Packets de delegación

Cada prompt de worker es un contrato standalone. Incluye:

- ruta del repo y objetivo exacto
- rol del worker y modelo
- modo de ejecución: directo (default) o plan-first (activado por usuario)
- archivos/paquetes/superficies en scope
- archivos y comportamientos explícitamente fuera de scope
- archivos reclamados / slice de trabajo (para evitar conflictos)
- dependencias y el contrato/interface actual en que puede apoyarse
- evidencia esperada: archivos cambiados, comandos con resultados e inputs chequeados,
  artefactos, incertidumbre restante
- titularidad de verificación: el worker chequea; el controlador hace checks de
  integración y finales
- condiciones de parada: forma de código inesperada, fallo de comando repetido, bloqueo
  de auth/modelo, necesidad de ediciones fuera de scope

Asigna outcomes coherentes que puedan proceder independientemente. Si un consumidor depende
de una interface no resuelta, resuélvela primero o mantén productor y consumidor bajo un
mismo owner. Diles que comparten el codebase, deben preservar cambios ajenos y reportar
cambios de interface antes de que proceda trabajo dependiente. Reutiliza el mismo worker
para fixes de integración relacionados; envía el contrato cambiado y el trabajo restante en
vez de una asignación fresca de discovery.

## Aislamiento con worktrees

Cuando los workers deban editar archivos solapados en paralelo, dale a cada uno un
worktree aislado — herdr lo gestiona nativamente como workspace propio:

```bash
herdr worktree create --workspace "$HERDR_WORKSPACE_ID" \
  --branch <slug> --label "<slug>" --no-focus --json
```

Crea la pestaña del worker dentro de ese workspace (`tab create --workspace
<worktree_workspace_id>`) para que su cwd sea el checkout aislado. La convención de
worktrees de este monorepo es `.agents/worktrees/<slug>`.

## Track de workers

Las orquestaciones son largas; un worker nunca se abandona porque un wait expire. Bloquea
en el estado nativo de herdr en **intervalos de check-in de 3–5 min** (según peso del slice)
en vez de hacer polling de pantallas:

```bash
herdr agent wait fix-loops --until done --timeout 300000     # check-in de completitud
herdr agent wait fix-loops --until blocked --timeout 300000  # pregunta o menú
herdr pane wait-output <pane_id> --match "<text>" --timeout 300000
```

Lecturas del controlador no marcan un tab como visto; un worker no enfocado se asienta en
`done`, no `idle` — espera `done`. `--timeout` es el intervalo de check-in, nunca deadline.
Al expirar, lee la pantalla (`herdr agent read fix-loops --source recent-unwrapped --lines 120`)
y re-entra al wait; itera hasta estado terminal, pregunta, o condición de parada. Si un
status parece mal, debug con `herdr agent explain <pane_id> --json`.

Mantén un ledger compacto en las notas de tarea/handoff: identidad del controlador;
agent name, tab label, rol, modelo; ids workspace/tab/pane; objetivo y hora de inicio;
status (starting, planning, plan-review, plan-accepted, running, blocked, reported,
verified, retired); archivos reclamados; comandos y resultados reportados; verificación
del controlador; disposición final (accepted, rejected, superseded, blocked).

Renombra la label conforme cambia el slice y anuncia hitos sin robar focus:

```bash
herdr tab rename <tab_id> "opus: fix loops (verifying)"
herdr notification show "Workers done" --body "2/2 verified" --sound done
```

## Notificación / atención (gaps 1–4)

El wait es la fuente de verdad, pero el humano necesita **alertas** cuando un worker se
bloquea o termina — no solo polling del controlador.

- **Notificador de opencode (recomendado para el harness opencode):**
  `@mohak34/opencode-notifier`. Suscribirse a eventos ricos: `permission`,
  `complete`, `subagent_complete`, `question`, `error`, `user_cancelled`,
  `plan_exit`. Configurar `showSessionTitle: true` para que la alerta muestre el
  subject de la sesión (no solo el nombre de la carpeta), y `focusOnClick: true`
  para volver al worker desde el click. Se instala/configurea como parte de
  `/toolkits-initial-setup` (ver ese protocol).
- **Notificador de herdr (macOS):** `dot/herdr-terminal-notifier` — toast nativo
  con icono de herdr y click-to-jump (`CLICK_COMMAND: agent focus {pane}`). Usa
  plantillas `{title}` (terminal_title_stripped = subject), `{workspace}`, `{tab_label}`.
- **Evento nativo `subagent_complete`:** cuando esté disponible, úsalo como señal de
  completitud del worker (además del estado inferido `agent wait --until done`).
- **Supresión por foco (opt-in):** `suppressWhenFocused` es **opt-in** — por defecto
  está apagado (siempre notificar). Si el usuario lo activa, no alerta cuando el worker
  ya está visible/en foco (evita spam).
- **Evitar duplicados:** si conviven opencode-notifier y herdr, un mismo evento alerta
  doble. Configura herdr `[ui.toast] delivery = "terminal"` (toast in-app) o apaga su
  toast de sistema para que solo un notificador postee al escritorio.

## Orquestación multi-sesión (gaps 5–6)

`/subagents-opencode` por defecto orquesta **pestañas dentro de un workspace** de herdr
(p.ej. `w9`). Cuando el trabajo cruce a otra **sesión nombrada de herdr**:

- **Prohibición de launch anidado:** herdr prohíbe lanzar herdr dentro de herdr. Cambiar
  de sesión solo puede hacerse desde una shell cruda (fuera de herdr). Usa
  `victor-falcon/herdr-sessionizer` (gist) o `herdr session <list|attach|create|stop|delete>`
  desde una shell externa.
- **Naming de ventana por sesión:** al attachar/crear una sesión, fija el título de la
  ventana del host con OSC 2 (`printf '\033]2;herdr:%s\007' "<session>"`) para que los
  clicks de notificación enruten a la ventana correcta.
- **Ledger multi-sesión:** registra el `session_name` (no solo workspace/tab/pane) en el
  ledger; los ids de pane están scoped al servidor/sesión.

## Verificar output de workers

Trata el output del worker como no confiable hasta verificar. Monitorea y verifica sin
cambiar focus:

- Lee tabs de workers read-only (`agent read <name> --source recent-unwrapped --lines 200`);
  pide un resumen de status al worker si el output no es claro.
- Reabre localmente los archivos citados para verificar hallazgos de alto impacto. Para
  output visual, abre imágenes entregadas y sus referencias lado a lado; conteos de
  archivos no establecen fit visual.
- Inspecciona resultados de comandos, exit status, inputs chequeados y rutas de evidencia.
  Reutiliza evidencia confiable para inputs sin cambios; re-ejecuta checks faltantes/
  obsoletos/contradictorios. El controlador corre checks de integración no cubiertos.
- Revisa el diff final antes de aceptar cualquier patch de worker.
- Si un worker edita fuera de su claim, pausa la integración y decide: aceptar, pedir
  limpieza aprobada, o suplantar con ediciones del controlador.

Cuando `--lines` deje de revelar más de una respuesta completa, la TUI está en pantalla
alterna y esas filas se fueron. Pide al worker escribir su report completo como Markdown en
un dir temporal y responder con la ruta, luego lee el archivo.

## Retire workers

Una delegación termina con el worker retirado — tab cerrada. Mantén un worker que reportó
disponible mientras revisas/integras su resultado si vienen follow-ups. Retíralo al
registrar la disposición y terminar ese trabajo:

```bash
herdr tab close <tab_id>
```

Cerrar el tab termina la sesión TUI y su scrollback — registra primero lo que el ledger
necesite (texto de report, refs de línea, salida de comandos). Archivos, diffs y
worktrees sobreviven en disco. Un worker permanece abierto mientras corre, está bloqueado,
espera follow-ups de integración planeados, su pantalla es evidencia de un fallo sin
resolver, o el usuario pide inspeccionarlo — registra la razón. La orquestación está
completa solo cuando `herdr agent list` no muestra workers vivos de este controlador.

## Condiciones de parada

Detente y reporta (no improvises) cuando:

- herdr rechaza un ref válido de workspace/tab/pane, o `herdr status` no muestra server
  corriendo.
- un worker TUI rechaza el alias de modelo, estado de auth, directorio de trabajo o un
  flag de arranque — reporta el bloqueo exacto y obtén aprobación antes de degradar modelo
  o cambiar herramienta.
- la auth bloquea la TUI.
- el status de un worker queda `unknown` mientras el output scrollea y `agent explain` no
  muestra regla coincidente — la detección está rota o el pane corre un proceso headless.
- una línea de estado plan-mode o menú de aceptación no puede confirmarse vía `agent read`
  o `pane wait-output`, o el plan de un worker sale de scope tras una ronda de re-planning.
- los workers necesitan ediciones solapadas que el controlador no puede integrar con
  seguridad.
- una tarea necesita verbos herdr que cambian focus y el usuario no los aprobó.

## Plan-first delegation (opt-in)

Solo cuando el usuario la active (ask explícito "plan first"/"plan mode" o flag
`--plan-mode`). El default es directo. Cuando esté activada, lee
[`plan-mode.md`](subagents-opencode/plan-mode.md) (la referencia de lanzamiento y
aceptación plan-first para claude/codex) antes de lanzar un worker plan-first.

## Capacidades por harness

Ver [`subagents-harness-capabilities.md`](../subagents-harness-capabilities.md) — matriz
harness-agnostic (subagents, cross-session messaging, worktrees `.agents/worktrees`,
workflows, channels). La convención de worktrees es `.agents/worktrees`.

## Referencias

- superpowers/subagent-driven-development: https://github.com/obra/superpowers/blob/main/skills/subagent-driven-development/SKILL.md
- herdr-orchestration (compozy/kb): https://github.com/compozy/kb/tree/main/.agents/skills/herdr-orchestration
- herdr agent guide: https://herdr.dev/agent-guide.md
- herdrm: https://github.com/missuo/herdrm
