# Bilingual Issue Brief (BIB)

Portable rule for **every** issue opened in any tracker — **GitHub Issues or
Linear** — regardless of which team owns the repo. A well-formed issue is
readable by humans AND executable by AI agents.

**Provenance:** Field-hardened after issue #177 was opened without the bilingual
layer (better-toolkits, 2026-11-01). The rule previously lived only in
requirements-authoring (Linear-scoped) and in prose inside
`references/implement/redaction-guard.md` — neither was deterministic nor
tracker-agnostic.

---

## What is the Bilingual Format?

A Bilingual Issue Brief is a Markdown issue body that separates two voices:

- **Human Layer (`## 👤 HUMAN LAYER`)** — plain language: user story, background/why, analogy, UX/visual reference, known pitfalls.
- **Agent Layer (`## 🤖 AGENT LAYER`)** — precision: objective, context files, acceptance criteria, technical constraints, verification commands, agent strategy.

Canonical fill-in template: `toolkits/make-no-mistakes-toolkit/templates/bilingual-issue-brief.md`.
Marker/stub SSOT: `toolkits/make-no-mistakes-toolkit/docs/bilingual-format-standard.md`.

---

## Requirement: redact BEFORE opening

- **Apply before opening the issue** — not after. The body must already be in
  Bilingual Format when the issue is created or edited.
- **Both trackers:** the same rule applies to GitHub Issues and to Linear.
  There is no "GitHub is exempt" carve-out.

## Required markers (deterministic check)

A brief passes only if it contains all four markers, in order:

| # | Marker | Depth |
| --- | --- | --- |
| 1 | `## 👤 HUMAN LAYER` | `##` |
| 2 | `## 🤖 AGENT LAYER` | `##` |
| 3 | `### Acceptance Criteria` (under AGENT) | `###` |
| 4 | `### Context Files` (under AGENT) | `###` |

Stubs ("TBD", "TODO", `N/A` everywhere, empty bullets, placeholder paths) fail
the substantive check — a brief with headers but no content is NOT accepted.

## Deterministic enforcement (harness-agnostic, MANDATORY)

El gate **no es opt-in**: se dispara siempre que se CREA un issue (Linear MCP
`save_issue`, o CLI de issue), en los tres harnesses. El núcleo es un único
detector determinístico `shared/hooks/bilingual/detect.py` (exit 2 deny).

| Harness | Mecanismo | Transporte |
| --- | --- | --- |
| **OpenCode** | plugin `shared/hooks/bilingual/adapters/opencode-bilingual.ts` → `detect.py` | Linear MCP `save_issue` (default) |
| **Claude Code** | PreToolUse `shared/hooks/bilingual/pre-linear-save-issue-bilingual.sh` (registrado en `hooks.json`) → `detect.py` | Linear MCP `save_issue` (default) |
| **Cursor** | `adapters/cursor-before-shell.sh` (beforeShellExecution) → `detect.py` | CLI `linear … create\|edit`, `gh issue create\|edit` |
| **Claude / CLI fallback** | `adapters/claude-pre-bash.sh` → `detect.py` | CLI `linear … create\|edit`, `gh issue create\|edit` |
| `/implement` redaction guard | corre `detect.py` por issue | Linear + GitHub |
| `/ready-to-review-mergeable` | exige que el brief pase `detect.py` | Linear + GitHub |

Ningún adapter lee `.claude/config/hygiene-hooks.json` ni ninguna config de otro
harness. El opt-in de higiene (`linear_create_hygiene`) es un gate **distinto** y
no afecta al gate Bilingual.

**Timing (no confundir con PRDS):** BIB gatea **crear/abrir el ISSUE** (antes de crearlo). PRDS gatea **abrir el PULL REQUEST** (`gh pr create\|edit`, `shared/hooks/prds/`). Son dos gates distintos en dos momentos distintos del pipeline.

No existe opt-out por config. Único bypass explícito y logueado:
`# hook-bypass: bilingual-body-deferred`.

---

## Related

- [PRDS](prds.md) — PR body standards (Summary/Tracker/Test plan/Scope). BIB governs the **issue**; PRDS governs the **PR**.
- [QA traceability (QT4L)](qa-traceability-four-layers.md) — scenario → verification in `tasks.md`.
- Fill-in template + markers: `toolkits/make-no-mistakes-toolkit/templates/bilingual-issue-brief.md`, `docs/bilingual-format-standard.md`.
