---
name: startup-intake
version: 0.1.0
description: >
  AI intake interview structured to produce a `startup-profile.md` artifact
  compatible schema-wise with chimeranext Launchpad Startup Profile. Use when the
  user asks "startup intake", "startup profile", "onboard my startup",
  "create startup profile", "AI intake", "/startup-intake". Produces a
  structured profile covering problem, customer, solution, team, stage,
  traction, and funding needs — ready for co-founder matching, investor
  matching, and demo day prep in subsequent skills (or chimeranext Launchpad).
---

# Startup Intake

Estructura un **AI intake interview** que produce un `startup-profile.md` artifact. Este artifact es el input canonical para skills downstream (`cofounder-matching`, `investor-matching`, `demo-day-prep`, `stage-tracker`) y **schema-compatible** con el Startup Profile de chimeranext Launchpad.

## Regla de idioma

Español. Términos técnicos (pitch, MRR, ARR, CAC, LTV, MVP, PMF, etc.) se mantienen en inglés.

## Directorio de salida

```
./launchpad/{startup-slug}/
└── startup-profile.md
```

Donde `{startup-slug}` se genera del nombre de la startup en kebab-case.

---

## ¿Por qué este skill existe?

Dos audiencias:

1. **External** — founders independientes que necesitan articular su startup estructuradamente por primera vez (onboarding metodológico)
2. **Internal** — William Ugalde usa el dog-food para validar qué preguntas + estructura de output funcionan mejor antes de productizar en chimeranext Launchpad

**Non-negotiable**: el output schema debe ser compatible con el chimeranext Startup Profile format para que features de matching (cofounder, investor) downstream puedan consumirlo directamente cuando migren a chimeranext.

---

## Interview flow

### Fase 1 — Core identity (2-3 preguntas)

**SI-1**: "Nombre legal de la startup + tagline corto (≤10 palabras)."

**SI-2**: "¿En qué etapa estás? Elegí una:
- Ideation (validando el problema)
- Formation (formado el equipo fundador)
- MVP (construyendo/validando el producto)
- Traction (early revenue, iterando)
- Funded (post-raise, escalando)
- Scaling (post-PMF, expandiendo)"

**SI-3**: "Industry/vertical (ej: fintech, healthtech, SaaS B2B, marketplace, consumer social...)."

### Fase 2 — Problem + customer (3 preguntas)

**SI-4**: "¿Qué problema resuelve tu startup? Describilo en 1-2 oraciones desde la perspectiva del customer (no desde la solución)."

**SI-5**: "¿Quién es tu ICP (Ideal Customer Profile)? Describí:
- Demographics/firmographics
- Behaviors relevantes
- Pain-point específico que ya intenta resolver"

**SI-6**: "¿Cómo validaste que este problema es real? (entrevistas hechas, data de mercado, experiencia personal, etc.)"

### Fase 3 — Solution + differentiation (3 preguntas)

**SI-7**: "Describí la solución en 2-3 oraciones (qué construís, no cómo lo construís)."

**SI-8**: "¿Cuál es tu unfair advantage? ¿Qué te hace defensible vs competidores? (network effects, IP, team expertise, data moat, timing, etc.)"

**SI-9**: "Top 3 competidores directos o indirectos. ¿Cómo te posicionás vs ellos?"

### Fase 4 — Team (2-3 preguntas)

**SI-10**: "Equipo actual:
- Founders (nombre, rol, full-time/part-time, equity split preliminar)
- Early employees si hay (rol, comp cash/equity)
- Advisors formales si hay"

**SI-11**: "¿Tenés gaps de co-founder/early team que todavía necesitás fillear? (ej: necesitás CTO, marketing lead, etc.). Si sí → flag para `cofounder-matching` skill."

### Fase 5 — Traction + metrics (depends on stage)

**Si stage = Ideation**:

**SI-12a**: "Interviews completadas + número de potenciales customers que validaron el problema."

**Si stage = MVP / Traction / Funded / Scaling**:

**SI-12b**: "Métricas core actuales:
- Users/customers (qty)
- Revenue: MRR o ARR (si aplica)
- CAC, LTV (si tenés data)
- Growth rate (MoM, WoW)
- Churn (si aplica)
- Unit economics status (contribution margin, breakeven point)"

### Fase 6 — Funding (2 preguntas)

**SI-13**: "Funding raised hasta hoy:
- Amount total
- Instruments (SAFE, equity, debt, grants)
- Investors clave (nombres o anonymizar si confidential)"

**SI-14**: "¿Estás raising actualmente? Si sí:
- Amount target
- Valuation target (pre/post-money)
- Use of funds (hiring, marketing, product, runway...)
- Timeline para close"

### Fase 7 — Goals + bottlenecks (2 preguntas)

**SI-15**: "Top 3 goals para los próximos 6 meses."

**SI-16**: "Top 3 bottlenecks o blockers actuales (lo que más te está trabando)."

---

## Output template

Generar `./launchpad/{startup-slug}/startup-profile.md`:

