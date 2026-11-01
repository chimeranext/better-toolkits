#!/usr/bin/env bash
# sweep-unstaged.sh — ground-truth sweep: nothing uncommitted, unpushed, or
# excluded from a PR that is ready-to-review/mergeable.
#
# For every worktree of the repo:
#   1. uncommitted   — `git status --porcelain` non-empty (untracked included)
#   2. unpushed      — `git rev-list --count <upstream>..HEAD` > 0
#   3. PR coverage   — does the branch have an open PR? is it draft? is it
#                      mergeable?
#
# Exit: 0 if every worktree is clean (committed, pushed, PR-covered non-draft
# and mergeable); 1 otherwise. Always prints a per-worktree report.
#
# A command — no hidden redirects, stderr preserved (StS). Use:
#   bash scripts/ci/sweep-unstaged.sh [--json]
set -u

# Root of the repo this script lives in (scripts/ci -> repo root). Must be
# resolved BEFORE any use of $REPO_ROOT (line 145) because set -u aborts on
# unbound variables.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

JSON=0
for arg in "$@"; do
  case "$arg" in
    --json) JSON=1 ;;
  esac
done

say() { [ "$JSON" -eq 0 ] && echo "$1"; }
json_emit() { [ "$JSON" -eq 1 ] && echo "$1"; }

DIRTY=0
OPENSPEC_SYNC_NEEDED=0
DRIFT_WORKTREES=""

# Accumulate one worktree block from the porcelain stream, then evaluate.
# Format: "worktree <path>" then "HEAD <sha>", "branch <ref>", optional "locked".
declare -A WT
flush() {
  local wt="${WT[path]:-}" branch="${WT[branch]:-}"
  if [ -z "$wt" ]; then
    return
  fi
  # branch ref is like refs/heads/<name>
  branch="${branch#refs/heads/}"
  # 1. uncommitted
  local status_out uncommitted=0
  status_out="$(git -C "$wt" status --porcelain 2>&1)"
  if [ -n "$status_out" ]; then uncommitted=1; fi
  # 2. unpushed (vs origin/<branch> — not @{u}, which can resolve to origin/main)
  local unpushed=0 origin_ref=""
  if [ -n "$branch" ] && origin_ref="$(git rev-parse --verify --quiet "refs/remotes/origin/$branch" 2>&1)"; then
    local n
    n="$(git -C "$wt" rev-list --count "origin/$branch..HEAD" 2>&1)"
    case "$n" in
      ''|*[!0-9]*) unpushed=0 ;;
      *) [ "$n" -gt 0 ] && unpushed=1 ;;
    esac
  else
    unpushed=1   # no origin/<branch> => cannot have pushed
  fi
  # 3. PR coverage
  local pr pr_num="?" pr_draft="unknown" pr_mergeable="unknown"
  if [ -n "$branch" ]; then
    pr="$(gh pr list --head "$branch" --state open --json number,isDraft,mergeable --jq '.[0] // empty' 2>&1)"
    if [ -n "$pr" ]; then
      pr_num="$(printf '%s' "$pr" | jq -r '.number')"
      pr_draft="$(printf '%s' "$pr" | jq -r '.isDraft')"
      pr_mergeable="$(printf '%s' "$pr" | jq -r '.mergeable')"
    fi
  fi
  # 4. OpenSpec drift: any active change with a delta spec not reflected in the
  #    main specs (openspec/specs/). Detection: for each <change>/specs/**/spec.md,
  #    the equivalent main spec must exist and be in sync (cmp), else /opsx-sync
  #    is required.
  local openspec_drift=0 drift_detail=""
  if [ -d "$wt/openspec/changes" ]; then
    while IFS= read -r delta; do
      # delta is <change>/specs/<domain>/spec.md → main is openspec/specs/<domain>/spec.md
      local rel="${delta#"$wt/openspec/changes/"}"   # <change>/specs/<domain>/spec.md
      local main_spec="$wt/openspec/specs/${rel#*/specs/}"
      if [ ! -f "$main_spec" ]; then
        openspec_drift=1
        drift_detail="${drift_detail} missing:$rel"
        continue
      fi
      if ! cmp -s "$delta" "$main_spec"; then
        openspec_drift=1
        drift_detail="${drift_detail} drift:$rel"
      fi
    done < <(find "$wt/openspec/changes" -type f -path "*/specs/*/spec.md" 2>&1)
  fi
  # verdict
  local verdict="CLEAN"
  if [ "$uncommitted" -eq 1 ]; then verdict="DIRTY"; DIRTY=1; fi
  if [ "$unpushed" -eq 1 ]; then verdict="DIRTY"; DIRTY=1; fi
  if [ "$pr_num" = "?" ] || [ "$pr_draft" = "true" ] || { [ "$pr_mergeable" != "MERGEABLE" ] && [ "$pr_mergeable" != "true" ]; }; then
    verdict="DIRTY"; DIRTY=1
  fi
  if [ "$openspec_drift" -eq 1 ]; then
    verdict="DIRTY"; DIRTY=1
    OPENSPEC_SYNC_NEEDED=1
    case " $DRIFT_WORKTREES " in
      *" $wt "*) ;;
      *) DRIFT_WORKTREES="$DRIFT_WORKTREES $wt" ;;
    esac
  fi
  say "worktree: $wt"
  say "  branch:      $branch"
  say "  origin-branch: ${origin_ref:-<none>}"
  say "  uncommitted: $uncommitted"
  say "  unpushed:    $unpushed"
  say "  PR:          ${pr_num} (draft=$pr_draft, mergeable=$pr_mergeable)"
  if [ "$openspec_drift" -eq 1 ]; then
    say "  openspec:    DRIFT${drift_detail}"
  else
    say "  openspec:    clean"
  fi
  say "  verdict:     $verdict"
  say ""
  json_emit "{\"worktree\":\"$wt\",\"branch\":\"$branch\",\"uncommitted\":$uncommitted,\"unpushed\":$unpushed,\"pr\":\"$pr_num\",\"draft\":\"$pr_draft\",\"mergeable\":\"$pr_mergeable\",\"verdict\":\"$verdict\"}"
  WT=()
}

