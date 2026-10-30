# Proposal

## Why

The Jidoka (stop-on-anomaly) discipline requires a **systematic root-cause
analysis** (RCA) method when an anomaly is found. Currently the repo relies on
ad-hoc 5-Whys descriptions inside the agent profile, but there is no dedicated,
reusable skill that guides a full causal analysis — the Ishikawa / fishbone
diagram (6M: Man, Machine, Material, Method, Measurement, Environment). This
change adds a `/ishikawa` skill and teaches `/premortem` and `/postmortem` to
route their causal analysis through it, so that **both** the root cause and the
symptom are fixed, in that order.

## What Changes

- **Add** a new skill `skills/ishikawa/SKILL.md` (+ protocol reference) that:
  - Identifies the anomaly (observed vs expected).
  - Practices the **6M** classification of candidate causes (Man, Machine,
    Material, Method, Measurement, Mother Nature/Environment), recording
    plausibility + evidence for each, and selecting the most likely root
    cause(s). A fishbone diagram is an optional output aid, not the goal.
  - Requires the fix to address **both** the root cause and the symptom, in
    that order, and to verify both (Jidoka correction).
- **Modify** `skills/premortem/SKILL.md` to route its Step 3 deep-dive causal
  analysis through `/ishikawa` (6M lens) when identifying "why it failed".
- **Modify** `commands/postmortem.md` to invoke `/ishikawa` in the Causa Raíz
  step, so the post-incident report is grounded in a systematic 6M analysis.
- **Modify** `references/dogfood/protocol.md` so the Jidoka stop (anomaly
  detected) routes through `/ishikawa` before fixing.
- **Modify** `skills/evidence-explicit-attribution/SKILL.md` to add four
  Genchi Genbutsu observation rules (in-session observation gate, claim-type
  label, method-of-observation, freshness); `/ishikawa` is invoked on demand
  only, never automatically.
- **Vendor** two evidence tools that reinforce `/ishikawa`:
  - **Graphify** (`graphifyy`): builds a knowledge graph with edges tagged
    `EXTRACTED` (read directly) vs `INFERRED` (derived) — a concrete
    implementation of the Genchi Genbutsu observation distinction.
  - **Open Ontologies** (`open-ontologies`): produces re-verifiable certificates
    that refuse forged conclusions — a concrete implementation of the Baka-Yoke
    recurrence guard.
  Both are installed globally via pinned/idempotent scripts (CLI/bin in
  `~/.local/bin`, MCP server registered in the global opencode config),
  following the existing `setup-opencode.md` vendor pattern — no consumer-repo
  committed content, no per-repo push.
- Register `ishikawa` in the toolkit's `package.json` `"skills"` catalog.

## Capabilities

### New Capabilities
- `ishikawa`: structured root-cause analysis using the fishbone/6M method,
  with a mandatory "fix root cause AND symptom, in that order" verification gate.
- `graphify` / `open-ontologies` (vendored): evidence tools that feed
  `/ishikawa` (observed-vs-inferred edges; re-verifiable certificates).

### Modified Capabilities
- `premortem`: causal deep-dives are structured via the 6M lens (instead of
  unstructured failure stories only).
- `postmortem`: the Causa Raíz section is produced via `/ishikawa`.
- `dogfood`: the Jidoka stop routes anomalies through `/ishikawa`.

## Impact

- New: `toolkits/make-no-mistakes-toolkit/skills/ishikawa/` (SKILL.md +
  `references/ishikawa/protocol.md`).
- New (global vendored setup): `shared/bootstrap/scripts/setup-graphify.sh`,
  `shared/bootstrap/scripts/setup-open-ontologies.sh`; both install globally
  per machine (CLI/bin in `~/.local/bin`, Graphify skill global, Open Ontologies
  MCP server in global `~/.config/opencode/opencode.json`). No consumer-repo
  committed content and no per-repo push required.
- Modified: `skills/premortem/SKILL.md`, `commands/postmortem.md`,
  `references/dogfood/protocol.md`, `skills/evidence-explicit-attribution/SKILL.md`,
  `package.json` (skills catalog).
- This is a monorepo-internal change plus global tooling installed once per
  machine.
