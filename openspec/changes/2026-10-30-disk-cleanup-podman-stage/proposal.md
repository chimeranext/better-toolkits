# Proposal — Native Podman stage in disk-cleanup

## Problem

The `disk-cleanup.sh` tool only reclaims container storage through the `docker`
CLI (`docker_root()` → `docker info --format '{{.DockerRootDir}}'`, stages 1 and
4). On hosts that use **Podman rootless** (storage at
`~/.local/share/containers/storage`), this only works if a `docker` CLI is
installed **and** `DOCKER_HOST` points at the Podman socket.

In practice this leaks:
- If `docker` is absent, `require_docker` → `SKIP`, and Podman storage is never
  touched.
- Even when `docker` is routed to Podman, `docker image prune -a` under-reports:
  on the machine that prompted this change it reported `0B reclaimed` while
  `podman system df` showed ~950 MB reclaimable; only native
  `podman rmi $(podman images --filter dangling=true -q)` recovered the ~470 MB
  of genuinely dangling images.
- There is no explicit Podman inventory in `measure`.

The tool claims to reclaim container storage but has no first-class Podman path.

## Proposed change

Add **native Podman stages** to `disk-cleanup.sh` that invoke `podman` directly
(never relying on a `docker` CLI):

1. `stage_podman_measure` — report Podman storage root, free bytes, image and
   volume counts (native `podman system df`).
2. `stage_podman_images` — `podman image prune -a -f` (images not referenced by a
   container), measured before/after.
3. `stage_podman_volumes` — `podman volume prune -f` (reconstructible), measured
   before/after.
4. New subcommands: `podman-images`, `podman-volumes`, and `podman` (both). The
   `all` sequence gains these stages after the Docker stages.
5. `require_podman()` mirrors `require_docker()`: absent Podman → `SKIP` (never
   "already clean"), daemon unresponsive → `SKIP` with the error surfaced (never
   silenced).

## Out of scope

- Removing the existing Docker stages (they remain for Docker hosts).
- Pruning podman machines/containers beyond images+volumes.
- Auto-detecting which runtime to prefer; both run, each only when present.

## Constraints

- No stream discarded: stderr from `podman` is funneled into the single shared
  log (stdout plus stderr into one file), never nulled; a failed stage must not
  look like a clean one.
- `podman` may be absent → stage reports `SKIP`, not `already clean`.
- Risk ordering preserved: images (regenerable) before volumes (reconstructible),
  before build-artifacts.
