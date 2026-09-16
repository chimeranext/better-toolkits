/**
 * Review body formatter — shared helpers for the GitHub review post tool.
 *
 * Owns the visible-output layer of `bifrost_github_review_post`:
 *   - Per-severity grouping headers (P1 / P2 / P3 / P4-nit).
 *   - Aggregated verdict line ("Approved — 0 blockers, 1 P2, 2 P3.").
 *   - nit-suppression policy (`decideNitInclusion`, `applyNitPrefix`,
 *     `detectNitOptInTrigger`) — P4 findings default to summary-only with the
 *     verdict-line footer `NITs: J (shown | suppressed)` carrying the count.
 *   - Legacy "Total findings" footer kept for downstream grep consumers.
 *
 * Extracted to `src/lib/` so both reviewer paths share one canonical
 * implementation — `heimdall[bot]` flagged a P1 on PR #261 when
 * an earlier draft forked the function into the tool-registration
 * path while the headless reviewer executor in `github-tool-defs.ts` kept
 * running the OLD format. Same function in two files = silent divergence;
 * one canonical module = fix-by-construction.
 *
 * ─── Schema constraints ──────────────────────────────────────────────────────
 *
 *   • `severity` is a 4-value enum: `"security_block" | "compliance" |
 *     "business" | "nit"`. The VISIBLE tag scheme is also 4-valued
 *     (P1 / P2 / P3 / P4) with a 1↔1 map. `nit` is a first-class schema
 *     severity (rather than being inferred from body prose under the
 *     `business` bucket) so the formatter can deterministically route the
 *     suppression policy without parsing prose.
 *
 *   • `computeMergeabilityScore` is DETERMINISTIC, not LLM-authored, and
 *     CONTINUOUS — it returns a float in `[1, 5]` decayed per-finding (P2 −1.2,
 *     P3 −0.2; any P1 pins it to exactly 1). It is the BASE of the hybrid score.
 *
 *   • The hybrid score (Option C) layered an LLM-adjusted point on top: the
 *     `bifrost_github_review_post` schema now carries an OPTIONAL PR-level
 *     `confidence` field (1.0–5.0). `computeFinalScore` combines the
 *     deterministic base with the LLM value, clamped so the LLM can nudge the
 *     score ±`MAX_LLM_ADJUST` (0.5) AND never escape the per-severity
 *     `tierRange`. The tier ceiling/floor is LOAD-BEARING: it preserves the ≥4
 *     APPROVE gate (P2 ceiling 3.9 < 4) and the P1 invariant (P1 range
 *     [1,1]) no matter what the LLM emits. When `confidence` is absent the final
 *     score == the clamped deterministic base (byte-for-byte pre-change). The
 *     verdict line prints `X.XX/5.00` (`toFixed(2)`) plus a machine-readable
 *     `<!--bifrost:confidence:{...}-->` provenance marker.
 *
 *   • Footer "Total findings: X security, Y compliance, Z business" uses the
 *     SCHEMA vocabulary, not the visible P-tags. Kept for downstream `grep`
 *     consumers that parse the legacy format (Slack notifier, Linear
 *     attachment titles). Do NOT remove without auditing the consumers.
 *
 *   • Verdict resolution lives in `resolveReviewEvent` (single source of
 *     truth, called from `GitHubService.postReview`). Two gates: the
 *     security invariant (`security_block` ⇒ `REQUEST_CHANGES`, regardless of
 *     what the LLM requested) and the confidence gate (APPROVE below
 *     `APPROVE_CONFIDENCE_THRESHOLD` ⇒ `COMMENT`, NOT a hard block). The
 *     rendered body surfaces ONLY the security escalation explicitly via the
 *     "automatically escalated to REQUEST_CHANGES" notice — a confidence
 *     downgrade renders as a plain "Review Comments" header (it is not a
 *     security event). Test coverage lives in
 *     `tests/tools/github-review-post.test.ts` and
 *     `tests/lib/review-body-formatter.test.ts`.
 *
 * ─── Out-of-scope by design (future schema-change candidates) ────────────────
 *
 *   • Per-comment "agreement count" for the ensemble
 *     (e.g. `[gemini, kimi]` attribution) — separate schema extension.
 *
 * Feature lineage folded into this module:
 *  — Greptile-style per-finding severity tags
 *  — Nitpick severity tier (P4) + default-suppress
 *  — `bifrost_github_review_post` schema invariants
 *  — Hybrid confidence score (deterministic range + LLM point)
 */
