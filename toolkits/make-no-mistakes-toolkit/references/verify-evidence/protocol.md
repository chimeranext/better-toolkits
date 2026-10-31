# /verify-evidence — protocol SSOT

Harness-agnostic body. Thin entry: `skills/verify-evidence/SKILL.md`.

---

# /verify-evidence — verify a claim against real evidence

You are a **claim verifier**. A claim (a statement about code, reasoning, or
behavior) needs to be proven against real, observable evidence — never by
inference dressed as a result.

This protocol closes the loop:
- `/ishikawa` analyzes the root cause (and may ask you to prove a countermeasure's
  falsifiable claim).
- `/verify-evidence` (this) runs the real verification.
- `/evidence-explicit-attribution` gives the format for the evidence chain.

## Step 1 — Frame the claim (observed vs expected)

Record the claim as an assertion about what should be observable:

- **Claim**: the statement to verify, in one sentence.
- **Expected**: what the evidence should show if the claim is true.
- **Observed** (filled after Step 3): what the tool actually returned.

If the claim has no falsifiable/observable form, the verdict is
`NO-VERIFICABLE` — say why.

## Step 2 — Route by claim type

| Claim type | Tool | Evidence produced |
| --- | --- | --- |
| Code structure / existence / relationships / architecture | Graphify (`graphify query/explain/path`) | edges tagged `EXTRACTED` (observed) vs `INFERRED` (derived) |
| Logical consistency / entailment / semantic consequence | Open Ontologies (`open-ontologies`) | re-verifiable certificate (`oo-cert`) |
| Behavioral invariant / concurrency / property across states | Specula (`specula`, TLA+ model checking) | model-check result + counterexample path |

If the claim fits more than one type, prefer the strongest available evidence and
say which tool(s) were used.

## Step 3 — Run the real verification

- Execute the actual tool against the actual artifact (the repo, the ontology,
  the model).
- Capture the **real command** and its **real output**.
- If a tool is not installed or the artifact is missing, that is a
  `NO-VERIFICABLE` verdict — never simulate, never infer.

## Step 4 — Verdict

- `PASSA` — the observed evidence supports the claim.
- `FALLA` — the observed evidence refutes the claim (include the counterexample /
  mismatch).
- `NO-VERIFICABLE` — state exactly what could not be verified and why (missing
  tool, missing artifact, insufficient scope, no falsifiable form).

## Step 5 — Evidence chain (per /evidence-explicit-attribution)

Emit the verdict with the evidence chain:

- Each evidence item labeled `observado` / `reportado` / `inferido` (from the
  Genchi Genbutsu rules).
- Method of observation: the exact command/artifact that produced it.
- Freshness: assertion that it reflects the current state.
- Source: the tool + artifact + timestamp.

## Integration with /ishikawa

`/ishikawa` may request verification of a countermeasure's falsifiable claim.
Never assert an unverified claim as fact in an ishikawa analysis — send it to
`/verify-evidence` first. Conversely, if `verify-evidence` returns `FALLA`, the
root cause or countermeasure should be revisited via `/ishikawa`.
