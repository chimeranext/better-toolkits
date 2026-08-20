---
name: noop-overlay
version: 1.0.0
description: >
  No-op overlay fixture used to exercise the IDT Base + Overlay discovery
  contract. Returns the input draft unchanged plus a single demonstration
  warning string. Use when validating the overlay-protocol runtime, debugging
  discovery, or when an external-consumer simulation needs an installed-but-inert
  overlay.
overlay_target:
  - new-course
  - course-audit
  - slides-preview
overlay_priority: 75
---

# noop-overlay (fixture)

This skill exists to demonstrate the IDT overlay discovery contract end-to-end
without changing the output of any IDT command. It is intentionally trivial.

## Behavior

When invoked by the IDT runtime per `assets/runtime/overlay-protocol.md`:

1. Receive an `OverlayInput` (`{ command, baseDraft, context }`).
2. Return an `OverlayOutput`:
   - `draft`: the **same** `baseDraft` value, deep-copied to make the
     no-mutation contract obvious. Any future change you make to the returned
     object MUST NOT touch Layer 1 immutable fields (see the protocol doc).
   - `warnings`: a single demonstration entry — `"noop-overlay invoked at
     priority 75; no transforms applied."` — so observers can confirm discovery
     fired without affecting content.

## Why frontmatter looks like this

| Field | Value | Why |
|---|---|---|
| `overlay_target` | `new-course`, `course-audit`, `slides-preview` | The three IDT commands wired in DOJ-3707 (Phase 1). Listing all three lets fixture consumers pick any of them when running the simulation. |
| `overlay_priority` | `75` | Generic tier (annotation-only). Sits between structural (50) and voice (100). For a true no-op, the value barely matters — but choosing 75 makes the fixture useful for ordering tests where structural/voice overlays exist alongside it. |

## How to use as a fixture

From a fresh sandbox directory:

```bash
mkdir -p sandbox && cd sandbox
cp -R /path/to/instructional-design-toolkit/examples/overlay-noop-example/. .
# Now sandbox/.claude-plugin/plugin.json + sandbox/skills/noop-overlay/SKILL.md exist.
# Run any IDT command from inside sandbox/:
#   /idt:new-course "Test Course"
#   /idt:course-audit some-existing-course
#   /idt:slides-preview some-existing-course
# Discovery should pick up noop-overlay; the user-facing response should
# include the demonstration warning above; the resulting course.json should
# be byte-identical to the run made from a directory with no overlays.
```

## Out of scope for this fixture

- Real transforms. See `chimera-academy/skills/academy-philosophy` and
  `chimera-academy/skills/content-standards` (DOJ-3710) for production overlay
  examples.
- Any kind of test runner. This is a fixture, not a test suite.
