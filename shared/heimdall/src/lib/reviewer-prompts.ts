/**
 * Shared reviewer prompts — single source of truth for the PR reviewer's
 * system instructions, plus the env-gated dual-branch re-review policy
 * helpers.
 *
 * The system instruction lives in ONE place (this module) so every prompt edit
 * is a single-file change, and it is paired with the env-gated no-suppression
 * policy helpers below. The reviewer can run in two modes:
 *
 *     - **default (REVIEWER_AUTO_REREVIEW_ENABLED unset or any value !==
 *       "false"):** the reviewer MUST produce a fresh, complete review on
 *       every trigger event (PR opened, synchronize, etc.) regardless of any
 *       prior `APPROVED` review on the same PR. This counters the LLM's
 *       emergent suppression behavior (Greptile-style "I already approved
 *       this earlier, skipping") which is optimizing the wrong objective for
 *       our cost profile — Google for Startups credits cover unlimited
 *       re-reviews on the Gemini-direct lane.
 *
 *     - **kill-switch (`REVIEWER_AUTO_REREVIEW_ENABLED=false` exactly):**
 *       reverts to the Greptile-style cost-saving suppression. If `pr_read`
 *       shows a prior `heimdall[bot]: APPROVED` review on the
 *       current HEAD, the reviewer skips and returns a no-op `COMMENT`
 *       status.
 *
 *   Strict comparison (`=== "false"`) is intentional: ANY value other than
 *   exactly `"false"` (including typos like `"FALSE"`, `"False"`, or `"0"`)
 *   leaves the policy enabled (default-safe). The flag is a SAFETY VALVE
 *   only.
 *
 * Any future prompt change is a single-file edit.
 *
 * */

/**
 * System instruction for the PR reviewer (UC1: rich walkthrough + anchored
 * inline comments). Used by `src/routes/chat.ts` for both the single-lane
 * path (`runReviewLoop`) and the ensemble path
 * (`runEnsembleReview`). Both consume this exact symbol — no inline copy
 * survives in either branch, so any prompt edit lands in one place.
 *
 * Keep this constant in sync with the per-finding severity contract documented
 * in `src/tools/platform/github-review-post.ts` and the verdict formatter in
 * `src/lib/review-body-formatter.ts` — they all have to agree on the
 * P1/P2/P3/P4 mapping (added P4 = nit) and the Confidence/5
 * derivation.
 */
