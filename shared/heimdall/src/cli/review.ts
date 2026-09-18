#!/usr/bin/env bun
/**
 * heimdall-review — CLI de review local on-demand de Heimdall.
 *
 * Un solo binario con tres subcomandos. Reusa el motor existente
 * (`reviewPullRequest` → `runReviewLoop`, lane `nim-kimi`) y los adaptadores ya
 * escritos; no reimplementa nada del loop:
 *
 *   heimdall-review diff [--base <ref>]       review 100% local del git diff
 *                                            de la rama (GitDiffAdapter), IMPRIME,
 *                                            no postea. Solo necesita NVIDIA_API_KEY.
 *
 *   heimdall-review pr <n> [--owner o]        review de un PR (FetchGitHubAdapter);
 *                  [--repo r] [--post]       IMPRIME por default. Con --post postea
 *                                            de verdad (TokenGitHubAdapter, requiere
 *                                            GITHUB_TOKEN). owner/repo se autodetectan
 *                                            del remote `origin` si no se pasan.
 *
 *   heimdall-review install [--force]         scaffolds los 3 wrappers (slash de
 *                  [--with-hook]             Claude Code, target de Makefile, git
 *                                            alias + pre-push hook) en el cwd.
 *
 * Flags comunes: --provider <id> (default nim-kimi), --help.
 *
 * Bun ejecuta TS directo, así que el bin apunta a este archivo sin build.
 */

import { reviewPullRequest } from "../reviewer.ts"
import { MockPostAdapter } from "../adapters/mock-post-adapter.ts"
import { FetchGitHubAdapter } from "../adapters/fetch-github-adapter.ts"
import { TokenGitHubAdapter } from "../adapters/token-github-adapter.ts"
import {
  GitDiffAdapter,
  NoChangesError,
  resolveBaseRef,
  runGit,
} from "../adapters/git-diff-adapter.ts"
import { consoleLogger } from "../lib/host.ts"
import { runInstall } from "./install.ts"
import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"

const DEFAULT_PROVIDER = "nim-kimi"

/** Entornos válidos para la key-chain (sufijo del archivo `.{env}.nvidia.env`). */
export type KeyEnv = "staging" | "prod"
const DEFAULT_KEY_ENV: KeyEnv = "staging"

/**
 * Nombres de variable aceptados dentro de un `.{env}.nvidia.env`, en orden de
 * preferencia. Aceptamos el nombre canónico y los nombres "decorados" que
 * Infisical exporta por entorno (`_INTERNAL_STAGING` / `_PUBLIC_PROD`), así el
 * archivo se puede generar tal cual sin renombrar a mano.
 */
const NVIDIA_KEY_NAMES = [
  "NVIDIA_API_KEY",
  "NVIDIA_API_KEY_INTERNAL_STAGING",
  "NVIDIA_API_KEY_PUBLIC_PROD",
] as const

/** Aborta con un mensaje legible y exit 1. */
function fail(msg: string): never {
  console.error(`[heimdall-review] ${msg}`)
  process.exit(1)
}

/**
 * Mensaje de error cuando no se pudo resolver la NIM key por ningún camino.
 * Lista la precedencia exacta (env → archivo gitignoreado → error) para que el
 * usuario sepa qué poblar. Nunca imprime ningún valor.
 */
function failMissingNvidiaKey(env: KeyEnv): never {
  return fail(
    "no pude resolver NVIDIA_API_KEY (bearer de NVIDIA NIM para el lane Kimi).\n" +
      "  Precedencia:\n" +
      "  1. Variable de entorno NVIDIA_API_KEY:\n" +
      "       NVIDIA_API_KEY=nvapi-... heimdall-review …\n" +
      "       # o vía hygiene centralizada:  infisical run -- heimdall-review …\n" +
      `  2. Archivo .${env}.nvidia.env (gitignoreado) en el cwd o un ancestro:\n` +
      `       heimdall-review key:pull --env ${env}   # lo genera desde Infisical\n` +
      "       # o a mano:  NVIDIA_API_KEY=nvapi-... → ese archivo (debe estar gitignoreado)\n" +
      "  3. Si nada de lo anterior, este error.",
  )
}

/**
 * Parsea el contenido de un archivo dotenv minimalista (`KEY=value` por línea).
 * Ignora líneas vacías y comentarios (`#`). Quita comillas envolventes simples o
 * dobles del valor. No expande variables ni interpola — es deliberadamente tonto.
 */
