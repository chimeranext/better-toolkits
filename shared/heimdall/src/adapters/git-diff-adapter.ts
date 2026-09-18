/**
 * GitDiffAdapter — adaptador de {@link GitHubPort} que arma un PullRequestData
 * sintético desde el `git diff` LOCAL de la rama actual, sin tocar GitHub.
 *
 * Es la mitad de LECTURA del modo `heimdall-review diff` (review 100% local): el
 * loop corre completo (lee el "PR" del diff local, llama al LLM, ejecuta tools)
 * pero nunca contacta a la API de GitHub para leer. Como no hay un PR real al
 * que postear, `postReview` se neutraliza (fail-loud): este adaptador SIEMPRE se
 * envuelve en {@link MockPostAdapter}, que intercepta el post y lo imprime.
 *
 * El base ref se resuelve afuera (ver {@link resolveBaseRef}) y se compara con
 * `HEAD` usando la sintaxis de tres puntos `git diff <base>...HEAD` — el diff
 * desde el ancestro común (merge-base), igual que lo que un PR mostraría.
 *
 * Maneja: repo sin commits, sin diff ("no hay cambios para revisar"), base
 * inexistente (el caller cae a un fallback antes de llegar acá).
 */

import type {
  GitHubPort,
  PullRequestData,
  PullRequestFile,
  ReviewInput,
  ReviewResult,
} from "../lib/github-port.ts"

const MAX_DIFF_SIZE = 100_000 // 100KB total — mismo cap que FetchGitHubAdapter.

/** Error legible cuando el diff local está vacío (nada que revisar). */
export class NoChangesError extends Error {
  constructor(base: string) {
    super(`no hay cambios para revisar (git diff ${base}...HEAD está vacío).`)
    this.name = "NoChangesError"
  }
}

/** Corre un subproceso `git` y devuelve su stdout. Lanza si el exit ≠ 0. */
export async function runGit(args: string[], cwd?: string): Promise<string> {
  const proc = Bun.spawn(["git", ...args], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  })
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ])
  if (exitCode !== 0) {
    throw new Error(`git ${args.join(" ")} falló (exit ${exitCode}): ${stderr.trim()}`)
  }
  return stdout
}

/**
 * Resuelve el base ref a comparar contra HEAD. Prioriza el `--base` explícito;
 * si no, intenta `git merge-base origin/HEAD HEAD` y cae a `main`, `origin/main`
 * o `master` según exista. Devuelve el primer ref resoluble.
 */
export async function resolveBaseRef(
  explicitBase: string | undefined,
  cwd?: string,
): Promise<string> {
  if (explicitBase && explicitBase.trim()) return explicitBase.trim()

  // Candidato preferido: el merge-base con el HEAD remoto por defecto.
  try {
    const mb = (await runGit(["merge-base", "origin/HEAD", "HEAD"], cwd)).trim()
    if (mb) return mb
  } catch {
    // origin/HEAD puede no estar definido en un clon local — seguimos a fallbacks.
  }

  // Fallbacks por nombre de rama base habitual.
  for (const candidate of ["main", "origin/main", "master", "origin/master"]) {
    try {
      await runGit(["rev-parse", "--verify", "--quiet", candidate], cwd)
      return candidate
    } catch {
      // El ref no existe — probamos el siguiente.
    }
  }

  // Último recurso: el primer commit del repo (revisa todo el historial de la rama).
  const root = (await runGit(["rev-list", "--max-parents=0", "HEAD"], cwd)).trim()
  const firstRoot = root.split("\n")[0]?.trim()
  if (firstRoot) return firstRoot

  throw new Error("no pude resolver un base ref (¿repo sin commits?). Pasá --base <ref>.")
}

/**
 * Parsea la salida de `git diff --numstat -z` + el patch completo en una lista
 * de {@link PullRequestFile}. Se exporta para testearlo aislado.
 */
export function parseGitDiff(numstat: string, rawDiff: string): PullRequestFile[] {
  // --numstat -z separa registros con NUL; cada registro es "adds\tdels\tpath".
  const records = numstat.split("\0").filter((r) => r.length > 0)
  const patches = splitPatchesByFile(rawDiff)

  const files: PullRequestFile[] = []
  let totalDiffSize = 0
  let truncated = false

  for (const rec of records) {
    const parts = rec.split("\t")
    if (parts.length < 3) continue
    const [addsRaw, delsRaw, filename] = parts
    // Binarios reportan "-" en additions/deletions; los normalizamos a 0.
    const additions = addsRaw === "-" ? 0 : Number.parseInt(addsRaw, 10) || 0
    const deletions = delsRaw === "-" ? 0 : Number.parseInt(delsRaw, 10) || 0

    let patch = patches.get(filename)
    if (patch !== undefined) {
      totalDiffSize += patch.length
      if (totalDiffSize > MAX_DIFF_SIZE) {
        truncated = true
        patch = `[TRUNCATED — total diff exceeds ${MAX_DIFF_SIZE / 1000}KB limit]`
      }
    }

    files.push({
      filename,
      status: deriveStatus(additions, deletions),
      additions,
      deletions,
      ...(patch !== undefined ? { patch } : {}),
    })
  }

  return files.map((f) => (truncated && f.patch && f.patch.length > 200 ? { ...f } : f))
}

