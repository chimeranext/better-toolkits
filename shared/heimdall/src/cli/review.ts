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
import { getGithubAppToken } from "../lib/github-app.ts"
import {
  GitDiffAdapter,
  NoChangesError,
  resolveBaseRef,
  runGit,
} from "../adapters/git-diff-adapter.ts"
import { consoleLogger } from "../lib/host.ts"
import {
  NIM_CATALOG_ANCHOR_DATE,
  fetchNimPreviewCatalog,
  isCatalogStale,
  missingCatalogLanes,
} from "../lib/nim-catalog.ts"
import { runInstall } from "./install.ts"
import { existsSync, readFileSync, statSync } from "node:fs"
import { homedir, platform as osPlatform } from "node:os"
import { dirname, join } from "node:path"

// El default del pass-1 (cooperativo) apunta al head de la cadena adversarial
// (nemotron-3.5-lightning), que es un endpoint NIM preview free VERIFICADO
// respondiendo en build.nvidia.com (observado ~0.6s el 2026-10-28).
// `nim-kimi` (kimi-k2.6) dejó de estar en el catálogo free el 2026-10-28 → 404.
const DEFAULT_PROVIDER = "nim-nemotron-3.5-lightning"

/**
 * Entornos válidos para la key-chain. El env selecciona la **variable dentro del
 * archivo**, no el nombre del archivo.
 */
export type KeyEnv = "staging" | "prod"
const DEFAULT_KEY_ENV: KeyEnv = "staging"

/**
 * Único nombre del archivo de la key-chain, en los dos scopes:
 *   - project scope: `<repo-root>/.heimdall.env` (gitignoreado; guardrail
 *     `git check-ignore` antes de leerlo)
 *   - user scope:    `~/.agents/.heimdall.env` (solo-dueno, 0600)
 *
 * Un solo nombre evita que una key válida quede invisible por estar en un
 * archivo con otro sufijo. El entorno (`--env`) elige la variable de adentro.
 */
export const HEIMDALL_ENV_BASENAME = ".heimdall.env"

/**
 * Nombres de variable aceptados dentro de `.heimdall.env`, en orden de
 * preferencia. Aceptamos el nombre canónico y los nombres "decorados" que
 * Infisical exporta por entorno (`_INTERNAL_STAGING` / `_PUBLIC_PROD`), así el
 * archivo se puede generar tal cual sin renombrar a mano.
 * La selección con conciencia de env vive en `pickNvidiaKeyForEnv`.
 */
const NVIDIA_KEY_NAMES = [
  "NVIDIA_API_KEY",
  "NVIDIA_API_KEY_INTERNAL_STAGING",
  "NVIDIA_API_KEY_PUBLIC_PROD",
] as const

/**
 * Selección con conciencia de env para `~/.agents/.heimdall.env`, que
 * concentra STAGING y PROD en un solo archivo (espejo del ejemplo de
 * vertivolatam). staging prefiere `_INTERNAL_STAGING`, prod `_PUBLIC_PROD`,
 * con el canónico como fallback universal.
 */
export function pickNvidiaKeyForEnv(
  vars: Record<string, string>,
  env: KeyEnv,
): string | undefined {
  const ordered =
    env === "prod"
      ? ["NVIDIA_API_KEY_PUBLIC_PROD", "NVIDIA_API_KEY"]
      : ["NVIDIA_API_KEY_INTERNAL_STAGING", "NVIDIA_API_KEY"]
  for (const name of ordered) {
    const v = (vars[name] ?? "").trim()
    if (v) return v
  }
  return undefined
}

/**
 * Igual que arriba para OpenRouter (lanes `openrouter-*`, incl. FREE ROUTER).
 * La mayoría de los setups usa una sola key (canónica); las variantes con
 * sufijo existen por simetría para quien separe por env.
 */
export const OPENROUTER_KEY_NAMES = [
  "OPENROUTER_API_KEY",
  "OPENROUTER_API_KEY_STAGING",
  "OPENROUTER_API_KEY_PROD",
] as const

export function pickOpenRouterKey(
  vars: Record<string, string>,
  env: KeyEnv,
): string | undefined {
  const ordered =
    env === "prod"
      ? ["OPENROUTER_API_KEY_PROD", "OPENROUTER_API_KEY"]
      : ["OPENROUTER_API_KEY_STAGING", "OPENROUTER_API_KEY"]
  for (const name of ordered) {
    const v = (vars[name] ?? "").trim()
    if (v) return v
  }
  return undefined
}

/** Aborta con un mensaje legible y exit 1. */
function fail(msg: string): never {
  console.error(`[heimdall-review] ${msg}`)
  process.exit(1)
}

/**
 * Mensaje de error cuando no se pudo resolver la NIM key por ningún camino.
 * Lista la precedencia exacta (env → archivo gitignoreado → ~/.agents con
 * permisos de solo-dueno → error) para que el usuario sepa qué poblar.
 * Nunca imprime ningún valor.
 */
