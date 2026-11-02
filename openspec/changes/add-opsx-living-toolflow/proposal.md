# Proposal — add-opsx-living-toolflow

Change ID: `add-opsx-living-toolflow`

## Why

The opsx-living flow (`commands/opsx-living.md`) referenced engines that did not
exist in this repo (`opsx-living-update.py`, `opsx_living_standards.py`); plus
the opsx work session lacked a read-only bundle-level pending-work sweep.

## What Changes

- Port (startup-agnostic, debranded): `scripts/opsx-living-update.py`,
  `scripts/opsx_living_standards.py`.
- New read-only sweep: `scripts/ci/sweep-pending-opsx.sh` + thin entry
  (`toolkits/make-no-mistakes-toolkit/commands/sweep-pending-opsx.md`,
  `skills/sweep-pending-opsx/SKILL.md`,
  `references/sweep-pending-opsx/protocol.md`).
- Pipeline position: `/sweep-unstaged` >> `/sweep-pending-opsx` >> `/opsx-apply`
  >> `/opsx-sync` >> `/opsx-living` >> `/pending-left`.

## Impact

- New command + skill (requires semver bump of make-no-mistakes-toolkit in root
  marketplace.json + plugin.json per pre-push gate).