/** Heurística de estado a partir de los conteos (git numstat no lo da directo). */
function deriveStatus(additions: number, deletions: number): string {
  if (deletions === 0 && additions > 0) return "added"
  if (additions === 0 && deletions > 0) return "removed"
  return "modified"
}

/**
 * Parte un `git diff` completo en un mapa filename → patch (el hunk de ese
 * archivo, desde su cabecera `diff --git` hasta la del siguiente). Usa la línea
 * `+++ b/<path>` para nombrar; cae al `diff --git a/x b/x` si el archivo se
 * borró (no hay `+++ b/`).
 */
function splitPatchesByFile(rawDiff: string): Map<string, string> {
  const map = new Map<string, string>()
  if (!rawDiff.trim()) return map

  const blocks = rawDiff.split(/(?=^diff --git )/m).filter((b) => b.startsWith("diff --git"))
  for (const block of blocks) {
    const plusMatch = block.match(/^\+\+\+ b\/(.+)$/m)
    let name = plusMatch?.[1]
    if (!name || name === "/dev/null") {
      // Archivo borrado: tomamos el lado `a/`.
      const headerMatch = block.match(/^diff --git a\/(.+?) b\/(.+?)$/m)
      name = headerMatch?.[1]
    }
    if (name) map.set(name.trim(), block.trimEnd() + "\n")
  }
  return map
}

export interface GitDiffAdapterOptions {
  /** Base ref ya resuelto (ver {@link resolveBaseRef}). */
  base: string
  /** Directorio de trabajo del repo (default: cwd del proceso). */
  cwd?: string
}

export class GitDiffAdapter implements GitHubPort {
  private readonly base: string
  private readonly cwd?: string

  constructor(options: GitDiffAdapterOptions) {
    this.base = options.base
    this.cwd = options.cwd
  }

  async getPullRequest(
    _owner: string,
    _repo: string,
    pullNumber: number,
  ): Promise<PullRequestData> {
    const range = `${this.base}...HEAD`

    // numstat (-z para nombres con caracteres raros) + diff completo, en paralelo.
    const [numstat, rawDiff, headSha, branch, lastSubject] = await Promise.all([
      runGit(["diff", "--numstat", "-z", range], this.cwd),
      runGit(["diff", range], this.cwd),
      runGit(["rev-parse", "HEAD"], this.cwd).then((s) => s.trim()),
      runGit(["rev-parse", "--abbrev-ref", "HEAD"], this.cwd).then((s) => s.trim()),
      runGit(["log", "-1", "--pretty=%s"], this.cwd).then((s) => s.trim()),
    ])

    const changed_files = parseGitDiff(numstat, rawDiff)
    if (changed_files.length === 0) {
      throw new NoChangesError(this.base)
    }

    // Título del "PR": el subject del último commit; si la rama no es detached,
    // anteponemos el nombre de rama para dar contexto.
    const title =
      branch && branch !== "HEAD" ? `${branch}: ${lastSubject}` : lastSubject || "(cambios locales)"

    const diff_truncated = changed_files.some(
      (f) => typeof f.patch === "string" && f.patch.startsWith("[TRUNCATED"),
    )

    return {
      number: pullNumber,
      title,
      body: `Review local del diff \`${range}\` (modo diff — sin GitHub).`,
      author: "local",
      branch: branch || "HEAD",
      base_branch: this.base,
      head_sha: headSha,
      labels: [],
      mergeable: null,
      changed_files,
      diff_truncated,
    }
  }

  // postReview no aplica en modo diff (no hay PR remoto). SIEMPRE se envuelve en
  // MockPostAdapter, que lo intercepta antes de llegar acá. Llamarlo directo es
  // un error de cableado — fail-loud.
  async postReview(
    _owner: string,
    _repo: string,
    _pullNumber: number,
    _review: ReviewInput,
  ): Promise<ReviewResult> {
    throw new Error(
      "GitDiffAdapter.postReview no aplica en modo diff (no hay PR remoto): " +
        "envolvé el adaptador en MockPostAdapter (intercepta e imprime, no postea).",
    )
  }
}
