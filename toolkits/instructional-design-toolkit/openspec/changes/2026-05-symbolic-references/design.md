# Symbolic references over hardcoded URLs — Design

**Status:** Proposed
**Decided by:** Daniel Bejarano + Juan C. Guerrero (per Slack `1777650182.967539` taxonomy)

## Problem

Course content today links between lessons using one of three patterns:

1. **Relative `.md` paths** — e.g. `[Context Engineering](../../../agentic-coding/module-04-context-engineering/module-overview.md)`. Works on the filesystem; breaks when the platform renders Markdown because `.md` files are not addressable URLs in the runtime.
2. **No cross-references** — most existing courses simply don't link between lessons. Audit (sibling `audit-checklist.md`) confirms this is the dominant case in chimera-academy.
3. **Hypothetical hardcoded URLs** — none today (audit found 0). But as content grows, authors will reach for `[Lesson 3](/app/courses/<slug>?class=<slug>)`. That couples content to whatever route schema ChimeraOS happens to use that week — a recipe for the kind of breakage seen in [DOJ-3714](https://linear.app/chimera-coding/issue/DOJ-3714).

We need a convention before authors learn the wrong habit.

## Decision

Course content uses **symbolic references** in cross-link positions. The hosting platform implements a **resolver** that converts symbolic refs to live URLs at render time.

### Symbolic ref syntax

```
[<display text>][<type>:<slug-path>]
```

Or inline:

```
[<type>:<slug-path>]
```

| Type prefix | Slug-path shape | Example |
|---|---|---|
| `course:` | `<courseSlug>` | `[course:chimera-mindset]` |
| `module:` | `<courseSlug>/<moduleSlug>` | `[module:chimera-mindset/module-01-the-last-skill]` |
| `lesson:` | `<courseSlug>/<moduleSlug>/<classSlug>` | `[lesson:chimera-mindset/module-01-the-last-skill/text-01-the-last-skill]` |
| `lesson:` (workbook) | `<courseSlug>/docs/<chapterSlug>/<lessonSlug>` | `[lesson:vibe-coding-blueprint/docs/ch-01-mindset/lesson-01-vibe-coder]` |
| `video-lesson:` | `<courseSlug>/<moduleSlug>/<classSlug>` | `[video-lesson:chimera-mindset/module-01/video-01-intro]` |
| `assessment:` | `<courseSlug>/<moduleSlug>/<classSlug>` | `[assessment:chimera-mindset/module-01/quiz-01]` |
| `simulation:` | `<courseSlug>/<moduleSlug>/<classSlug>` | `[simulation:chimera-mindset/module-01/challenge-01]` |
| `final-assessment:` | `<courseSlug>/<moduleSlug>/<classSlug>` | `[final-assessment:chimera-mindset/module-final/exam-01]` |

The slug-path uses the canonical `au_id` format from DOJ-3705 (xAPI compliance). The two systems share the same identifier — `au_id` is the authoritative key, and symbolic refs are just one way to spell it.

### Resolver contract

Each platform that renders course content ships a function with this signature:

```typescript
function resolveSymbolicRef(ref: SymbolicRef, ctx: ResolveContext): string
```

Where:

```typescript
type SymbolicRef = {
  type: 'course' | 'module' | 'lesson' | 'video-lesson' | 'assessment' | 'simulation' | 'final-assessment'
  slugPath: string  // e.g. "chimera-mindset/module-01-the-last-skill/text-01-the-last-skill"
}

type ResolveContext = {
  // Optional path context — used by Pathways to emit /app/pathways/<pathSlug>/...
  pathSlug?: string
  // Optional locale. Each platform decides how to inject it (e.g. `?lang=es`,
  // a `/es` path prefix, an Accept-Language header). cmi5 translations share
  // au_id with their source-language counterparts, so the slug-path stays
  // the same across locales — the resolver mutates the URL, not the ref.
  // ChimeraOS today does not yet localize URLs; this field is a forward hook.
  locale?: 'en' | 'es'
}
```

`parseSymbolicRef` and `resolveSymbolicRef` are split for testability — the parser owns Markdown grammar, the resolver owns route schema. Both are exported.

#### `parseSymbolicRef`

```typescript
function parseSymbolicRef(text: string): SymbolicRef | null
```

Accepts these input forms:

| Input | Returns |
|---|---|
| `[course:chimera-mindset]` | `{type: 'course', slugPath: 'chimera-mindset'}` |
| `[Display text][course:chimera-mindset]` (reference-style) | `{type: 'course', slugPath: 'chimera-mindset'}` (display text is preserved by the surrounding Markdown engine; parser ignores it) |
| `[course:chimera-mindset](some-url)` (inline-style with explicit URL) | `null` — the author has pinned a URL, treat as a regular Markdown link, do not double-resolve |
| `[unknown-type:foo]` | `null` — the parser refuses unknown type prefixes; the surrounding Markdown engine renders the bracketed text as plain text |
| Plain Markdown link `[text](https://...)` | `null` — parser only matches symbolic shapes |

Edge cases:

- Display text containing `:` or nested `[]` — the parser anchors on the LAST `[<knownType>:<path>]` segment and treats anything before it as display text. Implementations may use a regex like `/(\[[^\]]+\])?\[(course|module|lesson|video-lesson|assessment|simulation|final-assessment):([^\]]+)\]/`.
- Slug-path containing whitespace or `:` — invalid; parser returns `null`.

Implementations on different platforms must agree on the input grammar. Tests in `examples/cross-references-example/` will pin the contract once Phase 1 lands.

#### `resolveSymbolicRef` (ChimeraOS reference implementation)

```typescript
function resolveSymbolicRef(ref: SymbolicRef, ctx: ResolveContext): string {
  const segments = ref.slugPath.split('/')
  const courseSlug = segments[0]

  // Course-level base path is reused by every other case below.
  const courseBase = ctx.pathSlug
    ? `/app/pathways/${ctx.pathSlug}/courses/${courseSlug}`
    : `/app/courses/${courseSlug}`

  switch (ref.type) {
    case 'course':
      return courseBase

    case 'module': {
      // Modules do not have their own page in ChimeraOS today — they render
      // inline on the course home, with a deep-link anchor per module.
      const moduleSlug = segments[1]
      return `${courseBase}#${moduleSlug}`
    }

    case 'lesson':
    case 'video-lesson':
    case 'assessment':
    case 'simulation':
    case 'final-assessment': {
      // Both module-scoped lessons (`courseSlug/moduleSlug/classSlug`) and
      // workbook lessons (`courseSlug/docs/chapterSlug/lessonSlug`) collapse
      // to the same ChimeraOS route — the platform addresses lessons by their
      // FINAL slug, which is unique within the course. Module/chapter
      // context lives in au_id but does NOT surface in the URL. If ChimeraOS
      // ever changes this (e.g. workbook gets its own /app/.../docs/<chap>/<lesson>
      // route), this branch — and only this branch — must split.
      const classSlug = segments[segments.length - 1]
      return `${courseBase}?class=${classSlug}`
    }

    default: {
      // Exhaustive check — TypeScript errors here if a new type is added to
      // SymbolicRef.type without a matching case above.
      const _exhaustive: never = ref.type
      throw new Error(`Unknown symbolic ref type: ${_exhaustive}`)
    }
  }
}
```

A Moodle resolver would emit `@@PLUGINFILE@@/...`-style refs. A Ralph LRS exporter would emit IRIs. The resolver is the only platform-coupled code; everything upstream stays portable.

### Where the convention is enforced

- **IDT commands** (`new-course`, `write-text-class`, `write-lesson`, etc.) emit symbolic refs by default. The base prompt forbids hardcoded URLs.
- **ChimeraOS Pathways** ships `src/lib/symbolicRefs.ts` (or similar) implementing the resolver, and the lesson renderer invokes it on every parsed Markdown link.
- **Linter** (future enhancement) — a script that walks course markdown and flags any link target that looks like a route schema (`/app/`, `https://*.chimeranext.io/app/`).

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| **Hardcoded URLs** — author writes `/app/courses/<slug>?class=<slug>` directly | Couples every line of content to the current ChimeraOS route schema. Any schema change (e.g. fixing [DOJ-3714](https://linear.app/chimera-coding/issue/DOJ-3714)) becomes an N-file content rewrite, where N = number of cross-refs. The cost grows with content volume; today N is small, in a year it's >1,000. |
| **URL templates with placeholders** — author writes `{baseUrl}/courses/{courseSlug}?class={classSlug}` | Decouples the host but still bakes the route shape into content. If ChimeraOS moves from `?class=` to `/classes/<slug>`, every template needs a content edit. Symbolic refs don't expose the route shape at all. |
| **Frontmatter-only refs** — store cross-refs as a `related: ["lesson:..."]` array in frontmatter, not in body | Loses inline display text — readers can't see "see [Context Engineering][module:agentic-coding/...]" in the prose. Inline refs are how teachers naturally weave references into explanations. |
| **A new file extension** (`.dmd`?) | Premature standardization. Markdown with link-text-as-symbolic-ref reuses every existing tool (preview, grep, diff) and doesn't fork the ecosystem. |

## Trade-offs of this design

**Costs:**

- **Resolver per platform.** ChimeraOS today; Moodle / Ralph / Cornerstone / etc. each ship their own. Most are 30-50 lines of code.
- **Refs not clickable in raw Markdown preview.** GitHub renders `[course:chimera-mindset]` as plain text, not a link. Acceptable: the rendered platform is where the reader actually clicks.
- **One more concept for course authors to learn.** Mitigated by IDT enforcement — authors using `new-course` don't write refs by hand.

**Benefits:**

- **Schema changes don't touch content.** [DOJ-3714](https://linear.app/chimera-coding/issue/DOJ-3714) (path-aware routing) is a one-file resolver fix in ChimeraOS, not a content sweep.
- **Content portability.** Same symbolic refs work on Moodle, Ralph LRS, Cornerstone — each platform's resolver does the translation.
- **`au_id` and symbolic refs share the same identifier.** Single source of truth — no risk of drift between the cmi5 invariant and the cross-reference convention.

## How this depends on / interacts with other changes

| Sibling | Relationship |
|---|---|
| [DOJ-3705](https://linear.app/chimera-coding/issue/DOJ-3705) (xAPI / au_id template compliance) | This change reuses au_id as the slug-path. DOJ-3705 must ship first (or at least concurrently) so the IDs exist. |
| [DOJ-3714](https://linear.app/chimera-coding/issue/DOJ-3714) (path-aware routing in chimera-os) | Independent fix on the platform side. Once symbolic refs are in place, DOJ-3714's fix only changes the resolver — content stays put. |
| [DOJ-3707](https://linear.app/chimera-coding/issue/DOJ-3707) (skill-overlay discovery in IDT) | Editorial overlays may want to add platform-specific anchors (`#section`) post-resolution. Overlay protocol must allow that. |
| [DOJ-3712](https://linear.app/chimera-coding/issue/DOJ-3712) (CLAUDE.md docs in chimera-academy + IDT) | Documents this convention for human authors. |
