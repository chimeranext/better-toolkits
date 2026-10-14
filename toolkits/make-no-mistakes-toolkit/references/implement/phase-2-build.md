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

7. **Write tests:**
   - Model E2E test cases with Slack MCP first (plan them in a test channel or thread)
   - Split test cases: some for **Playwright**, others for **Chrome DevTools MCP**
   - Browser ALWAYS in focus. **NEVER headless.** Both Playwright and Chrome DevTools MCP.
   - Plan to merge E2E tests sequentially (not in parallel)
   - If the project has `pubspec.yaml` (Flutter project detected):
     - Run `flutter build web` before browser-based E2E tests
     - Serve the build with `dart run dhttpd --path build/web --port 8080` or `python3 -m http.server 8080 -d build/web`
     - Point Chrome DevTools MCP / Playwright to `http://localhost:8080`
