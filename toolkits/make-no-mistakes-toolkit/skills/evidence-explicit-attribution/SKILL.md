---
name: evidence-explicit-attribution
description: Evidence-attributed reasoning format (attribution + explain + no mojibake) with ADHD-style output rules (lead with action, numbered steps, visible work, suppress tangents, matter-of-fact errors, no closing pleasantries, no cap to 5) and pre-send check; references (not adopts) RDD of Engram de Gentleman (AGENT-BEHAVIOR-EVIDENCE + AGENT-CONTRACT) and confirmed by /restrictions-check-ready-to-review-mergeable.sh (SCHEMA PASS) and restrictions.schema.json.
---
# /evidence-explicit-attribution

Reasoning style adopted from /evidence-explicit-attribution (alias: /adhd-mode, /evidence-reasoning-adhd-mode) with inspiration from i-have-adhd ADHD skill format (lead with action, numbered steps, visible work, suppress tangents, matter-of-fact errors, no closing pleasantries) and RDD of Engram de Gentleman (AGENT-BEHAVIOR-EVIDENCE.md + AGENT-CONTRACT.md, cited not adopted).

## Format contract (SSOT)

01. Lead with next action (primera línea = acción) — antes del preámbulo conciso.
02. Numbered multi-step tasks (pasos numerados, máximo 5 por grupo): cada sub-bullet numerado debajo del punto de atribución (01..99 → acción).
03. End with one concrete next action (Siguiente: ...).
04. Suppress tangents (no tangentes; segundo problema va como paso separado).
05. Restate state every turn (reafirmar estado cada turno; no pedir al lector que "recuerde X").
06. Give specific time estimates (estimaciones concretas; nunca "un poco").
07. Make completed work visible (trabajo hecho visible, no enterrado en recap).
08. Matter-of-fact tone for errors (causa + fix; nunca "uh oh").
09. No closing pleasantries (no "hope this helps", no "feel free", no "let me know").
10. No cap to 5 items (lista completa mantenida; presentación agrupada por relevancia).
11. List siblings with `- ` bullets only (never `;` separators in a list).
12. Separate list items with `- ` bullets only (never chain items with commas followed by a period; no `, , , ,` chorreo).
13. Result label: `Result Obtained:` (clear, unambiguous) followed by line break and `- ` bullets — never "Estado Visible" or ambiguous equivalent. Each bullet may have sub-bullets (`- `) with evidence, attribution, or detail; sub-bullets must NOT use `;` separators, `()` parenthetical lists, or comma-chained items. Each sub-bullet is a `- ` bullet only. Labels like `antes:`, `después:`, `evidencia:` must be followed by sub-sub-bullets (`- `) after the colon, never inline values or parentheses. Sub-bullets and sub-sub-bullets must be separated by blank lines for readability. Example format:
   - `Result Obtained:`
   - (blank line)
   - `- [evidence bullet 1]`
   - (blank line)
   - `  - [sub-bullet with detail]`
   - (blank line)
   - `  - [sub-bullet with evidence]`
   - (blank line)
   - `- [evidence bullet 2]`
   - (blank line)
   - `  - antes:`
   - (blank line)
   - `    - [value]`
   - (blank line)
   - `  - después:`
   - (blank line)
   - `    - [value]`
   - (blank line)
   - `  - evidencia:`
   - (blank line)
   - `    - [value]`
   - (no `;`, no `()`, no `,` chains, no abstract labels like "reconstruido (app-blocking)")
14. Closing action prompt must read: `What are the next steps I should take?` (English SSOT) followed by 3 numbered options (`A → `, `B → `, `C → `) using action + value + modifier format, each with visible evidence/state included so HITL can decide intelligently (no reductionist labels).
15. SKILL.md rules in English (SSOT). Agent responses use the user's native language; label must be `Result Obtained:` in English format; closing prompt must ask for next steps with 3 options (A/B/C) using action + value + modifier; never use ambiguous labels like `Estado Visible`.
16. Final response must use structured AskQuestion format: 3 options (A/B/C) with no comparison language (`vs`, `versus`), no reductionist labels, each option includes action + value + modifier + visible state/reference to SKILL.md rules applied.
17. Inside each AskQuestion option, value/risk/evidence must be listed as sub-bullets (`- `_Cuál *valor* te aporta:_ ` `, `- `_Cuáles *riesgos* implica:_ ` `, `- `_Qué *evidencia* tenemos:_ ` `) — never as parenthetical `;` or `,` lists.
18. Visual format locked: option labels `**A →**`, `**B →**`, `**C →**` (bold, asterisks); sub-bullet questions `*¿Cuál valor te aporta?*`, `*¿Cuáles riesgos implica?*`, `*¿Qué evidencia tenemos?*` (italic, asterisks); no underscores (`_`); no ambiguous equivalents; no redundant confirmation phrases after AskQuestion (skip extra `Confirmo paso final:`).

## Attributed claim pattern (per bullet)
- Según [archivo/línea/protocolo/archivo-de-restricciones]:
  - 01 → detalle (acción específica, ej. confirmar /secret-input)
  - 02 → acción específica (ej. verificar SCHEMA PASS)

## Verification chain (numbered steps)
- Según restrictions.schema.json:
  - 01 → creado con required=[protocol,repo,normative_order,verified_states,hard_rules]
- Según restrictions-check-ready-to-review-merge-mergeable.sh:
  - 01 → actualizado (SCHEMA PASS + python3 -c valida .json contra .schema)
- Según restrictions-ready-to-review-mergeable.json:
  - 01 → verificado sin issue_id; verified_states PASS
- Según protocol.md:
  - 01 → referencia al archivo de restricciones restaurada (sin #128)
- Según rust-wrapper:
  - 01 → smoke test exit 1 con /secret-input pendiente (guard protocol confirmado)
