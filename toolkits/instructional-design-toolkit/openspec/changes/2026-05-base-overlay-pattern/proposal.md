# Base + Overlay pattern for IDT — Proposal

**Linear:** [DOJ-3706](https://linear.app/chimera-coding/issue/DOJ-3706)
**Status:** Proposed (spike recommendation — pending Andrés review per the spike workflow rule)
**Architecture owners:** Daniel Bejarano + Juan C. Guerrero

## What we will build

A formal **Base + Overlay** pattern that lets `instructional-design-toolkit` (IDT) keep universal pedagogical rigor (cmi5/xAPI/Bloom's/Kirkpatrick/SAM) while chimera-academy can layer Chimera-specific editorial opinions (voice, formula, quality bar) without coupling the two.

The pattern resolves two pre-existing command duplicates between chimera-academy and IDT:

| chimera-academy command | IDT command | After this pattern |
|---|---|---|
| `audit-course` | `course-audit` | IDT base owns it; Chimera rubric absorbed via overlay |
| `plan-course` | `new-course` | IDT base owns it; Chimera formula (CONTEXT→...→REFLECT) absorbed via overlay |

## For whom

| Audience | What changes |
|---|---|
| **Chimera Coding internal team** (Pathways, Software Factory) | When you run `/idt:new-course` from inside `chimera-academy/`, the output comes out in Chimera voice + Chimera formula automatically — overlays are discovered from the cwd plugin context. No new tools to learn. |
| **External instructors using IDT** (Launchpad founders, partner programs) | When you run `/idt:new-course` from your own repo with no Chimera overlays installed, you get cmi5/xAPI-compliant output in voice-neutral form. The toolkit no longer captures you into Chimera's editorial opinion silently. |
| **chimera-academy maintainers** | The two duplicate commands disappear from `chimera-academy/commands/`; their value (Chimera voice + rubric) is preserved as overlay skills under `chimera-academy/skills/`. Editing the voice is a single-repo change. |
| **IDT maintainers** | The reconciliation gives IDT a clean architectural story for every future authoring command — "base + overlay" is now the contract for content generation. |

## Why now

This proposal closes the gap surfaced during the chimera-academy ↔ IDT separation of concerns work (DOJ-3705 through DOJ-3712, started 2026-05-01). Sibling [DOJ-3707](https://linear.app/chimera-coding/issue/DOJ-3707) (skill-overlay discovery mechanism in IDT) implements what this proposal architects. Sibling [DOJ-3710](https://linear.app/chimera-coding/issue/DOJ-3710) (academy-philosophy + content-standards as overlay skills) re-shapes the Chimera skills to match this contract.

If we don't reconcile the two duplicates, the migration in [DOJ-3708](https://linear.app/chimera-coding/issue/DOJ-3708) ships duplicate functionality with silent drift — exactly what the separation of concerns work was supposed to prevent.

## Success criteria

- Three layers (cmi5/xAPI invariants, pedagogy generic, editorial voice) are formally defined with clean boundaries (see `design.md`).
- The overlay protocol is specified end-to-end: discovery, invocation order, input/output contract, failure mode (see `design.md`).
- Both duplicate command pairs have explicit resolution paths (see `design.md` "Resolving the two duplicates").
- Implementer issues (DOJ-3707 + DOJ-3710) can begin without further clarification.

## Out of scope

- The implementation itself — that's DOJ-3707 (skill-overlay mechanism in IDT) and DOJ-3710 (overlay skills in chimera-academy).
- Migration of the other 13 commands from chimera-academy to IDT — that's [DOJ-3708](https://linear.app/chimera-coding/issue/DOJ-3708).
- Capability spec (`openspec/specs/...`) — files documenting the *current* state land alongside DOJ-3707's implementation, not in this proposal.
