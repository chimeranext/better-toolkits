# toolkits-initial-setup — delta spec

## ADDED Requirements

### Requirement: Bootstrap plugin is marketplace entry

The `better-toolkits` marketplace SHALL register a bootstrap plugin at `shared/bootstrap` named
`better-toolkits-bootstrap` that MUST be installable before any product toolkit plugin.

#### Scenario: Developer adds marketplace

- **WHEN** a developer runs `claude plugin marketplace add chimeranext/better-toolkits`
- **THEN** the marketplace lists `better-toolkits-bootstrap` as an installable plugin
- **AND** its source path resolves to `./shared/bootstrap`

#### Scenario: Bootstrap installs before product toolkits

- **WHEN** a developer installs only `better-toolkits-bootstrap` (no product toolkit yet)
- **THEN** the slash command `/toolkits-initial-setup` is available in Claude Code and Cursor (via plugin)

### Requirement: HITL setup protocol

The `/toolkits-initial-setup` command SHALL follow detect → audit → propose → ask → install → verify.
No filesystem writes outside the active workspace SHALL occur without explicit human approval.

#### Scenario: Agent proposes hooks merge

- **WHEN** the audit finds missing stderr hooks in `~/.cursor/hooks.json`
- **THEN** the agent shows a proposed diff
- **AND** waits for human OK before merging

#### Scenario: User declines optional auto-update

- **WHEN** the Cursor adapter offers marketplace auto-update on `workspaceOpen`
- **AND** the user does not opt in
- **THEN** no `workspaceOpen` hook is written for marketplace update

### Requirement: OpenCode CLI entry

Headless or OpenCode-only setups SHALL use `@chimeranext/better-toolkits setup` as the documented
entry (replacing `npx @lapc506/make-no-mistakes install`).

#### Scenario: OpenCode without plugin

- **WHEN** a developer has no Claude/Cursor plugin installed
- **THEN** documentation directs them to `npx @chimeranext/better-toolkits setup`
- **AND** the CLI runs the same protocol phases as the slash command

### Requirement: Separation from make-no-mistakes product commands

`/make-no-mistakes:*` commands SHALL remain product-scoped (implement, bug-squash, repo hygiene).
`/toolkits-initial-setup` SHALL NOT be defined under `toolkits/make-no-mistakes-toolkit/`.

#### Scenario: MNM toolkit not installed

- **WHEN** only `better-toolkits-bootstrap` is installed
- **THEN** `/make-no-mistakes:implement` is not available
- **AND** `/toolkits-initial-setup` is available