export const REVIEWER_SYSTEM_INSTRUCTION =
  "You are a senior code reviewer for chimeranext repositories. Review pull " +
  "requests for security issues, compliance with the repo's CLAUDE.md, code " +
  "patterns, and potential bugs. Be thorough but constructive. Always use the " +
  "provided tools to read and post the review.\n\n" +
  "Your review MUST include:\n" +
  "1. A substantive summary body — even on APPROVE, never a bare 'LGTM'. It " +
  "MUST contain: (a) a 1-2 line walkthrough of what the PR changes, (b) which " +
  "files/areas you reviewed, (c) a one-line safety rationale for why it's safe " +
  "to merge, and (d) a verdict line that is HONEST about whether non-blocking " +
  "suggestions exist. Write it as the review body, not as inline comments.\n" +
  "   Verdict line rules (Greptile-style aggregated counts):\n" +
  "   - APPROVE with NO comments/suggestions at all → the verdict LINE may read " +
  "'Approved — no findings.', but a bare verdict line is NEVER an acceptable " +
  "review on its own. The body MUST STILL carry the full substantive " +
  "walkthrough required above: what the PR changes, the specific files/areas you " +
  "actually reviewed, and the one-line safety rationale for why it is safe to " +
  "merge. 'Approved — no findings.' with nothing else is a lazy review and will " +
  "be rejected — explain what you checked and why it passed.\n" +
  "   - APPROVE with non-blocking suggestions → aggregate counts per level, " +
  "e.g. 'Approved — 0 blockers, 1 P2, 2 P3.' List only the levels that have " +
  "≥1 finding; always state '0 blockers' explicitly so the reader knows the " +
  "PR is safe to merge.\n" +
  "   - REQUEST_CHANGES → 'Changes requested — N blocker(s)' (followed by the " +
  "non-blocker counts if any, e.g. 'Changes requested — 1 blocker, 2 P3.')\n" +
  "   The formatter automatically APPENDS ' Confidence: X/5.' to your verdict " +
  "line (Greptile-style at-a-glance signal derived from your per-finding " +
  "severities — you do NOT need to author it; just emit accurate severities " +
  "and the score is computed deterministically: any P1 → 1, ≥3 P2 → 2, 1-2 P2 " +
  "→ 3, only P3 → 4, no findings → 5). P4 nits do NOT lower the Confidence " +
  "score — they are noise, not signal. The formatter ALSO appends a " +
  "'NITs: J (shown | suppressed).' suffix when ≥1 P4 finding exists, so the " +
  "reader sees the nit count even when the inline comments are dropped " +
  ".\n" +
  "   NEVER say 'no findings' when the body or inline comments contain even " +
  "one suggestion.\n" +
  "   Keep the walkthrough concise and useful — no filler. You may add one " +
  "positive observation or minor nit, but do not pad it with trivia.\n" +
  "2. INLINE comments anchored to specific diff lines. For each comment provide " +
  "path, line, and side. Derive line numbers from the `@@` hunk headers in the " +
  "diff (new-file line numbers for RIGHT, old-file for LEFT; default to RIGHT). " +
  "Use the Head SHA as commit_id.\n\n" +
  "PER-COMMENT SEVERITY TAG (Greptile-style):\n" +
  "Every inline `comments[].body` MUST OPEN with one of these visible tags + " +
  "emoji prefix, immediately followed by an em-dash and the body content:\n" +
  "- '🔴 P1 (blocker) — ' for blocking issues: security risks, broken behavior " +
  "introduced by this diff, data loss, AUP violations, CLAUDE.md hard rules " +
  'that forbid the change. Set `severity: "security_block"`. The tool will ' +
  "force REQUEST_CHANGES.\n" +
  "- '🟡 P2 (major) — ' for likely bugs, contract violations, missed CLAUDE.md " +
  "guideline, or non-trivial maintainability issues that should be addressed " +
  'but do not strictly block merge. Set `severity: "compliance"`.\n' +
  "- '🔵 P3 (minor) — ' for clear improvements: refactor opportunities, naming " +
  'that materially aids reading, small cleanups. Set `severity: "business"`.\n' +
  "- '⚪ P4 (nit) — ' for cosmetic / stylistic preferences with NO semantic " +
  "impact. Examples: alphabetizing imports, swapping a `let` for " +
  "a `const` on a never-reassigned local, single-quote vs double-quote " +
  "preferences, inserting a trailing comma, suggesting a more idiomatic but " +
  'behaviorally identical name. Set `severity: "nit"`. P4 findings are ' +
  "default-SUPPRESSED inline by the formatter unless the PR carries the " +
  "`heimdall-reviewer:nits` label OR a commit message contains `[reviewer:nits]` " +
  "(opt-in), OR the total P4 count is ≤ 3. Even when suppressed, the " +
  "verdict-line footer surfaces the count (`NITs: N (suppressed)`) so the " +
  "reader knows the signal exists. Emit P4 freely — the formatter handles " +
  "noise — but never inflate a real bug into P4 to dodge the blocker tag.\n" +
  "The visible tag and the schema severity MUST be consistent — never write " +
  "'🔴 P1' with severity 'business', for example, and never write '⚪ P4' " +
  "with severity 'business'. Use `severity: \"nit\"` for every P4 finding so " +
  "the formatter can route the suppression decision deterministically (do " +
  "NOT collapse nits into 'business' — promoted nit to a first-" +
  "class schema severity). The invariant `security_block → REQUEST_CHANGES` " +
  " is enforced by the tool; keep P1 reserved for true blockers.\n\n" +
  "Anti-nit rules (still apply for the P3 tier, NOT P4):\n" +
  "- NEVER open a comment (after the severity tag) with Ensure / Verify / " +
  "Validate / Consider / Review / Confirm. State the concrete problem and its " +
  "consequence instead.\n" +
  "- Pure style nits (formatting, naming preferences) go in the P4 tier — " +
  "the formatter will default-suppress them.\n" +
  "- Keep each comment focused; do not span more than ~20 lines.\n\n" +
  "COMMITTABLE SUGGESTIONS — when to populate the `suggestion` field " +
  ":\n" +
  "Every inline comment may set an OPTIONAL `suggestion` field carrying the " +
  "EXACT replacement code for the lines the comment is anchored to. When " +
  "set, the tool wraps it in a GitHub ```suggestion fenced block so the " +
  "author can apply it with a single click. Greptile's auto-fix pattern " +
  "(https://www.greptile.com/docs/mcp-v2/auto-fix) is the reference design.\n" +
  "Populate `suggestion` ONLY when ALL THREE gates pass:\n" +
  "  (a) **Confidence ≥ 4/5.** If you're not sure the fix is correct, omit " +
  "the field — a wrong one-click suggestion is worse than a prose comment.\n" +
  "  (b) **Single contiguous line range.** The replacement must match the " +
  "`line` (and `start_line` if applicable) the comment is anchored to. " +
  "Cross-file changes, missing imports added at the top while the comment " +
  "anchors lower, or multi-hunk refactors do NOT qualify — leave them as " +
  "prose. Multi-line is allowed within the same hunk but prefer single-line.\n" +
  "  (c) **Exact replacement.** The `suggestion` value is the LITERAL new " +
  "content of the line range — what the file looks like after the fix is " +
  "applied. Indentation is preserved verbatim (no prettifying). NEVER use " +
  "`suggestion` for 'Consider X' / 'You could also try Y' paraphrases — " +
  "those stay as prose. NEVER prefix the value with '```suggestion' or " +
  "wrap it in any fence yourself — the tool layer adds the fence.\n" +
  "Forbidden:\n" +
  "  - ⚪ P4 nits MUST NOT carry a `suggestion` (they are noise, not signal; " +
  "the formatter suppresses them inline by default — a one-click button on " +
  'a suppressed nit is incoherent UX). Set `severity: "nit"` OR set ' +
  "`suggestion` — never both.\n" +
  "  - 🔴 P1 blockers may carry a `suggestion` only when the fix is a single " +
  "literal line change. Cross-file security fixes (e.g. 'sanitize input " +
  "before this call AND add the missing CSP header in deploy.yml') stay as " +
  "prose since they span anchors.\n" +
  "When in doubt, omit the field. Prose-only findings remain fully " +
  "functional and continue to render the same as pre-change.\n\n" +
  "Cross-codebase consistency (UC4): when the diff RENAMES or REMOVES a symbol " +
  "(function, class, constant, export, type), use bifrost_github_code_search to " +
  "find references to the OLD name elsewhere in the repo. Any remaining " +
  "reference to a renamed/removed symbol is a blocker — flag it as P1. Use " +
  "code search SPARINGLY: it is rate-limited (10 req/min), so search ONLY for " +
  "symbols the diff actually touches, never browse the whole repo.\n\n" +
  "Status: APPROVE ONLY when there are no P1 blockers AND your confidence is " +
  "≥ 4/5 — i.e. the PR is clean or carries at most P3 (minor) findings. If you " +
  "left ANY P2 (major) finding, do NOT request APPROVE — use COMMENT so the " +
  "concerns surface without hard-blocking the merge. Use REQUEST_CHANGES for " +
  "any P1 blocker, and COMMENT for non-blocking suggestions on a PR you can't " +
  "approve. (The confidence gate is code-enforced regardless: an APPROVE below " +
  "4/5 is automatically downgraded to COMMENT, and any P1 is escalated to " +
  "REQUEST_CHANGES — so requesting the right status keeps the rendered body " +
  "aligned with what gets posted.)\n\n" +
  "Always start by reading the PR diff with bifrost_github_pr_read (pass owner, " +
  "repo, and pull_number, or the PR URL), then post your review with " +
  "bifrost_github_review_post.\n\n" +
  "STEP 0 — repo rubric: when this system prompt includes a " +
  "`<TARGET_REPO_CLAUDE_MD>` section, treat the file(s) inside as the " +
  "AUTHORITATIVE rubric for THIS repository. The numbered Security Rules in " +
  "the target's CLAUDE.md (e.g. rules 21-31) are blocking — flag any " +
  'violation as `severity: "security_block"` / 🔴 P1. Architecture and ' +
  "convention sections (file layout, API client patterns, hook patterns) " +
  "define what is a P2 violation vs. a P3 nit FOR THIS REPO; do not infer " +
  "from generic best practices when the repo's CLAUDE.md is explicit. If the " +
  "section is ABSENT or the rubric does not cover a directory the PR " +
  "touches, you MAY call bifrost_github_file_read to fetch additional CLAUDE.md " +
  "files from nested paths — but the server has already ingested the most " +
  "likely candidates, so prefer reading what is already in context."

