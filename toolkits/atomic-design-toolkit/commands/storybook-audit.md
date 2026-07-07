---
description: "Audit Storybook story-coverage PER PILLAR — find every renderable component without a co-located .stories.tsx, grouped by pillar + atomic level. The backlog-discovery half of the story-coverage cure (the legacy-ticket CI gate stops NEW debt on the diff; this drains the EXISTING backlog). Feeds /generate."
argument-hint: "[:pillar=<name>] [:report] [:generate]  e.g. :pillar=pathways, :report, :generate"
---

# /storybook-audit — Story Coverage by Pillar

You are a Storybook coverage auditor with **one** job: find renderable components that lack a co-located `.stories.tsx`, grouped by **pillar + atomic level**. This is the backlog-discovery half of the story-coverage cure — the CI gate (legacy-ticket) blocks *new* story-less components on a PR diff; this command surfaces and helps drain the *existing* backlog across the whole tree.

This command is deliberately single-concern (the anti-monolith counterpart to `/audit`). Stack: Vite + React/Vue/Svelte/Solid with a Storybook setup.

## Usage

```bash
/atomic-design-toolkit:storybook-audit                  # full tree, every pillar
/atomic-design-toolkit:storybook-audit :pillar=pathways # one pillar
/atomic-design-toolkit:storybook-audit :report          # also write a report file
/atomic-design-toolkit:storybook-audit :generate        # scaffold the missing stories via /generate
```

## Step 0: Load the pillar taxonomy

Read `.atomic-design-rules.json` at repo root — the SAME source of truth the atomic-design hooks use (legacy-ticket cures; pillar ownership legacy-ticket / legacy-ticket / legacy-ticket). Extract:

- `pillars` — the pillar list + each pillar's `src/components/<pillar>/` scope.
- `storybook.scope` (default `src/components/`) + `dsScope` (default `src/components/ui/`) + `dsTitleMap` (the flat-DS atomic mapping).

If `.atomic-design-rules.json` is absent → fall back to the top-level dirs under `src/components/*/` as pseudo-pillars and WARN that the report is not pillar-accurate (point the user at the canonical file).

Also read `storybook-coverage-allowlist.json` at repo root if present — exempt those paths so the report matches the legacy-ticket gate (genuinely non-visual files: pure-logic, providers, types).

## Step 1: Inventory renderable components (per pillar)

For each pillar scope, find `.tsx` files that ARE renderable components, EXCLUDING:

- `*.stories.tsx`, `*.test.tsx`, `__tests__/`, `index.ts(x)`, `*.d.ts`, `*.demo.*`
- hooks (`use*`), pure-logic `.ts`, context-only Provider files, type-only files.

Renderable heuristic: a default export OR a PascalCase named export that returns JSX (`return <` / `=> <` / `React.FC`).

```bash
rg -l --type-add 'tsx:*.tsx' -ttsx 'export (default|const [A-Z]|function [A-Z])' src/components/<pillar>/ \
  | grep -vE '\.(stories|test)\.|/__tests__/|/index\.|\.d\.ts$|\.demo\.'
```

## Step 2: Coverage check + atomic classification

For each renderable `<dir>/<Base>.tsx`, check whether `<dir>/<Base>.stories.tsx` exists. Classify the atomic level from the path (`atoms/` / `molecules/` / `organisms/` / `templates/` / pages); the DS lives flat in `ui/`, so use `dsTitleMap` for those. Skip allowlisted paths.

## Step 3: Report — per pillar, worst-covered first

One table per pillar + a totals row:

```markdown
### Story Coverage — <pillar>
| Atomic | Components | With story | Missing | Coverage |
|--------|-----------|-----------|---------|----------|
| atoms      | N | n | m | xx% |
| molecules  | … |
| organisms  | … |
| **total**  | … | … | … | **xx%** |

Missing:
- src/components/<pillar>/…/Foo.tsx  →  expected Foo.stories.tsx  (organism)
```

End with a **global roll-up**: total / with-story / missing / overall %, with pillars sorted **worst-covered first** so the biggest debt surfaces at the top. Never list allowlisted files as missing.

## Step 4 (`:generate`): scaffold the missing stories

For each missing story, either invoke `/atomic-design-toolkit:generate` (story-only) or write a minimal `<Base>.stories.tsx` that:

- Uses the title taxonomy the storybook-title hook enforces (`<Pillar>/<Atomic>/<Component>`, DS under `Platform/…`).
- CSF3: one default story + a variant per meaningful prop/state.
- Wraps the story in the app provider decorator (Query + Router + Auth) **only when needed** — detect by scanning the component's imports for `useAuth` / `useNavigate` / `useQuery` / context hooks. Presentational components need no providers.
- NEVER overwrites an existing story.

## Report Mode (`:report`)

Write `.atomic-design-toolkit/reports/storybook-audit-{YYYYMMDD-HHMM}.md` with the per-pillar tables + global roll-up + the missing list. Sibling of `/audit`'s report; `/migrate` can consume the missing list as a Phase 5 (Hardening) batch.

## Relationship to the CI gate (legacy-ticket)

- **CI gate** (`storybook-coverage.yml`) runs on the **diff** → blocks *new* story-less components.
- **This command** runs on the **whole tree, per pillar** → surfaces the *existing* backlog the gate intentionally does not fail on.
- Workflow: adopt the gate (stops the bleeding) → run this audit to drive coverage to 100% pillar by pillar → the gate keeps it there. Both are Cure 4a (the gate is the hook/CI; this is the discovery/remediation tool).

## Initial setup

This command assumes Storybook already exists and only measures coverage. Standing up Storybook the first time (IA, design tokens, title enforcement) is a one-time `/atomic-design-toolkit:storybook-setup`.
