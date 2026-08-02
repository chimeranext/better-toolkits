---
description: Write all classes for an entire module — text classes, video briefs, quiz, and challenge
---

# Write Module: $ARGUMENTS

You are writing all content for an entire module. This includes text classes
(the PRIMARY teaching content), video briefs, quiz, and challenge.

**Text classes are the primary teaching content. Videos supplement them, not the other way around.**

## Phase 1: Context Loading

Load the course plan and authoring resources:

1. If a course plan exists (from `/new-course` or a consumer-side
   `/plan-course`), load it for this module's structure
2. If a consumer-side `track-map.md` resource exists (e.g.
   `chimera-academy/skills/academy-philosophy/resources/track-map.md`) read
   it — understand course position in track
3. If a consumer-side `content-formula.md` resource exists, read it — the
   content formula, class types, and module flow. The overlay invocation
   step at the end of this command surfaces it automatically when an
   `academy-philosophy` overlay is installed
4. If a consumer-side `platform-alignment.md` resource exists, read it —
   DB structure and class types
5. If a consumer-side `tag-taxonomy.md` resource exists, read it — tags
   for this module
6. Read the consumer's framework inventory file if one exists (e.g.
   `content/_framework-inventory.md` in chimera-academy)
7. Read the text class template if the consumer ships one (e.g.
   `content/_templates/text-class.md`)
8. If a consumer-side local config file exists (e.g.
   `.claude/chimera-academy.local.md`) read it for author/org defaults
9. If `teaching-context.md` exists in the course root, read it for student persona

Identify:
- Module position in the course
- Ship milestone for this module
- **Builder's Bloom's level** for this module (from course overview or inferred from position)
- Previous module (what was built) and next module (what's coming)
- All classes planned for this module

## Phase 2: Module Plan

Present a complete module content plan:

```
MODULE: [Title] (Position X of Y)
COURSE: [Course code + title]
HOURS: [estimated]
BLOOM'S LEVEL: [Recognize / Explain / Build / Debug & Evaluate / Decide / Ship]
SHIP MILESTONE: [what gets shipped]
TAGS: [from taxonomy]

CONTENT SEQUENCE:
1. Video Class: [Title] — talking head intro/framing (~X min)
2. Text Class: [Title] — primary teaching content
3. Text Class: [Title] — (if module needs a second text class)
4. Video Class: [Title] — screen demo (optional) (~X min)
5. Quiz Class: [Title] — [knowledge check scope] (5-10 questions)
6. Challenge Class: [Title] — [BUILD deliverable]
```

A typical module should include:
- 1 talking head video (intro/framing — 3-8 min)
- 1-2 text classes — the PRIMARY teaching content (as long as the content demands)
- 0-1 screen demo (optional live build — add after launch)
- 0-1 quiz (end-of-module knowledge check, 5-10 questions, 70% pass)
- 1 challenge (the module's BUILD deliverable — required)

**Module flow** (recommended order):
```
1. Talking Head Video (3-8 min)           → "Here's WHY and WHAT"
2. Text Class(es)                         → Primary teaching content
3. Screen Demo (10-20 min)               → "Watch me do it if you're stuck" (optional)
4. Quiz (5-10 min)                       → Knowledge check
5. Challenge                             → "Prove you did it"
```

## Phase 3: Review Gate

Present the module plan to the user for approval. Ask:
- Does this content sequence make sense?
- Should any text classes be added, removed, or reordered?
- Should any be guides/playbooks instead of deep lessons (or vice versa)?
- Any specific requirements for the challenge?

Wait for explicit approval before writing.

## Phase 4: Sequential Writing

**Write text classes FIRST, then everything else.** Text classes carry the
course — they must teach the complete concept standalone. Videos, quizzes,
and challenges are designed AFTER the text class is done.

Writing order:
1. **Text classes** — the full teaching content
2. **Challenge** — the proof of learning (designed against what the text class taught)
3. **Quiz** — knowledge check (questions drawn from text class content)
4. **Video briefs** — complement the text class (may repeat concepts in a different medium)

### For Text Classes (PRIMARY TEACHING CONTENT):

Use a text-class-writer-style approach. Template (consumer-shipped):
`content/_templates/text-class.md` in chimera-academy.

**The Load-Bearing Rule**: A student who reads ONLY the text class(es) must
be able to complete the module challenge. If the text class can't stand
alone, it's under-weight — fix the text, not the video count.

There is no rigid formula. Follow the 6 principles:
1. Open with substance — not meta-commentary
2. Teach directly — the text contains the education, Claude is the practice partner
3. Every paragraph earns its place — no padding
4. Use the right format for the idea — tables, prose, code as appropriate
5. End with momentum — the reader knows what to do next
6. Point to the wider world — link to docs, books, tools, specs

**Text class rules:**
- Text classes teach directly — Claude is the practice partner, not the teacher
- Never write "ask Claude to explain X" (Prompt Outsourcer anti-pattern)
- Never write a 300-word "reference card" and call it a text class — that's a glossary, not teaching content
- Let the content determine the form — some need narrative, some need tables, some need both
- Check the framework inventory before creating new frameworks
- Cross-reference existing frameworks from other courses where relevant
- **Diagrams**: For any visual concept, follow the consumer plugin's diagram
  branding (e.g., chimera-academy provides dark navy-purple `#272749` bg,
  white labels, Chimera accent colors via the `academy-philosophy` overlay).
  Use SHORT labels (1-3 words). Save to a consumer-specific holding folder
  (chimera-academy uses `nanobanana-output/` at the repo root). Embed with the
  appropriate relative path.

### For Video Classes (COMPLEMENTARY):

Generate a video brief following the consumer's video-brief template (e.g.
`content/_templates/video-brief.md`). Videos are written AFTER text classes.
- Specify video_format: talking_head or screen_recording
- For talking head: write teleprompter-ready script with scene tags
  (CAMERA ONLY, SLIDES + PIP)
- For screen recording: write bullet-point outline with LIVE DEMO tags
- Include companion notes for key commands/links shown in video
- Videos may repeat concepts from the text class in a different medium —
  that repetition is valuable
- Videos must NOT introduce concepts that aren't in the text class — if a
  concept is only in the video, it should be in the text class too

### For Quiz Classes:

Generate 5-10 questions following the consumer's quiz template (e.g.
`content/_templates/quiz.md`):
- Questions test UNDERSTANDING, not memorization
- 3 difficulty tiers: Foundation (2-3), Application (2-4), Integration (1-3)
- At least 1 question about the BUILD deliverable
- Every explanation teaches — reinforce the concept, don't just validate
- Passing score: 70%

