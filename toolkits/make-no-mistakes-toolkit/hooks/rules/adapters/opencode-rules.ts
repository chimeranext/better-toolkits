/**
 * OpenCode V2 plugin — manifest-driven PreToolUse + PostToolUse enforcement.
 * Disable with plugins: ["-local.mnm-rules"], MNM_DISABLE_RULES_HOOK=1,
 * or the global CLAUDE_DISABLE_PLUGIN_HOOKS=1.
 *
 * Evaluates the compiled manifest hooks/rules/rules.json — the same artifact
 * the shell dispatchers read (keep in sync with hooks/rules/rules.yaml as
 * SSOT, hooks/pre-bash.sh, hooks/pre-edit.sh, hooks/post-slack.sh,
 * hooks/lib/eval-rule.sh, hooks/lib/parse-input.sh, and the warn-only
 * hooks/pre-bash-stale-push.sh which is folded into the warn path below).
 *
 * Mapping (same convention as the opencode-hooks package extracted from
 * oh-my-opencode: PreToolUse -> execute.before / throw to block,
 * warn-only -> execute.after with the warning appended to the result):
 *   - Bash + Edit/Write rules with action=block -> execute.before, throw.
 *   - Rules with action=warn (any family) + stale-push heuristic ->
 *     execute.after, warning appended to result output (never throws).
 *   - Slack rules (applies_to: [Slack]) -> execute.after only, warn-only by
 *     contract (same as post-slack.sh: PostToolUse cannot block).
 *
 * No-op when hooks/rules/rules.json is absent (fail open, like the .sh
 * dispatchers when the manifest or jq is missing).
 */
import { Plugin } from "@opencode-ai/plugin"
import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"

// --- Tool-name mapping: OpenCode V2 ids -> Claude matcher names ---
const SHELL_TOOLS = new Set(["shell", "bash"])
const EDIT_TOOLS = new Set(["edit", "write", "apply_patch"])
const TOOL_FAMILY: Record<string, string[]> = {
  shell: ["Bash"],
  bash: ["Bash"],
  edit: ["Edit"],
  write: ["Write"],
  apply_patch: ["Edit", "Write"],
}

type RuleCondition = {
  field: string
  pattern?: string
  not_pattern?: string
  flags?: string
}

type Rule = {
  id: string
  applies_to?: string[]
  match?: RuleCondition[]
  action?: string
  bypass_marker?: string | null
  disable_if_repo_file?: string
  message?: string
}

function disabled(): boolean {
  return (
    process.env.MNM_DISABLE_RULES_HOOK === "1" ||
    process.env.CLAUDE_DISABLE_PLUGIN_HOOKS === "1"
  )
}

/**
 * Minimal ERE -> JS RegExp conversion. The manifest only uses POSIX
 * `[[:space:]]` / `[^[:space:]]` today (verified across all rules.json
 * patterns); the other common classes are translated too so future rules
 * keep working. Anything untranslatable throws -> the rule fails open
 * (mirrors grep exit != 0 meaning "no match" in eval-rule.sh).
 * Keep in sync with eval-rule.sh.
 */
