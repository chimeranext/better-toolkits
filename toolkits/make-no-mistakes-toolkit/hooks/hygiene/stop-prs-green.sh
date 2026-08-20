#!/usr/bin/env bash
# Stop hook (task #32): hard enforcement for /ready-to-review-mergeable.
#
# While `.claude/.implement-prs` exists, the session may not stop until every
# listed PR is (a) not a Draft, (b) APPROVED by code-reviewer, and (c)
# carrying NO blocker / P1 / P2 findings in that approving review. This stops the
# agent from declaring victory before the bot is actually green.
#
# State file format (`.claude/.implement-prs`, written by the slash command):
#   line 1 : the legacy confidence threshold. ADVISORY since tracker issue — parsed
#            and reported, never used to block. Kept so old state files and the
#            `--confidence` flag do not crash the gate.
#   line 2+: one PR per line. Each line is EITHER a full GitHub PR URL
#            (https://github.com/<owner>/<repo>/pull/<n>) — which may point at a
#            DIFFERENT repo than the one this hook runs in — OR a bare PR number
#            (legacy format), which resolves against the current repo.
#
# Cross-repo gotcha (lesson from plugin PR #370): the state file lists PRs across
# multiple repos (the consumer repo, the a sibling plugin repo, docs, ...). Each `gh pr view`
# MUST pass `--repo <owner/repo>` parsed from the URL, otherwise a plugin PR #N
# is silently evaluated against the consumer repo #N (a different, often closed PR) and the
# gate false-blocks. Bare-number lines fall back to the repo the hook runs in.
#
# Contract:
#   - No state file            -> exit 0 (never block a normal session).
#   - All PRs green            -> delete the state file + exit 0.
#   - A PR draft / unreviewed / not APPROVED / carrying blocker|P1|P2 / with an
#     unparseable verdict -> exit 2 with a specific stderr message naming the PR
#     and what is missing (Stop-hook blocking API).
#   - gh / network failure     -> exit 0 with a warning (never block on infra).
#
# WHY FINDINGS AND NOT THE CONFIDENCE FLOAT (tracker issue)
#
# The gate used to require `Confidence: X.XX/5.00 >= threshold`. That float is a
# sample, not a property. Measured over 365 code-reviewer reviews across 78
# the consumer repo PRs (2026-07-29):
#
#   - On 73 commits reviewed more than once with an APPROVED verdict, the score
#     differed between runs on 33 of them (45%). PR #4056 scored 2.40 and 3.60 on
#     byte-identical code.
#   - The `floor`/`ceiling`/`base` fields of the `<!--confidence:{...}-->`
#     marker are NOT an independent signal: the band is a deterministic bucket of
#     the score (1 -> [1,1]; <4 -> [1,3.9]; <5 -> [4,4.9]; 5 -> [4.8,5]) and
#     `base == score` in 276 of 277 marked reviews. So the band wanders with the
#     point; it cannot stabilise the gate.
#   - The findings counts on those same 73 commits NEVER disagreed: 0 flips of
#     "0 blockers and 0 P1 and 0 P2" (0%).
#
# A float that moves 45% of the time makes a re-tag — a legitimate no-diff
# operation — into a way of passing the gate without changing anything, which is
# indistinguishable from having fixed something. Findings are a claim about
# content and did not move. So the gate asserts those.
#
# Reviewer-verdict gotchas baked in (lesson from PR #2612):
#   - The bot login is `code-reviewer` with NO `[bot]` suffix in the GraphQL
#     payload `gh pr view` returns. (The REST API spells the same account
#     `code-reviewer[bot]` — do not copy this matcher into a REST caller.)
#   - Its verdict lands in `.reviews[*]`, never `.comments[*]`.
#   - A review with an EMPTY body is an inline-comment container, not a verdict.
#     88 of those 365 reviews were empty-bodied, all of them COMMENTED, and 7
#     landed directly after the approving review on the same commit. Taking the
#     plain `last` review therefore false-blocks an approved PR. Empty-bodied
#     COMMENTED reviews are skipped; every other state is still honoured, so an
#     empty CHANGES_REQUESTED (never yet observed) would still block.

set -uo pipefail

