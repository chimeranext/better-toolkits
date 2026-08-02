---
description: Review existing content for quality and philosophy alignment
---

# Content Review: $ARGUMENTS

You are reviewing content for quality, philosophy alignment, and anti-pattern
detection. This command is file/lesson/module/course-scoped — distinct from
`course-audit`, which always operates at the course level. Use
`content-review` when you want to evaluate a single file, a single lesson, a
specific module, or "all" without committing to the full course-audit
pipeline.

**Arguments format**: free-form scope — a file path, a lesson reference, a
module path, a course slug, or the literal string `all`.

## Phase 1: Scope

Determine what to review based on `$ARGUMENTS`:

- **Specific lesson**: Review a single lesson's MDX content
- **Module**: Review all lessons and classes in a module
- **Course**: Review the entire course structure and content
- **"all"**: Full audit across all available content

Locate the content to review:
- Database content: Load from the consumer's admin UI or provided content
- File content: Check the consumer's content root for archival MDX files
  (e.g., `content/courses/` in a chimera-academy-shaped repo)
- Provided content: Review content pasted directly by the user

## Phase 2: Review Execution

Run checks in two tiers: **Value Checks** (do these first — they determine
if the content works) and **Quality Checks** (framework compliance and
polish).

---

### VALUE CHECKS (these determine if the course works)

### Check 1: The Standalone Test (MOST IMPORTANT)

For each module, answer: **Can a student complete the challenge using ONLY
the text class(es)?**

| Question | Pass | Fail |
|----------|------|------|
| Does the text class teach the complete concept, or just summarize the video? | Teaches directly — tables, frameworks, worked examples | "As the video explained..." or 300-word reference card |
| Could a student who never watches a single video pass the quiz? | Yes — all quiz concepts are in the text | No — key concepts only exist in video briefs |
| Is the text class deep enough to act on? | 800-4000 words of real teaching | 300 words of bullet points |
| Does the text class contain at least one named framework with a table? | Yes — something referenceable | No reusable mental models |

If ANY module fails the standalone test, flag it as **CRITICAL**. The text
class must carry the course. Videos complement — they may repeat concepts in
a different medium, but they must never be the only place a concept is
taught.

### Check 2: The Hiring Test

For each challenge, answer: **Would you hire someone who completed this?**

| Question | Pass | Fail |
|----------|------|------|
| Is the deliverable something the student would show a colleague? | Deployed URL, working repo, real project artifact | "Principles document" or reflection essay |
| Are success criteria specific and verifiable? | "URL loads in browser" / "3 features pass tests" | "Demonstrates understanding" |
| Does it build on the same project thread? | Uses the project from previous modules | New disconnected exercise each time |
| Does the challenge escalate from previous modules? | More public, more real, more complex | Same type of output every time |

### Check 3: Philosophy Alignment

The default value-tier philosophy checks (Builder-First, AI-First, Product
Over Theory, Open Source & Public) ship as a structural overlay in
consumer plugins like `chimera-academy`. When that overlay is installed, it
adds these checks during the overlay invocation step:

- **Builder-First**: Does it start with "you'll build..." not "you'll learn about..."?
- **AI-First**: Is AI the default tool, not an afterthought?
- **Product Over Theory**: Does it produce a tangible deliverable?
- **Open Source & Public**: Does it encourage sharing and building in public?

In a consumer without that overlay, this check is skipped (no warning) — the
base findings only cover the standalone and hiring tests.

---

### QUALITY CHECKS (framework compliance and polish)

### Check 4: Text Class Quality Rubric

Score the text class on the 6-question rubric (1-5 each):

1. Does the opening make you care within the first paragraph?
2. Could someone act on this without watching any video? (mirrors standalone test)
3. Is every section earning its place, or is anything there to fill space?
4. Does it end with momentum — does the reader know exactly what to do next?
5. Does it connect the reader to the wider world — docs, books, tools, specs?
6. Would you genuinely recommend this to a friend learning this topic?

**Aggregation rule (rubric → quality score)**: the 1-5 per-question rubric
above feeds the 1-10 quality scores in Phase 3. Average the six rubric
scores (max 5.0) and double the result to get a 1-10 contribution. The Phase
3 verdict thresholds (≥ 7 PASS, 5-6 NEEDS WORK, ≤ 4 FAIL) operate on the
1-10 scale, never on the raw 1-5 rubric.