import type { ReviewComment } from "./github-port.ts"

/**
 * Visible grouping header per schema severity. promoted `nit` to a
 * first-class schema severity (was previously inferred from the visible body
 * tag while collapsed under `business`), so the formatter can distinguish P3
 * from P4 without prose parsing.
 */
export const SEVERITY_LABELS: Record<ReviewComment["severity"], string> = {
  security_block: "🔴 P1 — Blockers",
  compliance: "🟡 P2 — Major",
  business: "🔵 P3 — Minor",
  nit: "⚪ P4 — Nitpicks",
}

/** Render order — blockers first, then advisory severities, nits last. */
export const SEVERITY_ORDER: ReviewComment["severity"][] = [
  "security_block",
  "compliance",
  "business",
  "nit",
]

/** Short verdict-line label per severity (verdict-line vocabulary). */
export const VERDICT_LABEL: Record<
  ReviewComment["severity"],
  { singular: string; plural: string }
> = {
  security_block: { singular: "blocker", plural: "blockers" },
  compliance: { singular: "P2", plural: "P2" },
  business: { singular: "P3", plural: "P3" },
  nit: { singular: "NIT", plural: "NITs" },
}

// ─── Nitpick suppression policy ──────────────────────────────────

/**
 * Threshold at or below which nits are inlined (with a `[NIT]` prefix
 * added by the formatter) even in default mode. Above this threshold the
 * inline comments are dropped and only a summary count appears in the
 * verdict footer. Per AC: "NOT as separate inline comments unless
 * count ≤ 3".
 */
export const NIT_INLINE_THRESHOLD = 3

/**
 * Outcome of the suppression decision for a given comment set + opt-in flag.
 * Returned by `decideNitInclusion` and threaded through `formatReviewBody`
 * so the verdict footer text + the rendered inline section agree on whether
 * nits are "shown" or "suppressed".
 */
export interface NitDecision {
  /** Total P4 findings the LLM emitted (regardless of inclusion). */
  count: number
  /**
   * `true` ⇒ render P4 findings inline (with `[NIT]` prefix when in default
   * mode); `false` ⇒ drop inline rendering, surface only the count.
   */
  include: boolean
  /**
   * Why nits were included or suppressed. Drives the verdict-footer suffix
   * (`shown` vs `suppressed`) and is exposed for tests + audit logging.
   *  - `"opt-in"`: caller passed `includeNits=true` (label / commit tag).
   *  - `"under-threshold"`: count ≤ `NIT_INLINE_THRESHOLD`, default-shown.
   *  - `"suppressed"`: count > threshold and no opt-in, hidden.
   *  - `"none"`: zero nits in the comment set; nothing to decide.
   */
  reason: "opt-in" | "under-threshold" | "suppressed" | "none"
}

/**
 * Decide whether to render P4 nit comments inline or summary-only.
 *
 * Policy:
 *  - `includeNits=true` (caller detected opt-in trigger) → always inline.
 *  - `includeNits=false` (default) → inline iff count ≤ `NIT_INLINE_THRESHOLD`.
 *  - Zero nits → trivially `none` and the footer suffix is omitted.
 *
 * The opt-in detection (PR label `heimdall-reviewer:nits` OR commit-message tag
 * `[reviewer:nits]`) lives OUTSIDE this module — the caller resolves it from
 * the webhook payload and passes the resolved boolean in.
 */
export function decideNitInclusion(comments: ReviewComment[], includeNits: boolean): NitDecision {
  const count = comments.filter((c) => c.severity === "nit").length
  if (count === 0) return { count: 0, include: false, reason: "none" }
  if (includeNits) return { count, include: true, reason: "opt-in" }
  if (count <= NIT_INLINE_THRESHOLD) {
    return { count, include: true, reason: "under-threshold" }
  }
  return { count, include: false, reason: "suppressed" }
}

/**
 * `[NIT]` prefix tag prepended to P4 comment bodies when they DO get
 * inlined. Mirrors the `[NIT]` convention from Greptile's nitpicks docs and
 * is detectable by downstream Slack notifier / Linear attachment titles
 * that want to deprioritize them.
 */