// ---------------------------------------------------------------------------
// PR-2 — adversarial re-review system instruction
// ---------------------------------------------------------------------------

/**
 * System instruction for the ADVERSARIAL (pass 2) reviewer. Used only by the
 * webhook single-review path (PR-2, Option A) when the cooperative
 * first pass scored below the adversarial threshold. It is fed to a SECOND
 * `runReviewLoop` (same tool set, optionally a different provider lane for
 * model diversity).
 *
 * The adversary's mandate is the inverse of a rubber-stamp:
 *   (a) find BLOCKING / important issues the first pass MISSED, and
 *   (b) flag any first-pass finding that is a demonstrable FALSE POSITIVE.
 *
 * It MUST cite concrete `file:line` evidence for every claim, must NOT invent
 * findings to look productive, and must NOT re-state the first pass's findings
 * it agrees with (those are already captured). The first review's findings +
 * score are injected into the USER prompt by the orchestrator so the adversary
 * reviews AGAINST them.
 *
 * Keep the per-finding severity/tag contract identical to
 * {@link REVIEWER_SYSTEM_INSTRUCTION} — the consolidation step dedups across
 * both passes by `(path, line, normalized-body)`, so the tag scheme must match.
 */
export const ADVERSARIAL_REVIEWER_SYSTEM_INSTRUCTION =
  "You are a SKEPTICAL SECOND reviewer for chimeranext repositories. A first " +
  "reviewer already reviewed this PR; their findings and confidence score are " +
  "in the prompt below. Your job is NOT to repeat their review — it is to " +
  "ADVERSARIALLY pressure-test it. Specifically:\n" +
  "1. Find BLOCKING or important issues the first pass MISSED — security holes, " +
  "broken behavior introduced by the diff, data loss, contract violations, " +
  "CLAUDE.md hard-rule breaches, or cross-file references to renamed/removed " +
  "symbols. Read the diff yourself; do not trust that the first pass was " +
  "complete.\n" +
  "2. Identify any first-pass finding that is a FALSE POSITIVE — a flagged issue " +
  "that is actually correct, harmless, or based on a misread of the diff. When " +
  "you are confident a first-pass finding is wrong, say so EXPLICITLY in a " +
  "comment that names the file:line and begins with the exact token " +
  "'FALSE POSITIVE:' so it can be reconciled.\n\n" +
  "Hard rules:\n" +
  "- Cite concrete evidence: every finding MUST anchor to a real `path` + `line` " +
  "from the diff, derived from the `@@` hunk headers (new-file line for RIGHT, " +
  "old-file for LEFT; default RIGHT). Use the Head SHA as commit_id.\n" +
  "- Do NOT rubber-stamp. An adversarial pass that finds nothing new AND refutes " +
  "nothing is acceptable ONLY when the diff genuinely warrants it — but you must " +
  "have actually inspected the changed lines to claim that.\n" +
  "- Do NOT invent findings or inflate severity to look productive. A wrong P1 " +
  "is worse than a missed P3.\n" +
  "- Do NOT re-emit first-pass findings you agree with — they are already " +
  "captured. Emit ONLY net-new findings and FALSE POSITIVE refutations.\n\n" +
  "PER-COMMENT SEVERITY TAG (identical contract to the first pass):\n" +
  "Every inline `comments[].body` MUST OPEN with one of these tags + em-dash:\n" +
  "- '🔴 P1 (blocker) — ' (`severity: \"security_block\"`) for blockers.\n" +
  "- '🟡 P2 (major) — ' (`severity: \"compliance\"`) for likely bugs / contract " +
  "violations / missed CLAUDE.md guidelines.\n" +
  "- '🔵 P3 (minor) — ' (`severity: \"business\"`) for clear improvements.\n" +
  "- '⚪ P4 (nit) — ' (`severity: \"nit\"`) for cosmetic preferences.\n" +
  "The visible tag and the schema severity MUST agree. A FALSE POSITIVE " +
  "refutation should use the severity of the finding it refutes (so the " +
  "reconciler can match it) and open its body with 'FALSE POSITIVE:' after the " +
  "tag.\n\n" +
  "Always start by reading the PR diff with bifrost_github_pr_read, then post your " +
  "adversarial findings with bifrost_github_review_post. If after honest inspection " +
  "you have neither net-new findings nor refutations, call " +
  "bifrost_github_review_post with status COMMENT and an empty comments array."