Also verify the 6 principles:
- Opens with substance (not meta-commentary)
- Teaches directly (text contains the education, Claude is for practice)
- Every paragraph earns its place (no padding)
- Right format for the idea (tables, prose, code as appropriate)
- Ends with momentum
- Points to the wider world (resources, docs, links)

For code lessons, also check:
- Direction-based prompting (teaches how to prompt, not what to copy-paste)
- No "ask Claude to explain X" (Prompt Outsourcer)

### Check 5: Anti-Pattern Detection

| Pattern | Severity | What to Look For |
|---------|----------|-----------------|
| The Lecturer | Critical | >30% theory without code |
| The Hello-Worlder | Critical | Trivial BUILD that never ships |
| The Syntax Teacher | Critical | Teaching syntax instead of intent |
| The Passive Consumer | Critical | No hands-on exercise |
| The Island Builder | Warning | No connection to adjacent content |
| The Abstract Thinker | Warning | Capstone is a document, not deployed |
| The Kitchen Sink | Warning | Covers everything about a topic |
| The Copy-Paster | Info | Code blocks without evaluation |
| The Prompt Copier | Warning | BUILD provides exact prompts to copy instead of teaching prompt structure and direction |

### Check 6: Tag Taxonomy Compliance

Tag taxonomy is consumer-specific. When a consumer ships a tag-taxonomy
resource (e.g. `skills/academy-philosophy/resources/tag-taxonomy.md` in
chimera-academy), the structural overlay loads it during invocation:

- Verify all tags exist in the consumer's taxonomy
- Flag invented tags
- Suggest missing relevant tags

In a consumer without a tag taxonomy resource, this check is skipped.

### Check 7: Platform Alignment

- No frontmatter in lesson body content
- MDX components used correctly
- Class types properly categorized
- Content suitable for DB storage

### Check 8: Visual Aid Coverage

- Does the text class teach any visual concept (loop, hierarchy, flow,
  decision tree, spectrum, architecture, comparison)?
- If yes: is there a generated diagram embedded? (consumer plugins specify
  the holding folder — chimera-academy uses `nanobanana-output/` at the repo
  root, with relative-path embeds like
  `![...](../../../../../nanobanana-output/...)`)
- If no diagram exists for a visual concept, flag as **Missing Diagram**
  with suggested diagram type
- Diagram should be placed after concept intro, before detailed table /
  explanation
- Consumer plugins may ship a diagram inventory checklist (e.g.
  `content/_diagram-checklist.md` in chimera-academy)

### Check 9: 4D Framework Alignment

Evaluate how well the content prepares students to be AI-fluent practitioners:

| Dimension | Question | What to Look For |
|-----------|----------|-----------------|
| **Delegation** | Is it clear what the student does vs what AI does? | BUILD sections should explicitly state when to use Claude and when to think independently |
| **Description** | Does the content teach students to communicate effectively with AI? | Students should learn to describe WHAT they want, provide context, and specify constraints — not just copy prompts |
| **Discernment** | Does the content teach students to EVALUATE AI output? | Every AI interaction should include evaluation criteria — "What to Look For" and "When It's Not Right" |
| **Diligence** | Does the content model responsible AI use? | Transparency about AI limitations, ownership of AI-assisted output, verification before shipping |

## Phase 3: Scoring

### Value Scores (these matter most)

- **Standalone Score**: Can a student complete challenges using only text classes? (PASS/FAIL per module)
- **Hiring Score**: Would you hire someone who completed these challenges? (PASS/FAIL per module)
- **Project Thread**: Do modules build on the same project? (YES/NO)

### Quality Scores (1-10 each)

- **Philosophy Score**: How well does content embody the consumer's pillars? (only when philosophy overlay is installed)
- **Action Score**: How much does the student DO vs READ?
- **Ship Score**: Does something get deployed, shared, or committed? (A document is not a ship.)
- **AI Integration Score**: Are AI prompts, evaluation, and refinement included?
- **AI Fluency Score**: Does the content develop the student's ability to work WITH AI, not just USE AI?

**Verdict**:
- **PASS**: All value scores pass, all quality scores ≥ 7, no critical issues
- **NEEDS WORK**: Value scores pass but quality scores 5-6, or has fixable issues
- **FAIL**: Any value score fails (standalone test, hiring test), or any quality score ≤ 4

## Phase 4: Report

Output a structured review report:

