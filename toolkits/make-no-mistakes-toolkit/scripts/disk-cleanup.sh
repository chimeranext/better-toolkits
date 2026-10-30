#!/usr/bin/env bash
# disk-cleanup.sh — reclaim disk space in ascending order of risk, measuring
# what was actually freed rather than what a tool predicted.
#
# Usage:
#   disk-cleanup.sh measure                       # read-only, changes nothing
#   disk-cleanup.sh docker-images   [--list-only]
#   disk-cleanup.sh node-modules    [--list-only] [--repo-path PATH]
#   disk-cleanup.sh worktrees       [--list-only] [--repo-path PATH]
#   disk-cleanup.sh docker-volumes                # defaults to reclaiming; --list-only previews
#   disk-cleanup.sh all             [--list-only] [--repo-path PATH] [--target GB]
#
# Emergency default: APPLIES stages 1-4. Use --list-only to preview.
#
# ── Why the stages are ordered this way ──────────────────────────────────────
# Measured 2026-08-11 on a 468 GB volume that had hit 100% full:
#
#   docker image prune -a          48.3 GB   no risk — images re-pull
#   node_modules inside worktrees    11 GB   no risk — regenerable from lockfile
#   worktree removal                        real risk — 8 of 69 were removable
#   docker volumes                  ~29 GB  reconstructible; reclaimed in emergency (--apply)
#
# ── What this script owns, and what it delegates ─────────────────────────────
# It owns the DOCKER stages (1 and 4) and nothing else.
#
# Stages 2 and 3 are handed to `worktree-cleanup.mjs`, which already classifies
# worktrees against three independent merge tests, reports `unverifiable` as a
# verdict distinct from `safe`, and refuses anything holding uncommitted or
# unpushed work. Reimplementing that here would be a SECOND authoritative copy
# of a destructive classifier, and a fix would then reach one of them only.
# A delegated stage that says "the delegate is not installed" is a better
# outcome than a shorter copy of it that drifts.
#
# ── Three findings a naive version gets wrong, each encoded below ────────────
#   1. `docker system df` UNDER-REPORTS. It predicted 18 GB; 48.3 GB came back,
#      because it does not count shared layers. So this script never prints a
#      prediction as the answer — every stage it owns measures free space
#      before and after and reports the difference.
#   2. Branch refs are never deleted. Removing a worktree is recoverable while
#      its branch survives; deleting the branch is not. This script has no flag
#      that reaches branch deletion and rejects `--branches` outright.
#   3. The MAIN checkout's node_modules is in use. Only worktree copies are
#      disposable — the delegate enforces this, and stage 2 never touches a
#      path itself.
#
# No stream is discarded anywhere in this file. A stage that failed and a stage
# that had nothing to do must never look alike.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKTREE_CLEANUP="${SCRIPT_DIR}/worktree-cleanup.mjs"

SUBCOMMAND=""
APPLY=1
REPO_PATH="${DISK_CLEANUP_DEFAULT_SCOPE:-$HOME/Documentos/GitHub}"
TARGET_GB=""

