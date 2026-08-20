# Bilingual Issue Brief — fill-in template

**SSOT** for the complete issue-brief body used by spike-recommend / spec-recommend producers.

Markers and stub heuristics: [`docs/bilingual-format-standard.md`](../docs/bilingual-format-standard.md).

Emit using this structure verbatim. Do NOT skip sections — write "N/A" if a section does not apply. Write in English.

---


# [ISSUE-ID] Issue Title

{Body starts here — substantive content only. Do NOT emit a top-of-body metadata block listing Type/Size/Strategy/Components/Impact/Flags/Branch. These are the tracker's structured fields — they appear in the Labels and Properties sidebar automatically. Set them via the tracker's API (Linear `labels` array, GitHub `--label`, etc.), never duplicate them in the body.

The ONLY acceptable element between the `# Title` heading and `## 👤 HUMAN LAYER` is a top-level callout for content with no native sidebar equivalent — e.g. an "out of scope, handled by …" pointer to a related issue, because Linear's Relations panel is less prominent than a body callout. Example:

> 🔗 Out of scope — handled by [DOJ-XXXX](https://linear.app/your-team/issue/DOJ-XXXX)

If there is no such callout to make, jump straight from the title to `## 👤 HUMAN LAYER`.}

---

## 👤 HUMAN LAYER

### User Story

As a **{role}**, I want **{X}** so that **{Y}**.

### Background / Why

{2-3 paragraphs in plain language. Extract from issue description + comments. Explain the problem, motivation, and business context. If the issue is sparse, say what you know and flag what's missing.}

### Analogy

{Compare to something familiar. Write "N/A" if not applicable.}

### UX / Visual Reference

{List any screenshots, Figma links, mockups mentioned in the issue. Write "None provided" if absent.}

### Known Pitfalls & Gotchas

{Extract from comments, linked issues, or infer from codebase knowledge. List edge cases, legacy data quirks, dependencies.}

---

## 🤖 AGENT LAYER

### Objective

{1-2 sentence technical outcome. Be precise about the deliverable.}

### Context Files

{List exact file paths the agent should read before starting. Include a short description of why each file matters. Use your knowledge of the repo structure.}

- `path/to/file` — {why}
- `path/to/file` — {why}

### Acceptance Criteria

{Checkboxes. Each must be independently testable. Derive from the issue description, comments, and your understanding of the requirement.}

- [ ] {criterion}
- [ ] {criterion}
- [ ] {criterion}

### Technical Constraints

{Patterns, conventions, and guardrails the agent must follow. Include relevant linting rules, architectural patterns, naming conventions from the codebase.}

- {constraint}
- {constraint}

### Verification Commands

{Exact bash commands to confirm the work is done correctly.}

```bash
# Tests
{command}

# Lint
{command}

# Build
{command}

# Type check (if applicable)
{command}
```

### Agent Strategy

{This section adapts based on the Strategy label.}

**Mode:** `{strategy}`

### If Solo:
- **Approach:** {step-by-step plan}
- **Estimated tokens:** {based on Size label}

### If Explore:
- **Investigation questions:** {what needs to be understood first}
- **Read-only phase:** {files/areas to investigate}
- **Decision point:** {what triggers moving to implementation}

### If Team:
- **Lead role:** Coordinator — assigns tasks, reviews, synthesizes. No direct file edits.
- **Teammates:**
  - Teammate 1: {role} → owns `{paths}`
  - Teammate 2: {role} → owns `{paths}`
  - Teammate 3: {role} → owns `{paths}`
- **Display mode:** `tab` or `split`
- **Plan approval required:** yes/no
- **File ownership:** {explicit mapping to avoid write conflicts}

### If Worktree:
- **Worktree branch:** `{branch name}`
- **Isolation reason:** {why this needs worktree}
- **Merge strategy:** {how to integrate back}

### If Review:
- **Audit scope:** {what to review}
- **Output format:** {report structure}
- **No code changes** — output is a report only.

### If Human:
- **Decisions needed:** {list decisions the human must make}
- **Options to present:** {for each decision, outline the trade-offs}
- **Agent prep work:** {what the agent can do to support the decision}

### Slack Notification

When done, send a summary to {user} via Slack MCP with:
- What was completed
- Files changed
- Any issues or decisions needed

---

## 🔀 Parallelization Recommendation

{ALWAYS include this section. Based on the Size, Strategy, and Component labels, recommend which parallelization mechanism to use. Consider the codebase context window of 200K tokens.}

**Recommended mechanism:** `{Subagents | Git Worktrees | Agent Teams | None (Solo)}`

**Reasoning:**

{Explain your choice using this decision matrix:}

- **Subagents** — Best for: quick research, focused sub-tasks. Token cost: Low (1x). Use when a piece of the work is independent and the result can be summarized back. Like sending an intern to look something up.
- **Git Worktrees** — Best for: parallel sessions on different branches. Token cost: 1x per session. Use when changes are risky, experimental, or need branch isolation. Like separate desks in the same office.
- **Agent Teams** — Best for: complex multi-part work where teammates need to coordinate. Token cost: 3-4x. Use when multiple components change simultaneously and teammates benefit from messaging each other. Like a self-organizing consulting firm.
- **None (Solo)** — Best for: XS/S issues with clear scope. Single agent, single context window, minimal cost.

**Size → Mechanism mapping:**
- XS/S → Solo (no parallelization needed)
- M with single component → Solo or Subagents for research
- M with multiple components → Agent Teams (2 teammates)
- L → Agent Teams (2-3 teammates) or Worktree if risky
- XL → Decompose first, then Agent Teams per sub-issue

**Cost estimate:** ~{number}x base token cost

---

### Synthesis Additional Comments

{Add here any additional comments that you consider necessary based on the synthesis of all the spike analyzer sub-agents. Use 5 Why's methodology. Please also use the following consulting frameworks:}

#### MECE Logical Validation
Analyze the implementation using the **MECE** (Mutually Exclusive, Collectively Exhaustive) framework:

* **Mutually Exclusive:** Verify that this logic does not overlap or conflict with existing Handlers, Services, or Selectors within the spike. Ensure a single source of truth for this business logic.

* **Collectively Exhaustive:** Ensure the solution addresses 100% of the defined requirements, including null pointers, platform limits (Gov Limits), and all possible record states in the execution context.

#### Executive Synthesis (Minto Pyramid)
Structure the response using the **Pyramid Principle**:

1.  **Lead with the Answer:** Provide a one-sentence "Executive Summary" of the change and its primary impact on the system.

2.  **Supporting Arguments:** Group technical changes into logical buckets (e.g., Performance Optimization, Code Resilience, Scalability).

3.  **Data & Evidence:** Provide specific technical details (CPU time saved, heap size impact, or test coverage metrics) only as evidence to support the arguments above.

#### Pareto 80/20 Efficiency Review

Apply a **Pareto Filter** to the proposed solution:

* Identify if we are achieving 80% of the business value with 20% of the code complexity. 

* Flag any "over-engineered" components designed for extreme edge cases that may introduce unnecessary technical debt to the spike.

* Suggest if a simpler, standard Salesforce feature (e.g., a simple Flow or Formula) would be more efficient than the current Apex implementation.

#### Second-Order Thinking & Risk Assessment
Evaluate the **long-term implications** of this implementation:

* **Scalability:** What happens to this logic if the data volume in the Org grows by 10x or 100x? 

* **Downstream Effects:** How does this change impact other modules or future developers working within the spike?

* **Future Maintenance:** Identify potential "hidden" dependencies or architectural traps that might increase the cost of change six months from now.