function failMissingNvidiaKey(env: KeyEnv): never {
  return fail(
    "no pude resolver NVIDIA_API_KEY (bearer de NVIDIA NIM para el lane Kimi).\n" +
      "  Precedencia:\n" +
      "  1. Archivo de usuario ~/.agents/.heimdall.env (user scope) con permisos solo-dueno:\n" +
      "       Linux/macOS:  $HOME/.agents/.heimdall.env  (modo 0600)\n" +
      "       Windows:      %LOCALAPPDATA%/.agents/.heimdall.env\n" +
      "                     (fallback %USERPROFILE%/.agents/; vale el ACL del perfil)\n" +
      "       STAGING y PROD conviven en el MISMO archivo con nombres decorados:\n" +
      "         heimdall-review key:init --env staging   # pide las keys por diálogo GUI\n" +
      "         heimdall-review key:migrate --env staging  # mueve <repo>/.heimdall.env al user scope\n" +
      "  2. Archivo .heimdall.env en la RAÍZ DEL REPO (project scope, gitignoreado):\n" +
      `       heimdall-review key:pull --env ${env}   # lo genera desde Infisical\n` +
      "       # o a mano:  NVIDIA_API_KEY=nvapi-... → <repo>/.heimdall.env\n" +
      "       # (debe estar gitignoreado; `heimdall-review install` agrega el patrón)\n" +
      "  3. Variable de entorno NVIDIA_API_KEY:\n" +
      "       NVIDIA_API_KEY=nvapi-... heimdall-review …\n" +
      "       # o vía hygiene centralizada:  infisical run -- heimdall-review …\n" +
      "  4. Si nada de lo anterior, este error.",
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
 * Raíz del repo que contiene `startDir`: el ancestro más cercano con `.git`
 * (directorio o archivo, para soportar worktrees y submódulos). `undefined` si no
 * hay repo. El project scope se ancla acá y NO en la raíz del filesystem: un
 * `.heimdall.env` suelto arriba del repo no debe secuestrar la resolución.
 */
export function findRepoRoot(startDir: string): string | undefined {
  let dir = startDir
  for (;;) {
    if (existsSync(join(dir, ".git"))) return dir
    const parent = dirname(dir)
    if (parent === dir) return undefined
    dir = parent
  }
}

/**
 * Archivo de key-chain en project scope: `<repo-root>/.heimdall.env`.
 * Devuelve `undefined` si no hay repo o si el archivo no existe — en ambos casos
 * la resolución cae al user scope (`~/.agents/.heimdall.env`).
 */
export function findProjectEnvFile(startDir: string): string | undefined {
  const root = findRepoRoot(startDir)
  if (!root) return undefined
  const candidate = join(root, HEIMDALL_ENV_BASENAME)
  return existsSync(candidate) ? candidate : undefined
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
 * Archivo de usuario `~/.agents/.heimdall.env` (multiplataforma) como último
 * recurso antes del error. Un solo archivo para todos los providers del engine:
 * keys NVIDIA (`NVIDIA_API_KEY` y decoradas) + `OPENROUTER_API_KEY` para los
 * lanes `openrouter-*` (incl. el FREE ROUTER). Convención:
 *   Linux/macOS:  $HOME/.agents/.heimdall.env
 *   Windows:      %LOCALAPPDATA%/.agents/.heimdall.env
 *                 (fallback %USERPROFILE%/.agents/ si LOCALAPPDATA no existe)
 *
 * GUARDRAIL — el archivo debe ser solo-dueno antes de leerlo:
 *   POSIX:  (mode & 0o077) === 0, si no REHÚSA y aborta (chmod 600 para arreglar).
 *   Windows: Node no expone ACLs; se exige que el path viva bajo el perfil del
 *   usuario (LOCALAPPDATA o USERPROFILE), cuyo ACL es del usuario por el SO.
 *   Todo lo demás (rutas fuera del perfil) se rehúsa.
 *
 * `platform`, `homeDir`, `localAppData` y `userProfile` son inyectables para tests.
 */
export function agentsKeyFile(
  opts: {
    platform?: NodeJS.Platform
    homeDir?: string
    localAppData?: string | undefined
    userProfile?: string | undefined
  } = {},
): string | undefined {
  const platform = opts.platform ?? osPlatform()
  const filename = `.heimdall.env`
  if (platform === "win32") {
    const base =
      opts.localAppData ?? process.env.LOCALAPPDATA ?? opts.userProfile ?? process.env.USERPROFILE
    if (!base) return undefined
    return join(base, ".agents", filename)
  }
  const home = opts.homeDir ?? homedir()
  if (!home) return undefined
  return join(home, ".agents", filename)
}

/**
 * ¿El archivo es legible solo por su dueno? POSIX mira los bits; en Windows
 * exige ubicación bajo el perfil del usuario (LOCALAPPDATA/USERPROFILE).
 */
export function isOwnerOnly(
  filePath: string,
  opts: {
    platform?: NodeJS.Platform
    localAppData?: string | undefined
    userProfile?: string | undefined
  } = {},
): boolean {
  const platform = opts.platform ?? osPlatform()
  if (platform === "win32") {
    const bases = [opts.localAppData ?? process.env.LOCALAPPDATA, opts.userProfile ?? process.env.USERPROFILE].filter(
      (b): b is string => !!b,
    )
    const norm = filePath.toLowerCase()
    return bases.some((b) => norm.startsWith(b.toLowerCase() + "\\") || norm === b.toLowerCase())
  }
  try {
    const mode = statSync(filePath).mode & 0o777
    return (mode & 0o077) === 0
  } catch {
    return false
  }
}

/**
 * Resuelve la NIM key con la precedencia documentada:
 *   1. El archivo de usuario `~/.agents/` (ver `agentsKeyFile`), SIEMPRE que
 *      pase el guardrail solo-dueno (`isOwnerOnly`). Si existe pero está
 *      permisivo, REHÚSA y aborta con guía de chmod.
 *   2. El archivo `.heimdall.env` en la raíz del repo que contiene el cwd
 *      (project scope), SIEMPRE que `git check-ignore` confirme que está
 *      ignorado. Si existe pero NO está ignorado, REHÚSA y aborta (no filtramos
 *      la key por un archivo que podría terminar commiteado).
 *   3. `process.env.NVIDIA_API_KEY` (o `overrideEnv` inyectado en tests) si está.
 *   4. Si nada de lo anterior, `failMissingNvidiaKey`.
 *
 * Nunca imprime el valor. El `env` sale de `--env`, o `HEIMDALL_NVIDIA_ENV`,
 * o el default `staging`.
 *
 * Inyectables para tests: `overrideEnv` (mapa que reemplaza a `process.env`),
 * `cwd`, `checkIgnored`, más `platform`/`homeDir`/`localAppData`/`userProfile`
 * y `checkOwnerOnly` para la rama `~/.agents` sin tocar el filesystem real.
 */
export async function resolveNvidiaKey(opts: {
  env: KeyEnv
  cwd?: string
  overrideEnv?: Record<string, string | undefined>
  checkIgnored?: (filePath: string) => Promise<boolean>
  platform?: NodeJS.Platform
  homeDir?: string
  localAppData?: string | undefined
  userProfile?: string | undefined
  checkOwnerOnly?: (filePath: string) => boolean | Promise<boolean>
}): Promise<string> {
  const sourceEnv = opts.overrideEnv ?? process.env
  const cwd = opts.cwd ?? process.cwd()
  const checkIgnored = opts.checkIgnored ?? isGitIgnored

  // 1. Archivo de usuario ~/.agents/.heimdall.env (multiplataforma) con
  // guardrail solo-dueno. Selección con conciencia de env (STAGING y PROD
  // conviven en el archivo con nombres decorados).
  const agentsFile = agentsKeyFile(opts)
  if (agentsFile && existsSync(agentsFile)) {
    const check = opts.checkOwnerOnly ?? ((p: string) => isOwnerOnly(p, opts))
    if (!(await check(agentsFile))) {
      fail(
        `encontré ${agentsFile} pero NO es solo-dueno — me niego a leerlo. ` +
          `Linux/macOS: chmod 600 ese archivo. Windows: debe vivir bajo tu perfil ` +
          `(LOCALAPPDATA o USERPROFILE).`,
      )
    }
    const vars = parseEnvFile(readFileSync(agentsFile, "utf8"))
    const key = pickNvidiaKeyForEnv(vars, opts.env)
    if (key) return key
    fail(
      `${agentsFile} existe pero no contiene ${opts.env === "prod" ? "NVIDIA_API_KEY_PUBLIC_PROD ni " : "NVIDIA_API_KEY_INTERNAL_STAGING ni "}NVIDIA_API_KEY con valor.`,
    )
  }

  // 2. Archivo .heimdall.env en la raíz del repo (project scope).
  const filePath = findProjectEnvFile(cwd)
  if (filePath) {
    if (!(await checkIgnored(filePath))) {
      fail(
        `encontré ${filePath} pero NO está gitignoreado — me niego a leerlo para no ` +
          `filtrar la key. Agregá ".heimdall.env" al .gitignore (o corré ` +
          `\`heimdall-review install\`, que lo hace) y reintentá.`,
      )
    }
    const vars = parseEnvFile(readFileSync(filePath, "utf8"))
    const key = pickNvidiaKeyForEnv(vars, opts.env)
    if (key) return key
    fail(
      `${filePath} existe pero no contiene ${opts.env === "prod" ? "NVIDIA_API_KEY_PUBLIC_PROD ni " : "NVIDIA_API_KEY_INTERNAL_STAGING ni "}NVIDIA_API_KEY con valor.`,
    )
  }

  // 3. Variable de entorno.
  const fromEnv = (sourceEnv.NVIDIA_API_KEY ?? "").trim()
  if (fromEnv) return fromEnv

  // 4. Nada.
  failMissingNvidiaKey(opts.env)
}

/** Resuelve el entorno de la key-chain desde flags / env, con default staging. */
export function resolveKeyEnv(
  flags: Record<string, string | boolean>,
  sourceEnv: Record<string, string | undefined> = process.env,
): KeyEnv {
  const raw =
    (typeof flags.env === "string" ? flags.env : undefined) ??
    (sourceEnv.HEIMDALL_NVIDIA_ENV ?? "").trim() ??
    ""
  if (raw === "prod") return "prod"
  if (raw === "staging" || raw === "") return DEFAULT_KEY_ENV
  fail(`--env inválido: "${raw}" (válidos: staging | prod).`)
}

/**
 * Entorno para la key de OpenRouter. Precedencia: `--openrouter-env`, luego
 * `HEIMDALL_OPENROUTER_ENV`, y si ninguno está presente hereda el env de
 * NVIDIA (mismo `--env` / `HEIMDALL_NVIDIA_ENV`). Existe porque hay setups
 * donde OpenRouter y NIM viven en envs distintos (canónica única vs separada).
 */
export function resolveOpenRouterEnv(
  flags: Record<string, string | boolean>,
  fallbackEnv?: KeyEnv,
  sourceEnv: Record<string, string | undefined> = process.env,
): KeyEnv {
  const raw =
    (typeof flags["openrouter-env"] === "string" ? (flags["openrouter-env"] as string) : undefined) ??
    (sourceEnv.HEIMDALL_OPENROUTER_ENV ?? "").trim() ??
    ""
  if (raw === "prod") return "prod"
  if (raw === "staging") return "staging"
  if (raw !== "") fail(`--openrouter-env inválido: "${raw}" (válidos: staging | prod).`)
  return fallbackEnv ?? resolveKeyEnv(flags, sourceEnv)
}

/**
 * Hidrata `process.env.NVIDIA_API_KEY` y `process.env.OPENROUTER_API_KEY`
 * resolviendo la key-chain, si todavía no están pobladas. Centraliza el
 * side-effect para `cmdDiff`/`cmdPr`: el resto del pipeline (loop, providers)
 * sigue leyendo `process.env`.
 */
async function ensureProviderKeys(flags: Record<string, string | boolean>): Promise<void> {
  const env = resolveKeyEnv(flags)
  if (!(process.env.NVIDIA_API_KEY ?? "").trim()) {
    process.env.NVIDIA_API_KEY = await resolveNvidiaKey({ env })
  }
  if (!(process.env.OPENROUTER_API_KEY ?? "").trim()) {
    const orEnv = resolveOpenRouterEnv(flags, env)
    const agentsFile = agentsKeyFile()
    if (agentsFile && existsSync(agentsFile) && isOwnerOnly(agentsFile)) {
      const vars = parseEnvFile(readFileSync(agentsFile, "utf8"))
      const key = pickOpenRouterKey(vars, orEnv)
      if (key) process.env.OPENROUTER_API_KEY = key
    }
  }
}

const HELP = `heimdall-review — review local on-demand de Heimdall (lane nim-kimi).

USO:
  heimdall-review diff [--base <ref>] [--provider <id>]
      Revisa el git diff local de la rama actual (sin GitHub) e IMPRIME el review.
      base default = merge-base con origin/HEAD (fallback main/master). Solo NVIDIA_API_KEY.

  heimdall-review pr <n> [--owner <o>] [--repo <r>] [--post] [--github-app] [--provider <id>]
      Revisa el PR #n. owner/repo se autodetectan del remote origin si se omiten.
      IMPRIME por default; --post postea de verdad (requiere GITHUB_TOKEN, o
      --github-app para postear como la GitHub App).

  heimdall-review install [--force] [--with-hook]
      Scaffolds los 3 wrappers (slash Claude Code, Makefile target, git alias +
      pre-push hook) en el repo actual. Idempotente; --force sobreescribe.
      El pre-push hook es opt-in: solo se instala con --with-hook.
      También agrega ".heimdall.env" al .gitignore.

  heimdall-review key:pull [--env staging|prod]
      Materializa .heimdall.env en la raíz del repo (gitignoreado, 0600) desde
      Infisical, con solo la(s) variable(s) NVIDIA. Nunca imprime el valor.
      Default env: staging.

  heimdall-review key:init [--env staging|prod] [--force]
      Crea o actualiza ~/.agents/.heimdall.env pidiendo las keys por diálogo
      GUI (NVIDIA requerida, OpenRouter opcional). Hace merge por env
      (STAGING/PROD conviven con nombres decorados). Nunca imprime valores.

  heimdall-review key:migrate [--env staging|prod]
      Reubica la(s) key(s) de <repo>/.heimdall.env (gitignoreado) hacia
      ~/.agents/.heimdall.env con merge por env. NO borra el original:
      imprime el rm exacto para cuando verifiques que todo resuelve.

  heimdall-review models:free [--env staging|prod] [--match <sub>] [--json] [--detail <org/model>]
      Dogfooding de la key migrada: lista el catálogo NIM (valida la key),
      cruza FREE/PREVIEW desde el NGC catalog (tags, best-effort) y con
      --detail trae la metadata NIM de un modelo puntual. Nunca imprime la key.

RESOLUCIÓN DE LA NIM KEY (precedencia):
  1. NVIDIA_API_KEY del entorno (env var / infisical run).
  2. Archivo .heimdall.env en la raíz del repo que contiene el cwd (project
     scope). Si existe pero NO está gitignoreado, el CLI REHÚSA y aborta
     (no filtra la key).
  3. Archivo de usuario ~/.agents/.heimdall.env (user scope; solo-dueno: 0600
     en POSIX, bajo el perfil en Windows) — Linux/macOS $HOME, Windows
     %LOCALAPPDATA% (fallback %USERPROFILE%). STAGING y PROD conviven en el
     mismo archivo con nombres decorados (ver key:init); la key OpenRouter
     sale del mismo archivo (env propio vía --openrouter-env /
     HEIMDALL_OPENROUTER_ENV, o hereda el de NVIDIA).
  4. Si nada, error (sugiere key:init).

  El nombre del archivo es SIEMPRE .heimdall.env. --env no cambia el nombre:
  elige qué variable se lee de adentro (NVIDIA_API_KEY_INTERNAL_STAGING /
  NVIDIA_API_KEY_PUBLIC_PROD, con el canónico como fallback).

FLAGS COMUNES:
  --provider <id>   Lane del reviewer (default: ${DEFAULT_PROVIDER}).
  --env <e>         Entorno de la key-chain: staging | prod (default: staging).
  --openrouter-env <e>  Entorno solo para la key de OpenRouter (default: hereda --env).
  --github-app       Con --post: postea como la GitHub App (NO GITHUB_TOKEN).
                    Lee HEIMDALL_GITHUB_APP_ID + HEIMDALL_GITHUB_APP_KEY
                    (ruta al .pem) de la key-chain (user → repo → env);
                    HEIMDALL_GITHUB_APP_INSTALLATION_ID es opcional (autodetecta).
  --help, -h        Muestra esta ayuda.

EJEMPLOS:
  infisical run -- heimdall-review diff
  infisical run -- heimdall-review diff --base develop
  infisical run -- heimdall-review pr 42
  infisical run -- heimdall-review pr 42 --post
  heimdall-review pr 42 --post --github-app
  heimdall-review key:migrate --env staging
  heimdall-review models:free --match kimi
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
      if (key === "post" || key === "force" || key === "with-hook" || key === "github-app") {
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
/**
 * Warn no-bloqueante de higiene del catálogo NIM: consulta build.nvidia.com
 * (nim_type_preview) y avisa si (a) pasaron >30 días desde el ancla congelado
 * (`NIM_CATALOG_ANCHOR_DATE`), o (b) algún lane de la cadena adversarial ya no
 * está en el catálogo free. Nunca lanza — solo imprime `[warn]` y continúa.
 */
async function warnIfNimCatalogNeedsRefresh(): Promise<void> {
  try {
    if (isCatalogStale()) {
      console.warn(
        `[warn] NIM catalog anchor (${NIM_CATALOG_ANCHOR_DATE}) tiene >30 días — ` +
          `los endpoints free de build.nvidia.com rotan; reconsiderá re-priorizar ` +
          `la cadena adversarial (DEFAULT_ADVERSARIAL_CHAIN).`,
      )
    }
    const { slugs, error } = await fetchNimPreviewCatalog()
    if (error) {
      console.warn(`[warn] no pude consultar el catálogo NIM free (${error}) — omito la verificación de lanes.`)
      return
    }
    const missing = missingCatalogLanes(slugs)
    if (missing.length > 0) {
      console.warn(
        `[warn] lanes NIM de la cadena adversarial no están en el catálogo free: ` +
          missing.map((m) => `${m.lane} (${m.slug})`).join(", ") +
          ` — verificá build.nvidia.com y actualizá DEFAULT_ADVERSARIAL_CHAIN.`,
      )
    }
  } catch {
    // nunca bloquear el review por un problema de verificación
  }
}

async function cmdDiff(flags: Record<string, string | boolean>): Promise<void> {
  await ensureProviderKeys(flags)
  await warnIfNimCatalogNeedsRefresh()
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

  await ensureProviderKeys(flags)
  await warnIfNimCatalogNeedsRefresh()
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
    const useApp = flags["github-app"] === true
    let token: string
    if (useApp) {
      const { token: appToken } = await getGithubAppToken(owner, repo)
      token = appToken
      console.log(
        `[heimdall-review pr] POSTEANDO review real a ${owner}/${repo}#${pullNumber} ` +
          `lane=${process.env.REVIEWER_PROVIDER} (event=COMMENT) como GitHub App`,
      )
    } else {
      token = (process.env.GITHUB_TOKEN ?? "").trim()
      if (!token) fail("--post requiere GITHUB_TOKEN (permiso pull-requests:write) o --github-app.")
      console.log(
        `[heimdall-review pr] POSTEANDO review real a ${owner}/${repo}#${pullNumber} ` +
          `lane=${process.env.REVIEWER_PROVIDER} (event=COMMENT)`,
      )
    }
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
 * Pide la NIM key por diálogo GUI nativo (mismo orden que /secret-input):
 * Linux zenity → kdialog; macOS osascript; Windows Get-Credential
 * (también vía powershell.exe bajo Git Bash/WSL). Devuelve el valor o
 * `undefined` si no hay prompter disponible. Nunca imprime el valor.
 *
 * `run` es inyectable para tests: `(cmd: string[]) => { code: number; out: string }`.
 */
export type PromptRunner = (cmd: string[]) => { code: number; out: string }

function defaultPromptRunner(cmd: string[]): { code: number; out: string } {
  try {
    const proc = Bun.spawnSync(cmd, { stdout: "pipe", stderr: "ignore" })
    return {
      code: proc.exitCode ?? 1,
      out: (proc.stdout ?? "").toString().replace(/\r?\n$/, ""),
    }
  } catch {
    return { code: 1, out: "" }
  }
}

function commandExists(cmd: string, run: PromptRunner = defaultPromptRunner): boolean {
  const probe =
    process.platform === "win32"
      ? ["where", cmd]
      : ["sh", "-c", `command -v ${cmd}`]
  const r = run(probe)
  return r.code === 0 && r.out.trim().length > 0
}

export function requestNimKey(opts: {
  platform?: NodeJS.Platform
  run?: PromptRunner
  title?: string
} = {}): string | undefined {
  const platform = opts.platform ?? process.platform
  const run = opts.run ?? defaultPromptRunner
  const title = opts.title ?? "Heimdall NVIDIA NIM key (nvapi-…)"

  if (platform === "darwin") {
    const r = run([
      "osascript",
      "-e",
      `display dialog "${title}:" default answer "" with hidden answer`,
      "-e",
      "text returned of result",
    ])
    return r.code === 0 && r.out ? r.out : undefined
  }

  if (platform === "linux") {
    if (commandExists("zenity", run)) {
      const r = run(["zenity", "--password", `--title=${title}`])
      return r.code === 0 && r.out ? r.out : undefined
    }
    if (commandExists("kdialog", run)) {
      const r = run(["kdialog", "--password", title])
      return r.code === 0 && r.out ? r.out : undefined
    }
  }

  // Windows nativo + Git Bash/WSL (powershell.exe en el PATH).
  const powershell = platform === "win32" ? "powershell" : "powershell.exe"
  if (platform === "win32" || commandExists("powershell.exe", run)) {
    const r = run([
      powershell,
      "-NoProfile",
      "-Command",
      `$c = Get-Credential -UserName 'heimdall-nim' -Message '${title}'; if ($c) { $c.GetNetworkCredential().Password }`,
    ])
    return r.code === 0 && r.out ? r.out : undefined
  }

  return undefined
}

/** Opciones de plataforma/hogar compartidas por `key:init` / `key:migrate`. */
export interface AgentsFileOpts {
  platform?: NodeJS.Platform
  homeDir?: string
  localAppData?: string | undefined
  userProfile?: string | undefined
}

/** Nombre decorado NVIDIA para el env en `~/.agents/.heimdall.env`. */
export function nvidiaDecoratedName(env: KeyEnv): string {
  return env === "prod" ? "NVIDIA_API_KEY_PUBLIC_PROD" : "NVIDIA_API_KEY_INTERNAL_STAGING"
}

/** Nombre decorado OpenRouter para el env en `~/.agents/.heimdall.env`. */
export function openRouterDecoratedName(env: KeyEnv): string {
  return env === "prod" ? "OPENROUTER_API_KEY_PROD" : "OPENROUTER_API_KEY_STAGING"
}

const AGENTS_FILE_HEADER =
  `# Heimdall provider keys (usuario) — generado por \`heimdall-review key:init\`\n` +
  `# NO commitear. Espejo del ejemplo de vertivolatam (solo forma, sin valores).\n` +
  `# Base URLs default del engine (hardcodeadas):\n` +
  `# NIM https://integrate.api.nvidia.com/v1 · OpenRouter https://openrouter.ai/api/v1\n`

/**
 * Fusiona `wanted` (nombre → valor) sobre el contenido previo del archivo de
 * usuario. Pura (sin filesystem): preserva las líneas del otro env, comentarios
 * y líneas ajenas; solo reemplaza o agrega las keys pedidas. Antepone el header
 * canónico si el contenido previo no lo trae. Nunca imprime valores — recibe el
 * mapa ya resuelto y devuelve el cuerpo a escribir.
 */
export function mergeAgentKeys(
  prevContent: string | undefined,
  wanted: Map<string, string>,
): string {
  const prevLines: string[] = prevContent ? prevContent.split("\n") : []
  const seen = new Set<string>()
  const merged = prevLines
    .map((line) => {
      const eq = line.indexOf("=")
      const key = eq > 0 && !line.trim().startsWith("#") ? line.slice(0, eq).trim() : ""
      if (key && wanted.has(key)) {
        seen.add(key)
        return `${key}=${wanted.get(key)}`
      }
      return line
    })
    .filter((line, i, arr) => line.trim() !== "" || (i > 0 && arr[i - 1].trim() !== ""))
  for (const [key, val] of wanted) {
    if (!seen.has(key)) {
      if (merged.length > 0 && merged[merged.length - 1].trim() !== "") merged.push("")
      merged.push(`${key}=${val}`)
    }
  }
  const joined = merged.join("\n")
  const body = joined.includes("# Heimdall provider keys")
    ? joined
    : AGENTS_FILE_HEADER + joined.replace(/^\n+/, "")
  return body.endsWith("\n") ? body : body + "\n"
}

/**
 * Escribe el cuerpo ya fusionado al archivo de usuario con modo 0600 y
 * verifica el guardrail solo-dueno post-escritura (en Windows vale el ACL del
 * perfil). Si el guardrail falla, borra lo escrito y aborta. Nunca imprime
 * valores: `body` solo transita hacia el filesystem.
 */
async function writeAgentsKeyFile(
  dest: string,
  body: string,
  opts: AgentsFileOpts = {},
): Promise<void> {
  const { mkdirSync, writeFileSync, chmodSync, rmSync } = await import("node:fs")
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, body, { mode: 0o600 })
  if ((opts.platform ?? process.platform) !== "win32") {
    try {
      chmodSync(dest, 0o600)
    } catch {
      // umask ya aplicada en la escritura; seguir.
    }
  }
  if (!isOwnerOnly(dest, opts)) {
    rmSync(dest, { force: true })
    fail(`${dest} no quedó solo-dueno — lo borré. Revisá tu umask y reintentá.`)
  }
}

