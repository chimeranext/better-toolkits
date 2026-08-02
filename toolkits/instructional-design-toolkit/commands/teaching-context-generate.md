---
description: Generate a teaching-context.md file for a course — defines target student, anxiety points, motivation, and AI positioning
---

# Teaching Context Generate: $ARGUMENTS

You are generating a `teaching-context.md` file for a course. This document
defines WHO the student is, WHAT they're anxious about, WHY they're here,
and HOW AI is positioned — ensuring consistent content creation across all
modules.

**Arguments format**: `{course-slug}`
- `course-slug`: path slug for the course relative to the consumer repo's
  content root (e.g., `agentic-coding` for a chimera-academy-shaped repo where
  course content lives at `content/courses/{course-slug}/`). The runtime
  resolves paths relative to the cwd where the command was invoked.

## Phase 1: Load Skill Template

Read the teaching-context skill for the template and validation checklist
if a consumer ships one:

1. `skills/teaching-context/SKILL.md` (consumer-specific path) — template
   structure and validation criteria
2. `resources/track-map.md` (consumer-specific path) — course position,
   prerequisites, category

If the consumer does not ship a teaching-context skill, fall back to the
section structure documented in Phase 3 of this command.

## Phase 2: Extract Course Inputs

Read the course overview to extract key inputs:

1. Read `content/courses/$ARGUMENTS/course-overview.md` (path convention is
   consumer-specific; the chimera-academy convention is shown)
2. Extract: target audience, prerequisites, course promise, level,
   certification
3. If existing text classes exist, read 1-2 to infer current voice and tone
4. If `course-overview.md` does NOT exist, ask the user for:
   - Who is the target student? (role, experience, background)
   - What do they already know?
   - What is the course promise?
   - What level is this? (beginner / intermediate / advanced)

## Phase 3: Generate Teaching Context

Generate the `teaching-context.md` following the consumer's skill template
when one is installed. When no template is available, include all of the
following sections:

- **Target Student** — specific persona (not "anyone interested in tech")
- **Anxiety Points** — table with anxiety, manifestation, and how we
  address it (minimum 3)
- **Motivation** — why they're really here, what success looks like, what
  keeps them going, what makes them quit
- **Patience Profile** — time per session, tolerance for theory/errors,
  need for quick wins — each with content implications
- **AI Positioning** — table of Claude's roles in this course with what
  to avoid
- **Voice and Tone** — formality, encouragement level, technical depth,
  humor

Ground every field in the specific course context. Generic answers defeat
the purpose.

## Phase 4: Validate

Run the consumer skill's validation checklist (or this minimum set if no
checklist is shipped):

- [ ] Target student is specific (not "anyone interested in tech")
- [ ] Anxiety points are real (not "they might find it hard")
- [ ] Motivation is honest (the real reason, not the aspirational reason)
- [ ] Patience profile has implications for content (not just labels)
- [ ] AI positioning is clear about what Claude does and doesn't do
- [ ] Voice section is specific enough that two writers would produce
      similar tone

Flag any items that feel generic and revise before presenting.

## Phase 5: Save and Review

1. Save to `content/courses/$ARGUMENTS/teaching-context.md` (path
   convention is consumer-specific; the chimera-academy convention is shown)
2. Present the full document to the user for review
3. Ask: Does this match who you imagine taking this course? Anything to
   adjust?
4. Wait for approval before finalizing

## Overlay invocation (post-base-draft)

After producing the cmi5/xAPI-shaped base draft for this command, follow
`${CLAUDE_PLUGIN_ROOT}/assets/runtime/overlay-protocol.md` to discover and
apply consumer overlays. The runtime walks `<cwd>/.claude-plugin/plugin.json`,
finds skills declaring `overlay_target: ["teaching-context-generate"]` in
their frontmatter, sorts them by `overlay_priority`, and applies them in
order.

For this command, expect (when a consumer like `chimera-academy` is installed):
- Structural overlays (priority ~50) — e.g. content-standards: enforce
  the section roster (Target Student, Anxiety Points table with ≥3 rows,
  Motivation, Patience Profile, AI Positioning, Voice and Tone), validation
  checklist enforcement
- Voice / editorial overlays (priority ~100) — e.g. academy-philosophy:
  Builder-First / AI-Native voice for the persona description, AI
  positioning that matches the consumer's tool philosophy (Claude as
  practice partner vs. teacher in chimera-academy), specific persona
  vocabulary

Layer 1 invariants (`au_id`, `activity_type`, stable IDs from the cmi5
contract) remain immutable — overlay outputs that mutate them abort the
run with a clear error pointing at the offending `SKILL.md` path. Layer 2
contradictions (Bloom's flatness, missing ship milestone) log a visible
warning but do not abort. Discovery returns zero overlays in a consumer
without `.claude-plugin/plugin.json` — the base teaching-context is
written directly, voice-neutral, with no warning.
