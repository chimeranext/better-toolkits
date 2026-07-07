---
name: vertical-charter
version: 1.0.0
description: >
  Defines mission, scope, success criteria, and resource allocation for each
  vertical within a studio (e.g., chimeranext, Civic Tech, B2B Factory). Integrates
  with Linear teams as the operational home of each vertical. Use when the user
  asks "vertical charter", "team charter", "vertical mission", "studio vertical",
  "Linear team mission", "define vertical scope", "/vertical-charter".
---

# Vertical Charter

Define la **misión, scope, success criteria, y resource allocation** de cada vertical
dentro del studio. Cada vertical suele mapear a un Linear team (ej. chimeranext, Civic Tech,
B2B Factory en chimeranext Labs).

## ⚠️ DISCLAIMER

Esta skill NO tiene implicaciones legales fuertes como las otras batch-complex skills.
Es organizacional/operacional. Sin embargo:

- Los charter charts deberían reviewed con studio leadership (no dictated unilaterally)
- Cambios de scope de vertical pueden afectar team morale — communication importante

## Regla de idioma

Español. Términos organizacionales en "español (English)" primera vez.

## Directorio de salida

```
./portfolio/{studio-name}/verticals/
├── {vertical-name}/
│   ├── charter.md                    # Mission + scope + success + resources
│   ├── ventures-in-scope.md          # Ventures que pertenecen a esta vertical
│   └── linear-integration.md         # Mapeo a Linear team + projects
└── studio-verticals-overview.md      # Vista consolidada de todas las verticals
```

---

## ¿Qué es un vertical?

Un **vertical** es una unidad organizacional dentro del studio que agrupa ventures por
**tema común** (industria, customer type, technology layer).

### Ejemplos (chimeranext Labs)

- **chimeranext**: product pillar — operating system para developers (Launchpad, Forum, Marketplace, Chimera Score, etc.)
- **Civic Tech**: tech para sector público / govtech
- **B2B Factory**: custom software development para clientes enterprise (Software Factory + Chimera Projects)

### Cuándo crear vertical nueva

- 3+ ventures con overlap temático significativo
- Leadership dedicated a ese tema
- Recursos (budget, team) ameritan agrupación
- Fundraising story más fuerte agrupado que disperso

### Cuándo NO crear vertical

- Solo 1 venture en ese tema (prematuro)
- Overlap forzado ("podríamos meter X y Y juntos" sin rationale orgánico)
- Solo por org chart vanity

---

## Componentes de un charter

### 1. Mission statement

Una oración que articula el purpose de la vertical.

Ejemplo: *"chimeranext construye el sistema operativo para developers — desde aprender el craft hasta emprender con comunidad."*

### 2. Scope (in + out)

**In scope**: qué ventures / productos / actividades pertenecen

**Out of scope**: qué NO pertenece (ventures similares que deliberately NO se incluyen)

Ejemplo:
- In scope chimeranext: Launchpad, Forum, Marketplace, Chimera Score, Pathways, Agent Doji
- Out of scope: consulting services (están en B2B Factory), hackathons para clientes externos (están en otra vertical)

### 3. Success criteria

Métricas objetivas de success para la vertical como entidad (agregado de ventures).

Ejemplos:
- MRR combinado de ventures ≥ $X/mes
- Active users across verticals ≥ Y
- NPS promedio ponderado ≥ Z
- Cross-venture user retention ≥ W

### 4. Resource allocation

- Budget asignado (cash + shared services hours)
- Headcount dedicado
- Overhead % asignado

### 5. Leadership

- Vertical lead (owner)
- Sub-leads por venture dentro del vertical
- Reports-to

### 6. Integration con Linear

Linear team correspondiente + labels/projects usados.

---

## Flujo del skill

### Paso 1 — Inventario de verticals actuales

**VC-1**: "¿Cuáles son las verticals existentes del studio?
- Ej. chimeranext, Civic Tech, B2B Factory (chimeranext Labs ejemplo)
- Si no hay definidas explícitamente, identificar cuáles emergerían naturalmente
  agrupando las ventures por tema"

### Paso 2 — Para cada vertical, definir mission

**VC-2**: "Mission statement de [vertical]:
- Una oración, máximo 20 palabras
- Articula *purpose*, no *features*
- Diferenciable de otras verticals
- Resonates con el equipo (si team la lee y no les inspira, no es buena mission)"

### Paso 3 — Scope

**VC-3**: "In scope vs. out of scope:
- In scope: ventures/productos/actividades que pertenecen
- Out of scope: ventures similares que deliberately NO se incluyen (y por qué)"

### Paso 4 — Success criteria

**VC-4**: "3-5 métricas success, quarterly measurable:
- Financial (MRR, ARR, etc.)
- User-facing (NPS, users, retention)
- Strategic (market share, brand metrics)"

### Paso 5 — Resources

**VC-5**: "Allocation actual:
- Budget mensual: $X
- FTE dedicado: N personas
- Studio overhead %: Z%
- Shared services usage: [link to shared-services-ledger]"

