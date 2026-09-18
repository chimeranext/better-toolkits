# Routing de OpenRouter (Fusion / free / `:free` / Pareto)

OpenRouter es un endpoint **OpenAI-compatible** (`POST
https://openrouter.ai/api/v1/chat/completions`, `Authorization: Bearer
$OPENROUTER_API_KEY`, un solo key). Heimdall ya rutea sus lanes Granite por
ahí reusando `openai-agent-loop.ts` sin cliente a medida. Esta decisión cubre los
**mecanismos de routing** que OpenRouter ofrece por encima de "un slug = un
modelo", qué se mapea al registry hoy (fase 1) y qué queda diferido (fase 2).

## Los mecanismos

OpenRouter expone cuatro formas de elegir/combinar modelos. Tres se seleccionan
con el **slug del modelo**; Fusion además necesita un bloque `plugins` en el body.

### 1. `:free` variants — modelo fijo, tier gratis

Sufijo `:free` al slug normal (ej. `deepseek/deepseek-r1:free`,
`qwen/qwen3-coder:free`). Selecciona **un modelo concreto** en su tier gratuito.
Es el mecanismo más simple: misma forma de wire que cualquier slug, sólo cambia el
costo y el rate-limit. La disponibilidad del tier `:free` **rota**, así que un slug
puede dejar de existir; el lane que devuelve 404 se salta.

### 2. Free router — `openrouter/free`

Un slug especial que elige **al azar entre los free models filtrados por
capability** (tool-calling, vision, structured outputs). No hay que nombrar un
modelo: OpenRouter rota entre los gratuitos que cumplen la capacidad pedida.
Ventaja: tolerante a la rotación de modelos individuales. Desventaja:
**rate-limit bajo y latencia variable** — el modelo concreto cambia entre
requests.

### 3. Fusion router — `openrouter/fusion`

Corre un **panel de N modelos (1–8) + un juez** que compara las salidas
(consenso / contradicciones / brechas) y sintetiza una respuesta. Se configura con
un bloque `plugins` en el body:

```jsonc
{
  "model": "openrouter/fusion",
  "messages": [ /* ... */ ],
  "plugins": [
    {
      "id": "fusion",
      "analysis_models": ["...", "..."], // 1–8 modelos del panel
      "model": "...",                     // el juez/sintetizador
      "max_tool_calls": 8,
      "temperature": 0.2,
      "reasoning": { /* ... */ }
    }
  ]
}
```

Cuesta **~4-5× una completion normal** (paga el panel + el juez). El panel+juez
**se solapa conceptualmente con el ensemble casero** de Heimdall
(`selectEnabledLanes` + merge de findings) — ver la decisión native-fusion vs
homegrown abajo.

### 4. Pareto router — fase 2

Estrategia de **frontera costo/calidad** (elige el modelo más barato que alcanza
la calidad pedida). No fetcheamos el doc; el mecanismo es análogo a los otros
routers (slug especial o routing params). Se documenta como fase 2 junto con
Fusion.

## Mapeo a Heimdall

El registry (`src/lib/reviewer-providers.ts`) ya modela proveedores
OpenAI-compatible con `kind: "openai-compatible"`, `baseURL`
(`openrouter.ai/api/v1`) y `apiKeyEnv: OPENROUTER_API_KEY`. Agregar un lane
OpenRouter es **una entrada de registry + un kill-switch**, sin secreto nuevo ni
forma de wire nueva.

### Fase 1 (este cambio, bajo riesgo)

Lanes agregados, todos `openai-compatible` / `OPENROUTER_API_KEY` / default OFF:

| Lane | Slug | Uso |
| --- | --- | --- |
| `openrouter-kimi-k2.7-code` | `moonshotai/kimi-k2.7-code` | Coder-tuned; encaja en el pass adversarial (leer diff = tarea de coding). Más nuevo que el `kimi-k2.6` que corremos por NIM. |
| `openrouter-free` | `openrouter/free` | Free router. Diffs chicos / dev. |
| `openrouter-deepseek-r1-free` | `deepseek/deepseek-r1:free` | `:free` variant tool-calling-capable. |
| `openrouter-qwen3-coder-free` | `qwen/qwen3-coder:free` | `:free` variant tool-calling-capable. |