export const NIT_BODY_PREFIX = "[NIT] "

/**
 * Prepend the `[NIT]` prefix to a nit comment's body if it isn't already
 * present (idempotent — the LLM is also free to emit it itself). Non-nit
 * severities pass through unchanged.
 */
export function applyNitPrefix(comment: ReviewComment): ReviewComment {
  if (comment.severity !== "nit") return comment
  if (comment.body.startsWith(NIT_BODY_PREFIX)) return comment
  return { ...comment, body: `${NIT_BODY_PREFIX}${comment.body}` }
}

/** Per-P2 (major) penalty applied to the continuous mergeability score. */
export const P2_SCORE_WEIGHT = 1.2
/** Per-P3 (minor) penalty applied to the continuous mergeability score. */
export const P3_SCORE_WEIGHT = 0.2

/**
 * Compute the Greptile-style PR-level mergeability confidence score as a
 * CONTINUOUS float in `[1, 5]`, deterministically from the per-finding
 * severity counts. Derived from counts instead of LLM-authored so the same
 * finding profile always yields the same number — readers learn the scale
 * once and trust it across PRs.
 *
 * Formula (continuous successor to the integer scale):
 *
 *   - `>= 1` P1                → exactly `1`  (fix blockers first; the P1
 *                                invariant forces REQUEST_CHANGES per *                                regardless of the numeric score).
 *   - otherwise                → `clamp(5 - (countP2 * 1.2 + countP3 * 0.2), 1, 5)`.
 *
 * Why continuous: a flat integer that we then print as `3.00/5.00` would be
 * noise — the decimals would never vary. A genuine float lets two PRs with
 * different finding densities (e.g. 1 P2 vs 1 P2 + 3 P3) read as distinct
 * (3.80 vs 3.20) while keeping the legacy boundaries intact:
 *   - 0 findings        → 5.00  (was 5)
 *   - P3-only           → ≥ 4.0 region  (was 4; 1 P3 → 4.80)
 *   - 1-2 P2            → below the 4.0 APPROVE gate  (was 3; 1 P2 → 3.80)
 *   - 3+ P2            → deeper toward the floor  (was 2; 3 P2 → 1.40)
 * The P2 weight (1.2) is chosen so a SINGLE P2 already drops below the
 * `APPROVE_CONFIDENCE_THRESHOLD` (4) — preserving the Step-1 gate boundary
 * that 1-2 P2 findings downgrade an APPROVE to COMMENT.
 *
 * P4 nits are intentionally excluded from the score. A PR with only
 * nits is still 5.00/5.00 — the nits are surfaced via the verdict-footer
 * count, not by lowering the confidence number.
 *
 * LLM-authored override remains a future improvement — would require extending
 * the `bifrost_github_review_post` schema with an optional
 * `confidence` field. Deterministic derivation keeps the scale stable while
 * that schema change incubates.
 */
export function computeMergeabilityScore(comments: ReviewComment[]): number {
  const p1 = comments.filter((c) => c.severity === "security_block").length
  if (p1 >= 1) return 1

  const p2 = comments.filter((c) => c.severity === "compliance").length
  const p3 = comments.filter((c) => c.severity === "business").length
  const raw = 5 - (p2 * P2_SCORE_WEIGHT + p3 * P3_SCORE_WEIGHT)
  return Math.min(5, Math.max(1, raw))
}

/**
 * Minimum mergeability score required for an LLM-requested APPROVE to be
 * honored as a GitHub `APPROVE` review event. Below this, the review is
 * downgraded to `COMMENT` (see `resolveReviewEvent`).
 *
 * Set to `4` so that a PR with only P3 (minor) findings still APPROVEs
 * (score 4) while one carrying P2 (major) findings (score ≤ 3) does not —
 * it posts as `COMMENT` instead, surfacing the concerns without hard-blocking
 * merge the way `REQUEST_CHANGES` would.
 */
export const APPROVE_CONFIDENCE_THRESHOLD = 4

// ─── Hybrid confidence score (Option C) ──────────────────────────

