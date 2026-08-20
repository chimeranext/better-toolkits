# Tasks — 2026-08-20-multi-harness-ssot

Change: `2026-08-20-multi-harness-ssot` · Domain: `area:meta` · Spec: `design.md` · Proposal UML: `proposal.md`

## Phase A — OpenSpec materialization

- [x] Write `openspec/changes/2026-08-20-multi-harness-ssot/proposal.md` (incl. Mermaid UML vertical)
- [x] Write `design.md` and `tasks.md`
- [x] Commit `docs(openspec): 2026-08-20-multi-harness-ssot` as first commit on working branch
- [x] Open/link GitHub Issue `area:meta` citing this change

## Phase B — Ola 0 protocol (implement + bilingual)

- [x] Create `toolkits/make-no-mistakes-toolkit/references/implement/*.md` (split from `commands/implement.md`)
- [x] Thin `commands/implement.md` orchestrator
- [x] Add `skills/implement/SKILL.md`; point `implement-advisor` at SSOT
- [x] Add `references/implement/adapters/{README,opencode,antigravity}.md`
- [x] Create `templates/bilingual-issue-brief.md`; retarget docs + spike/spec-recommend + README
- [x] Ensure `package.json` `files` includes `templates/`
- [x] Write `docs/multi-harness-ssot.md` (both SSOTs + harness matrix)

## Phase C — Ola 0b stderr shared + wire-up

- [x] Create `shared/hooks/stderr/` from MNM stderr (detect.py, adapters, tests, README)
- [x] Retarget MNM `hooks.json` + adapters to shared path (compat shim OK short-term)
- [x] Add/update `hooks/hooks.json` on **every** toolkit plugin to register stderr Bash matcher
- [x] Cursor + Antigravity/Codex docs in shared README matrix
- [x] Verification: only-aaarrr / only-IDT session blocks `2>/dev/null`

## Phase D — Ola 0c OpenCode everywhere

- [x] Inventory toolkits missing OpenCode install
- [x] Add minimal merge-config + stderr plugin registration to each
- [x] Document install in each toolkit README

## Phase E — Olas 1–4 protocol splits

- [x] Ola 1: MNM fat cmds → `references/<cmd>/`
- [x] Ola 2: app-gtm `ship-*`, atomic fat audits, business-model `linear-projects-setup`
- [x] Ola 3: IDT write-*/research/storyboard; aaarrr launch + landing-instrument
- [x] Ola 4: fractional/launchpad/ux matrix; venture-studio skill bodies → references where protocol-sized

## Validation

- [x] `bash shared/hooks/stderr/tests/test-detect.sh` (or moved path) green
- [x] No fat reintroduction: new protocol edits go to `references/`, not entry blobs
- [ ] Archive this change to `openspec/changes/archive/` when olas complete (or archive per-ola sub-changes if split)

## Out of scope (do not check off here)

- Package/slug renames
- Mandatory prod-write without consumer JSON
