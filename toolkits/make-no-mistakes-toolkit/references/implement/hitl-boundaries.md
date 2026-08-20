Autonomous local work vs hard STOP gates for shared-state mutations.

## Authorization & Human-in-the-Loop Boundaries

`/implement` is authorized to drive local work end-to-end **without per-action approval**, but every shared-state mutation that materially affects others (a PR's review surface, a merge to `{baseBranch}`, an issue-tracker status flip, a local workspace deletion) requires an **explicit user OK at that exact step**. The protocol below treats these as hard STOP gates: surface the action, ask, wait for an explicit answer, then proceed.

### Autonomous (no per-action approval needed)

- All Phase 0–2 work: OpenSpec drafting, claiming the issue, creating the branch + worktree, the OpenSpec commit, implementation, local tests / lint / build.
- `git push` to `origin` in Phase 3.
- `gh pr create` — **but ONLY after the user has answered the PR open-state question** (see hard STOP #1 below).
- Re-pushing fix commits to address reviewer feedback on an already-open PR (the PR exists and the user already chose its mode).

### Hard STOP — must ask the user explicitly

1. **PR open state (runtime question, every PR)** — right before `gh pr create`, the agent MUST call `AskUserQuestion` with:

   > **"How should we open the PR? / ¿Cómo abrimos el PR?"**
   >
   > - **Draft**: Opens as a draft PR. Agent stops immediately after creation. User flips to Ready themselves when satisfied. No reviewer pings.
   > - **In Review**: Opens ready-for-review. Agent tags Greptile / CodeRabbit / Graphite, addresses feedback by pushing fix commits, then STOPS at the merge boundary for user approval.
   > - **Ready to Merge**: Opens ready-for-review, runs through the reviewer loop, AND auto-merges once all CI gates are green. No further user approval at the merge boundary.

   Store the answer — it drives Phase 3 + Phase 4 downstream behavior.

2. **`gh pr merge`** — STOP unless the user pre-authorized "Ready to Merge" mode at PR creation. Even in "Ready to Merge" mode, surface the merge attempt's expected outcome before triggering it (e.g., "all checks green; merging squash with branch delete in 5s").

3. **Linear status → Done** — STOP, always. Even after a successful auto-merge, ask the user before flipping Linear from In Review to Done. The user reserves the right to keep an issue in "In Review" until they personally verify the deploy or staging.

4. **`git worktree remove`** — STOP, always. The worktree is the user's local workspace state; they may want to inspect or salvage something before cleanup.

### Sub-agent exception (applies to all four hard STOP gates above)

`AskUserQuestion` is an **orchestrator-only** surface — it renders inside the user's main conversation and is not available to background sub-agents dispatched via the `Agent` tool. At every hard STOP gate listed above (and every `AskUserQuestion` / "STOP and ask the user" call site in the protocol below):

- **If running as the orchestrator**: call `AskUserQuestion` directly (or its equivalent), wait for the answer, then continue.
- **If running as a sub-agent**: do NOT attempt `AskUserQuestion`. Instead, emit a structured pause signal in your final report and halt. Use this exact shape so the orchestrator can detect and relay:

  ```json
  {
    "pause": {
      "gate": "pr-open-state" | "merge" | "linear-done" | "worktree-cleanup",
      "issue_id": "<issue-id>",
      "reason": "<one-sentence explanation>",
      "question": "<the exact question to surface to the user>",
      "options": ["<option-1>", "<option-2>", "..."],
      "context": { "pr_url": "...", "branch": "...", "worktree_path": "..." }
    }
  }
  ```

  The orchestrator then calls `AskUserQuestion` on the sub-agent's behalf, captures the user's choice, and relays it back via `SendMessage`. The sub-agent resumes from where it halted. Attempting `AskUserQuestion` from a sub-agent results in a silent hang or runtime error — never do it.

Default posture: when uncertain whether an action is local or shared-state, treat it as shared-state and ask.
