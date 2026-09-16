/**
 * dry-run:pr <url> (Mode B) — corre el reviewer contra un PR REAL leído de
 * GitHub, pero NUNCA postea (el post lo intercepta MockPostAdapter).
 *
 * Necesita `NVIDIA_API_KEY` + `REVIEWER_PROVIDER=nim-kimi`. `GITHUB_TOKEN` es
 * opcional (requerido solo si el repo es privado o se quiere subir el rate-limit).
 *
 * Uso:
 *   REVIEWER_PROVIDER=nim-kimi NVIDIA_API_KEY=... bun run dry-run:pr \
 *     https://github.com/owner/repo/pull/123
 */

import { reviewPullRequest } from "../src/reviewer.ts"
import { FetchGitHubAdapter } from "../src/adapters/fetch-github-adapter.ts"
import { MockPostAdapter } from "../src/adapters/mock-post-adapter.ts"
import { consoleLogger } from "../src/lib/host.ts"

const PR_URL_RE = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/

async function main(): Promise<void> {
  const url = process.argv[2]
  if (!url) {
    console.error("Uso: bun run dry-run:pr <github-pr-url>")
    process.exit(1)
  }
  const m = url.match(PR_URL_RE)
  if (!m) {
    console.error(`URL de PR inválida: ${url}`)
    process.exit(1)
  }
  if (!process.env.NVIDIA_API_KEY) {
    console.error("ERROR: falta NVIDIA_API_KEY (ver .env.example).")
    process.exit(1)
  }
  if (!process.env.REVIEWER_PROVIDER) {
    process.env.REVIEWER_PROVIDER = "nim-kimi"
  }

  const [, owner, repo, num] = m
  const pullNumber = Number.parseInt(num, 10)
  console.log(`[dry-run:pr] ${owner}/${repo}#${pullNumber} lane=${process.env.REVIEWER_PROVIDER}`)
  if (!process.env.GITHUB_TOKEN) {
    console.warn("[dry-run:pr] sin GITHUB_TOKEN — lectura anónima (solo repos públicos, rate-limit bajo).")
  }

  // Fetch (lectura real) envuelto en Mock (post interceptado).
  const port = new MockPostAdapter(
    new FetchGitHubAdapter({ token: process.env.GITHUB_TOKEN }),
  )

  const result = await reviewPullRequest({
    port,
    owner,
    repo,
    pullNumber,
    logger: consoleLogger,
  })

  console.log(
    `\n[dry-run:pr] listo — iteraciones=${result.iterations} ` +
      `reviewPosted=${result.reviewPosted} tokens(total)=${result.tokenUsage.totalTokens}`,
  )
}

main().catch((err) => {
  console.error("[dry-run:pr] falló:", err instanceof Error ? err.message : err)
  process.exit(1)
})
