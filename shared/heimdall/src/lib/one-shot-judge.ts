/**
 * One-shot LLM-as-Judge — single inference per review (issue #98).
 * Fetches PR via port, calls Gemini or OpenAI-compatible once, posts review.
 */

import type { GitHubPort, PullRequestData, ReviewComment } from "./github-port.ts"
import type { OpenAIReviewLoopResult } from "./openai-agent-loop.ts"
import {
  ONE_SHOT_JUDGE_SYSTEM_INSTRUCTION,
  buildOneShotJudgeUserPrompt,
} from "./one-shot-judge-prompts.ts"
import type { ReviewerProvider } from "./reviewer-providers.ts"
import { selectReviewerProvider } from "./reviewer-providers.ts"
import { createGithubToolExecutor } from "../tools/github-tool-defs.ts"
import { TOOL_NAMES } from "./tool-names.ts"

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta"

export interface OneShotReviewOptions {
  port: GitHubPort
  owner: string
  repo: string
  pullNumber: number
  provider?: ReviewerProvider
  logger?: { debug: (msg: string) => void; warn: (msg: string) => void }
}

export interface JudgeReviewPayload {
  summary: string
  confidence?: number
  status: "APPROVE" | "REQUEST_CHANGES" | "COMMENT"
  comments: ReviewComment[]
}

export function parseJudgeReviewPayload(raw: string): JudgeReviewPayload {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error(`one-shot-judge: model returned non-JSON: ${raw.slice(0, 200)}`)
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("one-shot-judge: model JSON was not an object")
  }
  const obj = parsed as Record<string, unknown>
  const summary = typeof obj.summary === "string" ? obj.summary.trim() : ""
  if (!summary) {
    throw new Error("one-shot-judge: missing summary in model JSON")
  }
  const status = obj.status as JudgeReviewPayload["status"]
  if (status !== "APPROVE" && status !== "REQUEST_CHANGES" && status !== "COMMENT") {
    throw new Error(`one-shot-judge: invalid status ${String(obj.status)}`)
  }
  const confidence =
    typeof obj.confidence === "number" && Number.isFinite(obj.confidence)
      ? obj.confidence
      : undefined
  const comments = Array.isArray(obj.comments) ? normalizeComments(obj.comments) : []
  return { summary, confidence, status, comments }
}

function normalizeComments(items: unknown[]): ReviewComment[] {
  const out: ReviewComment[] = []
  for (const item of items) {
    if (!item || typeof item !== "object") continue
    const c = item as Record<string, unknown>
    const path = typeof c.path === "string" ? c.path : ""
    const line = typeof c.line === "number" ? c.line : Number(c.line)
    const side = c.side === "LEFT" || c.side === "RIGHT" ? c.side : "RIGHT"
    const body = typeof c.body === "string" ? c.body : ""
    const severity = c.severity as ReviewComment["severity"]
    if (!path || !Number.isFinite(line) || !body) continue
    if (
      severity !== "security_block" &&
      severity !== "compliance" &&
      severity !== "business" &&
      severity !== "nit"
    ) {
      continue
    }
    const comment: ReviewComment = { path, line, side, body, severity }
    if (typeof c.suggestion === "string" && c.suggestion.trim()) {
      comment.suggestion = c.suggestion
    }
    out.push(comment)
  }
  return out
}

async function callOpenAICompatibleJudge(
  provider: ReviewerProvider,
  systemInstruction: string,
  userPrompt: string,
): Promise<{ text: string; promptTokens: number; candidatesTokens: number; totalTokens: number }> {
  if (!provider.baseURL) {
    throw new Error(`one-shot-judge: provider ${provider.id} missing baseURL`)
  }
  const url = `${provider.baseURL.replace(/\/$/, "")}/chat/completions`
  const body: Record<string, unknown> = {
    model: provider.model,
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  }
  if (provider.extraBody) {
    Object.assign(body, provider.extraBody)
  }
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`one-shot-judge: ${provider.id} HTTP ${res.status}: ${errText.slice(0, 400)}`)
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string | null } }[]
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }
  }
  const text = data.choices?.[0]?.message?.content?.trim() ?? ""
  if (!text) {
    throw new Error(`one-shot-judge: empty completion from ${provider.id}`)
  }
  const promptTokens = data.usage?.prompt_tokens ?? 0
  const candidatesTokens = data.usage?.completion_tokens ?? 0
  const totalTokens = data.usage?.total_tokens ?? promptTokens + candidatesTokens
  return { text, promptTokens, candidatesTokens, totalTokens }
}

