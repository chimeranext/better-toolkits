/**
 * GitHub Tool Definitions — defs en formato OpenAI + executor para el agent-loop.
 *
 * Extraído del `src/lib/github-tool-defs.ts` del plugin OpenClaw. Cambios de
 * extracción (lógica preservada):
 *   - `./constants.ts` → `../lib/tool-names.ts` (subconjunto mínimo de TOOL_NAMES).
 *   - `./github.ts` (clase GitHubService de ~1063 líneas) → `../lib/github-port.ts`
 *     (interfaz `GitHubPort` inyectada). El executor llama a `port.getPullRequest`,
 *     `port.postReview`, `port.getFileContent?`, `port.searchCode?` en vez de a una
 *     `GitHubService` concreta.
 *   - Los métodos opcionales del puerto (`getFileContent`, `searchCode`) se guardan
 *     con un throw legible si el adaptador inyectado no los implementa.
 *
 * Las defs reflejan los schemas TypeBox de las tools registradas del plugin pero
 * se expresan como JSON Schema plano (lo que la API OpenAI espera), igual que en
 * el original.
 *
 */

import { TOOL_NAMES } from "../lib/tool-names.ts"
import type { GitHubPort, ReviewComment } from "../lib/github-port.ts"
import {
  applyNitPrefix,
  countSuggestions,
  decideNitInclusion,
  detectNitOptInTrigger,
  formatReviewBody,
  renderCommentBodyWithSuggestion,
  resolveReviewEvent,
} from "../lib/review-body-formatter.ts"
import type { ToolDefinition } from "../lib/agent-loop.ts"

// ─── Tool Definitions (OpenAI format) ────────────────────────────────────────

