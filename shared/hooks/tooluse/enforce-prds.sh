#!/usr/bin/env bash
# Pre-tool-use guard: local deterministic PRDS enforcement.
#
# Intercepts `gh pr create` / `gh pr edit`. If the PR body (from --body or
# --body-file) does not contain the mandatory PRDS sections, the tool use is
# BLOCKED (exit 1) and the operator must redraft — no exceptions.
set -u

CMD="$*"
case "$CMD" in
  *"gh pr create"*|*"gh pr edit"*) ;;
  *) exit 0 ;;
esac

# Extract body: --body <text> or --body-file <path> (crude but deterministic)
BODY=""
if [[ "$CMD" =~ --body-file[ =]+([^ ]+) ]]; then
  FILE="${BASH_REMATCH[1]}"
  [ -f "$FILE" ] && BODY="$(cat "$FILE")"
elif [[ "$CMD" =~ --body[ =]+(.+)$ ]]; then
  BODY="${BASH_REMATCH[1]}"
fi

MISSING=0
for section in "## Summary" "## Tracker" "## Test plan" "## Scope boundaries"; do
  if ! printf '%s' "$BODY" | grep -qF "$section"; then
    echo "[prds-local] missing section: $section" >&2
    MISSING=1
  fi
done

if [ "$MISSING" -ne 0 ]; then
  echo "[prds-local] BLOCKED: redraft the PR description with Summary/Tracker/Test plan/Scope." >&2
  exit 1
fi
exit 0
