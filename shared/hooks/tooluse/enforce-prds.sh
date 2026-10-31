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
if printf '%s' "$CMD" | grep -qE -- '--body-file[ =]+[^ ]+'; then
  FILE=$(printf '%s' "$CMD" | sed -nE 's/.*--body-file[ =]+([^ ]+).*/\1/p')
  [ -f "$FILE" ] && BODY="$(cat "$FILE")"
elif printf '%s' "$CMD" | grep -qE -- '--body[ =]+.+'; then
  BODY=$(printf '%s' "$CMD" | sed -nE 's/.*--body[ =]+(.*)$/\1/p')
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
