# Base + Overlay pattern — Implementation tasks

**Status:** Proposed (spike — handing off to implementer issues below)

This change is a recommendation, not an implementation. The actual code lands in the sibling issues listed here.

## Phase 1 — Overlay-protocol mechanism in IDT (DOJ-3707)

- [ ] Add `OverlayInput` / `OverlayOutput` types to `instructional-design-toolkit/assets/schemas/overlay-protocol.schema.json`
- [ ] Implement plugin-context discovery in `assets/runtime/overlay-discovery.ts` (or equivalent) — walks `<cwd>/.claude-plugin/` for `skills/*/SKILL.md` declaring `overlay_target`
- [ ] Update IDT `new-course`, `course-audit`, `slides-preview` skills to invoke discovered overlays after producing the base draft
- [ ] Add Layer 1 invariant validator that runs BEFORE write — rejects any overlay output that mutates `au_id`, `activity_type`, or other immutables
- [ ] Bundle a no-op example overlay at `examples/overlay-noop-example/` for tests

## Phase 2 — Convert Chimera skills to overlays (DOJ-3710)

- [ ] Update `chimera-academy/skills/academy-philosophy/SKILL.md` frontmatter:
  - `overlay_target: ["new-course", "course-audit", "slides-preview", "write-text-class", "write-lesson", "write-module", "write-quiz", "write-challenge", "write-video-script"]`
  - `overlay_priority: 100` (voice — applied late)
- [ ] Update `chimera-academy/skills/content-standards/SKILL.md` frontmatter:
  - Same `overlay_target` list as above
  - `overlay_priority: 50` (structural — applied earlier so voice transforms run on the structured output)
- [ ] Implement deterministic transforms in each skill (must be pure functions: same input → same output, no side effects)
- [ ] Unit tests for each overlay's transform: 3+ sample drafts each, golden-file comparisons

## Phase 3 — Remove duplicate commands (DOJ-3711)

- [ ] Delete `chimera-academy/commands/audit-course.md` (replaced by IDT `/idt:course-audit` with content-standards overlay)
- [ ] Delete `chimera-academy/commands/plan-course.md` (replaced by IDT `/idt:new-course` with academy-philosophy + content-standards overlays)
- [ ] Update `chimera-academy/CLAUDE.md` "Content Authoring Workflow" section: replace `/academy:plan-course` and `/academy:audit-course` references with their IDT equivalents
- [ ] Add a one-line transition note: "Legacy `/academy:plan-course` is now `/idt:new-course` (with Chimera overlays applied automatically when run from this repo)."

## Phase 4 — Capability spec (current state, after implementation)

- [ ] Create `instructional-design-toolkit/openspec/specs/overlay-protocol/spec.md` describing the **current** state of the protocol once Phase 1 ships. The protocol contract from `design.md` here is the source.
- [ ] Mark this change as **Implemented** in `proposal.md` once Phases 1–3 are complete.

## Validation

- IDT tests pass (Phase 1 unit tests on overlay discovery + invariant validator)
- chimera-academy E2E test: from `cwd=chimera-academy/`, running `/idt:new-course "Test Course"` produces output that includes the Chimera formula sections AND `au_id` AND voice transforms
- External-consumer simulation: from a fresh `examples/external-consumer-fixture/` directory (no Chimera skills), running `/idt:new-course "Test Course"` produces voice-neutral cmi5-compliant output

## Out of scope

- Migrating the other 13 commands from chimera-academy to IDT (DOJ-3708)
- Migrating agents and skills (DOJ-3709)
- Documentation updates in CLAUDE.md across both repos (DOJ-3712)
- Path-aware cross-references (DOJ-3713 — different OpenSpec change)
