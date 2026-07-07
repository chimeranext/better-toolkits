---
name: shared-services-ledger
version: 1.1.0
description: >
  Tracks how shared services (engineers, designers, marketing, legal,
  accounting, infrastructure) are allocated across multiple ventures.
  Supports two operating modes: Services Hub (bilateral MSAs, independent venture
  cap tables) and Full Studio (centralized via Management Co + Holding).
  Essential for transfer pricing compliance, accurate venture P&Ls, and
  LP reporting. Use when the user asks "shared services", "allocation",
  "transfer pricing", "studio overhead", "intercompany services",
  "services hub ledger", "MSA tracking", "/shared-services-ledger".
  STRONG TAX DISCLAIMER applies.
---

# Shared Services Ledger

Registra cómo los **recursos compartidos** (devs, diseño, marketing, legal,
contabilidad, infrastructure) se asignan entre las ventures del portafolio. Esencial para
transfer pricing compliance y P&Ls accurate per venture.

## Operating mode selection (v1.1)

Antes de configurar el ledger, elegí el operating mode:

| Mode | Entities involved | MSA structure | Skill complementario |
|---|---|---|---|
| **Services Hub** (patrón #6) | Services LLC + N Venture LLCs | Bilateral MSAs per venture, cap tables independent | `services-hub-setup` |
| **Full Studio** (patrón #7) | Management Co + Holding + N Venture Subsidiaries | Centralized via holding + Management Co | `attached-fund-structure` |

**Por default si no sabés qué elegir**: Services Hub. Full Studio requiere fund atado
(LP capital) que la mayoría de serial entrepreneurs no tiene. Ver `when-to-become-studio`
para routing correcto.

### Differencias operacionales por mode

**Services Hub mode**:

- **MSAs**: bilaterales (Services LLC ↔ cada Venture LLC directly)
- **Billing**: mensual individual per venture (monthly invoice flow)
- **Reporting**: NO consolidated financial statements (each venture P&L independent)
- **Transfer pricing**: evaluated per MSA individual
- **Cap tables**: independent per venture (VCs invest directo en Venture LLC)
- **Studio stake**: NO — Services LLC es vendor, no shareholder

**Full Studio mode**:

- **Intercompany agreements**: centralizados via Management Co + Holding
- **Billing**: consolidated via Management Co, luego allocated down to ventures
- **Reporting**: consolidated financial statements at Holding level
- **Transfer pricing**: evaluated at Holding level (more complex, often requires big 4 review)
- **Cap tables**: Holding is shareholder in each venture; additional VC investors per round
- **Studio stake**: Yes — Holding owns shares/equity de cada Venture Subsidiary

## ⚠️ DISCLAIMER FISCAL FUERTE

Shared services entre entidades (studio → ventures o Management Co → Fund → Portfolio)
tiene implicaciones fiscales complejas:

- **Transfer pricing**: tax authorities require arm's-length pricing entre entidades
  relacionadas. Pagar menos or más del fair market value → tax adjustments + penalties.
- **BEPS (Base Erosion and Profit Shifting)**: OECD guidelines aplican especialmente a
  estructuras multi-jurisdiccionales (US + LATAM + Cayman).
- **Documentation requirements**: authorities may demand documentation específica
  sobre cómo se calculó el allocation.

**Esta skill genera tracking estructural**. **NO reemplaza**:
- Transfer pricing advisor (big 4 o tax lawyer especializado)
- Accountant CPA / auditor
- Tax lawyer en cada jurisdicción relevante

## Regla de idioma

Español. Términos contables/fiscales en "español (English)" primera vez.

## Directorio de salida

```
./portfolio/{studio-name}/shared-services/
├── allocation-policy.md         # Policy base
├── monthly-allocations/
│   ├── YYYY-MM.md              # Monthly allocation snapshot
│   └── ...
├── transfer-pricing-notes.md    # Decisiones de TP por servicio
└── intercompany-agreements/     # Link/reference a master service agreements
```

---

## ¿Qué son shared services?

Servicios que el studio provee a sus ventures (o que la Management Co provee al fund):

### Personas compartidas

- Engineering team (devs working across multiple ventures)
- Design team
- DevOps / infrastructure team
- Marketing / content team
- Legal team / compliance
- Finance / accounting team
- People / HR team

### Infrastructure compartida

- Cloud costs (AWS / GCP / Azure) — proratear por uso
- SaaS tools (Slack, Notion, GitHub, Linear, etc.)
- Dev tools (CI/CD, monitoring, error tracking)
- Office / coworking
- Equipment

### Servicios externos compartidos

- Fraccional CFO / CTO / CMO
- Legal retainers
- Tax advisors
- PR / communications agencies

---

## Métodos de allocation

### Método 1: Proration by headcount

Si el tiempo del devs es compartido, asignar costo por % de time spent per venture.

**Ejemplo**: Dev team de 3 personas, cada uno 40% Venture A + 60% Venture B.

- Total dev cost mensual: $30k
- Venture A absorbe: 3 × 40% × $10k = $12k
- Venture B absorbe: 3 × 60% × $10k = $18k

**Cómo tracking**: weekly time tracking (Harvest, Toggl) por venture.

### Método 2: Proration by revenue

Costs de marketing / sales / legal retainer compartidos entre ventures se distribuyen
por % de revenue contribution.

**Ejemplo**: Marketing cost total $10k/mes.
- Venture A revenue $30k/mes → absorbe 60% del costo
- Venture B revenue $20k/mes → absorbe 40%

**Limitación**: ventures en Explore mode (sin revenue) no absorben costos de marketing
con este método. Necesitan otra métrica.

### Método 3: Proration by headcount of venture

Si hay shared services (HR, legal, office) que se usan por persona, allocate por
headcount of venture team.

### Método 4: Activity-based costing (ABC)

Más sofisticado: track time spent por service sobre venture específica y calcular
costo por actividad.

Ejemplo: legal review de un customer contract para Venture A = 2 horas × $300/hr = $600
cargado directamente a Venture A.

**Pros**: más accurate. **Cons**: more admin overhead.

### Método 5: Flat service fee

Studio cobra flat fee mensual a cada venture por "platform services" (una pooled fee).

**Pros**: simple. **Cons**: tax authorities may view as arbitrary — poor transfer pricing
documentation.

---

## Transfer pricing arm's-length requirement

Authorities require que los precios inter-company sean **arm's-length** — lo que entidades
no-relacionadas cobrarían por los mismos services.

### Métodos aceptados por OECD

1. **Comparable Uncontrolled Price (CUP)**: compare con precios cobrados por terceros
   independent servicing similar.
2. **Cost-plus method**: service provider cobra costs + reasonable markup (e.g., 5-10%).
3. **Resale price method**: less common for services.

### Práctica común para studios

- **Cost-plus con markup 5-10%** es la opción más defensible
- Documentar costs carefully
- Review periódicamente (annually at least)

---

## Master Service Agreement (MSA)

Entre studio/Management Co y cada venture, firmar un MSA que documente:

- Scope de services (qué provee)
- Pricing methodology (cost-plus, ABC, etc.)
- Billing frequency (monthly usual)
- Invoice format
- Dispute resolution
- Term + termination

Esto es **tax documentation obligatoria** — sin MSA, el tax authority puede assume
allocations arbitrarias y reassess.

---

## Flujo del skill

### Paso 1 — Inventario de shared services

**SSL-1**: "Lista todos los servicios/recursos compartidos entre ventures:

**Personas compartidas**:
- [Role]: [# headcount], costo mensual total [$X]

**Infrastructure**:
- [Service]: cost mensual $X, used by [ventures]

**Servicios externos**:
- [Provider]: cost mensual/retainer $X, used by [ventures]"

### Paso 2 — Time tracking setup

**SSL-2**: "Para personas compartidas, setup time tracking:
- Tool: Harvest, Toggl, Clockify, Linear custom field
- Granularity: by week (not by day — too overhead)
- Categories: por venture + 'internal studio' + 'PTO'
- Who tracks: cada persona self-reporta weekly"

### Paso 3 — Allocation method por service

**SSL-3**: "Por cada shared service, elegir método:

| Service | Method | Rationale |
|---|---|---|
| Dev team | By time tracking | Most accurate for variable workload |
| Marketing | By revenue (ventures in Exploit) + flat fee (Explore) | Revenue correlates con benefit |
| Legal retainer | ABC (per matter) | Matters are discrete + variable |
| Cloud infra | By actual usage (CloudWatch tags) | Accurate, automatable |
| Office rent | By headcount | Proxy for space usage |
| Accounting / HR | Flat fee | Simple, usage hard to measure |"

### Paso 4 — Monthly ledger

**SSL-4**: "Cada mes, run allocation calculation:

1. Pull time tracking data
2. Pull revenue data per venture
3. Apply methodology per service
4. Produce allocation table per venture
5. Invoice each venture (intercompany invoice)
6. Book in accounting (each venture's P&L reflects its allocation)"

### Paso 5 — Document transfer pricing decisions

**SSL-5**: "Mantener documentation de:

- Methodology chosen per service + rationale
- Markup applied (cost-plus) + benchmarking data
- Review date (annual)
- MSAs firmados con cada venture

Tax authorities piden este documentation si auditan."

---

## Output

Generar `./portfolio/{studio}/shared-services/allocation-policy.md`:

```markdown
# Shared Services Allocation Policy — [Studio Name]

**Effective date**: YYYY-MM-DD
**Review cadence**: Annual

## Services inventory

| Service | Provider | Total monthly cost | Allocation method | Markup |
|---|---|---|---|---|
| Engineering (shared dev team) | Studio employees | $X | Time tracking | +10% |
| Cloud infrastructure | AWS | $X | Actual usage (tagged) | 0% (passthrough) |
| Design team | Studio employees | $X | Time tracking | +10% |
| Marketing | Studio marketing | $X | Revenue % | +8% |
| Legal retainer | External firm | $X | ABC per matter | 0% (passthrough) |
| Accounting | External firm | $X | Flat fee | 0% (passthrough) |
| Office rent | Landlord | $X | By headcount | 0% (passthrough) |

## Methodology details

### Engineering (time tracking)

- Tool: [Harvest/Toggl]
- Granularity: weekly
- Categories: per venture + internal + PTO
- Calculation: (hours venture × hourly loaded cost) × 1.10 markup
- Hourly loaded cost = salary + benefits + taxes / 2,080 annual working hours

### Marketing (revenue %)

- Trailing 3-month revenue per venture
- Cost allocated: (venture revenue / total revenue) × total marketing cost × 1.08 markup
- Ventures pre-revenue absorb flat fee of $X/month

### [other methodologies]

## Markup rationale

Cost-plus markup justification (for arm's-length defense):

- Industry benchmark (dev services): 8-12% markup typical (sources: [cite])
- Industry benchmark (shared admin): 3-7% markup typical
- [Studio name] uses 10% for technical services, 8% for marketing, 0% passthrough for
  external direct costs (non-services like rent, SaaS tools)

## Master Service Agreements

Each venture has an MSA with studio. See `/intercompany-agreements/`:
- [Venture 1 MSA]
- [Venture 2 MSA]
- [...]

## Monthly process

1. First business day: pull time tracking + revenue data
2. Day 3: run allocation calculation
3. Day 5: generate invoices to each venture
4. Day 7: book in accounting
5. Day 10: file monthly ledger snapshot in `/monthly-allocations/YYYY-MM.md`

## Review schedule

- Annual review of methodology + markups
- Quarterly review of actual vs. budgeted allocations
- Ad-hoc if business changes significantly (new venture, service stop, etc.)

## Risk log

- [Risk 1]: [Mitigation]
- [Risk 2]: [Mitigation]
```

---

## Principios clave

- **Arm's-length NO optional**: tax authorities enforce this
- **Cost-plus con markup razonable (5-10% services típicos; hasta 15% para specialized skills high-value)**: most defensible methodology
- **Documentation is everything**: methodology + MSAs + periodic review
- **Annual review minimum**: costs + benchmarks change
- **Automation valuable**: time tracking + revenue data automation reduces errors

## Anti-patterns

- No allocation at all (all studio absorbs cost, ventures show inflated profit)
- Random allocation (50/50 entre ventures sin rationale) → authorities will challenge
- Over-engineering (ABC para everything) → admin cost > benefit
- No MSAs firmados → no contractual basis for allocations
- Changing methodology mid-year without documentation → red flag en audit
- Ignoring timezones / jurisdictions en cost calculations

## Integración con otras skills

- **`attached-fund-structure`**: shared services se documentan entre Management Co ↔ Fund ↔ Portfolio
- **`innovation-scorecard`**: venture P&Ls (con shared services correctly allocated) inform scorecard
- **`vertical-charter`**: si el studio tiene verticals, shared services se allocate by vertical antes de por venture
- **`structure-decision`**: transfer pricing es más complejo con Cayman Sandwich + LATAM OpCo (multi-jurisdictional)

## Recursos

- **OECD Transfer Pricing Guidelines** — source of truth internacional
- **Big 4 transfer pricing practices** (Deloitte, PwC, EY, KPMG) — consultoría
- **Quickbooks / Xero** — accounting platforms with intercompany features
- **Stripe / Plaid** — payment automation for intercompany invoices