!!! warning "Verificar los slugs contra el catálogo vivo"
    Los slugs salen de los docs de OpenRouter, **no** de un probe del catálogo —
    este repo no tiene el key. Antes de promover cualquiera a default, validá
    contra `GET /api/v1/models`. Los `:free` rotan disponibilidad.

### Fase 2 (diferido — el campo `extraBody`)

Fusion y Pareto necesitan pasar **`plugins` (Fusion) y routing params**
(`provider.sort`, `route`, `models[]`) en el body. Para eso hace falta un campo
nuevo en el descriptor:

```ts
interface ProviderDescriptor {
  // ...
  extraBody?: Readonly<Record<string, unknown>> // fase 2
}
```

En este cambio el campo **ya existe** en `ProviderDescriptor` y en
`ReviewerProvider` (y se propaga por `selectReviewerProvider` /
`selectEnabledLanes`), pero **ningún lane lo setea** y `openai-agent-loop.ts`
**no lo lee**. Es terreno preparado, no cableado. El POST en `callOpenAI`
hardcodea hoy `{ model, messages, tools, tool_choice }`; cablear fase 2 es
mergear `...provider.extraBody` ahí (con `extraBody` ganando o perdiendo según la
política que se decida) y registrar un lane `openrouter-fusion` con su
`plugins`.

## Los 3 caveats

### 1. Tool-calling — la loop depende de `bifrost_github_*`

El loop de review **no es one-shot**: itera llamando tools
(`bifrost_github_pr_read`, `bifrost_github_review_post`). Cada lane DEBE soportar
tool-calling o la loop no converge.

- **`:free` variants y free router**: el free router filtra por capability, así
  que se le puede pedir tool-calling; igual hay que verificar que el modelo
  concreto que rota lo respete.
- **Fusion**: incógnita. Si Fusion **no propaga tool-calls** al panel, NO sirve
  para la loop multi-tool — sólo para **síntesis one-shot** (ej. resumir N
  reviews ya emitidos). Esa es la razón de fondo para diferir Fusion: no
  sabemos aún si encaja en la loop o sólo en un paso de síntesis.

### 2. Rate-limit de los free models

El reviewer es **token-hungry (~400k tokens/review)**. Los free models tienen
rate-limit bajo → **se saturan en PRs grandes**. Regla: free lanes para **diffs
chicos / dev**, nunca como lane primario en un repo activo.

### 3. Costo de Fusion ~4-5×

Fusion paga panel + juez, **~4-5×** una completion. A escala de CI (un review por
push) eso multiplica el gasto. Hay que medir el trade-off contra el ensemble
casero antes de adoptarlo.

## Decisión: Fusion native vs ensemble homegrown

Fusion (panel + juez) **se solapa** con lo que Heimdall ya hace:
`selectEnabledLanes` corre múltiples lanes y se mergean los findings. Antes de
adoptar `openrouter/fusion` hay que decidir:

- **Native Fusion**: menos código propio, pero ata el ensemble a un vendor, paga
  ~4-5×, y su soporte de tool-calling es incógnita.
- **Homegrown**: ya existe, controla el merge y el fail-closed, corre cualquier
  mezcla de lanes (NIM + OpenRouter + Gemini), pero hay que mantenerlo.

Por ahora **se mantiene el ensemble homegrown**; Fusion queda como opción de
síntesis one-shot a evaluar en fase 2, no como reemplazo del ensemble.

## Resumen del estado

- **Fase 1 (este cambio):** 4 lanes OpenRouter de routing/coding, todos default
  OFF, reusando key + baseURL + loop existentes. Campo `extraBody?` declarado
  pero sin cablear.
- **Fase 2 (diferido):** wiring de `extraBody`/`plugins` en
  `openai-agent-loop.ts`, lane `openrouter-fusion`, router Pareto, y la decisión
  native-fusion vs homegrown.
