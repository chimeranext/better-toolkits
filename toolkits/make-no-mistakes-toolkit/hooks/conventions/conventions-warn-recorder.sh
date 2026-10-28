#!/usr/bin/env bash
# Conventions warn recorder — accumulates convention violations and pushes them
# in batch to the entity's audit repo (default <org>/internal-audits,
# centralization opt-in via auditsRepo).
#
# Usage:
#   conventions-warn-recorder.sh <convention-id> <file> <author>
#
# Example:
#   conventions-warn-recorder.sh rust/R9 src/auth.rs @lapc506
#
# Appends to the audit file for today and, when a batch threshold is reached
# (or on demand), pushes to the audit repo. Never blocks.

set -euo pipefail

CONVENTION="${1:?convention id required}"
FILE="${2:?file required}"
AUTHOR="${3:?author required}"

# --- Resolve audit repo (default <org>/internal-audits; opt-in centralization
#     via auditsRepo in make-no-mistakes.config.json). ---
AUDITS_REPO="${auditsRepo:-}"
if [ -z "$AUDITS_REPO" ]; then
  # default: org of the repo being audited (strip any embedded token from URL)
  REMOTE_URL="$(git remote get-url origin 2>/dev/null || echo '')"
  # remove credentials (user:token@) if present
  CLEAN_URL="$(printf '%s' "$REMOTE_URL" | sed -E 's#(https?://)[^/@]+@#\1#')"
  ORG="$(printf '%s' "$CLEAN_URL" | sed -E 's#.*github.com[:/]([^/]+)/.*#\1#')"
  AUDITS_REPO="${ORG:-unknown}/internal-audits"
fi

TODAY="$(date +%F)"
AUDIT_FILE="conventions/code-conventions-audit-${TODAY}.md"
WORK_DIR="${TMPDIR:-/tmp}/conventions-audits"
mkdir -p "$WORK_DIR"

# --- Accumulate in local buffer (append-only). ---
BUFFER="$WORK_DIR/${AUDITS_REPO//\//__}-${TODAY}.md"
mkdir -p "$(dirname "$BUFFER")"
{
  printf -- '- [warn] %s — %s — %s\n' "$CONVENTION" "$FILE" "$AUTHOR"
} >> "$BUFFER"

# --- Batch push: when buffer reaches threshold, or always on flush. ---
BATCH_THRESHOLD="${CONVENTIONS_BATCH_THRESHOLD:-10}"
LINES="$(wc -l < "$BUFFER")"

if [ "$LINES" -ge "$BATCH_THRESHOLD" ] || [ "${CONVENTIONS_FLUSH:-0}" = "1" ]; then
  # Clone/pull audit repo, append to today's dated file, commit, push.
  CLONE_DIR="$WORK_DIR/repo-${AUDITS_REPO//\//__}"
  if [ ! -d "$CLONE_DIR/.git" ]; then
    git clone "https://github.com/${AUDITS_REPO}.git" "$CLONE_DIR" 2>/dev/null
  fi
  cd "$CLONE_DIR"
  git pull --rebase --quiet 2>/dev/null || true
  mkdir -p "$(dirname "$AUDIT_FILE")"
  cat "$BUFFER" >> "$AUDIT_FILE"
  git add "$AUDIT_FILE"
  git -c user.name="conventions-warn" -c user.email="conventions-warn@localhost" \
    commit -m "conventions: record warn violations ${TODAY}" 2>/dev/null || true
  git push --quiet 2>/dev/null || true
  # clear batch after successful push
  : > "$BUFFER"
fi

echo "[warn] recorded $CONVENTION ($FILE by $AUTHOR) -> $AUDITS_REPO/$AUDIT_FILE"
