# overlay-noop-example

A self-contained Claude Code plugin that demonstrates the
**IDT Base + Overlay discovery contract** (`assets/runtime/overlay-protocol.md`)
without changing the output of any IDT command. Used as the external-consumer
fixture for the validation tasks defined in
`openspec/changes/2026-05-base-overlay-pattern/tasks.md` Phase 4.

## What's inside

```
examples/overlay-noop-example/
├── README.md                         (this file)
├── .claude-plugin/
│   └── plugin.json                   (declares the plugin so IDT can discover it)
└── skills/
    └── noop-overlay/
        └── SKILL.md                  (overlay frontmatter + pass-through prose)
```

That is the **entire** contract for an external overlay plugin: one
`plugin.json` and one or more `skills/<name>/SKILL.md` files whose frontmatter
includes `overlay_target` and (optionally) `overlay_priority`.

## How to run it

From any working directory that does **not** itself contain a
`.claude-plugin/plugin.json`:

```bash
mkdir -p sandbox && cd sandbox
cp -R ../examples/overlay-noop-example/. .
# Or use any path; the discovery walk only requires that the cwd contains the
# .claude-plugin/plugin.json file the IDT runtime is looking for.

# Then run any IDT command from inside sandbox/ via the plugin:
#   /idt:new-course "Test Course"
#   /idt:course-audit <existing-course-slug>
#   /idt:slides-preview <existing-course-slug>
```

Expected behavior:

| Observation | Expected |
|---|---|
| The `course.json` (or audit report, or slide deck) IDT writes | byte-identical to a run from an overlay-free directory |
| User-facing Claude response | includes the warning `"noop-overlay invoked at priority 75; no transforms applied."` |
| Layer 1 invariants (`au_id`, `meta.id`, etc.) | unchanged |
| Run exit | success |

If the warning does **not** appear, discovery is broken. If the `course.json`
differs from the overlay-free baseline, the no-op contract is broken. Either
case is a regression in the protocol runtime — file a Linear issue against the
`instructional-design-toolkit` repo.

## How to extend it (without breaking the fixture)

Do **not** add transforms to `noop-overlay`. The whole point is that it stays a
no-op. If you need a fixture that exercises real transforms (priority ordering,
warning aggregation, Layer 1 enforcement), add a sibling skill — e.g.
`skills/structural-demo/SKILL.md` with `overlay_priority: 50` — alongside this
one. The discovery procedure picks up every skill with an `overlay_target`
field, so adding a sibling does not affect existing tests against `noop-overlay`.

## Related

- Protocol runtime: `assets/runtime/overlay-protocol.md`
- Schema: `assets/schemas/overlay-protocol.schema.json`
- Design doc: `openspec/changes/2026-05-base-overlay-pattern/design.md`
- Implementation issue: [DOJ-3707](https://linear.app/chimera-coding/issue/DOJ-3707)
