# Design — Multi-harness SSOT + stderr baseline

**Change:** `2026-08-20-multi-harness-ssot`
**Domain:** `area:meta`
**Status:** Proposed

## Problem

1. Protocol knowledge is trapped in fat `commands/*.md` (and duplicated Bilingual
   templates), so harnesses that surface skills (Cursor) or CLI adapters
   (OpenCode2 / Antigravity) cannot share one HOW without copy-paste.
2. Stderr enforcement is harness-global but **install-local**: only MNM’s
   `hooks.json` (and manual Cursor/OpenCode wiring) registers it. Other toolkits’
   commands run unprotected if MNM is absent.
3. Treating “multi-harness” as Cursor-vs-Claude hides the real product goal:
   one protocol, N entries; one detector, N wire-ups.

## Decision

### D1 — Two SSOTs, never merged

| SSOT | Location | Consumed by | Not |
|------|----------|-------------|-----|
| Protocol | `toolkits/<tk>/references/<cmd-or-domain>/` + `templates/` | Thin entries | Runtime hooks |
| Runtime stderr | `shared/hooks/stderr/` (`detect.py` + adapters) | Every toolkit `hooks.json` / OpenCode merge / Cursor hooks | Per-command markdown |

### D2 — Thin entry contract

Entry ≤ ~120 lines: frontmatter, purpose, Phase→file table, `Read and follow`.
No second protocol body per harness. Harness-specific notes go in
`references/.../adapters/` or entry footnotes.

### D3 — Stderr wire-up on every toolkit (no detect.py clones)

Extract current MNM `hooks/stderr/` → `shared/hooks/stderr/`.
MNM and others reference it. Each Claude plugin `hooks/hooks.json` adds Bash →
claude adapter (aaarrr keeps spend-safety **and** adds stderr).
Opt-out unchanged: `MNM_DISABLE_STDERR_HOOK`, `stderr-hooks.json`, OpenCode disable plugin.

### D4 — OpenCode on all toolkits with agent/shell surface

Extend or add `merge-opencode-config` (pattern from MNM / app-gtm / atomic /
business-model) so stderr plugin is always registered. Docs-only is insufficient
for “sin excepción”.

### D5 — Migration by olas (behavior-preserving)

- Ola 0: `/implement` + bilingual templates + contract doc (protocol pilot).
- Ola 0b/0c: shared stderr + all wire-ups + OpenCode gaps.
- Olas 1–4: fat command splits per toolkit inventory (MNM → OpenCode-ready →
  IDT/aaarrr → Claude-only/skills).

### D6 — OpenSpec is the plan

Cursor plan files are navigation only. Durable HOW lives in this change folder.
First commit on implementation branch: `docs(openspec): 2026-08-20-multi-harness-ssot`.

## Rejected alternatives

| Alternative | Why rejected |
|-------------|--------------|
| Cursor-only skill rewrite, leave Claude commands fat | Reintroduces dichotomy; OpenCode2/Antigravity still orphaned |
| Copy detect.py into each toolkit | Drift; 10 bugfix sites |
| Docs-first stderr only | Fails “solo IDT instalado” criterion |
| One mega-PR splitting all fat cmds | Unreviewable; blocks legal PR #4 |
| Rename plugins to expose `/make-no-mistakes` | Wrong UX; protocol name stays `implement` |
| Merge stderr into protocol markdown | Wrong layer; hooks must see raw shell before model prose |

## Pilot detail — `/implement` + Bilingual

- `references/implement/*.md` = phase/concern SSOT.
- `commands/implement.md` + `skills/implement/SKILL.md` +
  `references/implement/adapters/{opencode,antigravity,README}.md`.
- `templates/bilingual-issue-brief.md`; `docs/bilingual-format-standard.md` =
  markers/stubs only; spike/spec retarget.

## Verification (design-level)

- `python3 shared/hooks/stderr/detect.py --command 'x 2>/dev/null'` → exit 2
  in a session with only non-MNM toolkit wired.
- `rg` proves spike no longer embeds full HUMAN LAYER template.
- Implement orchestrator lists every `references/implement/*.md` file.
