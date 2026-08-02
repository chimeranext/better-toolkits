# CLAUDE.md — Instructional Design Toolkit

Guidance for Claude Code agents and human contributors working in
`instructional-design-toolkit` (IDT). Optimized for accuracy, multi-tenant
neutrality, and preventing the bug classes Greptile and human reviewers have
flagged across the DOJ-3705 → DOJ-3712 separation-of-concerns chain.

This file complements (does not replace) the README. The README pitches what
IDT is to humans deciding whether to install it; this file pitches what IDT is
to **agents executing inside the repo** — what to touch, what never to touch,
which Linear issues govern which surface, and how to keep the toolkit
multi-tenant under pressure.

---

## What This Toolkit Is

IDT is a **generic Claude Code plugin for course authoring**. It is markdown-
driven — there is no compiled runtime. Commands, skills, and agents are prose
files that Claude reads and executes; the only "binaries" in the repo are the
three Python lint scripts at `scripts/ci/` (DOJ-3774).

### Multi-tenant by design

IDT serves three audiences simultaneously:

- **Instructores externos** building courses for their own communities.
- **Founders de Launchpad startups** teaching what they have learned.
- **Equipos internos de Chimera Coding** (Pathways, Software Factory, partner
  programs) — including `chimera-academy` as the first consumer.

The toolkit ships **voice-neutral by default**. Chimera-specific editorial voice
("Builder-First, AI-Native", `CONTEXT → CONCEPT → BUILD → SHIP → REFLECT`,
"Multi-Quading", deep-guide / challenge-brief load-bearing rules) lives in
`chimera-academy` overlay skills and is discovered at runtime via the cwd plugin
context — it NEVER ships inside this repo.

If a contribution to IDT base would only make sense for Chimera Coding, it
belongs in `chimera-academy` as an overlay, not here. The "would this break for
an instructor in Argentina shipping a Python course on Moodle?" test catches
most violations.

### Standards-first

IDT outputs are **cmi5 / xAPI compliant from origin**. The base draft of every
authoring command is a Layer 1 + Layer 2 artifact (see "Skill overlays"
below):

- **Layer 1 — Standard invariants.** `meta.id`, `modules[].au_id`,
  `meta.version`, `meta.version_timeline[]`, `capstone.id`, and the reserved
  Open Badges 3.0 / W3C VC credential fields. Mutating any of these breaks
  every learner's xAPI history; the runtime aborts the run if an overlay
  attempts to.
- **Layer 2 — Pedagogy generic.** SAM > ADDIE, Atomic Habits cue → reward,
  Irby coach / mentor / tutor distinction, Ship-First Design, Bloom's
  progression, Kirkpatrick L1-L4 evaluation. Defended opinion — overlays may
  extend but contradictions log a warning.

**Layer 3 — Editorial voice** (named frameworks, voice transforms, momentum
endings) is consumer-owned. IDT base contains zero L3 content.

### Base + Overlay pattern (DOJ-3706)

The architectural decision separating IDT base from consumer voice is the
**Base + Overlay pattern**, formalized in
`openspec/changes/2026-05-base-overlay-pattern/` and implemented per
`assets/runtime/overlay-protocol.md`. Every authoring command produces an
L1 + L2 base draft and then runs the overlay loop in §3 of the protocol. With
zero overlays installed, the base draft is the final output — voice-neutral
and cmi5-compliant. With overlays installed (e.g. `chimera-academy`'s
`academy-philosophy` + `content-standards`), the draft is mutated in priority
order until it carries the consumer's voice.

### Surface counts (current)

- **30 commands** under `commands/` (plus 2 internal `_translation-pipeline.md`
  / `_translation-strategy.md` includes — underscore prefix marks them as
  helpers reused by `translate-content`).
- **20 agents** under `agents/`.
- **20 skills** under `skills/<skill-name>/SKILL.md`.
- **1 runtime** under `assets/runtime/overlay-protocol.md` (the executable
  spec of the Base + Overlay loop).
- **1 CI workflow** under `.github/workflows/lint.yml` with 3 lint scripts
  under `scripts/ci/` (DOJ-3774).

---

## Skill overlays

Overlays are how IDT stays multi-tenant. The full executable contract is at
`assets/runtime/overlay-protocol.md`; this section is the operator-level
summary every authoring skill needs to understand.

### Discovery

