# ads-multi-network-mcp Specification

## Purpose

Define the tool layer an agent calls for paid media. One MCP server fronts every ad network behind a normalized operation set, so a plan written once can be executed against Meta, TikTok, LinkedIn, Google Ads, YouTube or Spotify without the agent learning six vendor vocabularies.

## ADDED Requirements

### Requirement: Single server, normalized operations

The toolkit SHALL expose one stdio MCP server, `ads-multi-network`, whose tools are expressed in normalized vocabulary. No tool name, input field or output field SHALL contain a vendor-specific name.

#### Scenario: Same call sequence across networks

- **WHEN** an agent lists accounts, lists campaigns for an account, and creates a draft campaign, passing `network: "meta"` then `network: "tiktok"` then `network: "linkedin"`
- **THEN** all three calls use the identical tool names and input shapes, and only the `network` value, the account identifier and the network's own capability differences vary

#### Scenario: No vendor names in the schema

- **WHEN** the tool input schemas are inspected
- **THEN** fields are named `account_id`, `campaign_id`, `ad_group_id`, `budget`, `targeting`, `audience_id`, and not `act_id`, `advertiser_id`, `campaign_group_id`, `adset_id`, `daily_budget_micros` or any other vendor field

### Requirement: Capability report

The server SHALL start successfully with zero configured networks and SHALL report, per network, whether it is `available`, `not_configured`, or `error`. The report is the agent's only source of truth about which networks it can act on.

#### Scenario: Server starts with no credentials

- **WHEN** the server starts and no network credentials are present in the environment or config
- **THEN** it starts, exposes the capability report tool, and marks every network `not_configured` without exiting or writing a fatal error

#### Scenario: Partially configured networks

- **WHEN** Meta credentials are present and TikTok credentials are absent
- **THEN** the report marks Meta `available` and TikTok `not_configured`, and a TikTok call returns a `not_configured` error naming the missing credential while Meta calls continue to succeed

### Requirement: Explicit unsupported and not_implemented errors

An operation a network cannot perform SHALL return an error envelope with `code: "unsupported"` and the network and operation named. An operation the network supports but the adapter does not yet implement SHALL return `code: "not_implemented"`. Neither case SHALL return an empty successful result.

#### Scenario: Unsupported operation is loud

- **WHEN** a keyword-search campaign is requested for `network: "spotify"`
- **THEN** the call fails with `code: "unsupported"`, `network: "spotify"`, and the offending operation, and no campaign is created

#### Scenario: Not-yet-implemented operation is distinguishable

- **WHEN** an operation the network's API supports is requested but the adapter has not implemented it
- **THEN** the call fails with `code: "not_implemented"` so the caller can tell "the platform cannot" from "the toolkit has not yet"

### Requirement: Mutation gating

Every tool that mutates network state SHALL require an explicit `apply` flag. Without it the tool SHALL be a no-op that returns the diff of the intended change. No tool input schema SHALL be able to express an enabled or spending entity.

#### Scenario: Dry run by default

- **WHEN** a budget update is submitted without the apply flag
- **THEN** the tool returns the before/after diff of the budget change and no request is sent to the network

#### Scenario: Creation cannot express an active entity

- **WHEN** a campaign creation call is submitted with any input combination
- **THEN** the resulting entity is created as draft or paused, and activation requires a separate call carrying both the apply flag and human confirmation

### Requirement: One schema source for MCP and CLI

The MCP tool schemas and the CLI argument schemas SHALL be derived from one definition, so the two surfaces cannot drift.

#### Scenario: Schema change propagates

- **WHEN** a field is added to the normalized create-campaign operation
- **THEN** both the MCP tool and the CLI accept it without a second edit, and a generated tool manifest reflects the change

### Requirement: Redaction of secrets

No token, secret, developer token or credential value SHALL appear in tool output, error messages, logs or the change journal.

#### Scenario: Authentication failure does not leak

- **WHEN** an authentication call fails because a token is invalid
- **THEN** the error names the credential's source and not its value, and the value does not appear anywhere in the returned envelope or the log
