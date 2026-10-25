---
description: Scan the local OpenCode SQLite DB (session, session_message, session_v2) and report real recovered sessions — evidence-only, never invents content. Wraps scripts/recover-opencode-sessions.sh.
argument-hint: "[no arguments]"
priority: 70
---

# /recover-opencode-sessions

Read and follow [`scripts/recover-opencode-sessions.sh`](../../../../scripts/recover-opencode-sessions.sh).

1. Verify DB exists: `~/.local/share/opencode/opencode.db` (script exits 1 with real evidence if absent — never fabricate sessions).
2. Run `bash scripts/recover-opencode-sessions.sh` — it queries `sqlite_master`, then `session`, `session_message`, `session_v2` via python3 (stdlib only).
3. Report ONLY rows returned by the DB (session IDs, titles, message counts). No invented content; missing DB = evidence of absence, not a guess.

Anti-triggers: no `2>/dev/null` suppression in commands you compose; no decorative echo; output is the raw script report.
