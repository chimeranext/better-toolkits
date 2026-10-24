---
created: 2026-10-16 14:35
session_topic: OTel assurance conventions + session-replay UX + PR #93/#95
branch: feat/94-otel-ux-replay
status: pending
---

# Next Day: OTel assurance conventions + session-replay UX

## Done
- `/opsx-propose` plan written to `~/.opencode/plan/otel-ux-replay-proposal.md` (OTel LGTM, PostHog, replay-as-UX-method).
- `/opsx-apply` executed: `platform/observability` record (SDK pair pinned 0.12.0 — README claimed ^1.0.0, pub.dev API says 0.12.0), dart S3+D7, `sre-observability-stack` pointer, `session-replay` skill + protocol, peek/peek-pro as Flutter context (not RULES: 4 stars, single maintainer).
- Issue #94 + PR #95 → **MERGED, issue CLOSED**.
- PR #93 reviewed (REQUEST_CHANGES posted as comment: stale body vs clean renames, split gemini alias, unchecked test plan).
- `/refresh-better-toolkits-cache` created on PR #93 branch: update-only, Cursor CLI + Desktop UI as independent targets (screenshots proved no Refresh button — Remove+Add), forum pinning-bug URLs cited. Commit messages fixed to English.
- Verified: PostHog replay + Flutter support in self-host (same product, MIT compose, unsupported/hobby caveats); dartastic 0.12.0/Apache-2.0/160pts; Cursor forum pinning threads (200s).
- Decisions: prune ≠ refresh (separate, refresh never purges); CLI ≠ Desktop source-of-truth; RUM/Symbolizer out as gates; SaaS replay options-only; Mimir default over Thanos.

## In Progress
- PR #93 OPEN (review posted; refresh command pushed to its branch `chore/prune-better-toolkits-cache`).
  - Branch: `chore/prune-better-toolkits-cache`
- Uncommitted changes in THIS checkout NOT mine (another agent active — do not touch):
  `marketplace.json`, `shared/bootstrap/cli/{lib/audit.js,lib/mcp.js,test/cli.test.js}`,
  `setup-opencode.md`, `instructional-design-toolkit/plugin.json` + new `notion-recursive-fetch` files.
- OTel dogfood pending: sample with OTLP to local collector (recorded in record RECEIPT).

## Pending (Not Started)
- [ ] PR #73 Heimdall key:migrate/models:free — CI status + merge decision.
- [ ] PR #78 conventions — check merged/state.
- [ ] jev-router eval — blocked, no keys (user-side).
- [ ] MQTT/VRTV Linear filing — user-side (needs auth).
- [ ] OQ3 Zephyr P4 support verification.
- [ ] Elixir dogfood completion (was blocked on toolchain; podman image pulled — check.
  Worktree: `.agents/worktrees/elixir-dogfood`).
- [ ] Worktree `77-conventions-exemplars`: 19 uncommitted foreign files — ownership unresolved.
- [ ] Vertivo monorepo: edge-firmware + MQTT drafts + i2c JSON migration state unverified this turn.

## Resume Instructions

To continue this work:

1. `cd /home/kvttvrsis/Documentos/GitHub/chimeranext/better-toolkits` — check who owns the uncommitted changes before touching them.
2. Check PR #93 state (may need rebase after #95 merge).
3. Highest-value next: OTel dogfood (OTLP collector sample) or PR #73 merge.

### Key Files
- `shared/references/conventions/platform/observability/README.md` — OTel record (pins, LGTM, L1 lesson).
- `toolkits/ux-research-toolkit/skills/session-replay/SKILL.md` + `references/session-replay/protocol.md` — UX method.
- `shared/bootstrap/commands/refresh-better-toolkits-cache.md` — on PR #93 branch, not main.
- `~/.opencode/plan/otel-ux-replay-proposal.md` — approved proposal.

### Key Context
- Commit messages and PR bodies in English (repo convention); user corrected a Spanish commit once.
- Shell hook forbids ANY `2>/dev/null`-like text (even `2>&1`) — use `|| true` guards or dedicated tools.
- `gh pr create --body` with inline literals gets blocked — always `--body-file`.
- OpenCode skills register per toolkit dir in `opencode.json` (auto-discovered).
- Cursor agent co-works in this repo (commits "Made with Cursor"); coordinate branches/worktrees, never switch primary checkout.

## Git State
- Branch: `feat/94-otel-ux-replay`
- Uncommitted changes: yes — NOT mine (see In Progress; leave alone).
- Stashes: 3 (resolve-oq backups on other branches — not mine).
- Open worktrees: 77-conventions-exemplars, chore-prune-merge, chore-refresh-cache, elixir-dogfood, feat-94-merge, pr93-heimdall-rebase.

## Linear Issues
- None in this repo (GitHub Issues only). #94 CLOSED, PR #95 MERGED (verified via gh).

## Session Log (Compressed)
Session started in Plan mode: discussed OTel/Dart assurance proposal (verified dartastic 0.12.0 vs README's ^1.0.0 claim), PostHog replay + self-host (verified, with unsupported/hobby caveats), reframed replay as UX method, debated Maestro/RUM scope, added Grafana LGTM URLs and Flutter building blocks. User invoked /opsx-propose → plan file written (only allowed path in Plan mode). Plan mode lifted → user approved /opsx-apply → implemented on feat/94-otel-ux-replay (issue #94, PR #95, marketplace bumps 2.1.3/0.1.7, gates green). Then reviewed PR #93 (found body-vs-diff contradiction, gemini scope creep), created /refresh command, corrected CLI/Desktop assumption with screenshots + forum evidence, fixed Spanish commit msg. Peek/peek-pro added as Flutter context. Discovered environment churn: PR #95 merged, foreign uncommitted changes in checkout, Cursor agent active in parallel.