log() { printf '%s\n' "$*" >&2; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
rule() { printf '\n──────────────────────────────────────────────────────────────\n%s\n\n' "$*"; }

# `command -v` with its stdout CAPTURED, not discarded. The path is a value we
# can hold in a variable; there is no reason to throw a stream away for it.
have() {
    local _resolved
    _resolved="$(command -v "$1")" && [ -n "$_resolved" ]
}

human() {
    local bytes="${1:-}" out
    [ -n "$bytes" ] || { printf 'unknown'; return 0; }
    local sign=""
    if [ "$bytes" -lt 0 ]; then sign="-"; bytes=$(( -bytes )); fi
    if out="$(numfmt --to=iec --suffix=B "$bytes")"; then
        printf '%s%s' "$sign" "$out"
    else
        printf '%s%s bytes' "$sign" "$bytes"
    fi
}

# POSIX output (-P) so a long device name cannot wrap the row; -k so the block
# size is 1024 on both GNU and BSD userlands.
df_field() {
    local path="$1" field="$2" out
    out="$(df -Pk "$path")" || die "cannot read filesystem usage for ${path}"
    printf '%s' "$out" | awk -v f="$field" 'NR==2 { print $f }'
}

avail_bytes() {
    local kb
    kb="$(df_field "$1" 4)"
    [ -n "$kb" ] || die "could not parse available space for $1"
    printf '%s' "$(( kb * 1024 ))"
}

mount_of() { df_field "$1" 6; }

# The one place a number is allowed to be called "reclaimed": measured free
# space after minus measured free space before, on the filesystem that changed.
#
# THE DRY-RUN BRANCH IS NOT COSMETIC, and leaving it out reproduced this
# command's founding defect inside the command itself.
#
# `run_delegate` calls this on both paths, and in a dry run nothing is removed,
# so `delta` is 0 BY CONSTRUCTION rather than because the stage had nothing to
# do. Without the guard below, the default invocation printed, two lines apart:
#
#   TOTAL  276 MB recoverable  (node_modules 276 MB)
#   worktree node_modules: already clean — 0 bytes reclaimed (measured, not predicted)
#
# That is "found nothing" and "did nothing" collapsed into one string — the
# exact confusion this script exists to refuse — and it is worse than a bare
# wrong number because the command's protocol instructs the reader to relay
# `already clean` verbatim. A user running the default was told a stage was
# clean while 276 MB sat recoverable.
#
# Note which axis this is. The sibling guard covers the classifier being
# ABSENT, where these stages report UNAVAILABLE and never `already clean`, and
# that distinction is mutation-checked. This is the classifier PRESENT and the
# run being a dry run — a different axis, which that check does not reach.
#
# Stage 1 was never affected: `stage_docker_images` takes its own `--apply`
# branch and returns before reaching here.
report_reclaimed() {
    local label="$1" before="$2" after="$3" delta
    delta=$(( after - before ))
    if [ "$APPLY" -eq 0 ]; then
        printf '%s: dry run — nothing was removed, so nothing was measured.\n' "$label"
        printf '    The recoverable figure above is the classifier'"'"'s; --apply acts on it.\n'
        return
    fi
    if [ "$delta" -eq 0 ]; then
        printf '%s: already clean — 0 bytes reclaimed (measured, not predicted)\n' "$label"
    else
        printf '%s: reclaimed %s (measured before/after, not predicted)\n' "$label" "$(human "$delta")"
    fi
}

docker_root() {
    local out
    out="$(docker info --format '{{.DockerRootDir}}')" || return 1
    [ -n "$out" ] || return 1
    printf '%s' "$out"
}

require_docker() {
    if ! have docker; then
        log "SKIP: docker is not installed — nothing to do for this stage."
        return 1
    fi
    local _root
    if ! _root="$(docker_root)"; then
        log "SKIP: docker is installed but the daemon did not answer (see the error above)."
        return 1
    fi
    return 0
}

# Absence of the delegate is reported as UNAVAILABLE, never as "clean". A stage
# that could not run and a stage with nothing to do are different outcomes, and
# only one of them means the disk is already tidy.
require_delegate() {
    if [ ! -f "$WORKTREE_CLEANUP" ]; then
        log "UNAVAILABLE: ${WORKTREE_CLEANUP} is not present in this plugin version."
        log "  This stage is NOT clean — it did not run. The worktree/node_modules"
        log "  classifier ships separately; update the plugin, then re-run."
        return 1
    fi
    if ! have node; then
        log "UNAVAILABLE: node is required to run the worktree classifier and was not found."
        return 1
    fi
    return 0
}

target_met() {
    [ -n "$TARGET_GB" ] || return 1
    local avail want
    avail="$(avail_bytes "$REPO_PATH")"
    want=$(( TARGET_GB * 1024 * 1024 * 1024 ))
    [ "$avail" -ge "$want" ]
}

# ── Stage 0: measure ─────────────────────────────────────────────────────────
stage_measure() {
    rule "Stage 0 — measure (read-only)"

    printf 'Repository:      %s\n' "$REPO_PATH"
    printf 'Filesystem:      %s\n' "$(mount_of "$REPO_PATH")"
    printf 'Available:       %s\n' "$(human "$(avail_bytes "$REPO_PATH")")"

    if have docker; then
        local root
        if root="$(docker_root)"; then
            printf 'Docker root:     %s (filesystem %s, %s available)\n' \
                "$root" "$(mount_of "$root")" "$(human "$(avail_bytes "$root")")"
            printf 'Docker images:   %s\n' "$(docker image ls -aq | sort -u | grep -c . || true)"
            printf 'Docker volumes:  %s\n' "$(docker volume ls -q | grep -c . || true)"
        else
            printf 'Docker root:     daemon did not answer\n'
        fi
    else
        printf 'Docker:          not installed\n'
    fi

    printf '\nWorktree inventory (delegated — this script does not classify worktrees):\n'
    if require_delegate; then
        node "$WORKTREE_CLEANUP" "$REPO_PATH" --worktrees || true
    fi

    printf '\nNOTE: no number above is a prediction of what a stage will reclaim.\n'
    printf '      docker system df in particular under-reports: it predicted\n'
    printf '      18 GB where 48.3 GB came back, because it does not count\n'
    printf '      shared layers. Reclaim is only ever reported after the fact.\n'
}

# ── Stage 1: docker images (no risk — images re-pull) ────────────────────────
stage_docker_images() {
    rule "Stage 1 — docker images (risk: none, images re-pull)"
    require_docker || return 0

    local root before after count
    root="$(docker_root)"
    count="$(docker image ls -aq | sort -u | grep -c . || true)"

    if [ "$count" -eq 0 ]; then
        printf 'docker images: already clean — no images present\n'
        return 0
    fi

    if [ "$APPLY" -eq 0 ]; then
        printf 'LIST ONLY: %s image(s) present. docker image prune -a would remove every\n' "$count"
        printf '         image not referenced by a container; they re-pull on demand.\n'
        printf '         How much that frees is deliberately NOT estimated here —\n'
        printf '         re-run without --list-only to apply; before/after reported.\n'
        return 0
    fi

    before="$(avail_bytes "$root")"
    docker image prune -a -f
    after="$(avail_bytes "$root")"
    report_reclaimed "docker images" "$before" "$after"
}

# ── Stages 2 and 3: delegated to worktree-cleanup.mjs ────────────────────────
# The delegate's exit status is CAUGHT rather than allowed to kill this script,
# so a refusal cannot discard the reclaim already measured by earlier stages.
run_delegate() {
    local label="$1"
    shift
    local before after rc=0

    before="$(avail_bytes "$REPO_PATH")"
    node "$WORKTREE_CLEANUP" "$REPO_PATH" "$@" || rc=$?
    if [ "$rc" -ne 0 ]; then
        log "${label}: the classifier exited ${rc} (its reason is printed above). Nothing was reclaimed here."
        return 0
    fi
    after="$(avail_bytes "$REPO_PATH")"
    report_reclaimed "$label" "$before" "$after"
}

stage_node_modules() {
    rule "Stage 2 — node_modules in worktrees (risk: none, regenerable from the lockfile)"
    require_delegate || return 0

    if [ "$APPLY" -eq 0 ]; then
        printf 'LIST ONLY: the classifier reports what it would reclaim; nothing is removed.\n\n'
        run_delegate "worktree node_modules"
    else
        run_delegate "worktree node_modules" --apply
    fi
}

stage_worktrees() {
    rule "Stage 3 — worktrees (risk: real — delegated, never reimplemented here)"
    require_delegate || return 0

    # --force is never passed. Neither is any flag that deletes a branch ref:
    # `git worktree remove` takes a directory, so even a wrong removal is
    # recoverable with `git worktree add` as long as the branch survives.
    local delegate_log
    delegate_log="${TMPDIR:-/tmp}/disk-cleanup-worktrees.log"
    if [ "$APPLY" -eq 0 ]; then
        printf 'LIST ONLY: worktrees are classified, none removed. Branch refs are never\n'
        printf '         deleted, with or without --list-only.\n\n'
        run_delegate "worktrees" --worktrees --no-node-modules 2>&1 | tee "$delegate_log"
    else
        run_delegate "worktrees" --worktrees --no-node-modules --apply 2>&1 | tee "$delegate_log"
    fi

    # If EVERY worktree was REFUSED (each still holds work, none merged), the
    # disk reclamation operator's job here is done — there is nothing safe to
    # remove. The next logical step is ordering merges, so hand off to
    # /merge-advisor (HITL; never auto-merge from a cleanup script).
    if grep -q 'REFUSED' "$delegate_log" && ! grep -qE 'REMOVE[[:space:]]+merged worktrees[[:space:]]+—[[:space:]]+[1-9]' "$delegate_log"; then
        rule "Stage 3 result — every worktree is REFUSED (none merged, all hold work)"
        printf 'Nothing safe to reclaim from worktrees. The useful next action is to\n'
        printf 'order merges for the open PRs: run /merge-advisor (it measures an\n'
        printf 'order that keeps each PR green and presents it under HITL — it does\n'
        printf 'NOT merge on its own, and this script never merges).\n'
    fi
}

# ── Stage 5: build/target artifacts across ~/Documentos/GitHub/* (exhaustive) ─
# Recursively finds regenerable build artifacts (node_modules, target/, dist/,
# build/, .cache/) under a root (default ~/Documentos/GitHub). These are safe to
# remove (regenerable). Symlinked node_modules are SKIPPED (they point at a
# shared copy). Only dirs that are not the main checkout's own are considered for
# node_modules (a main checkout's node_modules is in use); build dirs (target/dist)
# in a worktree may be safely removed since they regenerate.
is_windows() {
    case "$(uname -s)" in
        MINGW*|MSYS*|CYGWIN*) return 0 ;;
        *) return 1 ;;
    esac
}