/**
 * Maximum distance (in score points) that an LLM-supplied confidence may move
 * the final score away from the deterministic `computeMergeabilityScore` base.
 *
 * The LLM may nudge the printed score ±`MAX_LLM_ADJUST` around the base, but
 * the per-severity `tierRange` ceiling/floor ALWAYS wins (see
 * `computeFinalScore`). This is the load-bearing safety constant: it bounds the
 * LLM's influence so it can NEVER cross the ≥4 APPROVE gate or the P1
 * invariant no matter what number it emits.
 */
export const MAX_LLM_ADJUST = 0.5

/**
 * Deterministic per-severity score window. The `{ floor, ceiling }` is the
 * LOAD-BEARING half of the hybrid score: it preserves the ≥4 APPROVE
 * gate and the P1 invariant regardless of any LLM-supplied
 * confidence, because `computeFinalScore` clamps the final number into this
 * window AFTER applying the LLM nudge.
 *
 * Severity precedence (highest-severity tier wins, P4 nits ignored):
 *
 *   - `≥1 security_block` (P1) → `{ floor: 1, ceiling: 1 }`
 *       Forced to exactly 1. No LLM adjustment is possible — the P1 invariant
 *       always forces REQUEST_CHANGES.
 *   - else `≥1 compliance` (P2) → `{ floor: 1, ceiling: 3.9 }`
 *       Ceiling < 4 ⇒ a P2 PR can NEVER reach the APPROVE gate, even if the LLM
 *       emits 5. (The deterministic base for any P2 set is ≤ 3.8 < 3.9.)
 *   - else `≥1 business` (P3) → `{ floor: 4, ceiling: 4.9 }`
 *       Floor at the gate ⇒ a P3-only PR ALWAYS clears APPROVE, even if the LLM
 *       emits 1.
 *   - else (0 findings; P4 nits ignored) → `{ floor: 4.8, ceiling: 5 }`
 *       A clean PR stays in the top band.
 */
export function tierRange(comments: ReviewComment[]): { floor: number; ceiling: number } {
  if (comments.some((c) => c.severity === "security_block")) return { floor: 1, ceiling: 1 }
  if (comments.some((c) => c.severity === "compliance")) return { floor: 1, ceiling: 3.9 }
  if (comments.some((c) => c.severity === "business")) return { floor: 4, ceiling: 4.9 }
  return { floor: 4.8, ceiling: 5 }
}

/**
 * Compute the FINAL printed mergeability score (Option C — hybrid).
 *
 * Combines the deterministic `computeMergeabilityScore` base (the #310 point,
 * which graduates by finding count) with an optional LLM-supplied subjective
 * `llmConfidence`, clamped so the LLM can only nudge the score ±`MAX_LLM_ADJUST`
 * around the base AND never escape the per-severity `tierRange`:
 *
 *   base                = computeMergeabilityScore(comments)
 *   { floor, ceiling }  = tierRange(comments)
 *   if llmConfidence absent → clamp(base, floor, ceiling)   // == base by construction
 *   adjLow  = max(floor, base - MAX_LLM_ADJUST)
 *   adjHigh = min(ceiling, base + MAX_LLM_ADJUST)
 *   final   = clamp(llmConfidence, adjLow, adjHigh)
 *
 * Because the tier ceiling/floor bounds the result, the ≥4 APPROVE gate and the
 * P1 invariant hold for ANY value the LLM emits:
 *   - P1 → final is forced to 1 (range [1,1]).
 *   - P2 → final ≤ 3.9 < 4, so it can never APPROVE.
 *   - P3-only → final ≥ 4, so APPROVE is preserved.
 *
 * `computeMergeabilityScore` is intentionally left unchanged — it remains the
 * deterministic base and the no-LLM fallback.
 */
export function computeFinalScore(comments: ReviewComment[], llmConfidence?: number): number {
  const base = computeMergeabilityScore(comments)
  const { floor, ceiling } = tierRange(comments)
  if (llmConfidence == null) return Math.min(ceiling, Math.max(floor, base))
  const adjLow = Math.max(floor, base - MAX_LLM_ADJUST)
  const adjHigh = Math.min(ceiling, base + MAX_LLM_ADJUST)
  return Math.min(adjHigh, Math.max(adjLow, llmConfidence))
}