/**
 * Subcomando `key:init [--env staging|prod] [--force]` — crea o actualiza
 * `~/.agents/.heimdall.env` pidiendo las keys por diálogo GUI.
 *
 * - Pide la key NVIDIA (requerida) y la de OpenRouter (opcional, Enter para
 *   omitir) con el prompter nativo (zenity → kdialog / osascript /
 *   Get-Credential). Nunca pide por stdin (quedaría en el historial).
 * - Hace MERGE, no overwrite: si el archivo ya tiene keys del otro env (u
 *   otras líneas), las preserva y solo fija las de ESTE env:
 *   staging → `NVIDIA_API_KEY_INTERNAL_STAGING` (+ `OPENROUTER_API_KEY_STAGING`);
 *   prod → `NVIDIA_API_KEY_PUBLIC_PROD` (+ `OPENROUTER_API_KEY_PROD`).
 *   Espejo del ejemplo de vertivolatam (solo forma, sin valores).
 * - Si ya hay key resoluble (env, repo o agents) y no viene `--force`,
 *   informa DÓNDE está (sin valores) y sale 0 sin tocar nada.
 * - Si no hay prompter disponible (CI, SSH sin X), aborta con instrucciones
 *   manuales exactas.
 * - Escribe con modo 0600 (POSIX) y verifica solo-dueno post-escritura
 *   (en Windows vale el ACL del perfil). Nunca imprime valores.
 */
