/**
 * OpenCode V2 plugin — atomic-design ownership enforcement + drift telemetry.
 * Disable with plugins: ["-local.mnm-atomic"], MNM_DISABLE_ATOMIC_HOOK=1,
 * or the global CLAUDE_DISABLE_PLUGIN_HOOKS=1.
 *
 * Mirrors hooks/atomic/pre-atomic.sh (execute.before, block) and
 * hooks/atomic/post-atomic-drift.sh (execute.after, warn-only) — keep in
 * sync with both. No-op unless the consumer repo has a
 * `.atomic-design-rules.json` at its root (opt-in, like the .sh hooks).
 * Per-write exemption via `// @atomic-exempt: <reason>` (or `# ...`).
 */
import { Plugin } from "@opencode-ai/plugin"
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { basename, dirname, isAbsolute, join, resolve } from "node:path"

const EDIT_TOOLS = new Set(["edit", "write", "apply_patch"])

function disabled(): boolean {
  return (
    process.env.MNM_DISABLE_ATOMIC_HOOK === "1" ||
    process.env.CLAUDE_DISABLE_PLUGIN_HOOKS === "1"
  )
}

function str(value: unknown): string {
  return typeof value === "string" ? value : ""
}

function filePathOf(input: unknown): string {
  const rec = (input ?? {}) as Record<string, unknown>
  return str(rec.file_path ?? rec.filePath ?? rec.path ?? rec.notebook_path)
}

function contentOf(input: unknown): string {
  const rec = (input ?? {}) as Record<string, unknown>
  const edits = Array.isArray(rec.edits)
    ? (rec.edits as Record<string, unknown>[])
    : []
  return str(
    rec.content ??
      rec.new_string ??
      rec.newString ??
      edits
        .map((e) => str(e.new_string ?? e.newString))
        .filter(Boolean)
        .join("\n"),
  )
}