export function parseEnvFile(content: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const raw of content.split("\n")) {
    const line = raw.trim()
    if (!line || line.startsWith("#")) continue
    const eq = line.indexOf("=")
    if (eq <= 0) continue
    const key = line.slice(0, eq).trim()
    let val = line.slice(eq + 1).trim()
    if (
      val.length >= 2 &&
      ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
    ) {
      val = val.slice(1, -1)
    }
    out[key] = val
  }
  return out
}

/**
 * Extrae la NIM key de un mapa de variables, probando los nombres aceptados en
 * orden. Devuelve `undefined` si ninguno tiene un valor no-vacío.
 */
export function pickNvidiaKey(vars: Record<string, string>): string | undefined {
  for (const name of NVIDIA_KEY_NAMES) {
    const v = (vars[name] ?? "").trim()
    if (v) return v
  }
  return undefined
}

/**
 * Sube de `startDir` hacia la raíz buscando un archivo llamado `filename`.
 * Devuelve la ruta absoluta del primero que encuentre, o `undefined`. Para en la
 * raíz del filesystem (cuando `dirname` deja de cambiar).
 */
export function findUpwards(filename: string, startDir: string): string | undefined {
  let dir = startDir
  for (;;) {
    const candidate = join(dir, filename)
    if (existsSync(candidate)) return candidate
    const parent = dirname(dir)
    if (parent === dir) return undefined
    dir = parent
  }
}

/**
 * GUARDRAIL — verifica que `filePath` esté efectivamente gitignoreado antes de
 * que el caller lo lea como fuente de secretos. Usa `git check-ignore`, que sale
 * con código 0 si la ruta está ignorada y 1 si NO lo está. Si git falla por otra
 * razón (no es un repo, etc.) tratamos la ruta como NO-ignorada (fail-safe): no
 * vamos a confiar un secreto a un archivo cuyo estado de ignore no podemos probar.
 */
export async function isGitIgnored(filePath: string): Promise<boolean> {
  try {
    const proc = Bun.spawn(["git", "check-ignore", "--quiet", filePath], {
      cwd: dirname(filePath),
      stdout: "ignore",
      stderr: "ignore",
    })
    const code = await proc.exited
    return code === 0
  } catch {
    return false
  }
}

/**
 * Resuelve la NIM key con la precedencia documentada:
 *   1. `process.env.NVIDIA_API_KEY` (o `overrideEnv` inyectado en tests) si está.
 *   2. El archivo `.{env}.nvidia.env` encontrado subiendo del cwd a la raíz,
 *      SIEMPRE que `git check-ignore` confirme que está ignorado. Si existe pero
 *      NO está ignorado, REHÚSA y aborta (no filtramos la key por un archivo que
 *      podría terminar commiteado).
 *   3. Si nada de lo anterior, `failMissingNvidiaKey`.
 *
 * Nunca imprime el valor. El `env` sale de `--env`, o `BIFROST_NVIDIA_ENV`, o
 * el default `staging`.
 *
 * Inyectables para tests: `overrideEnv` (mapa que reemplaza a `process.env`) y
 * `cwd`. `checkIgnored` permite simular el guardrail sin un repo git real.
 */
export async function resolveNvidiaKey(opts: {
  env: KeyEnv
  cwd?: string
  overrideEnv?: Record<string, string | undefined>
  checkIgnored?: (filePath: string) => Promise<boolean>
}): Promise<string> {
  const sourceEnv = opts.overrideEnv ?? process.env
  const cwd = opts.cwd ?? process.cwd()
  const checkIgnored = opts.checkIgnored ?? isGitIgnored

  // 1. Variable de entorno gana siempre.
  const fromEnv = (sourceEnv.NVIDIA_API_KEY ?? "").trim()
  if (fromEnv) return fromEnv

  // 2. Archivo .{env}.nvidia.env subiendo de cwd a la raíz.
  const filename = `.${opts.env}.nvidia.env`
  const filePath = findUpwards(filename, cwd)
  if (filePath) {
    if (!(await checkIgnored(filePath))) {
      fail(
        `encontré ${filePath} pero NO está gitignoreado — me niego a leerlo para no ` +
          `filtrar la key. Agregá "*.nvidia.env" al .gitignore (o corré ` +
          `\`heimdall-review install\`, que lo hace) y reintentá.`,
      )
    }
    const vars = parseEnvFile(readFileSync(filePath, "utf8"))
    const key = pickNvidiaKey(vars)
    if (key) return key
    fail(
      `${filePath} existe pero no contiene ninguna de ${NVIDIA_KEY_NAMES.join(", ")} con valor.`,
    )
  }

  // 3. Nada.
  failMissingNvidiaKey(opts.env)
}

