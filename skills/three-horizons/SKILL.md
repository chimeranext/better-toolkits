---
name: three-horizons
version: 1.0.0
description: >
  Classifies a portfolio of ventures into Three Horizons (H1/H2/H3) from
  Lean Enterprise (Humble/Molesky/O'Reilly, 2015) cap. 2, and recommends
  resource allocation across horizons (classic 70/20/10 by Google, or
  studio-specific). Use when the user asks "three horizons", "portfolio
  allocation", "H1 H2 H3", "cómo asigno recursos entre ventures",
  "70/20/10", "studio portfolio balance", "/three-horizons", or has a
  multi-venture portfolio and needs to decide where to invest time/money.
  Complementary to explore-exploit categorization and cost-of-delay-cd3
  prioritization.
---

# Three Horizons — Portfolio Allocation

Clasifica las ventures del portafolio en los tres horizontes de *Lean Enterprise*
(cap. 2) y recomienda asignación de recursos.

## Regla de idioma

Español. Términos de innovation/strategy en "español (English)" primera vez.

## Directorio de salida

```
./portfolio/{studio-o-founder-name}/
├── three-horizons.md                    # Clasificación + allocation recomendada
└── horizons-review-YYYY-QN.md           # Revisión trimestral (snapshot temporal)
```

---

## Framework

Attribution chain: originado en **McKinsey** ("The Alchemy of Growth", Baghai/Coley/White 1999), popularizado por **Geoffrey Moore** ("Escape Velocity" 2011), y adaptado para enterprise transformation en **Lean Enterprise** cap. 2 (Humble/Molesky/O'Reilly 2015):

### Horizon 1 (H1) — Current Businesses (0-12 meses)

**Qué son**: ventures con revenue actual generando cash para el studio/portfolio.

**Objetivo**: maximizar retornos económicos.

**Métricas**:
- Revenue vs. plan
- Market share
- Profitability
- Customer retention

**Cultura**: **Exploit mode** — optimización incremental, foco en quality y customer satisfaction.

### Horizon 2 (H2) — High-Growth Businesses (12-36 meses)

**Qué son**: ventures growth-stage que están escalando revenue.

**Objetivo**: cross the chasm (Geoffrey Moore) — pasar de early adopters a mainstream.

**Métricas**:
- Rate of sales growth
- Target accounts captured
- Channel scale

**Cultura**: **Híbrido** — experimentación en growth tactics + optimización de funnel.

### Horizon 3 (H3) — Growth Options (36-72 meses)

**Qué son**: apuestas experimentales — ventures aún buscando product-market fit.

**Objetivo**: validar hipótesis, crear opciones sobre futuro growth.

**Métricas** (NO revenue — ese mata H3):
- Buzz / word-of-mouth
- Popularity (signups, early users)
- Name-brand customers (logos aceptables para early pilot)

**Cultura**: **Explore mode** — alta tolerancia al fracaso, foco en learning.

### Regla clave

**No aplicar métricas H1 a ventures H3**. El error más común en studios: matar un H3 porque "no tiene revenue" — su métrica NO es revenue, es aprendizaje.

---

## Allocation recomendadas

### Google / Intuit — 70/20/10

- **H1**: 70% de recursos (time, money, team)
- **H2**: 20%
- **H3**: 10%

Funciona bien para **studios maduros** con revenue en H1 significativo.

### Para early studios (pre-revenue dominant)

Invertir reverso — más en H2/H3 porque no hay H1 sólido aún:

- **H1**: 20-30% (mantener las pocas cosas que generan cash)
- **H2**: 40-50% (growth stage — buscando el winner)
- **H3**: 25-35% (explorando próximas apuestas)

### Para fund-backed studios (Kickstarter model)

Según fund thesis (ver skill `studio-thesis`):

- Pre-seed thesis → 80% H3, 20% H2 (casi todo son bets nuevas)
- Seed thesis → 40% H2, 40% H3, 20% H1
- Series A thesis → 60% H1, 30% H2, 10% H3

---

## Flujo del skill

### Paso 1 — Listar ventures del portfolio

**TH-1**: "Enumera tus ventures actuales (o planeadas). Por cada una:
- Nombre
- Stage (idea / MVP / pre-seed / seed / growth / mature)
- Revenue mensual actual
- Años operando
- Equipo dedicado (% de FTE si compartido)"

Leer también `structure-decision.md` y `studio-thesis.md` si existen, para contexto
del studio/founder.

### Paso 2 — Clasificar en Horizons

Aplicar reglas:

- **H1** si: revenue recurring sustancial + unit economics positivos + foco en optimizar
- **H2** si: revenue creciendo MoM + equipo growing + scaling channels
- **H3** si: aún validando PMF + sin revenue significativo + experimentos activos

Casos híbridos: si una venture "está entre H2 y H3", generalmente es H2 con elementos de H3 (o se está atrasando en crecer).

### Paso 3 — Evaluar allocation actual vs. recomendada

Preguntar:

**TH-2**: "¿Qué % de tu tiempo estás dedicando a cada horizon hoy?"

**TH-3**: "¿Qué % del budget (dinero) estás asignando?"

Comparar contra la recomendación teórica (70/20/10 o variantes).

### Paso 4 — Identificar desbalances

Red flags comunes:

- **90% en H1, 0% en H3**: studio se vuelve "maintenance mode". En 2-3 años no hay ventures nuevas que reemplacen las maduras. Innovation death spiral.
- **10% en H1, 90% en H3**: studio se quema sin monetizar. Unsustainable si no hay runway grande.
- **H2 vacío**: "missing middle" — hay ventures maduras y bets nuevas, pero nada en crecimiento. Indica que H3 no se está graduando (¿por qué?).
- **H3 con demasiadas bets**: >5 bets simultáneas en H3 dispersa atención. Matar algunas.
- **Una venture consume >50% del horizon 1**: concentración de riesgo — si falla, studio entero tambalea.

### Paso 5 — Recomendación ajustada

Dar recomendación específica al caso, NO genérica 70/20/10:

```markdown
## Recomendación para [studio name]

### Allocation actual

| Horizon | % Time | % Budget | Ventures |
|---|---|---|---|
| H1 | X% | X% | [list] |
| H2 | X% | X% | [list] |
| H3 | X% | X% | [list] |

### Allocation recomendada (12 meses)

| Horizon | % Time | % Budget | Rationale |
|---|---|---|---|
| H1 | X% | X% | [per-case reasoning] |
| H2 | X% | X% | [per-case reasoning] |
| H3 | X% | X% | [per-case reasoning] |

### Acciones concretas

1. [Acción específica, ej. "reasignar 15% del tiempo de Pathways a Agent Doji"]
2. [Acción específica]
3. [Acción específica]
```

### Paso 6 — Review trimestral

Cada Q, re-evaluar:

- ¿Alguna H3 graduó a H2? (signals: PMF validated, MRR creciendo)
- ¿Alguna H2 maduró a H1? (signals: sustained profitable, predictable)
- ¿Alguna H1 empezó a declinar? (re-categorizar o matar)
- ¿Nueva H3 a agregar al portfolio?

Generar `horizons-review-YYYY-QN.md` cada trimestre.

---

## Aplicación al caso chimeranext Labs

Ejemplo con ventures reales (snapshot estimado Q2 2026):

| Venture | Stage actual | Horizon | Razón |
|---|---|---|---|
| Pathways | Launching | H2 | Tiene revenue pero aún escalando; bootcamp VibeCoding en growth |
| chimeranext Platform | Production | H1 | Core product, usuarios activos, revenue recurring |
| Agent Doji | Production-beta | H2 | Integraciones crecen, buscando scale |
| Launchpad (chimeranext) | MVP | H3 | En validación, sin revenue significativo |
| Forum (chimeranext) | MVP | H3 | Early adoption, métricas de engagement |
| Marketplace | MVP | H3 | Curación activa, no revenue directo |
| chimera Score | Production | H2 | Métrica core, usuarios comprometidos |
| Hackathons | Production | H2 | Events running, revenue from tickets/sponsors |
| Software Factory | Revenue | H1 | Client work steady, margin estable |
| doj-projects marketplace | MVP | H3 | Experimental, early community |

**Allocation observada** (estimado):
- H1: ~40% (chimeranext Platform + Software Factory)
- H2: ~35% (Pathways + Doji + Score + Hackathons)
- H3: ~25% (Launchpad + Forum + Marketplace + chimera Projects)

**Evaluación**: balance razonable para early-stage studio. Recomendaría:

- Consolidar H3 — 4 bets simultáneas es mucha dispersión. Decidir cuál 1-2 graduar a H2 y cuáles pausar/matar.
- Reforzar H1 revenue — Software Factory debería crecer % de allocation para financiar H3 bets.
- Vigilar que Pathways no se estanque en H2 — clear path to H1.

---

## Principios clave

- **No aplicar métricas H1 a H3**: el error más común es matar H3 por "falta de revenue"
- **Cultura diferente por horizon**: H1 disciplina, H3 libertad, H2 híbrido
- **Review trimestral**: portfolio clasificación es estática sin review
- **"Missing middle" es red flag**: sin H2, el H3 no tiene camino a H1
- **70/20/10 es guideline, no ley**: ajustar según stage del studio

## Anti-patterns

- Medir H3 con KPIs de revenue (mata experimentación)
- Proteger H1 sin asignar recursos a H3 (innovation death spiral)
- Dispersar H3 en 10+ bets (falta de foco)
- Graduar H3 a H2 por fe, no por signals (PMF, MRR growth, usage)

## Integración con otras skills

- **`studio-thesis`**: provides context del fund/studio thesis — informa allocation target
- **`explore-exploit`** (futuro skill): categorización más granular complementaria
- **`cost-of-delay-cd3`** (futuro skill): prioriza features/initiatives DENTRO de cada horizon
- **`innovation-scorecard`** (futuro skill): metrics scorecard por horizon

## Recursos

- **Baghai, Coley, White** — *The Alchemy of Growth* (Perseus 1999) — **origen** del framework McKinsey Three Horizons
- **Geoffrey Moore** — *Escape Velocity* (HarperBusiness 2011) — popularización para tech strategy
- **Lean Enterprise** (Humble, Molesky, O'Reilly, 2015) — cap. 2 "Start with the Customer" — adaptación enterprise
- [Intuit Three Horizons case study](https://www.intuit.com/company/about-intuit/)
- [Google 70-20-10 allocation](https://hbr.org/2006/11/investing-in-the-it-that-makes-a-competitive-difference)