REPO_ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
STATE_FILE="${REPO_ROOT}/.claude/.implement-prs"
REVIEWER_LOGIN="code-reviewer"

# 1. No state file -> never block.
if [[ ! -f "$STATE_FILE" ]]; then
  exit 0
fi

# 2. Required tooling. Missing jq/gh is infra, not a gate -> fail open.
if ! command -v jq >/dev/null 2>&1; then
  echo "[stop-prs-green] WARN: jq not found; not blocking." >&2
  exit 0
fi
if ! command -v gh >/dev/null 2>&1; then
  echo "[stop-prs-green] WARN: gh not found; not blocking." >&2
  exit 0
fi

# 3. Parse the advisory threshold (line 1) and PRs (line 2+).
ADVISORY_THRESHOLD=$(sed -n '1p' "$STATE_FILE" | tr -d '[:space:]')
if [[ ! "$ADVISORY_THRESHOLD" =~ ^[0-9]+(\.[0-9]+)?$ ]]; then
  ADVISORY_THRESHOLD=""
fi

# Repo the hook runs in — the fallback for legacy bare-number lines. Resolve via
# gh; if that fails (no auth / detached), assume the canonical the consumer repo repo so a
# legacy state file still resolves.
CURRENT_REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)
if [[ -z "$CURRENT_REPO" ]]; then
  CURRENT_REPO="unknown/unknown"
fi

# Parse each PR line into two parallel arrays: PR_REPOS[i] + PR_NUMBERS[i]. A
# line is EITHER a full PR URL (github.com/<owner>/<repo>/pull/<n>) — carrying
# its own repo — OR a bare number that resolves against CURRENT_REPO. Lines with
# no PR number at all are skipped.
PR_REPOS=()
PR_NUMBERS=()
while IFS= read -r line; do
  [[ -z "${line//[[:space:]]/}" ]] && continue
  if [[ "$line" =~ github\.com/([^/]+/[^/]+)/pull/([0-9]+) ]]; then
    PR_REPOS+=("${BASH_REMATCH[1]}")
    PR_NUMBERS+=("${BASH_REMATCH[2]}")
  elif [[ "$line" =~ ([0-9]+) ]]; then
    PR_REPOS+=("$CURRENT_REPO")
    PR_NUMBERS+=("${BASH_REMATCH[1]}")
  fi
done < <(sed -n '2,$p' "$STATE_FILE")

