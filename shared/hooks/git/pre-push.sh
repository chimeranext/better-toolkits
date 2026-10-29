#!/usr/bin/env bash
# git pre-push guard — block push/merge to main without HITL human approval.
# Deterministic: approval is a ROOT-OWNED marker file, only creatable via
# sudo/pkexec (human password). There is NO env-var bypass — an unprivileged
# agent (uid != 0) cannot self-approve.
#
# Format mirrors shared/hooks/stderr/adapters/claude-pre-bash.sh (bash, set -u,
# exit 2 = block, exit 0 = fail-open). Blocking exit: 2.
set -u

# Global kill switches (same family as stderr hooks)
if [ "${MNM_DISABLE_GIT_HOOK:-0}" = "1" ]; then
  exit 0
fi

# ---- no-squash gate (STRICT — no bypass via HITL marker/env) ----
# Squash merges are forbidden repo-wide: `--squash` collapses commit history and
# per-commit review comments. This gate runs before the HITL check.
NO_SQUASH_CMD="${MNM_GIT_COMMAND:-}"
if [ -n "$NO_SQUASH_CMD" ]; then
  if printf '%s' "$NO_SQUASH_CMD" | grep -qE -- '(^|[[:space:]|&;(])--squash([[:space:]]|$)'; then
    echo "[pre-push-guard] BLOCKED: squash merges are forbidden (--squash collapses history + comments). Use --merge/--rebase." >&2
    exit 2
  fi
fi

# ---- HITL gate (DETERMINISTIC) ----
# Approval marker must exist AND be owned by root (uid 0). Only a human action
# via sudo/pkexec (password) can create it. An agent running as uid != 0 cannot.
HITL_MARKER="${XDG_CACHE_HOME:-${HOME}/.cache}/better-toolkits/hitl-approve-main-push"
APPROVED=0
if [ -f "$HITL_MARKER" ]; then
  OWNER_UID="$(stat -c %u "$HITL_MARKER")"
  if [ "$OWNER_UID" = "0" ]; then
    APPROVED=1
  fi
fi
if [ "$APPROVED" = "1" ]; then
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
  echo "[pre-push-guard] Run (as the human, sudo will prompt for your password):" >&2
  echo "[pre-push-guard]   scripts/git-hooks/hitl-approve-main-push.sh" >&2
  echo "[pre-push-guard] The marker must be root-owned (uid 0); env vars like" >&2
  echo "[pre-push-guard] HITL_APPROVED are NOT accepted (non-deterministic)." >&2
  exit 2
fi
exit 0
