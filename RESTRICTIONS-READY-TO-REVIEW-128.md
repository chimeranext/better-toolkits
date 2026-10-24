# RESTRICTION — /ready-to-review-mergeable #128
# Source: toolkits/make-no-mistakes-toolkit/references/ready-to-review-mergeable/protocol.md
# Enforced: every step must be explicitly marked [PASS] before next.

STEPS = ["§1", "§2", "§2b-testing", "§2b-security", "§2b-governance", "§2b-liveness", "§2c", "§3a", "§3b", "§3c", "§5"]
BLOCKED = []  # filled at runtime; any missing = BLOCKED

HARDCODED RULES (cannot skip):
- No §2b without §2 implement Phase 3 step 12.
- No §2c without §2b PASS (all 4 pillars that apply).
- No §3 without §2b PASS.
- No §5 without §3 gate green or §4a documented.
- No inference of issue ID from branch (AGENTS.md: GitHub Issues #N).
- Remote unavailable does NOT allow §5 via §4b (only §4a when §3 unavailable).

VERIFIED FOR #128:
§1 PASS (issue #128, GitHub, AGENTS.md)
§2 PASS (implement Phase 3 step 12, worktree isolated, push 88e0b47)
§2b-testing PASS (test-suite.json)
§2b-security PASS (enum REPLACE_WITH_*, stderr hook active, .env prompt-only)
§2b-governance PASS (opencode.json correct, skills reference updated)
§2b-liveness SKIP (default per protocol; not required)
§2c PASS (test-suite.json written, /assurance:e2e-test-builder, NOT runner)
§3a PASS (PR exists, branch ready-to-review-mergeable)
§3b PENDING (bot tag @greptile / CodeRabbit required)
§3c PENDING (requires §3b verdict APPROVED + 0 blockers)
§5 BLOCKED (requires §3c = yes; NEVER merge / NEVER Done)

ANY ATTEMPT TO SKIP A PENDING STEP IS REJECTED BY THIS FILE.
