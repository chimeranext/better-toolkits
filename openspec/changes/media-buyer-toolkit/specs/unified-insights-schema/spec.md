# unified-insights-schema Specification

## Purpose

One reporting row shape for all six networks, covering both synchronous queries and the asynchronous submit/poll/fetch lifecycle, with the difference between "zero" and "not reported" preserved.

## ADDED Requirements

### Requirement: Canonical insight row

Every insights response SHALL return rows conforming to one schema containing at minimum: `network`, `account_id`, `entity_level`, `entity_id`, `date`, `currency`, the metric set, and a metric-availability map.

#### Scenario: Six networks, one shape

- **WHEN** 30 days of campaign-level insights are requested from Meta, TikTok, LinkedIn, Google Ads, YouTube and Spotify
- **THEN** every row carries the same field names for the same concept, differing only in the values, and no row carries a vendor-specific metric name such as `spend_micros` or `total_spend`

#### Scenario: Entity level is explicit

- **WHEN** insights are returned
- **THEN** each row declares its `entity_level` (`account`, `campaign`, `ad_group` or `ad`), so rows at different levels are never mixed in one aggregate

#### Scenario: Amounts carry currency

- **WHEN** a row contains spend or any monetary metric
- **THEN** the value is a decimal amount paired with the account's currency, already normalized out of micros or minor units

### Requirement: Null and zero are distinct

A metric a network does not report for a given row SHALL be `null` and SHALL be flagged unavailable. It SHALL NOT be coerced to `0`.

#### Scenario: Unreported metric stays null

- **WHEN** a network does not report conversions for a row
- **THEN** the conversions metric is `null` with an availability flag naming it, and downstream cost-per-conversion arithmetic treats the row as uncomputable rather than dividing by zero

#### Scenario: A genuine zero is preserved

- **WHEN** a network reports zero conversions for a row
- **THEN** the metric is `0` and is marked available, distinguishable from the unreported case

### Requirement: Async report lifecycle

For networks whose reporting is asynchronous, the toolkit SHALL model the lifecycle as submit, poll and fetch, returning the task handle to the caller at submit time.

#### Scenario: Submit returns a handle

- **WHEN** an async report is submitted
- **THEN** the call returns a task handle and the report is not blocked on, so an agent turn is not held open for the duration

#### Scenario: Poll reports progress

- **WHEN** the task handle is polled before the report is ready
- **THEN** the response reports a pending state and no partial rows are presented as complete

#### Scenario: Fetch returns canonical rows

- **WHEN** the completed report is fetched
- **THEN** the rows conform to the same canonical schema as a synchronous query, including the availability map

### Requirement: Deterministic aggregation

Aggregation SHALL be performed by the toolkit over canonical rows only, after normalization. Aggregating raw network responses before normalization SHALL NOT occur.

#### Scenario: Aggregate is reproducible

- **WHEN** the same date range and entity level are requested twice for the same account
- **THEN** the aggregate is identical, because it is computed from the same normalized rows rather than from network-side rollups with different attribution or timezone conventions

#### Scenario: Date semantics are declared

- **WHEN** a row's date is returned
- **THEN** the timezone and attribution convention used by the network are declared on the row or on the response envelope, so rows from different networks are not silently compared as if they used the same day boundary
