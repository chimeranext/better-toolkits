/**
 * review:ci — entry point del MVP de GitHub Actions ($0).
 *
 * Corre DENTRO del CI del repo que abre el PR. Lee todo de env (lo que Actions
 * inyecta) y postea un review REAL firmado por `github-actions[bot]`:
 *
 *   - `GITHUB_TOKEN`        token ambiente de Actions (permiso pull-requests:write).
 *   - `GITHUB_REPOSITORY`   "owner/repo" (Actions lo setea siempre).
 *   - PR number             de `$GITHUB_EVENT_PATH` → `pull_request.number`
 *                           (fallback: env `PR_NUMBER` para correr a mano).
 *   - `NVIDIA_API_KEY`      bearer de NIM para el lane Kimi.
 *   - `REVIEWER_PROVIDER`   lane del reviewer (default `nim-kimi`).
 *
 * A diferencia de los dry-runs (`scripts/dry-run-*.ts`), acá el puerto es un
 * {@link TokenGitHubAdapter} que POSTEA de verdad — NO se envuelve en
 * MockPostAdapter. El review siempre se publica como `event=COMMENT` (no
 * bloquea ni aprueba merges; ver el docblock del adapter).
 */

import { readFileSync } from "node:fs"
import { reviewPullRequest } from "../reviewer.ts"
import { TokenGitHubAdapter } from "../adapters/token-github-adapter.ts"
import { consoleLogger } from "../lib/host.ts"

/** Aborta con un mensaje legible y exit 1 (config faltante = fail-loud). */
function fail(msg: string): never {
  console.error(`[review:ci] ${msg}`)
  process.exit(1)
}

/**
 * Resuelve el número de PR. Prioriza el payload del evento de Actions
 * (`$GITHUB_EVENT_PATH` → `pull_request.number`); si no está, cae a la env
 * `PR_NUMBER` (útil para correr el entry a mano fuera de un evento PR).
 */
function resolvePullNumber(): number {
  const eventPath = process.env.GITHUB_EVENT_PATH
  if (eventPath) {
    try {
      const event = JSON.parse(readFileSync(eventPath, "utf8")) as {
        pull_request?: { number?: number }
        number?: number
      }
      const fromEvent = event.pull_request?.number ?? event.number
      if (typeof fromEvent === "number") return fromEvent
    } catch (err) {
      console.warn(
        `[review:ci] no se pudo leer GITHUB_EVENT_PATH (${eventPath}): ` +
          `${err instanceof Error ? err.message : err}`,
      )
    }
  }

  const fromEnv = (process.env.PR_NUMBER ?? "").trim()
  if (fromEnv) {
    const n = Number.parseInt(fromEnv, 10)
    if (Number.isInteger(n) && n > 0) return n
  }

  return fail(
    "no pude resolver el número de PR (ni $GITHUB_EVENT_PATH→pull_request.number " +
      "ni $PR_NUMBER). ¿El workflow corre on: pull_request?",
  )
}

async function main(): Promise<void> {
  const token = (process.env.GITHUB_TOKEN ?? "").trim()
  if (!token) fail("falta GITHUB_TOKEN (en Actions: pasá secrets.GITHUB_TOKEN al step).")

  if (!(process.env.NVIDIA_API_KEY ?? "").trim()) {
    fail("falta NVIDIA_API_KEY (GitHub Secret org/repo o pull desde Infisical — ver README §Setup).")
  }

  const repository = (process.env.GITHUB_REPOSITORY ?? "").trim()
  const [owner, repo] = repository.split("/")
  if (!owner || !repo) {
    fail(`GITHUB_REPOSITORY inválido ("${repository}"). Esperado "owner/repo".`)
  }

  // Default-seguro: si el workflow no fijó el lane, lo apuntamos a Kimi-NIM.
  if (!(process.env.REVIEWER_PROVIDER ?? "").trim()) {
    process.env.REVIEWER_PROVIDER = "nim-kimi"
  }

  const pullNumber = resolvePullNumber()
  const prUrl = `https://github.com/${owner}/${repo}/pull/${pullNumber}`
  console.log(
    `[review:ci] revisando ${prUrl} lane=${process.env.REVIEWER_PROVIDER} ` +
      `(firma: github-actions[bot], event=COMMENT)`,
  )

  // Puerto que POSTEA de verdad — sin MockPostAdapter.
  const port = new TokenGitHubAdapter({ token })

  const result = await reviewPullRequest({
    port,
    owner,
    repo,
    pullNumber,
    logger: consoleLogger,
  })

  console.log(
    `[review:ci] listo — iteraciones=${result.iterations} ` +
      `reviewPosted=${result.reviewPosted} tokens(total)=${result.tokenUsage.totalTokens}`,
  )

  if (!result.reviewPosted) {
    // El loop SIEMPRE fuerza un post (APPROVE clean o COMMENT fail-closed); si
    // aun así no se posteó, algo se rompió — fail-loud para que el job lo marque.
    fail("el reviewer terminó sin postear un review (ver logs arriba).")
  }
}

main().catch((err) => {
  console.error("[review:ci] falló:", err instanceof Error ? err.message : err)
  process.exit(1)
})
