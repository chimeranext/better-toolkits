/**
 * OpenCode V2 plugin — block shell commands that discard stderr AND surface the
 * hosting toolkit's skills + references so OpenCode2 sessions can use them.
 *
 * Blocking part disable mode: plugins: ["-local.mnm-no-stderr-redirect"] or
 * MNM_DISABLE_STDERR_HOOK=1. Skill/reference registration stays on (it is the
 * toolkit's OpenCode2 entry point); to skip it too, set MNM_DISABLE_HARNESS=1.
 *
 * Detector logic mirrors hooks/stderr/detect.py (keep in sync).
 */
import { Plugin } from "@opencode-ai/plugin"
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const ADAPTER_DIR = dirname(fileURLToPath(import.meta.url))
const TOOLKIT_ROOT = join(ADAPTER_DIR, "..", "..", "..")

const SILENCE =
  /(^|[^A-Za-z0-9])2\s*>>?\s*\/dev\/null\b|&\s*>>?\s*\/dev\/null\b|>&\s*\/dev\/null\b/
const ORDERED_BOTH =
  /(^|[^0-9&>])1?>>?\s*\/dev\/null\s+2>&1/
const BARE_STDOUT = /(^|[^0-9&>])1?>>?\s*\/dev\/null/
const ALLOWED_REVERSE = /2>&1\s*1?>>?\s*\/dev\/null/g
const BARE_FOLD = /2\s*>&\s*1/
const HAS_SINK =
  /(?:^|[\s;|&])(?:>>?|>\|)\s*(?!\/dev\/null)(\.\/|\.\.\/|\/|[A-Za-z0-9_./-])\S*|\|\s*tee(?:\s+-a)?\s+(?!\/dev\/null)/

function deny(command: string): string | null {
  if (process.env.MNM_DISABLE_STDERR_HOOK === "1") return null
  if (SILENCE.test(command)) {
    return "PROHIBIDO: no redirigir stderr a /dev/null. Usá archivos de log o tee."
  }
  if (ORDERED_BOTH.test(command)) {
    return "PROHIBIDO: >/dev/null 2>&1 descarta stderr. Usá 2>&1 >/dev/null o logs."
  }
  const rem = command.replace(ALLOWED_REVERSE, "")
  if (BARE_STDOUT.test(rem)) {
    return "PROHIBIDO: >/dev/null descarta la respuesta. Preferí out=$(cmd) o 2>&1 >/dev/null."
  }
  if (BARE_FOLD.test(command) && !HAS_SINK.test(command)) {
    return "PROHIBIDO: 2>&1 sin sink de log. Usá >all.log 2>&1 o 2>&1 | tee run.log."
  }
  return null
}

function firstHeader(markdown: string): string {
  const match = /^#\s+(.+)$/m.exec(markdown)
  return match ? match[1].trim() : ""
}

export default Plugin.define({
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
})