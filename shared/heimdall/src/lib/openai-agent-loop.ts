/**
 * OpenAI-Compatible Agent Loop — direct tool-calling loop against any
 * OpenAI-compatible `/chat/completions` endpoint.
 *
 * This is the OpenAI-shape parallel of `src/lib/gemini-agent-loop.ts`. It
 * exists so can route the reviewer to NVIDIA NIM (one endpoint, 117
 * models) — and any other OpenAI-compatible provider — without going through
 * the gateway. The gateway path (v2026.5.7) cannot drive gemini-3.5-flash
 * thinking, and adding "yet another provider" through that path
 * would just inherit the same fragility.
 *
 * The shapes here intentionally diverge from the Gemini loop where the wire
 * protocols differ:
 *   - Tools are passed as `{ type: "function", function: {...} }` (already the
 *     plugin's canonical `ToolDefinition` shape, so no conversion needed).
 *   - Tool calls come back on `choices[0].message.tool_calls` with a stringified
 *     `arguments` JSON blob — we parse it before invoking `executeTool`.
 *   - Tool results are appended as `{ role: "tool", tool_call_id, content }`
 *     messages, NOT as a `functionResponse` part.
 *
 * The result shape matches `GeminiReviewLoopResult` (toolCalls, iterations,
 * tokenUsage, reviewPosted) so `runReviewLoop()` in `review-loop.ts` can fan
 * the two providers into a uniform return type — callers in `chat.ts` /
 * `github-webhook.ts` do not need to branch on provider kind.
 *
 * ─── OpenAI wire format quirks (relative to the Gemini-native loop) ──────────
 *
 *   • `arguments` arrives as a STRINGIFIED JSON blob on `tool_calls[].function.arguments`,
 *     not a typed object. We `JSON.parse` it locally (see `parseArgs` below);
 *     Gemini's `functionCall.args` is already a `Record<string, unknown>`.
 *     This is the OpenAI tool-calling spec; NIM and OpenRouter both follow it
 *     verbatim. Do NOT assume parsed shape — wrap in try/catch with a
 *     no-throw fallback (the loop logs the malformed args and treats the
 *     call as `{}`).
 *
 *   • Assistant message replay: NIM enforces strict `role`/`content`/`tool_calls`
 *     coherence — the next turn must see the model's assistant message EXACTLY
 *     as emitted (same `tool_calls` array, same `content`). We push
 *     `{ role: "assistant", content, tool_calls }` verbatim back into
 *     `messages` rather than reconstructing. Skip this and NIM rejects the
 *     follow-up with a 400 "messages out of order" error. OpenAI's own
 *     `chat/completions` endpoint is lenient about this, but assuming NIM
 *     parity costs nothing.
 *
 *   • `tool_choice` is strictly typed as `"auto" | "required" | { type: "function", function: { name } }`.
 *     This is the OpenAI spec. NIM passes it through unmodified; OpenRouter
 *     passes it to the routed upstream provider, which MAY or MAY NOT respect
 *     `required` / forced-function depending on the model. The forced-APPROVE
 *     turn at the loop end uses the explicit-name form, which is the most
 *     widely supported across providers. If a future upstream rejects this
 *     shape, fall back to `"required"` + post-prompt nudging.
 *
 *   • `response.provider` field is OPTIONAL and OpenRouter-only. NIM and
 *     stock OpenAI do NOT emit it. OpenRouter populates it with the actual
 *     upstream provider that served the request (e.g. "Together", "Fireworks",
 *     "Replicate") — same model slug + same key may hit different upstreams
 *     across requests as OpenRouter routes opportunistically. We log it when
 *     present so post-mortems can attribute weird outputs to a specific
 *     upstream. If you ever see "Confidence: 5/5" drift between sibling
 *     reviews on the same lane, check the `provider=...` log line.
 *
 *   • Fail-closed reviewer split is SYMMETRIC to
 *     `gemini-agent-loop.ts`. Both lanes pin the forced turn to
 *     `bifrost_github_review_post` (Gemini via
 *     `toolConfig.functionCallingConfig.mode="ANY"`, this lane via
 *     `tool_choice: { type:"function", function:{ name } }`) and both make the
 *     SAME fail-open vs fail-closed decision after the loop ends without a
 *     posted review:
 *       — NATURAL completion (model stopped calling tools on its own) → force an
 *         APPROVE. A clean PR ALWAYS gets a visible APPROVE no matter which lane
 *         ran. This branch is fail-OPEN and correct.
 *       — BUDGET EXHAUSTION (loop hit `maxIterations` / got a degraded response
 *         without converging) → run ONE adaptive second pass reusing the diff
 *         already in `messages` (no re-read), then if STILL no review, fail
 *         CLOSED with a non-approving COMMENT — never a false `Confidence: 5/5`.
 *     Earlier revisions of this lane unconditionally forced an APPROVE whenever
 *     `!reviewPosted`, which rubber-stamped a PR on iteration-budget exhaustion
 *     (the exact bug fixed on the Gemini lane first). Do NOT collapse
 *     this back to an unconditional APPROVE, and do NOT weaken the COMMENT
 *     fail-closed branch, without removing the matching logic on the Gemini side
 *     in the same change. Shared nudge wording + the second-pass budget live in
 *     `reviewer-loop-nudges.ts`.
 *
 * ─── What this loop intentionally OMITS (provider gaps, not bugs) ────────────
 *
 *   • No streaming. Each turn is a single non-streaming `/chat/completions`
 *     POST. The reviewer is headless backend — no SSE consumer downstream.
 *     Adding streaming would buy nothing and complicate accumulation.
 *
 *   • No `response_format: { type: "json_object" }`. The model's output is
 *     either text or tool calls; we never need structured JSON output.
 *
 *   • No `seed` or `temperature` knobs surfaced. Defaults from the provider
 *     are acceptable for review quality; spend-control happens at the
 *     model-slug level (smaller model = lower cost), not via sampling tweaks.
 *
 */