When an IDT command runs, the runtime walks `<cwd>/.claude-plugin/plugin.json`
to locate the consumer plugin and scans its `skills/*/SKILL.md`. A skill is a
candidate overlay iff its YAML frontmatter declares a non-empty
`overlay_target` array. Skills whose `overlay_target` includes the running
command name are kept; the rest are dropped silently (forward-compat for
plugin versions newer than IDT).

If `<cwd>/.claude-plugin/plugin.json` is missing → discovery returns zero
overlays, no warning. Voice-neutral output is a valid path.

If the file is malformed → emit a visible warning naming the offending plugin
path and continue with zero overlays.

### Invocation order

The runtime sorts kept candidates by `overlay_priority` ascending (lower →
applied first), with case-insensitive forward-slash-normalized SKILL.md path
as the alphabetical tie-breaker. Each overlay runs sequentially, each
receiving the prior overlay's output (or the L1+L2 base draft for the first).

The contract is in `assets/schemas/overlay-protocol.schema.json`
(`OverlayInput`, `OverlayOutput`, `OverlaySkillFrontmatter`).

### Default tiers

Overlay authors should pick a priority from these defaults unless they have a
documented reason to deviate:

| Tier | Default | When to use | Example |
|---|---|---|---|
| Structural | `50` | Reshapes scaffold early; adds sections, marks load-bearing fields | `chimera-academy/skills/content-standards` |
| Generic | `75` | Annotates / extends without changing voice (locale, accessibility, link checking) | locale variants, partner co-branded link decoration |
| Voice / editorial | `100` | Runs late on the structured draft; voice transforms, named-framework intros, momentum endings | `chimera-academy/skills/academy-philosophy` |

### Layer 1 invariants are immutable

The overlay loop runs the §5 validator before the first overlay, after every
overlay return, and once after the loop completes. Snapshot vs. post-overlay
values for every Layer 1 field (§4 of the protocol — stable identifiers,
cmi5/xAPI structural fields, semver classification, reserved credential
fields) are compared. Any mutation aborts the run with a clear error pointing
at the offending overlay's `SKILL.md` path; no files are written.

This is the load-bearing guarantee that makes IDT safe to compose with
arbitrary consumer overlays — an overlay author cannot accidentally break
xAPI history, even maliciously.

### Findings-shaped commands (§5.4)

Audit-style commands (`course-audit`, `module-audit`, `content-review`,
`session-plan-audit`) have a `baseDraft` that is a **report of findings about
a source artifact**, not the artifact itself. The §5.1 snapshot-compare
procedure trivially passes on the findings object because it has no Layer 1
field paths.

§5.4 of the protocol formalizes the expanded procedure for these commands:

1. The IDT skill MUST pass the underlying source artifact (e.g. the loaded
   `course.json`) into the overlay loop as a side-channel at
   `context._sourceArtifact` (single underscore prefix marks it
   runtime-internal — overlays SHOULD NOT mutate it).
2. The pre-loop snapshot is taken against `context._sourceArtifact`, not
   against `baseDraft`. The snapshot is constant for the entire run.
3. After each overlay, the runtime scans newly-added findings for action-
   shaped fields (`recommended_change`, `proposed_diff`) that mention any
   Layer 1 field path in a mutating way (e.g. `set meta.id = ...`,
   `replace modules[0].au_id`). If found → ABORT with the §5.1 error template,
   naming the overlay AND the offending finding's index.
4. Findings that propose changes to mutable fields (titles, slugs,
   description text, `analysis.identified_risks`) are fine — only L1 mentions
   trigger the abort.

If you are migrating or adding a new audit-style command, follow this
contract. Don't invent a new mechanism.

### `${CLAUDE_PLUGIN_ROOT}` defensive note (DOJ-3775, §6.1)

Skills and commands resolve sibling files via Claude Code's plugin
substitution token `${CLAUDE_PLUGIN_ROOT}` (e.g.
`${CLAUDE_PLUGIN_ROOT}/assets/runtime/overlay-protocol.md`,
`${CLAUDE_PLUGIN_ROOT}/agents/<agent>.md`).

Two cases warrant explicit handling:

1. **In-plugin context (the normal case).** The token resolves to the IDT
   plugin install path. Reads succeed; the runtime executes as documented.
