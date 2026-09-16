# Tasks — generalize bug-squash

Change ID: `2026-09-09-generalize-bug-squash`

## Phase 0 — OpenSpec (this change)

Store: monorepo `openspec/changes/2026-09-09-generalize-bug-squash/` (`openspec store register --id better-toolkits`).

- [x] `proposal.md` — problem, layering, non-goals
- [x] `design.md` — single-environment round, config shape, bootstrap, round.md v2
- [x] `specs/bug-squash/spec.md` — SHALL requirements + scenarios
- [x] OPSX wired at repo root (`openspec/config.yaml`, `/opsx-*`, `.openspec-store/store.yaml`)
- [x] `openspec validate 2026-09-09-generalize-bug-squash` green
- [ ] Human review OpenSpec design + spec scenarios

## Phase 1 — Toolkit implementation

- [ ] `commands/bug-squash.md` — harness entry; read references in order
- [x] `commands/bug-squash-locally.md` — minimal localhost entry + semantic locator pointers
- [x] `references/bug-squash/semantic-ui-locator-policy.md` — Storybook + MCP locator SSOT
- [x] `references/bug-squash/disconnected-pattern-library-anti-pattern.md` — host/test anti-pattern
- [ ] `references/bug-squash/protocol.md` — UDD, N1/N2/N3, Chrome MCP headed-only, close gate
- [ ] `references/bug-squash/setup-init.md` — bootstrap when config missing
- [ ] `references/bug-squash/round-schema.md` — v2 header (link from command)
- [ ] `bug-squash.config.example.json` at toolkit root (copy target for consumer repos)
- [ ] `commands/bug-squash.config.example.json` or document copy path in README
- [x] `.cursor/commands/bug-squash-locally.md` — monorepo Cursor thin entry
- [ ] README section: base command + overlay pattern
- [ ] Validate hook doc: set `$MNM_QA_ORIGIN` from round `Base URL`

## Phase 2 — Validation (toolkit only)

- [ ] Dry-run bootstrap on clean repo (no config)
- [ ] Open round @ localhost only; confirm command blocks mid-round URL change
- [ ] Confirm `pre-tool-prod-write-guard.sh` with prod disabled in default config
- [ ] Smoke: one staging round artifact with v2 header on a sample consumer config

## Out of scope (consumer repos)

Consumer adoption (product-specific overlays, `bug-squash.config.json` URLs, HITL runbooks, docs alignment) is **not** tracked in this monorepo change. Each product repo owns its overlay PRs and docs — see layering table in `design.md`.
