#!/usr/bin/env bash
# propagate-policies.sh — distribute the machine-readable policy to consumer repos.
#
# Reads the local policies.yml (SSOT) and, for each configured consumer repo,
# emits a `repository_dispatch` (event_type: policies-updated) with the policy
# payload so the consumer's apply-policies.sh materializes it. Designed to run
# from the policy repo's GitHub Actions (propagate-policies.yml) under the
# GitHub App token.
#
# Usage:
#   propagate-policies.sh [--dry-run] [--repo owner/name ...]
#
# Env:
#   GH_TOKEN        GitHub token (App installation token) with repo read+dispatch
#   CONSUMER_REPOS  space-separated "owner/name" list (or --repo args)
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
POLICY_FILE="$HERE/policies.yml"
DRY_RUN=0
CONSUMERS=()

while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) DRY_RUN=1; shift ;;
    --repo) CONSUMERS+=("$2"); shift 2 ;;
    *) echo "usage: $0 [--dry-run] [--repo owner/name]..." >&2; exit 2 ;;
  esac
done

if [ -f "$POLICY_FILE" ]; then
  POLICY_PAYLOAD=$(python3 -c 'import yaml,json,sys; print(json.dumps(yaml.safe_load(open(sys.argv[1]))))' "$POLICY_FILE")
else
  echo "[propagate] ERROR: $POLICY_FILE not found" >&2
  exit 1
fi

if [ ${#CONSUMERS[@]} -eq 0 ]; then
  CONSUMERS=($CONSUMER_REPOS)
fi
if [ ${#CONSUMERS[@]} -eq 0 ]; then
  echo "[propagate] no consumers configured (set CONSUMER_REPOS or --repo)" >&2
  exit 0
fi

for repo in "${CONSUMERS[@]}"; do
  echo "[propagate] -> $repo"
  if [ "$DRY_RUN" = "1" ]; then
    echo "[propagate]   (dry-run) payload=$POLICY_PAYLOAD"
    continue
  fi
  gh api -X POST "repos/$repo/dispatches" \
    -f event_type=policies-updated \
    -f client_payload="$POLICY_PAYLOAD" --silent
  echo "[propagate]   dispatched"
done

echo "[propagate] done"
