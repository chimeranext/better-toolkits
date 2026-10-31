# Tasks

## 1. Scaffold /ishikawa skill

- [x] 1.1 Create `skills/ishikawa/SKILL.md` as a thin shim (frontmatter + pointer to `references/ishikawa/protocol.md`); verify it follows the slim-shim standard.
- [x] 1.2 Create `references/ishikawa/protocol.md` documenting the **practice**: anomaly statement (observed vs expected, anchored to a standard), 6M brainstorming, Muda/Mura/Muri deviation typing, work-vs-waste distinction, just-in-time scope, plausibility/evidence scoring, most-likely root-cause selection, and the 5W→1H convergence. Diagram (Mermaid/text) is optional output only.
- [x] 1.3 Add `ishikawa` to the toolkit's `package.json` `"skills"` catalog; verify the catalog lists it.

## 2. Enforce the "both, in order" gate

- [x] 2.1 In the protocol, document the resolution phase in order: (1) fix root cause, (2) fix symptom, (3) verify both, (4) recurrence guard.
- [x] 2.2 Add a scenario/rule that a symptom-only resolution is incomplete (Jidoka correction); verify with a unit-style check in the protocol.

## 3. Wire into premortem, postmortem, dogfood and evidence-explicit-attribution

- [x] 3.1 Update `skills/premortem/SKILL.md` Step 3 deep-dive prompts to classify failure causes via the 6M categories; verify the prompt template mentions the 6M lens.
- [x] 3.2 Update `commands/postmortem.md` Causa Raíz step to invoke `/ishikawa` and distill the 6M analysis into the numbered causal chain; verify the command references `/ishikawa`.
- [x] 3.3 Update `references/dogfood/protocol.md` so the Jidoka stop (anomaly detected) routes through `/ishikawa`; verify the protocol references `/ishikawa` in its anomaly handling.
- [x] 3.4 Update `skills/evidence-explicit-attribution/SKILL.md` to add the four Genchi Genbutsu observation rules (in-session observation gate, claim-type label `observado`/`reportado`/`inferido`, method-of-observation, freshness) and an on-demand-only `/ishikawa` invocation; verify the skill documents them.

## 4. Vendor Graphify + Open Ontologies (global evidence tooling)

- [x] 4.1 Create `shared/bootstrap/scripts/setup-graphify.sh`: install pinned `graphifyy` globally via `uv tool install graphifyy==X.Y.Z`, register the global `/graphify` skill (`graphify install`); verify idempotent re-run and that nothing is written into a consumer repo. The script must NOT assume a fixed scan root (e.g. `~/Documentos/GitHub/*`).
- [x] 4.2 Create `shared/bootstrap/scripts/setup-open-ontologies.sh`: download pinned release binary globally, verify SHA-256 before `mv` to `~/.local/bin`, register MCP server in **global** `~/.config/opencode/opencode.json` (`open-ontologies serve`); verify idempotence + checksum failure aborts.
- [x] 4.3 Confirm neither tool adds committed content to consumer repos; confirm generated artifacts (e.g. `graphify-out/`) are gitignored, not pushed.
- [ ] 4.4 Create `shared/bootstrap/scripts/setup-specula.sh`: install Specula globally via `uv tool install -e .` (pinned commit/tag), run `specula setup` to install agent skills + MCP tools; verify idempotent re-run and that run outputs live outside the source checkout (`runs/<run-id>/`).

## 5. Add /verify-evidence

- [x] 5.1 Create `skills/verify-evidence/SKILL.md` as a thin shim (frontmatter + pointer to `references/verify-evidence/protocol.md`).
- [x] 5.2 Create `references/verify-evidence/protocol.md` documenting claim-type → tool routing (Graphify / Open Ontologies / Specula), the real-execution requirement (never inference), and the verdict format (`PASSA`/`FALLA`/`NO-VERIFICABLE`) with the evidence chain per `evidence-explicit-attribution`.
- [x] 5.3 Register `verify-evidence` in `package.json` `"skills"` catalog.

## 6. Verification

