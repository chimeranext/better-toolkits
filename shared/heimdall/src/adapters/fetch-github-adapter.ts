/**
 * FetchGitHubAdapter — adaptador de {@link GitHubPort} que lee un PR real vía
 * `fetch` directo a api.github.com. Es la mitad de LECTURA del dry-run Mode B.
 *
 * Diferencia clave vs la `GitHubService` del plugin OpenClaw: aquella se
 * autenticaba como GitHub App (JWT firmado con la private key + installation
 * token con refresh/caching). Para un dry-run eso es overkill: este adaptador
 * usa un Personal Access Token opcional (`GITHUB_TOKEN`) — suficiente para leer
 * PRs públicos (sin token, sujeto a rate-limit anónimo) o privados (con token).
 *
 * El mapeo `pulls` + `pulls/{n}/files` → `PullRequestData` se conserva idéntico
 * al de `GitHubService.getPullRequest` para que el shape que ve el LLM sea el
 * mismo. `postReview` NO se implementa de verdad aquí: en el dry-run siempre se
 * envuelve con {@link MockPostAdapter}, que lo intercepta. Si alguien llamara
 * `postReview` directamente sobre este adaptador, lanza (fail-loud).
 */

import type {
  CodeSearchResult,
  FileContent,
  GitHubPort,
  PullRequestData,
  PullRequestFile,
  ReviewInput,
  ReviewResult,
} from "../lib/github-port.ts"

const BASE_URL = "https://api.github.com"
const MAX_DIFF_SIZE = 100_000 // 100KB total — mismo cap que el plugin original.

export interface FetchGitHubAdapterOptions {
  /**
   * Personal Access Token opcional. Sin él, las llamadas van anónimas (OK para
   * repos públicos; sujeto al rate-limit anónimo de GitHub). Con él, lee repos
   * privados y obtiene un rate-limit más alto.
   */
  token?: string
}

export class FetchGitHubAdapter implements GitHubPort {
  private readonly token?: string

  constructor(options: FetchGitHubAdapterOptions = {}) {
    this.token = options.token?.trim() || undefined
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { Accept: "application/vnd.github+json" }
    if (this.token) h.Authorization = `Bearer ${this.token}`
    return h
  }

  async getPullRequest(owner: string, repo: string, pullNumber: number): Promise<PullRequestData> {
    const headers = this.headers()

    const [prResponse, filesResponse] = await Promise.all([
      fetch(`${BASE_URL}/repos/${owner}/${repo}/pulls/${pullNumber}`, { headers }),
      fetch(`${BASE_URL}/repos/${owner}/${repo}/pulls/${pullNumber}/files?per_page=100`, {
        headers,
      }),
    ])

    if (!prResponse.ok) {
      throw new Error(`Failed to fetch PR: ${prResponse.status} ${prResponse.statusText}`)
    }
    if (!filesResponse.ok) {
      throw new Error(
        `Failed to fetch PR files: ${filesResponse.status} ${filesResponse.statusText}`,
      )
    }

    const pr = (await prResponse.json()) as Record<string, unknown>
    const files = (await filesResponse.json()) as PullRequestFile[]

    // Trunca diffs grandes (mismo umbral que el plugin).
    let totalDiffSize = 0
    let diffTruncated = false
    const changed_files = files.map((f) => {
      totalDiffSize += f.patch?.length ?? 0
      if (totalDiffSize > MAX_DIFF_SIZE) {
        diffTruncated = true
        return {
          ...f,
          patch: `[TRUNCATED — total diff exceeds ${MAX_DIFF_SIZE / 1000}KB limit]`,
        }
      }
      return f
    })

    const user = pr.user as Record<string, unknown> | undefined
    const head = pr.head as Record<string, unknown> | undefined
    const base = pr.base as Record<string, unknown> | undefined
    const labels = pr.labels as Array<Record<string, unknown>> | undefined

    return {
      number: pr.number as number,
      title: pr.title as string,
      body: (pr.body as string) ?? null,
      author: (user?.login as string) ?? "unknown",
      branch: (head?.ref as string) ?? "unknown",
      base_branch: (base?.ref as string) ?? "unknown",
      head_sha: (head?.sha as string) ?? "",
      labels: labels?.map((l) => l.name as string) ?? [],
      mergeable: (pr.mergeable as boolean) ?? null,
      changed_files,
      diff_truncated: diffTruncated,
    }
  }

  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    ref: string,
  ): Promise<FileContent> {
    const url = `${BASE_URL}/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(ref)}`
    const response = await fetch(url, { headers: this.headers() })
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`)
    }
    const data = (await response.json()) as Record<string, unknown>
    return {
      content: (data.content as string) ?? "",
      encoding: (data.encoding as string) ?? "base64",
      size: (data.size as number) ?? 0,
      sha: (data.sha as string) ?? "",
    }
  }

  async searchCode(
    query: string,
    owner: string,
    repo: string | undefined,
    path: string | undefined,
    extension: string | undefined,
    limit: number,
  ): Promise<CodeSearchResult> {
    const qualifiers = [query]
    if (repo) qualifiers.push(`repo:${owner}/${repo}`)
    else if (owner) qualifiers.push(`user:${owner}`)
    if (path) qualifiers.push(`path:${path}`)
    if (extension) qualifiers.push(`extension:${extension}`)

    const url = `${BASE_URL}/search/code?q=${encodeURIComponent(qualifiers.join(" "))}&per_page=${limit}`
    const response = await fetch(url, {
      headers: { ...this.headers(), Accept: "application/vnd.github.text-match+json" },
    })
    if (!response.ok) {
      throw new Error(`Code search failed: ${response.status} ${response.statusText}`)
    }
    const data = (await response.json()) as Record<string, unknown>
    const items = (data.items as Array<Record<string, unknown>>) ?? []
    return {
      matches: items.slice(0, limit).map((it) => ({
        path: (it.path as string) ?? "",
        repo: ((it.repository as Record<string, unknown>)?.full_name as string) ?? "",
        url: (it.html_url as string) ?? "",
        match_snippet: "",
      })),
      total_count: (data.total_count as number) ?? items.length,
      incomplete_results: (data.incomplete_results as boolean) ?? false,
    }
  }

  // postReview NO se implementa de verdad: en el dry-run se envuelve con
  // MockPostAdapter, que lo intercepta antes de llegar aquí. Llamarlo directo
  // es un error de cableado — fail-loud.
  async postReview(
    _owner: string,
    _repo: string,
    _pullNumber: number,
    _review: ReviewInput,
  ): Promise<ReviewResult> {
    throw new Error(
      "FetchGitHubAdapter.postReview no está implementado a propósito: en el dry-run el post " +
        "debe ir envuelto en MockPostAdapter (intercepta e imprime, no postea). " +
        "Postear de verdad a GitHub es una capacidad futura de la GitHub App Heimdall.",
    )
  }
}
