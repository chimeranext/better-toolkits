# Engagement orchestration

Full command/skill chain for a fractional CTO engagement. Linked from the
toolkit [README](../README.md). Keep node labels free of bare parentheses and
`/` inside unquoted Mermaid text so GitHub can render the diagram.

Rectangles are processes. Diamonds are yes/no decisions. Parallelograms are outputs, and each output names its standard. The diagram names for the project plan and the risk plan are the standard names. The files on disk stay `plans/<fecha>-plan-proyecto-<slug>.md` and `plans/<fecha>-gestion-riesgos-16085.md`.

```mermaid
flowchart TD
  subgraph ENG[Engagement pipeline]
    A["/contract-nda"] --> B["/takeover-assessment"]
    B --> C["/project-takeover"]
    C --> Maint["/maintenance-plan-ieee14764"]
    Maint --> MaintenanceOutput@{ shape: lean-r, label: "Output: maintenance-plan-slug.md | ISO/IEC/IEEE 14764:2022" }
    Maint --> Trans["/transition-plan-ieee12207"]
    Trans --> TransitionOutput@{ shape: lean-r, label: "Output: transition-plan-slug.md | ISO/IEC/IEEE 12207:2026" }
    C --> D["/contract-psa"]
    D --> M01["M-01 Discovery: write the project plan and the risk plan"]
    M01 --> SPMP["/software-project-management-plan-authoring-ieee16326"]
    M01 --> R16085["/software-risks-authoring-ieee16085"]
    SPMP --> PlanOutput@{ shape: lean-r, label: "Output: software-project-management-plan.md | ISO/IEC/IEEE 16326:2019" }
    R16085 --> RiskOutput@{ shape: lean-r, label: "Output: risk-management-plan.md | ISO/IEC/IEEE 16085:2021" }
    R16085 --> Eisen@{ shape: diam, label: "Operator: using the urgent-and-important matrix, do you require a treatment plan?" }
    Eisen -->|yes| TreatOutput@{ shape: lean-r, label: "Output: risk-treatment-plan.md | ISO/IEC/IEEE 16085:2021" }
    PlanOutput --> Gate@{ shape: diam, label: "Client accepted the software project management plan, the risk management plan, and any required risk treatment plan in writing?" }
    RiskOutput --> Gate
    TreatOutput --> Gate
    Eisen -->|no| Gate
    Gate -->|no| M01
    Brain["/business-brain-setup"]
  end
  subgraph STD[Standards pipeline]
    F["/engineering-standards-audit"] --> G["/engineering-standards-setup"]
  end
  subgraph PROC[Process pipeline]
    H["/process-standardization"] --> I["/automation-triage"]
    I --> J["/sop-authoring"]
    J --> K["/playbook-authoring"]
    J --> L["/runbook-authoring"]
    J --> R["/document-it or /document-this"]
  end
  subgraph REQ[Requirements pipeline]
    M["/requirements-authoring-ieee29148"] --> ReqOutput@{ shape: lean-r, label: "Output: software-requirements-specification.md | ISO/IEC/IEEE 29148:2018" }
    ReqOutput --> AuthorDesc["M-02 Detailed design: /architecture-description-ieee42010"]
    AuthorDesc --> DescOutput@{ shape: lean-r, label: "Output: architecture-description.md | ISO/IEC/IEEE 42010:2022" }
    AuthorDesc --> Eval["/architecture-evaluation-ieee42030"]
    Eval --> EvalOutput@{ shape: lean-r, label: "Output: architecture-evaluation.md | ISO/IEC/IEEE 42030:2019" }
    AuthorDecision["/architecture-decision-ieee42010"] --> DecisionOutput@{ shape: lean-r, label: "Output: architecture-decision-NNNN-title.md | ISO/IEC/IEEE 42010:2022" }
    DecisionOutput -.-> DescOutput
  end
  subgraph OPSX["Linear/OPSX pipeline"]
    N["/opsx-* flow"] --> CodeOutput@{ shape: lean-r, label: "Output: implemented software | ISO/IEC/IEEE 12207:2026" }
    CodeOutput --> Dep["Deployment: release the system into the client environment"]
    Dep --> DepOutput@{ shape: lean-r, label: "Output: system operating in the client environment | ISO/IEC/IEEE 12207:2026" }
  end
  subgraph HAND[Handover pipeline]
    h8["/handover-process-to-ops"] --> h8Out@{ shape: lean-r, label: "Output: operational runbooks" }
    h8 --> h1["/handover-risk-to-cro"]
    h1 --> h1Out@{ shape: lean-r, label: "Output: risk posture packet" }
    h1 --> h2["/handover-grc-to-cco"]
    h2 --> h2Out@{ shape: lean-r, label: "Output: compliance obligations and evidence" }
    h2 --> h4["/handover-metrics-to-vpeng"]
    h4 --> h4Out@{ shape: lean-r, label: "Output: metric dictionary and data sources" }
    h4 --> h5["/handover-architecture-to-principal"]
    h5 --> h5Out@{ shape: lean-r, label: "Output: architecture documentation" }
    h5 --> h6["/handover-strategy-to-board"]
    h6 --> h6Out@{ shape: lean-r, label: "Output: technology strategy for the board" }
    h6 --> h9["/handover-requirements-to-cpo"]
    h9 --> h9Out@{ shape: lean-r, label: "Output: requirements and acceptance criteria" }
    h9 --> h3["/handover-standards-to-vpeng"]
    h3 --> h3Out@{ shape: lean-r, label: "Output: standards adoption and audit baseline" }
    h3 --> h7["/handover-engagement-to-board"]
    h7 --> h7Out@{ shape: lean-r, label: "Output: README, setup guides, access inventory, and recorded sessions" }
    h7 --> M04["M-04 Knowledge transfer"]
  end
  C --> F
  G --> H
  G --> N
  Gate -->|yes| M
  K --> h8
  L --> h8
  R --> h8
```

