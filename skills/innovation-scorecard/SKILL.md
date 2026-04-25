---
name: innovation-scorecard
version: 1.0.0
description: >
  Builds an Innovation Scorecard across a portfolio of ventures combining customer
  metrics and business metrics with Current/Target/Trend columns. Based on Lean
  Enterprise cap. 5 (Figure 5-2). Use when the user asks "innovation scorecard",
  "portfolio metrics dashboard", "customer vs business metrics",
  "current target trend", "pirate metrics", "AARRR", "/innovation-scorecard",
  or needs governance-level view of venture portfolio performance.
---

# Innovation Scorecard

Construye un scorecard de portafolio combinando **customer metrics** y **business
metrics** con columnas Current / Target / Trend. Basado en *Lean Enterprise* cap. 5
(Figure 5-2).

## Regla de idioma

Español. Términos de métricas en "español (English)" primera vez.

## Directorio de salida

```
./portfolio/{studio-o-founder-name}/
└── innovation-scorecard-{YYYY-QN}.md
```

---

## Framework (Lean Enterprise Figure 5-2)

El scorecard tiene **2 bloques de métricas** con **3 columnas cada uno**:

### Customer metrics (user-facing)

- Sales flow completion % (customers completan el funnel)
- Retention % (cohort retention at 30/60/90 days)
- NPS (Net Promoter Score)
- Activation rate (signup → active user conversion)

### Business metrics (economics-facing)

- Sign-up % (visitor → signup)
- Conversion to paying
- Acquisition costs (CAC)
- Customer lifetime value (CLV / LTV)
- Attrition % (churn)
- Monthly burn rate
- Viral coefficient (K) si aplica

### Columnas

- **Current**: valor actual (snapshot en fecha del scorecard)
- **Target**: goal acordado (para trimestre / año)
- **Trend**: ↗ / ↘ / → (direcciones vs. último scorecard)

---

## Pirate Metrics (AARRR) integration

Dave McClure's Pirate Metrics framework encaja naturalmente:

- **A**cquisition — visitors, signups
- **A**ctivation — completan primer uso
- **R**etention — vuelven día 7, 30, 90
- **R**evenue — pagan
- **R**eferral — traen otros

**Crítico**: medir por **cohort**. Agregar AARRR across cohorts oculta información.
Ver a cohort Jan-2026 vs Feb-2026 vs Mar-2026 para ver cómo evoluciona el funnel con
cada iteración de producto.

---

## Cuándo aplicar a qué venture

### Scorecard full (customer + business completo)

Ventures en **Exploit** mode o H1: tienen los datos para llenar todas las columnas.

### Scorecard reducido (solo customer metrics)

Ventures en **Explore** mode o H3: no tienen business metrics sólidos todavía.
Focus solo en customer metrics + learning metrics.

### Cross-portfolio scorecard

Para studios con múltiples ventures: un scorecard comparativo agregado, pero
**NO agregar métricas entre ventures con diferentes business models** (ej. marketplace MRR
vs. SaaS MRR — no son comparables sin normalizar).

---

## Vanity vs. Actionable metrics (Table 5-1)

**Evitar vanity metrics**. Reemplazarlos por actionable equivalents:

| Vanity (evitar) | Actionable (usar) |
|---|---|
| # of visits | Funnel metrics, cohort analysis |
| Time on site | # sessions per user |
| Emails collected | Email action (test emails, see conversion) |
| # downloads | User activations |
| Tool usage | Tooling effect (cycle time check-in to prod) |
| # trained people | Higher throughput after training |

---

## Flujo del skill

### Paso 1 — Inventario

**IS-1**: "Listá las ventures del portafolio con:
- Nombre
- Stage (Explore / Exploit / Hybrid — corr. categorization de explore-exploit skill)
- Horizon (H1/H2/H3)
- MRR actual si aplica
- Usuarios activos actuales"

### Paso 2 — Define targets

**IS-2**: "Por cada venture, definir targets realistas para los próximos 3 meses:
- Customer metrics targets
- Business metrics targets (si aplican)

Usar benchmarks del industry donde sea posible (SaaStr, OpenView benchmarks, etc.)."

### Paso 3 — Medir Current

**IS-3**: "Por cada métrica, obtener el valor actual. Fuentes:
- Analytics tools (PostHog, Mixpanel, Amplitude)
- Product DB (Supabase queries, etc.)
- Finance tools (Stripe, accounting software)
- Survey tools (para NPS)

