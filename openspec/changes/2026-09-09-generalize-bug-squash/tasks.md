# Tasks — generalize bug-squash

Change ID: `2026-09-09-generalize-bug-squash`

## Phase 0 — OpenSpec (this change)

Store: monorepo `openspec/changes/2026-09-09-generalize-bug-squash/` (`openspec store register --id better-toolkits`).

- [x] `proposal.md` — problem, layering, non-goals
- [x] `design.md` — single-environment round, config shape, bootstrap, round.md v2
- [x] `specs/bug-squash/spec.md` — SHALL requirements + scenarios
- [x] OPSX wired at repo root (`openspec/config.yaml`, `/opsx-*`, `.openspec-store/store.yaml`)
- [x] `openspec validate 2026-09-09-generalize-bug-squash` green
- [ ] Human review (Daniel / Andrés / Isaac for Seacrets overlay alignment)

## Phase 1 — Toolkit implementation

- [ ] `commands/bug-squash.md` — harness entry; read references in order
- [ ] `references/bug-squash/protocol.md` — UDD, N1/N2/N3, Chrome MCP headed-only, close gate
- [ ] `references/bug-squash/setup-init.md` — bootstrap when config missing
- [ ] `references/bug-squash/round-schema.md` — v2 header (link from command)
- [ ] `bug-squash.config.example.json` at toolkit root (copy target for consumer repos)
- [ ] `commands/bug-squash.config.example.json` or document copy path in README
- [ ] README section: base command + overlay pattern
- [ ] Validate hook doc: set `$MNM_QA_ORIGIN` from round `Base URL`

## Phase 2 — Seacrets overlay (consumer repo)

- [ ] `seacrets.online-app`: add `.cursor/commands/bug-squash-seacrets.md` (profile overlay)
- [ ] `seacrets.online-app`: root `bug-squash.config.json` (Seacrets URLs; prod `enabled: false`)
- [ ] Deprecate `bug-squash.md` → 5-line pointer to toolkit + overlay
- [ ] Draft PR on `*/scrt-525-*` or follow-on issue (assignee `caco26i`)

## Phase 3 — Seacrets docs alignment

- [ ] Update `hitl-bug-squash-standard.md`: multi-env = multiple rounds; link toolkit OpenSpec
- [ ] Update `qa/rounds.md`: v2 header (`Environment` not hop chain)
- [ ] Pointer in SCRT-525 OpenSpec: v1 historical; v2 SSOT in MNM toolkit

## Phase 4 — Validation

- [ ] Dry-run bootstrap on clean repo (no config)
- [ ] Open round @ localhost only; confirm command blocks mid-round URL change
- [ ] Confirm `pre-tool-prod-write-guard.sh` with prod disabled in default config
- [ ] Seacrets smoke: one staging round artifact with v2 header
