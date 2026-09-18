/**
 * FixtureGitHubAdapter — adaptador de {@link GitHubPort} que sirve un PR desde
 * un objeto en memoria (típicamente cargado de un archivo `fixtures/*.json`).
 * Es la mitad de LECTURA del dry-run Mode A: cero red de GitHub, así el dry-run
 * solo necesita `NVIDIA_API_KEY` para hablar con el LLM.
 *
 * `getFileContent` y `searchCode` se dejan sin implementar a propósito: un
 * fixture de un solo PR no tiene un árbol de archivos ni un índice de búsqueda.
 * Si el LLM intenta llamarlos, el executor lanza un error legible y el loop lo
 * trata como un tool-result de error (no truena el review). Para el fixture de
 * ejemplo, el reviewer puede revisar usando solo el diff del PR.
 */

import type { GitHubPort, PullRequestData, ReviewInput, ReviewResult } from "../lib/github-port.ts"

export class FixtureGitHubAdapter implements GitHubPort {
  private readonly pr: PullRequestData

  constructor(pr: PullRequestData) {
    this.pr = pr
  }

  async getPullRequest(
    _owner: string,
    _repo: string,
    _pullNumber: number,
  ): Promise<PullRequestData> {
    return this.pr
  }

  // postReview se neutraliza vía MockPostAdapter en el dry-run. Llamarlo directo
  // es un error de cableado.
  async postReview(
    _owner: string,
    _repo: string,
    _pullNumber: number,
    _review: ReviewInput,
  ): Promise<ReviewResult> {
    throw new Error(
      "FixtureGitHubAdapter.postReview no implementado: envolvé el adaptador en MockPostAdapter.",
    )
  }
}
