# governance — PR triage sub-protocol

Parent hub: [`references/triage/protocol.md`](../triage/protocol.md).

## Question

Do PR-stage **gates and receipts** allow moving to remote code review?

## Flow (PR stage)

```mermaid
flowchart TD
  start([governance/triage.md]) --> g1[Cross-check testing PASS]
  g1 --> g2[Cross-check security PASS]
  g2 --> g3{coverage_delta ≥ 0?}
  g3 -->|no| b[BLOCKED]
  g3 -->|sí| r{receipt required?}
  r -->|sí| w[Write assurance-pr-N.json]
  r -->|no| p[PASS]
  w --> p
```

## Sequence (hub aggregation → receipt)

```mermaid
sequenceDiagram
  participant Hub as assurance hub
  participant Agent as Agent
  participant FS as .local/receipts/
  participant RTR as ready-to-review-mergeable

  Hub->>Agent: run governance pillar
  Agent->>Agent: verify testing + security PASS
  Agent->>Agent: coverage_delta gate (if configured)
  Agent->>FS: write assurance-pr-{pr}.json
  Note over FS: stage, pr, issue, commit_sha, pillars, timestamp
  Agent-->>Hub: PASS | BLOCKED
  Hub-->>RTR: §2b aggregate PASS enables §3b bots
```

## Steps

1. Apply PR-stage gates from [`references/governance/protocol.md`](../governance/protocol.md):
   - tests satisfied (cross-check testing pillar PASS),
   - security criticals = 0 (cross-check security pillar PASS),
   - `coverage_delta` ≥ 0 when the repo measures it.
2. Emit or update a **PR receipt** when config requires it
   (`readyToReview.assurance.receipt.path`, default
   `.local/receipts/assurance-pr-<pr>.json`):
   - `stage: pr`, `pr`, `issue`, `commit_sha`, `pillars` verdict map, `timestamp`.
3. **BLOCK** if a required gate or receipt field is missing.
4. **PASS** when gates are met and receipt (if required) is written.

## Out of scope

- Release-stage gates (e2e full suite, p95, DER thresholds) — unless explicitly
  promoted to PR via consumer config.