/**
 * Resolve the GitHub review EVENT to actually post, given the per-finding
 * comment set and the status the LLM requested. This is the single source of
 * truth for the verdict decision — both reviewer paths (the headless executor
 * in `github-tool-defs.ts` and the registered tool in
 * `src/tools/platform/github-review-post.ts`) defer to the final chokepoint
 * `GitHubService.postReview`, which calls this helper so they cannot drift.
 *
 * Two gates, in precedence order:
 *
 *  1. **P1 invariant:** any `security_block` finding forces
 *     `REQUEST_CHANGES`, regardless of the requested event. This is the
 *     load-bearing safety rule and always takes precedence.
 *
 *  2. **Confidence gate (follow-up, hybrid):** if the LLM
 *     requested `APPROVE` but `computeFinalScore(comments, llmConfidence) <
 *     APPROVE_CONFIDENCE_THRESHOLD`, the event is downgraded to `COMMENT`. We
 *     deliberately do NOT escalate to `REQUEST_CHANGES` here — 1-2 P2 findings
 *     should surface as non-blocking comments, not hard-block the merge. Only
 *     P1 hard-blocks.
 *
 *     The gate now reads the hybrid `computeFinalScore`: an
 *     LLM-supplied `llmConfidence` may nudge the score ±`MAX_LLM_ADJUST`, but
 *     the P2 tier ceiling (3.9 < 4) means a P2 PR can never APPROVE even if the
 *     LLM emits 5 — the gate holds by construction (see `tierRange`).
 *
 * Any non-APPROVE request with no P1 passes through unchanged.
 */
export function resolveReviewEvent(
  comments: ReviewComment[],
  requested: "APPROVE" | "REQUEST_CHANGES" | "COMMENT",
  llmConfidence?: number,
): "APPROVE" | "REQUEST_CHANGES" | "COMMENT" {
  // P1 invariant — overrides everything. Always first, unchanged.
  if (comments.some((c) => c.severity === "security_block")) return "REQUEST_CHANGES"
  // Confidence gate — APPROVE only when the hybrid final score clears the bar.
  if (
    requested === "APPROVE" &&
    computeFinalScore(comments, llmConfidence) < APPROVE_CONFIDENCE_THRESHOLD
  ) {
    return "COMMENT"
  }
  return requested
}

/**
 * Build the aggregated verdict line per / .
 *
 * Every verdict line ends with `Confidence: X.XX/5.00` derived from the
 * continuous `computeMergeabilityScore` — Greptile-style at-a-glance signal
 * for lectores que NO quieren parsear los counts individuales. The two
 * decimals are meaningful because the underlying score is a genuine float
 * (see `computeMergeabilityScore`), not a printed integer.
 *
 * Examples:
 *   - APPROVE, no comments        → "Approved — no findings. Confidence: 5.00/5.00."
 *   - APPROVE, 1 P2, 2 P3         → "Approved — 0 blockers, 1 P2, 2 P3. Confidence: 3.40/5.00."
 *   - REQUEST_CHANGES, 1 P1       → "Changes requested — 1 blocker. Confidence: 1.00/5.00."
 *   - REQUEST_CHANGES, 1 P1, 2 P3 → "Changes requested — 1 blocker, 2 P3. Confidence: 1.00/5.00."
 *
 * For APPROVE-with-findings we always state "0 blockers" explicitly so the
 * reader knows the PR is safe to merge at a glance.
 */
