#!/usr/bin/env bash
# worktree-symlink-build-artifacts.sh — recurrence guard for BGI + WTD.
#
# When a git worktree is created, its checkout has no build artifacts
# (node_modules, venv, target, _build, deps, .dart_tool, .terraform, ...).
# This script symlinks heavy build-artifact directories to a shared, gitignored
# cache so each worktree does not reinstall deps. It reads the canonical
# multi-language catalog `shared/references/conventions/vendored-gitignore.toml`
# (SSOT; aligned with .gitignore) rather than hardcoding one language.
#
# Usage:
#   bash scripts/git-hooks/worktree-symlink-build-artifacts.sh <worktree-path>
#   (called from a post-checkout / post-worktree hook)
#
# Behavior:
#   - Resolves the shared cache root: $XDG_CACHE_HOME/better-toolkits/build-<hash>
#   - For each build-artifact dir listed in the catalog, if it exists as a real
#     dir it is moved into the cache and replaced by a symlink; if absent it is
#     linked; if already a symlink it is a no-op.
#   - Never discards stderr; combined log; no null redirections.

set -u

if [ $# -lt 1 ]; then
  echo "usage: bash $0 <worktree-path>" >&2
  exit 2
fi
WT="$1"
WT="$(cd "$WT" && pwd)" || exit 2
if [ ! -d "$WT" ]; then
  echo "worktree-symlink: not a directory: $WT" >&2
  exit 1
fi

# Locate the canonical catalog (SSOT).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CATALOG="$ROOT/shared/references/conventions/vendored-gitignore.toml"
if [ ! -f "$CATALOG" ]; then
  echo "worktree-symlink: catalog not found at $CATALOG" >&2
  exit 2
fi

# Shared cache root (gitignored). One cache per repo root hash to avoid
# cross-repo conflicts while sharing across worktrees of the same repo.
CACHE_BASE="${XDG_CACHE_HOME:-$HOME/.cache}/better-toolkits"
REPO_HASH="$(printf '%s' "${GIT_DIR:-$WT}" | cksum | awk '{print $1}')"
CACHE_ROOT="$CACHE_BASE/build-$REPO_HASH"
mkdir -p "$CACHE_ROOT"

# Extract directory globs from the catalog. A glob like "node_modules/" or
# "target/" becomes a symlink target. We deliberately EXCLUDE tooling/VCS dirs
# (.git, .idea, .vscode, pids) that are NOT shareable build artifacts: symlinking
# them (e.g. .git/) would be destructive. Only dependency/build dirs are shared.
# We parse the TOML "globs = [ ... ]" blocks with sed.
extract_dir_globs() {
  sed -n '/^globs = \[/,/^\]/p' "$CATALOG" \
    | grep -oE '"[^"]+"' \
    | tr -d '"' \
    | grep -E '^[^*/]+/$' \
    | sed 's#/$##' \
    | grep -vE '^(\.git|\.idea|\.vscode|pids|\.DS_Store)$'
}

link_artifact() {
  local name="$1"
  local cache_dir="$CACHE_ROOT/$name"
  local target="$WT/$name"
  mkdir -p "$cache_dir"
  if [ -d "$target" ] && [ ! -L "$target" ]; then
    if [ -z "$(ls -A "$cache_dir" 2>&1)" ]; then
      cp -a "$target"/. "$cache_dir"/ > /tmp/wt-symlink-cp.log 2>&1 || true
    fi
    rm -rf "$target"
    ln -s "$cache_dir" "$target"
    echo "worktree-symlink: linked $target -> $cache_dir (moved existing)"
  elif [ ! -e "$target" ]; then
    ln -s "$cache_dir" "$target"
    echo "worktree-symlink: linked $target -> $cache_dir"
  else
    echo "worktree-symlink: $target already a symlink (idempotent)"
  fi
}

LINKED=0
for glob in $(extract_dir_globs); do
  link_artifact "$glob"
  LINKED=1
done

if [ "$LINKED" -eq 0 ]; then
  echo "worktree-symlink: no build-artifact dirs found in catalog"
fi

exit 0
