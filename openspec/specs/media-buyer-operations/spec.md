# media-buyer-operations Specification

## Purpose

Define the operator behaviour layered on top of the tool contract: how a campaign is created and paced, when a losing creative is killed, how budget is held, and how the effect of a change is measured afterwards.

## ADDED Requirements

### Requirement: Drafts-first creation

A campaign SHALL be created in a non-spending state. Going live SHALL be a separate, explicitly confirmed action.

#### Scenario: Creation spends nothing

- **WHEN** a campaign is created through the toolkit
- **THEN** the entity exists as draft or paused, and no spend occurs until an activation call is explicitly made and confirmed

#### Scenario: Activation is confirmed by a human

- **WHEN** an activation call is submitted
- **THEN** it requires both the apply flag and human confirmation before the network is asked to enable the entity

### Requirement: Budget guardrails evaluated before the call

The toolkit SHALL evaluate configured daily-account and per-campaign spend caps before issuing the network request, and SHALL reject a plan that exceeds them.

#### Scenario: Over-cap budget is rejected locally

- **WHEN** a campaign creation or budget update exceeds the configured cap
- **THEN** the call fails with a guardrail error before any network request is sent

#### Scenario: Cap is configuration, not code

- **WHEN** the operator changes the configured cap
- **THEN** the new cap is enforced without a code change

### Requirement: Kill rules and pacing review

The toolkit SHALL support a pacing review that, given a period and an account, reports per-campaign delivery against budget and flags entities matching configured kill conditions.

#### Scenario: Underdelivering and overspending are both flagged

- **WHEN** a pacing review runs over the last 7 days
- **THEN** campaigns delivering materially below their intended pace and campaigns spending materially above it are both flagged, and the flag names the observed value and the threshold

#### Scenario: Kill is proposed, not performed silently

- **WHEN** a campaign matches a kill condition
- **THEN** the toolkit proposes the pause with the evidence, and performs it only on an explicit, confirmed call

### Requirement: Creative testing at volume

The toolkit SHALL support launching multiple creatives per ad group in one operation, each individually addressable afterwards for performance readout and for pause.

#### Scenario: Batch launch is one operation

- **WHEN** a creative test set is submitted for an ad group
- **THEN** the creatives are created in one call, in a non-spending state, and each is returned with its own normalized ad identifier

#### Scenario: Per-creative judgement

- **WHEN** a test set has been running for a configured period
- **THEN** each creative's performance is readable at ad level, so a loser can be paused without touching the rest of the ad group

### Requirement: Change journal

Every mutating operation the toolkit performs SHALL be appended to a local journal recording entity, field, before value, after value and timestamp, written at the single request chokepoint so it cannot be skipped by an adapter.

#### Scenario: Journal is written automatically

- **WHEN** any campaign, ad group or creative is created or updated through the toolkit
- **THEN** a journal entry exists for it without the caller having done anything extra

#### Scenario: External changes can be recorded

- **WHEN** a change was made outside the toolkit, in the network's own UI
- **THEN** it can be recorded manually with a label so it participates in the same lift readout

### Requirement: Lift readout is directional and says so

The toolkit SHALL compute, per recorded change, the metrics in a window before versus after, and SHALL label the result as a directional comparison rather than a controlled experiment.

#### Scenario: Before and after are reported

- **WHEN** lift is computed for an entity with recorded changes
- **THEN** each change reports before and after metrics with deltas over the configured window

#### Scenario: Confounds are disclosed

- **WHEN** a lift readout is returned
- **THEN** it states that seasonality, the post-edit learning phase and concurrent budget changes confound it, and that recent changes have a shortened, partial after-window

### Requirement: Attribution readout stays at the level the network supports

The toolkit SHALL report performance at the granularity the network actually provides, and SHALL NOT present account-level or segment-level data as if it were person-level.

#### Scenario: Segment-level data is labelled

- **WHEN** an attribution readout is produced for a network that does not expose person-level ad-view data
- **THEN** the output states the level it is reported at and does not imply person-level attribution
