/**
 * Test de wiring (sin red, sin NIM, sin GitHub).
 *
 * Verifica que el reviewer cablea de extremo a extremo:
 *   - runReviewLoop despacha al lane openai-compatible con un provider MOCK
 *     inyectado (sin tocar `selectReviewerProvider` ni env),
 *   - el loop ejecuta tool-calling: primero `bifrost_github_pr_read`, luego
 *     `bifrost_github_review_post`,
 *   - el MockPostAdapter intercepta el post,
 *   - el loop termina con reviewPosted=true.
 *
 * El proveedor LLM se simula stubbeando `globalThis.fetch`: la primera llamada
 * a /chat/completions devuelve un tool_call a pr_read, la segunda un tool_call a
 * review_post, la tercera (post-tool) un mensaje sin tool_calls (fin natural).
 */

import { test, expect, mock } from "bun:test"
import { reviewPullRequest } from "../src/reviewer.ts"
import { FixtureGitHubAdapter } from "../src/adapters/fixture-github-adapter.ts"
import { MockPostAdapter } from "../src/adapters/mock-post-adapter.ts"
import { TOOL_NAMES } from "../src/lib/tool-names.ts"
import type { ReviewerProvider } from "../src/lib/reviewer-providers.ts"
import type { PullRequestData } from "../src/lib/github-port.ts"

const MOCK_PROVIDER: ReviewerProvider = {
  id: "mock-openai",
  kind: "openai-compatible",
  model: "mock/model",
  apiKey: "mock-key",
  baseURL: "https://mock.invalid/v1",
  label: "mock-openai (test)",
}

const SAMPLE_PR: PullRequestData = {
  number: 7,
  title: "test pr",
  body: "cuerpo",
  author: "tester",
  branch: "feature/x",
  base_branch: "main",
  head_sha: "deadbeef",
  labels: [],
  mergeable: true,
  changed_files: [
    {
      filename: "a.ts",
      status: "modified",
      additions: 1,
      deletions: 0,
      patch: "@@ -1 +1,2 @@\n const a = 1\n+const b = 2\n",
    },
  ],
  diff_truncated: false,
}

/** Construye una respuesta /chat/completions con un tool_call. */
function toolCallResponse(name: string, args: Record<string, unknown>) {
  return {
    choices: [
      {
        message: {
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: `call_${name}`,
              type: "function",
              function: { name, arguments: JSON.stringify(args) },
            },
          ],
        },
        finish_reason: "tool_calls",
      },
    ],
    usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
  }
}

/** Respuesta final sin tool_calls (el modelo terminó). */
function finalResponse(text: string) {
  return {
    choices: [{ message: { role: "assistant", content: text }, finish_reason: "stop" }],
    usage: { prompt_tokens: 8, completion_tokens: 4, total_tokens: 12 },
  }
}

test("el reviewer hace tool-calling (pr_read → review_post) y termina con reviewPosted=true", async () => {
  const reviewPostArgs = {
    owner: "chimeranext",
    repo: "sample-repo",
    pull_number: 7,
    commit_id: "deadbeef",
    status: "APPROVE",
    summary:
      "El PR agrega una constante `b` en a.ts. Revisé el único archivo cambiado; el diff es trivial y no introduce riesgos.",
    comments: [],
  }

  // Secuencia de respuestas del "LLM": pr_read, luego review_post, luego fin.
  const responses = [
    toolCallResponse(TOOL_NAMES.GITHUB_PR_READ, {
      owner: "chimeranext",
      repo: "sample-repo",
      pull_number: 7,
    }),
    toolCallResponse(TOOL_NAMES.GITHUB_REVIEW_POST, reviewPostArgs),
    finalResponse("Review posteado. APPROVE."),
  ]
  let call = 0

  const fetchMock = mock(async () => {
    const body = responses[Math.min(call, responses.length - 1)]
    call++
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" },
    })
  })
  const originalFetch = globalThis.fetch
  globalThis.fetch = fetchMock as unknown as typeof fetch

  try {
    const port = new MockPostAdapter(new FixtureGitHubAdapter(SAMPLE_PR), { sink: () => {} })

    const result = await reviewPullRequest({
      port,
      owner: "chimeranext",
      repo: "sample-repo",
      pullNumber: 7,
      provider: MOCK_PROVIDER,
    })

    // El loop ejecutó ambas tools.
    const toolNames = result.toolCalls.map((t) => t.name)
    expect(toolNames).toContain(TOOL_NAMES.GITHUB_PR_READ)
    expect(toolNames).toContain(TOOL_NAMES.GITHUB_REVIEW_POST)

    // Terminó habiendo posteado (interceptado).
    expect(result.reviewPosted).toBe(true)
    expect(port.lastReview).not.toBeNull()
    expect(port.lastReview?.review.event).toBe("APPROVE")

    // Acumuló tokens de las 3 llamadas.
    expect(result.tokenUsage.totalTokens).toBeGreaterThan(0)

    // Hizo al menos 3 llamadas al "LLM".
    expect(fetchMock).toHaveBeenCalled()
    expect(call).toBeGreaterThanOrEqual(3)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test("selectReviewerProvider via env resuelve el lane nim-kimi", async () => {
  const { selectReviewerProvider } = await import("../src/lib/reviewer-providers.ts")
  const provider = selectReviewerProvider({
    REVIEWER_PROVIDER: "nim-kimi",
    NVIDIA_API_KEY: "nvapi-fake",
  } as NodeJS.ProcessEnv)

  expect(provider.id).toBe("nim-kimi")
  expect(provider.kind).toBe("openai-compatible")
  expect(provider.model).toBe("moonshotai/kimi-k2.6")
  expect(provider.baseURL).toBe("https://integrate.api.nvidia.com/v1")
})
