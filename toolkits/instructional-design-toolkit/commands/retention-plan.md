---
description: Generate a retention plan — post-course projects, spaced review, and next steps for continued building
---

# Retention Plan: $ARGUMENTS

You are generating a post-course retention plan that keeps students
building after they finish the course. The plan is **ex-ante** — it ships
alongside the course content as guidance for the student after completion,
distinct from `course-retro` which is **ex-post** (run after a cohort
finishes to capture lessons learned).

**Arguments format**: `{course-slug}`
- `course-slug`: path slug for the course relative to the consumer repo's
  content root (e.g., `agentic-coding` for a chimera-academy-shaped repo
  where course content lives at `content/courses/{course-slug}/`). The
  runtime resolves paths relative to the cwd where the command was
  invoked.

## Phase 1: Context Loading

Read the course and track context:

1. `content/courses/$ARGUMENTS/course-overview.md` — capstone, modules,
   ship milestones, tags (path convention is consumer-specific; the
   chimera-academy convention is shown)
2. `resources/track-map.md` (consumer-specific path) — next courses in
   the category, prerequisites graph
3. If a `teaching-context.md` exists at
   `content/courses/$ARGUMENTS/teaching-context.md`, read it for student
   persona

Extract:
- The capstone project (what they built)
- All ship milestones across modules (what they shipped along the way)
- Key skills taught
- Course category and position
- Next courses the student is now qualified for

## Phase 2: Generate Retention Plan

Generate `retention-plan.md` with these sections:

### Build Next

3 project ideas that build on the capstone, graduated in difficulty:

| Project | Difficulty | Timeframe | What It Adds |
|---------|-----------|-----------|-------------|
| [Weekend project] | Extend | 1-2 days | [one new skill on top of capstone] |
| [Week project] | Stretch | 5-7 days | [combines 2-3 course skills in a new context] |
| [Month project] | Ambitious | 2-4 weeks | [production-grade version or new domain] |

Each project should be specific and actionable — not "build something
bigger."

### Spaced Review

Key concepts checklist with review schedule:

| Concept | Week 1 Review | Week 2 Review | Month 1 Review |
|---------|--------------|--------------|----------------|
| [concept] | [quick exercise] | [apply differently] | [teach someone] |

5-8 concepts maximum. Focus on the ones that fade fastest without
practice.

### Skills to Practice

3-5 specific skills from the course with daily practice suggestions:

- **[Skill]**: [5-10 min daily practice idea]

Practice suggestions should be small enough to do daily — not project-sized.

### Next Courses

Courses the student is now qualified for, with motivation:

| Course | Why You're Ready | What You'll Build |
|--------|-----------------|-------------------|
| [code + title] | [specific skill from this course that transfers] | [that course's capstone] |

### Builder's Next Steps

5 concrete actions for the next 7 days:

1. [Specific action with a clear deliverable]
2. [Another specific action]
3. ...

Actions should be small, completable, and build momentum.

## Phase 3: Review Gate

Present the retention plan to the user. Ask:
- Do these projects make sense given what the student just built?
- Are the daily practices realistic?
- Any courses missing from the "Next" section?

Wait for approval.

## Phase 4: Save

Save to `content/courses/$ARGUMENTS/retention-plan.md` (path convention is
consumer-specific; the chimera-academy convention is shown)

## Overlay invocation (post-base-draft)

After producing the cmi5/xAPI-shaped base draft for this command, follow
`${CLAUDE_PLUGIN_ROOT}/assets/runtime/overlay-protocol.md` to discover and
apply consumer overlays. The runtime walks `<cwd>/.claude-plugin/plugin.json`,
finds skills declaring `overlay_target: ["retention-plan"]` in their
frontmatter, sorts them by `overlay_priority`, and applies them in order.

For this command, expect (when a consumer like `chimera-academy` is installed):
- Structural overlays (priority ~50) — e.g. content-standards: enforce
  the section roster (Build Next 3-row table, Spaced Review 5-8 rows,
  Skills to Practice 3-5 entries, Next Courses cross-references, Builder's
  Next Steps with exactly 5 actions), track-map cross-references, ship
  milestone alignment
- Voice / editorial overlays (priority ~100) — e.g. academy-philosophy:
  Builder-First framing for project ideas, "you'll build..." not
  "you'll learn about...", Chimera named-framework cross-references for
  graduated difficulty, tone for the Builder's Next Steps imperatives

Layer 1 invariants (`au_id`, `activity_type`, stable IDs from the cmi5
contract) remain immutable — overlay outputs that mutate them abort the
run with a clear error pointing at the offending `SKILL.md` path. Layer 2
contradictions (Bloom's flatness, missing ship milestone reference) log a
visible warning but do not abort. Discovery returns zero overlays in a
consumer without `.claude-plugin/plugin.json` — the base retention plan is
written directly, voice-neutral, with no warning.
