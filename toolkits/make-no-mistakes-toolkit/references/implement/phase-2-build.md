Build the change in the Phase 1 worktree, including product tests.

# Phase 2: Build

This phase stays inside the current `/implement` session. It does not start another `/implement`.

When Phase 0 left an OpenSpec change, run `/opsx-apply` in this worktree and walk that change's `tasks.md`. Product tests for the change are step 7 below. `/assurance:triage` runs later, from `/ready-to-review-mergeable`, after the PR exists.

5. **Build in the worktree.** Follow all project conventions from CLAUDE.md. If Phase 0 produced an OpenSpec change, `/opsx-apply` is the checklist runner: work `tasks.md` in order and keep file paths and commit messages inside the spec.

6. **If multiple approaches exist:**
   - Dispatch one sub-agent per approach via Mode A (each gets its own worktree automatically)
   - Run all approaches in parallel with `run_in_background: true`
   - Each approach may discover new issues — document them in its final report
   - Synthesize the best parts of multiple solutions if needed
   - Close losing sub-agent branches/PRs after synthesis

7. **Write the product tests this change needs.** Resolve the consumer stack and follow its convention record under [`shared/references/conventions/language/`](../../../../shared/references/conventions/language/) (language record, plus the framework child when one exists). The record's `## RULES` and `## GATES` name the levels and commands — format, unit, architecture, integration, browser, device, contract, mutation — whichever that record actually requires. A single E2E manifest (`test-suite.json`, Playwright-only, or headed Chrome) is one adapter, and only when that record or this change's `tasks.md` asks for that level.

   Evidence for those runs follows [`toolkits/assurance-toolkit/references/testing/protocol.md`](../../../../toolkits/assurance-toolkit/references/testing/protocol.md) and the testing spec in `openspec/changes/add-assurance-toolkit/`: collect the runner's output (JUnit, `flutter test` JSON, trace, or `qf collect`) and link it to the issue through the configured provider — Kiwi TCMS, Qase, or Qualflare (`qualflare.link`). `/assurance:triage` later checks that CI evidence; it does not choose the suite in this step.