/** Walk up from the target file for .atomic-design-rules.json (mirrors find_config). */
function findConfig(target: string): string | null {
  let start = target || process.cwd()
  if (!isAbsolute(start)) start = resolve(process.cwd(), start)
  let dir = existsSync(start) && statSync(start).isDirectory() ? start : dirname(start)
  if (dir === "." || dir === "") dir = process.cwd()
  let guard = 0
  while (dir !== "/" && dir && guard++ < 64) {
    const candidate = join(dir, ".atomic-design-rules.json")
    try {
      if (existsSync(candidate)) return candidate
    } catch {
      return null
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

function readConfig(path: string): Record<string, unknown> | null {
  try {
    const raw = readFileSync(path, "utf8")
    const parsed: unknown = JSON.parse(raw)
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

function ereToJs(pattern: string): string {
  // Same conversion as the rules engine: every `[:name:]` occurrence is a
  // POSIX class inside a bracket expression. Keep in sync with
  // hooks/rules/adapters/opencode-rules.ts.
  const classes: Record<string, string> = {
    "[:space:]": "\\s",
    "[:blank:]": "[ \\t]",
    "[:digit:]": "\\d",
    "[:alpha:]": "[A-Za-z]",
    "[:alnum:]": "[A-Za-z0-9]",
    "[:upper:]": "[A-Z]",
    "[:lower:]": "[a-z]",
    "[:xdigit:]": "[A-Fa-f0-9]",
  }
  let out = pattern
  for (const [posix, js] of Object.entries(classes)) {
    out = out.split(posix).join(js)
  }
  return out
}

function ereTest(pattern: string, value: string): boolean {
  let re: RegExp
  try {
    re = new RegExp(ereToJs(pattern))
  } catch {
    return false
  }
  return value.split("\n").some((line) => {
    try {
      return re.test(line)
    } catch {
      return false
    }
  })
}

function escapeRe(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function violation(
  target: string,
  docs: string,
  ruleId: string,
  canonical: string,
  message: string,
): string {
  return (
    `\n[make-no-mistakes:atomic:${ruleId}] action=block\n` +
    `  target:    ${target}\n` +
    (canonical ? `  canonical: ${canonical}\n` : "") +
    (docs ? `  docs:      ${docs}\n` : "") +
    `\n${message}\n` +
    `\nTo override (with reviewer approval): add a comment to the file:\n` +
    `  // @atomic-exempt: <reason>`
  )
}

type PreContext = {
  target: string
  content: string
  config: Record<string, unknown>
  docs: string
  componentsRoot: string
}

function prepare(input: unknown): PreContext | null {
  const rawPath = filePathOf(input)
  if (!rawPath) return null
  const configPath = findConfig(rawPath)
  if (!configPath) return null
  const config = readConfig(configPath)
  if (!config) return null
  const repoRoot = dirname(configPath)
  let target = rawPath
  if (isAbsolute(target)) {
    if (!target.startsWith(repoRoot + "/")) return null
    target = target.slice(repoRoot.length + 1)
  }
  const content = contentOf(input)
  const markers = Array.isArray(config.exempt_markers)
    ? (config.exempt_markers as unknown[]).map(String)
    : ["@atomic-exempt"]
  for (const marker of markers) {
    if (!marker) continue
    try {
      if (
        new RegExp(`(//|#)[ \\t]*${escapeRe(marker)}:`).test(content)
      )
        return null
    } catch {
      continue
    }
  }
  const docs = typeof config.rules_doc_url === "string" ? config.rules_doc_url : ""
  const componentsRoot =
    typeof config.components_root === "string" ? config.components_root : "src/components"
  if (!target.startsWith(componentsRoot + "/")) return null
  return { target, content, config, docs, componentsRoot }
}

function checkPre(p: PreContext): string | null {
  const { target, content, config, docs, componentsRoot } = p
  const canonical = Array.isArray(config.canonical_folders)
    ? (config.canonical_folders as Record<string, unknown>[])
    : []
  for (const entry of canonical) {
    const wrong = String(entry.wrong ?? "")
    const canon = String(entry.canonical ?? "")
    if (wrong && target.startsWith(wrong + "/")) {
      const reason = String(entry.reason ?? "")
      return violation(
        target,
        docs,
        "canonical-folder",
        `${canon}/`,
        `Path uses the NON-canonical folder '${wrong}'.${reason ? ` Reason: ${reason}.` : ""}\nMove the file to the canonical location: ${canon}/`,
      )
    }
  }
  const junk = Array.isArray(config.junk_drawers)
    ? (config.junk_drawers as Record<string, unknown>[])
    : []
  for (const entry of junk) {
    const folder = String(entry.folder ?? "")
    if (!folder) continue
    if (target.startsWith(folder + "/") && !target.slice(folder.length + 1).includes("/")) {
      const msg =
        String(entry.message ?? "") ||
        `'${folder}/' is a known junk-drawer folder. Place the file under its owning pillar instead.`
      return violation(target, docs, "junk-drawer", "", msg)
    }
  }
  const levels =
    config.atomic_levels && typeof config.atomic_levels === "object"
      ? (config.atomic_levels as Record<string, Record<string, unknown>>)
      : {}
  for (const [levelKey, level] of Object.entries(levels)) {
    const folder = String(level?.folder ?? "")
    if (!folder) continue
    // Mirror the shell `*/"<folder>"/*` segment match.
    try {
      if (!new RegExp(`(^|/)${escapeRe(folder)}/`).test(target)) continue
    } catch {
      continue
    }
    const patterns = Array.isArray(level?.forbid_content_patterns)
      ? (level.forbid_content_patterns as unknown[]).map(String)
      : []
    for (const pattern of patterns) {
      if (pattern && ereTest(pattern, content)) {
        const msg = String(
          level?.forbid_message ?? "Content violates atomic-design constraints for this level.",
        )
        return violation(
          target,
          docs,
          `atomic-level-${levelKey}`,
          "",
          `Forbidden pattern '${pattern}' detected in a file written to the '${levelKey}' atomic level.\n\n${msg}`,
        )
      }
    }
  }
  const pillars = Array.isArray(config.pillars)
    ? (config.pillars as Record<string, unknown>[])
    : []
  const shared = Array.isArray(config.shared_pillars)
    ? (config.shared_pillars as unknown[]).map(String)
    : []
  const rel = target.startsWith(componentsRoot + "/")
    ? target.slice(componentsRoot.length + 1)
    : target
  const candidate = rel.includes("/") ? rel.slice(0, rel.indexOf("/")) : ""
  const targetPillar = pillars.find((pl) => String(pl.folder ?? "") === candidate)
    ? String(pillars.find((pl) => String(pl.folder ?? "") === candidate)?.slug ?? "")
    : ""
  if (targetPillar && content) {
    const rootBase = componentsRoot.split("/").pop() ?? componentsRoot
    for (const pl of pillars) {
      const folder = String(pl.folder ?? "")
      const slug = String(pl.slug ?? "")
      if (!folder || slug === targetPillar || shared.includes(slug)) continue
      try {
        if (
          new RegExp(
            `from[ \\t]+["']@/${escapeRe(rootBase)}/${escapeRe(folder)}(/|["'])`,
          ).test(content)
        ) {
          const owner = String(pl.owner ?? "unknown owner")
          return violation(
            target,
            docs,
            "cross-pillar-import",
            "",
            `Cross-pillar import detected: file under pillar '${targetPillar}' imports from pillar '${folder}' (${owner}).\n\nCross-pillar imports must go through a shared pillar (${shared.join(", ") || "platform"}).\nEither:\n  1. Move the imported component into a shared pillar, or\n  2. Duplicate the small piece you need (rule of three), or\n  3. Add '// @atomic-exempt: <reason>' if the coupling is intentional.`,
          )
        }
      } catch {
        continue
      }
    }
  }
  return null
}

/**
 * Surface a warn-only verdict in execute.after (PostToolUse convention —
 * warnings cannot block a call that already ran). Handles every
 * Tool.Result shape: plain string, `{ output: string }` (shell/edit/write),
 * `{ content: string }`, or `{ content: [{ type: "text", ... }] }` (MCP).
 */
function appendWarning(event: { result?: unknown }, warning: string): void {
  const result = event.result as unknown
  if (typeof result === "string") {
    ;(event as { result: unknown }).result = `${result}\n${warning}`
    return
  }
  if (result && typeof result === "object") {
    const rec = result as Record<string, unknown>
    if (typeof rec.output === "string") {
      ;(event as { result: unknown }).result = {
        ...(rec as object),
        output: `${rec.output}\n${warning}`,
      }
      return
    }
    if (typeof rec.content === "string") {
      ;(event as { result: unknown }).result = {
        ...(rec as object),
        content: `${rec.content}\n${warning}`,
      }
      return
    }
    if (Array.isArray(rec.content)) {
      ;(event as { result: unknown }).result = {
        ...(rec as object),
        content: [...rec.content, { type: "text", text: warning }],
      }
    }
  }
}

function warn(pillar: string, ruleId: string, message: string): string {
  return `\n[make-no-mistakes:atomic-drift:${ruleId}] action=warn pillar=${pillar}\n${message}`
}

function listFilesRecursive(dir: string): string[] {
  let entries: string[]
  try {
    entries = readdirSync(dir, { withFileTypes: true }).map((e) => e.name)
  } catch {
    return []
  }
  const collected: string[] = []
  for (const name of entries) {
    const full = join(dir, name)
    let st: ReturnType<typeof statSync> | null = null
    try {
      st = statSync(full)
    } catch {
      continue
    }
    if (st.isDirectory()) {
      collected.push(...listFilesRecursive(full))
    } else {
      collected.push(full)
    }
  }
  return collected
}

function checkDrift(input: unknown): string[] {
  const rawPath = filePathOf(input)
  if (!rawPath) return []
  const configPath = findConfig(rawPath)
  if (!configPath) return []
  const config = readConfig(configPath)
  if (!config) return []
  const repoRoot = dirname(configPath)
  const componentsRoot =
    typeof config.components_root === "string" ? config.components_root : "src/components"
  const componentsAbs = join(repoRoot, componentsRoot)
  try {
    if (!statSync(componentsAbs).isDirectory()) return []
  } catch {
    return []
  }
  let target = rawPath
  if (isAbsolute(target)) {
    if (!target.startsWith(repoRoot + "/")) return []
    target = target.slice(repoRoot.length + 1)
  }
  if (!target.startsWith(componentsRoot + "/")) return []
  const rel = target.slice(componentsRoot.length + 1)
  if (!rel.includes("/")) return []
  const pillarFolder = rel.slice(0, rel.indexOf("/"))
  const pillarDir = join(componentsAbs, pillarFolder)
  try {
    if (!statSync(pillarDir).isDirectory()) return []
  } catch {
    return []
  }
  const warnings: string[] = []
  const thresholds =
    config.drift_thresholds && typeof config.drift_thresholds === "object"
      ? (config.drift_thresholds as Record<string, unknown>)
      : {}
  let maxOrganisms = Number(thresholds.max_organisms_per_pillar ?? 100)
  if (!Number.isFinite(maxOrganisms)) maxOrganisms = 100
  const maxRootFiles = Number(thresholds.max_root_files_per_pillar ?? 5)
  const staleDays = Number(thresholds.public_prefix_stale_days ?? 30)
  const pillars = Array.isArray(config.pillars)
    ? (config.pillars as Record<string, unknown>[])
    : []
  const override = pillars.find((pl) => String(pl.folder ?? "") === pillarFolder)
  if (override?.max_organisms !== undefined && override?.max_organisms !== null) {
    const n = Number(override.max_organisms)
    if (Number.isFinite(n)) maxOrganisms = n
  }
  const levels =
    config.atomic_levels && typeof config.atomic_levels === "object"
      ? (config.atomic_levels as Record<string, Record<string, unknown>>)
      : {}
  const lv = (key: string, fallback: string): string => {
    const v = levels[key]?.folder
    return typeof v === "string" && v ? v : fallback
  }
  const organismsFolder = lv("organisms", "organisms")
  const ext = [".tsx", ".ts", ".jsx", ".js"]
  const isSrc = (f: string): boolean => ext.some((e) => f.endsWith(e))
  try {
    const orgDir = join(pillarDir, organismsFolder)
    if (existsSync(orgDir)) {
      const count = listFilesRecursive(orgDir).filter(isSrc).length
      if (count > maxOrganisms) {
        warnings.push(
          warn(
            pillarFolder,
            "organisms-cap-exceeded",
            `Pillar '${pillarFolder}' has ${count} organisms (threshold: ${maxOrganisms}).\nConsider splitting the pillar or promoting reusable organisms to templates.`,
          ),
        )
      }
    }
  } catch {
    // fail open
  }
  try {
    const names = readdirSync(pillarDir)
    const indexNames = new Set(["index.ts", "index.tsx", "index.js", "index.jsx"])
    const rootCount = names.filter((n) => {
      if (indexNames.has(n)) return false
      if (!isSrc(n)) return false
      try {
        return statSync(join(pillarDir, n)).isFile()
      } catch {
        return false
      }
    }).length
    if (Number.isFinite(maxRootFiles) && rootCount > maxRootFiles) {
      warnings.push(
        warn(
          pillarFolder,
          "pillar-root-flat",
          `Pillar '${pillarFolder}' has ${rootCount} files directly at its root (threshold: ${maxRootFiles}).\nA pillar should use atomic subfolders: ${lv("atoms", "atoms")}/, ${lv("molecules", "molecules")}/, ${organismsFolder}/, ${lv("templates", "templates")}/.`,
        ),
      )
    }
  } catch {
    // fail open
  }
  try {
    const cutoff = Date.now() - (Number.isFinite(staleDays) ? staleDays : 30) * 86400000
    const stale = listFilesRecursive(pillarDir).filter(
      (f) => {
        if (!isSrc(f) || !basename(f).startsWith("Public")) return false
        try {
          return statSync(f).mtimeMs < cutoff
        } catch {
          return false
        }
      },
    ).slice(0, 5)
    if (stale.length > 0) {
      warnings.push(
        warn(
          pillarFolder,
          "public-prefix-stale",
          `Stale 'Public*' files in pillar '${pillarFolder}':\n${stale.join("\n")}\nConsider merging Public* and private variants behind a single route.`,
        ),
      )
    }
  } catch {
    // fail open
  }
  const base = basename(target)
  if (/\.tsx$|\.ts$|\.jsx$|\.js$/.test(base) && !/^(index\.(ts|tsx|js|jsx)|README\.md)$/.test(base)) {
    try {
      const others = pillars
        .map((pl) => String(pl.folder ?? ""))
        .filter((f) => f && f !== pillarFolder)
      const dupes: string[] = []
      for (const other of others) {
        const otherDir = join(componentsAbs, other)
        if (!existsSync(otherDir)) continue
        for (const hit of listFilesRecursive(otherDir)) {
          if (basename(hit) === base) {
            dupes.push(hit)
            if (dupes.length >= 3) break
          }
        }
        if (dupes.length >= 3) break
      }
      if (dupes.length > 0) {
        warnings.push(
          warn(
            pillarFolder,
            "duplicate-filename-cross-pillar",
            `Filename '${base}' also exists in other pillars:\n${dupes.join("\n")}\nConsolidate into a shared pillar or rename to disambiguate.`,
          ),
        )
      }
    } catch {
      // fail open
    }
  }
  return warnings
}

export default Plugin.define({
  id: "local.mnm-atomic",
  setup: async (ctx) => {
    await ctx.tool.hook("execute.before", (event) => {
      if (disabled()) return
      if (!EDIT_TOOLS.has(event.tool)) return
      const input = event.input as unknown
      if (typeof input !== "object" || input === null) return
      const p = prepare(input)
      if (!p) return
      const msg = checkPre(p)
      if (msg) throw new Error(msg)
    })
    await ctx.tool.hook("execute.after", (event) => {
      if (disabled()) return
      if (event.status !== "completed") return
      if (!EDIT_TOOLS.has(event.tool as string)) return
      const input = event.input as unknown
      if (typeof input !== "object" || input === null) return
      for (const warning of checkDrift(input)) {
        appendWarning(event as { result?: unknown }, warning)
      }
    })
  },
})