while IFS= read -r line; do
  case "$line" in
    worktree\ *) WT[path]="${line#worktree }" ;;
    branch\ *) WT[branch]="${line#branch }" ;;
    HEAD\ *) WT[head]="${line#HEAD }" ;;
    locked) WT[locked]=1 ;;
    *) : ;;
  esac
  # A new "worktree" line arrives only after the previous block ended, so we
  # flush lazily: when we see a path already set, evaluate the previous one.
  if [ -n "${WT[path]:-}" ] && [ -n "${WT[branch]:-}" ] && [ -n "${WT[head]:-}" ]; then
    flush
  fi
done < <(git worktree list --porcelain)

# Flush the final block (if any).
flush

# MANDATORY OpenSpec sync: when delta-drift was detected in any worktree, apply
# the delta specs into that worktree's main specs now (never leave drift behind).
# This is the shared engine also used by /opsx-sync.
if [ "$OPENSPEC_SYNC_NEEDED" -eq 1 ]; then
  for wt in $DRIFT_WORKTREES; do
    say "SWEEP: OpenSpec drift in $wt — applying mandatory sync (opsx-sync-apply)."
    if ! bash "$REPO_ROOT/scripts/ci/opsx-sync-apply.sh" --root "$wt"; then
      echo "SWEEP: OpenSpec sync FAILED for $wt — fix before continuing." >&2
      exit 1
    fi
  done
  say "SWEEP: OpenSpec sync applied."
fi

if [ "$DIRTY" -eq 1 ]; then
  say "SWEEP: DIRTY — work left uncommitted, unpushed, or uncovered by a ready PR."
  exit 1
fi
say "SWEEP: CLEAN — nothing uncommitted, unpushed, or PR-uncovered."
exit 0
