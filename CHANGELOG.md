# Changelog

All notable changes to `venture-studio-toolkit` documented in this file. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) + [Semantic Versioning](https://semver.org/).

## [1.2.0] — 2026-04-15

### Added — Documentation + v1.1 refinements

**README enhancement**:

- **Gastronomic analogy section** — explica Tostada 🫓, Sandwich 🥪, Mil hojas 🥐 como
  naming convention de abogados LATAM (Latitud, Manzano Law, Cooley). Usuarios no-legales
  pueden entender cada patrón visualmente. Con diagramas Mermaid verticales.
- **Mermaid diagrams** — reemplaza ASCII art por diagramas Mermaid `flowchart TD` en:
  - README Tostada + Sandwich structures
  - `attached-fund-structure` govclab architecture (Management Co → GP → Fund → Portfolio)
  - `references/lapc506-services-hub-canonical.md` caso @lapc506 architecture
- **MCP integrations section** en README — pointer a `mcp-integrations-guide.md`

**New reference documents**:

- `references/bilingual-output-guide.md` — schema YAML config completo para bilingual
  (es/en) output, translation preservation rules (NO traducir "Delaware Tostada",
  "Cayman Sandwich", nombres legales de jurisdicciones, acrónimos financieros),
  implementation roadmap per skill (v1.3+)
- `references/mcp-integrations-guide.md` — qué MCPs enhance qué skills (Linear, Context7,
  GitHub, Slack opt-in, Figma, Playwright), pattern de integration recomendado
  (MCP detection + manual fallback), roadmap de implementation

### Pending to implement (documented, not in skills yet)

La v1.2 establece el **framework** para bilingual + MCP integration pero **NO implementa
todavía en skills individuales**. Implementation gradual en v1.3+ basado en dog-food
demand. Documentation-first approach para design validation antes de touching 22 skills.

## [1.1.0] — 2026-04-14

### Added — Services Hub pattern (middle-ground entre serial entrepreneur y formal studio)

**Driven by dog-food of v1.0** ([legacy-ticket](https://linear.app/chimera-coding/issue/legacy-ticket))
against @lapc506 4-venture portfolio. Reveló gap: users con 3-5 ventures wanting shared
services + independent VC raises per venture no tenían pattern — skill saltaba de Multi-LLC
(pattern #2/#3) a Multi-LLC+Holding (pattern #7) sin middle ground. Services Hub llena el gap.

Parent Epic: [legacy-ticket](https://linear.app/chimera-coding/issue/legacy-ticket)

**New skill**:

- `services-hub-setup` ([legacy-ticket](https://linear.app/chimera-coding/issue/legacy-ticket)) —
  implementa Services Hub Model: Services LLC central + N independent Venture LLCs +
  bilateral MSAs. Genera MSA template + SOW template + transfer pricing methodology
  (cost-plus 10% default, OECD-defensible) + IP assignment rider + billing calendar.
  Strong legal disclaimer requiring lawyer review.

**New reference document**:

- `references/lapc506-services-hub-canonical.md` ([legacy-ticket](https://linear.app/chimera-coding/issue/legacy-ticket)) —
  canonical example aplicando Services Hub Model a @lapc506 4-venture scenario (Altrupets,
  Vertivolatam, Habitanexus, Aduanext). Concrete numbers: $6k setup, $4.4k annual.
  Referenced por `services-hub-setup`, `structure-decision`, `when-to-become-studio`.

**Updated skills**:

- `structure-decision` ([legacy-ticket](https://linear.app/chimera-coding/issue/legacy-ticket)) —
  added **pattern #6: Services Hub + Independent Ventures**. Shifted previous #6
  (Multi-LLC + Holding) to #7. Updated decision tree Regla 2 to route 3+ ventures con
  shared services + independent VC raises + no-fund a Services Hub. Added canonical
  case 4 (@lapc506 Services Hub).

- `when-to-become-studio` v1.1.0 ([legacy-ticket](https://linear.app/chimera-coding/issue/legacy-ticket)) —
  refactored from binary (ready/not ready) a **3 operating modes**:
  - Mode 1: Serial entrepreneur puro (0-4 signals) → Multi-LLC sin hub
  - Mode 2: Services Hub operator (5-7 signals) → `services-hub-setup` skill (NUEVO)
  - Mode 3: Formal studio con fund (8+ signals + plan fund) → `attached-fund-structure`

- `shared-services-ledger` v1.1.0 ([legacy-ticket](https://linear.app/chimera-coding/issue/legacy-ticket)) —
  added operating mode selection: Services Hub (bilateral MSAs, independent cap tables)
  vs. Full Studio (centralized via holding). Cada mode con distinct billing, reporting,
  transfer pricing implications.

- `attached-fund-structure` ([legacy-ticket](https://linear.app/chimera-coding/issue/legacy-ticket)) —
  added upfront "¿Este skill es para vos?" section clarifying it's for studios con
  fund-attached plans, NOT serial entrepreneurs. Routes users a `services-hub-setup`
  o `when-to-become-studio` si no aplica.

### Fixed / improved

- Naming consistency: patterns #1-#7 explicitly numbered across all skills
- Cross-references updated: all skill integrations sections reflect new pattern #6
- Case study `chimeranext-labs-canonical-thesis.md` references unchanged (chimeranext Labs
  es Skip-CR pattern #1, no Services Hub)

### Pending for v1.2

- Cross-plugin: update `business-model-toolkit` Fase 13 con Services Hub reference
  ([legacy-ticket](https://linear.app/chimera-coding/issue/legacy-ticket)) — requiere separate PR en
  `business-model-toolkit` repo
- Dog-food the new Services Hub pattern con real-world user outside @lapc506 case
- Implement bilingual output (es/en) per YAML config (deferred from v1.0)
- Add MCP integration for Linear / Carta / Mercury (deferred from v1.0)

## [1.0.0] — 2026-04-14

### Added — Complete initial scope (21 skills + 2 reference docs)

**Scaffolding**:
- Plugin manifest (`.claude-plugin/plugin.json`)
- License (Business Source License 1.1)
- README with full ecosystem context
- `.gitignore`

**Core skills (both modes — 10)**:
- `structure-decision` — 6 corporate structure patterns (Skip-CR, Single-LLC multi-brand, Delaware Tostada, Cayman Sandwich, Delaware C-Corp, Multi-LLC+Holding) with decision tree + migration roadmap + 3 canonical cases
- `structure-evolution-roadmap` — 6 migration routes with specific triggers (ARR, term sheet, geography, exit)
- `jurisdiction-matrix` (reference doc) — 16 jurisdictions across 4 families (LATAM 8 + US 3 + Offshore 3 + EU 2)
- `accelerator-launchpad` — catalog of 12+ external accelerators with fit-scoring algorithm + CIHUBS-style meta-broker
- `three-horizons` — Lean Enterprise cap. 2 portfolio allocation (H1/H2/H3) + 70/20/10 framework
- `explore-exploit` — Lean Enterprise cap. 2 Table 2-1 categorization with management implications
- `innovation-scorecard` — Lean Enterprise cap. 5 Figure 5-2 dashboard + AARRR cohort integration
- `cost-of-delay-cd3` — Lean Enterprise cap. 8 economic prioritization (CD / Duration) + power-law observation
- `sweat-equity-agreement` — vesting + cliff + 83(b) + clawback + FAST extension
- `improvement-kata` — Mike Rother's 5 daily questions + Target Condition + PDCA

**Studio mode skills (9)**:
- `studio-thesis` — Govclab 37-word template + 3-version iteration + validation exercise
- `studio-focus` — Stage × Geography × Industry triangulation (Govclab 5-step)
- `secret-sauce` — 6-metric ranking system (Govclab)
- `studio-archetype-selector` — In-house / External Partnership / Hybrid decision
- `vertical-charter` — mission/scope/success per vertical + Linear integration
- `shared-services-ledger` — transfer pricing compliance + allocation methodology
- `venture-spin-out-playbook` — 7-layer spin-out mechanics (IP, contracts, team, cap table)
- `attached-fund-structure` — Management Co + GP + LP layered per Govclab
- `mensarius-oath-adoption` — optional ethical code for fund managers

**Founder mode skills (3)**:
- `liability-contagion-analysis` — 8 risk dimensions + compatibility matrix
- `cap-table-per-venture` — cap table management with dilution scenarios + SAFE conversion modeling
- `when-to-become-studio` — 9-signal readiness assessment + transition roadmap

**Reference documents**:
- `chimeranext-labs-canonical-thesis.md` — canonical test case with 3 iterations

### Legal disclaimers

All skills touching legal/fiscal domains include explicit disclaimers:
- `structure-decision`, `structure-evolution-roadmap`, `jurisdiction-matrix`
- `sweat-equity-agreement`, `cap-table-per-venture`
- `attached-fund-structure`, `venture-spin-out-playbook`
- `shared-services-ledger`, `liability-contagion-analysis`

These skills generate structured preparation material, NOT legal advice. Users must
validate with specialized lawyers before acting on outputs.

### Based on

- *Lean Enterprise* (Humble, Molesky, O'Reilly — O'Reilly 2015) — chapters 2, 5, 6, 8, 13
- *Toyota Kata* (Mike Rother — McGraw-Hill 2010)
- *Principles of Product Development Flow* (Don Reinertsen — 2009)
- Govclab / VC Lab — venture studio formation + fund formation methodologies
- Latitud / Manzano Law / Carta / Cooley / ECGI — LATAM corporate structures
- Cake Equity / Orchestra / ClearTax — sweat equity + vesting
- CIHUBS (Costa Rica) — accelerator meta-broker pattern
- Dave McClure — Pirate Metrics (AARRR)

### Known limitations

- Bilingual output (es/en) framework defined in README; implementation per-skill pending
  actual dog-fooding (users will validate)
- No GitHub CI/CD yet (Greptile install pending legacy-ticket)
- No MCP integration (no external tool calls from skills yet)
- `vertical-charter` Linear integration is manual — no direct Linear MCP reads yet

### Stability note

v1.0.0 marks **feature-complete scope per the original SPIKE legacy-ticket plan**, but is NOT
battle-tested. Breaking changes possible in v1.x as dog-fooding reveals issues. v2.0
will consolidate lessons learned.

## [0.1.0] — 2026-04-14 (superseded by 1.0.0 same day)

Initial scaffold — see commits for details. This version was the "scaffold + first 3
skills" milestone from SPIKE. Consolidated into 1.0.0 upon completion of the full scope.
