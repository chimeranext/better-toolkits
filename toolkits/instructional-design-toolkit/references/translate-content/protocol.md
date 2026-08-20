# /translate-content — protocol SSOT

Harness-agnostic body. Thin entry: `commands/translate-content.md`.

---

# Translate Content: $ARGUMENTS

You are translating course content from English to a target locale
(default: Latin American Spanish) using the consumer's translator agent
rules and standards. This command is a **transform pipeline** — it takes
content in one language and emits it in another. It does not produce a
draft or findings array; it produces a parallel locale tree.

**Arguments format**: `{course-slug}` or `{course-slug}/{module-slug}`
- `course-slug`: e.g., `ai-fluency`, `vibe-coding-blueprint`
- `module-slug` (optional): e.g., `module-01-the-ai-moment` — to translate
  a single module
- Path conventions are consumer-specific. The runtime resolves paths
  relative to the cwd where the command was invoked. The chimera-academy
  convention (`content/courses/{course-slug}/`) is shown in the phases
  below.

## Phase 1: Discovery

Identify what needs to be translated:

1. Read the **course overview**: `content/courses/{course-slug}/course-overview.md`
2. List **all content files** in the course (or module if specified):
   ```
   Glob: content/courses/{course-slug}/**/*.md
   ```
3. Check for **existing translations** at the consumer's locale path
   (chimera-academy uses `es/`):
   ```
   Glob: content/courses/{course-slug}/es/**/*.md
   ```
4. Read `agents/translator.md` (consumer-specific path) — internalize all
   translation rules. If the consumer ships
   `commands/_translation-strategy.md` (this plugin's bundled supporting
   doc) read it for prior-run learnings, terminology decisions, and known
   issues. If the consumer ships `commands/_translation-pipeline.md`, read
   it for the canonical phase-by-phase pipeline (parallel agents,
   reviewer, validation).

Build the translation manifest:

```
TRANSLATION MANIFEST
━━━━━━━━━━━━━━━━━━━
Course: {course name} ({course code})
Scope: {Full course | Module NN only}
Source language: English
Target language: Spanish (LATAM) [or consumer-configured locale]

FILES TO TRANSLATE:
1. course-overview.md                    [new | update | skip]
2. module-01-{slug}/module-overview.md   [new | update | skip]
3. module-01-{slug}/classes/text-01-...  [new | update | skip]
...

EXISTING TRANSLATIONS:
- {list any files already in the locale tree}

ESTIMATED FILES: {N}
```

## Phase 2: Review Gate

Present the manifest to the user and ask:

- Proceed with all files or select specific ones?
- Any terminology decisions to make upfront?

**Wait for explicit approval before translating. Do not proceed until the
user confirms.**

## Phase 3: Translate

Process files in this order (for terminology consistency):

1. **Course overview** — establishes framework name translations
2. **Module overviews** — sets module-level terminology
3. **Text classes** — load-bearing teaching content
4. **Quizzes** — must reference translated text classes accurately
5. **Challenges** — references translated content
6. **Video briefs** — supplementary, last priority

For each file:

1. Read the source-language file
2. Check existing locale-tree translations for terminology consistency
3. Translate following all rules in the consumer's translator agent
4. Adjust image paths for locale-tree depth (e.g. add one `../` level when
   moving from `module-NN/classes/` to `es/module-NN/classes/`)
5. Set `language: "{target-locale}"` in frontmatter
6. Save to the parallel locale path
   (e.g. `content/courses/{course-slug}/es/{same-relative-path}` for
   chimera-academy)

### Frontmatter Handling

