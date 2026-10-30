# Design

## Context

This monorepo bundles a `make-no-mistakes-toolkit` that owns the Jidoka /
No-Workarounds discipline and the `/premortem` / `/postmortem` commands. Root
cause analysis currently lives as ad-hoc prose in the agent profile; there is no
reusable 6M / fishbone skill. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Add a `/ishikawa` skill (SKILL.md + protocol) implementing the fishbone/6M method.
- Teach `/premortem` (Step 3 deep-dives) and `/postmortem` (Causa Raíz) to route
  through `/ishikawa`.
- Enforce the Jidoka correction: fix root cause AND symptom, in that order, with
  a recurrence guard.

**Non-Goals:**
- Not replacing the existing premortem/postmortem report formats — only enriching
  their causal-analysis step.
- Not touching consumer repos (internal monorepo change).

## Decisions

### D1 — Thin shim skill (following SSS)
- `skills/ishikawa/SKILL.md` is a thin frontmatter shim that points to
  `references/ishikawa/protocol.md` (the SSOT body), consistent with the slim
  shim standard.

### D2 — Practice-first analysis (diagram is incidental), TPS-informed
- The heart of `/ishikawa` is the classification **practice**: state the
  anomaly (observed vs expected, anchored to a standard), brainstorm candidate
  causes, assign each to a 6M category AND a Muda/Mura/Muri deviation type,
  score plausibility/evidence, and select the most likely root cause(s).
- Borrowed from the Toyota Production System (Ohno): the expected behavior comes
  from a standard work reference; deviations are classified as waste (muda),
  inconsistency (mura) or unreasonableness (muri); the analysis distinguishes
  value-adding work from waste and keeps just-in-time scope (no over-analysis).
- A fishbone diagram (Mermaid or text) is an optional output aid, never a goal
  in itself — the analysis must be complete and correct even if no diagram is
  rendered.

### D3 — The "both, in order" gate
- The protocol's resolution phase explicitly sequences: (1) root cause fix,
  (2) symptom fix, (3) verify both, (4) recurrence guard. A symptom-only
  resolution is flagged incomplete.

### D4 — Reuse in premortem / postmortem / dogfood
- `premortem`: Step 3 sub-agent prompts gain a 6M classification requirement.
- `postmortem`: the Causa Raíz step instructs the agent to run `/ishikawa` and
  summarize the 6M analysis into the numbered causal chain.
- `dogfood`: the Jidoka stop (anomaly detected) routes through `/ishikawa` so
  the fix addresses both the root cause and the symptom, in that order.

### D6 — evidence-explicit-attribution gains Genchi Genbutsu observation rules
- Extend `skills/evidence-explicit-attribution/SKILL.md` with four observation
  rules: (1) in-session observation gate, (2) claim type label (`observado` /
  `reportado` / `inferido`), (3) method-of-observation recorded per claim, (4)
  freshness asserted.
- `/ishikawa` is invoked **on demand only**: when the user explicitly requires
  evidence-based root-cause analysis. It is never auto-invoked on every claim.

### D7 — Vendor Graphify + Open Ontologies as global evidence tooling
- **Graphify** (`graphifyy`, pinned): install **globally** via
  `uv tool install graphifyy==X.Y.Z`. The `graphify` CLI is then available on
  PATH; the `/graphify` skill is registered in the user's global assistant
  config (`graphify install`), not committed into consumer repos. Its
  `EXTRACTED`/`INFERRED` edge tags are the concrete mechanism for the
  observation-vs-inference distinction (Genchi Genbutsu).
- **Run relative to the current repo:** an agent builds a graph with
  `graphify .` from the repo it is working in. The scan root is always that
  repo (never a hardcoded `~/Documentos/GitHub/*`), so paths inside the graph
  are relative and portable across developers regardless of clone location.
  `graphify-out/` is gitignored, never committed/pushed; `.graphifyrc` (if
  used) is committed because it describes the repo.
- **Gitignore asymmetry:** Graphify requires a per-repo `.gitignore` entry for
  `graphify-out/`. Open Ontologies does not — it produces no fixed repo-tree
  artifacts; its certificates are archived as CI artifacts and never written
  into the repo, so no extra gitignore entry is needed.
- **Open Ontologies** (`open-ontologies`, release binary): download pinned
  release globally, verify SHA-256 before `mv` to `~/.local/bin`, register as a
  local MCP server (`command: ["open-ontologies", "serve"]`) in the **global**
  `~/.config/opencode/opencode.json`. Its re-verifiable certificates implement
  the Baka-Yoke recurrence guard.
- **Path-agnostic:** Open Ontologies is a reasoner, not a repo scanner — it
  takes explicit ontology file paths (relative to the current repo) and has no
  scan root. No output directory is imposed on the repo; certificates live where
  the agent directs and are re-verifiable regardless of location. No absolute
  root (e.g. `~/Documentos/GitHub/*`) is ever assumed.
- **Certificate lifecycle:** certificates (`asserted.tsv`/`derivations.tsv`)
  are derived, regenerable artifacts. CI regenerates + verifies them per change
  and discards them; if audit traceability is needed they are archived as CI
  artifacts, never committed into the monorepo. They are deterministic given the
  same input, so no local byte-collisions occur — divergent environments
  regenerate against their own state. Git remains the textual source of truth;
  Open Ontologies adds the semantic verification (blast radius/conservativity)
  that a text diff cannot show, with the certificate as the proof.
- Both follow the existing global vendor pattern (`setup-opencode.md`): pinned,
  idempotent, installed once per machine, absent from consumer repo contents —
  no per-repo push required.

### D5 — Catalog registration
- Add `ishikawa` to `package.json` `"skills"` field.

## Risks / Trade-offs

- [R1] The analysis may stop at the first plausible cause instead of reaching a
  genuine root cause.
  → Mitigation: the protocol requires classifying across all six 6M categories
  and selecting the most likely root cause(s) with evidence, not just the first
  idea.
- [R2] "Both, in order" can be gamed (fixing the symptom quietly).
  → Mitigation: the protocol requires an explicit verification step for both the
  symptom and the systemic cause, plus a recurrence guard.
- [R3] Premortem/postmortem are mature; over-instrumenting changes their voice.
  → Mitigation: add the 6M lens to the causal step only; keep the final report
  format unchanged.

## Migration Plan

1. Create `skills/ishikawa/` (SKILL.md + `references/ishikawa/protocol.md`).
2. Update `skills/premortem/SKILL.md` Step 3 to require 6M classification.
3. Update `commands/postmortem.md` Causa Raíz to route through `/ishikawa`.
4. Register `ishikawa` in `package.json` skills catalog.
5. Validate (`openspec validate`) and dogfood the skills.

## Open Questions

- None blocking. The exact 6M labels (Man/Machine/Material/Method/Measurement/
  Environment) are standard; localize as needed.
