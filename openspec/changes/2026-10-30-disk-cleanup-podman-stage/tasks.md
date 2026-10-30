# Tasks — Native Podman stage in disk-cleanup

## Implementation

- [ ] P1: Add `require_podman()` mirroring `require_docker()` (absent → SKIP,
       daemon unresponsive → SKIP, error surfaced).
- [ ] P2: Add `stage_podman_measure()` (native `podman system df`, image/volume counts).
- [ ] P3: Add `stage_podman_images()` (`podman image prune -a -f`, measured before/after).
- [ ] P4: Add `stage_podman_volumes()` (`podman volume prune -f`, measured before/after; `--list-only` preview).
- [ ] P5: Register subcommands `podman-images`, `podman-volumes`, `podman` in `parse_args`.
- [ ] P6: Insert Podman stages into the `all` sequence (after each Docker stage), honoring `--target`.
- [ ] P7: Add Podman inventory to `stage_measure` output when present.

## Verification

- [ ] `disk-cleanup.sh podman-images --list-only` runs and reports inventory (no removal).
- [ ] `disk-cleanup.sh podman-volumes --list-only` prints would-be pruned volumes.
- [ ] `disk-cleanup.sh measure` includes `Podman root/images/volumes` lines.
- [ ] `disk-cleanup.sh all` includes Podman stages when both runtimes present, stops at `--target`.
- [ ] Stderr of `podman` is captured into the shared log (never discarded, never folded silently).
- [ ] `openspec validate 2026-10-30-disk-cleanup-podman-stage` is valid.
