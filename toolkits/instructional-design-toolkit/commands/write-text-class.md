---
description: Generate a text class (primary teaching content) for a module
---

# Write Text Class: $ARGUMENTS

You are writing a text class — the PRIMARY teaching content in a module. Text
classes are standalone lessons that teach the complete concept. Videos
supplement them, not the other way around.

**Arguments format**: `{module-path}`
- `module-path`: path relative to the consumer repo's content root (e.g.,
  `content/courses/agentic-coding/module-01-the-builder-mindset` for a
  chimera-academy-shaped repo). The runtime resolves paths relative to the cwd
  where the command was invoked.

There is no rigid formula. The content determines the form. Follow the 6
principles and quality rubric below.

## Phase 1: Context Loading

Load everything needed to write a high-quality text class:

1. Read the **module overview**: `{module-path}/module-overview.md`
2. Read **all existing text classes** in the module's `classes/` directory
   (for continuity and to avoid overlap)
3. Read the **course overview**: `{course-root}/course-overview.md`
4. If a consumer-side local config file exists at the cwd (e.g.
   `.claude/chimera-academy.local.md` for chimera-academy, or any other
   author/org defaults file the consumer plugin documents), read it
5. If `teaching-context.md` exists in the course root, read it for student
   persona and anxiety points
6. Read the **template** if the consumer ships one (e.g.
   `content/_templates/text-class.md` in chimera-academy)
7. If a `content-formula.md` overlay reference exists in an installed
   consumer plugin (the `academy-philosophy` overlay in chimera-academy
   provides one), the overlay invocation step (see end of this command)
   will surface it during the editorial-voice pass
8. Read the consumer's framework inventory file if one exists (e.g.
   `content/_framework-inventory.md` in chimera-academy)

Identify:
- Module position in the course and what the student has already learned
- Ship milestone for this module
- What existing text classes in this module already cover
- The next available text class number (e.g., if `text-01` and `text-02`
  exist, this is `text-03`)
- Which named frameworks already exist in this course (from the framework
  inventory)

## Phase 2: Text Class Plan

Present a structured plan before writing:

```
TEXT CLASS PLAN
━━━━━━━━━━━━━━
Title: [Title]
File: text-{NN}-{slug}.md
Position: Class {N} of {M} in module
Course: [Course name]
Module: [Module name]

WHAT THIS TEACHES:
[2-3 sentences on the core concept and why it matters]

APPROACH:
[How you plan to structure it — narrative arc, framework + examples,
walkthrough, comparison, etc. Explain WHY this structure fits this content.]

KEY ELEMENTS:
- [Element 1 — e.g., "The X Framework (table)" or "Stripe case study" or "failure story"]
- [Element 2]
- [Element 3]

CROSS-COURSE REFERENCES:
- {Framework from another course} — {why it's relevant here}
- (or: None — this topic is self-contained)
```

## Phase 3: Review Gate

Present the plan to the user and ask:

- Does this approach make sense for this content?
- Any specific examples, frameworks, or angles to include?

**Wait for explicit approval before writing. Do not proceed until the user confirms.**

## Phase 4: Write Content

Write the complete text class following the 6 principles:

1. **Open with substance** — no meta-commentary
2. **Teach directly** — the text contains the education, Claude is for practice
3. **Every paragraph earns its place** — no padding
4. **Right format for the idea** — tables, prose, code, checklists as appropriate
5. **End with momentum** — the reader knows what to do next
6. **Point to the wider world** — link to docs, books, tools, specs, source material

Let the content determine the structure. Use section names that describe
what's in the section. Include whatever serves the content:
- Named frameworks with tables
- Case studies and worked examples
- Failure stories
- Natural pause points
- Diagrams for visual concepts (consumer plugins like chimera-academy provide
  branding guidelines via overlays — e.g., dark navy-purple bg, white
  labels, Chimera accent colors, rounded containers; output saved to a
  consumer-specific holding folder — chimera-academy uses
  `nanobanana-output/` at the repo root)
- A Resources section connecting to the wider world — official docs, books,
  tools, source material

### Writing Rules:
- The text class teaches directly — Claude is the practice partner, not the teacher
- Never open with meta-commentary ("This text class will..." or "The video covered...")
- Drop the student straight into substance
- Use MDX components where appropriate: `<Callout>`, `<ProTip>`, `<CodeBlock>`
- Cross-reference existing frameworks by name where relevant (don't reinvent)

## Phase 5: Quality Check

Score the written content on the quality rubric (1-5 each):

1. Does the opening make you care within the first paragraph?
2. Could someone act on this without watching any video?
3. Is every section earning its place, or is anything there to fill space?
4. Does it end with momentum — does the reader know exactly what to do next?
5. Does it connect the reader to the wider world — docs, books, tools, specs?
6. Would you genuinely recommend this to a friend learning this topic?

Also scan for anti-patterns:
- [ ] No meta-commentary openings
- [ ] No "ask Claude to explain X" (Prompt Outsourcer)
- [ ] No walls of theory without application (Lecturer)
- [ ] No rigid worksheet sub-headers (Worksheet)
- [ ] No padding to fill space (Padder)
- [ ] No kitchen-sink coverage
- [ ] Framework inventory checked — no duplicates, new ones noted
- [ ] Tags from taxonomy only

Report the rubric scores and any anti-patterns found.

## Phase 6: Save

Save the file to the correct location (path convention is consumer-specific;
the chimera-academy convention is shown):

```
content/courses/{course-slug}/{module-slug}/classes/text-{NN}-{slug}.md
```

After saving, confirm:
- File path
- Quality rubric scores
- Any items for the user to review or decide on

## Overlay invocation (post-base-draft)

After producing the cmi5/xAPI-shaped base draft for this command, follow
`${CLAUDE_PLUGIN_ROOT}/assets/runtime/overlay-protocol.md` to discover and
apply consumer overlays. The runtime walks `<cwd>/.claude-plugin/plugin.json`,
finds skills declaring `overlay_target: ["write-text-class"]` in their
frontmatter, sorts them by `overlay_priority`, and applies them in order.

For this command, expect (when a consumer like `chimera-academy` is installed):
- Structural overlays (priority ~50) — e.g. content-standards: enforce
  CONTEXT→CONCEPT→BUILD→SHIP→REFLECT formula application, the
  "text classes carry the course" load-bearing rule, content-formula
  resource references
- Voice / editorial overlays (priority ~100) — e.g. academy-philosophy:
  Builder-First / AI-Native voice transforms, Chimera named frameworks,
  diagram branding guidelines

Layer 1 invariants (`au_id`, `activity_type`, stable IDs from the cmi5
contract) remain immutable — overlay outputs that mutate them abort the run
with a clear error pointing at the offending `SKILL.md` path. Layer 2
contradictions (Bloom's flatness, missing ship milestone) log a visible
warning but do not abort. Discovery returns zero overlays in a consumer
without `.claude-plugin/plugin.json` — the base draft is written directly,
voice-neutral, with no warning.

## Cross-PR dependencies

This command may delegate writing to a `text-class-writer` agent. That agent
migrates from `chimera-academy` in DOJ-3709. Until then, the agent is invoked
from the consumer's own `agents/` directory if present, or the command runs
with this prose as its sole guide (still functional, just less specialized).