export async function cmdKeyInit(
  flags: Record<string, string | boolean>,
  opts: {
    platform?: NodeJS.Platform
    homeDir?: string
    localAppData?: string | undefined
    userProfile?: string | undefined
    run?: PromptRunner
  } = {},
): Promise<void> {
  const env = resolveKeyEnv(flags)
  const force = flags.force === true
  const { existsSync: exists, readFileSync } = await import("node:fs")

  if (!force) {
    const fromEnv = (process.env.NVIDIA_API_KEY ?? "").trim()
    if (fromEnv) {
      console.log("[heimdall-review key:init] ya hay NVIDIA_API_KEY en el entorno — nada que crear (usá --force para re-pedirla).")
      return
    }
    const repoFile = findProjectEnvFile(process.cwd())
    if (repoFile) {
      console.log(`[heimdall-review key:init] ya existe ${repoFile} — nada que crear (usá --force para re-pedirla).`)
      return
    }
    const already = agentsKeyFile(opts)
    if (already && exists(already)) {
      console.log(`[heimdall-review key:init] ya existe ${already} — nada que crear (usá --force para agregar/rotar keys de otro env).`)
      return
    }
  }

  const dest = agentsKeyFile(opts)
  if (!dest) {
    fail("no pude determinar el home del usuario para ~/.agents/.heimdall.env — creá el archivo a mano (ver instrucciones abajo).")
  }
  const nimValue = requestNimKey({ ...opts, title: `Heimdall NVIDIA NIM key [${env}] (nvapi-…)` })
  if (!nimValue) {
    fail(
      "no hay diálogo GUI disponible (sin zenity/kdialog/osascript/powershell). " +
        `Creá el archivo a mano:\n  mkdir -p ${dirname(dest as string)} && printf 'NVIDIA_API_KEY_INTERNAL_STAGING=nvapi-...\\n' > ${dest as string} && chmod 600 ${dest as string}`,
    )
  }
  const orValue = requestNimKey({ ...opts, title: `Heimdall OpenRouter key [${env}] (opcional, Enter para omitir)` })

  const nimName = nvidiaDecoratedName(env)
  const orName = openRouterDecoratedName(env)
  const wanted = new Map<string, string>([[nimName, nimValue as string]])
  if (orValue) wanted.set(orName, orValue)

  // Merge: preserva líneas existentes (otro env, comentarios, base URLs).
  const prev = exists(dest as string) ? readFileSync(dest as string, "utf8") : undefined
  await writeAgentsKeyFile(dest as string, mergeAgentKeys(prev, wanted), opts)
  console.log(
    `[heimdall-review key:init] listo — ${[...wanted.keys()].join(", ")} guardada(s) en ${dest} (solo-dueno verificado). Valor NO impreso.`,
  )
}
/**
 * Subcomando `key:migrate [--env staging|prod]` — reubica la(s) key(s) del
 * archivo del repo `<repo-root>/.heimdall.env` hacia `~/.agents/.heimdall.env`,
 * con merge por env y nombres decorados.
 *
 * - Aplica el MISMO guardrail de lectura que `resolveNvidiaKey`: si el archivo
 *   existe pero NO está gitignoreado, REHÚSA y aborta (no filtra la key).
 * - La key del archivo (`NVIDIA_API_KEY` o la decorada del env) se guarda como
 *   decorada del env (`_INTERNAL_STAGING` / `_PUBLIC_PROD`); si el archivo ya
 *   trae decoradas se respetan igual (ver `pickNvidiaKeyForEnv` +
 *   `nvidiaDecoratedName`).
 * - Hace MERGE en destino (ver `mergeAgentKeys`): el otro env convive.
 * - NO borra el original: imprime el `rm` exacto para que el usuario lo ejecute
 *   cuando verifique que todo resuelve desde el nuevo archivo.
 * - Nunca imprime valores.
 */
