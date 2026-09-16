/**
 * Review Loop Dispatcher — punto de entrada único que enruta el reviewer al
 * proveedor que `REVIEWER_PROVIDER` selecciona.
 *
 * ─── Decisión de extracción (importante) ─────────────────────────────────────
 *
 * El plugin OpenClaw original tenía un dispatcher que soportaba DOS kinds de
 * proveedor (`gemini-direct` → `runGeminiReviewLoop`, `openai-compatible` →
 * `runOpenAIReviewLoop`) más un dispatcher de ENSEMBLE (`runEnsembleReview`) que
 * corría N lanes en paralelo y mergeaba findings.
 *
 * Heimdall se extrae con foco en el DRY-RUN sobre Kimi K2.6 vía NVIDIA NIM,
 * que es un lane `openai-compatible`. Por eso este dispatcher es SLIM: solo
 * soporta el kind `openai-compatible`. Esto evita arrastrar al package:
 *   - `gemini-agent-loop.ts` (wire Gemini-native), que a su vez importa
 *     `sentry.ts` (telemetría Sentry — fuera de scope, YAGNI).
 *   - `review-merge.ts` + el ensemble, que forman un ciclo de imports con este
 *     archivo y solo aplican cuando ≥2 lanes corren en paralelo.
 *
 * TODO(gemini-lane): re-incorporar el lane `gemini-direct` extrayendo
 *   `gemini-agent-loop.ts` con un seam de telemetría (en vez de Sentry directo).
 *   Sería aditivo: una rama más en el switch de `provider.kind`.
 * TODO(ensemble): re-incorporar `runEnsembleReview` + `review-merge.ts` cuando
 *   se quiera correr multi-lane. El registry multi-lane + fallback-chain YA está
 *   presente en `reviewer-providers.ts` (se conservó completo), así que el
 *   trabajo restante es solo el dispatcher de merge.
 *
 * Mientras tanto, si `REVIEWER_PROVIDER` apunta a un lane `gemini-direct`, este
 * dispatcher lanza un error explícito en vez de fallar de forma confusa.
 *
 */

import type { ToolDefinition } from "./agent-loop.ts"
import { runOpenAIReviewLoop } from "./openai-agent-loop.ts"
import type { OpenAIReviewLoopResult } from "./openai-agent-loop.ts"
import { selectReviewerProvider } from "./reviewer-providers.ts"
import type { ReviewerProvider } from "./reviewer-providers.ts"

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Opciones del loop agnósticas al proveedor. El dispatcher provee `apiKey`,
 * `model` y `baseURL` desde el proveedor seleccionado — los callers no pueden
 * sobreescribirlos, manteniendo `REVIEWER_PROVIDER` como única fuente de verdad
 * de qué lane corre.
 */
export interface ReviewLoopOptions {
  /** Texto de la system instruction. */
  systemInstruction: string
  /** Prompt inicial del usuario. */
  userPrompt: string
  /** Definiciones de tools en la forma canónica formato-OpenAI del plugin. */
  tools: ToolDefinition[]
  /** Ejecuta una tool por nombre y devuelve el resultado como string. */
  executeTool: (name: string, args: Record<string, unknown>) => Promise<string>
  /** Máximo de iteraciones del loop antes del corte forzado (default: 10). */
  maxIterations?: number
  /** Logger opcional. */
  logger?: { debug: (msg: string) => void; warn: (msg: string) => void }
  /**
   * Proveedor inyectado opcional — bypassa la selección por env. Usado por
   * tests; los callers de producción lo dejan undefined para que corra
   * `selectReviewerProvider()`.
   */
  provider?: ReviewerProvider
}

/**
 * Forma de resultado uniforme. En el dispatcher slim solo existe el lane
 * OpenAI-compatible, así que el resultado es directamente
 * `OpenAIReviewLoopResult`. (En el plugin original esto era una unión con
 * `GeminiReviewLoopResult`.)
 */
export type ReviewLoopResult = OpenAIReviewLoopResult

// ─── Dispatcher ───────────────────────────────────────────────────────────────

/**
 * Selecciona un proveedor y corre el loop OpenAI-compatible.
 *
 * @throws Error si `REVIEWER_PROVIDER` es inválido o falta la api key requerida
 *   (ver `selectReviewerProvider`).
 * @throws Error si el proveedor seleccionado es `gemini-direct` (no soportado en
 *   el dispatcher slim — ver el docblock del módulo).
 * @throws Error si la llamada HTTP del loop devuelve una respuesta no-ok.
 */
export async function runReviewLoop(options: ReviewLoopOptions): Promise<ReviewLoopResult> {
  const provider = options.provider ?? selectReviewerProvider()
  options.logger?.debug(`review-loop: dispatching to provider=${provider.label}`)

  if (provider.kind === "gemini-direct") {
    throw new Error(
      `review-loop: el lane gemini-direct no está soportado en Heimdall (dispatcher slim). ` +
        `Usá un lane openai-compatible (p.ej. REVIEWER_PROVIDER=nim-kimi). Ver TODO(gemini-lane) en review-loop.ts.`,
    )
  }

  // openai-compatible — NIM y cualquier otro endpoint con forma OpenAI.
  if (!provider.baseURL) {
    // Defensa en profundidad: el registry garantiza baseURL para los kinds
    // openai-compatible, pero lanzar aquí hace que una entrada mal registrada
    // truene fuerte en vez de POSTear silenciosamente a `undefined/chat/completions`.
    throw new Error(`review-loop: provider ${provider.id} is openai-compatible but has no baseURL`)
  }

  return runOpenAIReviewLoop({
    apiKey: provider.apiKey,
    baseURL: provider.baseURL,
    model: provider.model,
    systemInstruction: options.systemInstruction,
    userPrompt: options.userPrompt,
    tools: options.tools,
    executeTool: options.executeTool,
    maxIterations: options.maxIterations,
    logger: options.logger,
  })
}
