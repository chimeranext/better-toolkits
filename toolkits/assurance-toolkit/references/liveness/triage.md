# liveness — PR triage sub-protocol

Parent hub: [`references/triage/protocol.md`](../triage/protocol.md).

## Question

Does this PR require **liveness** evidence before code review?

## Default (PR stage)

**SKIP** — liveness (`observability-audit`, chaos, heartbeat) runs on **schedule /
daemon** cadence, not on every PR. See assurance README pillar table.

## Flow (when pillar not skip)

```mermaid
flowchart TD
  start([liveness/triage.md]) --> d{pillar skip?}
  d -->|default PR| sk[SKIP]
  d -->|required/optional| a[observability-audit or repo smoke]
  a --> v{protocol PASS?}
  v -->|sí| p[PASS]
  v -->|no| b[BLOCKED]
```

## Sequence (schedule vs PR opt-in)

```mermaid
sequenceDiagram
  participant Hub as assurance hub
  participant Agent as Agent
  participant Audit as observability-audit
  participant Sched as schedule/daemon

  Note over Sched,Audit: default path — not every PR
  Hub->>Agent: liveness pillar
  alt pillars.liveness = skip
    Agent-->>Hub: SKIP
  else required or preflight
    Agent->>Audit: latest audit vs target env
    Audit-->>Agent: PASS | BLOCKED
    Agent-->>Hub: verdict + links
  end
```

## When not SKIP

If `readyToReview.assurance.pillars.liveness` is `required` or `optional`, or
`readyToReview.assurance.liveness.preflight` is true:

1. Run or verify the latest `observability-audit` (or repo-defined smoke) against
   the target environment documented in config.
2. **PASS** / **BLOCK** per that audit's protocol
   [`references/liveness/protocol.md`](../liveness/protocol.md).
