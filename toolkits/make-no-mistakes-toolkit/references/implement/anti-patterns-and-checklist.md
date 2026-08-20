Never-do table, completion checklist, and Slack summary.

## Anti-Patterns — NEVER Do These

| Anti-Pattern | Why It Fails |
|-------------|-------------|
| Implementing in the main working tree | Pollutes the base branch, blocks parallel work, no isolation |
| Reusing an existing branch for a new attempt | Carries stale commits, confuses reviewers, breaks clean history |
| Two sub-agents sharing a single worktree | File races, non-deterministic diffs. One worktree per agent, always. |
| Two sub-agents on the same branch | They overwrite each other's commits. One branch per agent, always. |
| Skipping Greptile re-review after fixes | You don't know if your fix introduced new issues |
| Merging with failing CI | Breaks {baseBranch} for everyone |
| Leaving worktrees on disk after merge | Disk bloat, stale state, confusion |
| Skipping rebase between issues | Merge conflicts compound |
| Running E2E headless | Tests pass locally, fail in real browser — false confidence |
| Putting all work in one giant PR | Unreviewable. >15 files = split by domain. |
| Merging / cleaning up without explicit user OK | Even when CI is green and the PR is approved, shared-state mutations (merge, Linear status, worktree removal) require explicit per-action user approval. The protocol authorizes file edits + commits + push + PR creation — not the destructive end of the lifecycle. |

## Completion Checklist

Before declaring ALL issues complete:

- [ ] Every issue is **Done** in Linear with merge comment (or explicitly left In Review by user)
- [ ] Every PR is merged and branch deleted (or explicitly left as Draft / open per user instruction)
- [ ] Every worktree is removed from disk (`git worktree list` shows only main) — or explicitly preserved per user instruction
- [ ] `{baseBranch}` is up to date (`git pull origin {baseBranch}`)
- [ ] No orphaned branches locally (`git branch --list` is clean)
- [ ] CI is green on {baseBranch} after all merges
- [ ] User explicitly approved each shared-state mutation (PR creation mode, merge, Linear → Done, worktree cleanup)

## Slack Notification

When all issues are complete, send a summary to the user via Slack MCP:
- Issues completed (with Linear links)
- PRs merged (with GitHub links)
- Any issues discovered during implementation that need follow-up
- Greptile confidence scores for each PR
