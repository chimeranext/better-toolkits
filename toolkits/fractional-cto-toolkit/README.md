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
- **runbook-authoring** — sibling of sop-authoring for the *event-driven* case: an incident/
  recovery runbook (with paired diagnose/repair scripts) or an operational/release runbook,
  plus an executable form. An SOP documents a steady-state process; a runbook answers a trigger.

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
  verification traceability table.
- Any client adopting this can also bootstrap the **4 engineering best practices**
  (DSMS, IFS, CPS, PRDS) from day one — see `references/engineering-standards/`.

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
| 10 | `runbook-authoring` | "write a runbook", "incident runbook", "release runbook", "on-call procedure", "runbook de release" | Trigger-driven runbook (incident or operational) + paired diagnose/repair scripts + executable form |
| 11 | `requirements-authoring` | "PRD", "SRS", "requisitos", "29148", "IEEE 830", "spec for this feature" | Versioned PRD/SRS per ISO/IEEE 830 + ISO/IEC/IEEE 29148:2018 + OpenSpec derived + Linear Bilingual brief |

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

- Requirements-first pipeline: PRD/SRS per ISO/IEEE 830 + ISO/IEC/IEEE 29148:2018 (bare template vendored from jam01/SRS-Template, CC0), OpenSpec derived from the PRD, Linear Bilingual-brief issues, and the full `/opsx-*` workflow
- 4 engineering best practices bootstrap for any client (DSMS, IFS, CPS, PRDS)
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


## Install (OpenCode) — stderr baseline

This toolkit vendors `hooks/stderr/` (same detector as the rest of better-toolkits).

Register the OpenCode file plugin (required for stderr on OpenCode2):

```jsonc
{
  "plugin": [
    "/absolute/path/to/this-toolkit/hooks/stderr/adapters/opencode-plugin.ts"
  ]
}
```

See monorepo [`docs/opencode-stderr.md`](../../docs/opencode-stderr.md) and [`docs/multi-harness-ssot.md`](../../docs/multi-harness-ssot.md).
