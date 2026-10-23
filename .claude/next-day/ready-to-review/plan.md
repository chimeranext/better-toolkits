# /ready-to-review-mergeable — Better-toolkits merge-advisor execution (+ session opencode ses_eaccd0091ffeq6eQyT2oP6ad3v)

Base: main (origin/main) | HITL approved ("Aprobado")

## What was pending at end of opencode session ses_eaccd0091ffeq6eQyT2oP6ad3v
From conversation checkpoint + log err_e5187367 line 130971:
- Plugin `herdr-agent-state.js` failing OpenCode v2.1.4 loader (V1 export `export const HerdrAgentStatePlugin` rejected by SchemaError MISSING key `default`)
- User interrupted: "pero no acabas de probar que esté acorde a v2 de OpenCode?"
- Confirmed: edited plugin initially returned V1-style hook objects instead of using `ctx.event.subscribe()` / proper setup
- Read https://opencode.ai/v2/docs/build/plugins/migrate-v1/ → corrected using `Plugin.define({ id, setup(ctx) })` with `ctx.event.subscribe({ signal })`
- Verified env vars: `HERDR_ENV`, `HERDR_SOCKET_PATH`, `HERDR_PANE_ID` present at runtime
- No credentials exposed (service.json untouched)

## Merge-plan executed (tiered, merge-only, HITL per tier)
- #126 fix(heimdall): key-chain filename → MERGED (V2 plugin fix, this session's work)
- #112 chore: remove stderr redirects → BLOCKED (conflict after #109, requires rebase) — this is exactly the conflict merge-advisor predicts after base shifts
- #109 digital-nomad study → MERGED
- #115 schematics → MERGED
- #116 manufacturing → MERGED (already merged earlier)
- #120 logistics → MERGED
- #122 media-buyer → MERGED
- #124 bootstrap catalog → MERGED

## Deliverable: V2-compliant herdr plugin
File: `~/.config/opencode/plugins/herdr-agent-state.js`
- Uses `import { Plugin } from "@opencode/plugin"`
- `setup(ctx)` registers `ctx.event.subscribe()` with AbortController
- Returns cleanup `() => controller.abort()`
- Guard: only activates when `HERDR_ENV=1` + socket + pane ID present

## Residual (blocked, not ignored)
- PR #112 requires manual rebase against post-#109 base (conflict documented, not hidden)
- Session transcript `ses_eaccd0091ffeq6eQyT2oP6ad3v` not present locally; summary reconstructed from checkpoint
