---
name: teaching-context
description: Generates and validates per-course teaching-context.md files — defines the target student persona, anxiety points, motivation, and AI positioning for consistent content creation
---

# Teaching Context Skill

Every course should have a `teaching-context.md` file at its root. This file defines WHO the student is, WHAT they're anxious about, WHY they're here, and HOW AI is positioned in the course. Without it, every content author (human or agent) makes different assumptions about the audience.

## What teaching-context.md Contains

```markdown
# Teaching Context: {Course Title}

## Target Student

**Who they are:** {1-2 sentences — role, experience level, background}
**What they know:** {what they're comfortable with coming in}
**What they don't know:** {the gap this course fills}

## Anxiety Points

What makes this student nervous about this topic:

| Anxiety | How It Manifests | How We Address It |
|---------|-----------------|-------------------|
| {e.g., "I'm not technical enough"} | {e.g., "Hesitates to start, over-researches before acting"} | {e.g., "First lesson produces a visible result in 15 minutes"} |
| {anxiety 2} | {manifestation} | {address} |
| {anxiety 3} | {manifestation} | {address} |

## Motivation

**Why they're here:** {the real reason, not the polite reason}
**What "success" looks like to them:** {the outcome they'd tell a friend about}
**What keeps them going:** {the specific moment that makes them say "this is worth it"}
**What makes them quit:** {the specific friction that causes dropout}

## Patience Profile

| Dimension | Level | Implication for Content |
|-----------|-------|------------------------|
| **Time per session** | {e.g., "30-60 min max"} | {e.g., "Every text class must be completable in one sitting"} |
| **Tolerance for theory** | {Low / Medium / High} | {e.g., "CONCEPT sections must be <500 words"} |
| **Tolerance for errors** | {Low / Medium / High} | {e.g., "Troubleshooting tables are critical"} |
| **Need for quick wins** | {Low / Medium / High} | {e.g., "First BUILD must produce visible output in 10 min"} |

## AI Positioning

How AI (Claude or whichever assistant the consumer ships as default) is used in this course:

| AI Role | What It Means | What to AVOID |
|---------|-------------|---------------|
| {e.g., "Practice partner"} | {e.g., "Students use the AI to apply concepts the text class taught"} | {e.g., "'Ask the AI to explain X' — the text explains X"} |
| {e.g., "Code generator"} | {e.g., "Students direct the AI to write code based on their decisions"} | {e.g., "AI makes architectural decisions for the student"} |

## Voice and Tone

| Dimension | This Course's Voice |
|-----------|-------------------|
| **Formality** | {Casual / Conversational / Professional} |
| **Encouragement level** | {High cheerleader / Steady coach / Tough love} |
| **Technical depth** | {Metaphors only / Metaphors + mechanism / Full technical} |
| **Humor** | {None / Light / Regular} |
```

## When to Generate

Generate `teaching-context.md` when:
- A new course is created via the consumer's plan-course command (e.g. chimera-academy ships `/academy:plan-course`)
- A course exists but has no teaching context (check for the file)
- Content feels inconsistent across modules (different tone, different assumptions)

## How to Generate

1. Read the `course-overview.md` — extract target audience, prerequisites, course promise
2. Read the consumer's track map if it ships one (e.g. chimera-academy ships `skills/academy-philosophy/resources/track-map.md`) — understand where this course sits
3. If modules exist, read 1-2 text classes to infer the current voice/tone
4. Generate the teaching-context.md following the template above
5. Save to the consumer's course directory (path convention is consumer-specific; chimera-academy uses `content/courses/{course-slug}/teaching-context.md`)

## How It's Used

The teaching context is consumed by:
- **text-class-writer agent** (`${CLAUDE_PLUGIN_ROOT}/agents/text-class-writer.md`) — reads it during context gathering to match voice and audience
- **student-perspective agent** (`${CLAUDE_PLUGIN_ROOT}/agents/student-perspective.md`) — adopts the student persona from this file
- **content-reviewer agent** (`${CLAUDE_PLUGIN_ROOT}/agents/content-reviewer.md`) — checks content against the audience profile
- **lesson-writer** (legacy) — same as text-class-writer

## Validation

A good teaching-context.md:
- [ ] Target student is specific (not "anyone interested in tech")
- [ ] Anxiety points are real (not "they might find it hard")
- [ ] Motivation is honest (the real reason, not the aspirational reason)
- [ ] Patience profile has implications for content (not just labels)
- [ ] AI positioning is clear about what the AI does and doesn't do
- [ ] Voice section is specific enough that two writers would produce similar tone
