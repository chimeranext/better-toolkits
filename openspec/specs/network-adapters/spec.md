# network-adapters Specification

## Purpose

Define what each per-network adapter owns, so that the differences between Meta, TikTok, LinkedIn, Google Ads, YouTube and Spotify stop at the adapter boundary and never reach the tool contract.

## ADDED Requirements

### Requirement: One adapter per network with a declared hierarchy mapping

Each network SHALL be implemented by exactly one adapter that declares, in a machine-readable map, how its native entities correspond to the normalized model `Account → Campaign → AdGroup → Ad/Creative`. The mapping SHALL be applied on reads and on writes.

#### Scenario: LinkedIn's shifted hierarchy is absorbed

- **WHEN** the normalized campaign list is requested for `network: "linkedin"`
- **THEN** the adapter returns LinkedIn **campaign groups** as normalized campaigns and LinkedIn **campaigns** as normalized ad groups, so the caller sees the same three-level shape as every other network

#### Scenario: Round trip preserves the native entity

- **WHEN** an entity is read from LinkedIn, normalized, and written back unchanged
- **THEN** the write targets the same native entity, and no entity is created or modified at the neighbouring level

#### Scenario: Google Ads extra level is preserved, not dropped

- **WHEN** a Google Ads ad group carrying keywords is normalized
- **THEN** the keywords remain reachable through the ad group's `targeting` object rather than being discarded

### Requirement: YouTube resolves to the Google adapter

The `youtube` network SHALL be served by the Google Ads adapter with the campaign channel pinned to Video, sharing Google's credentials and hierarchy. It SHALL be separately addressable in the contract and separately sliceable in reporting.

#### Scenario: YouTube uses Google credentials

- **WHEN** a campaign is listed for `network: "youtube"` and Google Ads credentials are configured
- **THEN** the call succeeds through the Google Ads adapter without a second credential set

#### Scenario: YouTube reporting is separable

- **WHEN** insights are requested for the full Google account
- **THEN** rows carry a channel value that distinguishes Video campaigns from Search, Display and Performance Max

### Requirement: Credential resolution order

Every adapter SHALL resolve credentials in the fixed order: environment variable, then toolkit config file with mode `0600`, then per-call argument. The toolkit SHALL NOT transmit credentials to any host other than the ad network's own API endpoint.

#### Scenario: Environment variable wins

- **WHEN** both an environment variable and a config file entry are present
- **THEN** the environment variable is used

#### Scenario: No third-party credential relay

- **WHEN** any adapter performs a credentialed request
- **THEN** the destination host belongs to that network's official API domain, and no credential is sent to a toolkit-operated or third-party service

### Requirement: Money unit normalization at the adapter boundary

Every monetary value SHALL cross the adapter boundary as an amount plus an ISO-4217 currency, converted from the network's native unit (micros, minor units or decimal). An amount whose unit cannot be determined SHALL be rejected rather than assumed.

#### Scenario: Micros are converted

- **WHEN** a Spotify budget expressed in micros is read
- **THEN** it is returned as a decimal amount with the account currency, and the original micros value is not exposed as the amount

#### Scenario: Currency is never assumed

- **WHEN** an account's currency cannot be determined from the account record
- **THEN** the operation fails with an explicit error rather than defaulting to USD

#### Scenario: No implicit conversion

- **WHEN** two accounts report different currencies
- **THEN** their amounts remain in their own currencies on their own rows, and no cross-currency conversion is performed by the toolkit

### Requirement: Pagination, throttling and retry

Adapters SHALL paginate through page tokens, SHALL enforce a per-account request budget declared for that network, and SHALL retry only transport failures, HTTP 429 and 5xx responses, with exponential backoff and jitter. A 4xx response other than 429 SHALL NOT be retried.

#### Scenario: Collection is complete or explicit

- **WHEN** a campaign list spans more pages than one request returns
- **THEN** the adapter either returns the complete collection within the requested limit or surfaces the continuation handle, and never silently truncates without a handle

#### Scenario: Retry does not create duplicates

- **WHEN** a create call is retried after a transport failure
- **THEN** a client-generated idempotency key prevents a second campaign from being created

### Requirement: Isolated adapter failure

An adapter that is not configured, rate-limited or failing SHALL NOT prevent the remaining adapters from serving requests.

#### Scenario: One network down does not break the others

- **WHEN** the TikTok adapter is unreachable and a Meta insights request is made
- **THEN** the Meta request succeeds and the TikTok capability state reports the failure

### Requirement: Bridge mode parity

Where an adapter offers an opt-in bridge that shells out to an existing third-party ads CLI, the bridge SHALL produce output satisfying the same contract as the native mode, and SHALL report a field it cannot supply rather than substituting a default.

#### Scenario: Bridge gap is reported

- **WHEN** a bridge-backed call cannot obtain a field the contract requires
- **THEN** the response marks that field unavailable instead of filling it with `0`, `""` or `false`

#### Scenario: Native is the default

- **WHEN** no bridge is explicitly selected in configuration
- **THEN** the adapter calls the network's official API directly
