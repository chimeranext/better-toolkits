/**
 * TokenGitHubAdapter — adaptador de {@link GitHubPort} para el MVP de GitHub
 * Actions ($0). Hereda TODA la lógica de LECTURA de {@link FetchGitHubAdapter}
 * (getPullRequest / getFileContent / searchCode) y agrega un `postReview` REAL
 * que publica el review en el PR vía la REST API de GitHub.
 *
 * ─── Por qué un token ambiente alcanza (sin GitHub App) ──────────────────────
 *
 * En el modelo "reviewer en el CI de cada repo", el workflow corre DENTRO del
 * repo que abre el PR, así que tiene el `GITHUB_TOKEN` que Actions inyecta. Con
 * `permissions: { pull-requests: write, contents: read }` ese token alcanza para
 * POSTear el review SIN necesitar la private key de la GitHub App. El review lo
 * firma `github-actions[bot]`. Firmar como `heimdall[bot]` (identidad de
 * App propia) es un upgrade futuro: ahí se cambiaría el token ambiente por un
 * App-installation token, sin tocar este método.
 *
 * ─── Decisión de scope: SIEMPRE event=COMMENT (no bloquea merges) ────────────
 *
 * El MVP NUNCA usa REQUEST_CHANGES ni APPROVE: postea como `COMMENT` aunque el
 * LLM haya emitido otro veredicto en `review.event`. Razón: un reviewer LLM en
 * el CI no debe poder bloquear (REQUEST_CHANGES) ni aprobar formalmente (APPROVE
 * cuenta como required-review) un PR de forma autónoma. El veredicto del modelo
 * queda visible en el cuerpo del review (la verdict-line que arma el formatter),
 * pero el "event" de GitHub es siempre un comentario no-bloqueante.
 */

import { FetchGitHubAdapter } from "./fetch-github-adapter.ts"
import type { ReviewComment, ReviewInput, ReviewResult } from "../lib/github-port.ts"

const BASE_URL = "https://api.github.com"

/** Versión de la REST API que pineamos en el header `X-GitHub-Api-Version`. */
const GITHUB_API_VERSION = "2022-11-28"

export interface TokenGitHubAdapterOptions {
  /**
   * Token con permiso `pull-requests: write`. En GitHub Actions es el
   * `secrets.GITHUB_TOKEN` ambiente (firma como `github-actions[bot]`). Sin un
   * token con ese permiso, `postReview` recibe un 403 de la API.
   */
  token: string
}

/**
 * Forma del comentario inline que la REST API de reviews espera. GitHub ubica
 * el comentario por `path` + `line` + `side` en el diff del PR (NO por
 * `position`, que es el offset legacy). Si el `line`/`side` no cae sobre una
 * línea del diff, la API rechaza el comentario — por eso filtramos los que no
 * tienen `line` válido antes de enviar (defensa: el modelo a veces inventa
 * líneas fuera del hunk).
 */
interface GitHubReviewComment {
  path: string
  line: number
  side: "LEFT" | "RIGHT"
  body: string
}

export class TokenGitHubAdapter extends FetchGitHubAdapter {
  private readonly reviewToken: string

  constructor(options: TokenGitHubAdapterOptions) {
    // El padre usa el mismo token para autenticar las LECTURAS (sube el
    // rate-limit y permite repos privados). Ambos viajan como Bearer.
    super({ token: options.token })
    const t = options.token?.trim()
    if (!t) {
      throw new Error(
        "TokenGitHubAdapter requiere un token con permiso pull-requests:write " +
          "(en GitHub Actions: secrets.GITHUB_TOKEN). Recibió uno vacío.",
      )
    }
    this.reviewToken = t
  }

  /**
   * Mapea los comentarios de dominio ({@link ReviewComment}) a la forma de la
   * REST API, descartando los que no traen una línea válida (el modelo a veces
   * apunta a líneas fuera del diff, que GitHub rechazaría con 422).
   */
  private mapComments(comments: ReviewComment[]): GitHubReviewComment[] {
    return comments
      .filter((c) => Number.isInteger(c.line) && c.line > 0 && c.path.length > 0)
      .map((c) => ({
        path: c.path,
        line: c.line,
        side: c.side,
        body: c.body,
      }))
  }

  /**
   * Publica el review REAL en el PR.
   *
   * `POST /repos/{owner}/{repo}/pulls/{n}/reviews` con
   * `{ body, event: "COMMENT", comments }`. Forzamos `event=COMMENT` (ver
   * docblock de la clase): el veredicto del LLM viaja en `review.body`, pero
   * el review nunca bloquea ni aprueba.
   *
   * @throws Error si la API responde no-ok (el loop lo propaga; en CI el job
   *   falla con el status + cuerpo del error, fail-loud).
   */
  override async postReview(
    owner: string,
    repo: string,
    pullNumber: number,
    review: ReviewInput,
  ): Promise<ReviewResult> {
    const comments = this.mapComments(review.comments)

    const body = {
      body: review.body,
      // SIEMPRE COMMENT en el MVP — nunca REQUEST_CHANGES/APPROVE.
      event: "COMMENT" as const,
      ...(comments.length > 0 ? { comments } : {}),
    }

    const response = await fetch(`${BASE_URL}/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        // hook-bypass: secret-leak — el Bearer es el token ambiente de Actions
        // pasado en runtime, no una credencial hardcodeada.
        Authorization: `Bearer ${this.reviewToken}`,
        "X-GitHub-Api-Version": GITHUB_API_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(
        `Failed to post review: ${response.status} ${response.statusText} — ${await response.text()}`,
      )
    }

    const data = (await response.json()) as Record<string, unknown>
    return {
      review_id: (data.id as number) ?? -1,
      review_url: (data.html_url as string) ?? "",
      comments_posted: comments.length,
      status: (data.state as string) ?? "COMMENTED",
    }
  }
}