import { TOOL_NAMES } from "./tool-names.ts"
import type {
  AgentLoopResult,
  ChatMessage,
  ToolCall,
  ToolCallRecord,
  ToolDefinition,
} from "./agent-loop.ts"
import {
  FORCE_APPROVE_NUDGE,
  FORCE_INCOMPLETE_COMMENT_NUDGE,
  RESUME_AND_POST_NUDGE,
  SECOND_PASS_BUDGET,
} from "./reviewer-loop-nudges.ts"

// ─── Types ───────────────────────────────────────────────────────────────────

/** Options for the OpenAI-compatible review loop. */
export interface OpenAIReviewLoopOptions {
  /**
   * Bearer token for the provider (NVIDIA_API_KEY for NIM, an OpenAI key for
   * openai.com, etc.). Caller resolves from env via `selectReviewerProvider`.
   */
  apiKey: string
  /**
   * Base URL up to (but not including) `/chat/completions`. The loop appends
   * the path itself. For NIM this is `https://integrate.api.nvidia.com/v1`.
   */
  baseURL: string
  /** Model slug as the provider expects it (e.g. `moonshotai/kimi-k2.6`). */
  model: string
  /** System instruction text — emitted as a `role: system` message. */
  systemInstruction: string
  /** Initial user prompt — emitted as a `role: user` message. */
  userPrompt: string
  /** Tool definitions in the plugin's canonical OpenAI-format shape. */
  tools: ToolDefinition[]
  /** Executes a tool by name and returns the result as a string. */
  executeTool: (name: string, args: Record<string, unknown>) => Promise<string>
  /** Max loop iterations before forced stop (default: 10). */
  maxIterations?: number
  /** Optional logger. */
  logger?: { debug: (msg: string) => void; warn: (msg: string) => void }
}

/** Result of a completed OpenAI-compatible review loop. */
export interface OpenAIReviewLoopResult extends AgentLoopResult {
  /** Accumulated token usage across all turns. */
  tokenUsage: {
    promptTokens: number
    candidatesTokens: number
    totalTokens: number
  }
  /** Whether the review_post tool was ever called. */
  reviewPosted: boolean
}

interface OpenAIChoice {
  message: {
    role: "assistant"
    content: string | null
    tool_calls?: ToolCall[]
  }
  finish_reason?: string
}

interface OpenAIUsage {
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens?: number
}

interface OpenAIChatResponse {
  choices?: OpenAIChoice[]
  usage?: OpenAIUsage
  /**
   * OpenRouter-only — the upstream provider OpenRouter routed the request to
   * (e.g. "Together", "Fireworks", "Replicate"). NIM and stock OpenAI don't
   * emit this field; we log it when present so a stale post-mortem can tell
   * which upstream actually served a request (OpenRouter routing can shift
   * silently across upstreams). Tracked in red flags.
   */
  provider?: string
}

/** Tool-choice modes — mirrors Gemini's FunctionCallingMode for the forced-APPROVE path. */
type ToolChoice = "auto" | "required" | { type: "function"; function: { name: string } }

// ─── Request ─────────────────────────────────────────────────────────────────

interface OpenAIRequestArgs {
  apiKey: string
  baseURL: string
  model: string
  messages: ChatMessage[]
  tools: ToolDefinition[]
  toolChoice: ToolChoice
}

