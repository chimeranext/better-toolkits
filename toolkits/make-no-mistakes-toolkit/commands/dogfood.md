---
description: "Dogfooding verification — /ready-to-review-mergeable #128 step-by-step evidence. Reads restrictions JSON, checks protocol.md Evidence format, verifies no stale /home/kvttvrsis refs in PR files, validates MCP load, exits 1 if any PENDING or stale hardcode remaining."
argument-hint: "[--check-all]"
priority: 85
---
# /dogfood

Verification for /ready-to-review-mergeable SSOT (no summaries; step-by-step only).

Steps:
1. `restrictions-check-ready-to-review-mergeable.sh` passes (`exit 0`; `0 PENDING`; `§3b PASS`; `§3c BLOCKED`; `§5 BLOCKED`).
2. `protocol.md` contains `Evidence format` section + `SSOT correction note`.
3. No stale `/home/kvttvrsis` hardcodes in repo source (only `.git/`, caches excluded).
4. `commands/ready-to-review-mergeable.md` thin (no data-heavy #128 content).
5. `opencode.json` points `google-workspace-apps-mcp` → `shared/` (not `media-buyer-toolkit/`).
6. `shared/google-workspace-apps-mcp/` exists with `google.ts` + `.env` (`REPLACE_WITH_*`).
7. `google-workspace-apps-mcp` plugin loads (`import()` validates; `media-buyer.google` ID).
8. `§3b` executed; `§4a` documented; `§4b` executed; `§5` BLOCKED; `NEVER merge`.

If any step fails → BLOCKED; do not claim ready.
