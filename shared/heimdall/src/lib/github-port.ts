/**
 * GitHubPort — interfaz mínima de puerto (patrón Ports & Adapters) que el
 * reviewer necesita para leer un PR y publicar un review.
 *
 * El plugin OpenClaw original tenía una `GitHubService` monolítica (~1063
 * líneas): auth de GitHub App vía JWT, refresh de installation tokens, caching,
 * paginación, fan-out de re-tries al partir reviews grandes, etc. NADA de eso
 * es necesario para un dry-run ni para el contrato del loop. El veredicto del
 * panel adversarial fue: definir un PUERTO mínimo con SOLO los dos métodos que
 * el executor de tools invoca (`getPullRequest`, `postReview`) e inyectarlo.
 *
 * Adaptadores concretos:
 *   - `FetchGitHubAdapter` (src/adapters/fetch-github-adapter.ts): lee un PR
 *     real vía `fetch` a api.github.com (Mode B del dry-run).
 *   - `MockPostAdapter` (src/adapters/mock-post-adapter.ts): envuelve cualquier
 *     puerto y INTERCEPTA `postReview`, imprimiendo el review en consola en vez
 *     de postearlo (el corazón del dry-run, modes A y B).
 *
 * Los tipos de datos (PullRequestData, ReviewComment, etc.) se conservan
 * idénticos a los del plugin original porque son el contrato que el formatter
 * (`review-body-formatter.ts`) y el executor (`github-tool-defs.ts`) ya esperan
 * — re-tiparlos habría forzado a editar lógica que el brief manda preservar.
 */

// ─── Tipos de datos (extraídos verbatim de github.ts del plugin) ──────────────

export interface PullRequestFile {
  filename: string
  status: string
  additions: number
  deletions: number
  patch?: string
}

export interface PullRequestData {
  number: number
  title: string
  body: string | null
  author: string
  branch: string
  base_branch: string
  head_sha: string
  labels: string[]
  mergeable: boolean | null
  changed_files: PullRequestFile[]
  diff_truncated: boolean
}

export interface FileContent {
  content: string
  encoding: string
  size: number
  sha: string
}

export interface ReviewComment {
  path: string
  line: number
  side: "LEFT" | "RIGHT"
  body: string
  /**
   * Severidad del hallazgo. `nit` es el 4º tier para P4 (nitpicks
   * de estilo/naming). El formatter los suprime por defecto salvo
   * `include_nits` o ≤3 nits. Mapa schema↔tag visible 4↔4:
   * `security_block` → 🔴 P1, `compliance` → 🟡 P2, `business` → 🔵 P3,
   * `nit` → ⚪ P4.
   */
  severity: "security_block" | "compliance" | "business" | "nit"
  /**
   * Sugerencia committable opcional. Cuando está presente, el
   * executor envuelve el valor en un bloque ```suggestion para que GitHub
   * renderice un botón "Apply suggestion".
   */
  suggestion?: string
}

export interface ReviewInput {
  body: string
  event: "APPROVE" | "REQUEST_CHANGES" | "COMMENT"
  commit_id: string
  comments: ReviewComment[]
  /** Confianza subjetiva opcional del LLM (1.0–5.0). */
  confidence?: number
}

export interface ReviewResult {
  review_id: number
  review_url: string
  comments_posted: number
  status: string
}

export interface CodeSearchMatch {
  path: string
  repo: string
  url: string
  match_snippet: string
}

export interface CodeSearchResult {
  matches: CodeSearchMatch[]
  total_count: number
  incomplete_results: boolean
}

// ─── Puerto ───────────────────────────────────────────────────────────────────

/**
 * Contrato mínimo que el reviewer consume. Los tres métodos opcionales
 * (`getFileContent`, `searchCode`) cubren las tools P2 del set del reviewer
 * (file-read, code-search). Si un adaptador no los implementa, el executor
 * lanza un error legible cuando el LLM intenta llamarlos — aceptable en un
 * dry-run donde el fixture rara vez los necesita.
 */
export interface GitHubPort {
  /** Lee metadata + diff + archivos cambiados de un PR. */
  getPullRequest(owner: string, repo: string, pullNumber: number): Promise<PullRequestData>

  /** Publica un review con comentarios inline. En dry-run, esto se mockea. */
  postReview(
    owner: string,
    repo: string,
    pullNumber: number,
    review: ReviewInput,
  ): Promise<ReviewResult>

  /** Lee el contenido de un archivo en un ref dado (tool file-read, opcional). */
  getFileContent?(owner: string, repo: string, path: string, ref: string): Promise<FileContent>

  /** Busca código en GitHub (tool code-search, opcional). */
  searchCode?(
    query: string,
    owner: string,
    repo: string | undefined,
    path: string | undefined,
    extension: string | undefined,
    limit: number,
  ): Promise<CodeSearchResult>
}
