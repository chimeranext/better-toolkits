---
description: Deep-dive into a topic, framework, or tech stack — produces platform-summary, teaching-context draft, and framework extraction for course creation
---

# Research: $ARGUMENTS

You are conducting deep research on a topic to prepare for course creation.
The output is a set of structured artifacts (platform summary, teaching
context draft, framework extraction, source registry, session log) that
feed directly into downstream authoring commands like `new-course` and
`write-module`.

**Arguments format:** `{topic} [--depth shallow|deep] [--type docs|repo|landscape|all]`

- **topic**: What to research (e.g., "starknet", "supabase auth",
  "react server components")
- **--depth**: `shallow` (quick scan, 1 session) or `deep` (comprehensive,
  multiple sources). Default: `deep`
- **--type**: `docs` (official documentation), `repo` (reference repos),
  `landscape` (competing courses/tutorials), `all`. Default: `all`

## Phase 1: Discover

Parse $ARGUMENTS to identify:
- The topic scope
- Depth setting (default: deep)
- Type filter (default: all)

Search for the topic landscape:
1. Use WebSearch to find: official documentation site, official GitHub repos,
   key community resources, existing courses/tutorials on this topic
2. Use Context7 MCP (`resolve-library-id` then `query-docs`) for documented
   libraries — this is the fastest path to structured docs
3. Identify the ecosystem: related tools, competing solutions, common pairings

Present a **source map** to the user:

```
SOURCE MAP: {topic}
━━━━━━━━━━━━━━━━━━

Official:
  - {name} — {url} — {what it covers}
  - {name} — {url} — {what it covers}

Community:
  - {name} — {url} — {what it covers}

Repos:
  - {repo} — {stars, activity} — {what it demonstrates}

Courses/Tutorials:
  - {name} — {url} — {what they teach}
```

## Phase 2: Research Plan

Present a structured plan before executing:

```
RESEARCH PLAN: {topic}
━━━━━━━━━━━━━━━━━━━━

SCOPE: {what we're investigating and why}
DEPTH: shallow / deep
COURSE TARGET: {course code if known, or "new course TBD"}

SOURCES TO INVESTIGATE:
  Official Docs:
  1. {url} — {what to extract}
  2. {url} — {what to extract}

  Reference Repos:
  1. {repo} — {what to analyze}

  Competing Courses/Tutorials:
  1. {name} — {what they cover}

EXPECTED ARTIFACTS:
  - platform-summary.md — {yes/no, scope}
  - teaching-context.md — {yes/no, scope}
  - framework-extraction.md — {yes/no, estimated frameworks}
  - RESEARCH.md — {session log}
  - sources.md — {source registry}

ESTIMATED SCOPE: {N sources, ~X pages of docs, Y repos}
```

## Phase 3: Review Gate

**STOP. Present the plan to the user BEFORE executing the deep-dive.**

Ask:
- Does this scope look right?
- Any sources to add or skip?
- Is there a target course code for these artifacts?

Wait for explicit approval.

## Phase 4: Execute Research

Execute the research based on --type filter:

### For --type docs (or all):
- Use Context7 MCP to pull structured documentation for known libraries
- Use WebFetch for official documentation pages
- Extract: core concepts, API surface, terminology, mental models, gotchas,
  version-specific notes
- Document each source with quality rating (authoritative / community /
  outdated)

### For --type repo (or all):
- For each reference repository:
  - Map directory structure with annotations
  - Identify architecture patterns and conventions
  - Extract reusable templates, configs, examples
  - Note: language, framework, build system, testing approach
- Save per-repo analysis as `research/repo-analysis-{repo-name}.md`

### For --type landscape (or all):
- For each competing course/tutorial:
  - What topics they cover (and what they skip)
  - What pedagogical approach they use
  - What projects/exercises they include
  - Their target audience and prerequisites
  - Gaps and opportunities for the new course
- Save as `research/competitive-landscape.md`

### For all types:
- Save raw findings to `research/` directory as they're produced
- Tag each finding with its source for traceability

## Phase 5: Extract Frameworks

From all research artifacts, extract teachable frameworks:

1. Identify named concepts, mental models, decision matrices, and workflows
   in the source material
2. For each, determine if it's:
   - **Adoptable** — can be taught directly with attribution
   - **Adaptable** — needs original framing but the core is solid
   - **Original** — gap in existing material, the new course should create
     a new framework
3. Cross-reference against the consumer's framework inventory file if one
   exists (e.g. `content/_framework-inventory.md` in chimera-academy) to avoid
   duplicates
4. Produce `research/framework-extraction.md`:

