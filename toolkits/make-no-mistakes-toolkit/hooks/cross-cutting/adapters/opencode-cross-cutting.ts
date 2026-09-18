/**
 * OpenCode V2 plugin — Cure 4b cross-cutting guards (one coherent group).
 * Disable with plugins: ["-local.mnm-cross-cutting"],
 * MNM_DISABLE_CROSSCUTTING_HOOK=1, or the global
 * CLAUDE_DISABLE_PLUGIN_HOOKS=1.
 *
 * Mirrors, surface by surface (keep in sync with each one):
 *   - hooks/cross-cutting/pre-write-no-cleartext-secret-in-config.sh
 *     (surface `cleartext_secrets`, Write|Edit|MultiEdit on config files)
 *   - hooks/cross-cutting/pre-write-cross-repo-schema-ownership.sh
 *     (surface `schema_ownership`, Write of new SQL migrations only)
 *   - hooks/cross-cutting/pre-write-version-bump-discipline.sh
 *     (surface `version_bumps`, Write|Edit|MultiEdit + git HEAD + validator)
 * plus the shared libs hooks/cross-cutting/lib/jq-input.sh (input parsing,
 * bypass leaders `#` / `//` / `--`) and lib/load-config.sh (repo-root
 * detection, `version: 1` gate, per-surface enabled/defer flags).
 *
 * Opt-in per repo via `.claude/config/cross-cutting-hooks.json` at the
 * consumer repo root. No-op when the config is absent, malformed, a
 * surface is disabled, or the surface defers to a local 4a hook
 * (fail open, like the .sh hooks).
 */
import { Plugin } from "@opencode-ai/plugin"
import { existsSync, readFileSync } from "node:fs"
import { dirname, isAbsolute, join, resolve } from "node:path"
import { execFileSync } from "node:child_process"

const EDIT_TOOLS = new Set(["edit", "write", "apply_patch"])

function disabled(): boolean {
  return (
    process.env.MNM_DISABLE_CROSSCUTTING_HOOK === "1" ||
    process.env.CLAUDE_DISABLE_PLUGIN_HOOKS === "1"
  )
}

function str(value: unknown): string {
  return typeof value === "string" ? value : ""
}