async function callGeminiJudge(
  provider: ReviewerProvider,
  systemInstruction: string,
  userPrompt: string,
): Promise<{ text: string; promptTokens: number; candidatesTokens: number; totalTokens: number }> {
  const url =
    `${GEMINI_API_BASE}/models/${encodeURIComponent(provider.model)}:generateContent?key=` +
    encodeURIComponent(provider.apiKey)
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    }),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`one-shot-judge: gemini HTTP ${res.status}: ${errText.slice(0, 400)}`)
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
    usageMetadata?: {
      promptTokenCount?: number
      candidatesTokenCount?: number
      totalTokenCount?: number
    }
  }
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? ""
  if (!text.trim()) {
    throw new Error("one-shot-judge: empty Gemini completion")
  }
  const promptTokens = data.usageMetadata?.promptTokenCount ?? 0
  const candidatesTokens = data.usageMetadata?.candidatesTokenCount ?? 0
  const totalTokens = data.usageMetadata?.totalTokenCount ?? promptTokens + candidatesTokens
  return { text: text.trim(), promptTokens, candidatesTokens, totalTokens }
}

async function callJudgeProvider(
  provider: ReviewerProvider,
  systemInstruction: string,
  userPrompt: string,
): Promise<{ text: string; promptTokens: number; candidatesTokens: number; totalTokens: number }> {
  if (provider.kind === "gemini-direct") {
    return callGeminiJudge(provider, systemInstruction, userPrompt)
  }
  return callOpenAICompatibleJudge(provider, systemInstruction, userPrompt)
}

/**
 * Default review path: one-shot judge (all provider kinds).
 * Set `REVIEWER_AGENTIC_LOOP=1` to use the legacy multi-turn tool loop instead.
 */
export async function runOneShotReview(
  options: OneShotReviewOptions,
): Promise<OpenAIReviewLoopResult> {
  const { port, owner, repo, pullNumber, logger } = options
  const provider = options.provider ?? selectReviewerProvider()
  logger?.debug(`one-shot-judge: provider=${provider.label}`)

  const pr: PullRequestData = await port.getPullRequest(owner, repo, pullNumber)
  const prJson = JSON.stringify(pr, null, 2)
  const userPrompt = buildOneShotJudgeUserPrompt(owner, repo, pullNumber, prJson)

  const { text, promptTokens, candidatesTokens, totalTokens } = await callJudgeProvider(
    provider,
    ONE_SHOT_JUDGE_SYSTEM_INSTRUCTION,
    userPrompt,
  )
  const payload = parseJudgeReviewPayload(text)

  const executeTool = createGithubToolExecutor(port)
  await executeTool(TOOL_NAMES.GITHUB_REVIEW_POST, {
    owner,
    repo,
    pull_number: pullNumber,
    commit_id: pr.head_sha,
    status: payload.status,
    summary: payload.summary,
    comments: payload.comments,
    confidence: payload.confidence,
    pr_labels: pr.labels,
  })

  return {
    content: text,
    toolCalls: [
      {
        toolCallId: "one-shot-review-post",
        name: TOOL_NAMES.GITHUB_REVIEW_POST,
        arguments: {
          owner,
          repo,
          pull_number: pullNumber,
          status: payload.status,
        },
        result: "ok",
        durationMs: 0,
      },
    ],
    iterations: 1,
    tokenUsage: { promptTokens, candidatesTokens, totalTokens },
    reviewPosted: true,
  }
}