```
FRAMEWORK EXTRACTION: {topic}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| # | Framework Name | Source | Type | Teaching Use |
|---|---------------|--------|------|-------------|
| 1 | {name} | {source} | Adoptable | {how to use in course} |
| 2 | {name} | {source} | Adaptable | {how to use in course} |
| 3 | {name} | — | Original | {gap it fills} |

TOTAL: {N} frameworks ({X adoptable, Y adaptable, Z original})
```

## Phase 6: Produce Artifacts

Generate these files from the research:

### 1. `platform-summary.md`
Concise authoring reference for content creators. Match the style of any
existing platform summaries the consumer ships:
- Decision doc format — tables over prose
- ~150 lines maximum
- Sections: Overview, Core Concepts, Key Terminology,
  Architecture/Mental Model, Common Patterns, Gotchas, Version Notes
- Every statement sourced

### 2. `teaching-context.md`
Draft student persona for this topic. Match the template the consumer
ships if one exists (e.g. `content/_templates/teaching-context.md` in
chimera-academy):
- Who is the student?
- What do they already know?
- What are they trying to achieve?
- What misconceptions will they bring?
- What's the "aha moment"?

### 3. `research/RESEARCH.md`
Full research session log:
- Date, topic, depth, type filter
- Sources consulted (with timestamps)
- Key findings per source
- Open questions and areas needing further investigation

### 4. `research/sources.md`
Source registry with quality ratings:

```
| # | Source | URL | Type | Quality | Last Verified | Notes |
|---|--------|-----|------|---------|--------------|-------|
| 1 | {name} | {url} | docs | Authoritative | {date} | {notes} |
```

### 5. `research/framework-extraction.md`
Named frameworks ready for content creation (produced in Phase 5).

### 6. `research/competitive-landscape.md` (if --type includes landscape)
What else exists and where the new course can differentiate.

## Phase 7: Save & Report

Save all artifacts to the consumer's course directory (path convention is
consumer-specific; the chimera-academy convention is shown):

```
content/courses/{course-slug}/
```

Create the directory if needed. If no course slug is known, save to a
temporary research directory the consumer documents (e.g.
`content/research/{topic-slug}/` in chimera-academy).

Present a summary:

```
RESEARCH COMPLETE: {topic}
━━━━━━━━━━━━━━━━━━━━━━━━━

SOURCES CONSULTED: {N total} ({X docs, Y repos, Z courses})
ARTIFACTS PRODUCED:
  - platform-summary.md — {line count} lines
  - teaching-context.md — draft ready for review
  - research/RESEARCH.md — session log
  - research/sources.md — {N} sources cataloged
  - research/framework-extraction.md — {N} frameworks extracted
  - research/competitive-landscape.md — {N} competitors analyzed (if applicable)

KEY INSIGHTS:
  1. {most important finding}
  2. {second most important}
  3. {third most important}

FRAMEWORKS: {N total} ({X adoptable, Y adaptable, Z original})

RECOMMENDED NEXT STEPS:
  1. Review platform-summary.md and teaching-context.md
  2. Run /new-course with these artifacts loaded
  3. {any topic-specific recommendation}
```

## Overlay invocation (post-base-draft)

After producing the cmi5/xAPI-shaped base draft for this command, follow
`${CLAUDE_PLUGIN_ROOT}/assets/runtime/overlay-protocol.md` to discover and
apply consumer overlays. The runtime walks `<cwd>/.claude-plugin/plugin.json`,
finds skills declaring `overlay_target: ["research"]` in their frontmatter,
sorts them by `overlay_priority`, and applies them in order.

For this command, expect (when a consumer like `chimera-academy` is installed):
- Structural overlays (priority ~50) — e.g. content-standards: target
  artifact paths under `content/courses/{slug}/`, source registry quality
  rating vocabulary, platform-summary line cap, framework inventory
  cross-checks
- Voice / editorial overlays (priority ~100) — e.g. academy-philosophy:
  Adoptable / Adaptable / Original framework typing, Builder-First framing
  in teaching-context drafts, Chimera named-framework style for surfaced
  concepts

Layer 1 invariants (`au_id`, `activity_type`, stable IDs from the cmi5
contract) remain immutable — overlay outputs that mutate them abort the run
with a clear error pointing at the offending `SKILL.md` path. Layer 2
contradictions (Bloom's flatness, missing source attribution) log a visible
warning but do not abort. Discovery returns zero overlays in a consumer
without `.claude-plugin/plugin.json` — the base research artifacts are
written directly, voice-neutral, with no warning.

## Cross-PR dependencies

This command may delegate per-source extraction to specialist agents (e.g.
a `repo-analyzer` agent or a `landscape-scout` agent). Those agents migrate
from `chimera-academy` in DOJ-3709. Until then, the agent is invoked from the
consumer's own `agents/` directory if present, or the command runs with
this prose as its sole guide (still functional, just less specialized).