function ereToJs(pattern: string): string {
  // Every `[:name:]` occurrence in the manifest is a POSIX class inside a
  // bracket expression (verified across all rules.json patterns), so a
  // global replacement is faithful for the standalone `[[:space:]]`,
  // negated-outer `[^[:space:]]`, and nested `[-:|[:space:]]` / `[[:space:]=]`
  // forms alike. Anything untranslatable throws -> the rule fails open
  // (mirrors grep exit != 0 meaning "no match" in eval-rule.sh).
  // Keep in sync with eval-rule.sh.
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

/** grep -E semantics: unanchored search, line-oriented. */
function ereTest(pattern: string, flags: string, value: string): boolean {
  let re: RegExp
  try {
    re = new RegExp(ereToJs(pattern), flags.includes("i") ? "i" : "")
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

function str(value: unknown): string {
  return typeof value === "string" ? value : ""
}

/** Field extraction mirrors hooks/lib/parse-input.sh (plus OpenCode camelCase). */
function fieldsOf(input: unknown): {
  raw: string
  command: string
  filePath: string
  content: string
  text: string
  oldString: string
} {
  const raw = JSON.stringify(input ?? {})
  const rec = (input ?? {}) as Record<string, unknown>
  const edits = Array.isArray(rec.edits)
    ? (rec.edits as Record<string, unknown>[])
    : []
  const editsNew = edits
    .map((e) => str(e.new_string ?? e.newString))
    .filter(Boolean)
    .join("\n")
  const editsOld = edits
    .map((e) => str(e.old_string ?? e.oldString))
    .filter(Boolean)
    .join("\n")
  const command = str(rec.command)
  const filePath = str(
    rec.file_path ?? rec.filePath ?? rec.path ?? rec.notebook_path,
  )
  const content = str(
    rec.content ?? rec.new_string ?? rec.newString ?? editsNew,
  )
  const text = str(rec.text ?? rec.message ?? rec.content)
  const oldString = str(rec.old_string ?? rec.oldString ?? editsOld)
  return { raw, command, filePath, content, text, oldString }
}

function fieldValue(
  field: string,
  f: ReturnType<typeof fieldsOf>,
): string | null {
  switch (field) {
    case "command":
      return f.command
    case "file_path":
      return f.filePath
    case "content":
      return f.content
    case "text":
      return f.text
    case "old_string":
      return f.oldString
    default:
      return null
  }
}

/** Bypass check mirrors eval-rule.sh: `//` or `#` leader, kebab marker, \b end. */
function hasBypass(raw: string, marker: string): boolean {
  if (!marker || /[^a-z0-9-]/.test(marker)) return false
  try {
    return new RegExp(
      `(//|#)[ \\t]*hook-bypass:[ \\t]*${marker}\\b`,
    ).test(raw)
  } catch {
    return false
  }
}

/**
 * Per-repo escape hatch mirrors eval-rule.sh: walk up from cwd for `.git`,
 * check the sentinel at that root, then always check ./cwd as well.
 */
function repoEscapeActive(sentinel: string): boolean {
  if (!sentinel || /[^a-zA-Z0-9._-]/.test(sentinel) || sentinel === "." || sentinel === "..")
    return false
  let dir = process.cwd()
  let root = ""
  for (let depth = 0; depth < 32; depth++) {
    if (existsSync(join(dir, ".git"))) {
      root = dir
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  try {
    if (root && existsSync(join(root, sentinel))) return true
    return existsSync(join(process.cwd(), sentinel))
  } catch {
    return false
  }
}

function ruleFires(rule: Rule, f: ReturnType<typeof fieldsOf>): boolean {
  if (rule.bypass_marker && hasBypass(f.raw, rule.bypass_marker)) return false
  if (rule.disable_if_repo_file && repoEscapeActive(rule.disable_if_repo_file))
    return false
  for (const cond of rule.match ?? []) {
    const value = fieldValue(cond.field, f)
    if (value === null) return false
    if (cond.pattern && !ereTest(cond.pattern, cond.flags ?? "", value))
      return false
    if (cond.not_pattern && ereTest(cond.not_pattern, cond.flags ?? "", value))
      return false
  }
  return true
}

function header(rule: Rule): string {
  return `\n[make-no-mistakes:${rule.id}] action=${rule.action}\n${rule.message ?? ""}`
}

// --- Warn-only stale-push heuristic (mirrors pre-bash-stale-push.sh) ---
function staleThreshold(): number {
  // Read per invocation (like the .sh reads it per run), never frozen at import.
  const n = Number.parseInt(process.env.MAKE_NO_MISTAKES_STALE_THRESHOLD ?? "5", 10)
  return Number.isFinite(n) ? n : 5
}

function stalePushWarning(command: string): string | null {
  if (/(^|\s)--dry-run(\s|$|=)/.test(command)) return null
  if (!/(^|\s)git\s+push\b/.test(command)) return null
  if (!/(--force-with-lease|--force|(^|\s)-f(\s|$))/.test(command)) return null
  let base = ""
  try {
    const symref = execFileSync(
      "git",
      ["symbolic-ref", "refs/remotes/origin/HEAD", "--short"],
      { encoding: "utf8", timeout: 5000 },
    ).trim()
    base = symref.replace(/^origin\//, "")
  } catch {
    base = ""
  }
  if (!base) {
    for (const candidate of ["develop", "main", "master"]) {
      try {
        execFileSync(
          "git",
          ["show-ref", "--verify", "--quiet", `refs/remotes/origin/${candidate}`],
          { timeout: 5000 },
        )
        base = candidate
        break
      } catch {
        continue
      }
    }
  }
  if (!base) return null
  let behind = ""
  try {
    behind = execFileSync(
      "git",
      ["rev-list", "--count", `HEAD..origin/${base}`],
      { encoding: "utf8", timeout: 5000 },
    ).trim()
  } catch {
    return null
  }
  if (!/^[0-9]+$/.test(behind)) return null
  if (Number.parseInt(behind, 10) <= staleThreshold()) return null
  return (
    `\n[make-no-mistakes:stale-push] WARNING\n` +
    `You're force-pushing a branch that is ${behind} commits behind origin/${base}.\n` +
    `Suggested: git fetch origin ${base} && git rebase origin/${base} && git push --force-with-lease.\n` +
    `Or push as-is and accept the risk. This is a warning, not a block.`
  )
}

function loadRules(): Rule[] {
  try {
    const dir = dirname(fileURLToPath(import.meta.url))
    const raw = readFileSync(join(dir, "..", "rules.json"), "utf8")
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Rule[]) : []
  } catch {
    return []
  }
}

/**
 * Surface a warn-only verdict in execute.after (PostToolUse convention —
 * warnings cannot block a call that already ran). Handles every
 * Tool.Result shape: plain string, `{ output: string }` (shell/edit/write),
 * `{ content: string }`, or `{ content: [{ type: "text", ... }] }` (MCP).
 */
function appendWarning(
  event: { result?: unknown },
  warning: string,
): void {
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

export default Plugin.define({
  id: "local.mnm-rules",
  setup: async (ctx) => {
    const rules = loadRules()
    await ctx.tool.hook("execute.before", (event) => {
      if (disabled()) return
      const tool = event.tool
      if (!SHELL_TOOLS.has(tool) && !EDIT_TOOLS.has(tool)) return
      const input = event.input as unknown
      if (typeof input !== "object" || input === null) return
      const families = TOOL_FAMILY[tool] ?? []
      const f = fieldsOf(input)
      // Collect every firing block verdict, like the .sh dispatchers print
      // each firing rule's message to stderr before exiting 2.
      const blocks: string[] = []
      for (const rule of rules) {
        if (rule.action !== "block") continue
        if (!rule.applies_to?.some((t) => families.includes(t))) continue
        if (ruleFires(rule, f)) blocks.push(header(rule))
      }
      if (blocks.length > 0) throw new Error(blocks.join("\n"))
    })
    await ctx.tool.hook("execute.after", (event) => {
      if (disabled()) return
      if (event.status !== "completed") return
      const tool = event.tool as string
      const input = event.input as unknown
      if (typeof input !== "object" || input === null) return
      const f = fieldsOf(input)
      const warnings: string[] = []
      if (SHELL_TOOLS.has(tool)) {
        const families = TOOL_FAMILY[tool] ?? []
        for (const rule of rules) {
          if (rule.action !== "warn") continue
          if (!rule.applies_to?.some((t) => families.includes(t))) continue
          if (ruleFires(rule, f)) warnings.push(header(rule))
        }
        const stale = stalePushWarning(f.command)
        if (stale) warnings.push(stale)
      }
      if (EDIT_TOOLS.has(tool)) {
        const families = TOOL_FAMILY[tool] ?? []
        for (const rule of rules) {
          if (rule.action !== "warn") continue
          if (!rule.applies_to?.some((t) => families.includes(t))) continue
          if (ruleFires(rule, f)) warnings.push(header(rule))
        }
      }
      if (/slack/i.test(tool)) {
        for (const rule of rules) {
          if (!rule.applies_to?.includes("Slack")) continue
          if (ruleFires(rule, f)) warnings.push(header(rule))
        }
      }
      for (const warning of warnings) {
        appendWarning(event as { result?: unknown }, warning)
      }
    })
  },
})
