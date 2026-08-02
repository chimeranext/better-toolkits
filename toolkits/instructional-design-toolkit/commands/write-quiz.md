---
description: Generate a module quiz from completed text classes
---

# Write Quiz: $ARGUMENTS

You are generating a module quiz. The quiz tests understanding of the
module's text classes — it checks whether students grasped the concepts well
enough to apply them, not whether they memorized definitions.

## Phase 1: Context Loading

Load the module content and authoring resources:

1. Identify the course and module from `$ARGUMENTS` (e.g., `agentic-coding module-03`)
2. Read **all text classes** in the module's `classes/` directory — these
   are the primary teaching content the quiz covers
3. Read the **module overview** (`module-overview.md`) — understand the
   ship milestone and module goals
4. Read the **quiz template** if the consumer ships one (e.g.
   `content/_templates/quiz.md` in chimera-academy) — follow its exact
   frontmatter and format
5. If a consumer-side `content-formula.md` resource exists (e.g.
   `chimera-academy/skills/academy-philosophy/resources/content-formula.md`)
   read it for quiz rules and the BUILD philosophy. The overlay invocation
   step at the end of this command surfaces it automatically when an
   `academy-philosophy` overlay is installed

Identify:
- Module title and position in the course
- Key concepts taught across all text classes
- The module's BUILD deliverable / ship milestone
- Any frameworks, mental models, or decision criteria the student should have internalized

## Phase 2: Question Generation

Generate 5-10 questions following these rules:

### Question Philosophy
- Questions test **UNDERSTANDING**, not memorization
- Never ask "What is the definition of X?" — ask "When would you use X over Y?"
- Every wrong answer should be plausible (no trick answers, no joke options)
- Every explanation should **TEACH** — reinforce the concept, don't just say "Correct!"

### Question Types (mix these)
- **Concept application**: "You're building X and encounter Y. What's the best approach?"
- **Scenario-based**: "A teammate suggests Z. What's the strongest counter-argument?"
- **Which approach**: "Which of these follows the [principle] from this module?"
- **Comparison**: "What's the key difference between A and B?"
- **BUILD-connected**: At least 1 question directly about the module's ship milestone or challenge deliverable

### Difficulty Tiers
Distribute questions across three tiers:

| Tier | Count | Description |
|------|-------|-------------|
| **Foundation** | 2-3 questions | Core concepts — any attentive student should get these |
| **Application** | 2-4 questions | Apply concepts to realistic scenarios |
| **Integration** | 1-3 questions | Combine multiple concepts or make judgment calls |

### Format Rules
- 3-5 options per question (4 is the sweet spot)
- Passing score: **70%**
- Allow retry: **true**
- Every answer includes an explanation that teaches (2-3 sentences minimum)
- Explanations for wrong answers should explain WHY they're wrong, not just that they are

### Output Format

Follow the quiz template exactly:

```markdown
---
class_number: {N}
title: "{Module Title} Quiz"
type: quiz
module_number: {N}
course_code: "{code}"
status: draft
position_in_module: {N — typically last or second-to-last}
passing_score: 70
allow_retry: true
tags: []
last_updated: "{YYYY-MM-DD}"
author: "claude"
---

# Quiz: {Title}

## Questions

### Q1: {Question text}
- A) {Option}
- B) {Option}
- C) {Option}
- D) {Option}

**Correct:** {Letter}
**Explanation:** {2-3 sentences that TEACH — reinforce the concept, reference what the text class covered}

### Q2: ...
```

## Phase 3: Review Gate

Present all questions to the user organized by difficulty tier:

```
QUIZ: [Module Title] ([N] questions)
PASSING SCORE: 70%
SOURCE: [list text classes used]

FOUNDATION (N questions):
  Q1: [question summary] — tests [concept]
  Q2: [question summary] — tests [concept]

APPLICATION (N questions):
  Q3: [question summary] — tests [concept]
  Q4: [question summary] — tests [concept]

INTEGRATION (N questions):
  Q5: [question summary] — tests [concept]
```

Ask:
- Are the difficulty tiers balanced for this module's audience?
- Should any questions be replaced, reworded, or cut?
- Is the BUILD deliverable question strong enough?

**Wait for explicit approval before saving.**

## Phase 4: Save

Save to (consumer-specific path; chimera-academy convention shown):
`content/courses/{course-slug}/{module-slug}/classes/quiz-{NN}-{slug}.md`

Naming convention:
- Quiz number is typically `01` (one quiz per module)
- Slug should be descriptive (e.g., `quiz-01-builder-mindset.md`, `quiz-01-context-engineering.md`)

After saving:
- Confirm the file path to the user
- Note any text classes that were thin on testable content (flag for potential revision)

## Overlay invocation (post-base-draft)

After producing the cmi5/xAPI-shaped base draft for this command, follow
`${CLAUDE_PLUGIN_ROOT}/assets/runtime/overlay-protocol.md` to discover and
apply consumer overlays. The runtime walks `<cwd>/.claude-plugin/plugin.json`,
finds skills declaring `overlay_target: ["write-quiz"]` in their
frontmatter, sorts them by `overlay_priority`, and applies them in order.

For this command, expect (when a consumer like `chimera-academy` is installed):
- Structural overlays (priority ~50) — content-standards: enforce 5-10
  question count, 3-tier difficulty distribution, 70% passing score, BUILD
  deliverable question requirement, "explanations teach" rubric
- Voice / editorial overlays (priority ~100) — academy-philosophy:
  Builder-First / AI-Native voice in question prose, scenario phrasing,
  explanation tone

Layer 1 invariants (`au_id` for the quiz AU, `activity_type =
.../assessment`, stable question IDs, `mastery_score` semver class)
remain immutable — overlay outputs that mutate them abort the run with
a clear error pointing at the offending `SKILL.md` path. Layer 2
contradictions (e.g., trick options, memorization-only questions)
log a visible warning but do not abort. Discovery returns zero overlays
in a consumer without `.claude-plugin/plugin.json` — the base draft is
written directly, voice-neutral.
