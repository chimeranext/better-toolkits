# disk-cleanup native Podman — Delta spec

Change: `2026-10-30-disk-cleanup-podman-stage`

## ADDED Requirements

### Requirement: Native podman image stage

`disk-cleanup.sh` SHALL provide a subcommand that prunes Podman images by
invoking `podman` directly, independent of any `docker` CLI.

#### Scenario: podman-images prunes unreferenced images

- **WHEN** an operator runs `disk-cleanup.sh podman-images`
- **THEN** the tool MUST invoke `podman image prune -a -f`
- **AND** MUST report reclaimed space measured as free-bytes delta on the storage filesystem (before vs after), not a tool-forecast
- **AND** MUST NOT require a `docker` CLI

#### Scenario: podman absent

- **WHEN** `podman` is not installed and an operator runs `disk-cleanup.sh podman-images`
- **THEN** the stage MUST log `SKIP: podman is not installed — nothing to do for this stage.`
- **AND** MUST NOT report `already clean`

#### Scenario: daemon unresponsive

- **WHEN** `podman` is installed but the daemon does not answer
- **THEN** the stage MUST log `SKIP: podman is installed but the daemon did not answer (see the error above).`
- **AND** MUST surface the underlying error (never silence stderr)

### Requirement: Native podman volume stage

`disk-cleanup.sh` SHALL provide a subcommand that prunes Podman volumes by
invoking `podman` directly.

#### Scenario: podman-volumes prunes reconstructible volumes

- **WHEN** an operator runs `disk-cleanup.sh podman-volumes`
- **THEN** the tool MUST invoke `podman volume prune -f`
- **AND** MUST report reclaimed space measured as free-bytes delta on the storage filesystem (before vs after)

#### Scenario: podman-volumes list-only

- **WHEN** an operator runs `disk-cleanup.sh podman-volumes --list-only`
- **THEN** the tool MUST NOT remove anything
- **AND** MUST print the volumes that would be pruned

### Requirement: Native podman measure

When `podman` is present, `measure` SHALL report Podman storage inventory.

#### Scenario: measure includes podman inventory

- **WHEN** an operator runs `disk-cleanup.sh measure` and `podman` is installed and reachable
- **THEN** the output MUST include Podman storage root, image count, and volume count (native `podman` queries)
- **AND** MUST NOT rely on a `docker` CLI

### Requirement: all sequence includes podman stages

The `all` subcommand SHALL run the Podman stages after the corresponding Docker stages.

#### Scenario: all runs podman images and volumes

- **WHEN** an operator runs `disk-cleanup.sh all` and both `docker` and `podman` are present
- **THEN** the sequence MUST include `stage_podman_images` and `stage_podman_volumes` after the Docker stages
- **AND** MUST stop early when `--target` GB is free

### Requirement: stderr never silenced

The Podman stages SHALL preserve stderr; a failed stage must not look like a clean one.

#### Scenario: stage failure is distinguishable from clean

- **WHEN** a Podman stage fails (non-zero exit from `podman`)
- **THEN** the failure MUST be surfaced (exit status preserved, stderr captured into the shared log)
- **AND** MUST NOT be reported as `already clean`
