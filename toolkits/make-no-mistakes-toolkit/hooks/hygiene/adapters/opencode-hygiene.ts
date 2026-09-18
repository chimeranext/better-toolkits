/**
 * OpenCode V2 plugin — Linear create-hygiene + save Issue landing check +
 * ready-to-review-mergeable Stop gate (one coherent group).
 * Disable with plugins: ["-local.mnm-hygiene"], MNM_DISABLE_HYGIENE_HOOK=1,
 * or the global CLAUDE_DISABLE_PLUGIN_HOOKS=1.
 *
 * Mirrors (keep in sync):
 *   - hooks/hygiene/pre-linear-save-issue-hygiene.sh (execute.before, block
 *     CREATES missing triage metadata; opt-in per repo via
 *     `.claude/config/hygiene-hooks.json` -> `linear_create_hygiene: true`;
 *     updates carrying `id` pass through).
 *   - hooks/hygiene/post-linear-save-issue-state-landed.sh (execute.after,
 *     warn-only: requested state / triage fields that did NOT land).
 *   - hooks/hygiene/stop-prs-green.sh (session-idle event: while
 *     `.claude/.implement-prs` exists the session may not stop until every
 *     listed PR is non-draft and APPROVED by the reviewer bot with 0
 *     blockers/P1/P2. No state file -> no-op. gh/network failure ->
 *     fail open. All green -> state file deleted.)
 *
 * Stop mapping follows the opencode-hooks package convention (Stop runs on
 * the session-idle event): a red gate re-injects a prompt so the session
 * keeps working instead of stopping. Re-injection is skipped while the
 * state file is unchanged since the last check (no prompt loops).
 */
import { Plugin } from "@opencode-ai/plugin"
import { existsSync, readFileSync, unlinkSync, statSync } from "node:fs"
import { join } from "node:path"
import { execFileSync } from "node:child_process"

const REVIEWER_LOGIN = "code-reviewer"

function disabled(): boolean {
  return (
    process.env.MNM_DISABLE_HYGIENE_HOOK === "1" ||
    process.env.CLAUDE_DISABLE_PLUGIN_HOOKS === "1"
  )
}

function str(value: unknown): string {
  return typeof value === "string" ? value : ""
}

function repoRoot(): string {
  const envRoot = process.env.CLAUDE_PROJECT_DIR ?? ""
  if (envRoot && existsSync(envRoot)) return envRoot
  return process.cwd()
}

function isLinearSaveIssue(tool: string): boolean {
  return /linear/i.test(tool) && /save.?issue/i.test(tool)
}

// --- PreToolUse: create hygiene ---
function hygieneEnabled(): boolean {
  const path = join(repoRoot(), ".claude", "config", "hygiene-hooks.json")
  try {
    const parsed: unknown = JSON.parse(readFileSync(path, "utf8"))
    return (
      !!parsed &&
      typeof parsed === "object" &&
      (parsed as Record<string, unknown>).linear_create_hygiene === true
    )
  } catch {
    return false
  }
}

function checkCreateHygiene(input: unknown): string | null {
  const toolInput = (input ?? {}) as Record<string, unknown>
  if (toolInput.id !== undefined && toolInput.id !== null && toolInput.id !== "") {
    return null // updates pass through
  }
  const missing: string[] = []
  if (!str(toolInput.project)) missing.push("project (the pillar/product project this issue belongs to)")
  if (!str(toolInput.assignee)) missing.push('assignee (e.g. "me")')
  const priority = Number(toolInput.priority ?? 0)
  if (![1, 2, 3, 4].includes(priority)) {
    missing.push("priority (1=Urgent 2=High 3=Medium 4=Low — 0/absent lands in the no-priority view)")
  }
  const labels = toolInput.labels
  if (!Array.isArray(labels) || labels.length < 1) {
    missing.push("labels (at least one — Type/Component/Size)")
  }
  if (!str(toolInput.milestone)) {
    missing.push("milestone (the project milestone this issue belongs to — create one if none fits)")
  }
  const state = str(toolInput.state)
  if (!state) {
    missing.push('state (explicit — e.g. "Todo" / "In Progress"; absent defaults to the Backlog orphan view)')
  } else if (state.toLowerCase() === "backlog") {
    missing.push('state must not be "Backlog" — set an actionable state ("Todo" / "In Progress")')
  }
  if (missing.length === 0) return null
  return (
    `BLOCKED — Linear issue hygiene: every CREATE must declare full triage metadata (project, assignee, priority, labels, milestone, state) so no issue lands in an orphan/backlog view with incomplete triage.\n\n` +
    `Missing/invalid fields on this save_issue CREATE:\n${missing.map((f) => `  - ${f}`).join("\n")}\n\n` +
    `VERIFY post-write with get_issue — some Linear MCP relays silently no-op state/assignee/priority writes; surface manual flips if so.`
  )
}

