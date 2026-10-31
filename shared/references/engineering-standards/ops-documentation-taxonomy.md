# ODT — Ops Documentation Taxonomy (Playbook vs Runbook vs SOP)

## Purpose

Classify every operational document as one of three types before authoring:
Playbook, Runbook, or SOP. A document that mixes types must be split.

## Doctrine

1. **Runbook** — *how* to execute a specific trigger-driven procedure. Sequential,
   testable steps; verbatim commands; bus-factor-1. Requires engineering context.
2. **Playbook** — *when/why* to choose a path under uncertainty. Decision tree,
   options, RACI, judgment (not execution). Human-readable; links to runbooks.
3. **SOP** — how the company operates a recurring business process. No code
   required; corporate/handbook level.

## Decision rule

- The reader must execute fixed steps → Runbook.
- The reader must choose among branches before acting → Playbook.
- No code needed; company-level recurring process → SOP.

## Diátaxis placement

- Runbook → How-to quadrant.
- Playbook → How-to (+ explanation flavor).
- SOP → Reference quadrant.

## Vendored SSOT

- `toolkits/fractional-cto-toolkit/references/documentation-taxonomy.md` (diagram,
  templates, examples).
- Templates: `references/08-runbook-template.md`, `references/09-playbook-template.md`,
  `references/01-takeover-sop-template.md`.

## Enforcement

- Author via `/document-this` routing; do not hand-mix pages.
- Reference this standard from any ops doc that must be classified.