export const GITHUB_TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: TOOL_NAMES.GITHUB_PR_READ,
      description:
        "Read a GitHub Pull Request: metadata, diff, changed files, labels, checks status, and mergeability. Accepts a full PR URL or owner+repo+pull_number. Use this to understand what a PR changes before reviewing it.",
      parameters: {
        type: "object",
        properties: {
          pr_url: {
            type: "string",
            description:
              'Full GitHub PR URL (e.g., "https://github.com/chimeranext/heimdall/pull/123")',
          },
          owner: {
            type: "string",
            description: "Repository owner (e.g., chimeranext)",
          },
          repo: {
            type: "string",
            description: "Repository name (e.g., heimdall)",
          },
          pull_number: {
            type: "number",
            description: "Pull request number",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: TOOL_NAMES.GITHUB_FILE_READ,
      description:
        "Read the content of a file at a specific git ref (commit SHA or branch name). Use this when you need the full file to understand context beyond the diff.",
      parameters: {
        type: "object",
        properties: {
          owner: {
            type: "string",
            description: "Repository owner (e.g., chimeranext)",
          },
          repo: {
            type: "string",
            description: "Repository name (e.g., heimdall)",
          },
          path: {
            type: "string",
            description: "File path relative to repo root (e.g., src/lib/utils.ts)",
          },
          ref: {
            type: "string",
            description: "Git ref — commit SHA or branch name (e.g., abc123 or main)",
          },
        },
        required: ["owner", "repo", "path", "ref"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: TOOL_NAMES.GITHUB_REVIEW_POST,
      description:
        "Post a review on a GitHub Pull Request with inline comments on specific lines. Each comment has a severity level: 'security_block' (P1 — forces REQUEST_CHANGES), 'compliance' (P2 — advisory), 'business' (P3 — advisory), or 'nit' (P4 — default-suppressed nitpick).",
      parameters: {
        type: "object",
        properties: {
          owner: { type: "string", description: "Repository owner" },
          repo: { type: "string", description: "Repository name" },
          pull_number: { type: "number", description: "Pull request number" },
          commit_id: { type: "string", description: "HEAD commit SHA of the PR" },
          status: {
            type: "string",
            enum: ["APPROVE", "REQUEST_CHANGES", "COMMENT"],
            description:
              "Review status. If any comment has severity 'security_block', this is forced to REQUEST_CHANGES.",
          },
          summary: {
            type: "string",
            description:
              "A substantive walkthrough: what the PR changes, which files/areas you reviewed, and a one-line safety rationale. REQUIRED for a clean APPROVE (no inline comments) — a bare verdict is rejected.",
          },
          comments: {
            type: "array",
            description: "Inline comments on specific diff lines",
            items: {
              type: "object",
              properties: {
                path: { type: "string", description: "File path relative to repo root" },
                line: { type: "number", description: "Line number in the diff" },
                side: {
                  type: "string",
                  enum: ["LEFT", "RIGHT"],
                  description: "Side of the diff (LEFT=old, RIGHT=new). Usually RIGHT.",
                },
                body: { type: "string", description: "Review comment text" },
                severity: {
                  type: "string",
                  enum: ["security_block", "compliance", "business", "nit"],
                  description:
                    "Finding severity ('nit' is the P4 default-suppressed tier).",
                },
                suggestion: {
                  type: "string",
                  description:
                    "Optional committable replacement. Emit ONLY for high-confidence (≥4/5) local fixes where the replacement is the EXACT new contents of the line range the comment is anchored to (single contiguous range; multi-line allowed but prefer single-line). NOT for 'consider X' prose paraphrases, NOT for P4 nits. Indentation is preserved verbatim. Omit entirely for ambiguous/prose-only findings.",
                },
              },
              required: ["path", "line", "side", "body", "severity"],
            },
          },
          include_nits: {
            type: "boolean",
            description:
              "When true, P4 nit findings post inline regardless of count. Default (false / omitted): nits post inline only if count ≤ 3, otherwise summary-only. Set to true when the PR carries the `heimdall-reviewer:nits` label or any commit message contains `[reviewer:nits]`.",
          },
          pr_labels: {
            type: "array",
            items: { type: "string" },
            description:
              "Optional. PR label list. If `include_nits` is omitted, the tool detects the `heimdall-reviewer:nits` opt-in label here.",
          },
          pr_commit_messages: {
            type: "array",
            items: { type: "string" },
            description:
              "Optional. PR commit messages. If `include_nits` is omitted, the tool detects the `[reviewer:nits]` opt-in tag here.",
          },
          confidence: {
            type: "number",
            minimum: 1,
            maximum: 5,
            description:
              "Your subjective confidence (1.0–5.0) that this PR is mergeable. Optional — the formatter clamps it to a deterministic per-severity range; it can nudge the final score ±0.5 but cannot override the severity gate.",
          },
        },
        required: ["owner", "repo", "pull_number", "commit_id", "status", "comments"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: TOOL_NAMES.GITHUB_CODE_SEARCH,
      description:
        "Search for code patterns across GitHub repositories. Supports GitHub code search syntax. Rate limited to 10 requests per minute.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query (GitHub code search syntax).",
          },
          owner: {
            type: "string",
            description: "Organization/user to search in (defaults to chimeranext)",
          },
          repo: {
            type: "string",
            description: "Repository name to narrow search (e.g., heimdall)",
          },
          path: {
            type: "string",
            description: "Path prefix filter (e.g., src/services/)",
          },
          extension: {
            type: "string",
            description: "File extension filter (e.g., ts, tsx, md)",
          },
          limit: {
            type: "number",
            description: "Maximum results to return (defaults to 10, max 30)",
          },
        },
        required: ["query"],
      },
    },
  },
]

/**
 * REVIEWER_TOOL_DEFINITIONS — el subconjunto del set GitHub que el reviewer
 * puede usar: pr-read (entender el diff), file-read (contexto más allá del diff),
 * review-post (publicar el review) y code-search (referencias a símbolos
 * renombrados/removidos). Deliberadamente más estrecho que el set conversacional.
 */
const REVIEWER_TOOL_NAMES = new Set<string>([
  TOOL_NAMES.GITHUB_PR_READ,
  TOOL_NAMES.GITHUB_FILE_READ,
  TOOL_NAMES.GITHUB_REVIEW_POST,
  TOOL_NAMES.GITHUB_CODE_SEARCH,
])

export const REVIEWER_TOOL_DEFINITIONS: ToolDefinition[] = GITHUB_TOOL_DEFINITIONS.filter((def) =>
  REVIEWER_TOOL_NAMES.has(def.function.name),
)

// ─── Tool Executor Factory ───────────────────────────────────────────────────

const GITHUB_PR_URL_REGEX = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/

/**
 * Crea un executor de tools enlazado a un {@link GitHubPort}.
 *
 * Devuelve una función compatible con `AgentLoopOptions.executeTool`:
 *   (name: string, args: Record<string, unknown>) => Promise<string>
 *
 * Solo maneja las tools GitHub del reviewer. Lanza para tools desconocidas o
 * para tools cuyo método opcional del puerto no esté implementado.
 */
export function createGithubToolExecutor(
  port: GitHubPort,
): (name: string, args: Record<string, unknown>) => Promise<string> {
  return async (name: string, args: Record<string, unknown>): Promise<string> => {
    switch (name) {
      case TOOL_NAMES.GITHUB_PR_READ: {
        let owner: string
        let repo: string
        let pullNumber: number

        if (args.pr_url) {
          const match = (args.pr_url as string).match(GITHUB_PR_URL_REGEX)
          if (!match) throw new Error(`Invalid GitHub PR URL: ${args.pr_url}`)
          owner = match[1]
          repo = match[2]
          pullNumber = Number.parseInt(match[3], 10)
        } else if (args.owner && args.repo && args.pull_number) {
          owner = args.owner as string
          repo = args.repo as string
          pullNumber = args.pull_number as number
        } else {
          throw new Error("Provide either pr_url or owner+repo+pull_number.")
        }

        const prData = await port.getPullRequest(owner, repo, pullNumber)
        return JSON.stringify(prData, null, 2)
      }

      case TOOL_NAMES.GITHUB_FILE_READ: {
        if (!port.getFileContent) {
          throw new Error(
            "GitHubPort.getFileContent no está implementado por este adaptador (file-read no disponible en este modo).",
          )
        }
        const result = await port.getFileContent(
          args.owner as string,
          args.repo as string,
          args.path as string,
          args.ref as string,
        )
        return JSON.stringify(result, null, 2)
      }

      case TOOL_NAMES.GITHUB_REVIEW_POST: {
        // El LLM puede llamar review_post sin `comments` (APPROVE limpio, caso
        // legítimo instruido en los nudges) → default a [] para no romper el
        // pipeline de nits/render río abajo (decideNitInclusion/filter).
        const rawComments = (args.comments as ReviewComment[] | undefined) ?? []
        const requestedStatus = args.status as "APPROVE" | "REQUEST_CHANGES" | "COMMENT"
        // Confianza opcional del LLM. Clampada al rango por-severidad
        // río abajo; no puede sobreescribir el gate.
        const llmConfidence = args.confidence as number | undefined

        // misma decisión de nits que la tool registrada. `include_nits`
        // explícito gana; si no, se detecta de labels + commit messages.
        const explicitIncludeNits = args.include_nits as boolean | undefined
        const prLabels = (args.pr_labels as string[] | undefined) ?? []
        const prCommitMessages = (args.pr_commit_messages as string[] | undefined) ?? []
        const includeNits =
          explicitIncludeNits ??
          detectNitOptInTrigger({ labels: prLabels, commitMessages: prCommitMessages })

        const nitDecision = decideNitInclusion(rawComments, includeNits)

        // telemetría: cuenta hallazgos con/sin suggestion antes de
        // renderizar. console.info mantiene la misma señal que el plugin headless.
        const suggestionCount = countSuggestions(rawComments)
        console.info(
          `[reviewer] github-review-post suggestions=${suggestionCount}/${rawComments.length} pr=${args.owner}/${args.repo}#${args.pull_number}`,
        )

        // mismo pipeline de render: prefijo nit primero, luego fence
        // de suggestion. En lockstep con la tool registrada del plugin.
        const comments = rawComments.map((c) => {
          const withNit = applyNitPrefix(c)
          return {
            ...withNit,
            body: renderCommentBodyWithSuggestion(withNit.body, c.suggestion),
          }
        })

        // Resuelve el veredicto por la única fuente de verdad: P1 fuerza
        // REQUEST_CHANGES, y un APPROVE de baja confianza baja a COMMENT.
        const actualStatus = resolveReviewEvent(comments, requestedStatus, llmConfidence)
        const summary = (args.summary as string | undefined)?.trim()
        const body = formatReviewBody(
          comments,
          requestedStatus,
          actualStatus,
          nitDecision,
          llmConfidence,
          summary,
        )

        const inlineComments =
          !nitDecision.include && nitDecision.count > 0
            ? comments.filter((c) => c.severity !== "nit")
            : comments

        const result = await port.postReview(
          args.owner as string,
          args.repo as string,
          args.pull_number as number,
          {
            body,
            event: actualStatus,
            commit_id: args.commit_id as string,
            comments: inlineComments,
            confidence: llmConfidence,
          },
        )
        return JSON.stringify(result, null, 2)
      }

      case TOOL_NAMES.GITHUB_CODE_SEARCH: {
        if (!port.searchCode) {
          throw new Error(
            "GitHubPort.searchCode no está implementado por este adaptador (code-search no disponible en este modo).",
          )
        }
        const limit = Math.min((args.limit as number) || 10, 30)
        const result = await port.searchCode(
          args.query as string,
          (args.owner as string) || "chimeranext",
          args.repo as string | undefined,
          args.path as string | undefined,
          args.extension as string | undefined,
          limit,
        )
        return JSON.stringify(result, null, 2)
      }

      default:
        throw new Error(`Unknown GitHub tool: ${name}`)
    }
  }
}
