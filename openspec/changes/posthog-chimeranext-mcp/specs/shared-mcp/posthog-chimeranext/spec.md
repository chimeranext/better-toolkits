# Spec Delta

## Purpose

Provides a local, stateless ViteMCP server that lets agents query a
self-hosted PostHog instance (insights/funnel/retention) without sending
product data to the PostHog cloud.

## ADDED Requirements

### Requirement: Local stateless server registration
The system SHALL register `posthog-chimeranext` as a **local** MCP server in
`opencode.json` (type `local`) that runs `server.js` via `node`, so agents can
reach the self-hosted PostHog instance.

#### Scenario: Local registration replaces cloud entry
- **WHEN** `opencode.json` is read by OpenCode
- **THEN** the server list SHALL contain `posthog-chimeranext` as a local server
- **AND** the remote `posthog` SaaS entry (`mcp.posthog.com`) SHALL be absent

### Requirement: Stateless self-hosted authentication
The server SHALL authenticate to the self-hosted PostHog instance using a
per-call `POSTHOG_PERSONAL_API_KEY` and `POSTHOG_HOST` read from the
environment — never from an embedded key in `opencode.json` or server code.

#### Scenario: Secret-free config
- **WHEN** the server performs a PostHog API call
- **THEN** it SHALL read `POSTHOG_HOST` and `POSTHOG_PERSONAL_API_KEY` from env at call time
- **AND** no API key or secret SHALL appear in `opencode.json` or committed source

#### Scenario: Missing env yields clear error
- **WHEN** `POSTHOG_PERSONAL_API_KEY` or `POSTHOG_HOST` is unset
- **THEN** the server SHALL return a clear `UserError` naming the missing variable
- **AND** SHALL NOT crash or fall back to a hardcoded key

### Requirement: Self-hosted query tools
The server SHALL expose MCP tools that query the self-hosted PostHog instance
(e.g. insights, funnel, retention) over the configured `POSTHOG_HOST`, and
SHALL NOT route to `mcp.posthog.com`.

#### Scenario: Query hits self-hosted endpoint
- **WHEN** a tool is called
- **THEN** the request SHALL be sent to `POSTHOG_HOST` (expected `http://localhost:8000`)
- **AND** SHALL NOT use the PostHog cloud MCP endpoint

#### Scenario: Tool result returned to agent
- **WHEN** the self-hosted PostHog API responds
- **THEN** the server SHALL return the structured result to the agent as tool content

### Requirement: No auto-merge / integration decision
The change SHALL NOT auto-merge; after verification, integration is a human
decision.

#### Scenario: Human controls merge
- **WHEN** all implementation and verification tasks complete
- **THEN** the decision to merge/push SHALL be presented to a human
- **AND** SHALL NOT be merged automatically
