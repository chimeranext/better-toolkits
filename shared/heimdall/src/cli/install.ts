/**
 * install.ts — implementación de `heimdall-review install`.
 *
 * Materializa en el repo ACTUAL (cwd) los tres wrappers de invocación del review
 * local, copiándolos desde `templates/` dentro del package. Idempotente: si un
 * destino ya existe, lo salta salvo `--force`. El pre-push hook es opt-in
 * (`--with-hook`): solo se instala si se pide explícitamente.
 *
 * Los tres wrappers:
 *   1. Slash de Claude Code  → .claude/commands/local-pr-review.md
 *   1b. Command de OpenCode  → .opencode/commands/local-pr-review.md
 *   2. Makefile target       → append idempotente del target `heimdall-review:`
 *   3. git alias + pre-push  → `git config alias.heimdall-review …` (+ hook opt-in)
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const templatesDir = join(here, "..", "..", "templates")

export interface InstallOptions {
  force: boolean
  withHook: boolean
  /** Directorio destino (default: cwd). Inyectable para tests. */
  cwd?: string
}

function readTemplate(name: string): string {
  return readFileSync(join(templatesDir, name), "utf8")
}

/** Escribe `dest` con `content`; respeta idempotencia salvo `force`. */
function writeIfAbsent(dest: string, content: string, force: boolean): "written" | "skipped" {
  if (existsSync(dest) && !force) return "skipped"
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, content)
  return "written"
}

/** Marcador que delimita el bloque gestionado por Heimdall en el Makefile. */
const MAKE_BEGIN = "# >>> heimdall-review (gestionado por heimdall) >>>"
const MAKE_END = "# <<< heimdall-review <<<"

/**
 * Append idempotente del target al Makefile. Si ya existe el bloque marcado, no
 * lo duplica (salvo force, que lo reemplaza). Si no hay Makefile, lo crea.
 */
function installMakefileTarget(cwd: string, force: boolean): "written" | "skipped" | "replaced" {
  const makefilePath = join(cwd, "Makefile")
  const snippet = readTemplate("makefile-target.mk")
  const block = `${MAKE_BEGIN}\n${snippet.trimEnd()}\n${MAKE_END}\n`

  if (!existsSync(makefilePath)) {
    writeFileSync(makefilePath, block)
    return "written"
  }

  const current = readFileSync(makefilePath, "utf8")
  const hasBlock = current.includes(MAKE_BEGIN)
  if (hasBlock && !force) return "skipped"

  if (hasBlock && force) {
    const re = new RegExp(`${escapeRe(MAKE_BEGIN)}[\\s\\S]*?${escapeRe(MAKE_END)}\\n?`, "m")
    writeFileSync(makefilePath, current.replace(re, block))
    return "replaced"
  }

  const sep = current.endsWith("\n") ? "\n" : "\n\n"
  writeFileSync(makefilePath, current + sep + block)
  return "written"
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Instala el pre-push hook (opt-in). No pisa un hook existente salvo force.
 * Marca el archivo ejecutable.
 */
/** Patrón gitignore que protege los archivos de la key-chain (`.{env}.nvidia.env`). */
const NVIDIA_ENV_IGNORE = "*.nvidia.env"

/**
 * Asegura que `*.nvidia.env` esté en el `.gitignore` del repo (lo crea si no
 * existe). Idempotente: no duplica el patrón si ya está. Es el guardrail que
 * deja seguros los archivos que `key:pull` materializa.
 */
function ensureNvidiaEnvIgnored(cwd: string): "added" | "present" | "created" {
  const gitignorePath = join(cwd, ".gitignore")
  if (!existsSync(gitignorePath)) {
    writeFileSync(gitignorePath, `${NVIDIA_ENV_IGNORE}\n`)
    return "created"
  }
  const current = readFileSync(gitignorePath, "utf8")
  const already = current
    .split("\n")
    .map((l) => l.trim())
    .includes(NVIDIA_ENV_IGNORE)
  if (already) return "present"
  const sep = current.endsWith("\n") || current === "" ? "" : "\n"
  writeFileSync(gitignorePath, `${current}${sep}${NVIDIA_ENV_IGNORE}\n`)
  return "added"
}

function installPrePushHook(cwd: string, force: boolean): "written" | "skipped" | "no-git" {
  const gitDir = join(cwd, ".git")
  if (!existsSync(gitDir)) return "no-git"
  const hookPath = join(gitDir, "hooks", "pre-push")
  const content = readTemplate("pre-push.sh")
  if (existsSync(hookPath) && !force) return "skipped"
  mkdirSync(dirname(hookPath), { recursive: true })
  writeFileSync(hookPath, content)
  chmodSync(hookPath, 0o755)
  return "written"
}

export async function runInstall(options: InstallOptions): Promise<void> {
  const cwd = options.cwd ?? process.cwd()
  const { force, withHook } = options

  console.log(`[heimdall-review install] destino: ${cwd}${force ? " (--force)" : ""}`)

  // 1. Slash de Claude Code.
  const slashDest = join(cwd, ".claude", "commands", "local-pr-review.md")
  const slashResult = writeIfAbsent(slashDest, readTemplate("local-pr-review.md"), force)
  console.log(`  [${slashResult}] .claude/commands/local-pr-review.md`)

  // 1b. Command de OpenCode (project command: se auto-carga desde
  // .opencode/commands/ como `/local-pr-review`).
  const openCodeDest = join(cwd, ".opencode", "commands", "local-pr-review.md")
  const openCodeResult = writeIfAbsent(
    openCodeDest,
    readTemplate("opencode-local-pr-review.md"),
    force,
  )
  console.log(`  [${openCodeResult}] .opencode/commands/local-pr-review.md`)

  // 2. Makefile target.
  const makeResult = installMakefileTarget(cwd, force)
  console.log(`  [${makeResult}] Makefile (target heimdall-review)`)

  // 3a. git alias — se documenta el comando exacto (no lo ejecutamos para no
  // mutar la config del repo sin que se note; el usuario lo corre a mano).
  const aliasCmd =
    "git config alias.heimdall-review " +
    "'!infisical run -- bunx github:chimeranext/heimdall@main review diff'"
  console.log(`  [manual ] git alias — corré:\n      ${aliasCmd}`)

  // 3b. pre-push hook (opt-in).
  if (withHook) {
    const hookResult = installPrePushHook(cwd, force)
    if (hookResult === "no-git") {
      console.log("  [skipped] pre-push hook — no se encontró .git/ (¿es un repo git?).")
    } else {
      console.log(`  [${hookResult}] .git/hooks/pre-push`)
    }
  } else {
    console.log(
      "  [opt-in ] pre-push hook — re-corré con --with-hook para instalarlo " +
        "(corre el review antes de cada push y pregunta si continuar).",
    )
  }

  // 4. Guardrail de la key-chain: protegé *.nvidia.env en el .gitignore.
  const ignoreResult = ensureNvidiaEnvIgnored(cwd)
  console.log(`  [${ignoreResult}] .gitignore (patrón ${NVIDIA_ENV_IGNORE})`)

  console.log(
    "\n[heimdall-review install] listo. Probá:  infisical run -- heimdall-review diff\n" +
      "(o `make heimdall-review`, o `git heimdall-review` tras configurar el alias).",
  )
}
