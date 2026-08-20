---
name: slides-generate
description: >
  Slide design system for course videos — slide types, accent rules, typography
  hierarchy, and anti-patterns. Consumer plugins ship the actual HTML/CSS templates referenced
  here (e.g. chimera-academy ships `content/_templates/slides/chimera-slides-light.html` and
  `chimera-slides-dark.html`).
triggers:
  - slides
  - slide deck
  - presentation
  - video slides
  - generate slides
---

# Slide Design Knowledge Base

This skill encodes the slide-generation heuristics for video-class decks. The actual HTML/CSS template artifacts that decks render against are consumer-specific — for example, chimera-academy ships:

- `content/_templates/slides/chimera-slides-light.html`
- `content/_templates/slides/chimera-slides-dark.html`

Other consumer plugins may ship their own skinned templates. This skill describes the design system; the consumer plugin owns the brand tokens.

## Design Philosophy

Three principles: extreme clarity, zero decoration, surgical use of color. Every slide says ONE thing. If the audience can't absorb it in 3 seconds, the slide has too much.

## The 7 Slide Types

### 1. Title Slide
- Course or section title only
- Massive centered text with gradient (consumer-specific brand colors — e.g. chimera-academy uses Lilac → Peach)
- Optional subtitle (module name, course name)
- Use: opening slide of every deck

