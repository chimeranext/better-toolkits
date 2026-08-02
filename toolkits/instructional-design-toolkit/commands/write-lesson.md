---
description: Write a single workbook lesson (legacy docs/ track). For new teaching content, use /write-text-class instead.
---

# Write Lesson: $ARGUMENTS

You are writing a single workbook lesson. The lesson goes into the course's
`docs/` directory (consumer-specific path — chimera-academy uses
`content/courses/{course}/docs/ch-{NN}-{slug}/`). **This is the legacy
documentation track.** For new primary teaching content, use
`/write-text-class` instead.

Use a text-class-writer-style approach (which also handles workbook lessons).

## Phase 1: Context

1. Read the **course overview** to understand the lesson's position
2. Read the **module overview** to understand what this lesson contributes
3. If a consumer-side `content-formula.md` resource is available (e.g.
   `chimera-academy/skills/academy-philosophy/resources/content-formula.md`)
   read it for the 5-step formula and **workbook philosophy
   (TEACH + WORK + REFLECT)**. The overlay invocation step at the end of
   this command surfaces it automatically when an `academy-philosophy`
   overlay is installed
4. If a consumer-side `content-standards/SKILL.md` is available (e.g.
   `chimera-academy/skills/content-standards/SKILL.md`) read it for quality
   standards and anti-patterns
5. Read the **previous lesson** (if not lesson 1) to ensure continuity
6. Read the **source content** if migrating from another corpus (path
   provided in $ARGUMENTS)

**Key principle**: The workbook TEACHES directly — Claude is the practice
partner, not the teacher. The lesson contains the knowledge (tables,
frameworks, worked examples). BUILD sections have students USE Claude to
apply that knowledge. Never write "ask Claude to explain X" as the teaching
mechanism.

## Phase 2: Write

Write the lesson following this exact structure:

### Frontmatter (repo-only, stripped before upload)
```yaml
---
lesson_number: {N}
title: "{title}"
module_number: {N}
course_code: "{code}"
status: draft
estimated_minutes: {N}
difficulty: beginner|intermediate|advanced
tags: []
last_updated: "{YYYY-MM-DD}"
author: "{author}"
---
```

### MDX Body (this is what goes into `lessons.content` in the DB)

```markdown
## Why This Matters
<!-- CONTEXT: 100-200 words. Vivid scene/scenario opening. -->
<!-- NEVER "In the previous lesson..." — start with a hook that makes the student FEEL the urgency. -->

## The Mental Model
<!-- CONCEPT: 300-500 words. The lesson TEACHES the concept directly here. -->
<!-- Tables, frameworks, worked examples, annotated code — the knowledge lives IN the lesson. -->
<!-- For technical courses: use the zoom-in pattern (intuition → mechanism → landscape). -->

## Build It
<!-- BUILD: 50-60% of the content. THE BULK. -->
<!-- TEACH + WORK + REFLECT: The lesson already taught the concept above. -->
<!-- BUILD has students APPLY that knowledge through experiments with Claude. -->
<!-- NEVER write "ask Claude to explain X" — the lesson already explained X. -->
<!-- Use bold inline labels for exercises, NOT rigid sub-headers. -->
<!-- Claude is the default tool: "Open Claude (or your preferred AI tool)" -->
<!-- For code lessons, use Callout components (tip, success, warning) + ProTip -->

## Ship It
<!-- SHIP: 50-100 words. What the student saves/creates/deploys. -->
<!-- Make it feel like an achievement. -->

## Reflect
<!-- REFLECT: 1-2 provocative questions specific to THIS lesson's experiments. -->
<!-- Not generic "what did you learn?" — specific and thought-provoking. -->

<KeyTakeaways>
- [3-4 bullets max]
</KeyTakeaways>
```

## Phase 2.5: Self-Review (Description-Discernment Loop)

Before presenting the draft to the user, evaluate your own output:

1. **Re-read against teaching context** — If `teaching-context.md` exists in
   the course root, re-read it. Does your draft speak to the student
   described there?
2. **Flag 3 confusion risks** — Identify 3 places where the target student
   might get lost, confused, or need more context. Fix them.
3. **Flag 1 boredom risk** — Identify 1 section where the student's
   attention might drift. Tighten or cut it.
4. **Verify the "one thing"** — What's the ONE idea this lesson teaches? Is
   it clear by the end of the BUILD section? If not, sharpen it.
5. **Check AI integration** — Does the BUILD section use Claude as a
   practice partner (not teacher)? Does it teach the student to EVALUATE AI
   output, not just accept it?

Only present the draft after this self-review pass. Note any significant
changes you made during self-review.

## Phase 3: Quality Check

Before saving, verify:
- [ ] Context ≤ 200 words, vivid opening (never "In the previous lesson...")
- [ ] BUILD is 50-60% of content
- [ ] BUILD teaches directly — no "ask Claude to explain X" (Prompt Outsourcer anti-pattern)
- [ ] BUILD uses flowing experiments with bold inline labels (no rigid sub-headers)
- [ ] BUILD uses direction-based prompting for code lessons (What to Build + What to Look For + When It's Not Right + Going Further)
- [ ] SHIP has concrete deliverable (50-100 words)
- [ ] REFLECT questions are provocative and specific
- [ ] Key Takeaways has 3-4 bullets (max 4)
- [ ] References previous lesson (if not lesson 1)
- [ ] Previews next lesson (if not last)
- [ ] Tags from taxonomy
- [ ] No anti-patterns (The Lecturer, The Hello-Worlder, The Syntax Teacher)
- [ ] Total: 1500-2500 words + code blocks

## Phase 4: Save

Save to the consumer-specific docs path. Chimera-academy convention:
`content/courses/{course-slug}/docs/ch-{NN}-{slug}/lesson-{NN}-{slug}.md`.
Other consumers may document a different layout — defer to whatever path
convention the consumer plugin's CLAUDE.md or content README spells out.

Update the chapter-level overview status if this completes the chapter's
docs (or `module-overview.md` if the consumer maps workbook chapters to
modules — chimera-academy keeps the workbook independent of modules).

## Overlay invocation (post-base-draft)

After producing the base draft for this command, follow
`${CLAUDE_PLUGIN_ROOT}/assets/runtime/overlay-protocol.md` to discover and
apply consumer overlays. The runtime walks `<cwd>/.claude-plugin/plugin.json`,
finds skills declaring `overlay_target: ["write-lesson"]` in their
frontmatter, sorts them by `overlay_priority`, and applies them in order.

For this command, expect (when a consumer like `chimera-academy` is installed):
- Structural overlays (priority ~50) — content-standards: enforce
  CONTEXT→CONCEPT→BUILD→SHIP→REFLECT formula, BUILD ≥ 50%, anti-patterns
  scan
- Voice / editorial overlays (priority ~100) — academy-philosophy:
  Builder-First / AI-Native voice, named frameworks, momentum endings

> **Note on cmi5/xAPI invariants for the legacy workbook track.** The
> Layer 1 invariant list (`au_id`, `activity_type`, stable IDs,
> `mastery_score`, etc.) is **aspirational** for workbook lessons.
> Workbook content predates the cmi5 contract and chimera-academy currently
> stores it in the `lessons` table without `au_id`. Once a consumer
> elects to cmi5-map workbook lessons (assigning a stable `au_id` and an
> `activity_type` IRI in the frontmatter), the same overlay protocol's
> Layer 1 enforcement applies automatically. Until then, the overlay
> protocol still runs (discovery, structural / voice transforms) but the
> Layer 1 validator is a defensive no-op for any field the lesson does
> not yet carry.

Discovery returns zero overlays in a consumer without
`.claude-plugin/plugin.json` — the base draft is written directly,
voice-neutral.