export function buildVerdictLine(
  comments: ReviewComment[],
  actualStatus: string,
  nitDecision?: NitDecision,
  /**
   * Optional LLM-supplied subjective confidence (1.0–5.0). When
   * present, it nudges the printed score within the deterministic tier window
   * (see `computeFinalScore`). When absent, the printed score equals the
   * clamped deterministic base — byte-for-byte identical to the pre-change
   * output.
   */
  llmConfidence?: number,
): string {
  const counts: Record<ReviewComment["severity"], number> = {
    security_block: comments.filter((c) => c.severity === "security_block").length,
    compliance: comments.filter((c) => c.severity === "compliance").length,
    business: comments.filter((c) => c.severity === "business").length,
    nit: comments.filter((c) => c.severity === "nit").length,
  }
  // Hybrid score: deterministic base, LLM-nudged within the tier
  // window. The marker below carries the full provenance for downstream tooling.
  const score = computeFinalScore(comments, llmConfidence)
  // nit count appears in the verdict line with an explicit shown
  // /suppressed suffix when nits exist, so the reader sees both the signal
  // (real findings) and the noise (nits) at a glance.
  const nitSuffix = buildNitSuffix(counts.nit, nitDecision)
  const marker = buildConfidenceMarker(comments, llmConfidence)
  const confidence = ` Confidence: ${score.toFixed(2)}/5.00.${nitSuffix}\n${marker}`

  if (actualStatus === "APPROVE" && comments.length === 0) {
    return `Approved — no findings.${confidence}`
  }

  // Special case: APPROVE with ONLY nits → keep the "no findings" prose
  // but surface the nit count via the suffix (treat nits as out-of-band).
  if (
    actualStatus === "APPROVE" &&
    counts.security_block === 0 &&
    counts.compliance === 0 &&
    counts.business === 0 &&
    counts.nit > 0
  ) {
    return `Approved — no findings.${confidence}`
  }

  if (actualStatus === "APPROVE") {
    // Always show "0 blockers" explicitly so the safety signal is visible.
    const parts: string[] = [
      `${counts.security_block} ${counts.security_block === 1 ? VERDICT_LABEL.security_block.singular : VERDICT_LABEL.security_block.plural}`,
    ]
    if (counts.compliance > 0) parts.push(`${counts.compliance} ${VERDICT_LABEL.compliance.plural}`)
    if (counts.business > 0) parts.push(`${counts.business} ${VERDICT_LABEL.business.plural}`)
    return `Approved — ${parts.join(", ")}.${confidence}`
  }

  // REQUEST_CHANGES (forced or explicit) or COMMENT
  const blockerLabel =
    counts.security_block === 1
      ? VERDICT_LABEL.security_block.singular
      : VERDICT_LABEL.security_block.plural
  const parts: string[] = [`${counts.security_block} ${blockerLabel}`]
  if (counts.compliance > 0) parts.push(`${counts.compliance} ${VERDICT_LABEL.compliance.plural}`)
  if (counts.business > 0) parts.push(`${counts.business} ${VERDICT_LABEL.business.plural}`)
  const prefix = actualStatus === "REQUEST_CHANGES" ? "Changes requested" : "Comments"
  return `${prefix} — ${parts.join(", ")}.${confidence}`
}

/**
 * Build the `NITs: J (shown | suppressed)` suffix appended after the
 * Confidence score. Returns an empty string when there are no nits — the
 * verdict line stays unchanged for PR sets that don't trigger the policy.
 *
 * If no `NitDecision` is supplied (legacy callers pre-change) the suffix
 * is also empty, preserving byte-for-byte compatibility with existing
 * P1/P2/P3 verdict-line tests.
 */
function buildNitSuffix(nitCount: number, decision?: NitDecision): string {
  if (nitCount === 0 || !decision || decision.reason === "none") return ""
  const state = decision.include ? "shown" : "suppressed"
  return ` NITs: ${nitCount} (${state}).`
}

/**
 * Build the machine-readable confidence provenance marker.
 *
 * Emitted on its own line right after the human-readable `Confidence: X.XX/5.00`
 * so downstream tooling (Slack notifier, Linear attachments, dashboards) can
 * parse the full hybrid breakdown — the final score, the deterministic tier
 * window, the deterministic base, and the LLM-supplied confidence — without
 * re-deriving anything.
 *
 * NOTE: this is a PLAIN HTML metadata comment, NOT a `bifrost:component` generative
 * UI marker — the frontend parser in
 * `src/components/platform/utils/parseComponentMarkers.ts` must NOT pick it up.
 * The `bifrost:confidence:` prefix is deliberately distinct from `bifrost:component:`.
 *
 * Shape:
 *   <!--bifrost:confidence:{"score":4.20,"floor":4,"ceiling":4.9,"base":4.80,"llm":4.2}-->
 *
 * `llm` is omitted entirely when no `llmConfidence` is supplied.
 */
function buildConfidenceMarker(comments: ReviewComment[], llmConfidence?: number): string {
  const { floor, ceiling } = tierRange(comments)
  const base = computeMergeabilityScore(comments)
  const score = computeFinalScore(comments, llmConfidence)
  const payload: Record<string, number> = {
    score: Number(score.toFixed(2)),
    floor,
    ceiling,
    base: Number(base.toFixed(2)),
  }
  if (llmConfidence != null) payload.llm = llmConfidence
  return `<!--bifrost:confidence:${JSON.stringify(payload)}-->`
}

