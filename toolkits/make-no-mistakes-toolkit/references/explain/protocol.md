# /explain — protocol SSOT

Harness-agnostic body. Thin entry: `commands/explain.md`.

---

# /explain: $ARGUMENTS

**Two-layer explanation protocol — prose first, technical second, non-obvious insight + ranked actionables.**

**Exit means:** the explanation is complete — layer 1 (plain prose, understandable by a non-technical human), layer 2 (technical evidence referencing code/protocol/artifact paths with `file:line` and measured results, not recollections), one non-obvious insight backed by evidence, ranked actionables (each with what it does, what it costs — time, risk, impact radius — and what remains unresolved), and an `AskUserQuestion` (Claude `/explain` uses `AskUserQuestion`; Cursor uses `AskQuestion`; OpenCode uses `AskQuestion`) to confirm direction. It does **not** mean code changed, specs edited, or PR merged.

The user input can be provided directly or as a command argument — you MUST consider it before proceeding.

---

## Prerequisites

### Subject token (mandatory)

- `$ARGUMENTS` MUST include a description of what to explain (e.g., "why the poller fails", "src/lib/ratchet.ts").
- If empty: explain the last thing discussed in the session; never invent a technical subject.

### Evidence available (optional — read BEFORE writing)

Read relevant evidence files when present (per SSOT anti-pattern: "No explanation without verification"):

- `references/ready-to-review-mergeable/*.md` — protocol/state artifacts.
- `postmortem-*.md` — 5-why chain evidence (see `systematic-debugging/SKILL.md`).
- `catalog-evidence.md` — feature/tool catalog verification results.
- Source files referenced in `$ARGUMENTS` — read before explaining (not working tree; read the `ref` — commit/branch reference).
- `references/ready-to-review-mergeable/protocol.md` — protocol invariant reference.

If verification is impossible: state `"this was not verified"` at the point where evidence would go — that statement is part of the explanation, not a failure of it.

---

## Pipeline overview

**Invariant:** exit = complete explanation handed to human — prose layer verified understandable; technical layer references verified; insight backed; actionables ranked; no hidden redirects (`2>/dev/null`, `>/dev/null`, `2>&1` forbidden per harness `stderr/README.md`); protocol files in English (SSOT `docs/hitl.md`); anti-boilerplate / anti-mojibake.

```mermaid
flowchart TD
  start(["/explain [subject | file-ref]"])
  s1["§1 Read argument + available evidence"]
  s2["§2 Resolve language (prompt → config → English; identifiers/code/commit/PR/Linear stay repo convention) — see protocol.md §2"]
  s3["§3 Layer 1 — prose (plain, no jargon, no file paths, answers 'what'/'why' — not 'how exactly')"]
  s4["§4 Layer 2 — technical (file:line, real names, minimal snippet proving claim, tables for before/after; no recollections without measurement command)"]
  s5["§5 Non-obvious insight (★ Insight block) — backed by evidence; NOT a recap"]
  s6["§6 Ranked actionables + AskUserQuestion (recommended first + trade-off per option, multiSelect when non-exclusive, header ≤ 30 chars) — execute decision→action after response without re-asking"]
  exit["§7 Exit — explanation complete; no code/spec edit; hand to human"]
  blocked["§8 BLOCKED — contradiction found; must ask human before continuing"]

  start --> s1 --> s2 --> s3 --> s4 --> s5 --> s6 --> exit
  s4 -->|evidence contradiction / missing measurement| blocked
```

---

## §1 Read argument + available evidence

- If `$ARGUMENTS` references a file/path: read that file (or the minimal relevant section) before writing layer 2.
- If a `postmortem-*.md` or `catalog-evidence.md` exists in `references/ready-to-review-mergeable/`: reference it in layer 2.
- If no verification possible: state explicitly (`"this was not verified"`) at the point where evidence would be cited — that is part of the explanation, not a failure.

---

## §2 Resolve language (SSOT — see `docs/hitl.md`)

Resolve the **user-facing prose language** in this order:

1. Language of the user's prompt (and follow-ups for the same request).
2. Else `make-no-mistakes.config.json` → `language` when present
   (`make-no-mistakes.config.example.json`).
3. Else **English**.

Protocol files in the toolkit stay English (harness SSOT: `docs/hitl.md` —
anti-mojibake; anti-boilerplate; no hidden redirects).

The resolved language governs user-facing prose (both layers under §4.5).
Identifiers, code, commit messages, PR titles/bodies, and Linear issue titles
follow the destination repo's convention (typically English). A command that
writes in GitHub or Linear does not translate that output based on this key.

---

## §3 Layer 1 — prose (plain, understandable to non-technical human)

Zero jargon; zero file paths; zero function names. 2–5 sentences.

**The rule deciding value:** prose is NOT the technical layer with simpler words. It answers a **different question**: prose answers `"what is happening and why does it matter"`; technical answers `"where exactly and how"`. If your prose paragraph is a summary of the technical block, delete it — it is redundant and readers skip it, which is how these explanations become useless.

Quick test: if a person who does not touch this codebase can repeat your prose and make a correct decision with it, it passes.

---

## §4 Layer 2 — technical evidence (verified against code/protocol/artifacts)

Now: paths with `file:line`, real names, minimal snippet proving the claim, tables for before/after or comparison.

Cite what you **measured**, not what you remember. A number without the command that produced it is an opinion with data formatting.

