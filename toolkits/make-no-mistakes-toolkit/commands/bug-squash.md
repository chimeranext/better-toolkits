# /bug-squash — Bug-squash protocol (generalized)

Source spec: `openspec/changes/2026-09-09-generalize-bug-squash/specs/bug-squash/spec.md`

## Protocol (SSOT)
- Single environment per round (`environment`, `baseUrl` fixed in `round.md`).
- Multi-env = separate rounds (`round-001`, `round-002`).
- Mid-round environment switch forbidden (refuse + instruct close/new round).
- Environment resolved before Chrome DevTools MCP (`bug-squash.config.json` loaded; bootstrap `setup-init.md` if missing).
- `writesAllowed` false → requires human `.write-armed`; `$MNM_QA_ORIGIN` must match `Base URL`.
- Prod opt-in only (`environments.prod.enabled: false` by default).
- Waivers cite ID/expiry/approver; do NOT authorize environment change inside active round.
- `round.md` header v2 (Environment, Base URL, Round ID, Ref, Operator, Status, HITL coverage); NO `Hops:` / `Current hop:`.
- Close gate: Traceability, Currency, Gap analysis, Accountability, Not executed (non-placeholder).

## Setup
If `bug-squash.config.json` missing: run `references/bug-squash/setup-init.md` (bootstrap from template, confirm URLs, never enable prod by default).

## Reference
- Concrete instance: `shared/references/google-workspace-apps-mcp-dogfood.md` (separate from `/dogfood` protocol).
- Protocol generic: `toolkits/make-no-mistakes-toolkit/references/dogfood/protocol.md`.