- [x] 6.1 `openspec validate ishikawa-root-cause-analysis` passes (exit 0).
- [x] 6.2 Dogfood: run `/ishikawa` on a real anomaly (e.g. the stderr-gate regression) and confirm the output states observed vs expected, classifies into 6M, picks a root cause, and enforces "both, in order".
- [x] 6.3 Confirm `premortem`, `postmortem`, and `dogfood` docs route through `/ishikawa` without changing their existing formats/behavior; confirm `evidence-explicit-attribution` documents the four observation rules and invokes `/ishikawa` only on demand.
- [x] 6.4 Verify Graphify reports `EXTRACTED`/`INFERRED` edges on a sample repo, and Open Ontologies refuses a forged conclusion (non-zero exit, named rule). → Graphify done: 2564 EXTRACTED / 76 INFERRED edges on kubetauritrader. Open Ontologies forged refusal pending (6.7).
- [x] 6.5 Verify Graphify portability: run `graphify .` from a repo located at a non-default path (e.g. a temp checkout outside `~/Documentos/GitHub`) and confirm the graph builds with paths relative to that repo root (no absolute-root assumption). → Done: identical graph in `/tmp/opencode/graphify-portable-test/`; 0 absolute paths; no home leak. ⚠️ add `graphify-out/` to kubetauritrader `.gitignore` (uncommitted).
- [x] 6.6 Verify Open Ontologies path-agnosticism: run `open-ontologies` on a `.ttl` fixture passed via a path relative to a repo at a non-default location, and confirm a certificate is produced and re-verifiable with `oo-cert` independent of the working directory. → Done: load/reason/oo-cert OK from CWD /tmp with absolute paths (persistent mode; --no-connect).
- [x] 6.7 Verify certificate lifecycle: confirm generated certificates are deterministic given identical input, are NOT committed into the repo (gitignored / treated as derived), and are regenerable; confirm a divergent local environment regenerates rather than merges certificate files. → Done: forged refusal (exit 1, rule rdfs9); asserted.tsv byte-identical across runs; derivations.tsv NOT byte-deterministic (multi-provable conclusion picks valid proof path) but all verify sound; certs are derived artifacts bound by asserted.sha256.
- [x] 6.8 Verify the Git-vs-semantics split: demonstrate a one-line TTL change that is textually tiny but has semantic consequences detected by `open-ontologies` (e.g. new consequences / conservativity), proving Git alone would miss it. → Done: one-line `Coffee ⊑ Espresso` creates subclass_cycle (Espresso ≡ Coffee); Git diff is 1 line; reasoner + defects scan detect it.
- [ ] 6.9 Verify gitignore asymmetry: confirm adding `graphify-out/` to a repo's `.gitignore` keeps Graphify outputs uncommitted, and that Open Ontologies requires no repo-specific gitignore entry (certificates archived as CI artifacts, not in-tree).
- [~] 6.10 Verify Specula: run `specula` on a small concurrent sample (e.g. a simplified two-process protocol) and confirm it produces a TLA+ spec + invariant, model-checks it with TLC, and either passes or reports a counterexample reproducible at the code level. → PARTIAL: TLC/TLA+ substrate proven on Java 17 (Peterson two-process pass; adversarial mutation → counterexample, exit 12). Full `specula run` pipeline (analyze→specgen→reproduction) requires a credentialed coding agent — documented as out of scope, NOT a pass.
- [ ] 6.11 Dogfood `/verify-evidence`: verify a real claim against `kubetauritrader` (e.g. "X está conectado a Y" via Graphify; a consistency claim via Open Ontologies; an invariant via Specula) and confirm the verdict + evidence chain are produced.

> Note: 6.4–6.11 require actually installing Graphify, Open Ontologies and
> Specula globally (running `setup-graphify.sh`, `setup-open-ontologies.sh`,
> `setup-specula.sh`). This is a real system mutation and is intentionally left
> for approval in the review/handoff.
>
> Evidence note: the orchestrator TLA+ PoC (`references/parallel-subagents/tla/`)
> now RUNS under TLC and proves the invariants: with guards present → pass;
> with a guard removed or a bad action reachable → counterexample (AFIF).
> This is the evidence backing the 6-gap analysis for the /parallelize
> deprecation.
