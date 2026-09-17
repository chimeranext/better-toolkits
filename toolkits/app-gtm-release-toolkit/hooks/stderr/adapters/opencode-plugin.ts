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

const ADAPTER_DIR = dirname(fileURLToPath(import.meta.url))
const TOOLKIT_ROOT = join(ADAPTER_DIR, "..", "..", "..")

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

function deny(command: string): string | null {
  if (process.env.MNM_DISABLE_STDERR_HOOK === "1") return null
  if (!command || !command.trim()) return null
  const scan = scanText(command)
  for (const pat of SILENCE) {
    if (pat.test(scan)) {
      return "PROHIBIDO: no se permite redirigir stderr a /dev/null (2>/dev/null, 2> /dev/null, 2>>/dev/null, &>/dev/null). Ejecuta el comando sin descartar stderr.";
    }
  }
  if (ORDERED_BOTH_NULL.test(scan)) {
    return "PROHIBIDO: no se permite redirigir stderr a /dev/null (2>/dev/null, 2> /dev/null, 2>>/dev/null, &>/dev/null). Ejecuta el comando sin descartar stderr.";
  }
  const remainder = scan.replace(ALLOWED_REVERSE, "")
  if (BARE_STDOUT_NULL.test(remainder)) {
    return "PROHIBIDO: no se permite redirigir stderr a /dev/null (2>/dev/null, 2> /dev/null, 2>>/dev/null, &>/dev/null). Ejecuta el comando sin descartar stderr.";
  }
  const foldScan = scan.replace(ALLOWED_REVERSE, "")
  if (BARE_FOLD.test(foldScan)) {
    if (!(HAS_FILE_SINK.test(foldScan) || HAS_TEE_FILE.test(foldScan) || HAS_STDERR_FILE.test(foldScan))) {
      return "PROHIBIDO: no se permite redirigir stderr a /dev/null (2>/dev/null, 2> /dev/null, 2>>/dev/null, &>/dev/null). Ejecuta el comando sin descartar stderr.";
    }
  }
  return null
}

function firstHeader(markdown: string): string {
  const match = /^#\s+(.+)$/m.exec(markdown)
  return match ? match[1].trim() : ""
}

export default {
  id: "local.mnm-no-stderr-redirect",
  setup: async (ctx) => {
    if (process.env.MNM_DISABLE_HARNESS !== "1") {
      const skillsRoot = join(TOOLKIT_ROOT, "skills")
      if (existsSync(skillsRoot)) {
        for (const dirEntry of readdirSync(skillsRoot, { withFileTypes: true })) {
          if (!dirEntry.isDirectory()) continue
          const skillFile = join(skillsRoot, dirEntry.name, "SKILL.md")
          if (!existsSync(skillFile)) continue
          const content = readFileSync(skillFile, "utf8")
          await ctx.skill.transform((editor) => {
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
          await ctx.reference.transform((editor) => {
            editor.add(dirEntry.name, { type: "local", path: join(refsRoot, dirEntry.name) })
          })
        }
      }
    }

    await ctx.tool.hook("execute.before", (event) => {
      if (event.tool !== "shell") return
      const command = (event.input as { command?: unknown })?.command
      if (typeof command !== "string") return
      const msg = deny(command)
      if (msg) throw new Error(msg)
    })
  },
}
