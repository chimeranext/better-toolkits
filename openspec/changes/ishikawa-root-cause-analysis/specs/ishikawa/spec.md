# Spec Delta

## Purpose

Provides a structured fishbone (Ishikawa / 6M) + Five-Whys root-cause analysis
so anomalies are resolved by fixing both the systemic root cause and the
visible symptom, in that order.

## ADDED Requirements

### Requirement: 6M classification practice
The skill SHALL classify candidate causes of an anomaly across six categories:
Man, Machine, Material, Method, Measurement, and Environment (Mother Nature).
The classification is the core practice; a visual representation is optional.

#### Scenario: Classify causes into the six M buckets
- **WHEN** an anomaly is submitted for root-cause analysis
- **THEN** the analysis SHALL organize every candidate cause under one of the six 6M categories
- **AND** the analysis SHALL record, for each cause, why it is plausible and what evidence supports it
- **AND** SHALL prioritize the most likely root cause(s) from the classified set

### Requirement: Five Whys depth (dig the causal chain)
The skill SHALL apply the Five-Whys technique within the highest-priority 6M
category to excavate the causal chain to the underlying root cause, not stop at
the first plausible cause.

#### Scenario: Five Whys drill into the chosen category
- **WHEN** the most likely 6M category has been selected
- **THEN** the analysis SHALL ask "why" at least five times down that chain
- **AND** the final "why" SHALL be the underlying root cause (not a symptom)
- **AND** SHALL record each link in the chain with its evidence

### Requirement: 5W converges to 1H (actionable countermeasure)
The skill SHALL converge the analysis into a single, actionable, verifiable
countermeasure (the "how"), derived from the root cause, not merely a list of
causes.

#### Scenario: Analysis ends with one countermeasure
- **WHEN** the root cause is identified
- **THEN** the analysis SHALL produce exactly one primary countermeasure that
  addresses the root cause
- **AND** the countermeasure SHALL state how it will be verified (what will be
  observed as "fixed")
- **AND** SHALL not stop at a list of causes without a concrete "how"

### Requirement: Anomaly statement (observed vs expected, from a standard)
The skill SHALL require an explicit statement of the anomaly: observed behavior
vs expected behavior, before any cause is listed. The expected behavior SHALL
be anchored to a defined standard (a documented procedure, gate, or contract);
if no standard exists, the analysis SHALL record that the root cause may be a
standardization gap.

#### Scenario: Observed and expected are recorded first
- **WHEN** the root-cause analysis starts
- **THEN** the analysis SHALL first record the observed behavior and the expected behavior
- **AND** SHALL NOT propose causes before both are stated

#### Scenario: Missing standard is flagged
- **WHEN** there is no documented standard that defines the expected behavior
- **THEN** the analysis SHALL flag "standardization gap" as a candidate root cause
- **AND** SHALL note that the expected behavior is undefined

### Requirement: Muda / Mura / Muri classification
The skill SHALL classify each root-cause candidate not only by 6M category but
also by the type of deviation: waste (muda), inconsistency (mura), or
unreasonableness (muri).

#### Scenario: Deviation type is recorded
- **WHEN** a cause is classified into a 6M category
- **THEN** the analysis SHALL also record whether it is a waste, an
  inconsistency, or an unreasonableness
- **AND** SHALL use this label to prioritize the fix (eliminate waste,
  stabilize inconsistency, simplify unreasonableness)

### Requirement: Work vs waste distinction
The skill SHALL distinguish value-adding behavior from waste when analyzing the
anomaly, and SHALL name what is being discarded or over-produced.

#### Scenario: Waste is identified explicitly
- **WHEN** the anomaly involves a discarded or over-produced output
- **THEN** the analysis SHALL name the specific waste (e.g. a discarded stream,
  overproduction, waiting, defects)
- **AND** the countermeasure SHALL target that waste

### Requirement: Just-in-time scope (no over-analysis)
The skill SHALL limit the analysis to the minimum necessary to identify the root
cause — it SHALL NOT over-produce candidate causes beyond what is relevant
(over-analysis is itself a form of waste).

#### Scenario: Scope is bounded
- **WHEN** candidate causes are generated
- **THEN** the analysis SHALL prioritize only the plausible, evidentiary causes
- **AND** SHALL avoid padding with irrelevant or low-plausibility causes

