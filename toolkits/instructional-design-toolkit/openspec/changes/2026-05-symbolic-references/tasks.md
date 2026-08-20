# Symbolic references — Implementation tasks

**Status:** Proposed (pending governance approval)

This change ships across three repos. Each row is a sibling Linear issue or sub-task. None are blocking until the proposal moves to **Accepted**.

## Phase 1 — IDT commands emit symbolic refs (this repo)

- [ ] Update IDT command base prompts (`new-course`, `write-text-class`, `write-lesson`, `write-quiz`, `write-challenge`, `write-video-script`, `write-module`) to forbid hardcoded URLs and require symbolic refs of the form `[<type>:<slug-path>]`.
- [ ] Add a `symbolic-refs` skill at `instructional-design-toolkit/skills/symbolic-refs/SKILL.md` that defines the syntax, the type→slug-path mapping, and the worked examples.
- [ ] Add JSON schema validator entry in `assets/schemas/cross-reference.schema.json` to validate `{type, slugPath}` shapes.
- [ ] Test fixture in `examples/cross-references-example/` that exercises every type prefix.

## Phase 2 — ChimeraOS Pathways resolver (chimera-os repo)

- [ ] Add `chimera-os/src/lib/symbolicRefs.ts` exporting `parseSymbolicRef(text)` and `resolveSymbolicRef(ref, ctx)`. Inline implementation per the contract in `design.md`.
- [ ] Hook the resolver into the lesson renderer (`src/components/courses/LessonRenderer.tsx` or wherever Markdown is rendered). Pre-process every `[text][type:path]` link before passing to the Markdown engine.
- [ ] Unit tests covering each type prefix + the path-aware vs. course-only contexts.
- [ ] Playwright E2E: open a lesson with a symbolic ref → click → land on the correctly-resolved URL.
- [ ] Update lesson Markdown renderer documentation to call out the symbolic-ref hook.

## Phase 3 — Migrate existing chimera-academy content (chimera-academy repo)

- [ ] Use the audit checklist in `audit-checklist.md` to identify all current cross-references that should be symbolic refs.
- [ ] For each `.md` filesystem path in a link target (e.g. `../../../agentic-coding/module-04-context-engineering/module-overview.md`), convert to the canonical symbolic ref (`[module:agentic-coding/module-04-context-engineering]`).
- [ ] Add a CI lint that flags new content using filesystem `.md` targets in cross-link positions.
- [ ] Idempotent migration script: `chimera-academy/scripts/migrate-to-symbolic-refs.sh` (mirrors the pattern of `scripts/backfill-au-id.sh` from DOJ-3705).

## Phase 4 — Documentation (multi-repo)

- [ ] Update `chimera-academy/CLAUDE.md` "Path-aware cross-references" section (sibling DOJ-3712) to reference this change.
- [ ] Update `instructional-design-toolkit/CLAUDE.md` (or README "Insights") with the new convention.
- [ ] Update `chimera-os/docs/` with a `cross-references.md` (sibling DOJ-3712 acceptance criterion).

## Phase 5 — Specs become canonical (this repo)

- [ ] Create `openspec/specs/cross-references/spec.md` describing the **current** state of the convention (post-change). Move the syntax + resolver contract here from `design.md`. The change folder under `openspec/changes/` becomes the historical record.
- [ ] Mark this change as **Implemented** in `proposal.md` once Phases 1–4 are complete.

## Validation

- All Phase 1 tests green in IDT
- All Phase 2 tests green in chimera-os; Playwright E2E exercises path-aware + course-only routes
- Phase 3 migration produces zero diffs on a second run (idempotent)
- Phase 4 docs cross-link each other from all three repos
- Phase 5 capability spec accurately reflects what's deployed

## Out of scope

- Resolver implementations for non-ChimeraOS platforms (Moodle, Ralph, Cornerstone, etc.) — those happen when a partner LMS first hosts chimera-academy content.
- Inline anchors within a lesson (`#section`) — orthogonal feature; covered by standard Markdown.
- Search-and-replace across translations (`es/`) — translations share au_id with English (per DOJ-3705), so the same symbolic ref works in both locales unchanged.
