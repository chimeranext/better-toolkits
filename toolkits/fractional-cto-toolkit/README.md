# fractional-cto-toolkit

[![Version](https://img.shields.io/badge/version-1.4.17-blue)](.claude-plugin/plugin.json) [![License: BSL-1.1](https://img.shields.io/badge/license-BSL--1.1-important)](LICENSE)

Claude Code plugin with playbooks, contracts, and guided workflows for freelance
and fractional CTOs.

## Pipeline (single)

One engagement spine. Branches cover process engineering, requirements-first
product work, standards, and domain families.

```text
/contract-nda
   → /takeover-assessment
   → /project-takeover
        emits: playbook-{slug}.md
               client-guide-{slug}.md
               legal-template-delivery-request-{slug}.md
               legal-template-breach-notice-{slug}.md
               (bares in toolkit refs = apprentice expected shape)
   → /contract-psa
        Hito 1 Discovery: SPMP 16326 + 16085
           → /software-project-management-plan/authoring
           → /software-risks-authoring-16085
        → /contract-retainer
        → /oauth2-setup · /pentest-playbook-setup
        → /business-brain-setup

After takeover (or in parallel once standards apply):
   /engineering-standards-audit → /engineering-standards-setup
        → /process-standardization → /automation-triage
             → /sop-authoring | /playbook-authoring | /runbook-authoring
             → /document-it | /document-this
        → /requirements-authoring → /opsx-* flow
        → CTO domain families (strategy · architecture · metrics · risk ·
          GRC · threat-defense · handover)
```

**Full Mermaid flowchart:** [`references/engagement-orchestration.md`](references/engagement-orchestration.md)
(kept out of this README so GitHub render stays stable).

### Governance note

`/contract-psa` makes SPMP + ISO/IEC/IEEE 16085 **Milestone 1 (Discovery)** on
the standard path. Preventa ships `*-bare.md` outlines only. After signature,
invoke `/software-project-management-plan/authoring` and
`/software-risks-authoring-16085` to fill them (Eisenhower gates §8.2 treatments).
High-governance pre-signature fill is opt-in and **not recommended** for
Fractional CTOs without prior preventa negotiation experience (unpaid engineering
risk). Org GRC stays `/iso31000`. Operational `risk/*` is a different family.

### Process engineering (branch)

```
/process-standardization  →  /automation-triage  →  /sop-authoring
   discover + capture           decide the how         write the SOP
```

Also: `/playbook-authoring` (when/why), `/runbook-authoring` (how),
`/document-this` (route the type). Shared artifact home:
`./fractional-cto/sops/{slug}/`.

### Requirements-first (branch)

```
PRD / SRS (ISO/IEEE 830 + ISO/IEC/IEEE 29148:2018, bare template)
   → OpenSpec specs/changes → Linear Bilingual brief → /opsx-* flow
```

Shared home: `shared/skills/requirements-authoring/` +
`shared/references/requirements-authoring/`.

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
| 12 | `requirements-authoring` (shared) | "PRD", "SRS", "requisitos", "29148", "IEEE 830" | Versioned PRD/SRS + OpenSpec + Linear brief |
| 13 | `software-project-management-plan/authoring` | "SPMP", "16326", "plan de gestión" | SPMP per ISO/IEC/IEEE 16326:2019 |
| 14 | `software-risks-authoring-16085` | "16085", "risk management plan", "Hito 1 Discovery" | 16085 §8.1 RM + §8.2 treatments (Eisenhower) |
| 15 | `software-project-management-plan/audit` | "audit project plan", "16326 gap", "16085 risk audit" | Gap matrix vs 16326 §7 + 16085 §8 |

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
| `handover/` | risk-to-cro · grc-to-cco · metrics-to-vpeng · architecture-to-principal · strategy-to-board · engagement-to-board · process-to-ops · requirements-to-cpo · standards-to-vpeng | Ownership transfer to organic executives |
| `grc/` | universal (incl. `iso31000`) + regional USMCA/LATAM/APAC/EMEA | Compliance frameworks |
| `threat-defense/` | owasp-top10 · owasp-nhi-top10 · mitre-atlas · mitre-attack · mitre-d3fend · ai-defense | Threat and defense controls |

## Commands

| Command | Purpose | Output |
|---------|---------|--------|
| `/engineering-standards-setup` | Adopt the engineering standards (index of 32) in a client repo | `AGENTS.md` pointers, standards doc, PR template, QT4L stub |
| `/engineering-standards-audit` | Measure adoption of the standards index | Findings report |
| `/pentest-playbook-setup` | Author a stack-tailored security playbook (authorized engagement) | `PENTEST-PLAYBOOK.md` |

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

- Single engagement pipeline (takeover → PSA Hito 1 → retainer / standards / requirements branches)
- Takeover pack: playbook + Diátaxis client guide + two legal templates (`{{placeholders}}`). Bares for apprentices
- Requirements-first: PRD/SRS bare + OpenSpec + `/opsx-*`
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
