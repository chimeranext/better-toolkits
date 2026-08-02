---
description: Validate module completeness — checks all class types, frontmatter, frameworks, resources, and continuity
---

# Module Audit: $ARGUMENTS

You are auditing a module for completeness and quality. This is a READ-ONLY
operation — you report findings, you don't fix them.

**Arguments format**: `{module-path}`
- `module-path`: path relative to the consumer repo's content root (e.g.,
  `content/courses/agentic-coding/module-01-the-builder-mindset` for a
  chimera-academy-shaped repo). The runtime resolves paths relative to the cwd
  where the command was invoked.

This command is parallel to `course-audit` — `course-audit` operates at the
course level, `module-audit` operates at the module level. Use `module-audit`
to validate a single module's class inventory, type mix, frontmatter, and
continuity before declaring the module ready.

## Phase 1: Inventory

Read everything in the module:

1. Read `module-overview.md` — extract title, position, ship milestone, tags
2. List all files in the module's `classes/` directory
3. Read each class file — extract frontmatter (type, status, tags, position)
4. If a consumer ships a content-formula resource (e.g.
   `chimera-academy/skills/academy-philosophy/resources/content-formula.md`)
   load it for the recommended module type mix. The overlay invocation step
   at the end of this command surfaces it automatically when the consumer's
   `academy-philosophy` overlay is installed

Build an inventory table:

```
MODULE: [Title] (Position X of Y)
COURSE: [Course code]
SHIP MILESTONE: [from module overview]

CLASS INVENTORY:
| # | File | Type | Status | Words | Position |
|---|------|------|--------|-------|----------|
| 1 | video-01-... | video | draft | — | 1 |
| 2 | text-01-... | text | draft | ~2,400 | 2 |
| ... | ... | ... | ... | ... | ... |
```

## Phase 2: Type Mix Check

Compare the module's actual class mix against the recommended module flow:

**Recommended:**
```
1. Talking Head Video (3-8 min)           → "Here's WHY and WHAT"
2. Text Class(es)                         → Primary teaching content
3. Screen Demo (10-20 min)                → Optional "watch me do it"
4. Quiz (5-10 min)                        → Knowledge check
5. Challenge                              → BUILD deliverable (required)
```

**Check each:**

| Component | Required? | Present? | Status |
|-----------|-----------|----------|--------|
| At least 1 video (talking head) | Recommended | | |
| At least 1 text class | **Required** | | |
| Quiz (5-10 questions) | Recommended | | |
| Challenge (BUILD deliverable) | **Required** | | |

Flag as CRITICAL if:
- No text class exists (text classes are PRIMARY teaching content)
- No challenge exists (every module must have a BUILD deliverable)

Flag as WARNING if:
- No video brief exists
- No quiz exists

## Phase 3: Frontmatter Audit

For each class file, check frontmatter completeness:

| File | title | type | status | class_number | module_number | course_code | tags | position |
|------|-------|------|--------|-------------|--------------|-------------|------|----------|

Flag:
- Missing required fields
- Empty tags (should reference taxonomy)
- Status still `scaffold` (should be at least `draft` if content exists)
- Mismatched position_in_module (should be sequential, no gaps)

## Phase 4: Framework Check

For each text class (deep lesson or guide):

1. Read the content body
2. Identify named frameworks (look for bold/heading names + tables)
3. Cross-reference against the consumer's framework inventory file if one
   exists (e.g. `skills/academy-philosophy/resources/framework-inventory.md`
   in chimera-academy)

Report:
- Frameworks found in this module
- Any frameworks that are "just labels" (named but no table/structure)
- Cross-course references present (good) or missing (opportunity)
- Any duplicate frameworks (same concept, different name as in another course)

## Phase 5: Content Quality Spot Check

For each text class, score the quality rubric (1-5 each):

