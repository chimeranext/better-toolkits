# fractional-cto-toolkit

Claude Code plugin with SOPs, contracts, and guided workflows for freelance and fractional CTOs.

## Engagement Lifecycle

```
1. PRE-ENGAGEMENT     /contract-nda           NDA signed before sharing info
2. ASSESSMENT          /takeover-assessment    Risk evaluation + SPA wizard
3. TAKEOVER            /project-takeover       4 SOP documents for execution
4. PROJECT WORK        /contract-psa           Project-Specific Agreement
5. ONGOING             /contract-retainer      Retainer or Advisory+Equity
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

## Commands

| Command | Purpose | Output |
|---------|---------|--------|
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
