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

## Skills

| # | Skill | Triggers | Output |
|---|-------|----------|--------|
| 1 | `contract-nda` | "NDA", "confidencialidad" | Bilingual NDA |
| 2 | `takeover-assessment` | "assessment", "evaluacion de riesgo", "threat matrix" | SPA wizard + assessment contract |
| 3 | `project-takeover` | "takeover", "handover", "el dev anterior" | 4 SOPs (tecnico, guia cliente, solicitud, ultimatum) |
| 4 | `contract-psa` | "contrato de proyecto", "PSA", "scope of work" | PSA with shared risk model (A/B/C) |
| 5 | `contract-retainer` | "retainer", "mensual", "equity", "advisory" | Retainer or Advisory+Equity contract |

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
