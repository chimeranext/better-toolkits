# Changelog

## v1.0

First release. PIBER codified as a skill rather than as a prompt that gets retyped.

### What the skill contains that the prompt never did

**The order as a dependency chain, not a filing convention.** The reason most drafts fail is that they start at B. The skill states the chain (altitude gates the insight, the insight gates the idea, the idea gates the execution) and refuses to move forward when an upstream node is weak.

**The insight gate.** The 1-to-10 non-obviousness score with a hard floor at 9, carried over from the original 2024 case-board prompts and made mandatory. Below 9 does not ship, and when nothing clears 9 the instruction is to raise the Problem rather than lower the gate. The seven generation moves and four tests are in `references/insight-forge.md`.

**Visible versus invisible PIBER.** The single most common execution failure was leaving the scaffolding on the building: slides titled "Insight" in an investor meeting. Node labels are now permitted in exactly three contexts (award board, internal strategy document, teaching) and banned everywhere else. `--rendered` on the gate enforces it.

**The compression ladder.** Five resolutions from a 25-word line to a full board, plus the direction rule: always write L4 first and subtract downward. Expansion upward from a one-liner produces padding, since it generates support for a conclusion already committed to.

**Transposition.** Fourteen artifacts mapped, from investor deck to one-line bio, with what each node becomes and where the turn sits. This is what makes the framework apply to anything that has to be communicated rather than only to pitches.

**The falsifiable bet.** Results is the node that startups fake. When nothing has shipped, the node converts to a wager: the number, the date, and what would prove the thesis wrong. A wager reads as more credible than a projection because it is the only version an investor can hold you to.

### The ship gate (`scripts/piber_gate.py`)

Mechanical checks only, since judgment stays with the writer.

- Hard failures: em dashes, missing nodes, an insight over two sentences or 45 words, a brand name inside the insight (via `--brand`), refused insight openers, an insight sharing 60% or more of its content words with the Problem (the double P), a Big Idea line over 12 words, and a Results node with neither numbers nor a declared bet.
- Warnings: 45% word overlap, Big Idea over 7 words, category nouns standing in for ideas, untraced execution, thin execution, activity metrics without a money or behavior tier, numbers without a baseline, cliche in English and Spanish, hedges, sentences over 35 words, exclamation marks.
- Use versus mention: quoted spans, inline code and fenced blocks are masked before the lexical sweep, plus `<!-- lint:ignore -->` line and block escapes. Em dashes are checked raw; house style has no quoting exemption.
- Section parsing runs a node body to the next *node* heading rather than the next heading of any kind, so a Big Idea written as its own `# Three Word Line` is read as the idea instead of as an empty section.
- Bilingual by default (`--lang both`). Spanish node names and Spanish cliche are first-class, not an afterthought.

### Known and deliberate

**The gate cannot score an insight.** It can catch a restatement, a brand name, a stapled sentence and a refused opener. It cannot tell a 7 from a 9, and pretending otherwise would be worse than leaving the judgment where it belongs. The 9-floor is enforced by the writer, not the script.

**Overlap thresholds are heuristics.** 45% warns and 60% fails, calibrated against real drafts, and a legitimate insight that reuses the Problem's nouns will occasionally trip the warning. It warns rather than fails at that level for exactly this reason.

**The vanity-metric check has an escape.** Results containing revenue, renewal, conversion or retention language suppress it, since an impressions figure sitting beside a money figure is context rather than a headline.