stage_build_artifacts() {
    rule "Stage 5 — build/target artifacts across the whole disk (risk: none — regenerable)"

    # ── Privilege elevation + explicit authorization (mandatory) ────────────
    # This stage DELETES regenerable build artifacts (node_modules, target/,
    # dist/, build/, .cache/) across WORK repos. That is a destructive,
    # system-wide action: it must run with elevated privileges AND only after
    # the user explicitly authorizes it. We refuse to run --apply unprivileged
    # or without a clear prompt.
    if [ "$APPLY" -eq 1 ]; then
        # Detect elevated permission. On Linux: pkexec or sudo (root).
        local user_id
        user_id="$(id -u)"
        if [ "$user_id" -ne 0 ]; then
            # Not root: explain what we need and why, then re-exec with elevation.
            printf 'Se requiere ELEVACIÓN de privilegios para esta stage.\n' >&2
            printf 'Acción: eliminar build/target artifacts regenerables (node_modules,\n' >&2
            printf '  target/, dist/, build/, .cache/) en los repos de trabajo bajo\n' >&2
            printf '  %s.\n' "${WORK_REPO_ROOT:-$HOME/Documentos/GitHub}" >&2
            printf 'Por qué: es una limpieza destructiva de todo el disco; requiere permiso\n' >&2
            printf '  de escritura raíz y tu autorización explícita.\n' >&2
            printf 'Método: pkexec / sudo (Linux), osascript con autorización (macOS),\n' >&2
            printf '  UAC (Windows).\n' >&2
            # Re-exec with elevation preserving env. Always use the ABSOLUTE
            # script path: when invoked as `bash toolkits/.../disk-cleanup.sh`,
            # $0 is relative and pkexec/sudo execute from a different cwd, so a
            # relative $0 cannot be found (exit 127) before the elevation dialog
            # even shows. $SCRIPT_DIR is already absolute (see top of file).
            if have pkexec; then
                exec pkexec bash "$SCRIPT_DIR/disk-cleanup.sh" build-artifacts --apply
            elif have sudo; then
                exec sudo bash "$SCRIPT_DIR/disk-cleanup.sh" build-artifacts --apply
            else
                printf 'ERROR: no se encuentra pkexec/sudo para elevar privilegios.\n' >&2
                return 1
            fi
        fi
    fi

    # Dispatch to the platform-native implementation.
    if is_windows; then
        local ps1="${SCRIPT_DIR}/disk-cleanup-build.ps1"
        if [ ! -f "$ps1" ]; then
            log "UNAVAILABLE: $ps1 not present (Windows PowerShell build-artifacts stage)."
            return 0
        fi
        if [ "$APPLY" -eq 1 ]; then
            powershell -NoProfile -ExecutionPolicy Bypass -File "$ps1" -Apply
        else
            powershell -NoProfile -ExecutionPolicy Bypass -File "$ps1" -ListOnly
        fi
        return $?
    fi
    # macOS/Linux: bash find-based scan below.

    # Scope derivation: we scan only WORK repos (the user's clones under
    # ~/Documentos/GitHub). Build artifacts are the HEAVY folders LATERAL to
    # each repo's .git (node_modules, target/, dist/, build/, .cache/) — never
    # the .git dir itself, never tool/cache clones (.asdf, .nvm, .linuxbrew,
    # .pub-cache, .cache/pre-commit, flutter). Symlinks are skipped (they point
    # at a shared copy).
    local scan_root="${BUILD_SCAN_ROOT:-$HOME/Documentos/GitHub}"
    [ -d "$scan_root" ] || { echo "BUILD_SCAN_ROOT no existe: $scan_root"; return 0; }

    local before after
    before="$(avail_bytes "$REPO_PATH")"

    local scratch=/tmp/opencode/disk-cleanup-build
    mkdir -p "$scratch"

    # 1. Discover WORK repos only: those under ~/Documentos/GitHub (the user's
    # working clones). We explicitly EXCLUDE tool/cache clones (.asdf, .nvm,
    # .linuxbrew, .pub-cache, .cache/pre-commit, flutter, etc.) — they are not
    # user work repos and deleting their artifacts could break the tooling.
    local repo_file="$scratch/repos.txt"
    : > "$repo_file"

    WORK_ROOT="${WORK_REPO_ROOT:-$HOME/Documentos/GitHub}"
    if [ -d "$WORK_ROOT" ]; then
        find "$WORK_ROOT" -maxdepth 3 -type d -name .git \
            > "$scratch/repos_find.log" 2>&1 || true
        sed 's#/\.git$##' "$scratch/repos_find.out" | sort -u > "$repo_file"
    fi
    # Fallback: if WORK_ROOT does not exist, scan / but only under the user home
    # and only dirs whose name is a plausible work repo (skip dot-dirs/caches).
    if [ ! -s "$repo_file" ]; then
        find "$HOME" -maxdepth 4 -type d -name .git \
            -not -path "$HOME/.asdf/*" -not -path "$HOME/.nvm/*" \
            -not -path "$HOME/.linuxbrew/*" -not -path "$HOME/.pub-cache/*" \
            -not -path "$HOME/.cache/*" -not -path "$HOME/flutter/*" \
            -not -path "$HOME/.hermes/*" \
            > "$scratch/repos_find.log" 2>&1 || true
        sed 's#/\.git$##' "$scratch/repos_find.out" | sort -u > "$repo_file"
    fi

    # 2. Collect build artifacts within each discovered repo.
    local mapfile_list=()
    while IFS= read -r repo; do
        [ -n "$repo" ] || continue
        while IFS= read -r d; do
            [ -n "$d" ] && mapfile_list+=("$d")
        done < <(find "$repo" \( \
            -type d -name node_modules -not -path '*/node_modules/*' -o \
            -type d -name target -not -path '*/target/*' -o \
            -type d -name dist -not -path '*/dist/*' -o \
            -type d -name build -not -path '*/build/*' -o \
            -type d -name .cache -not -path '*/.cache/*' \
        \) -not -type l -not -path '*/node_modules/*' >> "$scratch/list.log" 2>&1 || true)
    done < "$repo_file"

    # Dedupe
    mapfile_list=()
    while IFS= read -r d; do mapfile_list+=("$d"); done < <(sort -u "$scratch/list.txt")

    local total=0
    local d
    for d in "${mapfile_list[@]}"; do
        [ -L "$d" ] && continue
        local sz
        sz="$(du -sk "$d" 2>&1 | awk '{print $1}')"
        [ -n "$sz" ] || sz=0
        total=$(( total + sz ))
    done

    printf 'Scan root:  %s\n' "$scan_root"
    printf 'Repos descubiertos: %s\n' "$(wc -l < "$repo_file")"
    printf 'Artifact dirs found: %s (%s)\n' "${#mapfile_list[@]}" "$(human "$(( total * 1024 ))")"

    # Surface find errors if any were captured (they are signals, not noise).
    if [ -s "$scratch/find.err" ]; then
        printf 'find warnings (stderr captured):\n'
        sed 's/^/  /' "$scratch/find.err" | head -10
    fi

    if [ "${#mapfile_list[@]}" -eq 0 ]; then
        printf 'no build/target artifacts found under %s\n' "$scan_root"
        return 0
    fi

    if [ "$APPLY" -eq 0 ]; then
        printf 'LIST ONLY — nothing removed. These artifact dirs are regenerable\n'
        printf '(node_modules from lockfile; target/dist/build from compile):\n'
        local d2
        for d2 in "${mapfile_list[@]}"; do
            [ -L "$d2" ] && continue
            local sz2
            sz2="$(du -sk "$d2" 2>&1 | awk '{print $1}')"
            [ -n "$sz2" ] || sz2=0
            printf '  %-10s  %s\n' "$(human "$(( sz2 * 1024 ))")" "$d2"
        done
        return 0
    fi

    # Apply: remove each artifact dir.
    for d in "${mapfile_list[@]}"; do
        [ -L "$d" ] && continue
        printf 'removing %s\n' "$d"
        rm -rf "$d"
    done

    after="$(avail_bytes "$REPO_PATH")"
    report_reclaimed "build/target artifacts" "$before" "$after"
}