```markdown
# Startup Profile — [Startup Legal Name]

**Profile date**: YYYY-MM-DD
**Tagline**: [≤10 words]
**Stage**: [Ideation / Formation / MVP / Traction / Funded / Scaling]
**Industry**: [Vertical]

---

## Problem + customer

### Problem statement

[Customer-perspective description, 1-2 sentences]

### ICP (Ideal Customer Profile)

- **Demographics/firmographics**: [details]
- **Behaviors**: [details]
- **Current alternative they use**: [what they do today to try to solve the pain]

### Problem validation

[How it was validated — interviews count, market data, personal experience, etc.]

---

## Solution + differentiation

### Solution

[2-3 sentences, WHAT is built, not HOW]

### Unfair advantage

[Network effects / IP / team expertise / data moat / timing / other]

### Competitors

| Competitor | Direct/indirect | Positioning vs them |
|---|---|---|
| [Name 1] | [Direct/Indirect] | [How we differ] |
| [Name 2] | [Direct/Indirect] | [How we differ] |
| [Name 3] | [Direct/Indirect] | [How we differ] |

---

## Team

### Founders

| Name | Role | Time commitment | Equity % |
|---|---|---|---|
| [Founder 1] | [CEO/CTO/etc.] | Full-time | X% |
| [Founder 2] | [Role] | [Full-time/Part-time] | X% |

### Early employees

[None / list with role + cash/equity comp]

### Advisors

[None / list with names + domain]

### Team gaps

[None / list roles needed — flag for `cofounder-matching` or hiring skill]

---

## Traction + metrics

[If Ideation: interviews + validation signals]
[If MVP+: users, MRR/ARR, CAC/LTV, growth rate, churn, unit economics]

---

## Funding

### Raised to date

- **Total**: $X
- **Instruments**: [SAFE / equity / debt / grants]
- **Key investors**: [Names or anonymized]

### Current raise (if active)

- **Target amount**: $X
- **Target valuation**: $Y pre-money / $Z post-money
- **Use of funds**: [hiring / marketing / product / runway]
- **Timeline to close**: [date or horizon]

[If not raising: "Not actively raising"]

---

## Goals (next 6 months)

1. [Goal 1]
2. [Goal 2]
3. [Goal 3]

---

## Bottlenecks / blockers

1. [Blocker 1]
2. [Blocker 2]
3. [Blocker 3]

---

## Schema notes (for chimeranext compat)

This profile follows the chimeranext Launchpad Startup Profile schema (as of chimeranext Launchpad spec 2026-04). Fields map 1:1:

- `name` → Legal Name
- `tagline` → Tagline
- `stage` → Stage (enum: Ideation/Formation/MVP/Traction/Funded/Scaling)
- `industry` → Industry
- `problem`, `icp`, `solution`, `unfair_advantage` → Problem + Solution sections
- `founders`, `team_gaps` → Team section
- `metrics` → Traction + metrics section (flexible schema based on stage)
- `funding` → Funding section
- `goals`, `blockers` → Goals + Bottlenecks sections

When chimeranext Launchpad API is implemented (by @garbanzo), this file can be POSTed directly as a Startup Profile.
```

---

## Principios clave

- **Schema-compat with chimeranext is non-negotiable** — this is the key integration point
- **Stage-aware questions**: no preguntar ARR a un Ideation stage startup; preguntar interviews count en su lugar
- **One Question at a Time cuando sea posible**: permite thinking time + profundización
- **Shortcut mode**: si founder ya tiene profile estructurado (ej: migrando de otra tool), aceptar import en lugar de interview completa

## Anti-patterns

- Preguntar todo en un solo dump → overwhelming, producer pobre quality answers
- Skippear validation question (SI-6) → sin validation el profile no sirve para matching downstream
- Hardcodear stage-specific questions sin branchear → preguntas irrelevantes frustran al founder

## Integración con otras skills

- **Downstream consumers** (v0.2+): `cofounder-matching`, `cap-table-builder`, `founder-documents`, `investor-matching`, `demo-day-prep`, `stage-tracker` — todos consumen `startup-profile.md` como input
- **`feature-to-spike`**: si durante el intake el founder identifica un flow que sería valioso en chimeranext Launchpad, generar SPIKE issue con `feature-to-spike`
- **Plugin ecosystem**:
  - `business-model-toolkit` — complementario para deep-dive en fases específicas (problem validation, solution design)
  - `ux-research-toolkit` — complementario para customer journey maps del ICP identificado

## Roadmap

- **v0.1**: intake básico + output schema chimeranext-compat
- **v0.2**: integración con `cap-table-builder`, `founder-documents` (auto-generate cap table + agreements del team section)
- **v0.3**: chimeranext API POST cuando @garbanzo la implemente

## Recursos

- **chimeranext Launchpad current spec**: `chimera-documentation/content/docs/product/launchpad/startup-flows.md`
- **Lean Customer Development** (Cindy Alvarez, O'Reilly 2014) — base metodológica para problem validation questions
- **Y Combinator Application** — inspiration para estructura del intake (pero adaptado para AI, no for human review)