// --- PostToolUse: landing check ---
function parseResponsePayload(result: unknown): Record<string, unknown> | null {
  const parse = (value: unknown): Record<string, unknown> => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>
    }
    if (typeof value === "string") {
      try {
        const parsed: unknown = JSON.parse(value)
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>
        }
      } catch {
        // not JSON
      }
    }
    return {}
  }
  const raw = parse(result)
  const content = Array.isArray(raw.content) ? raw.content[0] : undefined
  const inner = parse(
    content && typeof content === "object"
      ? (content as Record<string, unknown>).text
      : undefined,
  )
  const merged = { ...raw, ...inner }
  if (typeof merged.id !== "string" && typeof merged.identifier !== "string") return null
  return merged
}

function checkLanding(
  input: unknown,
  result: unknown,
): string | null {
  const toolInput = (input ?? {}) as Record<string, unknown>
  const landed = parseResponsePayload(result)
  if (!landed) return null
  const dropped: string[] = []
  const isCreate =
    toolInput.id === undefined || toolInput.id === null || toolInput.id === ""
  if (isCreate) {
    const reqProj = str(toolInput.project)
    const gotProj = str(landed.project ?? landed.projectId)
    if (reqProj && !gotProj) {
      dropped.push("project — requested, absent from the response. Re-apply with save_issue {id, project}.")
    }
    const reqMs = str(toolInput.milestone)
    const ms = landed.projectMilestone as Record<string, unknown> | string | undefined
    const gotMs = str(typeof ms === "object" && ms !== null ? (ms.id as unknown) : ms)
    if (reqMs && !gotMs) {
      dropped.push("milestone — requested, absent from the response. Re-apply with save_issue {id, milestone} (UUID, not name).")
    }
    const reqAsg = str(toolInput.assignee)
    const gotAsg = str(landed.assignee ?? landed.assigneeId)
    if (reqAsg && !gotAsg) {
      dropped.push("assignee — requested, absent from the response. Re-apply with save_issue {id, assignee}.")
    }
    const reqLbl = Array.isArray(toolInput.labels) ? toolInput.labels.length : 0
    const gotLbl = Array.isArray(landed.labels) ? landed.labels.length : 0
    if (reqLbl > 0 && gotLbl < reqLbl) {
      dropped.push(`labels — asked for ${reqLbl}, ${gotLbl} landed. Re-apply with save_issue {id, labels}.`)
    }
  }
  const reqState = str(toolInput.state).trim()
  let stateReason = ""
  if (reqState) {
    const landedStatus = str(landed.status).trim()
    const landedType = str(landed.statusType).trim()
    const isUuid = /^[0-9a-fA-F]*-[0-9a-fA-F]*-[0-9a-fA-F]*-[0-9a-fA-F]*-[0-9a-fA-F]*$/.test(reqState) && reqState.includes("-")
    if (!isUuid && (landedStatus || landedType)) {
      const reqLc = reqState.toLowerCase()
      const statusLc = landedStatus.toLowerCase()
      const typeLc = landedType.toLowerCase()
      const typeKeywords = new Set([
        "started", "unstarted", "completed", "canceled", "cancelled",
        "backlog", "triage", "duplicate",
      ])
      if (typeKeywords.has(reqLc)) {
        if (landedType && reqLc !== "backlog" && typeLc === "backlog") {
          stateReason = `requested type "${reqState}" but the issue landed in Backlog (status "${landedStatus}")`
        } else if (landedType && reqLc !== typeLc) {
          stateReason = `requested type "${reqState}" but the issue landed with type "${landedType}" (status "${landedStatus}")`
        }
      } else if (landedStatus) {
        if (reqLc !== "backlog" && (statusLc === "backlog" || typeLc === "backlog")) {
          stateReason = `requested "${reqState}" but the issue landed in Backlog`
        } else if (reqLc !== statusLc) {
          stateReason = `requested "${reqState}" but the issue landed in "${landedStatus}"`
        }
      }
    }
  }
  const parts: string[] = []
  if (dropped.length > 0) {
    parts.push(
      `─── Triage fields did NOT land on CREATE — WARN ───\n\nThe create was accepted and returned 200. These fields were in the request and are NOT in the issue:\n\n${dropped.map((d) => `  • ${d}`).join("\n")}`,
    )
  }
  if (stateReason) {
    parts.push(
      `─── Linear state did NOT land — WARN ───\n\nsave_issue ${stateReason}.\n\nThe Linear MCP relay SILENTLY and INTERMITTENTLY no-ops \`state\` writes made by NAME. Re-set the state with the explicit status ID, then VERIFY with get_issue.`,
    )
  }
  return parts.length > 0 ? `\n${parts.join("\n\n")}\n` : null
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

// --- Stop gate: prs-green on session idle ---
function ghPrView(repo: string, pr: string): Record<string, unknown> | null {
  try {
    const out = execFileSync(
      "gh",
      ["pr", "view", pr, "--repo", repo, "--json", "reviews,isDraft"],
      { encoding: "utf8", timeout: 30000 },
    )
    const parsed: unknown = JSON.parse(out)
    if (parsed && typeof parsed === "object") return parsed as Record<string, unknown>
  } catch {
    // gh/network failure -> fail open
  }
  return null
}

function countSeverity(headline: string, label: string): number {
  try {
    const hit = headline.match(new RegExp(`[0-9]+[ \\t]*${label}`, "i"))
    const n = hit?.[0]?.match(/[0-9]+/)?.[0]
    return n ? Number.parseInt(n, 10) : 0
  } catch {
    return 0
  }
}

/** Returns "green" (deletes the state file), { block } or { infra }. */
function checkPrsGreen(
  stateFile: string,
  currentRepo: string,
): "green" | { block: string } | { infra: true } {
  let lines: string[]
  try {
    lines = readFileSync(stateFile, "utf8").split("\n")
  } catch {
    return { infra: true }
  }
  const repos: string[] = []
  const numbers: string[] = []
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue
    const urlMatch = line.match(/github\.com\/([^/]+\/[^/]+)\/pull\/([0-9]+)/)
    if (urlMatch) {
      repos.push(urlMatch[1])
      numbers.push(urlMatch[2])
      continue
    }
    const numMatch = line.match(/([0-9]+)/)
    if (numMatch) {
      repos.push(currentRepo)
      numbers.push(numMatch[1])
    }
  }
  if (numbers.length === 0) return "green"
  const block = (reason: string): { block: string } => ({ block: reason })
  for (let i = 0; i < numbers.length; i++) {
    const pr = numbers[i]
    const repo = repos[i]
    const prJson = ghPrView(repo, pr)
    if (!prJson) return { infra: true } // gh/network failure -> fail open (no delete, no prompt)
    if (prJson.isDraft === true) {
      return block(`PR #${pr} is still a Draft`)
    }
    const reviews = Array.isArray(prJson.reviews) ? prJson.reviews : []
    const verdicts = reviews.filter(
      (r) => {
        const review = r as Record<string, unknown>
        const author = review.author as Record<string, unknown> | null
        if (!author || author.login !== REVIEWER_LOGIN) return false
        const body = typeof review.body === "string" ? review.body : ""
        return /\S/.test(body) || review.state !== "COMMENTED"
      },
    )
    const latest = verdicts[verdicts.length - 1] as Record<string, unknown> | undefined
    if (!latest) return block(`PR #${pr} has no review from ${REVIEWER_LOGIN} yet`)
    if (latest.state !== "APPROVED") {
      return block(`PR #${pr} latest ${REVIEWER_LOGIN} review is '${String(latest.state ?? "")}', not APPROVED`)
    }
    const body = typeof latest.body === "string" ? latest.body : ""
    const headline = body.split("\n").find((l) => /^(Approved|Comments|Changes requested|Blocked)\s*—/i.test(l)) ?? ""
    if (!headline) {
      return block(`PR #${pr} review has no parseable verdict headline ('<verdict> — <findings>')`)
    }
    let blockers = 0
    let p1 = 0
    let p2 = 0
    if (/—\s*no findings/i.test(headline)) {
      blockers = 0
    } else {
      const bHit = headline.match(/[0-9]+[ \t]+blockers?/i)?.[0]?.match(/[0-9]+/)?.[0]
      if (!bHit) {
        return block(`PR #${pr} verdict headline '${headline}' has no blocker count; refusing to guess`)
      }
      blockers = Number.parseInt(bHit, 10)
      p1 = countSeverity(headline, "P1\\b")
      p2 = countSeverity(headline, "P2\\b")
    }
    if (blockers > 0 || p1 > 0 || p2 > 0) {
      return block(`PR #${pr} is APPROVED but still reports ${blockers} blocker(s), ${p1} P1, ${p2} P2`)
    }
  }
  try {
    unlinkSync(stateFile)
  } catch {
    // best effort
  }
  return "green"
}