Copy the source frontmatter exactly, then:
- Set `language: "{target-locale}"` (add the field if it doesn't exist)
- Translate the `title` field to the target locale

```yaml
language: "es"
title: "{translated title}"
```

All other fields (class_number, type, status, tags, `au_id`,
`activity_type`, etc.) stay the same. **`au_id` and `activity_type` are
xAPI/cmi5 invariants — translations are locale variants of the same
Activity Unit, never separate AUs.** Do not regenerate or alter them.

### Progress Updates

After every 3 files, report progress:

```
PROGRESS: {N}/{total} files translated
Last completed: {filename}
Next: {filename}
```

## Phase 4: Verification

After all files are translated:

1. **Count check** — verify the locale tree has the same number of files
   as the source
   ```
   Bash: find content/courses/{course-slug}/es -name "*.md" | wc -l
   ```

2. **Structure check** — verify directory structure mirrors the source
   ```
   Bash: diff <(cd content/courses/{course-slug} && find . -name "*.md" -not -path "./es/*" | sort) <(cd content/courses/{course-slug}/es && find . -name "*.md" | sort)
   ```

3. **Spot check** — read 2-3 translated files and verify:
   - [ ] Reads naturally in the target locale
   - [ ] Technical terms preserved per Do Not Translate list
   - [ ] Markdown formatting intact
   - [ ] Image paths correct
   - [ ] Code blocks untouched
   - [ ] Framework names handled correctly

Report the verification results to the user.

## Phase 5: Summary

```
TRANSLATION COMPLETE
━━━━━━━━━━━━━━━━━━━
Course: {name} ({code})
Files translated: {N}
Output directory: content/courses/{course-slug}/es/

TERMINOLOGY DECISIONS:
- {Framework Name} → {target-locale translation}
- {Term} → {target-locale term}

NOTES:
- {Any issues, cultural adaptations, or decisions made}
```

## Overlay invocation — conditional

Translation pipelines are different from authoring or audit commands.
A translator's job is to faithfully render source content in a target
locale; voice overlays from authoring contexts (Builder-First /
AI-Native imperatives, named-framework rewrites, opinionated tone
adjustments) **conflict** with that mandate — they would push the
translation toward an editorial register the source author never chose.

For this command, follow
`${CLAUDE_PLUGIN_ROOT}/assets/runtime/overlay-protocol.md` discovery,
but apply only overlays whose `overlay_priority` falls in the
**generic** tier (`< 100`). Use the priority tiers documented on the
`overlay_priority` field in
`${CLAUDE_PLUGIN_ROOT}/assets/schemas/overlay-protocol.schema.json` —
`structural=50` (reshapes scaffold early), `generic=75` (annotations
and locale enrichment such as terminology/glossary work), `voice=100`
(editorial transforms run last). For translation runs:

- **Apply** — overlays with `overlay_priority < 100` (generic tier and
  below). These cover terminology / glossary scope: Do Not Translate
  lists, framework name conventions (source-language first use +
  target-locale parenthetical), file label translations (e.g.
  `Correct→Correcta`, `Questions→Preguntas`), accent enforcement,
  neutral-LATAM "tú" conjugation rules, verb-form glossary self-checks
  (`despliegue|desplegar|desplegado|desplegando`). Note: structural
  overlays (priority `~50`) typically reshape scaffolds — for a
  translation run they are conventionally configured as no-ops, but
  the priority-tier filter intentionally lets them through so that
  consumers who ship a translation-aware structural overlay (e.g. one
  that adjusts image paths for locale-tree depth) can still apply.
- **Skip** — overlays with `overlay_priority >= 100` (voice tier).
  These cover authoring transforms: Builder-First rewrites,
  named-framework reshaping, content-formula imposition. The source
  author's choices in those dimensions are translated, not
  re-authored. Skipped overlays surface a single notice in the run
  summary listing each overlay's `SKILL.md` path so the user can
  confirm the bypass.

This priority-threshold rule keys on the existing `overlay_priority`
field declared in `OverlaySkillFrontmatter`. Consumers that ship voice
overlays at the conventional `100` priority require no schema changes
or extra frontmatter to be correctly bypassed here. A future iteration
of the overlay protocol may introduce an explicit `overlay_kind`
discriminator; until that lands in the schema, the priority threshold
is the contract this command relies on.

Layer 1 invariants (`au_id`, `activity_type`, stable IDs from the cmi5
contract) remain immutable — translations are locale variants of the
same Activity Unit. Any overlay output that mutates them aborts the
run with a clear error pointing at the offending `SKILL.md` path.
Layer 2 contradictions (Bloom's flatness, missing ship milestone) are
inherited from the source, not introduced by translation, and
therefore should not trigger overlay warnings on this command.
Discovery returns zero overlays in a consumer without
`.claude-plugin/plugin.json` — the base translation runs directly with
the consumer's translator agent rules as the sole guide.

## Cross-PR dependencies

This command delegates the per-file work to a `translator` agent and
post-run normalization to a `translation-reviewer` agent. Those agents
migrate from `chimera-academy` in DOJ-3709. Until then, both agents are
invoked from the consumer's own `agents/` directory if present, or the
command runs with this prose plus the bundled
`commands/_translation-pipeline.md` and `commands/_translation-strategy.md`
supporting docs as its sole guide (still functional, just less
specialized — and the parallel-agent dispatch step in the pipeline doc
requires the agents to exist before it can run).