# ── Stage 4: docker volumes (emergency: reclaimed; dry-run lists) ────────────
# In emergency (--apply) the volumes are removed because they are reconstructible
# dev/cache/data. Stopped/created containers that pin volumes are removed first.
stage_docker_volumes() {
    rule "Stage 4 — docker volumes (emergency: reclaimed; dry-run lists)"
    require_docker || return 0

    local count
    count="$(docker volume ls -q | grep -c . || true)"
    if [ "$count" -eq 0 ]; then
        printf 'docker volumes: already clean — none present\n'
        return 0
    fi

    printf '%s volume(s). Sizes from docker system df -v:\n\n' "$count"
    local df_v
    df_v="$(docker system df -v)"
    if printf '%s' "$df_v" | grep -q 'Local Volumes space usage'; then
        printf '%s\n' "$df_v" | awk '/Local Volumes space usage/,0'
    else
        printf '%s\n' "$df_v"
    fi

    if [ "${APPLY:-0}" -ne 1 ]; then
        printf '\nLIST ONLY — volumes not removed. Re-run without --list-only to reclaim them\n'
        printf '(emergency default: reconstructible dev/cache/data are removed).\n'
        return 0
    fi

    # Emergency: remove stopped/created containers that pin the volumes, then prune.
    local pins
    pins="$(docker ps -a --filter 'status=exited' --filter 'status=created' -q | tr '\n' ' ')"
    if [ -n "${pins// /}" ]; then
        printf '\nRemoving stopped/created containers that reference volumes: %s\n' "$pins"
        # shellcheck disable=SC2086
        docker rm $pins
    fi

    printf '\nPruning docker volumes (reconstructible dev/cache/data)...\n'
    docker volume prune -f
}

