/**
 * Agent Loop — Reusable tool-calling loop over OpenAI-compatible chat completions.
 *
 * The OpenClaw Gateway's /v1/chat/completions is a pure LLM proxy — it does NOT
 * run the plugin agent loop. This module fills that gap: it sends messages+tools
 * to the Gateway, parses tool_calls from the response, executes them locally,
 * appends results, and repeats until the LLM responds with content only (no
 * tool_calls) or max iterations are reached.
 *
 * Designed to be domain-agnostic: the caller provides tool definitions and an
 * executor function. Used by /api/chat (GitHub webhook) and /api/whatsapp (setter).
 *
 */

import http from "node:http"

// ─── Types ───────────────────────────────────────────────────────────────────

/** OpenAI-compatible tool definition (function calling format) */
export interface ToolDefinition {
  type: "function"
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

/** A single tool call from the LLM response */
export interface ToolCall {
  id: string
  type: "function"
  function: {
    name: string
    arguments: string
  }
}

/** Record of an executed tool call (for audit/logging) */
export interface ToolCallRecord {
  toolCallId: string
  name: string
  arguments: Record<string, unknown>
  result: string
  durationMs: number
}

/** Chat message in OpenAI format */
export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool"
  content?: string | null
  tool_calls?: ToolCall[]
  tool_call_id?: string
  name?: string
}

/** Options for the agent loop */
export interface AgentLoopOptions {
  /** Conversation messages (system + user + any history) */
  messages: ChatMessage[]
  /** Tool definitions in OpenAI format */
  tools: ToolDefinition[]
  /** Function that executes a tool by name and returns the result as a string */
  executeTool: (name: string, args: Record<string, unknown>) => Promise<string>
  /** Gateway host (default: "127.0.0.1") */
  gatewayHost?: string
  /** Gateway port (default: PORT env var or 3100) */
  gatewayPort?: number
  /** Gateway auth token */
  gatewayToken: string
  /** Model to use (default: "anthropic/claude-opus-4-6") */
  model?: string
  /** Max loop iterations before forced stop (default: 10) */
  maxIterations?: number
  /** Optional logger */
  logger?: { debug: (msg: string) => void; warn: (msg: string) => void }
}

/** Result of a completed agent loop */
export interface AgentLoopResult {
  /** Final assistant message content */
  content: string
  /** All tool calls made during the loop */
  toolCalls: ToolCallRecord[]
  /** Number of loop iterations */
  iterations: number
}

/** Response from /v1/chat/completions (non-streaming) */
interface CompletionResponse {
  choices: Array<{
    message: {
      role: "assistant"
      content: string | null
      tool_calls?: ToolCall[]
    }
    finish_reason: string
  }>
}

// ─── Gateway Request ─────────────────────────────────────────────────────────

/**
 * Send a non-streaming request to the Gateway's /v1/chat/completions.
 */
function callGateway(
  messages: ChatMessage[],
  tools: ToolDefinition[],
  opts: {
    host: string
    port: number
    token: string
    model: string
  },
): Promise<CompletionResponse> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: opts.model,
      messages,
      tools: tools.length > 0 ? tools : undefined,
      stream: false,
    })

    const req = http.request(
      {
        hostname: opts.host,
        port: opts.port,
        path: "/v1/chat/completions",
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": Buffer.byteLength(body),
          ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}),
        },
        timeout: 120_000, // 2 minutes per LLM call
      },
      (res) => {
        const chunks: Buffer[] = []
        res.on("data", (chunk: Buffer) => chunks.push(chunk))
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8")
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`Gateway returned ${res.statusCode}: ${raw.slice(0, 500)}`))
            return
          }
          try {
            resolve(JSON.parse(raw) as CompletionResponse)
          } catch {
            reject(new Error(`Invalid JSON from gateway: ${raw.slice(0, 200)}`))
          }
        })
      },
    )

    req.on("error", (err) => reject(new Error(`Gateway request failed: ${err.message}`)))
    req.on("timeout", () => {
      req.destroy()
      reject(new Error("Gateway request timed out (120s)"))
    })

    req.end(body)
  })
}

// ─── Agent Loop ──────────────────────────────────────────────────────────────

/**
 * Run the agent loop: send messages + tools to the LLM, execute any tool_calls,
 * append results, and repeat until the LLM responds without tool_calls.
 *
 * @throws Error if the gateway is unreachable or returns an invalid response.
 */
export async function runAgentLoop(options: AgentLoopOptions): Promise<AgentLoopResult> {
  const {
    tools,
    executeTool,
    gatewayHost = "127.0.0.1",
    gatewayPort = Number(process.env.PORT) || 3100,
    gatewayToken,
    model = "anthropic/claude-opus-4-6",
    maxIterations = 10,
    logger,
  } = options

  // Clone messages to avoid mutating the caller's array
  const messages = [...options.messages]
  const allToolCalls: ToolCallRecord[] = []
  let iterations = 0

  while (iterations < maxIterations) {
    iterations++
    logger?.debug(`agent-loop: iteration ${iterations}/${maxIterations}`)

    const response = await callGateway(messages, tools, {
      host: gatewayHost,
      port: gatewayPort,
      token: gatewayToken,
      model,
    })

    const choice = response.choices?.[0]
    if (!choice) {
      throw new Error("Gateway returned empty choices array")
    }

    const assistantMessage = choice.message
    const toolCalls = assistantMessage.tool_calls

    // No tool_calls → LLM is done, return the final content
    if (!toolCalls || toolCalls.length === 0) {
      return {
        content: assistantMessage.content ?? "",
        toolCalls: allToolCalls,
        iterations,
      }
    }

    // Append assistant message (with tool_calls) to conversation
    messages.push({
      role: "assistant",
      content: assistantMessage.content,
      tool_calls: toolCalls,
    })

    // Execute each tool call and append results
    for (const toolCall of toolCalls) {
      const start = Date.now()
      let result: string

      try {
        const args = JSON.parse(toolCall.function.arguments) as Record<string, unknown>

        logger?.debug(`agent-loop: executing tool ${toolCall.function.name} (id=${toolCall.id})`)
        result = await executeTool(toolCall.function.name, args)

        allToolCalls.push({
          toolCallId: toolCall.id,
          name: toolCall.function.name,
          arguments: args,
          result: result.slice(0, 500), // Truncate for audit
          durationMs: Date.now() - start,
        })
      } catch (err) {
        result = `Tool execution failed: ${err instanceof Error ? err.message : String(err)}`
        logger?.warn(`agent-loop: tool ${toolCall.function.name} failed: ${result}`)

        allToolCalls.push({
          toolCallId: toolCall.id,
          name: toolCall.function.name,
          arguments: {},
          result,
          durationMs: Date.now() - start,
        })
      }

      // Append tool result message
      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: result,
      })
    }
  }

  // Max iterations reached — return whatever content we have
  logger?.warn(`agent-loop: max iterations (${maxIterations}) reached`)
  const lastAssistant = messages.filter((m) => m.role === "assistant").pop()

  return {
    content:
      lastAssistant?.content ?? "I was unable to complete this task within the allowed iterations.",
    toolCalls: allToolCalls,
    iterations,
  }
}