function currentRepo(): string {
  try {
    const out = execFileSync("gh", ["repo", "view", "--json", "nameWithOwner", "-q", ".nameWithOwner"], {
      encoding: "utf8",
      timeout: 15000,
    }).trim()
    return out || "unknown/unknown"
  } catch {
    return "unknown/unknown"
  }
}

type SessionPrompter = {
  prompt: (args: { sessionID: string; text: string }) => Promise<unknown>
}

type EventSubscription = {
  subscribe: (opts?: { signal?: AbortSignal }) => AsyncIterable<Record<string, unknown>>
}

export default Plugin.define({
  id: "local.mnm-hygiene",
  setup: async (ctx) => {
    await ctx.tool.hook("execute.before", (event) => {
      if (disabled()) return
      if (!isLinearSaveIssue(event.tool)) return
      if (!hygieneEnabled()) return
      const input = event.input as unknown
      if (typeof input !== "object" || input === null) return
      const msg = checkCreateHygiene(input)
      if (msg) throw new Error(msg)
    })
    await ctx.tool.hook("execute.after", (event) => {
      if (disabled()) return
      if (event.status !== "completed") return
      if (!isLinearSaveIssue(event.tool as string)) return
      const input = event.input as unknown
      if (typeof input !== "object" || input === null) return
      const warning = checkLanding(input, (event as { result?: unknown }).result)
      if (warning) appendWarning(event as { result?: unknown }, warning)
    })
    const session = ctx.session as unknown as SessionPrompter
    const events = ctx.event as unknown as EventSubscription
    const handled = new Map<string, number>()
    const controller = new AbortController()
    void (async () => {
      try {
        for await (const evt of events.subscribe({ signal: controller.signal })) {
          try {
            if (disabled()) continue
            if (!evt || evt.type !== "session.idle") continue
            const props = (evt.properties ?? {}) as Record<string, unknown>
            const sessionID = String(props.sessionID ?? props.sessionId ?? "")
            if (!sessionID) continue
            const stateFile = join(repoRoot(), ".claude", ".implement-prs")
            let mtime = 0
            try {
              if (!statSync(stateFile).isFile()) continue
              mtime = statSync(stateFile).mtimeMs
            } catch {
              continue
            }
            if (handled.get(sessionID) === mtime) continue
            const verdict = checkPrsGreen(stateFile, currentRepo())
            if (verdict !== "green" && !("infra" in verdict)) {
              handled.set(sessionID, mtime)
              await session.prompt({
                sessionID,
                text:
                  `[stop-prs-green] BLOCKED: ${verdict.block}.\n` +
                  `ready-to-review-mergeable requires every PR in .claude/.implement-prs to be non-draft and APPROVED by ${REVIEWER_LOGIN} with 0 blockers, 0 P1 and 0 P2 findings. ` +
                  `Read the bot findings, fix, push, and re-tag '@${REVIEWER_LOGIN} review'. Do not stop until the gate is green.`,
              })
            }
          } catch {
            // fail open: never break the session on hook errors
          }
        }
      } catch {
        // subscription ended; fail open
      }
    })()
    return () => controller.abort()
  },
})