export async function cmdKeyMigrate(
  flags: Record<string, string | boolean>,
  opts: AgentsFileOpts & {
    cwd?: string
    checkIgnored?: (filePath: string) => Promise<boolean>
  } = {},
): Promise<void> {
  const env = resolveKeyEnv(flags)
  const cwd = opts.cwd ?? process.cwd()
  const checkIgnored = opts.checkIgnored ?? isGitIgnored
  const { readFileSync, existsSync: exists } = await import("node:fs")

  const src = findProjectEnvFile(cwd)
  if (!src) {
    fail(
      `no encontré ${HEIMDALL_ENV_BASENAME} en la raíz del repo de ${cwd} — nada que migrar. ` +
        `Si la key ya vive en ~/.agents/.heimdall.env, no hay nada que hacer.`,
    )
  }
  if (!(await checkIgnored(src))) {
    fail(
      `encontré ${src} pero NO está gitignoreado — me niego a leerlo para no ` +
        `filtrar la key. Agregá ".heimdall.env" al .gitignore (o corré ` +
        `\`heimdall-review install\`, que lo hace) y reintentá.`,
    )
  }
  const vars = parseEnvFile(readFileSync(src as string, "utf8"))
  const nimKey = pickNvidiaKeyForEnv(vars, env)
  const orKey = pickOpenRouterKey(vars, env)
  if (!nimKey && !orKey) {
    fail(
      `${src} existe pero no contiene ninguna de ${NVIDIA_KEY_NAMES.join(", ")} con valor. Nada que migrar.`,
    )
  }
  const dest = agentsKeyFile(opts)
  if (!dest) {
    fail(
      "no pude determinar el home del usuario para ~/.agents/.heimdall.env — " +
        "migrá a mano copiando la línea NVIDIA_API_KEY_* que corresponda.",
    )
  }
  const wanted = new Map<string, string>()
  if (nimKey) wanted.set(nvidiaDecoratedName(env), nimKey)
  if (orKey) wanted.set(openRouterDecoratedName(env), orKey)
  const prev = exists(dest as string) ? readFileSync(dest as string, "utf8") : undefined
  await writeAgentsKeyFile(dest as string, mergeAgentKeys(prev, wanted), opts)
  console.log(
    `[heimdall-review key:migrate] listo — ${[...wanted.keys()].join(", ")} migrada(s) de ${src} a ${dest} (solo-dueno verificado). Valor NO impreso.`,
  )
  console.log(
    `[heimdall-review key:migrate] el original SIGUE en su lugar (no lo borro solo). ` +
      `Cuando verifiques que todo resuelve, completalo con: rm "${src}"`,
  )
}
/**
 * Subcomando `key:pull [--env staging|prod]` — materializa `.heimdall.env`
 * (gitignoreado) desde Infisical, sin imprimir el valor.
 *
 * Corre `infisical export --projectId=… --env=<env> --format dotenv`, filtra solo
 * la(s) variable(s) NVIDIA reconocidas y escribe SOLO esas a `.heimdall.env`
 * en el cwd (project scope). GUARDRAIL post-escritura: verifica que el archivo
 * quede gitignoreado; si no, lo borra y aborta (no dejamos un archivo con
 * secreto sin ignorar).
 */