### Requirement: Root cause + symptom, both fixed, in that order
The skill SHALL require the resolution to address the systemic root cause AND
the visible symptom, in that order, and SHALL verify both.

#### Scenario: Root cause fixed before symptom
- **WHEN** a root cause and a symptom are identified
- **THEN** the fix SHALL first address the root cause, then the symptom
- **AND** the verification SHALL confirm the symptom is gone AND the systemic cause is closed

#### Scenario: Symptom-only is rejected
- **WHEN** only the symptom is fixed without addressing the root cause
- **THEN** the analysis SHALL flag the resolution as incomplete (Jidoka correction)

### Requirement: Prevention / recurrence guard
The skill SHALL produce a recurrence guard: a check or note that prevents the
root cause from re-entering the system.

#### Scenario: Recurrence guard produced
- **WHEN** the root cause is identified
- **THEN** the analysis SHALL propose a concrete recurrence guard (e.g. a gate,
  a hook, a test) that would have caught the anomaly earlier

### Requirement: evidence-explicit-attribution observes in situ (Genchi Genbutsu)
The `evidence-explicit-attribution` skill SHALL require that every cited evidence
claim comes from an observation performed in this session, and SHALL label each
claim by type, method and freshness.

#### Scenario: Only in-session observations are cited as facts
- **WHEN** a claim is attributed to a source
- **THEN** the claim SHALL be labeled `observado` only if the source was read,
  executed, or observed in this session
- **AND** a claim not directly observed SHALL be labeled `inferido` or
  `reportado`, never presented as a fact

#### Scenario: Method of observation is recorded
- **WHEN** an evidence claim is made
- **THEN** the claim SHALL include the method that produced it (e.g. the exact
  command read, the file opened, the output observed)
- **AND** SHALL NOT cite a source without stating how it was observed

#### Scenario: Freshness is asserted
- **WHEN** an evidence claim is made
- **THEN** the claim SHALL indicate it reflects the current state, or SHALL
  note its capture time/session if it may be stale
- **AND** SHALL re-observe if the source may have changed

### Requirement: Vendored evidence tools reinforce /ishikawa
The change SHALL vendor two evidence tools — Graphify and Open Ontologies — as
sources of observable, verifiable evidence for `/ishikawa` root-cause analysis,
installed per-repo in a pinned, idempotent way.

#### Scenario: Graphify provides observed-vs-inferred edges
- **WHEN** the knowledge graph (Graphify) is used as an evidence source
- **THEN** each edge SHALL be tagged `EXTRACTED` (read directly) or `INFERRED`
  (derived)
- **AND** the analysis SHALL treat `EXTRACTED` as observed evidence and
  `INFERRED` as derived evidence

#### Scenario: Open Ontologies provides re-verifiable certificates
- **WHEN** Open Ontologies is used to validate a reasoning/conclusion step
- **THEN** the output SHALL include a certificate a third party can re-verify
  without trusting the engine
- **AND** a forged or unsupported conclusion SHALL be refused (non-zero exit,
  named rule)

#### Scenario: Open Ontologies is path-agnostic (no scan root)
- **WHEN** an agent uses Open Ontologies to reason over ontologies
- **THEN** the agent SHALL pass explicit file paths relative to the repo it is
  working in
- **AND** the tool SHALL NOT assume any scan root or output location tied to a
  hardcoded directory (e.g. `~/Documentos/GitHub/*`)
- **AND** the MCP server SHALL be registered globally; generated certificates
  (`asserted.tsv` / `derivations.tsv`) live wherever the agent directs and are
  re-verifiable independently of location

#### Scenario: Gitignore asymmetry — Graphify yes, Open Ontologies no
- **WHEN** vendoring the two tools into a consumer repo
- **THEN** Graphify SHALL require adding `graphify-out/` to that repo's
  `.gitignore` (its generated artifacts must not be committed)
- **AND** Open Ontologies SHALL NOT require a repo-specific gitignore entry,
  because its certificates are archived as CI artifacts rather than written into
  the repo tree
- **AND** in both cases no generated artifact SHALL be committed/pushed

#### Scenario: Specula provides TLA+ invariant model-checking
- **WHEN** Specula is used to verify a system's behavior
- **THEN** it SHALL write TLA+ specifications of the target plus invariants
  capturing correctness properties
