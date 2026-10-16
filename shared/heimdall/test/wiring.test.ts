/**
 * Test de wiring (sin red, sin NIM, sin GitHub).
 *
 * Verifica que el reviewer cablea de extremo a extremo (one-shot judge, issue #98):
 *   - lee el PR vía el port (sin tool loop),
 *   - una sola llamada al proveedor openai-compatible devuelve JSON del judge,
 *   - postea el review vía executor (MockPostAdapter intercepta),
 *   - termina con reviewPosted=true e iterations=1.
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

const SAMPLE_PR_MULTI: PullRequestData = {
  ...SAMPLE_PR,
  changed_files: [
    {
      filename: "a.ts",
      status: "modified",
      additions: 1,
      deletions: 0,
      patch: "@@ patch-a @@\n const a = 1\n+const b = 2\n",
    },
    {
      filename: "b.ts",
      status: "added",
      additions: 1,
      deletions: 0,
      patch: "@@ patch-b @@\n+export const x = 1\n",
    },
  ],
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

test("one-shot judge postea review con una sola inferencia LLM", async () => {
  const judgeJson = JSON.stringify({
    summary:
      "El PR agrega una constante `b` en a.ts. Revisé el único archivo cambiado; el diff es trivial y no introduce riesgos.",
    confidence: 4.8,
    status: "APPROVE",
    comments: [],
  })

  const fetchMock = mock(async () =>
    new Response(JSON.stringify(finalResponse(judgeJson)), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
  )
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

    expect(result.iterations).toBe(1)
    expect(result.reviewPosted).toBe(true)
    expect(port.lastReview).not.toBeNull()
    expect(port.lastReview?.review.event).toBe("APPROVE")
    expect(result.toolCalls.map((t) => t.name)).toContain(TOOL_NAMES.GITHUB_REVIEW_POST)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test("one-shot judge incluye todos los changed_files en una sola inferencia", async () => {
  const judgeJson = JSON.stringify({
    summary: "Revisé a.ts y b.ts; sin hallazgos.",
    confidence: 4.5,
    status: "APPROVE",
    comments: [],
  })

  let capturedUserContent = ""
  const fetchMock = mock(async (_input: RequestInfo | URL, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body ?? "{}")) as {
      messages?: { role: string; content: string }[]
    }
    const userMsg = body.messages?.find((m) => m.role === "user")
    capturedUserContent = userMsg?.content ?? ""
    return new Response(JSON.stringify(finalResponse(judgeJson)), {
      status: 200,
      headers: { "content-type": "application/json" },
    })
  })
  const originalFetch = globalThis.fetch
  globalThis.fetch = fetchMock as unknown as typeof fetch

  try {
    const port = new MockPostAdapter(new FixtureGitHubAdapter(SAMPLE_PR_MULTI), {
      sink: () => {},
    })

    const result = await reviewPullRequest({
      port,
      owner: "chimeranext",
      repo: "sample-repo",
      pullNumber: 7,
      provider: MOCK_PROVIDER,
    })

    expect(result.iterations).toBe(1)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(capturedUserContent).toContain('"filename": "a.ts"')
    expect(capturedUserContent).toContain('"filename": "b.ts"')
    expect(capturedUserContent).toContain("patch-a")
    expect(capturedUserContent).toContain("patch-b")
  } finally {
    globalThis.fetch = originalFetch
  }
})

test("REVIEWER_AGENTIC_LOOP=1 usa tool loop legacy (pr_read → review_post)", async () => {
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
  const prev = process.env.REVIEWER_AGENTIC_LOOP
  process.env.REVIEWER_AGENTIC_LOOP = "1"

  try {
    const port = new MockPostAdapter(new FixtureGitHubAdapter(SAMPLE_PR), { sink: () => {} })

    const result = await reviewPullRequest({
      port,
      owner: "chimeranext",
      repo: "sample-repo",
      pullNumber: 7,
      provider: MOCK_PROVIDER,
    })

    const toolNames = result.toolCalls.map((t) => t.name)
    expect(toolNames).toContain(TOOL_NAMES.GITHUB_PR_READ)
    expect(toolNames).toContain(TOOL_NAMES.GITHUB_REVIEW_POST)
    expect(result.reviewPosted).toBe(true)
    expect(call).toBeGreaterThanOrEqual(3)
  } finally {
    globalThis.fetch = originalFetch
    if (prev === undefined) delete process.env.REVIEWER_AGENTIC_LOOP
    else process.env.REVIEWER_AGENTIC_LOOP = prev
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
