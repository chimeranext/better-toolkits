---
name: cap-table-per-venture
version: 1.0.0
description: >
  Designs and maintains cap tables for each venture when the portfolio scales
  to Multi-LLC structure. Includes founder stake, studio stake, employee pool,
  advisor pool, convertible securities (SAFEs, notes), and dilution modeling
  through future rounds. Use when the user asks "cap table", "cap table
  management", "equity distribution", "dilution modeling", "SAFE conversion",
  "employee option pool", "/cap-table-per-venture". LEGAL DISCLAIMER applies.
---

# Cap Table Per Venture

Diseña y mantiene el **cap table** (tabla de capitalización) de cada venture cuando el
portafolio opera en multi-LLC. Cada venture tiene su propio cap table independiente,
incluyendo modeling de dilución proyectada.

## ⚠️ DISCLAIMER LEGAL

Cap table management tiene implicaciones legales y fiscales:

- Errores en 83(b) elections = tax nightmare irreversible
- Cap table mal estructurado → VC walks away
- Grants de equity sin proper agreement = potential disputes
- Dilution modeling incorrecto → founder unpleasant surprises en Series A

**Esta skill genera estructura estructural, NO reemplaza**:
- Corporate lawyer (para draft de agreements)
- Cap table platform (Carta, Pulley, Cake Equity) para ejecución en producción
- Securities lawyer (para fundraising specifics)

## Regla de idioma

Español. Términos equity en "español (English)" primera vez.

## Directorio de salida

```
./portfolio/{studio-name}/ventures/{venture}/cap-table/
├── current.md                    # Cap table actual
├── dilution-scenarios.md         # Modeling de rounds futuros
├── grants-log.md                 # Log de todos los grants históricos
└── 409a-valuation-history.md     # Historia de valuations (si C-Corp)
```

---

## Componentes de un cap table

### Securities types

**Common stock**: shares básicas. Founders + employees usualmente tienen common.

**Preferred stock**: shares con derechos adicionales (liquidation preference, anti-dilution, voting). VCs usualmente reciben preferred en priced rounds.

**Convertible instruments**:
- **SAFEs** (Simple Agreement for Future Equity) — convert a equity en next priced round
- **Convertible notes** — debt que converts a equity, con interest rate + maturity
- **KISS** (Keep It Simple Security) — alternative a SAFEs

**Options**:
- **ISOs** (Incentive Stock Options) — tax-advantaged, solo empleados
- **NSOs** (Non-qualified Stock Options) — menos tax-advantaged, cualquier service provider

**RSUs** (Restricted Stock Units): promise de shares en future milestones

---

## Cap table structure típica (early-stage startup)

### Pre-seed (post first SAFE raise, $500k)

| Shareholder | Shares | % FDC | Notes |
|---|---|---|---|
| Founder 1 | 4,500,000 | 45% | 4yr vest / 1yr cliff |
| Founder 2 | 3,500,000 | 35% | 4yr vest / 1yr cliff |
| Advisor pool | 100,000 | 1% | Vesting per FAST |
| Employee option pool | 1,000,000 | 10% | Unallocated |
| SAFE holder 1 | 500,000* | ~5% | Converts at next round |
| SAFE holder 2 | 400,000* | ~4% | Converts at next round |
| **Total FDC** | **10,000,000** | **100%** | |

*SAFE shares pre-conversion are estimates based on valuation cap / post-money; actual conversion depends on next round terms.

### Post Series A ($3M @ $12M post-money, 20% employee pool increase pre-round)

Cap table se recalcula completamente. Founders dilute de 80% combined a ~60-65%. Employee pool se expande antes del round (refresh).

---

## Studio stake en ventures spun-out

Si la venture fue incubada en el studio antes del spin-out:

- Studio típicamente retiene **20-40%** en el spin-out (reflecting initial contributions)
- Este stake dilute a través de rounds siguientes
- Post-Series A: studio stake puede ser 12-25%
- Post-Series B: 8-18%
- At exit: 5-15%

