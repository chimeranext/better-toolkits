# /new-storyboard — protocol SSOT

Harness-agnostic body. Thin entry: `commands/new-storyboard.md`.

---

# /new-storyboard — Storyboard de Producción de Video

Convierte un `video-brief.md` ya completado (con script teleprompter-ready
y filming outline) en un storyboard accionable por un pipeline de
automatización de video.

El comando NO llama APIs externas (HeyGen / Higgsfield / Kling / Gemini
Omni). Solo genera los **prompts** que esas APIs consumirán downstream. La
integración real es out-of-scope.

Salida dual:

1. Una sección `## Storyboard` **agregada** al mismo `video-brief.md`
   (append, nunca overwrite) — tabla legible para humanos.
2. Un JSON sidecar en `<video-brief-stem>.storyboard.json` — consumible
   por el pipeline de automatización.

El argumento (`$ARGUMENTS`) debe ser un path a un `video-brief.md`
existente con script completo. Si el script todavía no existe, sugerí al
usuario correr `/write-video-script <path>` primero.

---

## Phase 1 — Context Loading

1. **Resolvé el path.** Tomá `$ARGUMENTS` como path al `video-brief.md`.
   Si está vacío, pedile al usuario el path. Si el archivo no existe,
   abortá con un mensaje claro.
2. **Leé el video brief completo.** Extraé del YAML frontmatter:
   - `title` (o el `# Heading` si no está en frontmatter)
   - `video_format` (`talking_head` | `screen_recording`)
   - `duration_seconds`
   - `au_id` (identificador estable cmi5/xAPI — Layer 1 invariante)
   - `activity_type` (e.g. `.../media`)
   - `purpose` o `objective` (si declarado — calibra el ratio 80/20)
3. **Localizá la sección de script.** Buscá `## Script — Talking Head`
   o `## Script — Screen Recording` (según `video_format`). Esa es la
   fuente de verdad para la descomposición.
4. **Marcá scene tags ya presentes en el script.** El brief puede traer
   tags como `[CAMERA ONLY]`, `[SLIDES + PIP]`, `[LIVE DEMO]` (formato
   neutralizado de `write-video-script.md`). Indexá su posición — son
   pistas fuertes para la clasificación A-ROLL / B-ROLL en Phase 2,
   no decisiones finales.
5. **Idempotencia.** Si el archivo ya contiene una sección
   `## Storyboard`, preguntá al usuario:
   - Reemplazar el storyboard existente (borra la sección actual y
     regenera).
   - Abortar (mantener el storyboard existente intacto).
   - No asumas; esperá respuesta explícita.

Si cualquiera de los campos críticos (`au_id`, `video_format`,
`duration_seconds`, script section) falta o está vacío, abortá con un
warning visible y sugerí volver a `/write-video-script` para completar
el brief.

---

## Phase 2 — Storyboard Plan

Descomponé el script en una secuencia numerada de escenas. Para cada
escena producí un registro provisional con estos campos:

- `n` — número de escena, 1-indexado.
- `type` — `A-ROLL` o `B-ROLL` (clasificación tentativa, sujeta al
  Review Gate de Phase 3).
- `duration_s` — duración estimada en segundos.
- `script_ref` — referencia textual al segmento exacto del script
  (timestamp si el brief los trae, o el índice de scene tag, e.g.
  `script:[CAMERA ONLY]#2`).
- `justification` — una sola oración explicando por qué A o B (regla
  pedagógica, no preferencia estética).
- `visual_style_hint` — descripción corta del estilo visual global que
  todas las escenas B-ROLL compartirán (declarar acá una vez, herencia
  para toda la corrida).

### Reglas de clasificación inicial

- **A-ROLL** por default para: hook de apertura, intro narrativa,
  cierre + CTA, anécdotas personales, transiciones emocionales.
- **B-ROLL** por default para: conceptos técnicos abstractos, diagramas
  animables, demos de producto, metáforas visuales, datos cuantitativos.
- **80/20 calibrado por `video_format` y `purpose`:**
  - Clase narrativa / emocional / kickoff → ratio ~80% A-ROLL.
  - Clase técnica / tutorial / explainer → ratio ~80% B-ROLL.
  - Hybrid → reportá el ratio computado, no forces 80/20.
