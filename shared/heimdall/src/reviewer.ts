/**
 * reviewer.ts — orquestador de alto nivel de Heimdall.
 *
 * Une las piezas extraídas en una sola llamada `reviewPullRequest`:
 *   1. arma el `userPrompt` que apunta el reviewer al PR objetivo,
 *   2. construye el executor de tools enlazado al {@link GitHubPort} inyectado,
 *   3. corre `runReviewLoop` con el set de tools del reviewer y la system
 *      instruction canónica.
 *
 * El puerto se inyecta — en el dry-run es siempre un {@link MockPostAdapter}
 * envolviendo un Fixture (Mode A) o un Fetch (Mode B) adapter, así el post se
 * intercepta. En producción (futuro) sería un adaptador que postea de verdad
 * como la GitHub App `chimeranext-heimdall[bot]`.
 */

import type { GitHubPort } from "./lib/github-port.ts"
import { REVIEWER_SYSTEM_INSTRUCTION } from "./lib/reviewer-prompts.ts"
import { createGithubToolExecutor, REVIEWER_TOOL_DEFINITIONS } from "./tools/github-tool-defs.ts"
import { runReviewLoop } from "./lib/review-loop.ts"
import type { ReviewLoopResult } from "./lib/review-loop.ts"
import type { ReviewerProvider } from "./lib/reviewer-providers.ts"

export interface ReviewPullRequestOptions {
  /** Puerto GitHub inyectado (en dry-run, envuelto en MockPostAdapter). */
  port: GitHubPort
  /** Coordenadas del PR a revisar. */
  owner: string
  repo: string
  pullNumber: number
  /** Máximo de iteraciones del loop (default: 10). */
  maxIterations?: number
  /** Logger opcional. */
  logger?: { debug: (msg: string) => void; warn: (msg: string) => void }
  /**
   * Proveedor inyectado opcional — bypassa la selección por env. Usado por
   * tests (provider MOCK sin red). En producción se deja undefined para que
   * `selectReviewerProvider()` lea `REVIEWER_PROVIDER`.
   */
  provider?: ReviewerProvider
}

/**
 * Construye el prompt de usuario que arranca el reviewer. Le dice al modelo qué
 * PR revisar y lo empuja a empezar leyéndolo con `bifrost_github_pr_read` — igual
 * que el webhook del plugin original, pero sintético (sin un mensaje de chat).
 */
export function buildReviewUserPrompt(owner: string, repo: string, pullNumber: number): string {
  return (
    `Review the GitHub Pull Request ${owner}/${repo}#${pullNumber}.\n\n` +
    `Start by calling bifrost_github_pr_read with owner="${owner}", repo="${repo}", ` +
    `pull_number=${pullNumber} to read the diff, then post your review with ` +
    `bifrost_github_review_post. Follow your system instruction for severity tags, ` +
    `the verdict line, and the substantive walkthrough.`
  )
}

/**
 * Revisa un PR de extremo a extremo. Devuelve el resultado del loop (tokens,
 * iteraciones, si se posteó review). En dry-run, el "post" lo intercepta el
 * MockPostAdapter, así que `reviewPosted` es true pero nada llegó a GitHub.
 */
export async function reviewPullRequest(
  options: ReviewPullRequestOptions,
): Promise<ReviewLoopResult> {
  const { port, owner, repo, pullNumber, maxIterations, logger, provider } = options

  const executeTool = createGithubToolExecutor(port)
  const userPrompt = buildReviewUserPrompt(owner, repo, pullNumber)

  return runReviewLoop({
    systemInstruction: REVIEWER_SYSTEM_INSTRUCTION,
    userPrompt,
    tools: REVIEWER_TOOL_DEFINITIONS,
    executeTool,
    maxIterations,
    logger,
    provider,
  })
}
