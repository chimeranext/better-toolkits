#!/usr/bin/env bash
# setup-worktree.sh — agent-agnostic worktree environment bootstrap (DPC).
#
# Standardizes how any project (and any worktree) installs dependencies,
# per the DPC doctrine (shared/references/engineering-standards/dependency-caching.md).
#
#   - Detects the package manager from the committed lockfile (pnpm > yarn >
#     bun > npm). Prefers pnpm when present.
#   - Installs with the frozen-lockfile variant for reproducibility.
#   - Honors PNPM_STORE_DIR if set (e.g. CI points it at a cached path); on a
#     dev machine the pnpm global store (~/.local/share/pnpm/store) is used.
#   - Is invoked from a post-checkout hook so any agent/human that checks out a
#     worktree gets the same environment.
#
# Usage:
#   bash scripts/setup-worktree.sh [--dry-run] [--frozen|--no-frozen]
#   (auto-run from .git/hooks/post-checkout when the repo has this script)
set -u

DRY=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY=1 ;;
    --no-frozen|--frozen) : ;;  # accepted for compatibility; frozen is the default per manager
    -h|--help)
      cat <<'EOF'
Usage: bash scripts/setup-worktree.sh [--dry-run] [--frozen|--no-frozen]

Bootstrap dependencies for the current checkout. Auto-detects the package manager
from the committed lockfile; installs with the frozen-lockfile variant.
EOF
      exit 0 ;;
    *) echo "unknown arg: $arg" >&2; exit 2 ;;
  esac
done

run() {
  if [ "$DRY" -eq 1 ]; then
    echo "[dry-run] $*"
  else
    echo "[run] $*"
    "$@"
  fi
}

# --- Detect package manager + frozen flag --------------------------------
# Multi-language (DPC): each lockfile maps to its canonical manager and the
# frozen/CI install variant.
INSTALL=()
if [ -f pnpm-lock.yaml ]; then
  INSTALL=(pnpm install --frozen-lockfile)
elif [ -f yarn.lock ]; then
  INSTALL=(yarn install --frozen-lockfile)
elif [ -f bun.lock ] || [ -f bun.lockb ]; then
  INSTALL=(bun install --frozen-lockfile)
elif [ -f package-lock.json ]; then
  INSTALL=(npm ci)
elif [ -f uv.lock ]; then
  INSTALL=(uv sync --frozen)
elif [ -f poetry.lock ]; then
  INSTALL=(poetry install --sync)
elif [ -f Cargo.lock ]; then
  INSTALL=(cargo build --locked)
elif [ -f pubspec.lock ]; then
  INSTALL=(dart pub get --enforce-lockfile)
elif [ -f mix.lock ]; then
  INSTALL=(mix deps.get --only prod)
elif [ -f go.sum ]; then
  INSTALL=(go mod download)
elif [ -f Gemfile.lock ]; then
  INSTALL=(bundle install --deployment)
elif [ -f composer.lock ]; then
  INSTALL=(composer install --no-dev --prefer-dist)
elif [ -f renv.lock ]; then
  INSTALL=(Rscript -e "renv::restore()")
elif [ -f Manifest.toml ]; then
  INSTALL=(julia --project=. -e "using Pkg; Pkg.instantiate()")
elif [ -f build.zig.zon ]; then
  INSTALL=(zig build)
elif [ -f shard.lock ]; then
  INSTALL=(shards install --production)
elif ls *.nimble.lock 2>&1 | grep -q nimble; then
  INSTALL=(nimble install -y)
else
  echo "setup-worktree: no known lockfile found — no install step (language may not use a package manager)"
  INSTALL=()
fi

# --- pnpm store env (DPC) ------------------------------------------------
# Local: pnpm's global content-addressable store (default). CI: honor
# PNPM_STORE_DIR if the workflow set it (cache path).
if [ "${INSTALL[0]}" = "pnpm" ] && [ -n "${PNPM_STORE_DIR:-}" ]; then
  echo "setup-worktree: PNPM_STORE_DIR=$PNPM_STORE_DIR (CI cache)"
fi

echo "setup-worktree: installing with: ${INSTALL[*]}"
run "${INSTALL[@]}"
