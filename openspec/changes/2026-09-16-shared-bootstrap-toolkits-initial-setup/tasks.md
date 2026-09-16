# Tasks — 2026-09-16-shared-bootstrap-toolkits-initial-setup

Change: `2026-09-16-shared-bootstrap-toolkits-initial-setup` · Domain: `area:meta`

## Phase A — OpenSpec + scaffold (this PR)

- [x] Write `proposal.md`, `design.md`, `tasks.md`, delta spec
- [x] Add `shared/bootstrap/` plugin tree (plugin.json, command, protocol, adapters)
- [x] Register `better-toolkits-bootstrap` in root `marketplace.json`
- [x] Add `shared/bootstrap/cli/` stub (`@chimeranext/better-toolkits`)
- [x] Wire stderr hooks via `shared/hooks/stderr` relative path
- [x] Add `.cursor/commands/toolkits-initial-setup.md` for monorepo dev
- [x] Update root `README.md` + `AGENTS.md`; deprecate `@lapc506` install as SSOT in MNM README
- [ ] Open draft PR

## Phase B — CLI implementation

- [ ] Implement `better-toolkits setup` subcommand (detect, audit, propose; install behind `--yes`)
- [ ] Publish `@chimeranext/better-toolkits` to npm under `chimeranext` org
- [ ] Add CI smoke for CLI + protocol lint

## Phase C — Consumer validation

- [ ] Dogfood on Cursor: bootstrap → setup → install MNM + IDT
- [ ] Dogfood on Claude Code: same flow
- [ ] Dogfood on OpenCode: CLI + opencode.jsonc merge for N toolkits

## Phase D — Package scope migration (follow-up)

- [ ] Rename `@lapc506/*` → `@chimeranext/*` in toolkit `package.json` files
- [ ] Redirect or deprecate old npm packages with README notice
