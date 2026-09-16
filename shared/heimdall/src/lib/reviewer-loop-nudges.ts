/**
 * Reviewer-loop nudge strings + adaptive second-pass budget — shared between
 * the provider-specific agent loops (`gemini-agent-loop.ts` and
 * `openai-agent-loop.ts`) so the fail-closed semantics introduced by * read identically on every reviewer lane.
 *
 * The reviewer loop has three forced-turn nudges:
 *
 *   1. FORCE_APPROVE_NUDGE — fired when the model completed NATURALLY (it
 *      stopped calling tools on its own) but never posted a review. A clean PR
 *      still gets a visible APPROVE. This is fail-OPEN by design and is correct:
 *      a natural stop with no findings IS a clean PR.
 *
 *   2. RESUME_AND_POST_NUDGE — fired when the primary loop EXHAUSTED its
 *      iteration budget without posting. The full diff is already in context;
 *      the nudge opens one adaptive second pass and tells the model to stop
 *      reading and post now.
 *
 *   3. FORCE_INCOMPLETE_COMMENT_NUDGE — last resort. Fired when even the second
 *      pass did not post. Forces a NON-approving COMMENT so an incomplete review
 *      is never rendered as a clean APPROVE (the inverse of the budget-
 *      exhaustion-rubber-stamps-APPROVE bug fixes).
 *
 * Tool-pinning is provider-specific (Gemini uses
 * `toolConfig.functionCallingConfig.mode="ANY"`, OpenAI-compatible lanes use
 * `tool_choice: { type:"function", function:{ name } }`), so the forced-turn
 * mechanism stays in each loop file. Only the wording + the second-pass budget
 * are shared here.
 *
 * NOTE: `gemini-agent-loop.ts` predates this module and declares its own copies
 * of these constants (plus an exported `SECOND_PASS_BUDGET`). Keep the two in
 * lockstep until that file is migrated to import from here; the wording here is
 * the canonical source going forward.
 *
 */

/**
 * Extra iteration budget for the adaptive second pass. Smaller than the primary
 * budget because the diff is already in the conversation — the second pass
 * should not re-read, only analyze and post. Mirrors the exported
 * `SECOND_PASS_BUDGET` in `gemini-agent-loop.ts`.
 */
export const SECOND_PASS_BUDGET = 6

/**
 * Nudge appended on the forced-APPROVE turn when no findings were posted after a
 * NATURAL loop completion. Fail-OPEN by design: a model that stopped on its own
 * with no findings reviewed a genuinely clean PR, so a visible APPROVE is
 * correct. Wording is richer than the historical OpenAI-lane copy so the forced
 * APPROVE body is substantive, matching the Gemini lane.
 */
export const FORCE_APPROVE_NUDGE =
  "You finished reviewing without posting a review. The diff has no blocking " +
  "issues. Call bifrost_github_review_post now with status APPROVE and an empty " +
  "comments array. The review_body MUST still be substantive — never a bare " +
  "'LGTM'. Include: a 1-2 line walkthrough of what the PR changes, which " +
  "files/areas you reviewed, and a one-line safety rationale. Since there are " +
  "genuinely no comments or suggestions, end with the verdict line 'Approved " +
  "— no findings.' (use 'no findings' only for a genuinely empty " +
  "review). Do not invent findings."

/**
 * Nudge opening the adaptive second pass. Fired ONLY when the primary loop
 * exhausted its iteration budget WITHOUT posting — the model has the full diff
 * in context but ran out of steps. Push it to stop reading and post now.
 */
export const RESUME_AND_POST_NUDGE =
  "You have read the PR but ran out of review steps before posting. The full " +
  "diff and your prior tool results are already in this conversation — do NOT " +
  "call bifrost_github_pr_read or re-fetch anything. Analyze what you already have " +
  "and call bifrost_github_review_post NOW with your findings (or APPROVE with an " +
  "empty comments array if the PR is genuinely clean). This is your final budget."

/**
 * Last-resort fail-CLOSED nudge. Fired when even the second pass did not post a
 * review. Forces a non-approving COMMENT so an incomplete review is never
 * rendered as a clean APPROVE — the inverse of the old bug where budget
 * exhaustion produced a false `Confidence: 5/5`.
 */
export const FORCE_INCOMPLETE_COMMENT_NUDGE =
  "You still have not posted a review after extra budget. Call " +
  "bifrost_github_review_post now with status COMMENT (NEVER APPROVE) and an empty " +
  "comments array. The review_body must state plainly that the automated review " +
  "could not be completed within its step budget and ask the author to re-trigger " +
  "it with '@heimdall review'. Do NOT approve — an incomplete review " +
  "must not look like a clean pass."