### For Challenge Classes:

Generate a challenge following the consumer's challenge template (e.g.
`content/_templates/challenge.md`):
- The challenge IS the module's ship milestone
- 3-5 measurable success criteria (specific, verifiable)
- Include an example submission showing what "good" looks like
- 2-3 hints that nudge without giving the answer
- Estimated completion time
- Ship milestone escalation by module position (build locally → deploy →
  share → post publicly → ship to production)

## Phase 5: Module Review

After all content is written, run a module-level review:

1. **Quality rubric**: Score each text class on the 5-question rubric (all should be 4+)
2. **Continuity check**: Do text classes flow logically? Does each reference the previous?
3. **Framework check**: Are named frameworks consistent with the framework inventory? Any new ones to add?
4. **Ship milestone check**: Does the challenge deliver the module's ship milestone?
5. **Tag check**: Are all tags from the taxonomy?
6. **Anti-pattern check**: Scan all content for anti-patterns (Padder, Lecturer, Prompt Outsourcer, etc.)
7. **Diagram check**: Does every visual concept have a generated diagram?

## Phase 6: Output

Save all module content to the appropriate paths in the consumer's content
root (chimera-academy convention shown):

```
content/courses/{course-slug}/{module-slug}/
├── module-overview.md
└── classes/
    ├── video-01-{slug}.md          # Talking head intro
    ├── text-01-{slug}.md           # Primary teaching content
    ├── text-02-{slug}.md           # Second text class (if applicable)
    ├── video-02-{slug}.md          # Screen demo (if applicable)
    ├── quiz-01-{slug}.md           # Knowledge check
    └── challenge-01-{slug}.md      # BUILD deliverable
```

Include YAML frontmatter with repo-tracking metadata for each file.
Frontmatter is for repo tracking only — strip before uploading to the platform.

Present a summary:
- Module metadata (title, position, status, tags, estimated hours)
- Content count by type (N text classes, N video briefs, N quizzes, N challenges)
- Framework inventory update (any new frameworks introduced)
- Module review notes (any flags or suggestions)

## Overlay invocation (post-base-draft)

After producing the cmi5/xAPI-shaped base draft for this command, follow
`${CLAUDE_PLUGIN_ROOT}/assets/runtime/overlay-protocol.md` to discover and
apply consumer overlays. The runtime walks `<cwd>/.claude-plugin/plugin.json`,
finds skills declaring `overlay_target: ["write-module"]` in their
frontmatter, sorts them by `overlay_priority`, and applies them in order.

For this command, expect (when a consumer like `chimera-academy` is installed):
- Structural overlays (priority ~50) — content-standards: enforce module
  flow, "text classes carry the course" load-bearing rule, sequential
  writing order (text → challenge → quiz → video briefs)
- Voice / editorial overlays (priority ~100) — academy-philosophy:
  Builder-First / AI-Native voice across all module content, named Chimera
  frameworks, diagram branding, ship milestone phrasing

Layer 1 invariants (`au_id`, `activity_type`, stable IDs across all
generated classes) remain immutable — overlay outputs that mutate them
abort the run. Layer 2 contradictions (Bloom's regression, missing ship
milestone, flat module flow) log a visible warning but do not abort.
Discovery returns zero overlays in a consumer without
`.claude-plugin/plugin.json` — the base draft is written directly,
voice-neutral.