- **No asumas.** Si `purpose` no está declarado en el brief, marcá la
  decisión como "default 60/40 A-ROLL" y resaltala en el Review Gate.

### Estilo visual global

Declará `visual_style` una sola vez en el plan (e.g. "ilustración
isométrica minimalista, paleta análoga, sin texto en pantalla"). Todos
los prompts B-ROLL en Phase 4 heredarán ese estilo verbatim — esa es
la herramienta principal contra la inconsistencia visual entre escenas.

---

## Phase 3 — Review Gate

Presentá el plan completo al usuario en formato resumido:

```
STORYBOARD PLAN — [title]
FORMAT: talking_head / screen_recording
DURATION: Xs total
RATIO: A escenas A-ROLL / B escenas B-ROLL — Z% A-ROLL
VISUAL STYLE: [el visual_style declarado]

SCENES:
  1. A-ROLL  · 30s · Hook — "[primera línea verbatim del script]"
  2. B-ROLL  · 45s · Diagrama del flujo de tres pasos
  3. A-ROLL  · 20s · Transición — "[línea verbatim]"
  ...
  N. A-ROLL  · 25s · CTA — "[línea verbatim]"
```

Preguntá al usuario:

- ¿El ratio A-ROLL/B-ROLL refleja la intención del video?
- ¿Falta o sobra alguna escena?
- ¿El `visual_style` declarado encaja con la identidad visual del
  curso / del consumer?

**Esperá aprobación explícita** antes de avanzar a Phase 4. Si el
usuario pide cambios, iterá sobre el plan y volvé a presentar — no
saltes a generar prompts con un plan inestable.

---

## Phase 4 — Prompt Generation

Una vez aprobado el plan, generá los prompts finales para cada escena.

### Prompts A-ROLL (formato HeyGen Avatar Clone)

Para cada escena A-ROLL, producí un objeto con esta forma:

```yaml
type: A-ROLL
encuadre: primer plano | plano medio | plano americano
emotional_state: ej. "energía alta, sonrisa contenida, mirada directa a cámara"
lipsync_text: |
  Texto verbatim del script — debe coincidir palabra por palabra con
  el segmento referenciado. NO parafrasear. NO comprimir.
script_ref: script:[CAMERA ONLY]#2 (o timestamp 00:01:30)
duration_s: 30
```

Reglas para A-ROLL:

- **Encuadre** se elige según función dramática: primer plano para
  momentos emocionales o de énfasis, plano medio para narración
  estándar, plano americano para storytelling con gestos.
- **Lipsync text es verbatim.** Cualquier reescritura rompe la
  sincronía con el script aprobado y obliga a regrabar audio.
- **Emotional state es prescriptivo, no descriptivo.** Indicá al
  Avatar qué hacer, no qué "suele hacer".

### Prompts B-ROLL (formato Higgsfield + Kling Draw-to-Image)

Para cada escena B-ROLL, producí un objeto con esta forma:

```yaml
type: B-ROLL
visual_description: |
  Descripción detallada del frame inicial — composición, sujetos,
  acción principal, encuadre. Sin texto en pantalla salvo que se
  pida explícitamente.
camera_motion: ej. "slow push-in", "static", "lateral pan izquierda a derecha"
visual_style: [hereda del plan de Phase 2 — verbatim]
duration_s: 45
script_ref: script:[SLIDES + PIP]#3
```

Reglas para B-ROLL:

- **`visual_style` se hereda verbatim** del declarado en Phase 2. Si
  un prompt B-ROLL omite o muta el `visual_style`, el validador de
  Phase 5 aborta.
- **Movimiento de cámara explícito.** "Static" es una decisión válida
  y debe declararse — no dejes el campo vacío.
- **Sin texto en pantalla por default.** Si el concepto requiere
  texto (e.g. una fórmula), declarado explícito; si no, prohibido.

---

## Phase 5 — Quality Rules Validator

Antes de escribir cualquier archivo, corré estas validaciones contra
los prompts generados en Phase 4. Si alguna falla, mostrá el error
claro al usuario y abortá la escritura.

### Regla 1 — Ratio 80/20 coherente

Computá el ratio real (`A-ROLL count / total`). Comparalo con la
expectativa derivada de `video_format` + `purpose`:

- Si el brief declara `purpose: narrative` / `emotional` / `kickoff` y
  el ratio A-ROLL es < 60%, emití warning visible (no aborta, pero
  pedile confirmación al usuario antes de continuar).
- Si el brief declara `purpose: technical` / `tutorial` y el ratio
  B-ROLL es < 60%, mismo warning.

### Regla 2 — Consistencia visual global

Verificá que todos los objetos B-ROLL tengan `visual_style` idéntico
al declarado en Phase 2. Cualquier drift → **abortá** con un mensaje
nombrando la escena ofensora y el delta exacto.

### Regla 3 — Sincronía A-ROLL ↔ script

Verificá que cada prompt A-ROLL tenga `lipsync_text` no vacío y un
`script_ref` resolvible al segmento de script real. Si no se resuelve
→ abortá nombrando la escena.

### Regla 4 — Campos requeridos

Cada escena (A o B) debe tener: `n`, `type`, `duration_s`,
`script_ref`. Faltante → abortá.

### Regla 5 — Suma de duraciones

La suma de `duration_s` de todas las escenas debe estar dentro de
±10% de `duration_seconds` del brief. Drift mayor → warning visible
(no aborta, pero deja el delta registrado en el plan).

---

## Phase 6 — Output

Cuando todas las reglas de Phase 5 pasan, escribí los dos artefactos.

### Artefacto 1 — Append `## Storyboard` al `video-brief.md`

Localizá el final de la sección `## Recording Notes` (o equivalente)
en el brief. Agregá **después** una nueva sección con esta forma:

```markdown
## Storyboard

> Visual style global: [el visual_style declarado en Phase 2]
> Ratio: A escenas A-ROLL / B escenas B-ROLL — Z% A-ROLL
> Generado por `/new-storyboard` el [fecha ISO].

| Escena | Tipo (A/B) | Prompt de Generación | Referencia Script |
|--------|------------|----------------------|-------------------|
| 1 | A-ROLL | Primer plano · estado "energía alta, mirada directa" · lipsync "..." | `script:[CAMERA ONLY]#1` |
| 2 | B-ROLL | Ilustración isométrica · slow push-in · "diagrama de tres pasos animado" | `script:[SLIDES + PIP]#2` |
| ... | ... | ... | ... |
```

**Append, nunca overwrite.** Si la idempotencia de Phase 1 detectó un
storyboard previo y el usuario aprobó reemplazar, borrá la sección
existente antes de escribir la nueva — pero nunca toques el resto del
archivo.

Preservá el YAML frontmatter del brief intacto.

### Artefacto 2 — Sidecar JSON

Escribí un archivo en la misma carpeta que el brief, con el mismo stem
y extensión `.storyboard.json`. Ejemplo: si el brief es
`content/courses/foo/video-01-intro.md`, el sidecar es
`content/courses/foo/video-01-intro.storyboard.json`.

Forma:

```json
{
  "video_au_id": "urn:chimera:au:foo/video-01-intro",
  "video_title": "Intro al curso",
  "video_format": "talking_head",
  "duration_seconds": 240,
  "visual_style": "ilustración isométrica minimalista, paleta análoga, sin texto en pantalla",
  "ratio": { "a_roll": 6, "b_roll": 4, "a_roll_percent": 60 },
  "generated_at": "2026-06-01T12:00:00Z",
  "scenes": [
    {
      "n": 1,
      "type": "A-ROLL",
      "duration_s": 30,
      "script_ref": "script:[CAMERA ONLY]#1",
      "prompt": {
        "encuadre": "primer plano",
        "emotional_state": "energía alta, mirada directa a cámara",
        "lipsync_text": "Vamos a hablar de la decisión que va a definir tu próximo año."
      }
    },
    {
      "n": 2,
      "type": "B-ROLL",
      "duration_s": 45,
      "script_ref": "script:[SLIDES + PIP]#2",
      "prompt": {
        "visual_description": "Diagrama animado de tres nodos conectados sobre fondo neutro",
        "camera_motion": "slow push-in",
        "visual_style": "ilustración isométrica minimalista, paleta análoga, sin texto en pantalla"
      }
    }
  ]
}
```

Reglas del sidecar:

- `video_au_id` es **Layer 1 invariante** — copialo verbatim del
  brief, no lo recompongas.
- `visual_style` se duplica a nivel de cada B-ROLL para que el pipeline
  pueda procesar escenas en paralelo sin perder el contexto global.
- Los campos `prompt` son distintos según `type`. El consumer del JSON
  ya sabe cómo discriminar — no normalices la forma.

Si la escritura del sidecar falla (permisos, disco lleno), abortá y
**revertí** el append al `video-brief.md` para preservar atomicidad.

Al terminar, reportá al usuario:

- Path del brief actualizado.
- Path del sidecar.
- Conteo de escenas (A / B / total) y ratio final.
- Cualquier warning de Phase 5 que no haya abortado.

---

## Overlay invocation (post-base-draft)

Después de producir el base draft de este comando (la tabla
`## Storyboard` neutral y el sidecar JSON L1+L2), seguí
`${CLAUDE_PLUGIN_ROOT}/assets/runtime/overlay-protocol.md` para
descubrir y aplicar overlays del consumer. El runtime camina
`<cwd>/.claude-plugin/plugin.json`, busca skills que declaren
`overlay_target: ["new-storyboard"]` en su frontmatter, los ordena por
`overlay_priority` y los aplica en orden.

Para este comando, esperá (cuando un consumer está instalado):

- **Overlays estructurales (prioridad ~50)** — pueden agregar
  validaciones extra (ej. duración por escena, mínimo de scenes B-ROLL
  para clases técnicas), enforce de un `visual_style` particular,
  enriquecer el script_ref con timestamps absolutos.
- **Overlays de voz / editorial (prioridad ~100)** — pueden inyectar
  guía de tono para el `emotional_state` de A-ROLL ("alta energía,
  estilo broadcaster"), o restricciones de identidad visual ("paleta
  corporativa exacta", "logo de cierre obligatorio en última escena").

### Invariantes Layer 1 inmutables

Los overlays NO pueden mutar:

- `video_au_id` del JSON sidecar.
- `activity_type` del brief.
- Los IDs estables de escena (`scene-1`, `scene-2`, … o `n: 1`, `n: 2`).
- `duration_seconds` total del brief.

Cualquier intento de mutación aborta la corrida con error claro
apuntando al `SKILL.md` del overlay ofensor (consistente con §5 del
overlay-protocol).

### Contradicciones Layer 2 → warning visible, no abort

Ejemplos: un prompt B-ROLL queda sin `visual_style` post-overlay; un
A-ROLL queda sin `encuadre`; el ratio computado se desvía del declarado
inicialmente. El runtime emite warning visible (consistente con §6.1
del overlay-protocol) pero no aborta — el output base sigue siendo
válido, el overlay simplemente no completó su transform.

### Token de plugin no resoluble

Si `${CLAUDE_PLUGIN_ROOT}` aparece como literal en lugar de expandirse
a un path real (caso de invocación CLI directa fuera del contexto de
plugin install), el comando DEBE:

1. Detectar la falla de resolución (ej. read fail con "no such file
   or directory").
2. Emitir un **warning visible** en la respuesta nombrando el token y
   el path esperado.
3. Saltar la invocación de overlays graciosamente y entregar el base
   draft (tabla + sidecar) sin transforms del consumer.
4. NO crashear. NO producir un base draft silenciosamente como si no
   hubiera overlays instalados — eso borra la distinción entre "no
   hay overlays" y "el subsistema de overlays no es alcanzable".

§6.1 de `assets/runtime/overlay-protocol.md` es autoritativo; este
bloque es solo un puntero.

---

## Notas de diseño

- Este comando NO comparte código ni convenciones con
  `ux-research-toolkit/skills/storyboard/SKILL.md`. Misma palabra,
  dominios distintos: UXRT-storyboard es narrativo (mapa de
  experiencia), IDT-storyboard es de producción de video (shot list
  para HeyGen + Higgsfield). No cross-pollinar.
- El consumer es libre de extender el formato del sidecar JSON via
  overlays, pero los campos Layer 1 (`video_au_id`, `activity_type`,
  `n`, `type`, `duration_s`) son contrato — los pipelines downstream
  los esperan tal cual.
- La integración con HeyGen / Higgsfield / Kling / Gemini Omni es
  out-of-scope. Si en el futuro un agent file orquesta una propuesta
  de scenes desde un thumbnail (Gemini Omni vision), eso es un PR
  separado con justificación propia — no entra acá.
