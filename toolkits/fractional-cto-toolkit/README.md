# fractional-cto-toolkit

[![Version](https://img.shields.io/badge/version-1.4.17-blue)](.claude-plugin/plugin.json) [![License: BSL-1.1](https://img.shields.io/badge/license-BSL--1.1-important)](LICENSE)

Claude Code plugin with playbooks, contracts, and guided workflows for freelance
and fractional CTOs.

## Pipelines

The engagement flowchart is the reference for this toolkit:

- [`references/engagement-orchestration.md`](references/engagement-orchestration.md)
- [`references/engagement-orchestration.preview.html`](references/engagement-orchestration.preview.html) (Pele)

Pipelines in that diagram:

1. Engagement pipeline
2. Standards pipeline
3. Process pipeline
4. Requirements pipeline
5. Linear/OPSX pipeline
6. Handover pipeline

Rectangles are processes. Diamonds are yes/no decisions. Parallelograms labeled `Output:` are the files.

### Engagement pipeline

`/contract-nda` → `/takeover-assessment` → `/project-takeover`. After the questionnaire, `/project-takeover` invokes `/maintenance-plan-ieee14764` and then `/transition-plan-ieee12207`. Then `/contract-psa`.

`/contract-psa` makes the software project management plan and the ISO/IEC/IEEE 16085 risk plan **Milestone 1 (Discovery)** on the standard path. Preventa ships `*-bare.md` outlines only. After signature, invoke `/software-project-management-plan-authoring-ieee16326` and `/software-risks-authoring-ieee16085`. The operator, using the urgent-and-important matrix, decides whether a treatment plan is required. High-governance pre-signature fill is opt-in and not recommended for fractional CTOs without prior preventa negotiation experience. Org GRC stays `/iso31000`. Operational `risk/*` is a different family.

`/business-brain-setup` is part of this pipeline. It creates the vault. Process skills write into `_procedimientos/` when that folder already exists.

### Standards pipeline

`/engineering-standards-audit` → `/engineering-standards-setup`.

Setup does not invoke `/requirements-authoring-ieee29148`. Its own scaffold ends at the commit. In this orchestration, setup starts the Linear/OPSX pipeline.

### Process pipeline

```
/process-standardization  →  /automation-triage  →  /sop-authoring
   discover + capture           decide the how         write the SOP
```

Also: `/playbook-authoring` (when/why), `/runbook-authoring` (how),
`/document-it` or `/document-this`. Shared artifact home:
`./fractional-cto/sops/{slug}/`.

The Handover pipeline starts after this pipeline finishes.

### Requirements pipeline

`/requirements-authoring-ieee29148` writes `software-requirements-specification.md` (ISO/IEC/IEEE 29148:2018). M-02 is `/architecture-description-ieee42010`. When M-02 evaluates, it invokes `/architecture-evaluation-ieee42030`. `/architecture-decision-ieee42010` writes the decision record.

Shared home: `shared/skills/requirements-authoring-ieee29148/` +
`shared/references/requirements-authoring-ieee29148/`.

This pipeline does not start `/opsx-*`.

### Linear/OPSX pipeline

`/engineering-standards-setup` starts `/opsx-*`. The command order stays explore, propose, human review, apply, PR, optional sync, archive only with a human yes. Deployment releases the system into the client environment. That release does not start M-04.

### Handover pipeline

Entry is `/handover-process-to-ops`. The chain ends at `/handover-engagement-to-board`, then M-04 Knowledge transfer. Each handover command emits its own output. The commands and outputs are in the flowchart.

## Skills

| # | Skill | Triggers | Output |
|---|-------|----------|--------|
| 1 | `contract-nda` | "NDA", "confidencialidad" | Bilingual NDA |
| 2 | `takeover-assessment` | "assessment", "evaluacion de riesgo", "threat matrix" | SPA wizard + assessment contract |
| 3 | `project-takeover` | "takeover", "handover", "el dev anterior" | Playbook + Diátaxis client guide + delivery request + breach notice (slug at end). Bares in `references/` for apprentices |
| 4 | `contract-psa` | "contrato de proyecto", "PSA", "scope of work" | PSA with shared risk model (A/B/C) |
| 5 | `contract-retainer` | "retainer", "mensual", "equity", "advisory" | Retainer or Advisory+Equity contract |
| 6 | `process-standardization` | "standardize a process", "document how we do X", "process inventory" | Ranked inventory + current-state capture |
| 7 | `automation-triage` | "should we automate this", "RPA vs AI", "attended vs unattended" | Per-step verdict (human/RPA/AI/hybrid) + rationale |
| 8 | `sop-authoring` | "write an SOP", "operational procedure", "make this SOP executable" | Structured SOP + executable SOP when automatable |
| 9 | `business-brain-setup` | "business brain", "cerebro de negocio", "convert our business model folder" | Git/Obsidian knowledge vault (scaffold or BMC migration) |
| 10 | `playbook-authoring` | "write a playbook", "ops playbook", "decision tree", "playbook vs runbook" | When/why playbook linking diagnose/recover runbooks |
| 11 | `runbook-authoring` | "write a runbook", "incident runbook", "release runbook", "on-call procedure" | Trigger-driven runbook + diagnose/repair scripts |
| 12 | `requirements-authoring-ieee29148` (shared) | "SRS", "requisitos", "29148" | software-requirements-specification.md |
| 13 | `software-project-management-plan-authoring-ieee16326` | "SPMP", "16326", "plan de gestión" | SPMP per ISO/IEC/IEEE 16326:2019 |
| 14 | `software-risks-authoring-ieee16085` | "16085", "risk management plan", "Milestone 1 Discovery" | 16085 risk plan. The operator decides the treatment plan with the urgent-and-important matrix |
| 15 | `software-project-management-plan/audit` | "audit project plan", "16326 gap", "16085 risk audit" | Gap matrix vs 16326 §7 + 16085 §8 |

Project-governance templates (SSOT under `references/software-project-management-plan/`,
plus `references/grc/iso31000/` for org risk) export into `business-brain-template` via
`scripts/export-spmp-templates.sh` — do not author lasting copies only in the brain
template. Atomic `_templates/riesgo.md` stays PMBOK-oriented and is not overwritten.

### CTO domain families (authored per FFF — families × internal taxonomy)

| Family | Skills | Purpose |
|--------|--------|---------|
| `strategy/` | roadmap · portfolio · rnd-alignment | Tech vision, roadmapping, portfolio, R&D alignment |
| `architecture/` | architecture-description-ieee42010 · architecture-evaluation-ieee42030 · architecture-decision-ieee42010 · stack-evaluation · migration | Architecture description, architecture evaluation, architecture decisions, stack tradeoffs, migration guidance |
| `metrics/` | dora · reliability · velocity · team-health · exec-reporting | DORA, SLO/SLI, engineering velocity, team health, exec narrative |
| `risk/` | audit · incident-response · disaster-recovery · resilience | Security audit framing, IR, DR, resilience |
| Handover pipeline | `handover-process-to-ops` · `handover-risk-to-cro` · `handover-grc-to-cco` · `handover-metrics-to-vpeng` · `handover-architecture-to-principal` · `handover-strategy-to-board` · `handover-requirements-to-cpo` · `handover-standards-to-vpeng` · `handover-engagement-to-board` | Ownership transfer to organic executives |
| `grc/` | universal (incl. `iso31000`) + regional USMCA/LATAM/APAC/EMEA | Compliance frameworks |
| `threat-defense/` | owasp-top10 · owasp-nhi-top10 · mitre-atlas · mitre-attack · mitre-d3fend · ai-defense | Threat and defense controls |

## Commands

| Command | Purpose | Output |
|---------|---------|--------|
| `/engineering-standards-setup` | Adopt the engineering standards (index of 32) in a client repo | `AGENTS.md` pointers, standards doc, PR template, QT4L stub |
| `/engineering-standards-audit` | Measure adoption of the standards index | Findings report |

## Contract Templates

All contracts include a **Section 0: Shared Risk Model** with compensation variants:

| Model | Risk Distribution | When to Use |
|-------|-------------------|-------------|
| A | Fixed Fee (client pays 100%) | Empresa con revenue, scope claro |
| B | Reduced Fee + Success Bonus | Startup con algo de funding |
| C | 50/50 Split (fee + equity) | Pre-seed con algo de cash |
| D | Sweat Equity + Min Retainer | Pre-seed sin funding |
| E | Pure Equity ($0 cash) | Co-founder, sin producto |

## Features

- Six pipelines: Engagement, Standards, Process, Requirements, Linear/OPSX, Handover. The flowchart is `references/engagement-orchestration.preview.html`
- Takeover pack: playbook + Diátaxis client guide + two legal templates (`{{placeholders}}`). Bares for apprentices
- Requirements pipeline: `software-requirements-specification.md`. `/opsx-*` starts in the Linear/OPSX pipeline
- 6 engineering standards bootstrap + **OST** when using an OpenSpec store
- Bilingual engagement emits (Spanish primary for CR). English toolkit SSOT + STE100 where required
- Costa Rica legal framework notes (Ley 8968, Codigo Penal, Camara de Comercio arbitration)
- 7-threat risk matrix
- Interactive SPA assessment wizard
- 22 industry verticals (Startups 506 taxonomy)

## Install

```bash
claude plugin add lapc506/fractional-cto-toolkit
```

## License

BSL-1.1

## Install (OpenCode) — stderr + PRDS

This toolkit vendors `hooks/stderr/` and `hooks/prds/` (synced from monorepo
`shared/hooks/`).

Register **both** file plugins ([OpenCode plugins](https://opencode.ai/docs/plugins/)):

```jsonc
{
  "plugin": [
    "/absolute/path/to/this-toolkit/hooks/stderr/adapters/opencode-plugin.ts",
    "/absolute/path/to/this-toolkit/hooks/prds/adapters/opencode-plugin.ts"
  ]
}
```

- **stderr** — block `2>/dev/null` / bare `2>&1` without a log sink
- **PRDS** — block `gh pr create|edit` (and `git push` when a PR already exists)
  without the four always-on PRDS sections

See [`docs/opencode-stderr.md`](../../docs/opencode-stderr.md),
[`shared/hooks/prds/README.md`](../../shared/hooks/prds/README.md), and
[`docs/multi-harness-ssot.md`](../../docs/multi-harness-ssot.md).
