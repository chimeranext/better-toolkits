Merge + Linear Done + worktree cleanup HITL gates; sync for next issue.

# Phase 4: Merge + Cleanup

> **Mode-gating reminder:** Step 13 (`gh pr merge`) only runs for **In Review** and **Ready to Merge** PRs. **Draft mode skips step 13 but still runs steps 14 and 15** — the Linear → Done and worktree-cleanup HITL gates are inviolable and fire regardless of mode (see "Hard STOP #3" and "Hard STOP #4"). For Draft PRs, jump from step 8 directly to step 14.

13. **Merge the PR** (HITL gate per "Hard STOP #2") — **In Review + Ready to Merge only; skipped for Draft**:
    - **In Review mode** → STOP and ask the user: "Ready to merge? CI is green: `<one-line summary of checks + reviewer states>`." Wait for an explicit OK before running `gh pr merge`. _Sub-agents: emit a `pause` signal with gate `"merge"` instead — see "Sub-agent exception"._
    - **Ready to Merge mode** → Surface merge intent in chat (1–2 lines, e.g., "All checks green; merging squash with branch delete in 5s.") then proceed without an additional approval prompt.
    - **Draft mode** → This step does not run; proceed to step 14.
    ```bash
    gh pr merge {pr-number} --squash --delete-branch
    ```

14. **Update Linear** (HITL gate per "Hard STOP #3" — applies regardless of mode):
    - **In Review / Ready to Merge** → STOP and ask: "Merge done. Mark `{issue-id}` as **Done** in Linear, or leave it **In Review** for your verification?"
    - **Draft** → STOP and ask: "Draft PR opened at `<URL>`. Keep `{issue-id}` as **In Progress** in Linear, or move it to **In Review** for visibility?" (Draft PRs never auto-flip to Done — they're explicitly held open by the user.)
    - Only flip the status on explicit OK. If the user opts to leave the current status, post the status comment anyway and move on.
    - Status comment: "Merged via PR #{pr-number}" (In Review / Ready to Merge) or "Draft PR opened: #{pr-number}" (Draft).
    - _Sub-agents: emit a `pause` signal with gate `"linear-done"` instead of calling `AskUserQuestion`. See "Sub-agent exception"._

15. **Clean up worktrees** (HITL gate per "Hard STOP #4" — applies regardless of mode):
    - **In Review / Ready to Merge** → STOP and ask: "Merge done. Remove the worktree at `.claude/worktrees/{issue-id}`, or keep it for inspection?"
    - **Draft** → STOP and ask: "Draft PR opened at `<URL>`. The worktree at `.claude/worktrees/{issue-id}` is still live so you can iterate. Remove it now, or keep it until you flip the PR to Ready?" Default expectation: keep it.
    - Only run the removal on explicit OK.
    - _Sub-agents: emit a `pause` signal with gate `"worktree-cleanup"` instead of calling `AskUserQuestion`. See "Sub-agent exception"._
    ```bash
    git worktree remove .claude/worktrees/{issue-id} --force
    # Verify ALL worktrees for this issue are removed
    git worktree list
    git worktree prune
    ```

16. **Sync before next issue:**
    ```bash
    git checkout {baseBranch}
    git pull origin {baseBranch} --rebase
    ```

17. **Repeat** from Phase 1 for the next issue.