### 2. Statement Slide
- One sentence broken across 1-2 lines with a **semantic `<br>`** at the main
  clause boundary — never let the browser choose the wrap (see "Semantic Line
  Breaks" below)
- The 1-2 most important words get `<strong>` (renders in the consumer's primary accent)
- Action phrases get `<u>` (underline in accent color)
- No bullets, no lists — just the statement
- Use: between content slides for pacing, to land a key point

### 3. Content Slide
- Numbered header matching video script section (e.g., "1) Why Shipping Beats Perfection")
- BIG IDEA label in accent color, uppercase, below header
- 3-6 bullet points maximum
- Sub-bullets for supporting details (smaller, muted color)
- Use: main teaching slides

### 4. Two-Column Slide
- Header + two columns of bullets
- Use: comparisons, lists of examples, before/after

### 5. Quote Slide
- Centered blockquote in italic
- Key word(s) highlighted in accent
- Attribution below in muted color
- Use: to reinforce a point with authority

### 6. Image Slide
- Header text above a diagram, flowchart, or illustration
- Image fills the remaining slide space (centered, contained)
- Use: when a concept is best explained visually — processes, flows, comparisons, architecture
- Images generated via **Nano Banana Gemini** (`/diagram`, `/generate`)
- Keep the header short (one line) so the image gets maximum space
- Use branded diagrams — clean, modern, consumer's brand colors (e.g. chimera-academy uses dark navy-purple bg with accent colors)

### 7. Transition Slide
- Short phrase (lighter font weight)
- Signals a section change
- Use: between major sections of the talk

## Accent Color Rules

- **Primary accent**: consumer's primary brand color (e.g. chimera-academy uses Lilac #C980FC) — used on key words via `<strong>`
- **Secondary accent**: consumer's secondary brand color (e.g. chimera-academy uses Peach #FF7151) — CTAs only, used sparingly
- **Rule**: Only 1-2 words per slide get the accent. If everything is highlighted, nothing is.
- **Underline**: Use `<u>` for action phrases the audience should do

## Typography Hierarchy

| Element | Weight | Size | Color |
|---------|--------|------|-------|
| Title h1 | 800 | 4.2em | Gradient |
| Statement h1 | 800 | 3.4em | Text color |
| Content h1 | 800 | 3.6em | Text color |
| BIG IDEA | 800 | 1.3em | Accent |
| Bullets | 400 | 2.1em | Text color |
| Sub-bullets | 400 | 0.85em (relative) | Sub-text |
| Image h1 | 800 | 2.8em | Text color |
| Transition h1 | 400 | 2.8em | Text color |
| Logo | 800 | 52px height | 55% opacity |


## Semantic Line Breaks

On `statement`, `title`, and `transition` slides, **you** control where each line
breaks — never the browser. A browser wrap keys off the slide width, so it will
strand a single trailing word ("minutos." on its own line) and the rhythm of the
line collapses. Insert a `<br>` at the main clause boundary instead.

- Keep it to at most 2 lines, roughly 8-10 words per line.
- Break where the sentence naturally pauses (after the leading clause, before the
  verb phrase).

| Don't (browser-wrapped) | Do (semantic `<br>`) |
|-------------------------|----------------------|
| `Al final de esta sesión vas a poder salir al aire en minutos.` — the browser leaves "minutos." alone on line 2 | `Al final de esta sesión,<br>vas a poder salir al aire en minutos.` |

## Anti-Widow Typography

Consumer deck templates must guard against widows and orphans in CSS so no line
is left with a single dangling word:

- `text-wrap: balance` on headings (`h1`, `.big-idea`) — evens out multi-line
  headings.
- `text-wrap: pretty` on prose and bullets (`p`, `li`) — prevents single-word
  last lines.

If a consumer template does not already ship these declarations, the generator
adds them to the `<style>` block of the deck it emits.

## Content Extraction Rules

When converting a video script to slides:

1. **One slide per major point** — if a script section has 3 sub-points, that might be 1 content slide + 1 statement slide, or 3 separate slides
2. **Headers from section titles** — "Section 1: Why Shipping Matters" becomes "1) Why Shipping Matters"
3. **BIG IDEA from the thesis** — find the single sentence that captures the section's point, compress to 3-6 words, uppercase
4. **Bullets from supporting points** — extract the concrete, scannable takeaways
5. **Statement slides for emphasis** — pull out the most quotable/memorable line from each section and give it its own statement slide
6. **Opening hook → statement slide** — the opening hook becomes a bold statement slide after the title
7. **Closing CTA → transition slide** — the closing becomes a transition or statement slide with the call to action

## Slide Pacing

- Aim for **1 slide per 30-60 seconds** of speaking time
- A 10-minute video should have roughly **12-18 slides**
- Alternate between content slides and statement slides for rhythm
- Never put two content slides back-to-back without a breather

## Anti-Patterns

| Don't | Do Instead |
|-------|-----------|
| More than 6 bullets on one slide | Split into 2 slides or use statement + content |
| Full sentences as bullets | Short phrases (3-7 words) |
| Multiple accent colors on one slide | Max 1-2 words in accent per slide |
| Decorative borders, shadows, gradients on content | Plain backgrounds, no decoration |
| Clip art or stock photos | Use Nano Banana Gemini for diagrams, or no images at all |
| Slide with no accent word | Every slide should have at least one `<strong>` |
| Using accent on unimportant words | Accent = the word the audience must remember |
| Paragraphs of text | If it's more than 2 lines, break it into bullets or multiple slides |
| Browser-wrapped statements stranding one word on a line | Insert a semantic `<br>` at the clause boundary (see Semantic Line Breaks) |
| Templates with no widow guard | `text-wrap: balance` on headings, `text-wrap: pretty` on prose/bullets |

## Image Generation

Consumer plugins may ship an image-generation extension — for example, chimera-academy ships **Nano Banana Gemini**. The workflow below uses the chimera-academy extension as the worked example; consumers without it should substitute their own image pipeline (Option B — direct Gemini API call — works without any extension installed).

### Nano Banana Gemini (chimera-academy reference workflow)

When a slide concept is best explained visually (processes, flows, comparisons, architecture), use the **Nano Banana Gemini** extension (chimera-academy-specific) to generate images.

### When to use image slides

**Image density rule: 35-40% of slides must be image slides.** For a 15-slide deck, that means 5-6 image slides. Pure text decks look like corporate training.

**Two ways to use images:**

**1. `content-image` slide (PREFERRED)** — text on left, image on right, ONE slide:
- Use when a concept has BOTH text bullets AND a visual (analogy, diagram, comparison)
- **MERGE RULE**: Never create a content slide followed by a separate image slide for the same concept. Merge them into one `content-image` slide.
- Examples: "Delegation" bullets + fork-in-road diagram, "Product Description" bullets + restaurant analogy

**2. Standalone `image` slide** — image only, full-width:
- Use ONLY for diagrams that don't need text: loops, flowcharts, spectrums, process flows
- Examples: "The 4D Loop" circular diagram, "The Decision Tree" flowchart, "The Autonomy Spectrum"

**Image subjects to generate:**
- Analogies (restaurant analogy, seatbelt analogy, iceberg, etc.)
- Comparisons or before/after visuals
- Architecture diagrams
- Loops and cycles (4D Loop, feedback loops)
- Flowcharts and processes
- Any concept that is spatial, sequential, or comparative
- Use the consumer's branded style (e.g. chimera-academy ships: dark navy-purple bg, white labels, Lilac/Coral/Pink accents, rounded containers)

**Use Gemini model `gemini-3-pro-image-preview`** (not preview models — they don't support image generation).

### How to generate

**Option A — Nano Banana extension** (if installed):
1. Use `/diagram` for flowcharts and technical diagrams
2. Use `/generate` for illustrations and conceptual visuals
3. Specify the consumer's brand style. For example, chimera-academy uses: `--styles "clean modern, dark navy-purple (#272749) background, white labels, Chimera accent colors (lilac #C980FC, coral #FF7151, pink #F488F8), rounded containers, colored circle badges"`
4. Output saves to `./nanobanana-output/`

**Option B — Gemini API direct** (recommended):
1. Call `gemini-3-pro-image-preview` model with `responseModalities: ["TEXT", "IMAGE"]`
2. Prompt should include the consumer's brand-style spec. For example, chimera-academy uses: "Clean modern diagram on a dark navy-purple (#272749) background. White text labels. Accent colors: lilac (#C980FC), coral (#FF7151), pink (#F488F8). Rounded rectangle containers. Numbered items use colored circle badges. Minimal, no shading, no gradients on background. 16:9 aspect ratio"
3. Extract the base64 image from `candidates[0].content.parts[].inlineData.data`
4. Save to `./nanobanana-output/` for reference

**Both options**: Convert output to base64 and embed in the `<img>` tag inside `.slide-image-wrapper`

### Image slide markup
```html
<section class="image">
  <h1>How the <strong>Builder</strong> Loop Works</h1>
  <div class="slide-image-wrapper">
    <img src="data:image/png;base64,IMAGE_BASE64" alt="Description">
  </div>
  <img class="slide-logo" src="data:image/png;base64,LOGO_BASE64" alt="Brand logo">
</section>
```

### Style guidelines for generated images
- Use the **consumer's branded style** (e.g. chimera-academy uses dark navy-purple #272749 background, white labels, rounded containers)
- Consumer accent palette (e.g. chimera-academy palette): Lilac (#C980FC), Coral (#FF7151), Pink (#F488F8), Purple (#A65FF6)
- Numbered items use **colored circle badges** (gradient through the consumer's palette — e.g. chimera-academy: purple → pink → coral)
- Clean, modern, minimal — NOT hand-drawn/sketch aesthetic
- No photorealistic images or stock photo aesthetics
- Keep diagrams simple — if it needs a legend, it's too complex for one slide

## Brand Tokens

The brand-token table is consumer-specific. The structure below shows the chimera-academy reference values; consumer plugins override these in their own brand overlay.

| Token | Light Theme (chimera-academy) | Dark Theme (chimera-academy) |
|-------|-------------|------------|
| Background | #FFFFFF | #0F0F13 |
| Text | #000000 | #FFFFFF |
| Sub-text | #4F4F67 | #AEAEC8 |
| Footer | #AEAEC8 | #4F4F67 |
| Accent | #C980FC | #C980FC |
| Accent Secondary | #FF7151 | #FF7151 |
| Font | Inter 400/800 | Inter 400/800 |