function escapeRe(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** Input parsing mirrors lib/jq-input.sh (plus OpenCode camelCase). */
function toolInputOf(eventTool: string, input: unknown): {
  raw: string
  toolName: string
  filePath: string
  proposed: string
} {
  const raw = JSON.stringify(input ?? {})
  const rec = (input ?? {}) as Record<string, unknown>
  const filePath = str(rec.file_path ?? rec.filePath ?? rec.path)
  let proposed = ""
  // Map the OpenCode tool id to the Claude tool names the .sh hooks filter on.
  let toolName = "Write"
  if (eventTool === "edit") toolName = "Edit"
  else if (eventTool === "apply_patch") toolName = "MultiEdit"
  if (toolName === "Write") {
    proposed = str(rec.content ?? rec.new_string ?? rec.newString)
  } else if (toolName === "Edit") {
    proposed = str(rec.new_string ?? rec.newString ?? rec.content)
  } else {
    const edits = Array.isArray(rec.edits)
      ? (rec.edits as Record<string, unknown>[])
      : []
    proposed =
      edits
        .map((e) => str(e.new_string ?? e.newString))
        .filter(Boolean)
        .join("\n") || str(rec.new_string ?? rec.newString ?? rec.content)
  }
  return { raw, toolName, filePath, proposed }
}

/** Bypass markers accept `#`, `//`, `--` leaders (mirrors cc_has_bypass_marker). */
function hasBypass(raw: string, marker: string): boolean {
  if (!marker) return false
  try {
    return new RegExp(
      `(#|//|--)[ \\t]*hook-bypass:[ \\t]*${escapeRe(marker)}([ \\t\\\\"']|$)`,
    ).test(raw)
  } catch {
    return false
  }
}

/** Repo-root detection mirrors lib/load-config.sh (env, file dir, cwd). */
function findRepoRoot(filePath: string): string {
  const envRoot = process.env.CLAUDE_PROJECT_ROOT ?? ""
  if (envRoot && existsSync(join(envRoot, ".git"))) return envRoot
  const anchors: string[] = []
  if (filePath) {
    const abs = isAbsolute(filePath) ? filePath : resolve(process.cwd(), filePath)
    anchors.push(dirname(abs))
  }
  anchors.push(process.cwd())
  for (const anchor of anchors) {
    let dir = anchor
    for (let depth = 0; depth < 32; depth++) {
      try {
        if (existsSync(join(dir, ".git"))) return dir
      } catch {
        break
      }
      const parent = dirname(dir)
      if (parent === dir) break
      dir = parent
    }
  }
  return ""
}

type Config = {
  found: boolean
  json: Record<string, unknown>
}

function loadConfig(filePath: string): Config {
  const empty: Config = { found: false, json: {} }
  const root = findRepoRoot(filePath)
  if (!root) return empty
  const path = join(root, ".claude", "config", "cross-cutting-hooks.json")
  let raw = ""
  try {
    raw = readFileSync(path, "utf8")
  } catch {
    return empty
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return empty
  }
  if (!parsed || typeof parsed !== "object") return empty
  const json = parsed as Record<string, unknown>
  if (Number(json.version ?? 0) !== 1) return empty
  return { found: true, json }
}

function surfaceEnabled(config: Config, surface: string): boolean {
  const block = config.json[surface]
  return (
    !!block && typeof block === "object" && (block as Record<string, unknown>).enabled === true
  )
}

function surfaceDefers(config: Config, surface: string): boolean {
  const block = config.json[surface] as Record<string, unknown> | undefined
  return !!block && block.defer_to_local_hook === true
}

// --- Surface 1: cleartext_secrets ---
const BUILTIN_TAILS =
  "SERVICE_ROLE|JWT_SECRET|PRIVATE_KEY|CLIENT_SECRET|ADMIN_TOKEN|PASSWORD|ENCRYPTION_KEY|SIGNING_SECRET"
const BUILTIN_SUFFIXES = "_FILE|_PATH"

function isConfigFile(filePath: string): boolean {
  if (/\.(jsonc?|ya?ml|toml)$/.test(filePath)) return true
  const base = filePath.split("/").pop() ?? filePath
  return base === ".env" || base.startsWith(".env.") || base.endsWith(".env")
}

function checkCleartext(
  config: Config,
  filePath: string,
  proposed: string,
): string | null {
  const surface = "cleartext_secrets"
  if (!surfaceEnabled(config, surface)) return null
  if (surfaceDefers(config, surface)) return null
  if (!isConfigFile(filePath) || !proposed) return null
  const block = config.json[surface] as Record<string, unknown>
  const extras = Array.isArray(block.extra_block_patterns)
    ? (block.extra_block_patterns as unknown[]).map(String).filter(Boolean)
    : []
  const suffixes = Array.isArray(block.extra_cure_suffixes)
    ? (block.extra_cure_suffixes as unknown[]).map(String).filter(Boolean)
    : []
  const tails = extras.length > 0 ? `${BUILTIN_TAILS}|${extras.map(escapeRe).join("|")}` : BUILTIN_TAILS
  const cures =
    suffixes.length > 0
      ? `${BUILTIN_SUFFIXES}|${suffixes.map(escapeRe).join("|")}`
      : BUILTIN_SUFFIXES
  let highImpact: RegExp
  let cure: RegExp
  try {
    highImpact = new RegExp(`\\$\\{[A-Z_]*(${tails})[A-Z0-9_]*\\}`)
    cure = new RegExp(`(${cures})\\}$`)
  } catch {
    return null
  }
  if (!highImpact.test(proposed)) return null
  const tokens = proposed.match(/\$\{[A-Z][A-Z0-9_]*\}/g) ?? []
  const offenders = [
    ...new Set(
      tokens.filter((tok) => highImpact.test(tok) && !cure.test(tok)),
    ),
  ]
  if (offenders.length === 0) return null
  return (
    `BLOCKED [pre-write-no-cleartext-secret-in-config.sh]: config file write introduces \${...} placeholder(s) ` +
    `that the runtime will substitute and write to disk in CLEARTEXT.\n\n` +
    `Attempted file: ${filePath}\nOffending:      ${offenders.join(" ")}\n\n` +
    `How to fix:\n  - Use *_FILE / *_PATH placeholders that point at secret-volume mounts.\n` +
    `  - Read the secret at runtime with a small helper (e.g. readSecretFile()).\n\n` +
    `Bypass (use sparingly, comment why):\n  Add "# hook-bypass: cross-cutting-cleartext-secret" to the proposed content near the placeholder.`
  )
}

// --- Surface 2: schema_ownership ---
function inMigrationPath(filePath: string, paths: string[]): boolean {
  if (!filePath.endsWith(".sql")) return false
  return paths.some(
    (p) => p !== "" && (filePath === `${p}` || filePath.includes(`/${p}/`) || filePath.includes(`${p}/`)),
  )
}

function extractTables(proposed: string): string[] {
  const found = new Set<string>()
  let re: RegExp
  try {
    re = /(CREATE|ALTER|DROP|RENAME)\s+TABLE\s+(IF\s+(NOT\s+)?EXISTS\s+)?([A-Za-z_][A-Za-z0-9_."]*)/gi
  } catch {
    return []
  }
  let m: RegExpExecArray | null
  while ((m = re.exec(proposed)) !== null) {
    let name = m[5].replace(/"/g, "")
    name = name.includes(".") ? (name.split(".").pop() ?? "") : name
    name = name.replace(/[^A-Za-z0-9_].*$/, "")
    if (name) found.add(name)
    if (found.size > 200) break
  }
  return [...found]
}

function checkSchemaOwnership(
  config: Config,
  filePath: string,
  proposed: string,
): string | null {
  const surface = "schema_ownership"
  if (!surfaceEnabled(config, surface)) return null
  if (surfaceDefers(config, surface)) return null
  const block = config.json[surface] as Record<string, unknown>
  const migPaths = Array.isArray(block.migration_paths)
    ? (block.migration_paths as unknown[]).map(String).filter(Boolean)
    : ["supabase/migrations"]
  const paths = migPaths.length > 0 ? migPaths : ["supabase/migrations"]
  if (!inMigrationPath(filePath, paths)) return null
  const owned = Array.isArray(block.owned_tables)
    ? (block.owned_tables as unknown[]).map(String)
    : []
  if (owned.length === 0) {
    return (
      `BLOCKED [pre-write-cross-repo-schema-ownership.sh]: this repo's cross-cutting-hooks.json declares ` +
      `owned_tables=[] for the migration_paths under discipline, meaning this repo has no migration pipeline and should not host SQL migrations.\n\n` +
      `Attempted file: ${filePath}\n\n` +
      `How to fix:\n  - Move the migration to the repo that owns the schema.\n` +
      `  - If this repo SHOULD own some tables, add them to .claude/config/cross-cutting-hooks.json -> schema_ownership -> owned_tables.\n\n` +
      `Bypass (intentional historical artifact only):\n  Add "# hook-bypass: cross-cutting-schema-ownership" inside the migration file.`
    )
  }
  if (!proposed) return null
  const referenced = extractTables(proposed)
  if (referenced.length === 0) return null
  const ownedSet = new Set(owned)
  const unowned = [...new Set(referenced.filter((t) => !ownedSet.has(t)))]
  if (unowned.length === 0) return null
  return (
    `BLOCKED [pre-write-cross-repo-schema-ownership.sh]: migration touches table(s) not owned by this repo.\n\n` +
    `Attempted file: ${filePath}\nUnowned tables: ${unowned.join(" ")}\nOwned tables:   ${owned.join(",")}\n\n` +
    `How to fix:\n  - Move this migration to the owning repo.\n` +
    `  - If this repo should own a listed table, add it to .claude/config/cross-cutting-hooks.json -> schema_ownership -> owned_tables.\n\n` +
    `Bypass (single-migration override only):\n  Add "# hook-bypass: cross-cutting-schema-ownership" inside the migration file.`
  )
}

// --- Surface 3: version_bumps ---
function matchEntry(
  filePath: string,
  entries: Record<string, unknown>[],
): Record<string, unknown> | null {
  for (const entry of entries) {
    const fp = String(entry.file_pattern ?? "")
    if (!fp) continue
    if (filePath === fp || filePath.endsWith("/" + fp) || filePath.endsWith(fp))
      return entry
  }
  return null
}

function extractVersion(versionRegex: string, haystack: string): string {
  let re: RegExp
  try {
    re = new RegExp(versionRegex)
  } catch {
    return ""
  }
  for (const line of haystack.split("\n")) {
    try {
      const m = re.exec(line)
      if (m && m[1]) return m[1]
    } catch {
      continue
    }
  }
  return ""
}

function checkVersionBump(
  config: Config,
  repoRoot: string,
  filePath: string,
  proposed: string,
): string | null {
  const entries = Array.isArray(config.json.version_bumps)
    ? (config.json.version_bumps as Record<string, unknown>[])
    : []
  if (entries.length === 0) return null
  const entry = matchEntry(filePath, entries)
  if (!entry) return null
  if (entry.defer_to_local_hook === true) return null
  const validator = String(entry.validator_script ?? "")
  const versionRegex = String(entry.version_regex ?? "")
  if (!validator || !versionRegex) return null
  const validatorAbs = isAbsolute(validator) ? validator : join(repoRoot, validator)
  try {
    if (!existsSync(validatorAbs)) return null
  } catch {
    return null
  }
  if (!proposed) return null
  const newVersion = extractVersion(versionRegex, proposed)
  if (!newVersion) return null
  let rel = filePath
  if (isAbsolute(rel) && repoRoot && rel.startsWith(repoRoot + "/")) {
    rel = rel.slice(repoRoot.length + 1)
  }
  let oldBlob = ""
  try {
    oldBlob = execFileSync("git", ["-C", repoRoot, "show", `HEAD:${rel}`], {
      encoding: "utf8",
      timeout: 10000,
    })
  } catch {
    return null
  }
  if (!oldBlob) return null
  const oldVersion = extractVersion(versionRegex, oldBlob)
  if (!oldVersion || oldVersion === newVersion) return null
  const extraArgs = Array.isArray(entry.validator_args)
    ? (entry.validator_args as unknown[]).map(String)
    : []
  let exit = 0
  let validatorStderr = ""
  try {
    execFileSync(validatorAbs, [oldVersion, newVersion, ...extraArgs], {
      encoding: "utf8",
      timeout: 30000,
    })
  } catch (err) {
    const e = err as { status?: number; stderr?: unknown }
    exit = typeof e.status === "number" ? e.status : 1
    validatorStderr = typeof e.stderr === "string" ? e.stderr : String(e.stderr ?? "")
  }
  if (exit === 0) return null
  if (exit !== 2) return null
  return (
    `BLOCKED [pre-write-version-bump-discipline.sh]: version bump rejected by validator.\n\n` +
    `Attempted file: ${filePath}\nOld version:    ${oldVersion}\nNew version:    ${newVersion}\nValidator:      ${validatorAbs}\n` +
    (validatorStderr ? `\nValidator output:\n${validatorStderr}\n` : "") +
    `\nBypass (rare, justify in PR body):\n  Add "# hook-bypass: cross-cutting-version-bump" to the proposed content.`
  )
}

export default Plugin.define({
  id: "local.mnm-cross-cutting",
  setup: async (ctx) => {
    await ctx.tool.hook("execute.before", (event) => {
      if (disabled()) return
      if (!EDIT_TOOLS.has(event.tool)) return
      const input = event.input as unknown
      if (typeof input !== "object" || input === null) return
      const { raw, toolName, filePath, proposed } = toolInputOf(event.tool, input)
      if (!filePath) return
      if (hasBypass(raw, "cross-cutting-cleartext-secret")) return
      const config = loadConfig(filePath)
      if (!config.found) return
      const isWrite = toolName === "Write"
      if (!isWrite && hasBypass(raw, "cross-cutting-schema-ownership")) {
        // Edit/MultiEdit on existing migrations is expected; only Write is gated.
      }
      const cleartext = checkCleartext(config, filePath, proposed)
      if (cleartext) throw new Error(cleartext)
      if (isWrite && !hasBypass(raw, "cross-cutting-schema-ownership")) {
        const ownership = checkSchemaOwnership(config, filePath, proposed)
        if (ownership) throw new Error(ownership)
      }
      if (!hasBypass(raw, "cross-cutting-version-bump")) {
        const root = findRepoRoot(filePath)
        if (root) {
          const bump = checkVersionBump(config, root, filePath, proposed)
          if (bump) throw new Error(bump)
        }
      }
    })
  },
})