Si la métrica NO está tracked, marcarlo explícitamente — gap a llenar."

### Paso 4 — Identificar Trend

**IS-4**: "Comparar Current vs. scorecard anterior (si existe). Marcar Trend:
- ↗ improving
- ↘ degrading
- → stable

Si no hay scorecard anterior, marcar '(baseline)'."

### Paso 5 — Prioridad / acciones

**IS-5**: "Por cada métrica con:
- Trend ↘: ¿qué pasó? root cause + acción correctiva
- Gap grande Current vs. Target: ¿realistic el target? o ¿necesita intervention?
- Métrica not tracked: priorizar tracking si es importante"

---

## Output

Generar `./portfolio/{name}/innovation-scorecard-{YYYY-QN}.md`:

```markdown
# Innovation Scorecard — Q[N] YYYY

**Date**: YYYY-MM-DD
**Previous scorecard**: [link to previous QN if exists]

## Summary

- Ventures with ↗ trend: X
- Ventures with ↘ trend: Y
- Actions this quarter: Z identified

---

## Per-venture scorecards

### [Venture 1]

**Category**: [Explore / Exploit / Hybrid]
**Horizon**: H1 / H2 / H3

#### Customer metrics

| Metric | Current | Target | Trend | Notes |
|---|---|---|---|---|
| Activation rate | X% | Y% | ↗ | |
| 30-day retention | X% | Y% | → | |
| NPS | X | Y | ↘ | drop from N → M, investigating |
| [...] | | | | |

#### Business metrics (si aplica)

| Metric | Current | Target | Trend | Notes |
|---|---|---|---|---|
| MRR | $X | $Y | ↗ | |
| New MRR | $X | $Y | ↗ | |
| Churn % | X% | Y% | ↘ | good — churn decreasing |
| LTV | $X | $Y | → | |
| CAC | $X | $Y | ↘ | good |
| LTV/CAC | X.Xx | 3.0x | ↗ | |
| Runway | N months | | → | |
| [...] | | | | |

#### Cohort analysis

[Tabla con cohorts recientes + retention curves]

#### Actions identified

1. [Action 1]: owner [name], by [date]
2. [Action 2]: owner [name], by [date]

---

### [Venture 2]
[...]

---

## Cross-portfolio observations

### Wins this quarter
- [Venture X] achieved [specific milestone]

### Concerns
- [Venture Y] trending ↘ on [critical metric] — requires intervention
- [Venture Z] missing data on [key metric] — tracking gap

### Portfolio-level actions

1. [Cross-portfolio action]
2. [...]

---

## Governance meeting notes

Scorecard reviewed with:
- [Attendees]
- Key decisions:
  - [Decision 1]
  - [Decision 2]

Next scorecard due: YYYY-MM-DD
```

---

## Principios clave

- **Current / Target / Trend** — las 3 columnas son obligatorias
- **Cohort analysis, NO agregados** — retention de March cohort vs April cohort
- **Actionable metrics only** — vanity metrics quedan fuera
- **Diferenciar por stage** — full scorecard para Exploit, reducido para Explore
- **Review cadence fijo** — trimestral mínimo, mensual para ventures en Explore con alto riesgo

## Anti-patterns

- Solo medir "total signups" (vanity)
- Agregar MRR across ventures con modelos distintos
- Scorecards sin targets definidos (solo Current sin Goal)
- Trend calculado sobre datos no comparables (ej. diferente cohort definition)
- Scorecard generado pero no reviewed (vanity execution)

## Integración con otras skills

- **`three-horizons`**: informa nivel de ambición en targets (H3 targets son directional, H1 targets son ejecutables)
- **`explore-exploit`**: informa qué metrics aplicar (full vs. reduced scorecard)
- **`cost-of-delay-cd3`**: las acciones identificadas en el scorecard se priorizan vía CD3
- **`improvement-kata`**: las acciones siguen el framework del kata (target condition → daily experiments)

## Recursos

- **Lean Enterprise** (Humble/Molesky/O'Reilly, 2015) — cap. 5 "Evaluate the Opportunity and Validate Product/Market Fit", Figure 5-2
- **Lean Startup** (Eric Ries, 2011) — innovation accounting
- **Pirate Metrics** — Dave McClure's AARRR
- **SaaS Benchmarks** — OpenView, SaaStr annual reports
- **Amplitude / Mixpanel / PostHog** — cohort analysis tools
