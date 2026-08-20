# /write-challenge — protocol SSOT

Harness-agnostic body. Thin entry: `commands/write-challenge.md`.

---

# Write Challenge: $ARGUMENTS

You are designing a module challenge. The challenge IS the module's ship
milestone — it's the tangible thing the student builds, deploys, or shares
to prove they internalized the module's concepts.

## Phase 1: Context Loading

Load the module content and authoring resources:

1. Identify the course and module from `$ARGUMENTS` (e.g., `agentic-coding module-03`)
2. Read **all text classes** in the module's `classes/` directory —
   understand what was taught
3. Read the **module overview** (`module-overview.md`) — especially the
   ship milestone
4. Read the **challenge template** if the consumer ships one (e.g.
   `content/_templates/challenge.md` in chimera-academy) — follow its exact
   frontmatter and format
5. Read the **course overview** (`course-overview.md`) — understand where
   this module sits in the capstone arc

Identify:
- Module title, position, and ship milestone
- What the student built incrementally through the module's text classes
- The course capstone — how does this module's challenge feed into it?
- Previous module's challenge (if any) — the student should feel progression

## Phase 2: Challenge Design

Design the challenge following these rules:

### Core Principle
The challenge IS the module's ship milestone. It's not busywork — it's the reason the module exists.

### Ship Milestone Escalation
Scale the challenge ambition based on module position:

| Module Position | Ship Level | Example |
|----------------|------------|---------|
| Module 1-2 | **Build locally** | Create a file, write a document, configure a tool |
| Module 3-4 | **Deploy to staging** | Push to a repo, deploy a preview, share a draft |
| Module 5-6 | **Share with 1 person** | Get feedback from a peer, post in community |
| Module 7+ | **Post publicly** | Publish a blog post, open-source a tool, ship to users |
| Capstone | **Ship to production** | Launch a complete project with real users |

### Challenge Structure

Follow the challenge template exactly:

```markdown
---
class_number: {N}
title: "Challenge: {Descriptive Title}"
type: challenge
module_number: {N}
course_code: "{code}"
status: draft
position_in_module: {N — typically last}
tags: []
last_updated: "{YYYY-MM-DD}"
author: "claude"
---

# Challenge: {Title}

## Instructions

{Clear, specific instructions. 150-300 words.}
{Tell the student WHAT to build and WHY, but not exactly HOW.}
{Reference specific concepts from the module's text classes.}
{Include estimated completion time.}

## Success Criteria

- [ ] {Criterion 1 — specific and measurable}
- [ ] {Criterion 2 — specific and measurable}
- [ ] {Criterion 3 — specific and measurable}
- [ ] {Criterion 4 — specific and measurable (optional)}
- [ ] {Criterion 5 — specific and measurable (optional)}

## Example Submission

{Show what a GOOD submission looks like — not a perfect one, a realistic one.}
{This sets expectations and reduces anxiety. 50-150 words or a concrete example.}

## Hints

<details>
<summary>Hint 1</summary>
{Nudge toward the right approach without giving the answer}
</details>

<details>
<summary>Hint 2</summary>
{Address a common stumbling point}
</details>

<details>
<summary>Hint 3 (optional)</summary>
{For students who are truly stuck}
</details>

## Submission

{Submission type: screenshot / URL / text / recording / GitHub link}
{Where to share: community channel, tag, etc.}
{Share in the community with #{tag}}
```

### Design Rules
- **Instructions**: Clear but not hand-holding. The student should make decisions.
- **Success criteria**: 3-5 items, each specific and verifiable. A reviewer should be able to check yes/no on each.
- **Hints**: 2-3 hints that nudge without giving the answer. Address common mistakes, not steps.
- **Example submission**: Show what "good" looks like. This is the single most effective way to reduce student anxiety and set quality expectations.
- **Estimated time**: Include in the instructions. Be realistic (15 min for a config task, 60 min for a build task, 2+ hours for a capstone).
- **Submission type**: Match the ship level. Local builds = screenshot. Deploys = URL. Public posts = link.

## Phase 3: Review Gate

Present the challenge to the user:

```
CHALLENGE: [Title]
MODULE: [Module Title] (Position X of Y)
SHIP LEVEL: [Build locally / Deploy / Share / Post publicly / Ship to production]
ESTIMATED TIME: [X minutes]
SUBMISSION TYPE: [type]

WHAT THEY BUILD:
[1-2 sentence summary]

SUCCESS CRITERIA:
1. [criterion]
2. [criterion]
3. [criterion]

FEEDS INTO CAPSTONE:
[How this deliverable connects to the course's final project]
```

Ask:
- Is the scope right for this module's position? (Not too easy, not overwhelming)
- Are the success criteria specific enough to evaluate?
- Does the example submission set the right quality bar?

**Wait for explicit approval before saving.**

## Phase 4: Save

Save to (consumer-specific path; chimera-academy convention shown):
`content/courses/{course-slug}/{module-slug}/classes/challenge-{NN}-{slug}.md`

Naming convention:
- Challenge number is typically `01` (one challenge per module)
- Slug should describe the deliverable (e.g., `challenge-01-builder-manifesto.md`, `challenge-01-deploy-first-app.md`)

After saving:
- Confirm the file path to the user
- Note how this challenge connects to the next module's content (continuity check)

## Overlay invocation (post-base-draft)

After producing the cmi5/xAPI-shaped base draft for this command, follow
`${CLAUDE_PLUGIN_ROOT}/assets/runtime/overlay-protocol.md` to discover and
apply consumer overlays. The runtime walks `<cwd>/.claude-plugin/plugin.json`,
finds skills declaring `overlay_target: ["write-challenge"]` in their
frontmatter, sorts them by `overlay_priority`, and applies them in order.

For this command, expect (when a consumer like `chimera-academy` is installed):
- Structural overlays (priority ~50) — content-standards: enforce 3-5
  measurable success criteria, ship milestone escalation by module
  position, example submission requirement, 2-3 hints rule
- Voice / editorial overlays (priority ~100) — academy-philosophy:
  Builder-First / AI-Native voice in instructions, capstone arc framing,
  community-tag conventions

Layer 1 invariants (`au_id` for the challenge AU, `activity_type =
.../simulation` or `.../assessment` per the cmi5 mapping, stable
challenge IDs, criteria IDs) remain immutable — overlay outputs that
mutate them abort the run with a clear error pointing at the offending
`SKILL.md` path. Layer 2 contradictions (e.g. ship milestone regression,
capstone disconnection) log a visible warning but do not abort.
Discovery returns zero overlays in a consumer without
`.claude-plugin/plugin.json` — the base draft is written directly,
voice-neutral.