- **AND** it SHALL model-check the specs with TLC
- **AND** it SHALL reproduce any invariant violation at the code level
- **AND** the recurrence guard of `/ishikawa` SHALL be expressible as a TLA+
  invariant that Specula can check

#### Scenario: Certificates are derived artifacts, not committed sources
- **WHEN** a certificate is produced
- **THEN** the certificate SHALL be treated as a derived, regenerable artifact
  (like a test output), not a committed source
- **AND** CI SHALL regenerate and verify the certificate per change, then
  discard it unless it is being archived for audit
- **AND** certificates SHALL NOT be pushed into a monorepo as source content
- **AND** when audit traceability is required, the certificate SHALL be
  archived as a CI artifact (not in the repo working tree)

#### Scenario: Local environment collisions are resolved by regeneration
- **WHEN** multiple local environments reason over the same ontology
- **THEN** certificates SHALL be deterministic given identical input (ontologies
  + rules + engine version), so no byte-level collision occurs
- **AND** divergent environments SHALL regenerate their own certificate against
  their current state rather than merge certificate files
- **AND** the `asserted.sha256` digest SHALL be used to bind a certificate to
  the exact asserted bytes used

#### Scenario: Git versions text; Open Ontologies verifies semantics
- **WHEN** an ontology change is proposed
- **THEN** Git SHALL remain the version source of the ontology text (source of
  truth for the files)
- **AND** Open Ontologies SHALL verify the semantic consequences of that change
  (blast radius, conservativity) which a text diff cannot reveal
- **AND** the certificate SHALL be the proof of that semantic verification

#### Scenario: Installation is pinned, idempotent and global
- **WHEN** the setup script runs
- **THEN** Graphify SHALL be installed globally at a pinned version (`uv tool
  install graphifyy==X.Y.Z`), and Open Ontologies SHALL be installed globally
  from a release with its SHA-256 verified
- **AND** re-running the script SHALL be idempotent (no duplicate installs)
- **AND** neither tool SHALL be committed into a consumer repo — both live in
  the user's global tool paths
- **AND** the Open Ontologies MCP server SHALL be registered in the global
  `~/.config/opencode/opencode.json`, not in per-repo config

#### Scenario: Graphify maps the repo you are in (no absolute-root assumption)
- **WHEN** an agent builds a knowledge graph for a repo
- **THEN** the agent SHALL run `graphify .` from that repo's own root
- **AND** the scan root SHALL be the repo where the agent is working, never a
  hardcoded absolute directory such as `~/Documentos/GitHub/*`
- **AND** the resulting `graphify-out/` graph SHALL use paths relative to that
  repo root, so it is portable across developers regardless of where they clone
- **AND** `graphify-out/` SHALL be gitignored and never committed/pushed
- **AND** the `.graphifyrc` (if used) SHALL be committed, as it describes the
  repo and must be identical across developers

### Requirement: /ishikawa is invoked on demand for evidence, not automatically
The `evidence-explicit-attribution` skill SHALL invoke `/ishikawa` only when the
user explicitly demands evidence-based root-cause analysis; it SHALL NOT
auto-invoke `/ishikawa` on every claim.

#### Scenario: On-demand invocation only
- **WHEN** the user requires evidence for a root-cause analysis
- **THEN** the skill SHALL invoke `/ishikawa` to structure the causal analysis
- **AND** SHALL NOT invoke `/ishikawa` when the user has not requested it

### Requirement: /premortem, /postmortem and /dogfood route through /ishikawa
The `premortem`, `postmortem`, and `dogfood` commands SHALL use `/ishikawa`
for their causal-analysis steps.

#### Scenario: Premortem uses the 6M lens
- **WHEN** a premortem deep-dive analyzes why a plan failed
- **THEN** the failure analysis SHALL classify causes via the 6M categories

#### Scenario: Postmortem uses /ishikawa for root cause
- **WHEN** a postmortem composes the Causa Raíz section
- **THEN** the root cause SHALL be produced via the `/ishikawa` 6M analysis

#### Scenario: Dogfood hits an anomaly (Jidoka) and uses /ishikawa
- **WHEN** a `/dogfood` verification detects an anomaly (Jidoka stop)
- **THEN** the dogfood flow SHALL route the anomaly through `/ishikawa` to
  identify the root cause
- **AND** the fix SHALL address both the root cause and the symptom, in that
  order
