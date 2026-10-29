#!/usr/bin/env bash
# git pre-push guard — block push/merge to main without HITL human approval.
# Format mirrors shared/hooks/stderr/adapters/claude-pre-bash.sh (bash, set -u,
# exit 2 = block, exit 0 = fail-open). Blocking exit: 2.
set -u

# Global kill switches (same family as stderr hooks)
if [ "${MNM_DISABLE_GIT_HOOK:-0}" = "1" ]; then
  exit 0
fi

# ---- no-squash gate (STRICT — no bypass via HITL marker/env) ----
# Squash merges are forbidden repo-wide: `--squash` collapses commit history and
# per-commit review comments. This gate runs before the HITL bypass so no human
# approval can re-enable a squash. The command is read from the environment
# (set by harness adapters: MNM_GIT_COMMAND) or defaulted to a merge target.
# When only PR numbers are given (gh pr merge <n>), the adapter detects the
# squash flag earlier; this gate's job is to catch the raw `git merge --squash`
# and `gh pr merge --squash` forms during a push.
NO_SQUASH_CMD="${MNM_GIT_COMMAND:-}"
if [ -n "$NO_SQUASH_CMD" ]; then
  if printf '%s' "$NO_SQUASH_CMD" | grep -qE -- '(^|[[:space:]|&;(])--squash([[:space:]]|$)'; then
    echo "[pre-push-guard] BLOCKED: squash merges are forbidden (--squash collapses history + comments). Use --merge/--rebase." >&2
    exit 2
  fi
fi

# HITL bypass: human-approved marker or explicit env flag (pkexec/GetCredentials-style prompt is the human action)
HITL_MARKER="${XDG_CACHE_HOME:-${HOME}/.cache}/better-toolkits/hitl-approve-main-push"
if [ "${HITL_APPROVED:-0}" = "1" ]; then
  exit 0
fi
if [ -f "$HITL_MARKER" ]; then
  exit 0
fi

# Target ref (pre-push stdin: <local ref> <local sha> <remote ref> <remote sha>;
# PreToolUse Bash: env MNM_GIT_TARGET, e.g. "refs/heads/main" or "main")
TARGET="${MNM_GIT_TARGET:-}"

if [ -z "$TARGET" ]; then
  TARGET="${1:-}"
fi

if [ -z "$TARGET" ]; then
  echo "[pre-push-guard] FAIL-OPEN: no target ref — cannot prove intent." >&2
  exit 0
fi

if [ "$TARGET" = "refs/heads/main" ] || [ "$TARGET" = "refs/heads/master" ] || [ "$TARGET" = "main" ] || [ "$TARGET" = "master" ]; then
  echo "[pre-push-guard] BLOCKED: push/merge to '${TARGET}' requires HITL human approval." >&2
  echo "[pre-push-guard] Bypass: set HITL_APPROVED=1 or create ${HITL_MARKER} via human action (pkexec/GetCredentials-style)." >&2
  exit 2
fi
exit 0
