/**
 * Test del TokenGitHubAdapter.postReview (sin red).
 *
 * Stubea `globalThis.fetch` y verifica que el POST real a la REST API de reviews
 * arma el request correcto: método, URL, headers (Authorization Bearer, Accept,
 * X-GitHub-Api-Version) y body (event=COMMENT forzado + comentarios inline
 * mapeados). NUNCA toca la red.
 */

import { test, expect, mock } from "bun:test"
import { TokenGitHubAdapter } from "../src/adapters/token-github-adapter.ts"
import type { ReviewInput } from "../src/lib/github-port.ts"

const REVIEW: ReviewInput = {
  body: "Verdict: COMMENT — 1 P3. Walkthrough...",
  // El LLM pidió REQUEST_CHANGES, pero el MVP DEBE forzar COMMENT.
  event: "REQUEST_CHANGES",
  commit_id: "deadbeef",
  comments: [
    { path: "src/a.ts", line: 12, side: "RIGHT", body: "nit: naming", severity: "nit" },
    // line inválida (0) → debe filtrarse antes de enviar a la API.
    { path: "src/b.ts", line: 0, side: "RIGHT", body: "fuera del diff", severity: "business" },
  ],
}

test("postReview arma el POST correcto y fuerza event=COMMENT", async () => {
  let captured: { url: string; init: RequestInit } | null = null

  const fetchMock = mock(async (url: string, init: RequestInit) => {
    captured = { url, init }
    return new Response(
      JSON.stringify({
        id: 999,
        html_url: "https://github.com/o/r/pull/3#pullrequestreview-999",
        state: "COMMENTED",
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    )
  })
  const originalFetch = globalThis.fetch
  globalThis.fetch = fetchMock as unknown as typeof fetch

  try {
    const adapter = new TokenGitHubAdapter({ token: "ghs-fake-token" })
    const result = await adapter.postReview("o", "r", 3, REVIEW)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(captured).not.toBeNull()
    const { url, init } = captured!

    // Método + URL.
    expect(init.method).toBe("POST")
    expect(url).toBe("https://api.github.com/repos/o/r/pulls/3/reviews")

    // Headers.
    const headers = init.headers as Record<string, string>
    expect(headers.Authorization).toBe("Bearer ghs-fake-token")
    expect(headers.Accept).toBe("application/vnd.github+json")
    expect(headers["X-GitHub-Api-Version"]).toBe("2022-11-28")

    // Body: event forzado a COMMENT + solo el comentario con línea válida.
    const body = JSON.parse(init.body as string) as {
      body: string
      event: string
      comments?: Array<{ path: string; line: number; side: string; body: string }>
    }
    expect(body.event).toBe("COMMENT")
    expect(body.body).toBe(REVIEW.body)
    expect(body.comments).toHaveLength(1)
    expect(body.comments?.[0]).toEqual({
      path: "src/a.ts",
      line: 12,
      side: "RIGHT",
      body: "nit: naming",
    })

    // Resultado mapeado desde la respuesta.
    expect(result.review_id).toBe(999)
    expect(result.comments_posted).toBe(1)
    expect(result.status).toBe("COMMENTED")
  } finally {
    globalThis.fetch = originalFetch
  }
})

test("postReview omite el array comments cuando no hay líneas válidas", async () => {
  let capturedBody: Record<string, unknown> | null = null
  const fetchMock = mock(async (_url: string, init: RequestInit) => {
    capturedBody = JSON.parse(init.body as string) as Record<string, unknown>
    return new Response(JSON.stringify({ id: 1, html_url: "x", state: "COMMENTED" }), {
      status: 200,
    })
  })
  const originalFetch = globalThis.fetch
  globalThis.fetch = fetchMock as unknown as typeof fetch

  try {
    const adapter = new TokenGitHubAdapter({ token: "ghs-fake" })
    await adapter.postReview("o", "r", 5, {
      ...REVIEW,
      comments: [{ path: "x.ts", line: 0, side: "RIGHT", body: "no aplica", severity: "business" }],
    })
    expect(capturedBody).not.toBeNull()
    expect(capturedBody!.comments).toBeUndefined()
    expect(capturedBody!.event).toBe("COMMENT")
  } finally {
    globalThis.fetch = originalFetch
  }
})

test("postReview propaga un error legible cuando la API responde no-ok", async () => {
  const fetchMock = mock(
    async () => new Response("Forbidden: missing pull-requests:write", { status: 403 }),
  )
  const originalFetch = globalThis.fetch
  globalThis.fetch = fetchMock as unknown as typeof fetch

  try {
    const adapter = new TokenGitHubAdapter({ token: "ghs-fake" })
    await expect(adapter.postReview("o", "r", 7, REVIEW)).rejects.toThrow(/Failed to post review: 403/)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test("el constructor rechaza un token vacío", () => {
  expect(() => new TokenGitHubAdapter({ token: "  " })).toThrow(/requiere un token/)
})
