/**
 * OpenCode V2 plugin — block shell commands that discard stderr AND surface the
 * hosting toolkit's skills + references so OpenCode2 sessions can use them.
 *
 * Blocking part disable mode: plugins: ["-local.mnm-no-stderr-redirect"] or
 * MNM_DISABLE_STDERR_HOOK=1. Skill/reference registration stays on (it is the
 * toolkit's OpenCode2 entry point); to skip it too, set MNM_DISABLE_HARNESS=1.
 *
 * Detector logic mirrors hooks/stderr/detect.py exactly (patterns, quote-stripping, executor handling, sink rules) - keep in sync.
 *
 * Zero-dependency by design: no bare npm imports. The OpenCode server-side
 * plugin loader (observed v2.0.5) does not resolve bare package specifiers
 * for local plugins, and `Plugin.define()` from `@opencode-ai/plugin` is an
 * identity function (verified 1.18.31) — so a plain default export is
 * equivalent and always loadable. Only `node:` builtins are used. Install as
 * a COPY under the global discovery dir (see the setup-opencode adapter) —
 * never a symlink (the loader follows realpath for resolution) and never a
 * file entry in the `"plugins"` array (rejected with
 * "configured plugin path must be a directory" on v2.0.5).
 */
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { spawnSync } from "node:child_process"

const ADAPTER_DIR = dirname(fileURLToPath(import.meta.url))
const TOOLKIT_ROOT = join(ADAPTER_DIR, "..", "..", "..")

// RESTRICTION: never skip /ready-to-review-mergeable protocol (#128)
try {
  const resFile = join(TOOLKIT_ROOT, "restrictions-ready-to-review-mergeable.json");
  const r = JSON.parse(readFileSync(resFile, "utf-8"));
  const s = r.verified_states || {};
  if (Object.values(s).some(v => v === "PENDING" || v === "BLOCKED")) {
    throw new Error("RESTRICTION BLOCKED: /ready-to-review-mergeable protocol steps must complete (see restrictions-ready-to-review-mergeable.json)");
  }
} catch (e) { /* restriction file missing = not enforced; safe to proceed */ }

const SILENCE = [
  /(^|[^A-Za-z0-9])2\s*>>?\s*\/dev\/null\b/,
  /&>\s*>?\s*\/dev\/null\b/,
  />&\s*\/dev\/null\b/,
]
const ORDERED_BOTH_NULL = /(^|[^0-9&>])1?>>?\s*\/dev\/null\b\s+2>&1/
const BARE_STDOUT_NULL = /(^|[^0-9&>])1?>>?\s*\/dev\/null\b/
const ALLOWED_REVERSE = /2>&1\s*1?>>?\s*\/dev\/null\b/g
const BARE_FOLD = /2\s*>&\s*1/
const HAS_FILE_SINK =
  /(?:^|[\s;|&])(?:>>?|>\|)\s*(?!\/dev\/null)(\.\/|\.\.\/|\/|[A-Za-z0-9_./-])\S*/
const HAS_TEE_FILE =
  /\|\s*tee(?:\s+-a)?\s+(?!\/dev\/null)(\.\/|\.\.\/|\/|[A-Za-z0-9_./-])\S*/
const HAS_STDERR_FILE =
  /2\s*>\s*(?!&|\/dev\/null)(\.\/|\.\.\/|\/|[A-Za-z0-9_./-])\S*/
