# AGENTS.md

This repository follows the PRDS standard from chimeranext/better-toolkits and requires PRs to be reviewable, scoped, and human-approved.

## Required PR behavior

- Use a conventional-commit style title for every PR subject:
  - `feat(scope): add capability`
  - `fix(scope): resolve regression`
  - `docs(pr): align repo to PRDS`
  - `chore(ci): update templates`
- Branch names must follow the pattern: `type/ticket-n-slug`
- Every PR must include the PRDS sections in the body:
  - Summary
  - Tracker
  - Test plan
  - Scope boundaries
  - Risk / rollout
  - Screenshots / evidence
- The PR description is part of the deliverable and must be written before the PR is marked ready for review.
- Keep each PR focused; do not bundle unrelated refactors or broad cleanup into the same change.
- Draft PRs are the default until a human explicitly approves the review.

## Required title format

`<type>(<scope>): <outcome> (TICKET-N)`

Examples:

- `docs(pr): add PRDS template and repo conventions (TICKET-PRDS-1)`
- `feat(runbooks): add AI-safe debloat launch guidance (TICKET-WS-42)`

## Required PR body template

```md
## Summary

- What changed
- Why now
- How it was implemented

## Tracker

Fixes TICKET-N

- Issue: <url>
- OpenSpec: `N/A` or path

## Test plan

- [ ] <concrete verification command>
- [ ] <validation result>

## Scope boundaries

- Out of scope:
- No unrelated refactors

## Risk / rollout

- Risk: low / medium / high
- Rollout: `N/A` or specific steps

## Screenshots / evidence

- UI: `N/A` or screenshots
- Logs: `N/A` or link
```

## Enforcement

The repository owners expect all future PRs to follow this policy from this point onward.
