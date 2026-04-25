---
name: cap-table-builder
version: 0.2.0
description: >
  Builds the initial cap table for a single venture in the launchpad stage —
  founders + employee option pool + advisor pool + convertible instruments
  (SAFEs, notes) + vesting schedule. Produces `cap-table.md` artifact
  compatible with Carta/Pulley export formats. Use when the user asks
  "cap table", "build cap table", "vesting calculator", "SAFE terms",
  "equity split", "founder equity", "option pool", "/cap-table-builder".
  LEGAL DISCLAIMER applies — output is preparation aid, NOT legal or tax
  advice. For multi-venture portfolio cap tables, see sibling plugin
  `venture-studio-toolkit:cap-table-per-venture`.
---

# Cap Table Builder

Construye el **cap table inicial** de UN venture — founders, employee option pool, advisor pool, y convertible instruments (SAFEs, notes) con vesting schedule detallado. Es el complemento single-venture de `venture-studio-toolkit:cap-table-per-venture` (multi-venture portfolio).

## ⚠️ DISCLAIMER LEGAL

Cap tables tienen implicaciones legales + fiscales severas:

- **83(b) errors**: irreversible (30 días desde grant, ver `sweat-equity-agreement` en venture-studio-toolkit)
- **Cap table mal estructurado**: VCs walk away en diligence
- **SAFE cleanup**: SAFEs piled up con términos inconsistentes = messy Series A

**Este skill genera estructura de preparación, NO reemplaza**:
- Corporate lawyer (draft de agreements)
- Cap table platform (Carta, Pulley, Cake Equity) para ejecución en producción
- Tax advisor / CPA
- Securities lawyer (fundraising specifics)

## ¿Cuándo usar este skill vs. el de venture-studio-toolkit?

| Situación | Skill correcto |
|---|---|
| Construir cap table inicial de **un venture nuevo** (first SAFE round, first employee pool, etc.) | **ESTE SKILL** (`launchpad-toolkit:cap-table-builder`) |
| Gestionar cap tables **independientes de N ventures** en un portafolio multi-LLC | `venture-studio-toolkit:cap-table-per-venture` |
| Stack equity entre studio + venture (spin-out 20% studio stake) | `venture-studio-toolkit:cap-table-per-venture` + `venture-spin-out-playbook` |

## Regla de idioma

Español. Términos equity mantenidos en inglés (SAFE, RSU, ISO, NSO, 83(b), QSBS, etc.) — convención industria US.

## Directorio de salida

```
./launchpad/{startup-slug}/cap-table/
├── cap-table.md                  # Cap table structured document
├── vesting-schedule.md           # Per-grant vesting detail
├── safe-conversion-modeling.md   # Pre-priced-round SAFE conversion projections
└── grants-log.md                 # Append-only log de grants (audit trail)
```

---

## Components del cap table

### Security types esperados en early stage

**Common stock** (C-Corp) o **Membership interests** (LLC): founders + early employees

**Preferred stock** (Series Seed / Series A+): VCs institucionales post-priced-round

**Convertible instruments** (pre-priced-round):
- **SAFEs** (Simple Agreement for Future Equity) — Y Combinator standard, post-money desde 2018
- **Convertible notes** — debt con interest rate + maturity
- **KISS** (Keep It Simple Security) — alternativa less common

**Options**:
- **ISOs** (Incentive Stock Options) — tax-advantaged, solo empleados W-2 US
- **NSOs** (Non-qualified Stock Options) — menos tax-advantaged, cualquier service provider (contractors, advisors non-employee)

**RSUs** (Restricted Stock Units): promesa de shares en future milestones. Less common en seed stage (más típico post-Series A).

### Pool sizing defaults (Series Seed-ready)