/**
 * Send a single non-streaming `/chat/completions` request.
 *
 * @throws Error if the response is not ok (mirrors gemini-agent-loop.ts).
 */
async function callOpenAI(args: OpenAIRequestArgs): Promise<OpenAIChatResponse> {
  const url = `${args.baseURL.replace(/\/+$/, "")}/chat/completions`

  const body = {
    model: args.model,
    messages: args.messages,
    tools: args.tools,
    tool_choice: args.toolChoice,
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // hook-bypass: secret-leak — Authorization header value is the runtime
      // API key passed in by the caller, not a hardcoded credential.
      Authorization: `Bearer ${args.apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`OpenAI-compatible ${response.status}: ${await response.text()}`)
  }

  return (await response.json()) as OpenAIChatResponse
}

// ─── Agent Loop ──────────────────────────────────────────────────────────────

/**
 * Run the OpenAI-compatible review loop: send the messages + tools, execute
 * any `tool_calls`, append each result as a `role: tool` message, repeat
 * until the model stops calling tools or max iterations are reached.
 *
 * If the loop ends without `bifrost_github_review_post` ever being called, the
 * fail-closed split (symmetric with gemini-agent-loop) decides the
 * forced turn: a NATURAL completion forces a visible APPROVE (clean PR), while
 * BUDGET EXHAUSTION runs one adaptive second pass and then, if still no review,
 * fails CLOSED with a non-approving COMMENT — never a false APPROVE. Every
 * forced turn pins `tool_choice` to `review_post`.
 *
 * @throws Error if the provider returns a non-ok response.
 */
export async function runOpenAIReviewLoop(
  options: OpenAIReviewLoopOptions,
): Promise<OpenAIReviewLoopResult> {
  const {
    apiKey,
    baseURL,
    model,
    systemInstruction,
    userPrompt,
    tools,
    executeTool,
    maxIterations = 10,
    logger,
  } = options

  const messages: ChatMessage[] = [
    { role: "system", content: systemInstruction },
    { role: "user", content: userPrompt },
  ]
  const allToolCalls: ToolCallRecord[] = []

  let promptTokens = 0
  let candidatesTokens = 0
  let totalTokens = 0
  let reviewPosted = false
  let lastText = ""
  let iterations = 0

  const accumulateUsage = (usage: OpenAIUsage | undefined): void => {
    if (!usage) return
    promptTokens += usage.prompt_tokens ?? 0
    candidatesTokens += usage.completion_tokens ?? 0
    totalTokens += usage.total_tokens ?? 0
  }

  /** Parse `arguments` (a JSON string per OpenAI spec) into a record. */
  const parseArgs = (raw: string | undefined): Record<string, unknown> => {
    if (!raw || raw.length === 0) return {}
    try {
      const parsed = JSON.parse(raw)
      return typeof parsed === "object" && parsed !== null
        ? (parsed as Record<string, unknown>)
        : {}
    } catch {
      logger?.warn(`openai-agent-loop: tool args were not valid JSON: ${raw.slice(0, 200)}`)
      return {}
    }
  }

  /** Execute each tool call and append a `role: tool` message for each. */
  const runToolCalls = async (toolCalls: ToolCall[] | undefined): Promise<boolean> => {
    if (!toolCalls || toolCalls.length === 0) return false

    for (const call of toolCalls) {
      const fnName = call.function.name
      const fnArgs = parseArgs(call.function.arguments)
      const start = Date.now()
      let result: string

      try {
        logger?.debug(`openai-agent-loop: executing tool ${fnName}`)
        result = await executeTool(fnName, fnArgs)
        if (fnName === TOOL_NAMES.GITHUB_REVIEW_POST) reviewPosted = true

        allToolCalls.push({
          toolCallId: call.id,
          name: fnName,
          arguments: fnArgs,
          result: result.slice(0, 500),
          durationMs: Date.now() - start,
        })
      } catch (err) {
        result = `Tool execution failed: ${err instanceof Error ? err.message : String(err)}`
        logger?.warn(`openai-agent-loop: tool ${fnName} failed: ${result}`)
        allToolCalls.push({
          toolCallId: call.id,
          name: fnName,
          arguments: fnArgs,
          result,
          durationMs: Date.now() - start,
        })
      }

      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: result,
      })
    }

    return true
  }

  // ── Turn runner ────────────────────────────────────────────────
  // Runs up to `budget` model turns, executing tool calls each turn. Returns
  // `true` if the model completed NATURALLY (stopped calling tools — it decided
  // it was done) and `false` if it exhausted `budget` first or got a degraded
  // (no-message) response. That distinction drives the fail-closed policy below:
  // natural completion without a posted review is a clean PR; budget exhaustion
  // without one is a NON-converged review that must never be rubber-stamped into
  // a false APPROVE.
  const runTurns = async (budget: number): Promise<boolean> => {
    for (let turn = 0; turn < budget; turn++) {
      iterations++
      logger?.debug(`openai-agent-loop: iteration ${iterations} (turn ${turn + 1}/${budget})`)

      const response = await callOpenAI({
        apiKey,
        baseURL,
        model,
        messages,
        tools,
        toolChoice: "auto",
      })
      accumulateUsage(response.usage)
      if (response.provider) {
        // OpenRouter routing transparency (red flag #2): record which
        // upstream actually served the request so a stale post-mortem can tell
        // Together/Fireworks/Replicate apart. Empty/missing for NIM + OpenAI.
        logger?.debug(`openai-agent-loop: upstream=${response.provider}`)
      }

      const assistantMessage = response.choices?.[0]?.message
      if (!assistantMessage) {
        logger?.warn("openai-agent-loop: response had no choice message")
        return false // degraded — treat as non-natural so the fail-closed path runs
      }

      const text = (assistantMessage.content ?? "").trim()
      if (text) lastText = text

      // Push the assistant message verbatim so subsequent turns see the same
      // tool_calls the model emitted — required by OpenAI-compatible servers
      // that validate role/content/tool_calls coherence (NIM enforces this).
      messages.push({
        role: "assistant",
        content: assistantMessage.content ?? null,
        tool_calls: assistantMessage.tool_calls,
      })

      const hadCalls = await runToolCalls(assistantMessage.tool_calls)
      if (!hadCalls) return true // Model is done.
    }
    return false // budget exhausted without a natural stop
  }

  // Forced turn pinned to review_post (tool_choice → review_post). Used for BOTH
  // the clean-PR APPROVE and the fail-closed COMMENT — the nudge decides which
  // verdict.
  const forceReviewPost = async (nudge: string): Promise<void> => {
    messages.push({ role: "user", content: nudge })

    const forced = await callOpenAI({
      apiKey,
      baseURL,
      model,
      messages,
      tools,
      toolChoice: {
        type: "function",
        function: { name: TOOL_NAMES.GITHUB_REVIEW_POST },
      },
    })
    accumulateUsage(forced.usage)
    if (forced.provider) {
      logger?.debug(`openai-agent-loop: upstream=${forced.provider} (forced-APPROVE)`)
    }

    const forcedAssistant = forced.choices?.[0]?.message
    if (forcedAssistant) {
      messages.push({
        role: "assistant",
        content: forcedAssistant.content ?? null,
        tool_calls: forcedAssistant.tool_calls,
      })
      await runToolCalls(forcedAssistant.tool_calls)
    } else {
      logger?.warn("openai-agent-loop: forced review-post turn produced no message")
    }
  }

  const naturalCompletion = await runTurns(maxIterations)

  if (!reviewPosted) {
    if (naturalCompletion) {
      // Model stopped on its own without findings → genuinely clean PR.
      // Force a visible APPROVE (preserved pre-change behavior).
      logger?.debug("openai-agent-loop: clean completion, no review — forcing APPROVE")
      await forceReviewPost(FORCE_APPROVE_NUDGE)
    } else {
      // Budget exhausted before converging. One adaptive second pass reusing the
      // diff already in `messages` (no re-read) with a smaller budget.
      logger?.warn(
        `openai-agent-loop: max iterations (${maxIterations}) reached without a posted ` +
          `review — adaptive second pass (${SECOND_PASS_BUDGET})`,
      )
      messages.push({ role: "user", content: RESUME_AND_POST_NUDGE })
      await runTurns(SECOND_PASS_BUDGET)

      if (!reviewPosted) {
        // Still nothing → FAIL CLOSED with a non-approving COMMENT so an
        // incomplete review is never a false `Confidence: 5/5` APPROVE — the
        // inverse of the bug fixes.
        logger?.warn("openai-agent-loop: no review after second pass — failing closed with COMMENT")
        await forceReviewPost(FORCE_INCOMPLETE_COMMENT_NUDGE)
      }
    }
  }

  logger?.debug(
    `openai-agent-loop: done — ${iterations} iterations, ${allToolCalls.length} tool calls, ` +
      `tokens prompt=${promptTokens} candidates=${candidatesTokens} total=${totalTokens}`,
  )

  return {
    content: lastText,
    toolCalls: allToolCalls,
    iterations,
    tokenUsage: { promptTokens, candidatesTokens, totalTokens },
    reviewPosted,
  }
}