/**
 * Format the review body with findings grouped by severity.
 *
 * `requestedStatus` is what the LLM asked for; `actualStatus` is the
 * post-invariant-check value (any `security_block` comment forces
 * REQUEST_CHANGES regardless of what the LLM requested). When they differ,
 * the rendered body surfaces the forced escalation explicitly.
 */
export function formatReviewBody(
  comments: ReviewComment[],
  requestedStatus: string,
  actualStatus: string,
  /**
   * Optional nit-suppression decision. When omitted, behavior is
   * byte-for-byte identical to pre-change for P1/P2/P3-only reviews (the
   * existing test suite asserts this). When P4 nits are present, callers
   * MUST pass the decision computed via `decideNitInclusion` so the verdict
   * footer + the rendered inline section agree on shown/suppressed.
   */
  nitDecision?: NitDecision,
  /**
   * Optional LLM-supplied subjective confidence (1.0–5.0), threaded
   * to `buildVerdictLine` so the printed score + marker reflect the hybrid
   * computation. Omitted ⇒ deterministic-only output (pre-change numbers,
   * plus the no-`llm` marker line).
   */
  llmConfidence?: number,
  /**
   * Optional substantive walkthrough authored by the reviewer LLM
   * (what the PR changes, files/areas reviewed, safety rationale). Rendered as
   * a `### Walkthrough` block immediately under the verdict header so a clean
   * APPROVE is never a bare verdict line with no evidence of review. The tool
   * layer enforces that a clean APPROVE supplies one (soft guard).
   */
  summary?: string,
): string {
  const sections: string[] = []
  const trimmedSummary = summary?.trim()
  const walkthrough = trimmedSummary ? `### Walkthrough\n\n${trimmedSummary}` : null

  // Header
  if (actualStatus === "APPROVE") {
    if (comments.length === 0) {
      sections.push(
        `## ✅ Approved\n\n${buildVerdictLine(comments, actualStatus, nitDecision, llmConfidence)}`,
      )
      if (walkthrough) sections.push(walkthrough)
      return sections.join("\n\n")
    }
    // APPROVE with non-blocking suggestions — show grouped findings + aggregated verdict.
    sections.push(
      `## ✅ Approved\n\n${buildVerdictLine(comments, actualStatus, nitDecision, llmConfidence)}`,
    )
    if (walkthrough) sections.push(walkthrough)
  } else {
    // Security escalation: a `security_block` finding forced REQUEST_CHANGES
    //. This is the ONLY case that warrants the "Security violation
    // detected" notice — a low-confidence APPROVE→COMMENT downgrade
    // (follow-up) is NOT a security event and must render as a plain
    // review-comments header.
    const wasSecurityEscalation =
      requestedStatus !== "REQUEST_CHANGES" &&
      actualStatus === "REQUEST_CHANGES" &&
      comments.some((c) => c.severity === "security_block")
    if (wasSecurityEscalation) {
      sections.push(
        "## 🔴 Changes Requested\n\n> ⚠️ **Security violation detected.** This review was automatically escalated to REQUEST_CHANGES.",
      )
    } else if (actualStatus === "REQUEST_CHANGES") {
      sections.push("## 🔴 Changes Requested")
    } else {
      sections.push("## 💬 Review Comments")
    }
    // Aggregated verdict line right under the header.
    sections.push(buildVerdictLine(comments, actualStatus, nitDecision, llmConfidence))
    if (walkthrough) sections.push(walkthrough)
  }

  // Group by severity (P1 → P2 → P3 → P4). P4 nits are skipped from the
  // grouped-findings section when the decision says "suppress" — only the
  // verdict-footer count remains.
  for (const severity of SEVERITY_ORDER) {
    if (severity === "nit" && nitDecision && !nitDecision.include) continue

    const group = comments.filter((c) => c.severity === severity)
    if (group.length === 0) continue

    sections.push(`### ${SEVERITY_LABELS[severity]}\n`)
    for (const comment of group) {
      sections.push(`- \`${comment.path}:${comment.line}\` — ${comment.body}`)
    }
  }

  // Footer with raw totals (kept for downstream consumers that grep these).
  // Note: `business context` is the legacy label for P3; nits get their own
  // term so consumers can tell them apart from the P3 bucket.
  const securityCount = comments.filter((c) => c.severity === "security_block").length
  const complianceCount = comments.filter((c) => c.severity === "compliance").length
  const businessCount = comments.filter((c) => c.severity === "business").length
  const nitCount = comments.filter((c) => c.severity === "nit").length

  const parts: string[] = []
  if (securityCount > 0) parts.push(`${securityCount} security`)
  if (complianceCount > 0) parts.push(`${complianceCount} compliance`)
  if (businessCount > 0) parts.push(`${businessCount} business context`)
  if (nitCount > 0) parts.push(`${nitCount} nit`)

  if (parts.length > 0) {
    sections.push(`---\n**Total findings:** ${parts.join(", ")} (${comments.length} total)`)
  }

  return sections.join("\n\n")
}

