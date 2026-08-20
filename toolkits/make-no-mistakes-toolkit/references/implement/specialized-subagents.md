Pick the right subagent type per protocol phase. Map names per harness if needed.

## Specialized Subagents

Use the right subagent_type for each phase of the protocol:

| Phase | subagent_type | Purpose |
|-------|--------------|---------|
| **Codebase exploration** | `Explore` | Quick/medium/thorough codebase analysis |
| **Architecture design** | `Plan` | Implementation strategy before coding |
| **Architecture blueprint** | `feature-dev:code-architect` | Analyze patterns, design component/data flows |
| **Feature analysis** | `feature-dev:code-explorer` | Trace execution paths, map dependencies |
| **Implementation** | `general-purpose` | Multi-step coding tasks in worktrees |
| **Code review (plan)** | `superpowers:code-reviewer` | Review against plan and standards |
| **Code review (quality)** | `feature-dev:code-reviewer` | Bugs, security, quality with confidence filtering |
| **PR review (guidelines)** | `pr-review-toolkit:code-reviewer` | Review against CLAUDE.md and style guides |
| **PR test coverage** | `pr-review-toolkit:pr-test-analyzer` | Verify tests cover new functionality |
| **Silent failures** | `pr-review-toolkit:silent-failure-hunter` | Detect inadequate error handling |
| **Type design** | `pr-review-toolkit:type-design-analyzer` | Encapsulation, invariants, type quality |
| **Comment accuracy** | `pr-review-toolkit:comment-analyzer` | Verify comments match code |
| **Code simplification** | `code-simplifier:code-simplifier` | Simplify recently modified code |
| **SRD validation** | `srd-framework:srd-guardian` | Validate work against SRD priorities |
| **SRD context** | `srd-framework:codebase-auditor` | Read-only codebase exploration for SRD |
| **SRD analysis** | `srd-framework:srd-analyst` | Generate personas, journeys, gap audits |
| **Claude Code questions** | `claude-code-guide` | Features, hooks, MCP, IDE integrations |
| **Agent SDK (TS)** | `agent-sdk-dev:agent-sdk-verifier-ts` | Verify TS Agent SDK apps |
| **Agent SDK (Py)** | `agent-sdk-dev:agent-sdk-verifier-py` | Verify Python Agent SDK apps |
| **Plugin validation** | `plugin-dev:plugin-validator` | Validate plugin structure |
| **Agent creation** | `plugin-dev:agent-creator` | Generate agent configurations |
| **Skill review** | `plugin-dev:skill-reviewer` | Review skill quality |

**Recommended workflow per issue:**
1. `Explore` or `feature-dev:code-explorer` — understand the codebase area
2. `Plan` or `feature-dev:code-architect` — design the approach
3. `general-purpose` — implement in worktree (can run in parallel via Mode A sub-agent dispatch, see "Parallel Execution")
4. `pr-review-toolkit:code-reviewer` + `silent-failure-hunter` — pre-PR quality gate
5. `srd-framework:srd-guardian` — validate against SRD acceptance criteria
