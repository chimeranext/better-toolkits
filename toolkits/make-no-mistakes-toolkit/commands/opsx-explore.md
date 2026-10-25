---
description: "Startup-agnostic exploration command — investigate before committing. References systematic-debugging skill (isolated variables, 5-why evidence chain) and brainstorming-visual-companion (visual artifacts for design decisions). Never writes code; never edits specs directly. Produces evidence references (catalog-evidence.md, postmortem-*.md) for /ready-to-review-mergeable."
argument-hint: "[topic] [--depth {shallow|deep}]"
priority: 80
---
# /opsx:explore

Startup-agnostic exploration protocol. Before committing to any architecture-level change (multi-venture structure, accelerator selection, next-app, catalog design), run isolated investigation backed by evidence.

**References (SSOT links):**
- `skills/systematic-debugging/SKILL.md` — 5-why isolation framework (`root-cause-tracing.md`, `defense-in-depth.md`, `condition-based-waiting.md`).
- `skills/brainstorming-visual-companion/SKILL.md` — divergent alternatives + converged choice artifacts (`parking lot`, `impact x ease` scoring).
- `references/ready-to-review-mergeable/protocol.md` — protocol invariant (no merge authorization without HITL).
- `references/external-skills-obra-superpowers.md` — upstream source references (obra/superpowers) without naming the original project.

**Steps (normative):**
1. Read existing evidence (`catalog-evidence.md`, `postmortem-*.md`) — don't re-investigate resolved failures.
2. Apply `systematic-debugging`: reproduce minimal environment, isolate variables (auth/version/remote/network/process state), gather evidence per layer.
3. Apply `brainstorming-visual-companion`: produce divergent alternatives (`Single-LLC` vs `Multi-LLC` vs `Services Hub`; single-action vs multi-subcommand wrapper), score (`CD3`: impact x ease), document parking lot with evidence links.
4. Confirm root cause is NOT behavioral regression (`postmortem` format) before concluding architecture change.
5. Hand result to `/ready-to-review-mergeable` with evidence file (`135-gws-catalog-evidence.md` format) — protocol requires `READY FOR HUMAN REVIEW`, NOT merge authorization.

**Anti-patterns forbidden:**
- Proposing fixes before tracing data flow (`systematic-debugging` Phase 1 violation).
- Merging design choice without `brainstorming-visual-companion` parking lot + `CD3` score.
- Writing code or editing specs before exploration completes (`systematic-debugging` Iron Law: NO FIXES WITHOUT ROOT CAUSE).

**Output format (evidence-based, English, anti-boilerplate):**
- `postmortem-<issue-id>-<short-desc>.md`: 5-why chain with artifacts at each level.
- `catalog-evidence.md`: 5-tool verification (`PASS/FAIL` assertions) for feature changes.
- Design decision reference linked in PR description (`#135` rename rationale, `#136` catalog design) — never invent `TICKET-*` IDs; use tracker `#135` / `#136`.