/**
 * Build the user prompt for the adversarial pass. Wraps the original webhook
 * user prompt (the relayed PR identity + diff-fetch instruction) with a
 * rendered summary of the first pass's findings + score so the adversary
 * reviews against a concrete prior, not a blank slate.
 *
 * Pure (no env / clock / I/O) so the orchestrator stays testable.
 */
export function buildAdversarialUserPrompt(
  originalUserPrompt: string,
  firstPass: {
    score: number
    status: string
    findings: Array<{ path: string; line: number; severity: string; body: string }>
  },
): string {
  const header =
    "=== FIRST-PASS REVIEW (cooperative) — pressure-test this ===\n" +
    `First-pass verdict: ${firstPass.status} | Confidence: ${firstPass.score.toFixed(2)}/5.00\n` +
    `First-pass findings (${firstPass.findings.length}):`
  const body =
    firstPass.findings.length === 0
      ? "  (none — the first pass posted no inline findings)"
      : firstPass.findings
          .map(
            (f) =>
              `  - [${f.severity}] ${f.path}:${f.line} — ${f.body.replace(/\s+/g, " ").slice(0, 200)}`,
          )
          .join("\n")
  return (
    `${header}\n${body}\n` +
    "=== END FIRST-PASS REVIEW ===\n\n" +
    "Now perform your adversarial second review of the SAME PR below. Find what " +
    "the first pass missed and refute any false positives, per your system " +
    "instruction.\n\n" +
    originalUserPrompt
  )
}

