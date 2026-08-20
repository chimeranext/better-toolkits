# /write-video-script — protocol SSOT

Harness-agnostic body. Thin entry: `commands/write-video-script.md`.

---

# Write Video Script: $ARGUMENTS

You are generating a complete video script for a class. The argument should
be a path to an existing video brief file (e.g.,
`content/courses/agentic-coding/module-01-the-builder-mindset/classes/video-01-identity-shift.md`
in chimera-academy convention).

## Phase 1: Context Loading

1. **Read the video brief** at the specified path — extract: title, type
   (talking_head/screen_recording), purpose, target duration, key concepts
2. **Read the module overview** for this module — understand position,
   ship milestone, module context
3. **Read text classes in this module** — the video should reference and
   reinforce what the text class teaches (videos supplement, they don't replace text)
4. **Read the video brief template** if the consumer ships one (e.g.
   `content/_templates/video-brief.md` in chimera-academy) — understand the
   3 scene types and script format
5. If a consumer-side `content-formula.md` resource exists (e.g.
   `chimera-academy/skills/academy-philosophy/resources/content-formula.md`)
   read it for video production philosophy and the 3 recording scenes.
   The overlay invocation step at the end of this command surfaces it
   automatically when an `academy-philosophy` overlay is installed

## Phase 2: Script Plan

Present a script outline:

```
VIDEO: [Title]
FORMAT: talking_head / screen_recording
DURATION: ~X minutes (~Y words at 150 words/min)
SCENES: [list of scene types used]

STRUCTURE:
1. [Scene type] Opening hook — [what it says] (Xs)
2. [Scene type] Section 1: [Title] — [key point] (Xm)
3. [Scene type] Section 2: [Title] — [key point] (Xm)
...
N. [Scene type] Closing + CTA — [what it says] (Xs)

SLIDE MAP (if talking head):
- Slide 1: [title] — [visual description]
- Slide 2: [title] — [visual description]
...
```

## Phase 3: Review Gate

Present the outline to the user. Ask:
- Does this structure cover the key concepts?
- Right balance of camera-only vs slides+PIP vs live demo?
- Anything to add or cut?

Wait for explicit approval before writing the full script.

## Phase 4: Write Script

### For Talking Head Videos (CAMERA + SLIDES + PIP)

Write a **teleprompter-ready** script:
- Full spoken text, not bullet points
- ~150 words per minute of speaking time
- Conversational tone: contractions, rhetorical questions, direct address ("you")
- Mark every segment with scene tags: [CAMERA ONLY] or [SLIDES + PIP]
- For SLIDES + PIP: include [Slide: "Title" — visual description] markers
- SLIDE-PER-CONCEPT RULE: every major concept gets its own slide, max 60s per slide
- Opening hook: [CAMERA ONLY], 30 seconds, provocative
- Closing: [CAMERA ONLY], 30 seconds, recap + tease next class

### For Screen Recording Videos (LIVE DEMO)

Write a **bullet-point outline** (NOT a word-for-word script):
- Mark every segment with [LIVE DEMO]
- For each segment: [Screen: tool], Show: [what to demonstrate], Narrate: [key points]
- Expected result on screen after each action
- This is OFF-SCRIPT — the instructor narrates naturally
- Instructor is NOT visible — voiceover only

### Script Quality Rules
- Never teach NEW concepts in the video — reinforce what the text class already taught
- Reference the text class: "As you read in the text class..."
- Keep energy high — if you wouldn't watch it, don't write it
- Every video must end with a clear CTA: "Now go to the text class / challenge / quiz"
- Target total: 3-8 min for talking head, 10-20 min for screen recordings

## Phase 5: Generate Filming Outline

After the full script, generate a **one-page filming outline** — a
condensed reference for the person on camera:

```markdown
# Filming Outline: [Title]

**Format**: talking_head / screen_recording
**Duration**: ~X min
**Energy**: [specify: high energy / conversational / serious / inspirational]
**Wardrobe note**: [if any]

## Flow

| # | Scene | Duration | What to Say/Do | Slide |
|---|-------|----------|---------------|-------|
| 1 | CAMERA | 30s | Hook: "[key line]" | — |
| 2 | SLIDES | 2m | [concept summary] | "Slide Title" |
| ... | ... | ... | ... | ... |
| N | CAMERA | 30s | CTA: "[key line]" | — |

## Key Lines (must nail these)
- "[exact hook line]"
- "[exact closing line]"
- "[any other must-hit phrases]"
```

## Phase 6: Save

Save the completed script by updating the existing video brief file at its
current path.
- Replace the template placeholder sections with actual script content
- Fill in the Slide Map table
- Add the Filming Outline as a new section
- Keep the YAML frontmatter intact

## Overlay invocation (post-base-draft)

After producing the cmi5/xAPI-shaped base draft for this command, follow
`${CLAUDE_PLUGIN_ROOT}/assets/runtime/overlay-protocol.md` to discover and
apply consumer overlays. The runtime walks `<cwd>/.claude-plugin/plugin.json`,
finds skills declaring `overlay_target: ["write-video-script"]` in their
frontmatter, sorts them by `overlay_priority`, and applies them in order.

For this command, expect (when a consumer like `chimera-academy` is installed):
- Structural overlays (priority ~50) — content-standards: enforce
  scene-tag conventions, slide-per-concept rule, hook + CTA structure,
  duration targets per format
- Voice / editorial overlays (priority ~100) — academy-philosophy:
  Builder-First / AI-Native voice in narration, "as you read in the text
  class" cross-reference style, energy / register guidance

Layer 1 invariants (`au_id` for the video AU, `activity_type =
.../media`, stable IDs) remain immutable — overlay outputs that mutate
them abort the run with a clear error pointing at the offending
`SKILL.md` path. Layer 2 contradictions (e.g. video introducing concepts
absent from the text class, missing CTA) log a visible warning but do
not abort. Discovery returns zero overlays in a consumer without
`.claude-plugin/plugin.json` — the base draft is written directly,
voice-neutral.

> Note: the original `chimera-academy` command used emoji scene tags
> (camera, chart, computer). They are intentionally rendered as plain
> text labels here to keep the migrated command robust across editor
> encodings; the consumer overlay can re-introduce emoji scene tags as
> a voice / register transform if desired.