# No PRs recorded yet -> nothing to enforce, but the command owns cleanup.
if [[ ${#PR_NUMBERS[@]} -eq 0 ]]; then
  exit 0
fi

# block <pr> <reason> — emit a specific message and exit 2 (Stop blocking API).
block() {
  local pr="$1" reason="$2"
  echo "[stop-prs-green] BLOCKED: PR #${pr} ${reason}." >&2
  echo "  ready-to-review-mergeable requires every PR in ${STATE_FILE} to be" >&2
  echo "  non-draft and APPROVED by ${REVIEWER_LOGIN} with 0 blockers, 0 P1 and" >&2
  echo "  0 P2 findings. P3 and NITs do not block." >&2
  echo "  Read the bot findings, fix, push, and re-tag '@${REVIEWER_LOGIN} review'." >&2
  echo "  Re-tagging WITHOUT a fix cannot clear this gate: it asserts findings," >&2
  echo "  not the sampled Confidence float (tracker issue)." >&2
  exit 2
}

# count_severity <headline> <label-ere> — echo the count for a severity label,
# or 0 when the label is absent (the reviewer omits zero categories).
count_severity() {
  local headline="$1" label="$2" n
  n=$(grep -oiE "[0-9]+[[:space:]]*${label}" <<<"$headline" | head -1 | grep -oE '[0-9]+' | head -1)
  echo "${n:-0}"
}

for i in "${!PR_NUMBERS[@]}"; do
  pr="${PR_NUMBERS[$i]}"
  repo="${PR_REPOS[$i]}"

  # Fetch draft state + reviews from the PR's OWN repo. gh/network failure ->
  # fail open (no block).
  if ! PR_JSON=$(gh pr view "$pr" --repo "$repo" --json reviews,isDraft 2>/dev/null); then
    echo "[stop-prs-green] WARN: gh pr view ${repo}#${pr} failed; not blocking." >&2
    exit 0
  fi

  # Draft PRs are never "ready to review".
  IS_DRAFT=$(echo "$PR_JSON" | jq -r '.isDraft // false')
  if [[ "$IS_DRAFT" == "true" ]]; then
    block "$pr" "is still a Draft"
  fi

  # Latest VERDICT review from the reviewer bot, by submission order. Verdict
  # lives in .reviews[*], never .comments[*]. Guard against a null author
  # (deleted / ghost account) so `.author.login` never crashes jq. An
  # empty-bodied COMMENTED review is an inline-comment container carrying no
  # verdict — skip it rather than mistake it for a fresh opinion.
  LATEST_REVIEW=$(echo "$PR_JSON" | jq -c --arg login "$REVIEWER_LOGIN" '
    [ .reviews[]
      | select(.author != null and .author.login == $login)
      | select(((.body // "") | test("\\S")) or .state != "COMMENTED")
    ] | last // empty')
  if [[ -z "$LATEST_REVIEW" ]]; then
    block "$pr" "has no review from ${REVIEWER_LOGIN} yet"
  fi

  STATE=$(echo "$LATEST_REVIEW" | jq -r '.state // ""')
  if [[ "$STATE" != "APPROVED" ]]; then
    block "$pr" "latest ${REVIEWER_LOGIN} review is '${STATE}', not APPROVED"
  fi

  # The verdict headline is the reviewer's own summary line, one of:
  #   "Approved — no findings."
  #   "Approved — 0 blockers, 1 P2, 1 P3."
  # Both forms covered all 277 non-empty verdict bodies in the tracker issue sample.
  BODY=$(echo "$LATEST_REVIEW" | jq -r '.body // ""')
  HEADLINE=$(printf '%s\n' "$BODY" \
    | grep -m1 -iE '^(Approved|Comments|Changes requested|Blocked)[[:space:]]*—' || true)
  if [[ -z "$HEADLINE" ]]; then
    block "$pr" "review has no parseable verdict headline ('<verdict> — <findings>')"
  fi

  if grep -qiE '—[[:space:]]*no findings' <<<"$HEADLINE"; then
    BLOCKERS=0; P1=0; P2=0
  else
    # An explicit blocker count is REQUIRED. If the reviewer's format ever drops
    # it, treat the verdict as unparseable and block — never default to 0, which
    # would turn a format change into a silent pass.
    BLOCKERS=$(grep -oiE '[0-9]+[[:space:]]+blockers?' <<<"$HEADLINE" | head -1 | grep -oE '[0-9]+' | head -1)
    if [[ -z "$BLOCKERS" ]]; then
      block "$pr" "verdict headline '${HEADLINE}' has no blocker count; refusing to guess"
    fi
    P1=$(count_severity "$HEADLINE" 'P1\b')
    P2=$(count_severity "$HEADLINE" 'P2\b')
  fi

  if (( BLOCKERS > 0 || P1 > 0 || P2 > 0 )); then
    block "$pr" "is APPROVED but still reports ${BLOCKERS} blocker(s), ${P1} P1, ${P2} P2"
  fi

  # The Confidence float is reported, never gated on. Kept visible so a run that
  # would have failed the old threshold is still legible in the transcript.
  CONFIDENCE=$(grep -oiE 'Confidence:[[:space:]]*[0-9]+(\.[0-9]+)?' <<<"$BODY" | head -1 \
    | grep -oE '[0-9]+(\.[0-9]+)?' | head -1)
  echo "[stop-prs-green] PR #${pr}: APPROVED, 0 blockers/P1/P2 (advisory Confidence: ${CONFIDENCE:-n/a})." >&2
done

# All PRs green -> clear the gate and allow the stop.
rm -f "$STATE_FILE"
if [[ -n "$ADVISORY_THRESHOLD" ]]; then
  echo "[stop-prs-green] NOTE: threshold ${ADVISORY_THRESHOLD} in ${STATE_FILE} is advisory since tracker issue and did not gate." >&2
fi
echo "[stop-prs-green] All PRs APPROVED with 0 blockers, 0 P1, 0 P2. Gate cleared." >&2
exit 0