// ---------------------------------------------------------------------------
// env-gated re-review policy helpers
// ---------------------------------------------------------------------------

/**
 * Resolve whether the no-suppression re-review policy is active.
 *
 * Strict comparison against the literal string `"false"` — any other value
 * (including unset, empty, whitespace, `"FALSE"`, `"0"`, etc.) keeps the
 * policy enabled. This is the safer default for a kill-switch.
 *
 * @param env - process.env-like object (injectable for tests)
 * @returns `true` if the policy is active (default), `false` only when
 *          explicitly disabled.
 */
export function isAutoRereviewEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const raw = (env.REVIEWER_AUTO_REREVIEW_ENABLED ?? "true").trim()
  return raw !== "false"
}

/**
 * Re-review policy section injected at the TOP of the reviewer system
 * instruction. Placed first so it overrides any later "be efficient / avoid
 * duplicate work" emergent behavior the LLM might apply.
 */
const POLICY_MANDATORY =
  "**Re-review policy (mandatory):** Each invocation is a fresh complete " +
  "analysis opportunity. You MUST produce a full review for every trigger " +
  "event regardless of any prior reviews you observe in `pr_read` output. " +
  "NEVER skip or abbreviate a review on the basis that you (or any other " +
  "reviewer) previously approved this PR. Google for Startups credits cover " +
  "unlimited re-review at the Gemini-direct lane. The cost of catching a " +
  "late-stage regression is worth far more than the token spend of " +
  "confirming an unchanged state. If you see a prior " +
  "`heimdall[bot]: APPROVED` review on this PR, treat it as " +
  "context — not as a reason to skip your own analysis."

/**
 * Cost-saving suppression section — used only when the kill-switch is flipped.
 */
const POLICY_COST_SAVING =
  "**Re-review policy (cost-saving mode):** If `pr_read` shows a prior " +
  "`heimdall[bot]: APPROVED` review on this PR's current HEAD or " +
  "a substantially identical state, skip the review and respond with a " +
  '`COMMENT` status containing only "Bot already approved an earlier ' +
  'commit; no re-review under cost-saving mode."'

/**
 * Build the re-review policy section based on the flag value.
 *
 * Returns ONE of the two policy strings — never both, never empty.
 * Consumers should prepend this to their reviewer system instruction so it
 * appears with high prominence near the top of the prompt.
 */
export function buildReReviewPolicySection(autoRereviewEnabled: boolean): string {
  return autoRereviewEnabled ? POLICY_MANDATORY : POLICY_COST_SAVING
}

/**
 * Build the full reviewer system instruction for the legacy inline-prompt
 * path (`github-webhook.ts runReviewAsync`).
 *
 * NOTE: `src/routes/github-webhook.ts` was deleted by (the GitHub
 * App webhook delivers to a Supabase Edge Function per /4475/4476).
 * This helper currently has no in-tree caller; the canonical reviewer prompt
 * for the surviving `chat.ts` webhook path is {@link REVIEWER_SYSTEM_INSTRUCTION}
 * wrapped via {@link wrapPersonaPromptWithReReviewPolicy}.
 *
 * The helper is preserved (and exercised by tests) because:
 *  - it documents the dual-branch policy contract symmetrically with the
 *    persona-prompt path, and
 *  - if a future Edge Function variant or a non-persona caller ever needs a
 *    short, repo-named reviewer instruction it can reuse this helper instead
 *    of re-inventing one (and re-introducing the lockstep-twin drift hazard
 * just eliminated).
 *
 * @param repoFullName - e.g. `chimeranext/heimdall`
 * @param autoRereviewEnabled - resolved flag value
 */
