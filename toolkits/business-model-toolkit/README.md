# business-model-toolkit

Interactive business model brainstorming — guided dialogue covering the full startup lifecycle from problem validation through execution and investor pitch.

A Claude Code plugin by [Luis Andres Pena Castillo](https://github.com/lapc506).

## Install (Claude Code)

```bash
claude plugin add lapc506/business-model-toolkit
```

## Install (OpenCode)

```bash
npx @lapc506/business-model-toolkit install
```

### CLI Commands

```bash
business-model-toolkit install          # Install to ~/.config/opencode/
business-model-toolkit update           # Refresh managed assets
business-model-toolkit uninstall        # Remove managed files only
business-model-toolkit doctor           # Health check
business-model-toolkit doctor --json    # Machine-readable output
business-model-toolkit install --dry-run  # Preview changes
business-model-toolkit install --force    # Overwrite unmanaged conflicts
```

## What's Inside

### Commands (2)

| Command | Description |
|---------|-------------|
| `/business-model-toolkit:brainstorm` | Full guided lifecycle — 21 phases across 3 spaces with validation gates |
| `/business-model-toolkit:simulate` | Simulation mode — same flow but nothing is saved, everything shown in conversation |

### Skills (5)

Auto-activate by lifecycle phase — you can also invoke them directly.

| Skill | Phases | Triggers when you... |
|-------|--------|---------------------|
| `problem-validation` | 1-5 | Say "validate my idea", "founder profile", "customer forces" |
| `solution-design` | 6-8 | Say "business model canvas", "BMC", "MVP experiment" |
| `execution-plan` | 9-13 | Say "revenue model", "unit economics", "financial model" |
| `growth-acceleration` | 14-17 | Say "go-to-market", "product roadmap", "hiring plan" |
| `pitch-deck` | 18 | Say "pitch deck", "investor presentation" |

### Agent (1)

| Agent | Model | Purpose |
|-------|-------|---------|
| `market-researcher` | Sonnet | Background research during Phase 5 — competitors, market size, failed startups |

## The Lifecycle

```
SPACE 1: PROBLEM-HYPOTHESIS
  Phase 1: Founder Profile
  Phase 2: Problem Validation
  Phase 3: Customer Profile (JTBD + Complexity Dimensions)
  Phase 4: Customer Forces (Push/Pull/Anxiety/Inertia)
  Phase 5: Market Research (+ background agent)
  --- GATE 1: Is the problem real? ---

SPACE 2: SOLUTION-VALIDATION
  Phase 6: Business Model Canvas (14 modules)
  Phase 7: Solution Interview
  Phase 8: MVP Experiment
  --- GATE 2: Would someone pay? ---

SPACE 3a: EXECUTION
  Phase 9:  Revenue Model
  Phase 10: Unit Economics (CAC, LTV, Churn)
  Phase 11: Financial Model
  Phase 12: Brand & Identity
  Phase 13: Legal Foundation
  --- GATE 3: Financial and legal foundation solid? ---

SPACE 3b: ACCELERATION
  Phase 14: Go-to-Market
  Phase 15: Product Roadmap
  Phase 16: Team & Hiring
  Phase 17: Advisory Board
  --- GATE 4: Operational foundation ready for investors? ---

PITCH
  Phase 18: Pitch Deck (MARP format)

PACKAGING
  Phase 19: Business README
  Phase 20: Project README
  Phase 21: SRD Integration
```

## Output

Normal mode writes to `./business/`:

```
./business/
├── 01-problema-hipotesis/
│   ├── 01-perfil-fundador.md
│   ├── 02-entrevista-problema.md
│   ├── 03-perfil-expectativas-cliente.md
│   ├── 04-fuerzas-del-cliente.md
│   └── 05-investigacion-mercado.md
├── 02-solucion-validacion/
│   ├── 00-bmc-indice.md
│   ├── 01-bmc-problema.md ... 14-bmc-metricas-impacto.md
│   ├── 15-entrevista-solucion.md
│   └── 16-experimento-mvp.md
├── 03-ejecucion-aceleracion/
│   ├── 01-modelo-de-ingresos.md ... 10-pitch-deck.md
└── README.md
```

## Methodology

Combines:
- **Running Lean** (Ash Maurya) — Problem/Solution validation
- **Lean Canvas** — Business Model Canvas adaptation for startups
- **Founder Institute** — Founder profile, advisory board, legal foundation
- **SRD** (Synthetic Reality Development) — Optional integration at the end

## Language

All content is generated in **Spanish**. Business terms appear as "Spanish (English)" the first time, then just the acronym. Framework names stay in their original language.

## Requirements

- **Claude Code** — the CLI or IDE extension
- **WebSearch** — for market research agent (Phase 5)
- **SRD Framework plugin** — optional, for Phase 21 integration

## Architecture

```
business-model-toolkit/
├── .claude-plugin/
│   ├── plugin.json
│   └── marketplace.json
├── commands/           # 2 entry points
│   ├── brainstorm.md
│   └── simulate.md
├── agents/             # 1 background agent
│   └── market-researcher.md
├── skills/             # 5 auto-activating by phase
│   ├── problem-validation/
│   ├── solution-design/
│   ├── execution-plan/
│   ├── growth-acceleration/
│   └── pitch-deck/
├── references/         # Shared methodology
│   ├── methodology.md
│   ├── output-structure.md
│   └── readme-guide.md
├── assets/templates/   # 7 deliverable templates
└── README.md
```

## License

[Business Source License 1.1](./LICENSE) — you may use, modify, and redistribute for non-competitive purposes. Converts to Non-Profit OSL 3.0 after 5 years.
