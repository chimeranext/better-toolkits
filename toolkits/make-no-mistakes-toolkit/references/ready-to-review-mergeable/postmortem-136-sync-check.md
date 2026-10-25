# Postmortem — sync-and-check Persistent Failure (PR #136 / Issue #135)

**Incident:** Remote automated review (`sync-and-check`) fails persistently on PR #136 (`refactor/135-gws-rename`). Retry (re-run) produces identical result (same action URL 40159437131, 7s duration) — confirms non-transient governance/versioning artifact, not behavioral regression.

**Evidence source:** `/ready-to-review-mergeable` protocol evidence (`135-gws-catalog-evidence.md`): catalog 5 tools PASS, auth rotation PASS, protocol English PASS, guard HITL PASS, remote check FAIL.

**Root cause (5th why):** The code feature (rename folder/script, add full 5-tool MCP catalog, add rotation script, add guard) works correctly. The failure lives in the governance/versioning layer — likely missing or incomplete semver bump in `.claude-plugin/marketplace.json` / toolkit `plugin.json` / `package.json`, or uncleaned deprecated references from the rename (delete `rust-wrapper` + `dogfood` ref + path updates across 13 files). Per repo SSOT (§AGENTS.md: marketplace versioning), the `pre-push` gate (`marketplace_versioning.py`) is designed for pushes to `main`, not PR creation; because the branch was created via `git worktree add`, `.git/hooks/` was not inherited, so the version inconsistency slipped to the remote bot.

**Impact:** No code behavior broken. No user-facing regression (auth rotation works, upload works, 5-tool catalog works). Impact is process: merge blocked until version/sync gate resolved.

**Fix action plan:**
1. Verify version bumps (`python3 scripts/ci/marketplace_versioning.py write --range origin/main..HEAD`).
2. Confirm deprecated shims removed (`check_no_stale_deprecated_shims.py` PASS).
3. Confirm worktree removal (`.agents/worktrees/135-gws-rename`) scheduled for post-merge (HITL).
4. Confirm `/secret-clear` executed (done — `mnm-secret` cleared).
5. Request human review approval; only then consider merge (with HITL guard `HITL_APPROVED=1` or marker file).

**Protocol invariant preserved:** Exit of `/ready-to-review-mergeable` = human handoff. No merge authorization granted. No Linear Done.