### Paso 6 — Leadership + governance

**VC-6**: "Governance:
- Vertical lead (name): [person]
- Reports to: [who]
- Sub-leads por venture dentro del vertical
- Meeting cadence (weekly stand-up, quarterly review)"

### Paso 7 — Linear integration

**VC-7**: "Linear setup:
- Team ID + name
- Projects correspondientes
- Labels usadas para cross-venture work
- Workflow custom si aplica"

---

## Output

Generar `./portfolio/{studio}/verticals/{vertical}/charter.md`:

```markdown
# Vertical Charter — [Vertical Name]

**Effective**: YYYY-MM-DD
**Owner**: [lead name]
**Reports to**: [studio lead]

## Mission

> *"[One-sentence mission, <20 words]"*

## Scope

### In scope

- [Venture 1]: [brief description]
- [Venture 2]: [brief description]
- [Activity 3]: [brief description]

### Out of scope

- [Similar venture not included]: because [reason]
- [Similar activity not included]: because [reason]

## Success criteria (Q[N] YYYY)

| Metric | Current | Target | Timeline |
|---|---|---|---|
| [Metric 1] | X | Y | End of QN |
| [Metric 2] | X | Y | End of QN |
| [Metric 3] | X | Y | End of QN |

## Resources

- **Monthly budget**: $X
- **FTE dedicated**: N
- **Shared services allocation**:
  - Engineering: X hours/month
  - Design: Y hours/month
  - Marketing: Z% revenue-based allocation

## Team

- **Vertical lead**: [name]
- **Venture leads**:
  - [Venture 1]: [lead]
  - [Venture 2]: [lead]
- **Contributors**: [list]

## Governance cadence

- Weekly stand-up: [day], 30 min
- Monthly review: [date], 60 min
- Quarterly planning: [start of Q], 2 hours
- Annual charter review: [month]

## Linear integration

- **Team**: [Linear team name + ID]
- **Projects**:
  - [Project 1]
  - [Project 2]
- **Labels**:
  - [label 1]: [purpose]
  - [label 2]: [purpose]

## Dependencies + blockers

- **Depends on**:
  - [Other vertical 1]: [for what]
  - [Shared service]: [for what]
- **Blocks**:
  - [Other vertical]: [for what]

## Decision authority

- **Vertical lead decides**:
  - Feature prioritization within ventures
  - Hiring within FTE budget
  - Venture-level OKRs
- **Studio lead approves**:
  - Budget changes > 20%
  - Spinning out / killing a venture
  - Cross-vertical initiatives
- **Collective (all verticals + studio lead)**:
  - Shared services policy changes
  - Studio thesis changes

## Review

This charter is reviewed quarterly. Major changes (mission, scope) require approval from
studio lead + vertical team consensus.

- Next review: [date]
- Charter version: [semver]
- Previous versions: [links if revisions]
```

---

## Overview doc

Generar `./portfolio/{studio}/verticals/studio-verticals-overview.md`:

```markdown
# Studio Verticals Overview — [Studio Name]

## Verticals active

| Vertical | Lead | Mission (short) | Revenue contribution | FTE |
|---|---|---|---|---|
| [Vertical 1] | [name] | [1 line] | $X | N |
| [Vertical 2] | [name] | [1 line] | $X | N |
| [Vertical 3] | [name] | [1 line] | $X | N |

## Cross-vertical dependencies

[Diagram or list of dependencies between verticals]

## Studio-level focus

Based on all vertical charters, the studio's overall focus is:

- [Common theme 1]
- [Common theme 2]

[This helps validate that verticals are coherent vs. disconnected]
```

---

## Principios clave

- **Mission <20 palabras**: más largo = mushy
- **Scope explicit (in AND out)**: evita creep + empire building
- **Success metrics measurable**: vanity metrics matan charters
- **Linear integration**: teams should be actual operational home
- **Review cadence**: charters stale sin review periódico
- **Approval gates**: changes de mission requieren collective approval, no unilateral

## Anti-patterns

- Mission que suena a marketing speak ("transform industries through innovation") — vacío
- Scope expansive ("include all tech") → vertical sin foco
- Success metrics solo financieras → miss user value
- Leader assignment sin accountability clara
- Linear team creation sin charter → team sin norte
- Charter written by studio lead alone — team doesn't buy in

## Integración con otras skills

- **`three-horizons`**: verticals contienen ventures en diferentes horizons; el charter refleja balance
- **`explore-exploit`**: verticals usualmente tienen mix de ventures Explore + Exploit
- **`innovation-scorecard`**: el scorecard de cada vertical rolls up al studio scorecard
- **`shared-services-ledger`**: resources se allocate a verticals, luego a ventures dentro
- **`studio-thesis`**: thesis del studio debería incluir qué verticals operan

## Recursos

- **Tuckman's stages of group development** — team formation
- **Squads / Tribes model** (Spotify) — adaptation de verticals
- **Holacracy** — more extreme model de self-governing circles
- **Linear** — tool for implementing vertical teams operationally