async function cmdKeyPull(flags: Record<string, string | boolean>): Promise<void> {
  const env = resolveKeyEnv(flags)
  const projectId = "c6dbbe50-0e7c-465d-98ca-4020bc4cbfcb"
  const dest = join(process.cwd(), HEIMDALL_ENV_BASENAME)

  console.log(
    `[heimdall-review key:pull] exportando vars NVIDIA de Infisical (env=${env}) → ${HEIMDALL_ENV_BASENAME}`,
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
        `Agregá ".heimdall.env" al .gitignore (\`heimdall-review install\` lo hace) y reintentá.`,
    )
  }

  console.log(
    `[heimdall-review key:pull] listo — escribí ${lines.length} var(s) NVIDIA a ` +
      `${HEIMDALL_ENV_BASENAME} (0600, gitignoreado). Valor NO impreso.`,
  )
}

export const NIM_MODELS_URL = "https://integrate.api.nvidia.com/v1/models"
export const NGC_RESOURCES_URL = "https://api.ngc.nvidia.com/v2/resources"
export const NGC_NIM_METADATA_URL = "https://api.ngc.nvidia.com/v2/nim/metadata"

type FetchFn = (url: string, init?: RequestInit) => Promise<Response>

async function fetchJson(fetchFn: FetchFn, url: string, key: string, timeoutMs = 20000): Promise<unknown> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetchFn(url, {
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
      signal: ctrl.signal,
    })
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status} en ${url}`) as Error & { status?: number }
      err.status = res.status
      throw err
    }
    return (await res.json()) as unknown
  } finally {
    clearTimeout(timer)
  }
}

/** Extrae los ids del formato OpenAI (`{data:[{id}]}`) del catálogo NIM. */
export function parseNimModelIds(payload: unknown): string[] {
  const data = (payload as { data?: unknown } | null)?.data
  if (!Array.isArray(data)) return []
  const ids: string[] = []
  for (const m of data) {
    const id = (m as { id?: unknown } | null)?.id
    if (typeof id === "string" && id) ids.push(id)
  }
  return ids
}

export interface NgcModelSignal {
  id: string
  free: boolean | undefined
  preview: boolean | undefined
}

function ngcTagsOf(item: Record<string, unknown>): string[] {
  const out: string[] = []
  const push = (v: unknown) => {
    if (typeof v === "string" && v) out.push(v.toLowerCase())
  }
  for (const k of ["tags", "labels", "badges", "attributes", "nimType", "nim_type"]) {
    const val = item[k]
    if (Array.isArray(val)) val.forEach(push)
    else if (val !== undefined) push(val)
  }
  return out
}

function ngcIdsOf(item: Record<string, unknown>): string[] {
  const out: string[] = []
  for (const k of ["resourceId", "id", "name", "modelName", "slug"]) {
    const v = item[k]
    if (typeof v === "string" && v) out.push(v)
  }
  return [...new Set(out)]
}

/**
 * Extrae señales free/preview de un payload del NGC catalog. Defensivo a
 * propósito: el schema NGC no está versionado para nosotros, así que acepta el
 * array en la raíz o bajo `resources`/`data`/`models`/`items`/`results`, ids
 * bajo varios nombres y tags bajo varios nombres. Solo emite filas con al
 * menos una señal (free o preview); el resto es "?" en la tabla.
 */
export function extractNgcFreeSignals(payload: unknown): NgcModelSignal[] {
  const root = payload as Record<string, unknown> | unknown[] | null
  const items: unknown[] = Array.isArray(root)
    ? root
    : (["resources", "data", "models", "items", "results"]
        .map((k) => (root as Record<string, unknown> | null)?.[k])
        .find((v): v is unknown[] => Array.isArray(v)) ?? [])
  const out: NgcModelSignal[] = []
  for (const raw of items) {
    if (!raw || typeof raw !== "object") continue
    const item = raw as Record<string, unknown>
    const ids = ngcIdsOf(item)
    if (ids.length === 0) continue
    const tags = ngcTagsOf(item)
    const free = tags.some((t) => t.includes("free")) ? true : undefined
    const preview = tags.some((t) => t.includes("preview")) ? true : undefined
    if (free === undefined && preview === undefined) continue
    for (const id of ids) out.push({ id, free, preview })
  }
  return out
}

/**
 * Subcomando `models:free [--env e] [--match sub] [--json] [--detail org/model]`
 * — dogfooding de la key migrada contra las APIs reales:
 *
 * 1. Resuelve la NIM key por la key-chain (si la migración sirvió, esto pasa).
 * 2. `GET integrate.api.nvidia.com/v1/models` (formato OpenAI, SIN flag
 *    free/preview) — valida la key end-to-end y da el listado autoritativo.
 * 3. `GET api.ngc.nvidia.com/v2/resources?resourceType=model` (metadata rica
 *    con tags) — best-effort: de sus tags sale la columna FREE/PREVIEW. Si NGC
 *    falla (endpoint deprecado/rotado, 4xx/5xx), avisa y sigue con "?" — el
 *    listado NIM sigue probando que la key funciona.
 * 4. Con `--detail <resourceId>`, `GET .../v2/nim/metadata?resourceId=<id>`
 *    para un modelo puntual (evita martillar 100+ requests por default).
 *
 * Nunca imprime la key (solo viaja en el header Authorization).
 */
export async function cmdModelsFree(
  flags: Record<string, string | boolean>,
  opts: {
    fetchFn?: FetchFn
    resolveKey?: (env: KeyEnv) => Promise<string>
  } = {},
): Promise<void> {
  const env = resolveKeyEnv(flags)
  const fetchFn = opts.fetchFn ?? fetch
  const key = opts.resolveKey ? await opts.resolveKey(env) : await resolveNvidiaKey({ env })

  let ids: string[]
  try {
    ids = parseNimModelIds(await fetchJson(fetchFn, NIM_MODELS_URL, key))
  } catch (err) {
    fail(
      `no pude listar ${NIM_MODELS_URL}: ${err instanceof Error ? err.message : String(err)}. ` +
        `¿La key resuelta para env=${env} sigue válida? (el valor NUNCA se imprime)`,
    )
  }

  const signals = new Map<string, { free?: boolean; preview?: boolean }>()
  const absorb = (list: NgcModelSignal[]) => {
    for (const s of list) {
      const cur = signals.get(s.id) ?? {}
      if (s.free !== undefined) cur.free = cur.free ?? s.free
      if (s.preview !== undefined) cur.preview = cur.preview ?? s.preview
      signals.set(s.id, cur)
    }
  }
  let ngcWarning: string | undefined
  try {
    absorb(extractNgcFreeSignals(await fetchJson(fetchFn, `${NGC_RESOURCES_URL}?resourceType=model`, key)))
  } catch (err) {
    ngcWarning =
      `NGC catalog no disponible (${err instanceof Error ? err.message : String(err)}) — ` +
      `FREE/PREVIEW queda en "?". El listado NIM sí es autoritativo para "la key funciona".`
  }

  const detail = typeof flags.detail === "string" ? flags.detail : undefined
  if (detail) {
    try {
      const meta = await fetchJson(
        fetchFn,
        `${NGC_NIM_METADATA_URL}?resourceId=${encodeURIComponent(detail)}`,
        key,
      )
      const found = extractNgcFreeSignals(meta)
      const mine = found.filter((s) => s.id === detail || detail.endsWith(`/${s.id}`) || s.id.endsWith(`/${detail}`))
      console.log(`[heimdall-review models:free] metadata NIM para ${detail}:`)
      console.log(JSON.stringify(mine.length > 0 ? mine : found, null, 2))
    } catch (err) {
      console.log(
        `[heimdall-review models:free] metadata NIM para ${detail} no disponible: ` +
          `${err instanceof Error ? err.message : String(err)}`,
      )
    }
  }

  const match = typeof flags.match === "string" ? flags.match.toLowerCase() : undefined
  const lookup = (id: string) => {
    const exact = signals.get(id)
    if (exact) return { sig: exact, source: "ngc-tags" as const }
    const short = id.includes("/") ? id.slice(id.lastIndexOf("/") + 1) : id
    for (const [k, v] of signals) {
      if (k === short || k.endsWith(`/${short}`)) return { sig: v, source: "ngc-tags" as const }
    }
    return { sig: {}, source: "nim-only" as const }
  }
  const rows = (ids as string[])
    .filter((id) => !match || id.toLowerCase().includes(match))
    .map((id) => {
      const { sig, source } = lookup(id)
      return { id, free: sig.free, preview: sig.preview, source }
    })

  if (flags.json === true) {
    console.log(JSON.stringify(rows, null, 2))
    return
  }

  console.log(`[heimdall-review models:free] key OK (env=${env}) — ${(ids as string[]).length} modelos en NIM.`)
  if (ngcWarning) console.log(`[heimdall-review models:free] AVISO: ${ngcWarning}`)
  const yn = (v: boolean | undefined) => (v === true ? "sí" : "?")
  const width = Math.max(5, ...rows.map((r) => r.id.length))
  console.log(`${"MODEL".padEnd(width)}  FREE  PREVIEW  FUENTE`)
  for (const r of rows) {
    console.log(`${r.id.padEnd(width)}  ${yn(r.free).padEnd(4)}  ${yn(r.preview).padEnd(7)}  ${r.source}`)
  }
  const nFree = rows.filter((r) => r.free === true).length
  const nPrev = rows.filter((r) => r.preview === true).length
  console.log(`free: ${nFree}  preview: ${nPrev}  sin señal: ${rows.length - nFree - nPrev}`)
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
    case "key:init":
      return cmdKeyInit(flags)
    case "key:migrate":
      return cmdKeyMigrate(flags)
    case "models:free":
      return cmdModelsFree(flags)
    default:
      fail(`subcomando desconocido: "${subcommand}". Probá: diff | pr | install | key:pull | key:init | key:migrate | models:free (o --help).`)
  }
}

// Entry directo (no cuando se importa desde un test).
if (import.meta.main) {
  main(Bun.argv.slice(2)).catch((err) => {
    console.error("[heimdall-review] falló:", err instanceof Error ? err.message : err)
    process.exit(1)
  })
}