**Critical**: studio equity documentarse como "founder" shares del studio, no como convertible note (simplifica tax + voting).

---

## Employee option pool sizing

**Regla**: pool typical antes de Series A = 10-15% fully diluted.

Growth-stage: pool = 15-20%.

**Refresh**: antes de cada round, VCs usualmente piden que founders agreement un pool expansion (aumenta pool a e.g. 15%) antes del round close. Esto diluye solo a founders (no al new VC), por lo que founders deben negociar carefully.

---

## Dilution modeling

### Método: working backwards de target dilution

Si queremos founders stay at ≥50% combined after Series A:

- Series A: VC típicamente toma 15-25% post-money
- Pre-round pool expansion: 10-15% additional dilution
- Total dilution por Series A: 25-40%

Para preservar ≥50% post-Series A:
- Start at Series A con ≥80% founders combined

Si ya diluyeron mucho pre-Series A (SAFEs con caps bajos, múltiples pre-seed rounds), founders might not survive to keep control.

---

## Flujo del skill

### Paso 1 — Inventario de securities outstanding

**CT-1**: "Lista todas las securities existentes en la venture:
- Founders (nombres, shares, vesting)
- Employees with equity (options or RSUs)
- Advisors (FAST agreements)
- SAFEs (inversores, monto, valuation cap, discount rate, MFN)
- Convertible notes (inversores, principal, interest rate, maturity, valuation cap)
- Studio stake (si spin-out — % original + remaining after any dilution)

Si el cap table está en un spreadsheet ya, describir su estructura."

### Paso 2 — Cap table actual

**CT-2**: "Generar el cap table current con columnas:
- Shareholder name
- Security type (common, preferred series X, SAFE, option, RSU)
- Shares / share-equivalent
- % FDC (fully diluted cap)
- % outstanding (issued only)
- Vesting status
- Notes"

### Paso 3 — Convertible modeling

**CT-3**: "Para cada SAFE/note outstanding, modelar conversion:
- Valuation cap: $X
- Discount: X%
- MFN (most favored nation)? Yes/No
- Target conversion valuation: $Y
- Shares convertidos: calculate

Comparar pre-money vs post-money cap differences."

### Paso 4 — Dilution scenarios

**CT-4**: "Modelar 3 scenarios para next round:
- Conservative: $2M raise @ $10M post-money, 10% pool expansion
- Expected: $3M raise @ $15M post-money, 15% pool expansion
- Optimistic: $5M raise @ $25M post-money, no pool expansion

Por cada scenario, recalcular cap table post-round y mostrar founder dilution."

### Paso 5 — 409a valuation (C-Corps only)

**CT-5**: "Si es Delaware C-Corp, 409a valuation es requirement regulatorio para issuing options:
- Frequency: cada 12 meses O después de material change (round, acquisition offer)
- Providers: Carta (incluido si en plan), Preferred Return, Aranca
- Costo: $1,500-$5,000 per valuation
- Purpose: establece fair market value (FMV) of common stock para tax compliance"

---

## Output

Generar `./portfolio/{studio}/ventures/{venture}/cap-table/current.md`:

