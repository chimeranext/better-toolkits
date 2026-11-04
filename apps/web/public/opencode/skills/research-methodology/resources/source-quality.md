# Source Quality Evaluation

## The Tier System

Every source used in research gets a tier rating. Only Tier S and A sources are trusted for facts in course content. Lower tiers inform what to investigate but don't determine what we teach.

| Tier | Trust | Source Types | Example |
|------|-------|-------------|---------|
| **S** | Verified | Official documentation, official API reference, official specs | docs.anthropic.com, supabase.com/docs, starknet.io/docs |
| **A** | High | Official blog posts, official changelogs, official GitHub repos + examples, core team talks/presentations | Anthropic blog, Supabase changelog, official starter templates |
| **B** | Medium | Community-maintained docs (verified against official), recognized expert blog posts, conference talks by practitioners | Community wikis that cite official sources, posts by framework maintainers |
| **C** | Low | Forum discussions, Stack Overflow answers, GitHub issues, Discord/Slack threads | Useful for common mistakes and gotchas, NOT for stating facts |
| **D** | Unverified | Random blog posts, tutorials of unknown quality, AI-generated content without verification | Cross-reference only, never cite directly |

## Evaluation Criteria

For each source, assess:

| Criterion | Question | Red Flag |
|-----------|----------|----------|
| **Authority** | Who wrote this? Are they part of the core team or a recognized contributor? | Anonymous author, no credentials |
| **Recency** | When was this published/updated? | More than 12 months old for fast-moving tech |
| **Verification** | Can the claims be verified against official docs? | Contradicts official documentation |
| **Specificity** | Does it cite versions, dates, specific APIs? | Vague generalities, no version numbers |
| **Consistency** | Does it align with other high-tier sources? | Contradicts multiple other sources |

## Decision Rules

| Situation | Action |
|-----------|--------|
| Official docs say X | Use X. This is ground truth. |
| Official docs don't cover topic, but official blog does | Use the blog post. Note it's Tier A, not S. |
| Community source says X, official docs say Y | Use Y. Flag the discrepancy in research notes. |
| Only Tier C/D sources available | Note the finding as "unverified." Don't state it as fact in course content. |
| Source is >12 months old for rapidly-evolving tech | Verify against current official docs before using. |
| AI-generated content (ChatGPT answers, blog posts) | Never trust directly. Always verify against Tier S/A. |

## In Practice

When documenting sources in `research/sources.md`:

```markdown
| # | Source | Type | Tier | URL | Date | What Was Extracted |
|---|--------|------|------|-----|------|-------------------|
| 1 | Anthropic Claude Code Docs | Official docs | S | docs.anthropic.com/... | 2026-03 | Architecture, memory hierarchy, hook events |
| 2 | Claude Code GitHub | Official repo | A | github.com/anthropics/... | 2026-03 | Default configs, real examples |
| 3 | @swyx blog post on MCP | Expert blog | B | swyx.io/... | 2026-01 | MCP mental model — verified against official docs |
| 4 | Stack Overflow thread | Community | C | stackoverflow.com/... | 2025-11 | Common RLS mistake — verified still applies |
```