Reference concrete artifacts:
- Source files (`.ts` / `.py` / `.sh`) with line references.
- Protocol artifacts (`references/ready-to-review-mergeable/protocol.md`, `catalog-evidence.md`, `postmortem-*.md`).
- Command definitions (`commands/*.md`) when explaining command behavior.
- Skill references (`systematic-debugging`, `brainstorming-visual-companion`) when relating to methodology.
- Harness/runtime rules (`docs/hitl.md`, `AGENTS.md`) when explaining why a restriction applies.

---

## §4.5 Controlled-language output discipline (before emitting either layer)

The explanation output SHALL follow **controlled-language discipline**, applied to
the **output language resolved in §2**. Both layers are consumed by a human AND
by downstream agents, so misreading has a cost in every language.

**Principles (universal — any language):** one word, one meaning; active voice;
short sentences; no ambiguity; preserve modality. ASD-STE100 is the English
canonical source of those principles; ESP-TS is the Spanish mechanical pack.
The discipline is universal; the linter is per language.

**Structural rules — apply (both layers, in the resolved output language):**
- Active voice: "The agent deletes the file." / "El agente elimina el archivo."
  — not a passive that hides the actor.
- Prefer single plain verbs over soft phrasal / calque forms.
- One idea per sentence; avoid semicolon as a clause joiner; noun clusters ≤3 words.
- Sentence length ≤25 words (descriptions), ≤20 (instructions).
- Keep subject/verb explicit.
- **Keep modality**: never promote a hedge to a fact.

**Lexical rules — direction of travel:**
- One word, one meaning per document (don't rotate synonyms for the same thing).
- Prefer the verb over the noun form.
- Define domain terms once if not common in the output language.

**Scan checklist (run before emitting):**
1. Synonym rotation — pick one name, use it every time.
2. Hedge stacking — state the claim or delete it; never let qualifiers pile up.
3. Nominalization — use the verb.
4. Marketing adjectives — delete or replace with the measurement.
5. Run-on sentences — one idea per sentence.
6. Soft / vague verbs — use the single plain verb.

If a rewrite would drop necessary precision, keep the longer phrasing and flag
it — never silently simplify. Never add a fact the source did not state.

**Mechanical gate (when available) — route by §2 language:**

| §2 language | Linter | Lexical SSOT |
| --- | --- | --- |
| English | `shared/references/asd-ste100/scripts/asd-ste100-lint.py` | `shared/references/asd-ste100/vocabulary.yml` |
| Spanish | `shared/references/esp-ts/scripts/esp-ts-lint.py` | `shared/references/esp-ts/vocabulary.yml` |
| Other | Apply principles manually | No mechanical gate yet |

Run the matching linter on the final output (write a temp `.md` if needed). Do
**not** cross-run languages (no English STE lint on Spanish prose; no ESP-TS on
English). Exit 1 only on hard (`advisory-free`) violations above `--baseline`
(default 0). Advisory findings never fail the run. Hedges/modality are never
forced out.

English reference pack under this skill tree: `references/writing-rules.md`,
`examples/before-after.md`, `examples/linter-edge-cases.md`,
`STE100-ATTRIBUTION.txt`. Spanish pack:
`shared/references/esp-ts/` (see its README).

## §5 Non-obvious insight (`★ Insight` block)

```
★ Insight — <one line of context>
[2–3 bullet points, backed by evidence from §1/§3/§4]
```

**Earns its place only if it says something the reader could NOT derive from the two layers above.** Valid forms: an unexpected consequence, a reframing, a correction to an assumption made in the explanation itself, a hidden cost, or why the obvious fix is wrong.

If it recaps: **delete it**. A recap trains readers to skip the block, and then the block stops serving its purpose.

---

## §6 Ranked actionables + `AskUserQuestion`

Convert actionables into decisions, with the same contract as `/resolve-open-questions`:

- Up to **4 questions** per call.
- Recommended option **first**, labeled `(Recommended)`.
- `header` ≤ 30 chars.
- The **trade-off** in each `description` — not just the label.
- `multiSelect` when options are non-exclusive.

After user responses: emit `decision → action` per item and **execute without re-asking**. One approval = one action.

If no open decision remains (explanation was purely informational): say so in one line and **do NOT call `AskUserQuestion`**. A fabricated menu is worse than no menu.

---

## Anti-triggers (must NOT appear in output)

- **Active socratic investigation** — continuous prose, no headings.
- **Single-line question** (`"which port?"`) — answer and finish; don't wrap in 5 steps.
- **Execution plan** — that is `spec-recommend` or plan-approval flow, not `/explain`.
- **Session recap** — that is `/summarize`.
- No decorative `echo`; no hidden `2>/dev/null` / `>/dev/null` / `2>&1` in any example or script; no mixed-language option text (English for protocol; Spanish only when explicitly requested for user-facing prose — here: English per SSOT).
- No `TICKET-*` IDs for this repo's work (`#135` native GitHub Issues only; tracker reference is `Fixes #135` with canonical `https://github.com/chimeranext/better-toolkits/issues/135` URL).
- No claiming remote gate equals broken behavior (`postmortem-136-sync-check.md` distinguishes governance/version failure from behavioral regression).
- No proposing fixes before Phase 1 evidence (`systematic-debugging` Iron Law: `NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST`).
- No merging without HITL (`pre-push` guard `2e71a02`; protocol invariant: `READY FOR HUMAN REVIEW — NOT MERGE AUTHORIZED`).
