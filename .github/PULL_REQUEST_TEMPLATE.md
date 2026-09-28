## Summary

- What changed
- Why now
- How it was implemented

## Tracker

Choose the tracker configured for the target repository:
- GitHub Issues: `Fixes #N`
- External tracker: `Fixes TEAM-123`

- Issue: <canonical issue URL>
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

---

Title format:
`<type>(<scope>): <outcome> (<issue-ref>)`

Examples:
- `docs(pr): support GitHub-native tracking (#43)`
- `feat(runbooks): add Windows AI safety guidance (TEAM-123)`

For `better-toolkits` itself, use native GitHub issue numbers in branch names,
titles, and bodies (`docs/43-short-slug`, `(#43)`, `Fixes #43`). Client
repositories may use their configured external tracker. `/toolkits-initial-setup`
still wires Linear MCP for clients; it does not assign a Linear project to this
public monorepo.

Conventional Commit subject required for every PR title.
