---
description: Plan a track overview — maps all courses in a category with prerequisites, certification path, and gap analysis
---

# New Track: $ARGUMENTS

You are generating a track (or path) overview for a course category. The
output maps all courses in the track, the prerequisite graph,
certifications, and gaps. This is the planning artifact for a multi-course
sequence — distinct from `new-course`, which plans a single course.

**Arguments format**: `{category-name}`
- `category-name`: matches a category defined in the consumer's track map
  (e.g., `ai-native`, `vibe-coding`, `orientation`, `engineering`,
  `founders`, `blockchain`, `security`, `ai-literacy` for a
  chimera-academy-shaped repo). The runtime resolves track-map paths relative
  to the cwd where the command was invoked.

## Phase 1: Context Loading

Read the consumer's track resources:

1. `resources/track-map.md` (consumer-specific path) — course catalog,
   prerequisite graph, categories
2. `resources/certification-map.md` (consumer-specific path) — credentials,
   requirements, assessment formula

If the consumer does not ship these resources, ask the user to provide:
- The course catalog for this category (codes, titles, prerequisites)
- The certification(s) this track contributes to, if any

## Phase 2: Extract Track Data

Identify all courses in the `$ARGUMENTS` category:

1. Match `$ARGUMENTS` against category names in the track map
2. If no exact match, suggest the closest category and confirm with the
   user
3. List every course in the category with its code, title, and
   prerequisites

## Phase 3: Generate Track Overview

Build the track overview with these sections:

### Track Metadata

```
Track:        [Category name]
Courses:      [count]
Est. Hours:   [total across all courses]
Certifications: [credentials available in this track]
Entry Point:  [first course — no prerequisites needed or only entry-tier prerequisites]
```

### Prerequisite Graph

ASCII dependency tree showing course flow:

```
[entry course] ─── [course 2] ─┬─ [course 3a]
                                ├─ [course 3b] (+cross-req)
                                └─ [course 3c]
```

Include cross-track prerequisites with `(+course-code)` notation.

### Course Inventory

| # | Code | Title | Hours | Status | Prerequisites | Ship Milestone |
|---|------|-------|-------|--------|---------------|----------------|
| 1 | [code] | [title] | [hrs] | [scaffold/draft/final/uploaded] | [list] | [capstone or key deliverable] |

Check the consumer's content directory (e.g. `content/courses/` in
chimera-academy) to determine actual status:
- If course directory exists with content → check frontmatter for status
- If course directory exists but empty → `scaffold`
- If no directory → `planned`

### Certification Path

Map which certifications this track contributes to:

| Level | Credential | Courses Required | Assessment |
|-------|-----------|-----------------|------------|
| 1 | [Foundation cert] | [courses] | [exam + project] |
| 2 | [Specialist cert] | [courses] | [exam + capstone] |

### Gap Analysis

Identify issues:

- **Missing courses**: Courses listed in track map with no content
  directory
- **Missing prerequisites**: Courses that require a course not yet created
- **Incomplete courses**: Directories that exist but lack content
  (scaffold/outline only)
- **Orphan courses**: Courses in the directory but not in the track map

### Recommended Student Path

The suggested sequence through this track, accounting for prerequisites:

```
Step 1: [course] — [what you gain]
Step 2: [course] — [what you gain]
...
```

If the track has branching paths, show the fork with a brief "choose
based on..." note.

## Phase 4: Output

Display the track overview to the user. Do NOT save to a file unless the
user explicitly requests it.

If the user wants to save, save to a consumer-specific location (the
chimera-academy convention is `content/tracks/{category}-track-overview.md`).

## Overlay invocation (post-base-draft)

After producing the cmi5/xAPI-shaped base draft for this command, follow
`${CLAUDE_PLUGIN_ROOT}/assets/runtime/overlay-protocol.md` to discover and
apply consumer overlays. The runtime walks `<cwd>/.claude-plugin/plugin.json`,
finds skills declaring `overlay_target: ["new-track"]` in their
frontmatter, sorts them by `overlay_priority`, and applies them in order.

For this command, expect (when a consumer like `chimera-academy` is installed):
- Structural overlays (priority ~50) — e.g. content-standards: enforce
  the section roster (Track Metadata, Prerequisite Graph,
  Course Inventory, Certification Path, Gap Analysis, Recommended Student
  Path), course status vocabulary aligned with the consumer's status enum
  (scaffold / outline / draft / final / uploaded), cross-track prerequisite
  notation
- Voice / editorial overlays (priority ~100) — e.g. academy-philosophy:
  Builder-First framing in the "what you gain" column, ship-milestone
  vocabulary, opinionated track narrative for the Recommended Student Path

Layer 1 invariants (`au_id`, `activity_type`, stable IDs from the cmi5
contract) remain immutable — overlay outputs that mutate them abort the
run with a clear error pointing at the offending `SKILL.md` path. Layer 2
contradictions (Bloom's flatness, missing ship milestones, orphan course
detection) log a visible warning but do not abort. Discovery returns zero
overlays in a consumer without `.claude-plugin/plugin.json` — the base
track overview is rendered directly, voice-neutral, with no warning.
