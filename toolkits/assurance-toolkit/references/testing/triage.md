# testing — PR triage sub-protocol

Parent hub: [`references/triage/protocol.md`](../triage/protocol.md).

## Question

Does this PR have **testing evidence** that satisfies the PR-stage gate?

## Flow (PR stage)

```mermaid
flowchart TD
  start([testing/triage.md]) --> c1[gh pr checks — required test jobs]
  c1 --> c2{invokeRunner true?}
  c2 -->|sí| r[e2e-test-runner / test-suite.json]
  c2 -->|no| v{required checks green?}
  r --> v
  v -->|no| b[BLOCKED — job + URL]
  v -->|sí| p[PASS]
```

## Sequence (agent ↔ CI)

```mermaid
sequenceDiagram
  participant Hub as assurance hub
  participant Agent as Agent
  participant GH as GitHub PR checks
  participant Runner as optional test runner

  Hub->>Agent: run testing pillar (PR N)
  Agent->>GH: gh pr checks N
  alt readyToReview.assurance.testing.invokeRunner
    Agent->>Runner: e2e-test-runner (test-suite.json)
    Runner-->>Agent: exit code + artifacts
  end
  GH-->>Agent: required jobs success / fail
  Agent-->>Hub: PASS | BLOCKED + links
```

## Steps

1. Confirm PR checks include required test jobs for this repo (unit/integration/E2E
   as configured in CI). Use `gh pr checks <N> --watch` or latest completed runs.
2. If the repo defines an assurance testing runner (e.g. `e2e-test-runner` against
   `test-suite.json`), run it only when `readyToReview.assurance.testing.invokeRunner`
   is true; otherwise CI green is sufficient.
3. **BLOCK** when any **required** test check is failing or missing for in-scope
   changes.
4. **PASS** when all required test checks are success (or explicitly waived in
   config with user-visible reason — never silent).

## Out of scope

- Release-only perf/load gates (see governance release stage).
- Mixing security scanner output into the testing verdict.
