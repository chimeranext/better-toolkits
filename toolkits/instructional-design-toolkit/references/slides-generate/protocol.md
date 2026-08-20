# /slides-generate — protocol SSOT

Harness-agnostic body. Thin entry: `commands/slides-generate.md`.

---

# Slides Generate

You are generating an HTML slide deck from a video brief script.

This command produces a full deck (draft-shaped output) — distinct from
`slides-preview`, which renders an existing per-lesson Marp source. Use
`slides-generate` when you have a video brief and need the deck created from
scratch; use `slides-preview` when the slide source already exists and you
just want it rendered.

**Arguments format**: `{video-brief-path} [theme]`
- `video-brief-path`: path to the video brief markdown file, relative to the
  cwd where the command was invoked. The runtime resolves paths against the
  consumer's content layout (e.g.,
  `content/courses/{course}/{module}/classes/video-NN-{slug}.md` in a
  chimera-academy-shaped repo).
- `theme`: optional, `light` (default, for video recording) or `dark` (for
  platform/social).

## Phase 1 — Load Context

1. Read the video brief at the path supplied in `$ARGUMENTS`
2. Read the `slides-generate` skill if the consumer ships one (e.g.
   `skills/slides-generate/SKILL.md` in chimera-academy). The overlay invocation
   step at the end of this command will surface a consumer's `slides-generate`
   overlay automatically when one is installed
3. Read the appropriate HTML template from the consumer's template folder.
   In chimera-academy the templates live at:
   - Light theme (default): `content/_templates/slides/chimera-slides-light.html`
   - Dark theme: `content/_templates/slides/chimera-slides-dark.html`

   Other consumers may ship their own templates at a different path — read
   the template path from the `slides-generate` skill if installed, or fall back
   to the consumer's `content/_templates/` convention.
4. Prepare the logo for embedding (chimera-academy specifics shown — other
   consumers ship their own brand assets):
   - Light theme uses `Logo-Chimera-02.png` (dark text logo, for light backgrounds)
   - Dark theme uses `Logo-Chimera-01.png` (white text logo, for dark backgrounds)
   - Logo source: chimera-academy stores brand assets in Google Drive at
     `Shared drives/Chimera Coding/01_Brand/Chimera Logo/`. Other consumers
     document their own asset locations
   - Convert to base64 with: `base64 -i "path/to/Logo-Chimera-0X.png"`
   - Embed as: `<img class="slide-logo" src="data:image/png;base64,{BASE64}" alt="Chimera Coding">`
   - Each `<section>` must include one logo `<img>` tag

## Phase 2 — Extract & Design Slides

Parse the video brief's script sections. For each section:

### Slide mapping rules

1. **Title slide** (always first):
   - `class="title"` — Use the video's `title` from frontmatter
   - Subtitle: Module name + Course name

2. **Opening hook → statement slide**:
   - Extract the most impactful sentence from the opening
   - Identify 1-2 key words for `<strong>` accent
   - This is the "promise" or hook slide

3. **Each numbered section → content slide + optional statement slide**:
   - **Content slide** (`class="content"`):
     - Header: numbered section title (e.g., "1) The Optimist Door")
     - BIG IDEA: compress the section's thesis to 3-6 uppercase words
     - Bullets: extract 3-6 scannable phrases from the script
     - Sub-bullets: supporting details if needed
   - **Statement slide** (`class="statement"`) — optional:
     - Pull the most quotable/memorable line from the section
     - Use between content slides for pacing and emphasis
     - Max 1-2 sentences, key word(s) in `<strong>`

4. **Quotes in the script → quote slide**:
   - If the script contains an attributed quote, use `class="quote"`
   - Highlight the key word in `<strong>`

5. **Visual concepts → image slide** (MANDATORY for diagrams/processes):
   - If a script section describes a process, flow, comparison, loop,
     architecture, or any concept that benefits from a visual, you MUST use
     `class="image"` and generate an image. Do NOT skip image generation —
     text-only slides for visual concepts is an anti-pattern.
   - Look for: `[Slide: diagram...]`, `[Slide: ...loop...]`, `[Slide:
     ...flowchart...]`, `[Slide: ...comparison...]`, or any slide
     description mentioning a visual concept
   - **You must generate the image via Gemini API** — do not use placeholder
     text:
     1. Call `gemini-3-pro-image-preview` model:
        ```bash
        curl -s "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${GEMINI_API_KEY}" \
          -H 'Content-Type: application/json' \
          -d '{
            "contents": [{"parts": [{"text": "Generate an image: {DESCRIPTION}. Clean modern diagram on a dark navy-purple (#272749) background. White text labels. Accent colors: lilac (#C980FC), coral (#FF7151), pink (#F488F8). Rounded rectangle containers. Numbered items use colored circle badges. Minimal, no shading, no gradients on background. 16:9 aspect ratio."}]}],
            "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]}
          }' -o /tmp/gemini-response.json
        ```
     2. Extract the image from the response:
        ```python
        import json, base64
        data = json.load(open('/tmp/gemini-response.json'))
        for part in data['candidates'][0]['content']['parts']:
            if 'inlineData' in part:
                img_bytes = base64.b64decode(part['inlineData']['data'])
                open('nanobanana-output/slide-image.png', 'wb').write(img_bytes)
        ```
     3. Convert to base64 and embed in `.slide-image-wrapper`
   - The diagram colour palette and the holding folder path
     (`nanobanana-output/` in chimera-academy) are consumer-specific. The
     consumer's `slides-generate` overlay surfaces the palette and folder
     during the overlay invocation step. The defaults shown above match
     chimera-academy's brand
   - Keep the header short (one line) so the image gets maximum space

