---
description: Analyze a reference repository — maps architecture, extracts patterns, templates, and frameworks for course material
---

# Analyze Repo: $ARGUMENTS

You are analyzing a reference repository to extract architecture patterns,
conventions, and teachable frameworks for course creation. The output is a
structured analysis artifact that feeds course planning, module authoring,
and framework extraction.

**Arguments format:** `{repo-path-or-url} [--for course-slug]`

- **repo-path-or-url**: Local path (e.g., `~/Dev/my-project`) or GitHub URL
  (e.g., `https://github.com/org/repo`)
- **--for**: Target course slug for saving artifacts (e.g.,
  `claude-code-mastery`). If omitted, saves to the cwd. The runtime resolves
  the save path relative to the consumer repo's content root convention.

## Phase 1: Locate Repository

Determine the repo source:

### If a local path:
- Verify the directory exists
- Read the root: `README.md`, `package.json` / `Cargo.toml` /
  `pyproject.toml` / `go.mod` (whichever applies)
- Run `git log --oneline -20` for recent activity

### If a GitHub URL:
- Use WebFetch to read the repo's README and directory structure
- If deeper analysis is needed, clone via Bash to a temporary directory
- Check: stars, last commit date, open issues count

### Identify basics:
```
REPO: {name}
━━━━━━━━━━━━

URL/Path: {location}
Language: {primary language}
Framework: {primary framework, if any}
Purpose: {what this repo does, in one line}
License: {license type}
Activity: {last commit date, commit frequency}
Size: {files, LOC estimate}
```

## Phase 2: Analysis Plan

Present what will be analyzed:

```
ANALYSIS PLAN: {repo-name}
━━━━━━━━━━━━━━━━━━━━━━━━━

TARGET COURSE: {course-slug or "none specified"}

WILL ANALYZE:
  1. Directory structure — annotated tree with purpose of each directory
  2. Architecture patterns — how the codebase is organized and why
  3. Conventions — naming, file structure, code style patterns
  4. Reusable artifacts — templates, configs, examples worth teaching
  5. Framework extraction — teachable patterns and mental models

FOCUS AREAS:
  - {area 1 based on repo type — e.g., "API route organization" for a web app}
  - {area 2 — e.g., "state management approach"}
  - {area 3 — e.g., "testing strategy"}

ESTIMATED TIME: {quick estimate}
```

## Phase 3: Review Gate

**STOP. Present the analysis plan to the user BEFORE executing.**

Ask:
- Does this analysis scope look right?
- Any specific areas to focus on or skip?
- Any particular patterns you're looking for?

Wait for explicit approval.

## Phase 4: Execute Analysis

### 4a. Directory Structure

Map the full directory tree with annotations:

```
{repo-name}/
├── src/                    # {purpose}
│   ├── components/         # {purpose + pattern used}
│   ├── lib/                # {purpose}
│   └── routes/             # {purpose + routing pattern}
├── tests/                  # {testing approach}
├── config/                 # {what's configured here}
└── {other dirs}            # {purpose}
```

Note: directory depth, naming conventions, separation of concerns pattern.

### 4b. Architecture Patterns

Identify and document:
- **Overall architecture**: Monolith, microservices, serverless, monorepo, etc.
- **Data flow**: How data moves through the system
- **State management**: How state is handled
- **Error handling**: Patterns for errors and edge cases
- **Authentication/Authorization**: If present, how it's implemented
- **API design**: REST, GraphQL, RPC — conventions used

For each pattern found:
```
PATTERN: {name}
WHERE: {files/directories where this appears}
HOW: {brief description of the implementation}
TEACHABLE: {yes/no — could this be taught as a framework?}
```

### 4c. Convention Identification

Extract:
- File naming conventions (kebab-case, camelCase, etc.)
- Component/module structure patterns
- Import/export conventions
- Configuration patterns
- Environment management
- Git workflow (branch naming, commit style)

### 4d. Reusable Artifacts

Find and catalog:
- Configuration files worth studying (ESLint, TypeScript, Docker, CI/CD)
- Template files or generators
- Example implementations
- Documentation patterns
- Testing utilities or fixtures