| Question | text-01 | text-02 | text-03 |
|----------|---------|---------|---------|
| 1. Opening makes you care? | | | |
| 2. Actionable without video? | | | |
| 3. Every section earns its place? | | | |
| 4. Ends with momentum? | | | |
| 5. Connects to wider world? | | | |
| 6. Would you recommend it? | | | |

Also check:

| Check | text-01 | text-02 | text-03 |
|-------|---------|---------|---------|
| Opens with substance (not meta-commentary) | | | |
| Diagram for visual concepts (loop/hierarchy/flow/tree) | | | |
| Cross-references to other module content | | | |
| No obvious anti-patterns | | | |

## Phase 6: Continuity Check

1. Do text classes reference each other? (text-02 should build on text-01)
2. Does the quiz test content from ALL text classes?
3. Does the challenge align with the ship milestone?
4. Does the module connect to the previous module? (no "Island Builder")
5. Does the module preview the next module?

## Phase 7: Report

Output a structured audit report:

```markdown
# Module Audit: [Title]

## Summary

**Completeness**: X/Y required components present
**Verdict**: COMPLETE | INCOMPLETE | CRITICAL GAPS

## Type Mix

| Component | Required? | Present? | Status |
|-----------|-----------|----------|--------|
| ... | ... | ... | ... |

## Critical Issues (must fix before shipping)
1. [Issue] — [What's missing] → [Action]

## Warnings (should fix)
1. [Issue] — [What's wrong] → [Action]

## Framework Inventory
- [Framework 1] — Deep (table + worked example)
- [Framework 2] — Label only (needs table)

## Continuity
- Previous module connection: [yes/no + detail]
- Internal cross-references: [yes/no + detail]
- Next module preview: [yes/no + detail]

## Recommendations
1. [Most impactful improvement]
2. [Second most impactful]
3. [Third most impactful]
```

## Overlay invocation (post-base-findings)

After producing the cmi5/xAPI-compliant base findings array for this command,
follow `${CLAUDE_PLUGIN_ROOT}/assets/runtime/overlay-protocol.md` §5.4
(findings-shaped Layer 1 enforcement) to discover and apply consumer
overlays. The runtime walks `<cwd>/.claude-plugin/plugin.json`, finds skills
declaring `overlay_target: ["module-audit"]` in their frontmatter, sorts them
by `overlay_priority`, and applies them in order.

**Findings-shaped contract** — pass the source artifact being audited via
`context._sourceArtifact` so the L1 invariant validator can scan each
finding's `recommended_change` text for L1 path mentions (`au_id`,
`activity_type`, etc.) before write. Layer 1 violations abort the run with a
clear error pointing at the offending overlay's `SKILL.md` path. The pre-loop
snapshot is taken against `_sourceArtifact`, not the findings array — the
findings array grows as overlays add findings, but the source artifact stays
constant for the entire run.

For this command, expect (when a consumer like `chimera-academy` is installed):
- Structural overlays (priority ~50) — e.g. content-standards: enforce the
  recommended type mix (text class + challenge required, video + quiz
  recommended), the "text classes carry the course" load-bearing rule, the
  module must end with a BUILD deliverable
- Voice / editorial overlays (priority ~100) — e.g. academy-philosophy:
  framework-inventory cross-references, named frameworks must have tables,
  Builder-First / AI-Native finding tone

Layer 1 invariants (`au_id`, `activity_type`, stable IDs from the cmi5
contract) remain immutable — overlay outputs that mutate them via
`recommended_change` text abort the run. Layer 2 contradictions (Bloom's
flatness, missing ship milestone) log a visible warning but do not abort.
Discovery returns zero overlays in a consumer without
`.claude-plugin/plugin.json` — the base findings are reported directly,
voice-neutral, with no warning.

## Cross-PR dependencies

This command may delegate inventory and quality checks to a `module-auditor`
agent (or equivalent reviewer agent in the consumer plugin). Those agents
migrate from `chimera-academy` in DOJ-3709. Until then, the agent is invoked
from the consumer's own `agents/` directory if present, or the command runs
with this prose as its sole guide (still functional, just less specialized).
