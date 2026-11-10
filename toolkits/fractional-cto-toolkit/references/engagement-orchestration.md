# Engagement orchestration

Full command/skill chain for a fractional CTO engagement. Linked from the
toolkit [README](../README.md). Keep node labels free of bare parentheses and
`/` inside unquoted Mermaid text so GitHub can render the diagram.

```mermaid
flowchart TD
  subgraph ENG[Engagement Lifecycle]
    A["/contract-nda"] --> B["/takeover-assessment"]
    B --> C["/project-takeover"]
    C --> D["/contract-psa"]
    D --> H1["Hito 1 Discovery: SPMP 16326 + 16085"]
    H1 --> SPMP["/software-project-management-plan/authoring"]
    H1 --> R16085["/software-risks-authoring-16085"]
    H1 --> E["/contract-retainer"]
  end
  subgraph STD[Engineering Standards]
    F["/engineering-standards-audit"] --> G["/engineering-standards-setup"]
  end
  subgraph PROC[Process Engineering]
    H["/process-standardization"] --> I["/automation-triage"]
    I --> J["/sop-authoring"]
    J --> K["/playbook-authoring"]
    J --> L["/runbook-authoring"]
    J --> R["/document-it or /document-this"]
  end
  subgraph REQ[Requirements-First]
    M["/requirements-authoring"] --> N["/opsx-* flow"]
  end
  subgraph FAM[CTO Domain Families FFF]
    S1["Strategy: roadmap, portfolio, rnd-alignment"]
    S2["Architecture: decision, stack-evaluation, migration"]
    S3["Metrics: dora, reliability, velocity, team-health, exec-reporting"]
    S4["Risk: audit, incident-response, disaster-recovery, resilience"]
    S5["GRC: universal 12, regional 38 USMCA LATAM APAC EMEA"]
    S6["Threat Defense: owasp-top10, owasp-nhi-top10, mitre-*, ai-defense"]
    S7["Handover: risk-to-cro, grc-to-cco, standards-to-vpeng, ..."]
    S1 ~~~ S2 ~~~ S3 ~~~ S4 ~~~ S5 ~~~ S6 ~~~ S7
  end
  C --> F
  F --> G
  G --> D
  G --> H
  G --> M
  G --> FAM
  D --> O["/oauth2-setup"]
  D --> P["/pentest-playbook-setup"]
  E --> Q["/business-brain-setup"]
```

## Project governance note

`/contract-psa` makes SPMP + ISO/IEC/IEEE 16085 **Milestone 1 Discovery** on the
standard path. Preventa ships `*-bare.md` outlines only. After signature, invoke
`/software-project-management-plan/authoring` and `/software-risks-authoring-16085`
to fill them. Org GRC stays `/iso31000`.