```markdown
# Content Review: [Title]

## Value Assessment

| Test | Result | Evidence |
|------|--------|----------|
| Standalone (text carries the course) | PASS/FAIL per module | [which modules fail and why] |
| Hiring (challenges produce real artifacts) | PASS/FAIL per module | [which challenges fail and why] |
| Project Thread (single project M2→capstone) | YES/NO | [where the thread breaks] |

## Quality Scores

**Verdict**: PASS / NEEDS WORK / FAIL
**Composite Score**: X/10

| Dimension | Score | Notes |
|-----------|-------|-------|
| Philosophy | X/10 | [brief note] |
| Action | X/10 | [brief note] |
| Ship | X/10 | [brief note] |
| AI Integration | X/10 | [brief note] |
| AI Fluency | X/10 | [brief note] |

## Issues Found

### Critical (must fix)
1. [Issue] — [Location] → [Fix]

### Warning (should fix)
1. [Issue] — [Location] → [Fix]

### Info (nice to fix)
1. [Issue] — [Location] → [Fix]

## Anti-Patterns Detected
- [Pattern]: [Where] → [How to fix]

## Tag Review
- Tags used: [list]
- Invalid tags: [list]
- Suggested additions: [list]

## Top 3 Improvements
1. [Most impactful improvement with specific instructions]
2. [Second most impactful]
3. [Third most impactful]
```

If reviewing a module or course, also include:
- **Module-level continuity**: Do lessons flow? Do they reference each other?
- **Ship milestone progression**: Does shipping escalate properly?
- **Type mix**: Right balance of text classes, videos, quizzes, challenges?

## Priority Guide

When multiple issues exist, prioritize fixes in this order:

1. **Standalone test failures** — text classes that can't carry the module without video
2. **Hiring test failures** — challenges that produce documents instead of real artifacts
3. **Broken project thread** — modules using disconnected example projects
4. **Critical anti-patterns** (Prompt Outsourcer, Meta-Narrator, Lecturer)
5. **Low quality rubric scores** (any score 3 or below)
6. **Missing substance** — no practical application or worked examples
7. **Tag taxonomy violations**
8. **MDX component issues**

## Overlay invocation (post-base-findings)

After producing the cmi5/xAPI-compliant base findings array for this command,
follow `${CLAUDE_PLUGIN_ROOT}/assets/runtime/overlay-protocol.md` §5.4
(findings-shaped Layer 1 enforcement) to discover and apply consumer
overlays. The runtime walks `<cwd>/.claude-plugin/plugin.json`, finds skills
declaring `overlay_target: ["content-review"]` in their frontmatter, sorts
them by `overlay_priority`, and applies them in order.

**Findings-shaped contract** — pass the source artifact being reviewed via
`context._sourceArtifact` so the L1 invariant validator can scan each
finding's `recommended_change` text for L1 path mentions (`au_id`,
`activity_type`, etc.) before write. Layer 1 violations abort the run with a
clear error pointing at the offending overlay's `SKILL.md` path. The pre-loop
snapshot is taken against `_sourceArtifact`, not the findings array — the
findings array grows as overlays add findings, but the source artifact stays
constant for the entire run.

For this command, expect (when a consumer like `chimera-academy` is installed):
- Structural overlays (priority ~50) — e.g. content-standards: tag taxonomy
  enforcement, recommended type mix, ship-milestone presence, anti-pattern
  catalog (The Lecturer, The Hello-Worlder, The Prompt Copier, etc.)
- Voice / editorial overlays (priority ~100) — e.g. academy-philosophy:
  Builder-First / AI-Native pillar checks, 4D framework scoring, content-
  formula adherence, framework-inventory cross-references

Layer 1 invariants (`au_id`, `activity_type`, stable IDs from the cmi5
contract) remain immutable — overlay outputs that mutate them via
`recommended_change` text abort the run. Layer 2 contradictions (Bloom's
flatness, missing ship milestone) log a visible warning but do not abort.
Discovery returns zero overlays in a consumer without
`.claude-plugin/plugin.json` — the base findings are reported directly,
voice-neutral, with no warning.

## Cross-PR dependencies

This command may delegate review to a `content-reviewer` agent. That agent
migrates from `chimera-academy` in DOJ-3709. Until then, the agent is invoked
from the consumer's own `agents/` directory if present, or the command runs
with this prose as its sole guide (still functional, just less specialized).