const EXECUTOR = /(^|[^A-Za-z0-9_-])(eval|xargs|(ba|z|k)?sh\s+-c|\$\(|`)/

function stripQuotedSpans(s: string): string {
  let out = ""
  let q = ""
  let i = 0
  const n = s.length
  while (i < n) {
    const c = s[i]
    if (!q) {
      if (c === "'" || c === '"') {
        q = c
      } else if (c === "\\" && i + 1 < n) {
        out += c + s[i + 1]
        i += 2
        continue
      } else {
        out += c
      }
    } else {
      if (c === "\\" && q === '"' && i + 1 < n) {
        i += 1
      } else if (c === q) {
        q = ""
      }
    }
    i += 1
  }
  return out
}

function scanText(command: string): string {
  if (EXECUTOR.test(command)) return command
  return stripQuotedSpans(command)
}

/** If the command executes a local script (e.g. `bash foo.sh`), read its
 *  content so the detector can also scan what runs *inside* the file. This
 *  closes the gap where `>/dev/null` was hidden inside a script rather than
 *  in the shell command itself. */
function scanScriptFile(command: string): string {
  const m = /(?:^|[\s;&|])(?:ba|z|k)?sh\s+(?:-[^\s]+\s+)?([^\s;|&]+\.sh)\b/.exec(command)
  if (!m) return ""
  try {
    return readFileSync(m[1], "utf-8")
  } catch {
    return ""
  }
}

function deny(command: string): string | null {
  if (process.env.MNM_DISABLE_STDERR_HOOK === "1") return null
  if (!command || !command.trim()) return null
  const scan = scanText(command) + "\n" + scanScriptFile(command)
  for (const pat of SILENCE) {
    if (pat.test(scan)) {
      return "PROHIBIDO: no se permite redirigir stderr a /dev/null (2>/dev/null, 2> /dev/null, 2>>/dev/null, &>/dev/null). En vez de /dev/null, usa `> out.log 2>&1` o `2>&1 | tee run.log` para preservar los errores.";
    }
  }
  if (ORDERED_BOTH_NULL.test(scan)) {
    return "PROHIBIDO: no se permite redirigir stderr a /dev/null (2>/dev/null, 2> /dev/null, 2>>/dev/null, &>/dev/null). En vez de /dev/null, usa `> out.log 2>&1` o `2>&1 | tee run.log` para preservar los errores.";
  }
  const remainder = scan.replace(ALLOWED_REVERSE, "")
  if (BARE_STDOUT_NULL.test(remainder)) {
    return "PROHIBIDO: no se permite redirigir stderr a /dev/null (2>/dev/null, 2> /dev/null, 2>>/dev/null, &>/dev/null). En vez de /dev/null, usa `> out.log 2>&1` o `2>&1 | tee run.log` para preservar los errores.";
  }
  const foldScan = scan.replace(ALLOWED_REVERSE, "")
  // stderr to a SEPARATE file is forbidden: separate error files get missed
  // in audits. Fold stderr into the same log instead.
  if (HAS_STDERR_FILE.test(foldScan)) {
    return "PROHIBIDO: redirigir stderr a un archivo separado (2> archivo). Los errores en archivo aparte se omiten en auditorías. Usa `> out.log 2>&1` o `2>&1 | tee run.log`. Tampoco redirijas stderr a /dev/null (2>/dev/null, 2> /dev/null, 2>>/dev/null, &>/dev/null).";
  }
  if (BARE_FOLD.test(foldScan)) {
    if (!(HAS_FILE_SINK.test(foldScan) || HAS_TEE_FILE.test(foldScan))) {
      return "PROHIBIDO: 2>&1 desnudo pliega errores en stdout sin sink de log. Usa archivos (`> out.log 2>&1`) o `cmd 2>&1 | tee run.log`. Tampoco redirijas stderr a /dev/null (2>/dev/null, 2> /dev/null, 2>>/dev/null, &>/dev/null).";
    }
  }
  return null
}

function firstHeader(markdown: string): string {
  const match = /^#\s+(.+)$/m.exec(markdown)
  return match ? match[1].trim() : ""
}

const NO_SQUASH_GH = /\bgh\s+pr\s+merge\b/
const NO_SQUASH_GIT = /\bgit\s+(?:-[^\s]+\s+)*merge\b/
const NO_SQUASH_FLAG = /(?:\A|[\s|&;(])(?:-[^\s]*)?--squash(?:\s|$)/
const NO_SQUASH_GIT_STRATEGY = /(?:\A|[\s|&;(])--strategy(?:\s*=\s*|\s+)squash(?:\s|$)/
const NO_SQUASH_GH_SHORTHAND = /(?:\A|[\s|&;(])-s(?:\s|$)/
const NO_SQUASH_EXECUTOR = /(^|[^A-Za-z0-9_-])(eval|xargs|(ba|z|k)?sh\s+-c|\$\(|`)/

function noSquashScan(command: string): string {
  if (NO_SQUASH_EXECUTOR.test(command)) return command
  let out = ""
  let q = ""
  for (let i = 0; i < command.length; i++) {
    const c = command[i]
    if (!q) {
      if (c === "'" || c === '"') q = c
      else out += c
    } else if (c === q) q = ""
  }
  return out
}

function denyNoSquash(command: string): string | null {
  if (process.env.MNM_DISABLE_NO_SQUASH_HOOK === "1") return null
  if (!command || !command.trim()) return null
  const scan = noSquashScan(command)
  const isGh = NO_SQUASH_GH.test(scan)
  const isGit = NO_SQUASH_GIT.test(scan)
  if (isGh && (NO_SQUASH_FLAG.test(scan) || NO_SQUASH_GH_SHORTHAND.test(scan))) {
    return "PROHIBIDO: squash merges están prohibidos — `--squash` colapsa historia y comentarios de commits. Usa `--merge` o `--rebase`."
  }
  if (isGit && (NO_SQUASH_FLAG.test(scan) || NO_SQUASH_GIT_STRATEGY.test(scan))) {
    return "PROHIBIDO: squash merges están prohibidos — `--squash` colapsa historia y comentarios de commits. Usa `--merge` o `--rebase`."
  }
  return null
}

export default {
  id: "local.mnm-no-stderr-redirect",
  setup: async (ctx: OpenCode.PluginContext) => {
    if (process.env.MNM_DISABLE_HARNESS !== "1") {
      const skillsRoot = join(TOOLKIT_ROOT, "skills")
      if (existsSync(skillsRoot)) {
        for (const dirEntry of readdirSync(skillsRoot, { withFileTypes: true })) {
          if (!dirEntry.isDirectory()) continue
          const skillFile = join(skillsRoot, dirEntry.name, "SKILL.md")
          if (!existsSync(skillFile)) continue
          const content = readFileSync(skillFile, "utf8")
          await ctx.skill.transform((editor: OpenCode.SkillEditor) => {
            editor.add({
              id: dirEntry.name,
              name: dirEntry.name,
              description: `Toolkit skill: ${firstHeader(content) || dirEntry.name}`,
              location: skillFile,
              content,
            })
          })
        }
      }

      const refsRoot = join(TOOLKIT_ROOT, "references")
      if (existsSync(refsRoot)) {
        for (const dirEntry of readdirSync(refsRoot, { withFileTypes: true })) {
          if (!dirEntry.isDirectory()) continue
          await ctx.reference.transform((editor: OpenCode.ReferenceEditor) => {
            editor.add(dirEntry.name, { type: "local", path: join(refsRoot, dirEntry.name) })
          })
        }
      }
    }

    await ctx.tool.hook("execute.before", (event: OpenCode.ExecuteBeforeEvent) => {
      if (event.tool !== "shell") return
      const command = (event.input as { command?: unknown })?.command
      if (typeof command !== "string") return
      // git push/merge to main guard (HITL bypass) — multi-harness pre-merge gate
      const tokens = (command || "").split(/\s+/).filter((t) => t.length > 0)
      if (tokens.some((t) => t === "push" || t === "merge") && tokens[tokens.length - 1] === "main") {
        const res = spawnSync("bash", [join(ADAPTER_DIR, "..", "..", "git", "pre-push.sh"), "main"], {
          env: { ...process.env, MNM_GIT_TARGET: "main" },
        })
        if (res.status === 2) {
          throw new Error("BLOCKED: push/merge to 'main' requires HITL human approval (pre-push guard). Bypass: set HITL_APPROVED=1 or create the HITL marker via human action.")
        }
      }
      const msg = deny(command)
      if (msg) throw new Error(msg)
      const squashMsg = denyNoSquash(command)
      if (squashMsg) throw new Error(squashMsg)
    })
  },
}
