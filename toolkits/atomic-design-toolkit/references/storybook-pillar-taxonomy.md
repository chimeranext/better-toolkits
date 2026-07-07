# Storybook Pillar-First Atomic Taxonomy — Spec & Templates

Reference for `/storybook-setup`. The taxonomy makes the Storybook sidebar a faithful projection of the code's pillar + atomic structure, with the shared design system owned by the platform pillar.

## The Taxonomy

```
<Pillar>/<AtomicLevel>/<Component>[/<Variant>]
```

| Surface | Lives at | Story title |
|---------|---------|-------------|
| Shared DS primitive | `src/components/ui/button.tsx` | `Platform/Atoms/Button` |
| Shared DS foundation | theme file | `Platform/Foundations/Colors` |
| Pillar organism | `src/components/pathways/organisms/CourseCard.tsx` | `Pathways/Organisms/CourseCard` |
| Pillar molecule | `src/components/projects/molecules/BountyChip.tsx` | `Projects/Molecules/BountyChip` |

Key decisions baked into this convention:

1. **The shared DS belongs to the platform pillar** — not to a top-level `Foundations/Components/Patterns` grouping. A DS-tool grouping decouples the sidebar from the code structure and drifts with every new story.
2. **The title encodes the file path.** `title:` is free-form in Storybook — that freedom is the drift vector. The convention removes it: the title is derivable from (and verifiable against) the file's pillar + atomic path.
3. **AtomicLevel is explicit.** `Platform/Upsell/UpsellCTACard` is pillar-aware but still drifts into catch-alls; `Platform/Organisms/Upsell/UpsellCTACard` is the correct form.
4. **Mono-pillar repos** drop the pillar segment: `Atoms/Button`, `Organisms/CourseCard`.

## storySort Template (`.storybook/preview.ts`)

Derive the pillar list from `.atomic-design-rules.json` (`pillars` array) when present:

```ts
const atomicOrder = ['Foundations', 'Atoms', 'Molecules', 'Organisms', 'Templates'];

export const parameters = {
  options: {
    storySort: {
      order: [
        'Platform', atomicOrder,
        // one entry per pillar, platform first, then by domain order:
        'Pathways', atomicOrder,
        'Launchpad', atomicOrder,
        'Community', atomicOrder,
        // ...remaining pillars from .atomic-design-rules.json
        '*',
      ],
    },
  },
};
```

Storybook only renders sidebar nodes that contain at least one story — pillars without stories stay invisible until their first story lands. The scaffold is still worth writing upfront: it makes the order deterministic the moment coverage arrives.

## Coverage Audit Pattern

```bash
for p in src/components/*/; do
  name=$(basename "$p")
  comps=$(find "$p" -name '*.tsx' ! -name '*.stories.*' ! -name '*.test.*' | wc -l)
  stories=$(find "$p" -name '*.stories.*' | wc -l)
  echo "$name: $comps components, $stories stories"
done
```

Curation rules (a component ≠ a story):
- Story the **showcase-worthy top-level components**: organisms and molecules a contributor would browse to understand the pillar.
- Skip internal sub-parts, helpers, page glue, and one-off compositions.
- Provider-heavy components (auth, router, TanStack Query) need decorators/mocks — budget per component; pure DS primitives need none.
- Phase by pillar: one pillar per PR; split by atomic level past ~15 story files.

## Design Tokens — Figma Parity Checklist

- [ ] One theme file is the single source of truth (e.g. `src/styles/themes/{project}-theme.ts`); CSS custom properties and Tailwind config are generated/derived from it, never hand-edited in parallel
- [ ] Foundations stories per token family — Colors, Typography, Spacing, Radius (+ Gradients/Icons if the DS defines them) — render the actual exported token objects, zero hardcoded hex
- [ ] Each foundation story visually matches its Figma foundations page (screenshot/diff comparison, not eyeballing)
- [ ] Per-component parity: every story covers each Figma variant/size/state, plus disabled/focus/loading and a11y (keyboard, focus-visible, ARIA)
- [ ] Token-lint CI gate documented: fail the build on theme ⇄ CSS divergence (wiring CI is the user's decision)

## Title Enforcement Rule

The taxonomy without enforcement re-drifts with the next story. The rule:

> A `*.stories.tsx` file's `title:` must equal the `<Pillar>/<AtomicLevel>/...` path derivable from its file location under `src/components/`.

Recommended shape (mirrors atomic-design pre-write hooks where the repo has them):

- **Block on Write** (new stories are born correct), **allow on Edit** (legacy stories migrate incrementally)
- Honor the repo's exception marker (e.g. `@atomic-exempt: <reason>` in the first lines)
- Extend `.atomic-design-rules.json` with the story-title rule rather than inventing a parallel config

Migration warning: **retitling existing stories breaks Storybook permalinks** (the story ID derives from the title). Inventory affected URLs before the sweep and list them in the report so bookmarks/docs can be updated.

## Verification Checklist

```bash
npx storybook build              # or: bun run build-storybook
python3 -m http.server 8080 --directory storybook-static &
curl -sf http://localhost:8080  # served smoke test — the sidebar must actually render
# plus the repo's own gates:
npm run lint && npm run test     # or bun equivalents
```

Deploy config (`vercel.json` with `outputDirectory: "storybook-static"`) gets prepared, never executed — deploying is a human gate.
