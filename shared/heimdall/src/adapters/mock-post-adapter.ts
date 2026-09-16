/**
 * MockPostAdapter — envuelve cualquier {@link GitHubPort} y INTERCEPTA
 * `postReview`: en vez de postear a GitHub, imprime el review en consola y
 * devuelve un {@link ReviewResult} sintético. Es el corazón del dry-run: el
 * loop corre completo (lee el PR, llama al LLM, ejecuta tools) pero el efecto
 * de lado externo —postear— se neutraliza.
 *
 * Decorator pattern: delega `getPullRequest` / `getFileContent` / `searchCode`
 * al puerto envuelto (que puede ser un FixtureGitHubAdapter en Mode A o un
 * FetchGitHubAdapter en Mode B), y solo sobreescribe `postReview`.
 */

import type {
  CodeSearchResult,
  FileContent,
  GitHubPort,
  PullRequestData,
  ReviewInput,
  ReviewResult,
} from "../lib/github-port.ts"

export interface MockPostAdapterOptions {
  /** Sink de impresión. Default: console.log. Inyectable para tests. */
  sink?: (line: string) => void
}

export class MockPostAdapter implements GitHubPort {
  private readonly inner: GitHubPort
  private readonly sink: (line: string) => void

  /** El último review interceptado, para que los tests lo inspeccionen. */
  public lastReview: { owner: string; repo: string; pullNumber: number; review: ReviewInput } | null =
    null

  constructor(inner: GitHubPort, options: MockPostAdapterOptions = {}) {
    this.inner = inner
    this.sink = options.sink ?? ((line) => console.log(line))
  }

  getPullRequest(owner: string, repo: string, pullNumber: number): Promise<PullRequestData> {
    return this.inner.getPullRequest(owner, repo, pullNumber)
  }

  getFileContent(owner: string, repo: string, path: string, ref: string): Promise<FileContent> {
    if (!this.inner.getFileContent) {
      return Promise.reject(
        new Error("El puerto envuelto no implementa getFileContent (file-read no disponible)."),
      )
    }
    return this.inner.getFileContent(owner, repo, path, ref)
  }

  searchCode(
    query: string,
    owner: string,
    repo: string | undefined,
    path: string | undefined,
    extension: string | undefined,
    limit: number,
  ): Promise<CodeSearchResult> {
    if (!this.inner.searchCode) {
      return Promise.reject(
        new Error("El puerto envuelto no implementa searchCode (code-search no disponible)."),
      )
    }
    return this.inner.searchCode(query, owner, repo, path, extension, limit)
  }

  async postReview(
    owner: string,
    repo: string,
    pullNumber: number,
    review: ReviewInput,
  ): Promise<ReviewResult> {
    this.lastReview = { owner, repo, pullNumber, review }

    const sep = "─".repeat(72)
    this.sink(`\n${sep}`)
    this.sink(`  DRY-RUN — review interceptado (NO posteado a GitHub)`)
    this.sink(`  PR:        ${owner}/${repo}#${pullNumber}`)
    this.sink(`  Veredicto: ${review.event}`)
    if (typeof review.confidence === "number") {
      this.sink(`  Confianza: ${review.confidence}/5`)
    }
    this.sink(`  Comentarios inline: ${review.comments.length}`)
    this.sink(sep)
    this.sink(review.body)
    if (review.comments.length > 0) {
      this.sink(`\n  ── Comentarios inline ──`)
      for (const c of review.comments) {
        this.sink(`  • [${c.severity}] ${c.path}:${c.line} (${c.side})`)
        this.sink(`    ${c.body.replace(/\n/g, "\n    ")}`)
      }
    }
    this.sink(`${sep}\n`)

    // Resultado sintético — valores obviamente placeholder para que cualquier
    // downstream que los use de verdad falle fuerte en vez de tratarlos como reales.
    return {
      review_id: -1,
      review_url: "dry-run://intercepted",
      comments_posted: review.comments.length,
      status: review.event,
    }
  }
}