2. **Out-of-plugin / direct-CLI invocation.** A user running `claude` from
   inside a checkout of this repo (or any context where the plugin
   substitution layer is not active) sees `${CLAUDE_PLUGIN_ROOT}` as a
   literal string that does not expand. Reads fail with "no such file or
   directory". When this happens, the IDT skill MUST:
   - Detect the failed token resolution.
   - Emit a **visible warning** in the user-facing Claude response naming the
     token and the path it was supposed to expand to.
   - Skip overlay invocation gracefully and emit the base draft.
   - NOT crash, NOT silently produce a base draft as if no overlays had been
     requested — that would erase the distinction between "no overlays
     installed" and "overlay subsystem unreachable".

§6.1 of `assets/runtime/overlay-protocol.md` is authoritative; treat this
summary as a pointer.

### Reference: chimera-academy as the canonical consumer

`chimera-academy` (the Chimera Coding content monorepo) is the first consumer to
adopt the overlay protocol (DOJ-3710). It ships two overlay skills:

- `skills/content-standards/SKILL.md` — structural overlay, priority `50`.
  Applies the `CONTEXT → CONCEPT → BUILD → SHIP → REFLECT` formula and the
  "text classes carry the course" load-bearing rule on top of the L1+L2 base
  draft.
- `skills/academy-philosophy/SKILL.md` — voice overlay, priority `100`.
  Applies "Builder-First, AI-Native" voice, named frameworks like
  Multi-Quading, and momentum-ending paragraphs.

Reading those two files is the fastest way to internalize what an overlay
looks like in practice. Their `overlay_target` arrays list the IDT commands
they apply to (`new-course`, `course-audit`, `slides-preview`, and the
DOJ-3708 / DOJ-3709 migrated `write-*` commands).

---

## Symbolic references

IDT generates **symbolic cross-references** by default. Course content
authored through IDT commands (`new-course`, `write-text-class`,
`write-lesson`, `write-module`, etc.) SHOULD emit symbolic refs in cross-link
positions in preference to hardcoded URLs or relative `.md` paths.

The full convention is documented in
`openspec/changes/2026-05-symbolic-references/` (DOJ-3713). **Status:
Proposed.** Treat the convention as **advisory** until the openspec is
ratified — agents SHOULD prefer symbolic refs in new content but MUST NOT
rewrite existing hardcoded URLs to enforce the convention while it is still
under proposal. Once DOJ-3713 ships, `SHOULD` upgrades to `MUST` and this
note is removed.

### Why

Hardcoded URLs couple course content to whatever route schema the hosting
platform happens to use today. As soon as the platform evolves its routes
(e.g. ChimeraOS adds path-aware routing per DOJ-3714), every link in every
course breaks. Relative `.md` paths fail differently — they work on the
filesystem but don't resolve to URLs at render time, since `.md` files are
not addressable in the runtime.

Symbolic refs solve both problems by moving the resolver into the platform.
Course content references are stable; the platform owns the route schema.

### Syntax

```
[<display text>][<type>:<slug-path>]
```

Or inline (no display text):

```
[<type>:<slug-path>]
```

Supported type prefixes:

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

The slug-path uses the canonical `au_id` format — the same identifier xAPI
relies on. Two systems share one source of truth.

#### `lesson:` disambiguation

The `lesson:` type prefix admits two slug-path shapes — standard module-
nested lessons and workbook-style lessons under a `docs` subtree. The
disambiguation rule both `parseSymbolicRef` implementations and human readers
follow: **a `lesson:` ref is a workbook lesson iff segment 2 of the
slug-path is the literal token `docs`**. Otherwise it is a standard
module-nested lesson. Examples:

- `[lesson:chimera-mindset/module-01-the-last-skill/text-01-the-last-skill]` —
  segment 2 is `module-01-the-last-skill`, not `docs` → standard lesson.
- `[lesson:vibe-coding-blueprint/docs/ch-01-mindset/lesson-01-vibe-coder]` —
  segment 2 is `docs` → workbook lesson.

Resolvers MUST implement this rule consistently across platforms.
Authoritative reference: `openspec/changes/2026-05-symbolic-references/design.md`.

### Resolver contract

Each platform that renders IDT-authored content ships a function with this
signature:

```typescript
function resolveSymbolicRef(ref: SymbolicRef, ctx: ResolveContext): string
```

`parseSymbolicRef` and `resolveSymbolicRef` are split for testability — the
parser owns Markdown grammar, the resolver owns route schema. The parser
returns `null` for unknown type prefixes, plain Markdown links, and inline-
style refs with explicit URLs (treat as already-resolved).