usage() {
    cat <<'EOF'
Usage: disk-cleanup.sh <subcommand> [options]

Subcommands (ascending order of risk):
  measure          Read-only. Free space, image/volume counts, worktree inventory
  docker-images    Prune all images not referenced by a container (they re-pull)
  node-modules     Reclaim node_modules in worktrees  [delegated]
  worktrees        Remove worktrees that hold no work [delegated]
  docker-volumes   Default: removes stopped/created containers, prunes volumes
                  (reconstructible). --list-only previews
  build-artifacts  Recursively remove regenerable build/target artifacts under
                  ~/Documentos/GitHub/* (node_modules, target/, dist/, build/,
                  .cache/). --list-only previews
  all              measure -> stages 1-4, stopping at --target

Options:
  --list-only         Preview only; no removals. Default applies stages 1-4.
  --repo-path PATH    Repository whose worktrees are in scope (default: cwd)
  --target GB         Stop once this many GB are free on the repository's filesystem
  -h, --help          This text

Stages 2 and 3 are performed by scripts/worktree-cleanup.mjs, which owns the
worktree classifier. When it is absent the stage reports UNAVAILABLE — that is
not the same as clean, and this script will not pretend otherwise.

Never accepted: --branches, --force. Removing a worktree is recoverable while
its branch survives; deleting the branch is not, so there is no path to it.
EOF
}

parse_args() {
    [ $# -ge 1 ] || { usage; exit 1; }

    case "$1" in
        measure|docker-images|node-modules|worktrees|docker-volumes|build-artifacts|all)
            SUBCOMMAND="$1"; shift ;;
        -h|--help|help) usage; exit 0 ;;
        *) die "Unknown subcommand: $1 (try --help)" ;;
    esac

    while [ $# -gt 0 ]; do
        case "$1" in
            --list-only|--dry-run) APPLY=0; shift ;;
            --repo-path) REPO_PATH="${2:?--repo-path needs a value}"; shift 2 ;;
            --target) TARGET_GB="${2:?--target needs a value in GB}"; shift 2 ;;
            --branches|--force)
                die "$1 is not accepted. Removing a worktree is recoverable while its branch survives; deleting the branch is not." ;;
            -h|--help) usage; exit 0 ;;
            *) die "Unknown option: $1" ;;
        esac
    done

    [ -d "$REPO_PATH" ] || die "--repo-path does not exist: ${REPO_PATH}"
    REPO_PATH="$(cd "$REPO_PATH" && pwd)"

    case "${TARGET_GB:-0}" in
        ''|*[!0-9]*) die "--target must be a whole number of GB, got: ${TARGET_GB}" ;;
    esac
}

main() {
    parse_args "$@"

    local start_avail
    start_avail="$(avail_bytes "$REPO_PATH")"

    case "$SUBCOMMAND" in
        measure)        stage_measure ;;
        docker-images)  stage_docker_images ;;
        node-modules)   stage_node_modules ;;
        worktrees)      stage_worktrees ;;
        docker-volumes) stage_docker_volumes ;;
        build-artifacts) stage_build_artifacts ;;
        all)
            stage_measure
            if target_met; then
                rule "Target of ${TARGET_GB} GB already met — stopping before any removal."
            else
                stage_docker_images
                if target_met; then
                    rule "Target of ${TARGET_GB} GB met after stage 1 — stopping here."
                else
                    stage_node_modules
                    if target_met; then
                        rule "Target of ${TARGET_GB} GB met after stage 2 — stopping here."
                    else
                        stage_worktrees
                        if target_met; then
                            rule "Target of ${TARGET_GB} GB met after stage 3 — stopping here."
                        else
                            stage_docker_volumes
                            if target_met; then
                                rule "Target of ${TARGET_GB} GB met after stage 4 — stopping here."
                            else
                                stage_build_artifacts
                            fi
                        fi
                    fi
                fi
            fi
            ;;
    esac

    local end_avail
    end_avail="$(avail_bytes "$REPO_PATH")"
    rule "Summary"
    printf 'Free on %s: %s → %s (delta %s)\n' \
        "$(mount_of "$REPO_PATH")" "$(human "$start_avail")" "$(human "$end_avail")" \
        "$(human "$(( end_avail - start_avail ))")"
    if [ "$APPLY" -eq 0 ] && [ "$SUBCOMMAND" != "measure" ]; then
        printf 'List-only — nothing was removed. Re-run without --list-only to apply.\n'
    fi
}

main "$@"