6. **Content + visual concept → content-image slide** (PREFERRED over
   separate content + image slides):
   - If a content slide's concept has a corresponding visual (analogy,
     diagram, comparison), merge them into ONE `class="content-image"` slide
   - **MERGE RULE**: Never create a content slide followed by an image slide
     covering the same concept. Put the image INSIDE the content slide.
   - Text goes in `.content-text` (left half), image goes in `.content-visual`
     (right half)
   - Use standalone `class="image"` slides ONLY for diagrams that need no
     text (loops, flowcharts, spectrums, process flows)

7. **Closing → transition slide**:
   - Extract the CTA or closing thought
   - `class="transition"` with the call to action

### Design rules (enforce strictly)

- **One idea per slide** — never more than 6 bullets
- **1-2 accent words per slide** — only the words the audience must remember get `<strong>`
- **Use `<u>` for action phrases** — things the student should DO
- **No decorative elements** — use image slides with Gemini when visuals are needed
- **NEVER skip image generation** — if a slide describes a diagram, loop,
  flowchart, process, or comparison, generate the image via Gemini API.
  Text-only slides for visual concepts make the deck look unfinished.
- **35-40% of slides must be image slides** — pure text decks read as corporate training
  standard. For a 15-slide deck, that means 5-6 image slides with generated
  branded diagrams. Every analogy, comparison, process, or spatial concept
  should be an image slide, not a text slide.
- **Fewer bullets, bigger text** — slides are viewed during PIP recording
  (instructor in corner, slide fills ~70% of screen). Text must be readable
  at this scale. Max 4 bullets per content slide.
- **Alternate content and statement slides** — never two content slides back-to-back
- **Target 1 slide per 30-60 seconds** of estimated speaking time

- **Semantic line breaks in statements** — for `statement`, `title`, and
  `transition` slides, YOU must insert `<br>` at the main clause boundary.
  Never delegate line-wrapping to the browser (it breaks on width, stranding a
  single word — e.g. "minutos." — on its own line). Keep it to at most 2 lines,
  ~8-10 words per line, and break where the sentence naturally pauses.
  - Bad (browser-wrapped): "Al final de esta sesión vas a poder salir al aire en
    minutos." — the browser leaves "minutos." alone on line 2.
  - Good (semantic `<br>`): "Al final de esta sesión,<br>vas a poder salir al aire
    en minutos."
- **Anti-widow typography** — the consumer's deck templates must set
  `text-wrap: balance` on headings (`h1`, `.big-idea`) and `text-wrap: pretty`
  on prose and bullets (`p`, `li`) so no line is left with a single dangling
  word. If the consumer template does not already include these declarations, add
  them to the `<style>` block of the deck you emit.

## Phase 3 — Generate HTML

Create a self-contained `.html` file by:

1. Copy the full HTML template (including `<style>` and `<script>`)
2. Replace the example `<section>` elements between the SLIDE CONTENT
   comments with the generated slides
3. Ensure the first slide has `class="title active"` (the `active` class is
   required)
4. All other slides should NOT have the `active` class

### HTML structure for each slide type:

```html
<!-- Title -->
<section class="title active">
  <h1>{Video Title}</h1>
  <p>{Module Name} — {Course Name}</p>
</section>

<!-- Statement -->
<section class="statement">
  <h1>{Line with <strong>key word</strong>}</h1>
  <p>{Optional second line}</p>
</section>

<!-- Content -->
<section class="content">
  <h1>{N}) {Section Title}</h1>
  <p class="big-idea">BIG IDEA: {THESIS IN 3-6 WORDS}</p>
  <ul>
    <li>{Bullet point}</li>
    <li>{Bullet with <strong>accent</strong>}
      <ul><li>{Sub-point}</li></ul>
    </li>
  </ul>
</section>

<!-- Two columns -->
<section class="columns">
  <h1>{Header}</h1>
  <div class="col-wrapper">
    <div class="col"><ul><li>{items}</li></ul></div>
    <div class="col"><ul><li>{items}</li></ul></div>
  </div>
</section>

<!-- Quote -->
<section class="quote">
  <blockquote>"{Quote with <strong>key word</strong>}."</blockquote>
  <cite>— {Author}</cite>
</section>

<!-- Image (generated via Gemini gemini-3-pro-image-preview) -->
<section class="image">
  <h1>{Short header with <strong>key word</strong>}</h1>
  <div class="slide-image-wrapper">
    <img src="data:image/png;base64,{IMAGE_BASE64}" alt="{Description}">
  </div>
</section>

<!-- Content + Image (PREFERRED when section has both text and a visual) -->
<section class="content-image">
  <h1>{N}) {Section Title}</h1>
  <div class="content-text">
    <p class="big-idea">BIG IDEA: {THESIS IN 3-6 WORDS}</p>
    <ul>
      <li>{Bullet point}</li>
      <li>{Bullet with <strong>accent</strong>}</li>
    </ul>
  </div>
  <div class="content-visual">
    <img src="data:image/png;base64,{IMAGE_BASE64}" alt="{Description}">
  </div>
</section>

<!-- Transition -->
<section class="transition">
  <h1>{Short phrase}</h1>
  <p>{Optional CTA with <strong>accent</strong>}</p>
</section>
```

## Phase 3.5 — Alignment Validation

Before generating the final HTML, verify script-slide alignment:

1. Count every `📊 [SLIDES + PIP]` segment in the video script
2. Count every non-title, non-transition `<section>` in the slide deck
3. Each script segment should map to exactly ONE slide (or one merged
   content-image slide)
4. Each `[Slide: "Title"]` marker in the script should match an `<h1>` in
   the deck
5. No orphan slides (slides with no script segment). No missing slides
   (script segments with no slide).

If mismatches are found, fix them before saving.

## Phase 4 — Save & Report

1. **Save the file** to the same directory as the video brief:
   - Filename: `slides-{video-brief-slug}.html`
   - Example: `video-01-three-wrong-doors.md` → `slides-three-wrong-doors.html`

2. **Report to the user**:
   - Total slide count
   - Breakdown by slide type (e.g., "1 title, 3 statement, 4 content, 1 quote, 1 transition")
   - Estimated pacing (slides vs. video duration)
   - Theme used (light/dark)
   - File path of the generated deck

3. **Suggest**: "Open in browser and press F for fullscreen to preview."

## Overlay invocation (post-base-draft)

After producing the cmi5/xAPI-shaped base draft for this command (the
generated HTML deck plus its slide manifest), follow
`${CLAUDE_PLUGIN_ROOT}/assets/runtime/overlay-protocol.md` to discover and
apply consumer overlays. The runtime walks
`<cwd>/.claude-plugin/plugin.json`, finds skills declaring
`overlay_target: ["slides-generate"]` in their frontmatter, sorts them by
`overlay_priority`, and applies them in order.

For this command, expect (when a consumer like `chimera-academy` is installed):
- Structural overlays (priority ~50) — e.g. `slides-generate`: enforce the
  the mapping rules (35-40% image slides, alternating content /
  statement, max 4 bullets per content slide), the `slides-` filename
  convention, the alignment-validation pass count
- Voice / editorial overlays (priority ~100) — e.g. academy-philosophy:
  brand palette (#272749 navy-purple bg, #C980FC lilac, #FF7151 coral,
  #F488F8 pink), logo selection per theme, slide-image holding folder
  (`nanobanana-output/`), Builder-First / AI-Native phrasing in BIG IDEA
  lines and statement slides

Layer 1 invariants (`au_id`, `activity_type`, stable IDs from the cmi5
contract — applied to the underlying video brief AU, not the deck itself)
remain immutable — overlay outputs that mutate them abort the run with a
clear error pointing at the offending `SKILL.md` path. Layer 2
contradictions (insufficient image-slide ratio, repeated content slides
back-to-back) log a visible warning but do not abort. Discovery returns
zero overlays in a consumer without `.claude-plugin/plugin.json` — the base
deck is generated directly with neutral defaults (no brand palette, no
logo embedding), with no warning.

## Delegation

This command delegates slide design to the `slides-generate` skill
(`skills/slides-generate/SKILL.md`) and rendering to the `slides-renderer`
agent, both shipped by this plugin. A consumer may override either from its
own `agents/` or `skills/` directory; with neither present the command runs
with this prose as its sole guide (still functional, just less specialized).
