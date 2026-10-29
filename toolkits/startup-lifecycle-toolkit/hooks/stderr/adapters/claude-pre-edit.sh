#!/usr/bin/env bash
# pre-edit hook — block stderr redirect + decorative echoes before file mutation
# Part of /dogfood SSOT enforcement (shared/hooks/stderr/adapters/)
if echo "${CLAUDE_PREWRITE_CMD:-}" | grep -qE '2>/dev/null|2> /dev/null|2>>/dev/null|&>/dev/null'; then
  echo "[HOOK] PROHIBITED: stderr redirect (2>/dev/null) in edit command." >&2
  exit 2
fi
if echo "$*" | grep -qE 'echo\s+"={3,}|echo\s+"-{3,}'; then
  echo "[HOOK] PROHIBITED: decorative echo separator. Lead with action; suppress tangents." >&2
  exit 2
fi
# /dogfood SSOT enforcement — verify no stale hardcodes in edited content; protocol.md present; restrictions pass
if [ -f "restrictions-ready-to-review-mergeable.json" ]; then
  HAS_PENDING=$(python3 -c 'import json; r=json.load(open("restrictions-ready-to-review-mergeable.json")); print(1 if any(v=="PENDING" for v in r.get("verified_states",{}).values()) else 0)') || HAS_PENDING=1
  if [ "${HAS_PENDING}" = "1" ]; then
    echo "[HOOK] PROHIBITED: PENDING steps in restrictions (edit blocked until §3b/§3c/§5 resolved). No skip." >&2
    exit 2
  fi
fi
if grep -q '/home/kvttvrsis' toolkits/make-no-mistakes-toolkit/references/ready-to-review-mergeable/protocol.md; then
  echo "[HOOK] PROHIBITED: stale /home/kvttvrsis hardcode in protocol.md (must use ~/.local/~.opencode)." >&2
  exit 2
fi
exit 0