- **Employee option pool**: 10-15% fully diluted (pre-Series A standard)
- **Advisor pool**: 0.5-1% fully diluted total (typical 0.1-0.25% per advisor bajo [FAST](https://fi.co/fast) framework)
- **Founder stock**: remainder (típicamente 80-89% combined at first grant, pre-SAFEs)

---

## Flujo del skill

### Paso 1 — Entity type + jurisdiction

**CTB-1**: "¿Qué entity type es la venture?
- Delaware C-Corp (recomendado para VC-backed US ventures)
- Delaware LLC (pass-through taxation; limita priced rounds)
- Wyoming/Texas LLC (home-state US)
- LATAM entity (Costa Rica SRL, MX SAPI, Colombia SAS, etc. — limita herramientas + VCs internacionales)
- Cayman Exempted (Cayman Sandwich holding)
- Otro

Si ya tenés `startup-profile.md` generado por `startup-intake`, puedo leerlo para autodetectar."

### Paso 2 — Founder grants

**CTB-2**: "Para cada founder:
- Nombre completo
- Rol (CEO / CTO / etc.)
- % fully diluted al grant (o número de shares si ya tenés un target total de shares authorized)
- Vesting period (default: 4 años)
- Cliff (default: 1 año)
- Vesting schedule type: monthly post-cliff / quarterly / milestone-based
- Grant date (usualmente incorporation date)
- 83(b) election status (si US C-Corp o LLC capital interest — ver sección downstream)"

**CTB-2a — Authorized shares calculation**:
- Default: 10,000,000 shares authorized (industry standard para early C-Corp)
- Fully diluted post-first-grant = 100% de authorized (founders + unallocated pools)
- Recommendation: issue founder shares at **$0.00001 par value** para minimizar tax at grant

### Paso 3 — Option pool

**CTB-3**: "Option pool para empleados + advisors:
- Employee option pool: default 10% fully diluted
- Advisor pool: default 1% fully diluted (may overlap o ser separado)
- Pool refresh cadence: usualmente antes de Series A (pre-money expansion a 15%)
- Option type default: ISOs (si C-Corp con US employees), NSOs (para contractors/non-US)"

**CTB-3a — Critical note**: pool expansion **pre-money** diluye solo a founders (no al nuevo VC). VCs negocian pool expansion agresiva (20%) para protegerse del dilution post-round. Founders deberían negociar 10-12% (sufficient for 12-18 meses de hiring plan).

### Paso 4 — Convertible instruments outstanding

**CTB-4**: "¿Hay SAFEs o convertible notes outstanding?

Por cada SAFE / note:
- Investor name
- Amount invested ($)
- Valuation cap (pre-money or post-money — **default Y Combinator post-money SAFE**)
- Discount rate (típico 0-20%; 20% si no hay cap)
- MFN (Most Favored Nation) clause — yes/no
- Date invested
- Conversion trigger (next qualifying financing, usualmente Series Seed/A)
- Para convertible notes solamente: interest rate (típico 2-8%), maturity (típico 18-24 meses)

Si no hay ninguno, skip a Paso 5."

### Paso 5 — Vesting schedule generation

**CTB-5**: Para cada founder + option grant, generar vesting schedule detallado:

| Mes desde grant | Founder 1 vested (shares) | Founder 2 vested | Employee pool reserved | ... |
|---|---|---|---|---|
| 0 (grant) | 0 | 0 | 0 | ... |
| 12 (cliff hit) | 25% (1,125,000) | 25% (875,000) | 0 | ... |
| 24 | 50% | 50% | 0 | ... |
| 36 | 75% | 75% | 0 | ... |
| 48 (fully vested) | 100% | 100% | 0 | ... |

**Acceleration clauses**:
- **Single trigger**: al sale de company, todo unvested acelera
- **Double trigger** (más común): acelera solo si (a) sale Y (b) founder termination sin cause
- **Default**: double trigger para founders, none para employees

### Paso 6 — SAFE conversion modeling

**CTB-6**: Si hay SAFEs outstanding, modelar conversión en 3 scenarios de next priced round:

1. **Conservative**: $2M @ $10M post-money
2. **Expected**: $3M @ $15M post-money
3. **Optimistic**: $5M @ $25M post-money

Para cada scenario:
- Shares que cada SAFE convierte a
- % post-round cada SAFE holder
- Founder dilution
- Employee pool status (refresh o no)

**Calculation**: post-money SAFE shares = `investment / min(valuation_cap / total_shares_at_cap, priced_round_price * (1 - discount))`

### Paso 7 — 409a valuation requirement (C-Corp only)

**CTB-7**: Si es Delaware C-Corp:
- 409a valuation es **regulatory requirement** para emitir options bajo fair market value
- Frequency: annual O después de material change (round, acquisition offer)
- Providers + cost:
  - **Carta** (incluido en plan pagos ~$120+/mes)
  - **Preferred Return** (~$1,500 per valuation, standalone)
  - **Aranca** (~$2,000-5,000, institutional)
- Purpose: establece FMV del common stock para tax compliance

Si es LLC o non-US entity: skip.

### Paso 8 — 83(b) election reminders

**CTB-8**: Para cada grant sujeto a vesting en US entity:
- Recordatorio 30 días post-grant para file 83(b)
- Ver `venture-studio-toolkit:sweat-equity-agreement` (sección 4) para reglas distintas por entity type:
  - **C-Corp restricted stock**: 83(b) crítico
  - **LLC profits interest** (Rev. Proc. 93-27 / 2001-43 safe harbor): 83(b) protective only
  - **LLC capital interest**: 83(b) crítico

---

## Output template — `cap-table.md`

```markdown
# Cap Table — [Startup Legal Name]

**As of**: YYYY-MM-DD
**Entity**: [Delaware C-Corp / Delaware LLC / Cayman Exempted / etc.]
**Total shares authorized**: X (typical 10,000,000 for C-Corp)
**Total shares issued**: Y
**Total fully diluted**: Z (= authorized post-first-grant)

## Cap table snapshot

| Shareholder | Security | Shares / % | Vesting status | Notes |
|---|---|---|---|---|
| [Founder 1] | Common | 4,500,000 (45% FDC) | 4yr / 1yr cliff, started YYYY-MM-DD, currently X% vested | 83(b) filed YYYY-MM-DD |
| [Founder 2] | Common | 3,500,000 (35% FDC) | 4yr / 1yr cliff, started YYYY-MM-DD, X% vested | 83(b) filed YYYY-MM-DD |
| Employee option pool | Options | 1,000,000 (10% FDC) | N/A until grant | ISO pool for US W-2 employees |
| Advisor pool | NSO | 100,000 (1% FDC) | Per FAST agreement | ≤3 advisors at 0.25-0.5% each |
| [SAFE 1: Angel Investor A] | SAFE | Converts to ~X shares (~Y%) at next round | Converts on next qualifying financing | $250k @ $8M post-money cap, 0% discount, MFN: no |
| [SAFE 2: Angel Investor B] | SAFE | Converts to ~X shares (~Y%) at next round | Converts on next qualifying financing | $150k @ $6M post-money cap, 20% discount, MFN: yes |
| **Total (pre-SAFE conversion)** | — | **10,000,000 (100% FDC)** | — | — |

**Note on SAFE %**: percentages pre-conversion are estimates. Actual dilution on priced round depends on round valuation + size.

---

## Vesting schedule summary

See `vesting-schedule.md` for per-grant detail.

| Founder | Total shares | 12-mo vested (cliff) | 24-mo | 36-mo | 48-mo (fully) |
|---|---|---|---|---|---|
| [Founder 1] | 4,500,000 | 1,125,000 | 2,250,000 | 3,375,000 | 4,500,000 |
| [Founder 2] | 3,500,000 | 875,000 | 1,750,000 | 2,625,000 | 3,500,000 |

**Acceleration**: double trigger (sale + termination without cause) — per founder agreement.

---

## SAFE conversion scenarios

See `safe-conversion-modeling.md` for detailed calculations.

| Scenario | Round size / post-money | F1 post-round % | F2 post-round % | SAFE 1 % | SAFE 2 % | New investor % | Pool refresh |
|---|---|---|---|---|---|---|---|
| Conservative | $2M @ $10M | 32% | 25% | 3% | 2% | 20% | +5% pre-money |
| Expected | $3M @ $15M | 30% | 23% | 4% | 3% | 20% | +5% |
| Optimistic | $5M @ $25M | 33% | 26% | 3% | 2% | 20% | 0% (no refresh) |

## Key terms (documented)

- **Founders vesting**: 4-year, 1-year cliff, monthly post-cliff
- **Acceleration**: double trigger, 12-month acceleration if sale + without-cause termination
- **Employee options**: ISO, 10-year exercise term, early exercise allowed
- **83(b) elections filed**: [list of recipients + dates]
- **SAFE standard**: post-money (YC template v2018+)

## Red flags checklist

- [ ] All SAFE terms consistent (no conflicting MFN provisions that cascade)
- [ ] Total outstanding ≤ total authorized (Delaware C-Corp max is authorized per Certificate of Incorporation)
- [ ] All founders vesting tracked in a cap table platform (Carta / Pulley / Cake)
- [ ] 83(b) elections filed within 30 days for each grant (US entities only)
- [ ] Employee pool sufficient for 12-18 months of hiring plan
- [ ] No equity promised verbally without documentation (anti-pattern)
- [ ] Advisor grants ≤1% combined (avoid dilution from over-granting)

## Professional platform migration recommended

Move to **Carta**, **Pulley**, or **Cake Equity** when:

- 5+ total shareholders
- 2+ SAFE rounds closed
- 10+ employees with equity grants
- Pre-Series A planning phase (<12 meses antes de target raise)

Manual cap table in markdown works up to ~4-5 shareholders. Beyond that, errors compound exponentially (missed vesting dates, conversion math mistakes, 83(b) deadline miss).

## Next steps

1. File 83(b) elections for any founder grants (if US C-Corp or LLC capital interest)
2. Execute Founder Stock Purchase Agreements (see `founder-documents` skill)
3. File IP assignments (see `founder-documents`)
4. Set up cap table platform when threshold hit
5. Re-run this skill when material change occurs (new grant, new SAFE, priced round closing)
```

---

## Integración con otras skills

- **`startup-intake`**: si ya existe `startup-profile.md`, auto-detect founders + team + funding from the profile section
- **`founder-documents`** (sibling): genera los agreements asociados a cada grant (Founder Stock Purchase Agreement, IP Assignment, Vesting Schedule Exhibit)
- **`venture-studio-toolkit:sweat-equity-agreement`**: referencia obligatoria para 83(b) tratamiento diferenciado C-Corp / LLC profits interest / LLC capital interest
- **`venture-studio-toolkit:cap-table-per-venture`**: upgrade path cuando el founder escala a multi-venture portfolio
- **`feature-to-spike`**: si durante uso se descubre UX pattern valioso para chimeranext Launchpad, generar SPIKE para William

## Principios clave

- **Cap table es source of truth único**: NO múltiples versiones en Google Docs, emails, spreadsheets sueltos
- **83(b) en 30 días, irreversible**: US C-Corp y LLC capital interest casi siempre lo requieren
- **SAFE cleanup antes de Series A**: piled-up SAFEs con terms inconsistentes = messy cap table; VCs scrutinize en diligence
- **Pool refresh es negotiable**: no aceptar 20% pre-Series A ciegamente; 10-12% suele ser suficiente para 12-18 meses
- **Use professional tools cuando escales**: Carta / Pulley / Cake para anything beyond trivial cap tables

## Anti-patterns

- Founders sin vesting ("because we trust each other") — red flag VC mayor
- Equity prometida verbally sin documentation
- Grants sin 83(b) filing (deadline missed = ordinary income tax nightmare)
- Studio stake undocumented ("studio will get 25% later")
- SAFEs con MFN provisions que clash (cascading amendments)
- Over-granting advisors (>1% combined)
- Employee pool grants sin 409a valuation en C-Corp (tax compliance risk)

## Recursos

- **Carta** — cap table platform más usado ([carta.com](https://carta.com))
- **Pulley** — competitor más barato early stage
- **Cake Equity** — especialmente bueno para global + Australia HQ
- **[Y Combinator — post-money SAFE templates](https://www.ycombinator.com/documents)** — standard industry
- **[Cooley Go — Cap Table 101](https://www.cooleygo.com/)** — free education
- **Venture Deals** (Brad Feld / Jason Mendelson) — book on cap tables + VC term sheets (must-read for founders)
- **IRS Rev. Proc. 93-27 / 2001-43** — LLC profits interest safe harbor (see `venture-studio-toolkit:sweat-equity-agreement`)
