# fractional-cto-toolkit

[![Version](https://img.shields.io/badge/version-1.4.7-blue)](.claude-plugin/plugin.json) [![License: BSL-1.1](https://img.shields.io/badge/license-BSL--1.1-important)](LICENSE)

Claude Code plugin with SOPs, contracts, and guided workflows for freelance and fractional CTOs.

## Engagement orchestration

The toolkit's commands/skills chain across the full client engagement. Complete
orchestration (all commands and skills, grouped by pipeline):

```mermaid
flowchart TD
    subgraph ENG[Engagement Lifecycle]
        A[/"/contract-nda"/] --> B[/"/takeover-assessment"/]
        B --> C[/"/project-takeover"/]
        C --> D[/"/contract-psa"/]
        D --> E[/"/contract-retainer"/]
    end
    subgraph STD[Engineering Standards]
        F[/"/engineering-standards-audit"/] --> G[/"/engineering-standards-setup"/]
    end
    subgraph PROC[Process Engineering]
        H[/"/process-standardization"/] --> I[/"/automation-triage"/]
        I --> J[/"/sop-authoring"/]
        J --> K[/"/playbook-authoring"/]
        J --> L[/"/runbook-authoring"/]
        J --> R[/"/document-it" | "/document-this"/]
    end
    subgraph REQ[Requirements-First]
        M[/"/requirements-authoring"/] --> N["/opsx-* flow"]
    end
    subgraph FAM[CTO Domain Families — FFF]
        S1[Strategy: roadmap · portfolio · rnd-alignment]
        S2[Architecture: decision · stack-evaluation · migration]
        S3[Metrics: dora · reliability · velocity · team-health · exec-reporting]
        S4[Risk: audit · incident-response · disaster-recovery · resilience]
        S5[GRC: universal 12 · regional 38 (USMCA/LATAM/APAC/EMEA)]
        S6[Threat/Defense: owasp-top10 · owasp-nhi-top10 · mitre-* · ai-defense]
        S7[Handover: risk-to-cro · grc-to-cco · … · standards-to-vpeng]
        S1 ~~~ S2 ~~~ S3 ~~~ S4 ~~~ S5 ~~~ S6 ~~~ S7
    end
    C --> F
    F --> G
    G --> D
    G --> H
    G --> M
    G --> FAM
    D --> O[/"/oauth2-setup"/]
    D --> P[/"/pentest-playbook-setup"/]
    E --> Q[/"/business-brain-setup"/]
```

## Process-Engineering Pipeline

Beyond project takeovers, the toolkit turns any of a client's operational processes into a versioned,
optionally-executable SOP. One pipeline over one shared artifact (`./fractional-cto/sops/{slug}/`):

```
/process-standardization  →  /automation-triage  →  /sop-authoring
   discover + capture           decide the how         write the SOP
   (inventory + capture)      (human/RPA/AI/hybrid)   (+ executable form)
```

- **process-standardization** — inventory a team's processes (Frequency × Variability × Pain) and
  capture the current state of the ones worth standardizing.
- **automation-triage** — decide, step by step, what stays human vs. RPA vs. AI agent vs. hybrid,
  with an executive-legible rationale.
- **sop-authoring** — write the structured Operational SOP from a template; when a step is
  automatable, also emit a runnable executable SOP (proceda-style) with human-approval gates.
- **playbook-authoring** — when/why/judgment under uncertainty: decision tree, options, and
  links to execute scripts. Not a click-by-click recover script.
- **runbook-authoring** — sibling for the *execute* case: an incident/recovery runbook
  (paired diagnose/repair scripts) or an operational/release runbook, plus an executable
  form. Three-way: **playbook** = decide; **runbook** = execute; **SOP** = recurring
  company process.

## Requirements-First Pipeline

Beyond operational processes, the toolkit formalizes a client's **product requirements
before any code is written** — the PRD is the source of truth, everything else derives.

```
PRD / SRS (Product Owner, ISO/IEEE 830 + ISO/IEC/IEEE 29148:2018, bare template)
   │  derive (NOT the reverse)
   ▼
OpenSpec specs/changes  →  Linear issue (Bilingual Layer)  →  /opsx-* flow
   /opsx-explore → /opsx-propose → human review → /opsx-apply → PR → /opsx-sync → /opsx-archive
```

- **requirements-authoring** — write a versioned PRD/SRS per the standards (vendored bare
  template from `jam01/SRS-Template`, CC0) with 29148 quality checklists and a
  verification traceability table. Shared home: `shared/skills/requirements-authoring/`
  + `shared/references/requirements-authoring/` (deduped, like engineering-standards).
- Any client adopting this can bootstrap the **6 engineering standards**
  (DSMS, IFS, CPS, PRDS, BrS, QT4L) from day one — see `shared/references/engineering-standards/`
  (SSOT compartido a nivel monorepo). Clients with an OpenSpec **store** repo also adopt
  **OST** (one tracker issue → one change folder → one store PR → one merge).
  The **clean code quartet** is DSMS + IFS + CPS + PRDS; BrS, QT4L, and OST complete
  branching, QA traceability, and spec promotion discipline.

## Skills

| # | Skill | Triggers | Output |
|---|-------|----------|--------|
| 1 | `contract-nda` | "NDA", "confidencialidad" | Bilingual NDA |
| 2 | `takeover-assessment` | "assessment", "evaluacion de riesgo", "threat matrix" | SPA wizard + assessment contract |
| 3 | `project-takeover` | "takeover", "handover", "el dev anterior" | 4 SOPs (tecnico, guia cliente, solicitud, ultimatum) |
| 4 | `contract-psa` | "contrato de proyecto", "PSA", "scope of work" | PSA with shared risk model (A/B/C) |
| 5 | `contract-retainer` | "retainer", "mensual", "equity", "advisory" | Retainer or Advisory+Equity contract |
| 6 | `process-standardization` | "standardize a process", "document how we do X", "process inventory" | Ranked inventory + current-state capture |
| 7 | `automation-triage` | "should we automate this", "RPA vs AI", "attended vs unattended" | Per-step verdict (human/RPA/AI/hybrid) + rationale |
| 8 | `sop-authoring` | "write an SOP", "operational procedure", "make this SOP executable" | Structured SOP + executable SOP when automatable |
| 9 | `business-brain-setup` | "business brain", "cerebro de negocio", "convert our business model folder" | Git/Obsidian knowledge vault (scaffold or BMC migration) |
| 10 | `playbook-authoring` | "write a playbook", "ops playbook", "decision tree", "playbook vs runbook", "escribe un playbook" | When/why playbook (decision tree + options) linking diagnose/recover runbooks |
| 11 | `runbook-authoring` | "write a runbook", "incident runbook", "release runbook", "on-call procedure", "runbook de release" | Trigger-driven runbook (incident or operational) + paired diagnose/repair scripts + executable form |
| 12 | `requirements-authoring` (shared: `shared/skills/requirements-authoring/`) | "PRD", "SRS", "requisitos", "29148", "IEEE 830", "spec for this feature" | Versioned PRD/SRS per ISO/IEEE 830 + ISO/IEC/IEEE 29148:2018 + OpenSpec derived + Linear Bilingual brief |
| 13 | `software-project-management-plan/authoring` (alias: `project-plan/authoring`) | "SPMP", "plan de proyecto", "plan de gestión", "16326", "project management plan" | SPMP per ISO/IEC/IEEE 16326:2019; delegates 16085 companions to `/software-risks-authoring-16085` |
| 14 | `software-risks-authoring-16085` | "plan de gestión de riesgos", "16085", "risk management plan", "risk treatment plan", "tratamiento de riesgos", "Hito 1 Discovery" | Emits ISO/IEC/IEEE 16085 §8.1 RM plan + §8.2 treatments (Eisenhower); NOT ISO 31000 / GRC |
| 15 | `software-project-management-plan/audit` (alias: `project-plan/audit`) | "audit project plan", "auditar SPMP", "16326 gap", "16085 risk audit" | Gap matrix vs 16326 §7 + 16085 §8; optional PMBOK 8 domain overlay |

Project-governance templates (SSOT under `references/software-project-management-plan/`,
plus `references/grc/iso31000/` for org risk) export into `business-brain-template` via
`scripts/export-spmp-templates.sh` — do not author lasting copies only in the brain
template. Atomic `_templates/riesgo.md` stays PMBOK-oriented and is not overwritten.

### CTO domain families (authored per FFF — families × internal taxonomy)

| Family | Skills | Purpose |
|--------|--------|---------|
| `strategy/` | roadmap · portfolio · rnd-alignment | Tech vision, roadmapping, portfolio, R&D alignment |
| `architecture/` | decision · stack-evaluation · migration | ADRs, stack tradeoffs, migration guidance |
| `metrics/` | dora · reliability · velocity · team-health · exec-reporting | DORA, SLO/SLI, engineering velocity, team health, exec narrative |
| `risk/` | audit · incident-response · disaster-recovery · resilience | Security audit framing, IR, DR, resilience |
| `handover/` | risk-to-cro · grc-to-cco · metrics-to-vpeng · architecture-to-principal · strategy-to-board · engagement-to-board · process-to-ops · requirements-to-cpo · standards-to-vpeng | Ownership transfer to organic executives (CRO/CCO/VP Eng/...) |
| `grc/` | universal (incl. `iso31000`) + regional USMCA/LATAM/APAC/EMEA | Compliance frameworks: ISO/NIST/SOC2/PCI/SWIFT/CIS/WCAG + jurisdiction-specific; see `references/grc/iso-mss-family.md` |
| `threat-defense/` | owasp-top10 · owasp-nhi-top10 · mitre-atlas · mitre-attack · mitre-d3fend · ai-defense | Threat & defense: OWASP Top10/NHI, MITRE ATLAS/ATT&CK/D3FEND, AI-defense controls |

## Commands

| Command | Purpose | Output |
|---------|---------|--------|
| `/engineering-standards-setup` | Adopt the engineering standards (index of 32) in a client repo (incremental scaffold) | `AGENTS.md` pointers, `docs/process/engineering-standards.md`, PR template (PRDS), QT4L stub |
| `/engineering-standards-audit` | Measure adoption of the standards index (all 32, parallelizable per family); optional open-PR review | Findings report; optional `docs/process/engineering-standards-audit-<date>.md` |
| `/pentest-playbook-setup` | Author a stack-tailored security playbook for an authorized engagement (Cyber Kill Chain + OWASP). Gated on written authorization + scope | `PENTEST-PLAYBOOK.md` (+ optional DevSecOps `security-scan.yml`); executed afterwards by `/make-no-mistakes:pentest-runner` |

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

- Requirements-first pipeline: PRD/SRS per ISO/IEEE 830 + ISO/IEC/IEEE 29148:2018 (bare template vendored from jam01/SRS-Template, CC0), OpenSpec derived from the PRD, Linear Bilingual-brief issues, and the full `/opsx-*` workflow
- 6 engineering standards bootstrap for any client (DSMS, IFS, CPS, PRDS, BrS, QT4L) + **OST** when using an OpenSpec store
- Bilingual templates (Spanish primary, English key terms)
- Costa Rica legal framework (Ley 8968, Codigo Penal, Camara de Comercio arbitration)
- 7-threat risk matrix (destruction, retention, exfiltration, sabotage, data theft, disruption, extortion)
- Interactive SPA assessment wizard (vanilla JS, dark theme)
- 22 industry verticals (Startups 506 taxonomy)
- CTO operates as persona fisica (independent contractor)

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
