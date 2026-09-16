/**
 * dry-run:fixture (Mode A) — corre el reviewer completo contra un PR de FIXTURE,
 * sin tocar GitHub. Solo necesita `NVIDIA_API_KEY` (para hablar con Kimi vía NIM)
 * y `REVIEWER_PROVIDER=nim-kimi`.
 *
 * Flujo:
 *   1. Carga fixtures/sample-pr.json como PullRequestData.
 *   2. Lo sirve vía FixtureGitHubAdapter (cero red de GitHub).
 *   3. Lo envuelve en MockPostAdapter (intercepta el post → imprime en consola).
 *   4. Corre reviewPullRequest → runReviewLoop → lane Kimi (NIM).
 *
 * Uso:
 *   REVIEWER_PROVIDER=nim-kimi NVIDIA_API_KEY=... bun run dry-run:fixture
 *   (o `make dry-run-fixture` con NVIDIA_API_KEY exportada)
 */

import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import { reviewPullRequest } from "../src/reviewer.ts"
import { FixtureGitHubAdapter } from "../src/adapters/fixture-github-adapter.ts"
import { MockPostAdapter } from "../src/adapters/mock-post-adapter.ts"
import { consoleLogger } from "../src/lib/host.ts"
import type { PullRequestData } from "../src/lib/github-port.ts"

const here = dirname(fileURLToPath(import.meta.url))
const fixturePath = join(here, "..", "fixtures", "sample-pr.json")

async function main(): Promise<void> {
  if (!process.env.NVIDIA_API_KEY) {
    console.error(
      "ERROR: falta NVIDIA_API_KEY. Copiá .env.example a .env y rellenala, o exportala:\n" +
        "  REVIEWER_PROVIDER=nim-kimi NVIDIA_API_KEY=nvapi-... bun run dry-run:fixture",
    )
    process.exit(1)
  }
  // Default-seguro: si el operador no fijó el lane, lo apuntamos a Kimi.
  if (!process.env.REVIEWER_PROVIDER) {
    process.env.REVIEWER_PROVIDER = "nim-kimi"
  }

  const pr = JSON.parse(readFileSync(fixturePath, "utf8")) as PullRequestData
  console.log(`[dry-run:fixture] PR cargado: ${pr.title} (${pr.changed_files.length} archivos)`)
  console.log(`[dry-run:fixture] lane=${process.env.REVIEWER_PROVIDER}`)

  // Fixture (lectura) envuelto en Mock (post interceptado).
  const port = new MockPostAdapter(new FixtureGitHubAdapter(pr))

  const result = await reviewPullRequest({
    port,
    owner: "chimeranext",
    repo: "sample-repo",
    pullNumber: pr.number,
    logger: consoleLogger,
  })

  console.log(
    `\n[dry-run:fixture] listo — iteraciones=${result.iterations} ` +
      `reviewPosted=${result.reviewPosted} ` +
      `tokens(total)=${result.tokenUsage.totalTokens}`,
  )
  if (!port.lastReview) {
    console.warn("[dry-run:fixture] ADVERTENCIA: el reviewer no llegó a postear un review.")
    process.exit(2)
  }
}

main().catch((err) => {
  console.error("[dry-run:fixture] falló:", err instanceof Error ? err.message : err)
  process.exit(1)
})
