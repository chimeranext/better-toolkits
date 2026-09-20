#!/usr/bin/env bash
# Wire better-toolkits slash commands into OpenCode autocomplete.
#
# OpenCode discovers `/` commands from Markdown files under
# `~/.config/opencode/commands/` (nested paths become `/a/b`), but it does
# NOT discover toolkit `commands/` directories or `skills` entries — so after
# /toolkits-initial-setup the skills load yet nothing appears in suggestions.
# This script symlinks every toolkit command as
# `~/.config/opencode/commands/<plugin-name>/<command>.md`
# (e.g. `/make-no-mistakes/implement`), using the install names from
# `.claude-plugin/marketplace.json` (not the directory names).
#
# Idempotent: re-running repairs stale links and prunes orphans.
# No secrets involved. Never touches `mcp` or `plugins` config.
#
# Usage: setup-opencode-commands.sh [--dry-run] [--check] [--root <path>]
#   --dry-run  print planned link/unlink actions, change nothing (exit 0)
#   --check    exit 0 iff every expected link exists and resolves, else 1
#   --root     monorepo root (default: three levels above this script)

set -euo pipefail

DRY_RUN=0
CHECK=0
ROOT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=1; shift ;;
    --check) CHECK=1; shift ;;
    --root) ROOT="${2:-}"; shift 2 ;;
    -h|--help)
      sed -n '2,16p' "$0"
      exit 0 ;;
    *)
      echo "ERROR: unknown flag: $1 (see --help)" >&2
      exit 64 ;;
  esac
done

if [[ -z "$ROOT" ]]; then
  ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
fi
MARKETPLACE="$ROOT/.claude-plugin/marketplace.json"
DEST_BASE="${HOME}/.config/opencode/commands"

if [[ ! -f "$MARKETPLACE" ]]; then
  echo "ERROR: marketplace manifest not found: $MARKETPLACE" >&2
  exit 1
fi

# plugin-name -> source dir, from the marketplace SSOT (python3 stdlib only).
mapfile -t PAIRS < <(python3 -c "
import json, sys
m = json.load(open('$MARKETPLACE'))
for p in m['plugins']:
    print(p['name'] + chr(9) + p['source'].lstrip('./'))
")

linked=0
pruned=0
missing=0

for pair in "${PAIRS[@]}"; do
  name="${pair%%$'\t'*}"
  src_rel="${pair#*$'\t'}"
  src_dir="$ROOT/$src_rel/commands"
  dest_dir="$DEST_BASE/$name"
  if [[ ! -d "$src_dir" ]]; then
    continue # skills-only toolkit (e.g. venture-studio-toolkit)
  fi
  if [[ "$DRY_RUN" -eq 0 && "$CHECK" -eq 0 ]]; then
    mkdir -p "$dest_dir"
  fi
  for src in "$src_dir"/*.md; do
    [[ -e "$src" ]] || continue
    base="$(basename "$src")"
    dest="$dest_dir/$base"
    if [[ "$CHECK" -eq 1 ]]; then
      if [[ ! -L "$dest" || ! -e "$dest" ]]; then
        echo "MISSING: $name/$base" >&2
        missing=$((missing + 1))
      fi
      continue
    fi
    if [[ -L "$dest" && "$(readlink "$dest")" == "$src" && -e "$dest" ]]; then
      continue # already correct
    fi
    if [[ "$DRY_RUN" -eq 1 ]]; then
      echo "LINK: $name/$base -> $src"
    else
      rm -f "$dest"
      ln -s "$src" "$dest"
      linked=$((linked + 1))
    fi
  done
done

if [[ "$CHECK" -eq 1 ]]; then
  # Orphaned links (target removed upstream) also fail the check.
  while IFS= read -r -d '' link; do
    if [[ ! -e "$link" ]]; then
      echo "BROKEN: $link" >&2
      missing=$((missing + 1))
    fi
  done < <(find "$DEST_BASE" -type l -print0 2>/dev/null || true)
  # Top-level bootstrap alias (see below).
  if [[ ! -L "$DEST_BASE/toolkits-initial-setup.md" || ! -e "$DEST_BASE/toolkits-initial-setup.md" ]]; then
    echo "MISSING: toolkits-initial-setup.md (top-level alias)" >&2
    missing=$((missing + 1))
  fi
  if [[ "$missing" -gt 0 ]]; then
    echo "CHECK FAILED: $missing problem(s)" >&2
    exit 1
  fi
  echo "CHECK OK"
  exit 0
fi

# Prune links whose source no longer exists (real run only).
while IFS= read -r -d '' link; do
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "PRUNE: $link"
  else
    rm -f "$link"
    pruned=$((pruned + 1))
  fi
done < <(find "$DEST_BASE" -type l ! -exec test -e {} \; -print0 2>/dev/null || true)

if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "--dry-run: no changes made"
else
  echo "linked=$linked pruned=$pruned dest=$DEST_BASE"
fi

# Top-level bootstrap alias: users expect `/toolkits-initial-setup`, but
# nested paths surface as `/better-toolkits-bootstrap/toolkits-initial-setup`.
# A top-level symlink is never pruned (prune only removes broken links).
BOOT_SRC="$ROOT/shared/bootstrap/commands/toolkits-initial-setup.md"
BOOT_DEST="$DEST_BASE/toolkits-initial-setup.md"
if [[ -f "$BOOT_SRC" ]]; then
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "LINK: toolkits-initial-setup.md -> $BOOT_SRC"
  elif [[ ! -L "$BOOT_DEST" || "$(readlink "$BOOT_DEST")" != "$BOOT_SRC" ]]; then
    rm -f "$BOOT_DEST"
    ln -s "$BOOT_SRC" "$BOOT_DEST"
    echo "linked top-level alias: $BOOT_DEST"
  fi
fi