## Project governance note

`/contract-psa` section 7.2 fixes M-01 and M-04. M-01 writes the project plan and the risk plan. A diamond asks whether the operator, using the urgent-and-important matrix, requires a treatment plan. A second diamond asks whether the client accepted the software project management plan, the risk management plan, and any required risk treatment plan in writing. No sends the plans back to M-01. Yes is the only exit that invokes `/requirements-authoring-ieee29148`. That pipeline writes the architecture description, and `/architecture-description-ieee42010` invokes `/architecture-evaluation-ieee42030` when M-02 evaluates. After the takeover questionnaire, `/project-takeover` invokes `/maintenance-plan-ieee14764` and then `/transition-plan-ieee12207`. The requirements pipeline does not start `/opsx-*`. `/engineering-standards-setup` does. From there the Linear/OPSX pipeline implements the software and deployment releases it into the client environment. That release does not start M-04.

M-04 is the last step of the Handover pipeline. Each handover command emits its own output. `/handover-process-to-ops` emits the operational runbooks. `/handover-architecture-to-principal` emits the architecture documentation. `/handover-engagement-to-board` emits the README, the setup guides, the access inventory, and the recorded sessions. M-04 is reached from that close.

`/business-brain-setup` is part of the engagement pipeline. It creates the vault for that engagement. The process skills write into `_procedimientos/` when that folder already exists.

`/engineering-standards-setup` does not invoke `/requirements-authoring-ieee29148`. Its own scaffold flowchart ends at the commit. In this orchestration it is the command that starts `/opsx-*`. `/contract-psa` invokes `/requirements-authoring-ieee29148` on the yes branch of the acceptance diamond.

M-01 outputs are the 16326 plan, the 16085 plan, and the 16085 treatment only when the operator requires it. Preventa ships `*-bare.md` outlines only. After signature, invoke `/software-project-management-plan-authoring-ieee16326` and `/software-risks-authoring-ieee16085` to fill them. Org GRC stays `/iso31000`.