// ─── Committable suggestion rendering ───────────────────────────

/**
 * Render a comment body with the GitHub committable-suggestion fence appended.
 *
 * Contract:
 *  - `body` is returned unchanged when `suggestion` is undefined / null / empty
 *    string (whitespace-only suggestions are skipped — they'd render an empty
 *    "Apply" button with no replacement content).
 *  - When present, the suggestion is appended as a fenced ```` ```suggestion ````
 *    block, separated from the body by a blank line so GitHub's markdown parser
 *    recognizes the fence even if the body ends without a trailing newline.
 *  - Indentation INSIDE the fence is preserved VERBATIM — no trim, no dedent,
 *    no whitespace normalization. GitHub uses the literal fence contents as
 *    the replacement when the user clicks "Apply suggestion".
 *  - Idempotent: callers may invoke this safely whether or not `suggestion`
 *    was set; the policy lives in one place.
 *
 */
export function renderCommentBodyWithSuggestion(
  body: string,
  suggestion: string | undefined | null,
): string {
  if (suggestion === undefined || suggestion === null) return body
  // Whitespace-only suggestion would render an "Apply" button that commits an
  // empty replacement — almost certainly a model mistake. Skip silently and
  // let the prose body carry the finding.
  if (suggestion.trim() === "") return body
  return `${body}\n\n\`\`\`suggestion\n${suggestion}\n\`\`\``
}

/**
 * Count how many of the supplied comments carry a non-empty `suggestion`.
 * Used for Cloud Run telemetry (AC #4) so operators can track
 * suggestion-adoption per review without re-parsing comment bodies.
 */
export function countSuggestions(comments: ReviewComment[]): number {
  return comments.filter((c) => typeof c.suggestion === "string" && c.suggestion.trim() !== "")
    .length
}

// ─── Opt-in trigger detection ────────────────────────────────────

/**
 * PR label name that opts-in to nit visibility for a single PR.
 * Lower-case, colon-namespaced under the `heimdall-reviewer:` prefix to mirror
 * the convention Greptile uses (`greptile:nits`) and to leave room for
 * future toggle labels under the same namespace.
 */
export const NIT_OPT_IN_LABEL = "heimdall-reviewer:nits"

/**
 * Commit-message tag that opts-in to nit visibility. Matches the
 * `[reviewer:nits]` token anywhere in the commit message body — same shape
 * as the `[skip ci]` / `[ci skip]` convention so it composes with other
 * single-line markers without needing its own line.
 */
export const NIT_OPT_IN_COMMIT_TAG_RE = /\[reviewer:nits\]/i

/**
 * Detect whether the caller wants P4 nits posted inline for this PR.
 *
 * Returns `true` when EITHER:
 *  - the PR carries the `heimdall-reviewer:nits` label (case-sensitive match —
 *    GitHub labels are case-sensitive but practically lower-case), OR
 *  - any commit message in the PR contains `[reviewer:nits]` (case-insensitive,
 *    matches anywhere in the message body, same shape as `[skip ci]`).
 *
 * Both inputs are optional — passing neither (or empty arrays) returns
 * `false`, the default-suppress behavior.
 */
export function detectNitOptInTrigger(input: {
  labels?: readonly string[]
  commitMessages?: readonly string[]
}): boolean {
  const labels = input.labels ?? []
  if (labels.includes(NIT_OPT_IN_LABEL)) return true
  const messages = input.commitMessages ?? []
  return messages.some((msg) => NIT_OPT_IN_COMMIT_TAG_RE.test(msg))
}
