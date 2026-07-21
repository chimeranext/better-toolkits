#!/usr/bin/env bash
# repo-hygiene.sh — audit/prune merged PR branches; enforce delete_branch_on_merge.
#
# Usage:
#   repo-hygiene.sh audit|policy|prune-remote|prune-local|all [options]
#
# Defaults: dry-run (no mutations). Pass --apply to mutate.
# Requires: gh, jq, git (for prune-local).

set -euo pipefail

DEFAULT_ORG="${REPO_HYGIENE_ORG:-Seacrets-Online}"
DEFAULT_REPOS=(
  "Seacrets-Online/seacrets.online-app"
  "Seacrets-Online/seacrets.online-gitops"
  "Seacrets-Online/seacrets.online-infra"
  "Seacrets-Online/seacrets.online-docs"
  "Seacrets-Online/seacrets.online-specs"
  "Seacrets-Online/seacrets.online-storybook"
  "Seacrets-Online/seacrets.online-clean"
)
PROTECTED_BRANCHES=(main master develop devel stage)
MERGED_PR_LIMIT="${REPO_HYGIENE_MERGED_LIMIT:-500}"

SUBCOMMAND=""
APPLY=0
JSON=0
ORG="$DEFAULT_ORG"
LOCAL_PATH=""
SUMMARY_FILE="${GITHUB_STEP_SUMMARY:-}"
REPOS=()

log() { printf '%s\n' "$*" >&2; }
die() { log "ERROR: $*"; exit 1; }

is_protected_branch() {
  local branch="$1"
  local protected
  for protected in "${PROTECTED_BRANCHES[@]}"; do
    if [[ "$branch" == "$protected" ]]; then
      return 0
    fi
  done
  return 1
}

require_tools() {
  command -v gh >/dev/null 2>&1 || die "gh CLI is required"
  command -v jq >/dev/null 2>&1 || die "jq is required"
  gh auth status >/dev/null 2>&1 || die "gh is not authenticated (run: gh auth login)"
}

append_summary() {
  [[ -n "$SUMMARY_FILE" ]] || return 0
  printf '%s\n' "$1" >>"$SUMMARY_FILE"
}

usage() {
  cat <<EOF
Usage: repo-hygiene.sh <subcommand> [options]

Subcommands:
  audit          Report delete_branch_on_merge policy + stale merged-PR head branches
  policy         Enable delete_branch_on_merge on repos where it is false/off
  prune-remote   Delete remote head branches whose PRs are merged (not protected, not open)
  prune-local    Prune gone local branches + stale worktrees in --local-path (default cwd)
  all            audit → policy → prune-remote (and prune-local when --local-path set)

Options:
  --apply              Apply mutations (default: dry-run)
  --org ORG            GitHub org/owner (default: ${DEFAULT_ORG})
  --repo OWNER/NAME    Limit to repo(s); repeat flag (default: Seacrets platform list)
  --local-path PATH    Git repo path for prune-local (default: current directory)
  --json               Emit machine-readable JSON summary on stdout (last repo batch)
  --summary-file PATH  Append markdown report (default: GITHUB_STEP_SUMMARY when set)
  -h, --help           Show this help

Environment:
  REPO_HYGIENE_ORG           Default org
  REPO_HYGIENE_GH_TOKEN      Optional PAT for cross-repo Actions (export GH_TOKEN)
  REPO_HYGIENE_MERGED_LIMIT  Max merged PRs scanned per repo (default: 500)

Examples:
  ./scripts/repo-hygiene.sh audit
  ./scripts/repo-hygiene.sh policy --apply
  ./scripts/repo-hygiene.sh prune-remote --repo Seacrets-Online/seacrets.online-docs --apply
  ./scripts/repo-hygiene.sh all --apply --local-path ~/Documentos/GitHub/hyperlabusa/seacrets.online-gitops
EOF
}