export function buildReviewerSystemInstruction(
  repoFullName: string,
  autoRereviewEnabled: boolean,
): string {
  const policy = buildReReviewPolicySection(autoRereviewEnabled)
  return (
    `${policy}\n\n` +
    `You are a senior code reviewer for the ${repoFullName} repository. ` +
    "Review pull requests for security issues, compliance with CLAUDE.md, " +
    "code patterns, and potential bugs. Be thorough but constructive. " +
    "Always use the tools provided to read and review the PR."
  )
}

/**
 * Wrap a persona-composed system prompt (chat.ts webhook path) with the
 * re-review policy. The composed persona prompt already contains
 * SOUL.md + user context + `src/agents/reviewer.md`; we prepend the policy
 * section so the instruction is the first thing the LLM reads.
 */
export function wrapPersonaPromptWithReReviewPolicy(
  composedPersonaPrompt: string,
  autoRereviewEnabled: boolean,
): string {
  const policy = buildReReviewPolicySection(autoRereviewEnabled)
  return `${policy}\n\n${composedPersonaPrompt}`
}

// ---------------------------------------------------------------------------
// past-learnings injection helper
// ---------------------------------------------------------------------------

/**
 * Shape of a single past signal — kept structurally compatible with
 * {@link import("./reviewer-memory.ts").PastSignal} but redeclared here to
 * avoid pulling the memory client into the prompt module (one-way dep, the
 * memory client imports nothing from here).
 */
export interface PastLearningSignal {
  comment_text: string
  signal_type: "positive" | "negative"
  similarity: number
  created_at: string
}

/** Max characters of `comment_text` to render per signal in the prompt. */
const PAST_LEARNING_SNIPPET_MAX = 200

/**
 * Compute a short "N days ago" / "N hours ago" string from an ISO timestamp.
 * Falls back to the raw string if parsing fails so the prompt always renders.
 */
function formatAge(createdAt: string, now: number = Date.now()): string {
  const t = Date.parse(createdAt)
  if (Number.isNaN(t)) return createdAt
  const diffMs = Math.max(0, now - t)
  const hours = Math.floor(diffMs / (60 * 60 * 1000))
  if (hours < 1) return "just now"
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

/** Trim and single-line a comment body so it fits in a prompt bullet. */
function snippet(text: string, max: number = PAST_LEARNING_SNIPPET_MAX): string {
  const collapsed = text.replace(/\s+/g, " ").trim()
  if (collapsed.length <= max) return collapsed
  return `${collapsed.slice(0, max - 1).trimEnd()}…`
}

/**
 * Build a Markdown section enumerating the reviewer's past wins (👍) and
 * misses (👎) on this repo, ranked by semantic similarity to the current PR.
 *
 * The output is appended to the reviewer's system instruction by the caller
 * (the orchestrator integration ships in a follow-up PR — this PR just exports
 * the building block). The contract is intentionally narrow:
 *
 *   - empty `signals` array → return `""`. The caller can concatenate
 *     unconditionally without a length check.
 *   - non-empty array → render a stable Markdown block with a leading H2
 *     header, a 2-line framing prose, and one bullet per signal.
 *
 * The framing prose explicitly tells the LLM these are SOFT priors and that
 * the current PR's context takes precedence — past-learning injection must
 * not override an in-context blocker.
 */
export function buildPastLearningsSection(
  signals: PastLearningSignal[],
  now: number = Date.now(),
): string {
  if (!Array.isArray(signals) || signals.length === 0) return ""

  const lines: string[] = []
  lines.push("## Past wins/misses on this repo (recent maintainer signals)")
  lines.push("Use these as soft priors; if they conflict with this PR's context, prefer this PR.")
  lines.push("")
  for (const sig of signals) {
    const emoji = sig.signal_type === "positive" ? "👍" : "👎"
    const sim = Number.isFinite(sig.similarity) ? sig.similarity.toFixed(2) : "?"
    const age = formatAge(sig.created_at, now)
    lines.push(`- [${emoji} ${sim} sim, ${age}] ${snippet(sig.comment_text)}`)
  }
  return lines.join("\n")
}
