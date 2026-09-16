# Design — shared/bootstrap + /toolkits-initial-setup

**Change:** `2026-09-16-shared-bootstrap-toolkits-initial-setup`
**Domain:** `area:meta`
**Status:** Proposed

## Problem

1. **Bootstrap paradox:** setup cannot live inside a product toolkit — the command is unavailable
   until that toolkit is installed.
2. **Legacy OpenCode path:** `npx @lapc506/make-no-mistakes install` covers one toolkit under a
   personal npm scope, not the `chimeranext/better-toolkits` monorepo.
3. **Fragmented harness docs:** Cursor stderr, OpenCode `opencode.jsonc`, and Claude plugin hooks are
   documented separately without consent-first merge.

## Decision

### D1 — Location: `shared/bootstrap/`, not `toolkits/` or root `platform/`

| Path | Role |
|------|------|
| `shared/hooks/stderr/` | Runtime library (existing) — vendored/wired by plugins |
| `shared/bootstrap/` | Installable bootstrap **plugin** + CLI — marketplace entry |

Reuses the `shared/` convention for cross-cutting concerns.

### D2 — Marketplace plugin `better-toolkits-bootstrap`

- Registered in `.claude-plugin/marketplace.json` with `source: "./shared/bootstrap"`.
- **First install** after `claude plugin marketplace add chimeranext/better-toolkits`.
- Ships `/toolkits-initial-setup` and stderr hooks (via `../hooks/stderr` relative path).

### D3 — Protocol SSOT + thin entry (multi-harness)

```
shared/bootstrap/
├── .claude-plugin/plugin.json
├── commands/toolkits-initial-setup.md          # thin
├── references/toolkits-initial-setup/
│   ├── protocol.md                             # SSOT
│   └── adapters/{cursor,claude,opencode}.md
├── hooks/hooks.json                            # stderr → shared/hooks/stderr
└── cli/                                        # @chimeranext/better-toolkits (stub → full)
```

Cursor monorepo dev: `.cursor/commands/toolkits-initial-setup.md` points at protocol.

### D4 — HITL phases (mandatory)

1. **Detect** — active harness(es).
2. **Audit** — marketplace registered, bootstrap installed, product plugins, stderr hooks.
3. **Propose** — show diffs (`hooks.json`, `opencode.jsonc`, plugin list).
4. **Ask** — no writes without explicit human OK ([`docs/hitl.md`](../../../docs/hitl.md)).
5. **Install** — merge idempotent; never clobber unrelated hooks.
6. **Verify** — `doctor`, marketplace list, stderr probe.

### D5 — Cursor marketplace auto-update (optional)

- Not a separate slash command.
- Adapter `cursor.md` offers checkbox: register `workspaceOpen` → `update-better-toolkits-marketplace.sh`.
- Default **off** until user opts in.

### D6 — Deprecate `@lapc506/make-no-mistakes install`

- README surfaces `@chimeranext/better-toolkits setup` + bootstrap plugin.
- Per-toolkit `npx … install` remains until package rename olas (out of scope).

## Risks

| Risk | Mitigation |
|------|------------|
| Users skip bootstrap, install MNM directly | README: “install bootstrap first”; audit phase detects missing bootstrap |
| CLI unpublished | Document clone + plugin path; CLI stub prints next steps |
| Duplicate marketplace registrations | Audit phase detects duplicate `gitUrl` entries |