/** Resuelve el entorno de la key-chain desde flags / env, con default staging. */
export function resolveKeyEnv(
  flags: Record<string, string | boolean>,
  sourceEnv: Record<string, string | undefined> = process.env,
): KeyEnv {
  const raw =
    (typeof flags.env === "string" ? flags.env : undefined) ??
    (sourceEnv.BIFROST_NVIDIA_ENV ?? "").trim() ??
    ""
  if (raw === "prod") return "prod"
  if (raw === "staging" || raw === "") return DEFAULT_KEY_ENV
  fail(`--env inválido: "${raw}" (válidos: staging | prod).`)
}

/**
 * Hidrata `process.env.NVIDIA_API_KEY` resolviendo la key-chain, si todavía no
 * está poblada. Centraliza el side-effect para `cmdDiff`/`cmdPr`: el resto del
 * pipeline (loop, providers) sigue leyendo `process.env.NVIDIA_API_KEY`.
 */
async function ensureNvidiaKey(flags: Record<string, string | boolean>): Promise<void> {
  if ((process.env.NVIDIA_API_KEY ?? "").trim()) return
  const env = resolveKeyEnv(flags)
  const key = await resolveNvidiaKey({ env })
  process.env.NVIDIA_API_KEY = key
}

const HELP = `heimdall-review — review local on-demand de Heimdall (lane nim-kimi).

USO:
  heimdall-review diff [--base <ref>] [--provider <id>]
      Revisa el git diff local de la rama actual (sin GitHub) e IMPRIME el review.
      base default = merge-base con origin/HEAD (fallback main/master). Solo NVIDIA_API_KEY.

  heimdall-review pr <n> [--owner <o>] [--repo <r>] [--post] [--provider <id>]
      Revisa el PR #n. owner/repo se autodetectan del remote origin si se omiten.
      IMPRIME por default; --post postea de verdad (requiere GITHUB_TOKEN).

  heimdall-review install [--force] [--with-hook]
      Scaffolds los 3 wrappers (slash Claude Code, Makefile target, git alias +
      pre-push hook) en el repo actual. Idempotente; --force sobreescribe.
      El pre-push hook es opt-in: solo se instala con --with-hook.
      También agrega "*.nvidia.env" al .gitignore.

  heimdall-review key:pull [--env staging|prod]
      Materializa .{env}.nvidia.env (gitignoreado, 0600) desde Infisical, con
      solo la(s) variable(s) NVIDIA. Nunca imprime el valor. Default env: staging.

RESOLUCIÓN DE LA NIM KEY (precedencia):
  1. NVIDIA_API_KEY del entorno (env var / infisical run).
  2. Archivo .{env}.nvidia.env (gitignoreado) en el cwd o un ancestro;
     env = --env, o BIFROST_NVIDIA_ENV, o "staging". Si existe pero NO está
     gitignoreado, el CLI REHÚSA y aborta (no filtra la key).
  3. Si nada, error.

FLAGS COMUNES:
  --provider <id>   Lane del reviewer (default: ${DEFAULT_PROVIDER}).
  --env <e>         Entorno de la key-chain: staging | prod (default: staging).
  --help, -h        Muestra esta ayuda.

EJEMPLOS:
  infisical run -- heimdall-review diff
  infisical run -- heimdall-review diff --base develop
  infisical run -- heimdall-review pr 42
  infisical run -- heimdall-review pr 42 --post
`

/**
 * Parser mínimo de flags `--clave valor` / `--flag` (booleano). Devuelve un
 * mapa de flags + los posicionales restantes. No usa dependencias externas.
 */
export function parseArgs(argv: string[]): {
  positionals: string[]
  flags: Record<string, string | boolean>
} {
  const positionals: string[] = []
  const flags: Record<string, string | boolean> = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === "--help" || arg === "-h") {
      flags.help = true
      continue
    }
    if (arg.startsWith("--")) {
      const key = arg.slice(2)
      const next = argv[i + 1]
      // Flags booleanos conocidos no consumen el siguiente token.
      if (key === "post" || key === "force" || key === "with-hook") {
        flags[key] = true
        continue
      }
      if (next !== undefined && !next.startsWith("--")) {
        flags[key] = next
        i++
      } else {
        flags[key] = true
      }
      continue
    }
    positionals.push(arg)
  }
  return { positionals, flags }
}

/**
 * Autodetecta owner/repo del remote `origin`. Soporta los formatos SSH
 * (`git@github.com:owner/repo.git`) y HTTPS (`https://github.com/owner/repo.git`).
 */
export function parseOriginRemote(remoteUrl: string): { owner: string; repo: string } | null {
  const trimmed = remoteUrl.trim()
  const m =
    trimmed.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/) ?? null
  if (!m) return null
  return { owner: m[1], repo: m[2] }
}

