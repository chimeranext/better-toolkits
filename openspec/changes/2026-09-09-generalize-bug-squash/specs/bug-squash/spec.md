# Bug-squash capability — Delta spec

Change: `2026-09-09-generalize-bug-squash`

## ADDED Requirements

### Requirement: Single environment per round

The bug-squash protocol SHALL bind each round to exactly one deployment environment for its entire lifecycle from open to close.

#### Scenario: Round opens on staging and closes on staging

- **WHEN** an operator opens a bug-squash round with environment `staging`
- **THEN** the round artifact MUST record `environment: staging` and `baseUrl` from config
- **AND** all Chrome DevTools MCP navigation, N2 captures, and write-arming policy MUST use that same origin until the round is closed
- **AND** the round MUST NOT record a change to `environment` or `baseUrl` in the same `round.md` file

#### Scenario: Multi-environment coverage uses multiple rounds

- **WHEN** QA must cover localhost and staging
- **THEN** the operator MUST run two separate rounds (e.g. `round-001` @ localhost, `round-002` @ staging)
- **AND** each round MUST have its own `round.md` with a single `environment` value

#### Scenario: Mid-round environment switch is forbidden

- **WHEN** an agent attempts to continue an open round on a different `baseUrl` than recorded in `round.md`
- **THEN** the command MUST refuse and instruct the operator to close the current round or open a new round for the other environment

### Requirement: Environment selection before browser and writes

The bug-squash command SHALL resolve and persist the target environment before Chrome DevTools MCP sessions or write-arming.

#### Scenario: Environment fixed before Chrome MCP

- **WHEN** `/make-no-mistakes:bug-squash` (or startup overlay) starts execution
- **THEN** it MUST load or bootstrap `bug-squash.config.json`
- **AND** MUST select or resume a single `environment` before any headed Chrome DevTools MCP tool call
- **AND** MUST write the `round.md` header with `Environment` and `Base URL` before N1/N2/N3 work

#### Scenario: Write guard aligns with round environment

- **WHEN** a round targets an environment where `writesAllowed` is false
- **THEN** mutating browser actions MUST require human `.write-armed` per existing prod guard and overlay policy
- **AND** `$MNM_QA_ORIGIN` (or equivalent) MUST match the round's `Base URL`

### Requirement: Config bootstrap on first run

Missing project config SHALL trigger setup, not opaque failure.

#### Scenario: Missing bug-squash.config.json

- **WHEN** `bug-squash.config.json` does not exist in the repo root
- **THEN** the command MUST run the bootstrap protocol (`references/bug-squash/setup-init.md`)
- **AND** MUST create `bug-squash.config.json` from the example template with operator-confirmed URLs
- **AND** MUST NOT invent hops or enable `prod` by default

#### Scenario: Prod opt-in only

- **WHEN** bootstrap completes with default template
- **THEN** `environments.prod.enabled` MUST be `false`
- **AND** prod rounds MUST remain unavailable until a human sets `enabled: true` in config

### Requirement: Waivers skip rounds not environments inside a round

Waivers document omitted work; they SHALL NOT authorize changing environment mid-round.

#### Scenario: Waiver for skipped staging round

- **WHEN** staging bug-squash is waived for a release
- **THEN** the waiver register MUST cite a waiver ID, expiry, and approver
- **AND** no open `round.md` may claim partial staging evidence from another environment's round

#### Scenario: No hop waiver inside active round

- **WHEN** a round is open with `environment: localhost`
- **THEN** a waiver ID MUST NOT be used to justify navigating to devel or staging in the same round file

### Requirement: round.md header schema v2

Round artifacts SHALL use the v2 header defined in `design.md` and SHALL NOT use hop-chain progression fields.

#### Scenario: Valid v2 header

- **WHEN** a round is created under this change
- **THEN** `round.md` MUST include `Environment`, `Base URL`, `Round ID`, `Ref`, `Operator`, `Status`, and `HITL coverage`
- **AND** MUST NOT include `Hops:` or `Current hop:` fields

#### Scenario: Close gate unchanged

- **WHEN** an agent closes a round
- **THEN** the five closing sections (Traceability, Currency, Gap analysis, Accountability, Not executed and why) MUST be non-placeholder
- **AND** `--close` MUST refuse empty "Not executed" sections
