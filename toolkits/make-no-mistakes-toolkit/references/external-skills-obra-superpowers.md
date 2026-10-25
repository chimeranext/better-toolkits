# External Skill References — obra/superpowers (via OpenCode harness)

These skills are registered by `/toolkits-initial-setup` (SSOT bootstrap) and loaded by the harness. They complement the make-no-mistakes pipeline.

## `systematic-debugging`

- Source: https://github.com/obra/superpowers/tree/main/skills/systematic-debugging
- Installed: `toolkits/make-no-mistakes-toolkit/skills/systematic-debugging/SKILL.md`
- Use: When remote review fails (`sync-and-check`), when auth rotation produces partial results (`upload FAIL` but `ls OK`), or when a feature behaves differently between raw stdio and SDK. Runs the 5-why chain backed by evidence (`catalog-evidence.md`, `postmortem-*.md`).
- Trigger: `/make-no-mistakes/resolve-open-questions` accumulation of open decisions; `/ready-to-review-mergeable` gate failures; `/secret-input` rotation failures.

## `brainstorming-visual-companion`

- Source: https://github.com/obra/superpowers/tree/main/skills/brainstorming/visual-companion
- Installed: `toolkits/make-no-mistakes-toolkit/skills/brainstorming-visual-companion/SKILL.md`
- Use: Before committing to multi-venture structure changes (`Single-LLC` vs. `Multi-LLC` vs. `Services Hub`), accelerator selection, or next-app selection. Produces divergent alternatives + converged decision with `impact × ease` (CD3) and evidence links.
- Trigger: New PR that introduces architecture-level changes; portfolio balance review (`three-horizons`, `explore-exploit`); next-app selection after problem validation.

## Integration with pipeline

Both skills feed the `/ready-to-review-mergeable` protocol:
- `systematic-debugging` produces the `postmortem-*.md` evidence file (§2 evidence → §5 handoff).
- `brainstorming-visual-companion` produces the design-decision artifact (parking lot + converged choice) referenced in PR descriptions (`#135` rename rationale, `#136` catalog design).