/** Subcomando `diff` — review 100% local, sin GitHub. */
async function cmdDiff(flags: Record<string, string | boolean>): Promise<void> {
  await ensureNvidiaKey(flags)
  const provider = (flags.provider as string) || DEFAULT_PROVIDER
  if (!(process.env.REVIEWER_PROVIDER ?? "").trim()) process.env.REVIEWER_PROVIDER = provider

  const explicitBase = typeof flags.base === "string" ? flags.base : undefined
  let base: string
  try {
    base = await resolveBaseRef(explicitBase)
  } catch (err) {
    return fail(err instanceof Error ? err.message : String(err))
  }

  console.log(`[heimdall-review diff] base=${base}...HEAD lane=${process.env.REVIEWER_PROVIDER}`)

  // GitDiffAdapter (lectura local) envuelto en MockPost (imprime, no postea).
  const adapter = new GitDiffAdapter({ base })

  // Cortocircuito sin tocar el LLM: si el diff está vacío, no arranques el loop.
  try {
    await adapter.getPullRequest("local", "local", 0)
  } catch (err) {
    if (err instanceof NoChangesError) {
      console.log(`[heimdall-review diff] ${err.message}`)
      return
    }
    throw err
  }

  const port = new MockPostAdapter(adapter)
  const result = await reviewPullRequest({
    port,
    owner: "local",
    repo: "local",
    pullNumber: 0,
    logger: consoleLogger,
  })
  console.log(
    `\n[heimdall-review diff] listo — iteraciones=${result.iterations} ` +
      `reviewPosted=${result.reviewPosted} tokens(total)=${result.tokenUsage.totalTokens}`,
  )
}

/** Subcomando `pr <n>` — review de un PR; imprime o (con --post) postea. */
async function cmdPr(
  positionals: string[],
  flags: Record<string, string | boolean>,
): Promise<void> {
  const num = positionals[0]
  if (!num) fail("falta el número de PR. Uso: heimdall-review pr <n> [--owner o] [--repo r] [--post]")
  const pullNumber = Number.parseInt(num, 10)
  if (!Number.isInteger(pullNumber) || pullNumber <= 0) fail(`número de PR inválido: "${num}".`)

  await ensureNvidiaKey(flags)
  const provider = (flags.provider as string) || DEFAULT_PROVIDER
  if (!(process.env.REVIEWER_PROVIDER ?? "").trim()) process.env.REVIEWER_PROVIDER = provider

  // Autodetección owner/repo del remote origin si no se pasaron.
  let owner = typeof flags.owner === "string" ? flags.owner : undefined
  let repo = typeof flags.repo === "string" ? flags.repo : undefined
  if (!owner || !repo) {
    try {
      const remote = (await runGit(["remote", "get-url", "origin"])).trim()
      const parsed = parseOriginRemote(remote)
      if (parsed) {
        owner = owner ?? parsed.owner
        repo = repo ?? parsed.repo
      }
    } catch {
      // Sin remote origin — el usuario deberá pasar --owner/--repo.
    }
  }
  if (!owner || !repo) {
    fail(
      "no pude autodetectar owner/repo del remote origin. " +
        "Pasalos a mano: heimdall-review pr <n> --owner <o> --repo <r>.",
    )
  }

  const post = flags.post === true

  if (post) {
    const token = (process.env.GITHUB_TOKEN ?? "").trim()
    if (!token) fail("--post requiere GITHUB_TOKEN (permiso pull-requests:write).")
    console.log(
      `[heimdall-review pr] POSTEANDO review real a ${owner}/${repo}#${pullNumber} ` +
        `lane=${process.env.REVIEWER_PROVIDER} (event=COMMENT)`,
    )
    const port = new TokenGitHubAdapter({ token })
    const result = await reviewPullRequest({
      port,
      owner,
      repo,
      pullNumber,
      logger: consoleLogger,
    })
    console.log(
      `\n[heimdall-review pr] posteado — iteraciones=${result.iterations} ` +
        `reviewPosted=${result.reviewPosted} tokens(total)=${result.tokenUsage.totalTokens}`,
    )
    if (!result.reviewPosted) fail("el reviewer terminó sin postear un review (ver logs arriba).")
    return
  }

  // Default: leer real, imprimir (MockPost intercepta el post).
  console.log(
    `[heimdall-review pr] ${owner}/${repo}#${pullNumber} lane=${process.env.REVIEWER_PROVIDER} ` +
      `(dry-run — NO postea; usá --post para publicar)`,
  )
  if (!(process.env.GITHUB_TOKEN ?? "").trim()) {
    console.warn("[heimdall-review pr] sin GITHUB_TOKEN — lectura anónima (solo repos públicos).")
  }
  const port = new MockPostAdapter(new FetchGitHubAdapter({ token: process.env.GITHUB_TOKEN }))
  const result = await reviewPullRequest({
    port,
    owner,
    repo,
    pullNumber,
    logger: consoleLogger,
  })
  console.log(
    `\n[heimdall-review pr] listo — iteraciones=${result.iterations} ` +
      `reviewPosted=${result.reviewPosted} tokens(total)=${result.tokenUsage.totalTokens}`,
  )
}

