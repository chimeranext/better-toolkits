---
name: research-methodology
description: Systematic research methodology for deep-diving into topics, frameworks, and tech stacks before course creation. Defines source quality standards, research artifact formats, and framework extraction criteria.
---

# Research Methodology

## When This Skill Applies

This skill activates when you need to investigate a topic deeply enough to teach it. It applies before any course content is written — the research phase that produces the knowledge artifacts (platform-summary.md, teaching-context.md, framework-extraction.md) that the content creation pipeline consumes.

**Use this when:**
- Planning a new course on a technology or framework
- Deep-diving into a topic before writing text classes
- Analyzing a reference repository for patterns worth teaching
- Building a platform-summary.md for an existing course
- Extracting frameworks from documentation or codebases

## The Research Principle

**Extract architecture, not features.** Anyone can list what a tool does. Course authors need to understand HOW it works, WHEN to use each part, and WHERE things go wrong. Architecture → decision points → frameworks → course content.

## Source Quality Hierarchy

Not all sources are equal. Rate every source:

| Tier | Source Type | Trust Level | Use For |
|------|-----------|------------|---------|
| **S** | Official documentation | Highest | Architecture, API, terminology, key numbers |
| **A** | Official blog posts, changelogs | High | Recent changes, design decisions, roadmap |
| **A** | Official GitHub repos, examples | High | Patterns, conventions, working code |
| **B** | Community-maintained docs | Medium | Verify against official before using |
| **B** | Expert blog posts (recognized contributors) | Medium | Insights, opinions, worked examples |
| **C** | Forum discussions, Stack Overflow | Low | Common mistakes, gotchas, real-world issues |
| **D** | Random blog posts, tutorials | Lowest | Cross-reference only, never trust alone |

**Rule:** Every fact in a platform-summary.md must trace to a Tier S or A source. Tier B-D sources are useful for identifying WHAT to investigate, not for stating facts.

## Research Artifact Standards

Every research session produces artifacts under the consumer plugin's research directory (path convention is consumer-specific; chimera-academy uses `content/courses/{course-slug}/research/`). Each artifact follows a specific format defined in the resources:

- `RESEARCH.md` — session log (what was investigated, key findings, open questions)
- `sources.md` — registry of all sources with tier ratings
- `framework-extraction.md` — named frameworks ready for text classes
- `repo-analysis-{name}.md` — per-repo analysis documents
- `competitive-landscape.md` — what other courses/tutorials cover this topic

## The 5 Things to Extract

For every topic researched, extract these 5 categories:

| Category | What to Capture | Why It Matters for Course |
|----------|----------------|--------------------------|
| **Architecture** | How it works — layers, components, data flow | Students need mental models, not feature lists |
| **Terminology** | Exact official names and definitions | Wrong terms in course content = lost credibility |
| **Key Numbers** | Limits, defaults, thresholds, pricing | Students need these for real-world decisions |
| **Decision Points** | When to use X vs Y, trade-offs | These become named frameworks in text classes |
| **Common Mistakes** | Gotchas, anti-patterns, misconceptions | These become "What Goes Wrong" sections |

## Framework Extraction Criteria

A research finding becomes a named framework when it meets ALL of these:

- [ ] It models a **decision** students will face (not just a fact)
- [ ] It can be **structured** as a table, matrix, tree, or checklist
- [ ] It has a **memorable name** (specific, not generic)
- [ ] A **worked example** can demonstrate it in action
- [ ] It's **testable** — you could write a quiz question about it

See `resources/framework-extraction.md` for the full extraction methodology.

## Resources

- `resources/research-template.md` — standard RESEARCH.md structure
- `resources/source-quality.md` — detailed source evaluation criteria
- `resources/framework-extraction.md` — how to identify and name teachable frameworks
