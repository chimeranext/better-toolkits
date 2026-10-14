# testing — PR triage sub-protocol

Parent hub: [`references/triage/protocol.md`](../triage/protocol.md).

OpenSpec contract (PR stage slice): `openspec/changes/add-assurance-toolkit/specs/toolkit/assurance-governance/spec.md`
→ requirement **Gates por etapa, rápidos primero** — PR row **`tests 100%`** only.
Security criticals and `coverage_delta` are **other pillars** (security + governance), not this file.

## Question

Does this PR have **required test CI evidence** for the head SHA (interpreted as the
**tests 100%** slice of the PR-stage gate)?

## Flow (PR stage — testing pillar only)

```mermaid
flowchart TD
  start(["testing pillar PR N"])
  c1["List required test jobs for repo"]
  c1 --> c2["gh pr checks N"]
  c2 --> c3{"invokeRunner true?"}
  c3 -->|yes| r["optional e2e-test-runner / test-suite.json"]
  c3 -->|no| v{"all required checks success?"}
  r --> v
  v -->|no| b["BLOCKED — job name + run URL"]
  v -->|yes| p["PASS testing pillar"]
```

This pillar **does not** emit the PR receipt or evaluate `coverage_delta`; the hub runs
security and governance next. Aggregate **`/assurance:triage pr` PASS** matches the full
PR row in assurance-governance when all required pillars PASS.

## Sequence (agent ↔ CI)

```mermaid
sequenceDiagram
  participant Hub as assurance hub
  participant Agent as Agent
  participant GH as GitHub PR checks
  participant Runner as optional test runner

  Hub->>Agent: run testing pillar PR N
  Agent->>GH: gh pr checks N
  alt readyToReview.assurance.testing.invokeRunner
    Agent->>Runner: e2e-test-runner test-suite.json
    Runner-->>Agent: exit code + artifacts
  end
  GH-->>Agent: required jobs success or fail
  Agent-->>Hub: PASS or BLOCKED + links
```

## Steps

1. Confirm PR checks include required test jobs for this repo (unit/integration/E2E
   as configured in CI). Use `gh pr checks <N> --watch` or latest completed runs.
2. If the repo defines an assurance testing runner (e.g. `e2e-test-runner` against
   `test-suite.json`), run it only when `readyToReview.assurance.testing.invokeRunner`
   is true; optional runner failure **BLOCKS** even when other checks are green.
3. **BLOCK** when any **required** test check is failing, pending beyond policy, or
   missing for in-scope changes.
4. **PASS** when all required test checks are success (or explicitly waived in
   config with user-visible reason — never silent).

## Out of scope

- `coverage_delta` and PR receipt (governance pillar).
- Critical security findings (security pillar).
- Release-only perf/load gates (see governance release stage).
- Mixing security scanner output into the testing verdict.