For each artifact:
```
ARTIFACT: {filename or pattern}
PURPOSE: {what it does}
TEACHING VALUE: {how this could be used in a course}
```

### 4e. Framework Extraction

From all findings, extract teachable frameworks:

1. Named patterns that could become teachable course frameworks
2. Decision matrices implicit in the code (e.g., "when to use X vs Y")
3. Workflow patterns that could be systematized
4. Cross-reference against the consumer's framework inventory file if one
   exists (e.g. `content/_framework-inventory.md` in chimera-academy) for
   duplicate detection

## Phase 5: Save

### Determine save location:

If `--for` flag is provided (path convention is consumer-specific; the
chimera-academy convention is shown):
```
content/courses/{course-slug}/research/repo-analysis-{repo-name}.md
```

If no `--for` flag:
```
./repo-analysis-{repo-name}.md
```

### Output format:

Save a single structured analysis file:

```markdown
# Repo Analysis: {repo-name}

**Date**: {date}
**URL/Path**: {location}
**Analyzed for**: {course-slug or "general reference"}

## Overview

| Field | Value |
|-------|-------|
| Language | {language} |
| Framework | {framework} |
| Purpose | {purpose} |
| License | {license} |
| Activity | {last commit, frequency} |
| Size | {files, LOC} |

## Directory Structure

{annotated tree}

## Architecture Patterns

### {Pattern 1 Name}
{description, location, teachability}

### {Pattern 2 Name}
{description, location, teachability}

## Conventions

| Convention | Pattern | Example |
|-----------|---------|---------|
| File naming | {pattern} | {example} |
| Components | {pattern} | {example} |
| ... | ... | ... |

## Reusable Artifacts

| Artifact | Purpose | Teaching Value |
|----------|---------|---------------|
| {file} | {purpose} | {value} |

## Framework Extraction

| # | Framework Name | Source Pattern | Type | Teaching Use |
|---|---------------|---------------|------|-------------|
| 1 | {name} | {where in repo} | Adoptable/Adaptable/Original | {use} |

## Key Takeaways

1. {most important finding for course creation}
2. {second most important}
3. {third most important}

## Recommended Actions

1. {what to do with these findings}
2. {what to investigate further}
```

Present a summary to the user:

```
ANALYSIS COMPLETE: {repo-name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SAVED TO: {path}

FINDINGS:
  - {N} architecture patterns identified
  - {N} conventions documented
  - {N} reusable artifacts cataloged
  - {N} teachable frameworks extracted

TOP PATTERNS:
  1. {pattern} — {one-line description}
  2. {pattern} — {one-line description}
  3. {pattern} — {one-line description}

FRAMEWORKS EXTRACTED: {N total} ({X adoptable, Y adaptable, Z original})
```

## Overlay invocation (post-base-draft)

After producing the cmi5/xAPI-shaped base draft for this command, follow
`${CLAUDE_PLUGIN_ROOT}/assets/runtime/overlay-protocol.md` to discover and
apply consumer overlays. The runtime walks `<cwd>/.claude-plugin/plugin.json`,
finds skills declaring `overlay_target: ["analyze-repo"]` in their
frontmatter, sorts them by `overlay_priority`, and applies them in order.

For this command, expect (when a consumer like `chimera-academy` is installed):
- Structural overlays (priority ~50) — e.g. content-standards: enforce
  framework-extraction format conventions, cross-reference against the
  consumer's framework inventory, target save-path conventions
- Voice / editorial overlays (priority ~100) — e.g. academy-philosophy:
  Adoptable / Adaptable / Original framework typing, Builder-First framing
  in "Teaching Value" column, Chimera named-framework style for surfaced
  patterns

Layer 1 invariants (`au_id`, `activity_type`, stable IDs from the cmi5
contract) remain immutable — overlay outputs that mutate them abort the run
with a clear error pointing at the offending `SKILL.md` path. Layer 2
contradictions (Bloom's flatness, missing source attribution) log a visible
warning but do not abort. Discovery returns zero overlays in a consumer
without `.claude-plugin/plugin.json` — the base analysis is written
directly, voice-neutral, with no warning.