```markdown
# Cap Table — [Venture Name]

**As of**: YYYY-MM-DD

**Entity**: [Delaware LLC / Delaware C-Corp / Cayman Exempted]

**Total shares authorized**: X
**Total shares issued**: Y
**Total shares fully diluted**: Z

## Cap table current

| Shareholder | Security | Shares | % FDC | Vesting |
|---|---|---|---|---|
| [Founder 1] | Common | X | 45% | 4yr/1yr cliff, started YYYY-MM-DD |
| [Founder 2] | Common | X | 35% | 4yr/1yr cliff, started YYYY-MM-DD |
| [Studio] | Common | X | 20% | Fully vested at spin-out |
| Employee pool (unallocated) | Options | X | X% | N/A until grant |
| Advisor pool | FAST options | X | X% | Per FAST agreements |
| [SAFE 1: Angel investor A] | SAFE | X* | X%* | Converts next round |
| [SAFE 2: Angel investor B] | SAFE | X* | X%* | Converts next round |

*SAFE conversion estimates based on current valuation; actual at next round.

## Dilution scenarios

### Scenario: Seed $3M @ $12M post-money

Numerical example (cada columna suma 100%):

| Shareholder | Pre-round % | Post-round % | Dilution |
|---|---|---|---|
| Founder 1 | 40% | 28% | -12 pp |
| Founder 2 | 30% | 21% | -9 pp |
| Studio | 20% | 14% | -6 pp |
| Employee pool | 10% | 15% | +5 pp (refreshed before round) |
| SAFE 1 (converts) | — | 4% | — |
| SAFE 2 (converts) | — | 3% | — |
| New lead VC | — | 12% | — |
| New secondary VC | — | 3% | — |
| **Total** | **100%** | **100%** | — |

Notas:

- "Dilution" se expresa en **pp** (percentage points), no en porcentaje relativo
- SAFE conversion percentages dependen de valuation cap, discount, y MFN — los valores acá son ilustrativos
- Employee pool refresh (10% → 15%) se hace **antes del round**, por lo que dilute solo a founders + studio, no al nuevo VC

## Key terms in documents

- SAFE 1: $250k, $8M cap, MFN no, post-money SAFE
- SAFE 2: $150k, $6M cap, MFN yes, post-money SAFE
- Founders vesting: 4-year, 1-year cliff
- Employee options: ISO, 10-year term, early exercise allowed
- 83(b) elections filed: [list of recipients + dates]

## History log

See `grants-log.md` for every grant + amendment.

## 409a valuation history (if C-Corp)

See `409a-valuation-history.md`.

## Red flags

- [ ] All SAFE terms consistent? (no conflicting MFN provisions)
- [ ] Total outstanding ≤ total authorized?
- [ ] All founders' vesting tracked in platform (Carta, Pulley, Cake)?
- [ ] 83(b) elections filed dentro de 30 días for each grant?
- [ ] Employee pool sufficient for 12-18 months of hiring plan?
- [ ] Studio stake documented with proper agreements?

## Professional management recommended

Move to Carta / Pulley / Cake Equity si:
- 5+ shareholders
- Multiple SAFE/note rounds
- 10+ employees with equity
- Pre-Series A planning phase

Manual cap table in spreadsheet works up to ~4-5 shareholders. Beyond that, errors compound.
```

---

## Principios clave

- **Cap table debe ser source of truth única**: no múltiples versiones en Google Docs, emails, spreadsheets sueltos
- **83(b) elections: 30 días, irreversible**: si US entity, this is critical
- **SAFE cleanup antes de Series A**: piled-up SAFEs with different terms = messy cap table; Series A VCs scrutinize
- **Pool refresh es negotiable**: no aceptar pool expansion 20% ciegamente; 10-12% often sufficient
- **Use professional tools**: Carta/Pulley para anything beyond trivial cap tables

## Anti-patterns

- Founders sin vesting (huge VC red flag)
- Equity prometida verbally sin documentation
- Grants without 83(b) filing
- Studio stake undocumented (just "studio will get 25% later")
- SAFEs con conflicting terms (MFN provisions clash)
- Over-granting advisors (>5% combined is excessive)
- Employee pool grants sin 409a valuation en C-Corp

## Integración con otras skills

- **`sweat-equity-agreement`**: individual grants tracked en cap table
- **`venture-spin-out-playbook`**: establishes initial cap table of new entity
- **`structure-decision`**: entity type (LLC vs C-Corp) affects available security types
- **`attached-fund-structure`**: if studio has fund, fund becomes shareholder in ventures

## Recursos

- **Carta** — cap table management platform (most common)
- **Pulley** — competitor to Carta, often cheaper for early stage
- **Cake Equity** — especially good for global/Australia-headquartered startups
- **Cooley Go — Cap Table 101** — free education
- **Y Combinator — SAFE templates** — standard post-money SAFE docs
- **Venture Deals** (Feld/Mendelson) — book on cap tables + VC term sheets