The ChimeraOS reference implementation lives in the chimera-os repo (sibling to
this one). When ChimeraOS evolves its route schema (e.g. path-aware routing per
DOJ-3714), it updates the resolver — course content remains untouched.

### Example: text class output rendered in ChimeraOS

An IDT-generated text class authored with `/idt:write-text-class` may emit:

```markdown
For deeper context on the framework, see [Module 01:
The Last Skill][module:chimera-mindset/module-01-the-last-skill].
```

ChimeraOS's resolver receives `{ type: 'module', slugPath:
'chimera-mindset/module-01-the-last-skill' }` plus optional context (e.g.
`pathSlug` if the learner is inside a Path) and emits the live URL — for
example `/app/courses/chimera-mindset/modules/module-01-the-last-skill` today,
or `/app/pathways/agentic-coding/courses/chimera-mindset/modules/module-01-the-last-skill`
once DOJ-3714 ships path-aware routing. Same content, different route schema,
zero rewrites.

### What NOT to do

- Do NOT hardcode URLs in course content (`[Lesson 3](/app/courses/<slug>?class=<slug>)`).
- Do NOT use relative `.md` paths for cross-references between lessons
  (`[Context Engineering](../../../module-04/module-overview.md)`).
- Do NOT invent new type prefixes without updating
  `openspec/changes/2026-05-symbolic-references/design.md` first — the parser
  refuses unknown types and renders them as plain text.

---

## Repo composability

IDT is designed to be installed as a Claude Code plugin dependency in any
consumer repo. The composability contract is intentionally minimal — three
expectations, no more.

### Expectations on the consumer repo

1. **Declare IDT as a plugin dependency** in
   `<consumer-repo>/.claude-plugin/plugin.json`. Claude Code handles
   discovery; IDT does not require any custom bootstrap.
2. **Provide a content directory structure** appropriate for the consumer's
   needs. IDT does not enforce a layout — `chimera-academy` uses
   `courses/<courseSlug>/...`, but external consumers may use
   `content/<slug>/`, `cursos/<slug>/`, or whatever shape fits their
   workflow. Authoring commands accept paths via dialogue or arguments.
3. **(Optional) Provide overlay skills** with `overlay_target` frontmatter,
   following the contract in `assets/runtime/overlay-protocol.md`. This is
   how the consumer adds editorial voice without forking IDT.

That's the complete contract. Everything else (which courses exist, which
voice the consumer wants, which LMS they target) is consumer-side.

### Examples of consumers

- **`chimera-academy`** — Chimera Coding's internal content monorepo. First
  consumer to adopt the overlay protocol (DOJ-3710). Ships
  `academy-philosophy` (voice, 100) + `content-standards` (structural, 50)
  overlays.
- **`flutter-fullstack-2026`** — community-grade course repo, also internal.
- **A future Pricing Strategies masterclass repo** — single-course consumer.
- **An instructor's personal course repo** — solo creator using IDT to ship
  cmi5-packaged courses to Moodle.
- **A Launchpad startup's content repo** — founder teaching what they
  learned.

The multi-tenant pitch is preserved by keeping IDT base voice-neutral. Every
PR that lands in `commands/`, `agents/`, `skills/`, or `assets/runtime/` MUST
be reviewable against the test: "would this also help an instructor in
Argentina shipping a Python course on Moodle?" If the answer is no, it
belongs in an overlay, not in IDT base.

---

## CI workflow

`.github/workflows/lint.yml` (DOJ-3774) runs on every pull request and on
every push to `main`. Three lint checks gate the PR before Greptile review,
catching the bug class flagged in the DOJ-3771 / DOJ-3772 / DOJ-3773 chain:
typo'd agent names, missing or malformed YAML frontmatter, broken JSON
schemas.

| Step | Script | Purpose |
|---|---|---|
| 1 | `scripts/ci/check_json_schemas.py` | Every `assets/schemas/*.json` parses as valid JSON. |
| 2 | `scripts/ci/check_frontmatter.py` | Every `commands/*.md`, `skills/*/SKILL.md`, `agents/*.md` either has no frontmatter (skipped — e.g. translation pipeline support docs) or has a parseable mapping with a non-empty `description` field. |
| 3 | `scripts/ci/check_agent_references.py` | Every `${CLAUDE_PLUGIN_ROOT}/agents/<name>.md` reference inside skills / commands resolves to a file that ships in `agents/`. Bare `agents/<name>.md` references are intentionally ignored — those are consumer-relative (e.g. `commands/_translation-pipeline.md` documents `agents/translator.md` shipped by the consumer, not by IDT). |

Typical run time: ~7 seconds. Designed as a **pre-Greptile gate** — catches
mechanical bugs cheaply, freeing Greptile and human reviewers to focus on
contract and pedagogy concerns.

### Why standalone scripts and not heredoc steps

The DOJ-3774 implementation extracted all three checks from heredoc YAML
steps into standalone Python scripts at `scripts/ci/`. Reasons:

- Heredoc-embedded Python suffers from indentation fragility — a single
  accidental tab inside the YAML breaks the script silently.
- Standalone scripts are testable locally (`python3 scripts/ci/check_*.py`
  from the repo root).
- Editor tooling (linters, type checkers) works against `.py` files; heredoc
  Python is invisible to it.
- Future checks (e.g. cross-reference resolution from
  `2026-05-symbolic-references`) drop in as additional `scripts/ci/check_*.py`
  files without touching workflow YAML.

### Security note

The workflow operates on repo files only. No `${{ github.event.* }}` is
interpolated into shell — meaning issue / PR / commit metadata cannot reach
the lint scripts. Actions are pinned to full commit SHAs (not mutable version
tags) for supply-chain integrity. The job has `permissions: contents: read`;
if the workflow is ever compromised, the attacker cannot push back to the
repo.

When adding a new lint step, preserve these properties.

---

## Conventions for agents working in this repo

A few invariants worth being explicit about — most are derived from rules
the user has reinforced across hundreds of sessions.

### Linear

- Issues / tickets / spikes live in **Linear**, never in GitHub Issues. The
  team is `DOJ` per `linear-setup.json`.
- Comment on the relevant Linear issue at start, on key decisions, and at
  merge. This makes the issue thread the durable record of what happened.
- Never close a Linear issue unless the user explicitly instructs you to.

### Branches and PRs

- Branch naming: `<username>/<issue-id-lowercase>-<short-description>` per
  the `git.branchPattern` field in `linear-setup.json`. The `<username>`
  segment is the human or agent contributor's GitHub handle. The pattern in
  `linear-setup.json` currently hardcodes `andres/...` because Andrés is the
  primary contributor; future contributors should update that field (or
  override it locally) rather than reuse the literal `andres/` prefix.
- Always rebase on `main` before pushing if conflicts appear; never
  force-push to `main`; never use `--no-verify` on commits / pushes.
- Squash merges only (`gh pr merge <n> --squash --delete-branch`).
- PR title format: `DOJ-<n>: <imperative summary>`.
- PR body includes `Closes [DOJ-<n>](https://linear.app/chimera-coding/issue/DOJ-<n>)`.
- Add "Created by Claude Code on behalf of @<user>" at the bottom of PR
  bodies and commit messages where the user is the requester.

### Greptile

- Every PR gets `@greptile review`. Wait for the first review (~2-5 minutes).
- The bar is **5/5 functional on the first review pass**. If Greptile lands
  at 5/5 immediately, merge. If it lands below 5/5, the goal is to *land at
  5/5 next time* — address every finding from the first pass, push the
  fixes, and merge. **Do not block waiting for a second Greptile cycle to
  confirm the score** (per `feedback_dont_wait_for_greptile_rereviews.md`).
  The discipline is "fix every finding"; the score gate is "5/5 at first
  pass". After fixes are pushed, Greptile may re-score asynchronously —
  that re-score is informational, not blocking.
- Never ask the user "should we skip Greptile?" — the answer is always no.

### CI

- `.github/workflows/lint.yml` (DOJ-3774) gates every PR. If a step fails,
  fix the underlying issue locally — don't bypass.
- Test the relevant lint script locally before pushing:
  `python3 scripts/ci/check_frontmatter.py`,
  `python3 scripts/ci/check_agent_references.py`,
  `python3 scripts/ci/check_json_schemas.py`.

### Spanish accents

- This repo is bilingual EN/ES with Spanish prose in many surfaces (README,
  most skills aimed at Latin American instructors). Always preserve tildes:
  *migración*, *verificación*, *análisis*, *patrón*, *también*, *diseño*.

### Multi-tenant discipline

- Every contribution to `commands/`, `agents/`, `skills/`, or
  `assets/runtime/` passes the test: "would this also help an instructor in
  Argentina shipping a Python course on Moodle?" If no → belongs in an
  overlay in a consumer repo, not here.
- Voice transforms, named frameworks, editorial conventions → consumer
  overlays. Always.
- Standards-track work (cmi5, xAPI, Open Badges 3.0, W3C VC) → IDT base.
  Always.

### Forbidden words and patterns

- Never use the word "refactor" in commits, PR titles, PR bodies, Linear
  comments, or generated content.
- Never auto-post to Slack from agent runs unless the user has explicitly
  opted in for that specific session.

---

## Linear issue map

The DOJ-3705 → DOJ-3712 separation-of-concerns chain shaped the current
repo:

| Issue | Surface | Status |
|---|---|---|
| DOJ-3705 | xAPI compliance baseline (`au_id` and friends) | Shipped |
| DOJ-3706 | Base + Overlay pattern (architectural decision) | Shipped (`openspec/changes/2026-05-base-overlay-pattern/`) |
| DOJ-3707 | Overlay protocol implementation (`assets/runtime/overlay-protocol.md`, schemas, three Phase-1 wired skills) | Shipped |
| DOJ-3708 | Migrate audit / review / infra commands from chimera-academy → IDT | Shipped (PR 1/2/3) |
| DOJ-3709 | Migrate agents and generic skills from chimera-academy → IDT | Shipped (PR-A: 12 agents, PR-B: 6 generic skills via DOJ-3829) |
| DOJ-3829 | Migrate 6 generic skills from chimera-academy → IDT (PR-B of DOJ-3709) | Shipped |
| DOJ-3710 | Convert chimera-academy `academy-philosophy` + `content-standards` to overlays | Shipped (in chimera-academy) |
| DOJ-3711 | Remove duplicate `audit-course` / `plan-course` from chimera-academy | Shipped (in chimera-academy) |
| DOJ-3712 | This file (CLAUDE.md update) + sibling chimera-academy CLAUDE.md update | This PR |
| DOJ-3713 | Symbolic refs convention | Proposed (`openspec/changes/2026-05-symbolic-references/`) |
| DOJ-3714 | Path-aware routing in ChimeraOS (consumer-side bug) | Tracked separately |
| DOJ-3774 | Pre-Greptile lint workflow | Shipped (`.github/workflows/lint.yml` + `scripts/ci/`) |
| DOJ-3775 | `${CLAUDE_PLUGIN_ROOT}` defensive note in overlay protocol | Shipped (`overlay-protocol.md` §6.1) |

When opening a new IDT issue, place it in this chain or branch a new one
explicitly. Don't reuse a closed issue.

---

## Related repos

| Repo | Role | Link |
|---|---|---|
| `chimera-academy` | First internal consumer — Chimera Coding's content monorepo. Ships the canonical overlay implementation (`academy-philosophy` voice + `content-standards` structural). Reading its `CLAUDE.md` is the fastest way to see how a consumer wires IDT. | <https://github.com/chimeranext/chimera-academy> |
| `chimera-os` | The platform that renders IDT-authored content for ChimeraOS Pathways. Owns the symbolic-ref resolver (DOJ-3713) and the path-aware routing layer (DOJ-3714). | <https://github.com/chimeranext/chimera-os> |
| `srd-framework` | Sibling plugin — Strategic Research Document framework. IDT auto-discovers `business/`, `business-model/`, `srd/` for course context (`business-context-detector` agent). | (sibling Claude Code plugin) |
| `business-model-toolkit` | Sibling plugin — Business Model Canvas + Lean methodology. Same auto-discovery hook. | (sibling Claude Code plugin) |
| `ux-research-toolkit` | Sibling plugin — UX research artifacts. Same auto-discovery hook. | (sibling Claude Code plugin) |

The `chimera-academy/CLAUDE.md` companion (sibling PR to DOJ-3712, opened in
parallel) covers the consumer side of this contract — overlay authoring,
content layout conventions, and how the academy uses IDT in practice. Read
both files together to get the full picture.

---

## License

This repo is licensed under [BSL-1.1](./LICENSE). Same convention applies
to overlays in consumer repos that depend on IDT — the user's policy is BSL
1.1 across the Chimera Coding plugin family.