parse_args() {
  if [[ $# -lt 1 ]]; then
    usage
    exit 1
  fi

  case "$1" in
    audit|policy|prune-remote|prune-local|all)
      SUBCOMMAND="$1"
      shift
      ;;
    -h|--help|help)
      usage
      exit 0
      ;;
    *)
      die "Unknown subcommand: $1 (try --help)"
      ;;
  esac

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --apply) APPLY=1; shift ;;
      --org) ORG="${2:?}"; shift 2 ;;
      --repo) REPOS+=("$2"); shift 2 ;;
      --local-path) LOCAL_PATH="$2"; shift 2 ;;
      --json) JSON=1; shift ;;
      --summary-file) SUMMARY_FILE="$2"; shift 2 ;;
      -h|--help) usage; exit 0 ;;
      *) die "Unknown option: $1" ;;
    esac
  done

  if [[ ${#REPOS[@]} -eq 0 ]]; then
    REPOS=("${DEFAULT_REPOS[@]}")
  fi
}

repo_delete_on_merge() {
  local repo="$1"
  gh api "repos/${repo}" --jq '.delete_branch_on_merge // false' 2>/dev/null || echo "unknown"
}

repo_open_heads() {
  local repo="$1"
  gh pr list --repo "$repo" --state open --limit 200 \
    --json headRefName --jq '.[].headRefName' 2>/dev/null || true
}

remote_branch_exists() {
  local repo="$1"
  local branch="$2"
  gh api "repos/${repo}/git/ref/heads/${branch}" >/dev/null 2>&1
}

delete_remote_branch() {
  local repo="$1"
  local branch="$2"
  if [[ "$APPLY" -eq 1 ]]; then
    gh api -X DELETE "repos/${repo}/git/refs/heads/${branch}" >/dev/null
    log "DELETED remote ${repo}@${branch}"
  else
    log "DRY-RUN would delete remote ${repo}@${branch}"
  fi
}

enable_delete_on_merge() {
  local repo="$1"
  if [[ "$APPLY" -eq 1 ]]; then
    gh api -X PATCH "repos/${repo}" -f delete_branch_on_merge=true >/dev/null
    log "ENABLED delete_branch_on_merge on ${repo}"
  else
    log "DRY-RUN would enable delete_branch_on_merge on ${repo}"
  fi
}

cmd_audit_repo() {
  local repo="$1"
  local policy open_heads merged_json branch pr_num merged_at
  local stale=()
  local policy_ok=0

  policy="$(repo_delete_on_merge "$repo")"
  [[ "$policy" == "true" ]] && policy_ok=1

  mapfile -t open_heads < <(repo_open_heads "$repo")

  merged_json="$(gh pr list --repo "$repo" --state merged --limit "$MERGED_PR_LIMIT" \
    --json number,headRefName,mergedAt 2>/dev/null || echo '[]')"

  while IFS=$'\t' read -r branch pr_num merged_at; do
    [[ -n "$branch" ]] || continue
    if is_protected_branch "$branch"; then
      continue
    fi
    local is_open=0
    local head
    for head in "${open_heads[@]:-}"; do
      if [[ "$head" == "$branch" ]]; then
        is_open=1
        break
      fi
    done
    [[ "$is_open" -eq 1 ]] && continue
    if remote_branch_exists "$repo" "$branch"; then
      stale+=("${branch}\t${pr_num}\t${merged_at}")
    fi
  done < <(echo "$merged_json" | jq -r '.[] | [.headRefName, (.number|tostring), .mergedAt] | @tsv')

  append_summary "### \`${repo}\`"
  append_summary ""
  append_summary "| Check | Value |"
  append_summary "| --- | --- |"
  append_summary "| \`delete_branch_on_merge\` | \`${policy}\` |"
  append_summary "| Stale merged-PR head branches on remote | ${#stale[@]} |"
  append_summary ""

  if [[ ${#stale[@]} -gt 0 ]]; then
    append_summary "<details><summary>Stale branches</summary>"
    append_summary ""
    append_summary "| Branch | Merged PR | Merged at |"
    append_summary "| --- | --- | --- |"
    local row branch pr_num merged_at
    for row in "${stale[@]}"; do
      IFS=$'\t' read -r branch pr_num merged_at <<<"$row"
      append_summary "| \`${branch}\` | #${pr_num} | ${merged_at} |"
    done
    append_summary ""
    append_summary "</details>"
    append_summary ""
  fi

  log "AUDIT ${repo}: delete_branch_on_merge=${policy} stale_merged_heads=${#stale[@]}"
  if [[ "$JSON" -eq 1 ]]; then
    jq -n \
      --arg repo "$repo" \
      --argjson policy_ok "$policy_ok" \
      --arg policy "$policy" \
      --argjson stale_count "${#stale[@]}" \
      '{repo: $repo, delete_branch_on_merge: $policy, policy_ok: ($policy == "true"), stale_merged_head_count: $stale_count}'
  fi
}

cmd_policy_repo() {
  local repo="$1"
  local policy
  policy="$(repo_delete_on_merge "$repo")"
  if [[ "$policy" == "true" ]]; then
    log "POLICY OK ${repo} (already true)"
    return 0
  fi
  enable_delete_on_merge "$repo"
  append_summary "- \`${repo}\`: enable \`delete_branch_on_merge\` (was \`${policy}\`)"
}

cmd_prune_remote_repo() {
  local repo="$1"
  local open_heads merged_json branch pr_num merged_at deleted=0

  mapfile -t open_heads < <(repo_open_heads "$repo")

  merged_json="$(gh pr list --repo "$repo" --state merged --limit "$MERGED_PR_LIMIT" \
    --json number,headRefName,mergedAt 2>/dev/null || echo '[]')"

  while IFS=$'\t' read -r branch pr_num merged_at; do
    [[ -n "$branch" ]] || continue
    if is_protected_branch "$branch"; then
      continue
    fi
    local is_open=0
    local head
    for head in "${open_heads[@]:-}"; do
      if [[ "$head" == "$branch" ]]; then
        is_open=1
        break
      fi
    done
    [[ "$is_open" -eq 1 ]] && continue
    if remote_branch_exists "$repo" "$branch"; then
      delete_remote_branch "$repo" "$branch"
      append_summary "- \`${repo}@${branch}\` (merged PR #${pr_num})"
      deleted=$((deleted + 1))
    fi
  done < <(echo "$merged_json" | jq -r '.[] | [.headRefName, (.number|tostring), .mergedAt] | @tsv')

  log "PRUNE-REMOTE ${repo}: ${deleted} branch(es) $([[ "$APPLY" -eq 1 ]] && echo deleted || echo planned)"
}

cmd_prune_local() {
  local path="${LOCAL_PATH:-.}"
  [[ -d "$path/.git" ]] || die "Not a git repo: $path"

  log "PRUNE-LOCAL in ${path} (apply=$APPLY)"
  append_summary "## Local prune: \`${path}\`"
  append_summary ""

  (
    cd "$path"
    git fetch --prune origin 2>/dev/null || git fetch --prune 2>/dev/null || true

    local gone=()
    while IFS= read -r line; do
      [[ -n "$line" ]] && gone+=("$line")
    done < <(git branch -vv | grep ': gone]' | awk '{print $1}' | sed 's/^[*+]//')

    if [[ ${#gone[@]} -eq 0 ]]; then
      log "No local branches with gone upstream"
      append_summary "_No local branches with gone upstream._"
    else
      local b
      for b in "${gone[@]}"; do
        if [[ "$APPLY" -eq 1 ]]; then
          git branch -D "$b" >/dev/null 2>&1 || git branch -d "$b" >/dev/null
          log "Deleted local branch ${b}"
        else
          log "DRY-RUN would delete local branch ${b}"
        fi
        append_summary "- local \`${b}\` (upstream gone)"
      done
    fi

    if [[ "$APPLY" -eq 1 ]]; then
      git worktree prune
      log "Ran git worktree prune"
    else
      log "DRY-RUN would run git worktree prune"
    fi
  )
}

run_for_repos() {
  local fn="$1"
  local repo
  for repo in "${REPOS[@]}"; do
    "$fn" "$repo"
  done
}

main() {
  parse_args "$@"
  require_tools

  if [[ -n "$SUMMARY_FILE" ]]; then
    {
      printf '## Repo hygiene — `%s`\n\n' "$SUBCOMMAND"
      printf '_Mode: **%s** · org default `%s` · repos: %s_\n\n' \
        "$([[ "$APPLY" -eq 1 ]] && echo apply || echo dry-run)" \
        "$ORG" \
        "${#REPOS[@]}"
    } >>"$SUMMARY_FILE"
  fi

  case "$SUBCOMMAND" in
    audit)
      run_for_repos cmd_audit_repo
      ;;
    policy)
      append_summary "## Policy changes"
      append_summary ""
      run_for_repos cmd_policy_repo
      ;;
    prune-remote)
      append_summary "## Remote branch deletions"
      append_summary ""
      run_for_repos cmd_prune_remote_repo
      ;;
    prune-local)
      cmd_prune_local
      ;;
    all)
      append_summary "## Audit"
      append_summary ""
      run_for_repos cmd_audit_repo
      append_summary "## Policy"
      append_summary ""
      run_for_repos cmd_policy_repo
      append_summary "## Remote prune"
      append_summary ""
      run_for_repos cmd_prune_remote_repo
      if [[ -n "$LOCAL_PATH" ]]; then
        cmd_prune_local
      fi
      ;;
  esac

  log "Done ($SUBCOMMAND, apply=$APPLY)."
}

main "$@"
