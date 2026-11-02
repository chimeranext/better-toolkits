# Proposal — add-archive-spec-drift

Change ID: `add-archive-spec-drift`

## Why

Issue #180: los changes ya merged `2026-10-30-disk-cleanup-podman-stage`
(PR #170) y `posthog-chimeranext-mcp` (PR #172) no archivaron su delta spec
en el store principal; `sweep-unstaged` reporta DRIFT repo-wide.

## What Changes

- Copiar los deltas ya merged a `openspec/specs/` (requerimiento ARCHIVED en
  cada capability): `disk-cleanup-podman` y `shared-mcp/posthog-chimeranext`.
- Sin skill, sin código: solo el store de specs (rol de opsx-archive).

## Capabilities

### New Capabilities
- (ninguna — archival de 2 ya merged)

### Modified Capabilities
- `disk-cleanup-podman` (ADD requirements desde delta #170)
- `shared-mcp/posthog-chimeranext` (ADD requirements desde delta #172)

## Impact
- Solo `openspec/specs/**`; el sweep debe perder los 2 & "missing" tras merge.
