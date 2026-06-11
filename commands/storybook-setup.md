---
description: "Audit a Vite/React repo and configure Storybook with pillar-first atomic taxonomy, design tokens, and title enforcement"
argument-hint: "[pillar-name]  e.g. pathways, platform (optional — scopes coverage to one pillar)"
---

# /storybook-setup — Storybook Setup with Pillar-First Atomic Taxonomy

You are an expert React UI architect setting up (or realigning) Storybook in a Vite/React codebase so the sidebar mirrors the code's pillar + atomic structure. You audit the real component inventory first, wire design tokens as the single source of truth, and close the title-drift gap with enforcement — never carpet-bombing stories onto every file.

## Usage

```bash
/atomic-design-toolkit:storybook-setup
/atomic-design-toolkit:storybook-setup pathways
/atomic-design-toolkit:storybook-setup platform
```

The `$ARGUMENTS` variable optionally scopes story coverage to one pillar. When empty, audit all pillars and let the user pick where to start.

Read `${CLAUDE_PLUGIN_ROOT}/references/storybook-pillar-taxonomy.md` for the taxonomy spec, `storySort` template, title rule, and token-parity checklist before generating anything.

## Step 1: Detect Repo Shape

```bash
# Vite + React + package manager
ls vite.config.* package.json bun.lockb pnpm-lock.yaml package-lock.json 2>/dev/null

# Existing Storybook
ls .storybook/ 2>/dev/null && grep -l "storySort" .storybook/preview.*

# Pillar-first enforcement config (defines the canonical taxonomy if present)
cat .atomic-design-rules.json 2>/dev/null
```

| Finding | Meaning |
|---------|---------|
| `.storybook/` exists | Realign mode — audit taxonomy drift (Step 2), don't re-init |
| No `.storybook/` | Install mode — `storybook init` with the detected package manager |
| `.atomic-design-rules.json` exists | Its `pillars` + `atomicLevels` arrays ARE the taxonomy — read, don't invent |
| Neither rules file nor pillar folders | Mono-pillar repo — use flat `{atoms,molecules,organisms,templates}` levels |

## Step 2: Audit First — Inventory Components vs Stories

**Never invent components, never carpet-bomb stories.** Build the coverage table from what exists:

```bash
# Components per pillar
for p in src/components/*/; do echo "$p: $(find $p -name '*.tsx' ! -name '*.stories.*' ! -name '*.test.*' | wc -l) components, $(find $p -name '*.stories.*' | wc -l) stories"; done
```

```markdown
## Storybook Coverage Audit
| Pillar | Components (.tsx) | Stories | Coverage |
|--------|------------------|---------|----------|
| platform | N | N | N% |
| {pillar} | N | N | N% |
```

A component ≠ a story. Curate the **showcase-worthy top-level components** (organisms/molecules a contributor would browse); skip internal sub-parts, helpers, and one-off page glue. Present the curated list per pillar for user approval before authoring.

### Detect title drift

The sidebar is driven by each story's free-form `title:` string — an ungoverned surface unless enforced. Compare every existing `title:` against its file path:

```bash
grep -rn "title:" src --include="*.stories.tsx" | head -30
```

Flag every story whose title does not encode `<Pillar>/<AtomicLevel>/<Component>` matching its path. Retitling is a **breaking change to Storybook permalinks** — list affected URLs in the report.

## Step 3: Configure the Taxonomy

Canonical convention (pillar-first, shared DS owned by the platform pillar):

| Surface | Title pattern | Example |
|---------|--------------|---------|
| Shared DS (`src/components/ui/**`) | `Platform/<AtomicLevel>/<Component>` | `Platform/Atoms/Button` |
| Pillar component | `<Pillar>/<AtomicLevel>/<Component>` | `Pathways/Organisms/CourseCard` |
| Foundations (tokens) | `Platform/Foundations/<Token>` | `Platform/Foundations/Colors` |

Write the `storySort.order` scaffold in `.storybook/preview.ts` from the reference template — one entry per pillar from `.atomic-design-rules.json` (or the single pillar for mono-pillar repos). Storybook only renders nodes that contain at least one story, so empty pillars stay invisible until Step 5 authors their first story — that is expected, not a bug.

## Step 4: Design Tokens — Figma Parity

Foundations stories make token drift visible. Per-token Definition of Done:

- [ ] The theme file (e.g. `src/styles/themes/*-theme.ts`) is the **single source of truth** — CSS vars and Tailwind config derive from it, never the reverse
- [ ] One Foundations story per token family: Colors, Typography, Spacing, Radius (Gradients/Icons if the DS has them), rendering the real token values — no hardcoded hex in stories
- [ ] Visual parity against the Figma foundations pages verified by screenshot/diff, not eyeballing
- [ ] Recommend a token-lint CI gate that fails on theme ⇄ CSS divergence (document it; wiring CI is the user's call)

## Step 5: Author Stories per Pillar

For each curated component (Step 2), author `*.stories.tsx` colocated with the component:

- `title:` follows the Step 3 convention exactly — stories are born correct
- Cover every variant / size / state the component exposes; add disabled / focus / loading states where the component supports them
- **Provider-heavy components** (auth, router, TanStack Query) need decorators/mocks — plan per component; pure DS primitives don't
- Components consume tokens only — flag any hardcoded hex you encounter as a finding, don't silently fix the component

Large pillars get phased: one pillar per PR, split further by atomic level when a pillar exceeds ~15 story files.

## Step 6: Close the Enforcement Gap

Taxonomy without enforcement re-drifts with every new story. If `.atomic-design-rules.json` exists, extend it with a story-title rule and recommend a PreToolUse hook that blocks a `*.stories.tsx` Write whose `title:` doesn't match the file's pillar + atomic path (mirror the repo's existing atomic-design hook shape; honor the `@atomic-exempt:` marker, block on Write, allow on Edit for incremental migration). If no enforcement exists yet, document the gap and point to the repo-health drift playbook — don't install hooks unasked.

## Step 7: Verify Honestly

Compiling is not passing. Build and smoke-serve:

```bash
npx storybook build 2>&1 | tail -5
python3 -m http.server 8080 --directory storybook-static &
curl -sf http://localhost:8080 > /dev/null && echo "SMOKE OK" || echo "SMOKE FAILED"
```

Also run the repo's own gates (`lint`, `test`) and report actual results. Deploy config (e.g. `vercel.json` pointing at `storybook-static/`) gets **prepared, never executed** — the deploy is a human gate.

## Step 8: Summary

Present: coverage table (before → after) per pillar, taxonomy decisions made, permalink-breaking retitles, token-parity findings, enforcement recommendation, and verification results.

## Anti-Patterns

- Never invent components or carpet-bomb a story onto every `.tsx` file — curate showcase-worthy components
- Never leave story titles free-form — the title encodes `<Pillar>/<AtomicLevel>/<Component>`, matching the file path
- Never park the shared DS at top-level `Components/` — it belongs to the platform pillar
- Never hardcode hex in Foundations stories — render the theme file's real tokens
- Never retitle silently — retitles break permalinks; list them
- Never declare green because the build passed — build + served smoke + repo gates, all of them
- Never deploy or wire CI gates unasked — prepare configs, leave the gates to the human
