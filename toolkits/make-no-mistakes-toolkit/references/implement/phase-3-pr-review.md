PR open-state HITL, create PR, reviewer loop, CI, conflicts.

# Phase 3: PR + Review Loop

8a. **HARD STOP — ask the user the PR open state** (see "Authorization & Human-in-the-Loop Boundaries" → hard STOP #1):

   > **Sub-agent note:** If you are running as a background sub-agent, do NOT call `AskUserQuestion`. Emit the `pause` JSON signal documented under "Sub-agent exception" (gate: `"pr-open-state"`) and halt. The orchestrator will relay the answer back. Orchestrators continue:

   Call `AskUserQuestion`:

   > Question: **"How should we open the PR? / ¿Cómo abrimos el PR?"**
   >
   > Options:
   > - **Draft** — opens as a draft, no reviewer pings, agent STOPS immediately after PR creation. User flips to Ready themselves.
   > - **In Review** — opens ready-for-review, agent tags Greptile / CodeRabbit / Graphite, addresses feedback by pushing fix commits, then STOPS at the merge boundary for explicit user OK.
   > - **Ready to Merge** — same as In Review through the reviewer loop, plus auto-merges once all CI gates are green (no extra approval at the merge boundary, but the agent still surfaces merge intent in chat 1–2 lines before triggering).

   Store the answer as `{pr-open-state}`. It drives downstream behavior in steps 8, 9, 10, 13, 14, and 15:

   - **Draft** → step 8 uses `--draft`; steps 9–13 are skipped; **steps 14 and 15 always run** (the Linear → Done and worktree-cleanup HITL gates apply regardless of mode). After PR creation, report the PR URL, then proceed straight to step 14.
   - **In Review** → step 8 opens ready-for-review; proceed through steps 9–12, then STOP at step 13 and ask for explicit go-ahead before merging. Steps 14 and 15 follow.
   - **Ready to Merge** → step 8 opens ready-for-review; proceed through steps 9–12, surface merge intent at step 13 (1–2 lines), then merge without extra approval. Steps 14 and 15 follow.

   Do not skip 8a. Do not infer the mode from context. Do not pick a default. Always ask for every **new** PR (one-time, at creation — not on subsequent fix-commit re-pushes to an already-open PR, where the user already chose its mode).

8. **Create the PR** (using the mode chosen in 8a):
   ```bash
   # Draft mode:
   gh pr create --base {baseBranch} --draft --title "{issue-id}: {concise title}" --body "..."
   # In Review / Ready to Merge mode:
   gh pr create --base {baseBranch} --title "{issue-id}: {concise title}" --body "..."
   ```
   - Link the Linear issue in the PR body
   - Add "Created by Claude Code on behalf of @{user}"
   - If Draft mode: report the PR URL to the user, then jump directly to step 14 (the Linear → Done and worktree-cleanup HITL gates apply regardless of mode). Phase 3's review-and-merge body (steps 9–13) is skipped.

9. **Tag ALL reviewers** (SKIP this step for Draft mode):
   - Comment `@greptile review` on the PR
   - Wait for automated reviews from **Greptile**, **CodeRabbit**, and **Graphite**
   - All three reviewers are configured in the project — check all of them

10. **Fix reviewer feedback** (applies to In Review + Ready to Merge only; SKIP for Draft):
    - Address ALL insights from Greptile, CodeRabbit, AND Graphite
    - Commit fixes to the same branch
    - Re-tag: `@greptile review` again if needed
    - Target: Greptile confidence **≥ 3/5**, CodeRabbit no critical issues, Graphite no blockers
    - If a reviewer doesn't respond within 5 minutes, proceed but note it to the user

11. **Verify CI:**
    ```bash
    gh pr checks {pr-number} --watch
    ```
    - ALL checks must pass before proceeding
    - If CI fails, fix and push — do not skip

12. **Check merge conflicts:**
    ```bash
    gh pr view {pr-number} --json mergeable
    ```
    - If conflicts exist, rebase onto {baseBranch} and resolve
    - Never force-merge over conflicts