/**
 * Subcomando `key:pull [--env staging|prod]` — materializa `.{env}.nvidia.env`
 * (gitignoreado) desde Infisical, sin imprimir el valor.
 *
 * Corre `infisical export --projectId=… --env=<env> --format dotenv`, filtra solo
 * la(s) variable(s) NVIDIA reconocidas y escribe SOLO esas a `.{env}.nvidia.env`
 * en el cwd. GUARDRAIL post-escritura: verifica que el archivo quede gitignoreado;
 * si no, lo borra y aborta (no dejamos un archivo con secreto sin ignorar).
 */
async function cmdKeyPull(flags: Record<string, string | boolean>): Promise<void> {
  const env = resolveKeyEnv(flags)
  const projectId = "c6dbbe50-0e7c-465d-98ca-4020bc4cbfcb"
  const dest = join(process.cwd(), `.${env}.nvidia.env`)

  console.log(
    `[heimdall-review key:pull] exportando vars NVIDIA de Infisical (env=${env}) → .${env}.nvidia.env`,
  )

  let exported: string
  try {
    const proc = Bun.spawn(
      ["infisical", "export", `--projectId=${projectId}`, `--env=${env}`, "--format", "dotenv"],
      { stdout: "pipe", stderr: "pipe" },
    )
    const [out, , code] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ])
    if (code !== 0) {
      fail(
        `infisical export salió con código ${code}. ¿Estás logueado (infisical login) ` +
          `y con acceso al env "${env}"?`,
      )
    }
    exported = out
  } catch (err) {
    return fail(
      `no pude correr infisical: ${err instanceof Error ? err.message : String(err)}. ` +
        `¿Está instalado el CLI de Infisical?`,
    )
  }

  // Filtrá solo las variables NVIDIA reconocidas — nunca volcamos el dotenv entero.
  const vars = parseEnvFile(exported)
  const lines: string[] = []
  for (const name of NVIDIA_KEY_NAMES) {
    const v = (vars[name] ?? "").trim()
    if (v) lines.push(`${name}=${v}`)
  }
  if (lines.length === 0) {
    fail(
      `el export de Infisical (env=${env}) no contiene ninguna de ` +
        `${NVIDIA_KEY_NAMES.join(", ")}. Nada que escribir.`,
    )
  }

  const { writeFileSync, rmSync } = await import("node:fs")
  writeFileSync(dest, lines.join("\n") + "\n", { mode: 0o600 })

  // GUARDRAIL post-escritura: si el archivo no quedó gitignoreado, borralo y abortá.
  if (!(await isGitIgnored(dest))) {
    rmSync(dest, { force: true })
    fail(
      `escribí ${dest} pero NO está gitignoreado — lo borré para no filtrar la key. ` +
        `Agregá "*.nvidia.env" al .gitignore (\`heimdall-review install\` lo hace) y reintentá.`,
    )
  }

  console.log(
    `[heimdall-review key:pull] listo — escribí ${lines.length} var(s) NVIDIA a ` +
      `.${env}.nvidia.env (0600, gitignoreado). Valor NO impreso.`,
  )
}

export async function main(argv: string[]): Promise<void> {
  const { positionals, flags } = parseArgs(argv)
  const subcommand = positionals.shift()

  if (flags.help || !subcommand) {
    console.log(HELP)
    if (!subcommand && !flags.help) process.exit(1)
    return
  }

  switch (subcommand) {
    case "diff":
      return cmdDiff(flags)
    case "pr":
      return cmdPr(positionals, flags)
    case "install":
      return runInstall({
        force: flags.force === true,
        withHook: flags["with-hook"] === true,
      })
    case "key:pull":
      return cmdKeyPull(flags)
    default:
      fail(`subcomando desconocido: "${subcommand}". Probá: diff | pr | install (o --help).`)
  }
}

// Entry directo (no cuando se importa desde un test).
if (import.meta.main) {
  main(Bun.argv.slice(2)).catch((err) => {
    console.error("[heimdall-review] falló:", err instanceof Error ? err.message : err)
    process.exit(1)
  })
}
