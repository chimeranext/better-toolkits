Run multiple independent Linear issues in parallel with isolation.

## Parallel Execution

When processing multiple independent issues, run them in parallel — each in its own git worktree, so branches never collide and PRs stay isolated. Two mechanisms are available; **prefer Mode A** for day-to-day work.

### Mode A — Inline sub-agent dispatch (preferred)

From within a running Claude Code session, dispatch one background sub-agent per independent issue using the `Agent` tool. Each sub-agent gets its own worktree automatically. The orchestrator (you) stays in the foreground and continues on another task, then receives a notification when each sub-agent completes.

```text
Agent(
  description: "Implement APP-1234",
  subagent_type: "general-purpose",
  model: "opus",
  isolation: "worktree",     // auto-creates a fresh worktree for this agent
  run_in_background: true,   // non-blocking; you get a notification on completion
  prompt: "<full self-contained brief — see 'Briefing' below>",
)
```

Why this is the default:
- Single session, no shell juggling or extra CLI invocation.
- The orchestrator can keep working on a third issue while two agents run.
- Completion is delivered as a `<task-notification>` inside the orchestrator's context — no polling needed.
- Each sub-agent's worktree is locked and isolated, so parallel edits never conflict.

### Mode B — Agent Teams CLI (experimental, legacy)

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
claude --team "Implement ALT-13, ALT-14, ALT-15 in parallel with worktree isolation"
```

Use this only when you explicitly want a separate top-level session per teammate (e.g., different model selection per agent, or longer-running work that outlives the current session). For most issues Mode A is cheaper and simpler.

### When to parallelize vs. run sequentially

- **Parallelize (Mode A or B)**: 2+ issues with no dependency between them (e.g., ALT-15 + ALT-16 + ALT-37). Different repos, different domains, or clearly independent pieces of the same codebase.
- **Sequential**: Issues with explicit dependency links (`blockedBy`, `blocks`) in Linear, or when a later PR would almost certainly conflict with an earlier one.
- **Hybrid**: Launch independent issues in parallel, then chain dependent ones sequentially after the first merges (rebase the dependent branch onto updated `{baseBranch}` before resuming).

### Briefing parallel agents

A background sub-agent starts with zero conversation context. Its prompt must be fully self-contained:

- **What**: the exact Linear issue ID(s) and a one-paragraph restatement of the goal.
- **Why**: the business/technical motivation, so the agent can judge trade-offs.
- **Where**: relevant file paths, repo root, base branch, branch naming pattern.
- **Resources**: secret names for GCP/secret-manager lookups, Sentry/Linear/Slack channel IDs, test credentials (staging only).
- **Hard constraints**: never-touch-prod rules, file-count limit (`15-File Rule`), sensitive-table blocklists, CLAUDE.md rules that apply.
- **Known parallel work**: other agents running concurrently and what they own, so the agent doesn't collide on files or open conflicting PRs.
- **Deliverable shape**: final report format expected back (Linear state, PR link, Sentry state, Slack channel).
- **PR state question**: at the push/PR boundary, the sub-agent must report back to the orchestrator (NOT ask the user directly — only the orchestrator has the `AskUserQuestion` surface in the main conversation). The orchestrator then asks the user the Draft / In Review / Ready to Merge question and relays the answer to the sub-agent via `SendMessage`. The sub-agent halts at the PR-creation step until that relay arrives. Same hand-off applies to the Phase 4 HITL gates (merge, Linear → Done, worktree cleanup).

Terse prompts produce shallow, generic work. Assume you won't be able to clarify mid-run — brief the agent like a smart colleague who just walked in.

### Coordination rules for parallel execution

- Each sub-agent gets its own worktree (Mode A does this automatically; Mode B requires explicit worktree setup per teammate).
- The orchestrator monitors notifications and resolves any cross-agent conflicts.
- **PR creation runs fine in parallel** when agents are on different branches (different refs = no race). Only serialize PR creation when two agents touch the same branch (they shouldn't — one agent per branch).
- Wait for all agents to finish before declaring the batch complete, then sync `{baseBranch}` once.
