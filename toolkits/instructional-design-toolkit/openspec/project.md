# instructional-design-toolkit — OpenSpec Project

## Overview

`instructional-design-toolkit` (IDT) is a multi-tenant Claude Code plugin for designing courses and 1-on-1 session plans. Outputs are xAPI + cmi5 compliant from origin so they can be hosted on any standard LMS (Moodle with mod_cmi5, Ralph LRS, SCORM Cloud, Cornerstone) or on ChimeraOS Pathways via skill overlays.

## Audience

- Instructores externos building courses for their own communities
- Founders of Launchpad startups who teach what they've learned
- The Chimera Coding internal team (Pathways, Software Factory, partner programs)

The toolkit ships voice-neutral by default. Chimera-specific editorial overlays live in `chimera-academy` and are discovered via the cwd plugin context — they NEVER ship inside this repo.

## Stack

- Markdown + YAML frontmatter for skills, commands, agents
- Bash + jq for hooks and helpers
- Marp CLI for slide rendering (`slides-preview`)
- xAPI 1.0.3 / cmi5 1.0 / Open Badges 3.0 / W3C VC for credentialing interop

## Methodology backbone

5 invariants documented in the README:

1. **SAM > ADDIE** — iterative prototyping, no course reaches first 100-cohort without a 3-10 pilot
2. **Atomic Habits applied to courses** — every lesson is a `cue → craving → response → reward` cycle
3. **xAPI Stability Rule** — `id` and `au_id` are immutable; `cmi5-metadata-writer` aborts on changes
4. **Semantic Versioning for courses** — `course-revise` classifies MAJOR / MINOR / PATCH
5. **Irby 2018** — coach ≠ mentor ≠ tutor; `session-type-detector` enforces the distinction

## Spec Domains

| Domain | Description | Linear project |
|--------|-------------|----------------|
| course-authoring | new-course flow, write-* commands, content templates | Pathways |
| session-planning | 1-on-1 session plans (coaching / mentoring / tutoring) | Pathways |
| course-lifecycle | course-audit, course-revise, course-retro, course-diff | Pathways |
| credentialing | xAPI / cmi5 / Open Badges 3.0 / W3C VC interop | Pathways |
| cross-references | symbolic refs over hardcoded URLs (proposed 2026-05) | Pathways |

## How to use OpenSpec here

Per JCG's framing on 2026-05-01 (Slack #general thread `1777650182.967539`), Chimera distinguishes three governance artifacts:

| Artifact | Purpose | Owner | Lives in |
|---|---|---|---|
| SOP | How the company operates | Fernanda | `chimera-documentation/content/docs/sop/` |
| PDR | What we build, for whom, why | Daniel + Juan | `<repo>/openspec/changes/<id>/proposal.md` |
| ADR | What technology, how, why this approach | Daniel + Juan | `<repo>/openspec/changes/<id>/design.md` |

Capability spec files (`openspec/specs/<capability>/spec.md`) describe *current state* — they update when changes implement.

When proposing a change to IDT itself or to how IDT outputs interact with platforms:
1. Open a folder in `openspec/changes/<YYYY-MM-short-slug>/`
2. Write `proposal.md` (PDR) + `design.md` (ADR) + `tasks.md`
3. Tag Daniel + Juan in the PR description for the architectural review
