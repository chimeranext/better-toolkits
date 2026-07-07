---
name: venture-spin-out-playbook
version: 1.0.0
description: >
  Walks the studio operator through the mechanics of spinning out a venture
  into its own LLC when it matures beyond the studio umbrella — IP assignment,
  contract migration, team separation, cap table, and accelerated equity for
  founders. Use when the user asks "spin out", "spin off", "venture
  independence", "graduate venture", "separate LLC", "spin-out mechanics",
  "/venture-spin-out-playbook". STRONG LEGAL DISCLAIMER — spin-outs are
  complex and require legal review.
---

# Venture Spin-Out Playbook

Guía al operador del studio a través de la **mecánica de separar (spin out) una
venture** de la estructura del studio cuando madura lo suficiente para operar como
LLC independiente.

## ⚠️ DISCLAIMER LEGAL FUERTE

Spin-outs tocan múltiples dominios regulados:

- **Corporate law** (formación de nueva entidad, shareholder agreements)
- **Tax law** (tax events al transferir assets)
- **IP law** (asignación de intellectual property entre entidades)
- **Employment law** (migración de empleados entre entidades)
- **Contract law** (asignación o reemplazo de customer contracts)

**Esta skill genera un playbook estructural**. **NO reemplaza**:
- Corporate lawyer
- Tax advisor (CPA)
- IP lawyer (especialmente para patents/trademarks)
- Employment lawyer (si hay empleados formales)

Un spin-out mal ejecutado puede resultar en:
- Disputes legales con el studio original
- Pérdida de customer contracts
- IP disputes (quién owns qué)
- Tax liabilities inesperadas

## Regla de idioma

Español. Términos legales en "español (English)" primera vez.

## Directorio de salida

```
./portfolio/{studio-name}/spin-outs/
├── {venture-name}-spin-out-plan.md   # Plan completo por spin-out
├── ip-assignment-checklist.md        # IP assignment per venture
└── contract-migration-tracker.md     # Contracts a migrar
```

---

## Cuándo spin out

Triggers que justifican separar una venture del studio:

### Signals positivos (spin out appropriate)

- Venture alcanza **revenue threshold** (ej. $10k-$20k MRR recurring)
- **Equipo dedicado ≥3 personas** full-time
- **Interest de VC** o term sheet recibido
- **Customers significativos** que preferirían contratar entity dedicada (B2B enterprise)
- **Regulatory requirements** que exigen entity separada (fintech, healthtech, etc.)
- **Founder natural de esa venture** emerge (no el studio GPs — alguien que vivirá esto full-time)

### Signals negativos (NO spin out todavía)

- Revenue inestable o decreciendo
- Team sigue siendo studio GPs part-time
- Pre-PMF todavía
- Legal/regulatory no lo requiere

---

## Las 7 capas del spin-out

Cada una con su checklist:

### Capa 1: Legal Entity Formation

- Formar nueva LLC/Corp en jurisdicción apropiada (ver skill `structure-decision`)
- Registered agent + business address
- EIN (Employer Identification Number) si US
- Operating Agreement con governance structure
- Initial shareholders resolutions

**Anti-pattern**: usar el studio como "parent" sin clear legal separation — parece parent-subsidiary pero no lo es → liability contagion risk.

### Capa 2: IP Assignment

Este es **CRÍTICO** y frecuentemente mal ejecutado.

**Inventory del IP a transferir**:

- Codebase (Git repos)
- Trademarks (brand name, logo)
- Domain names
- Patents (si aplica)
- Trade secrets (algoritmos propietarios)
- Customer lists / data
- Documentation
- Designs / creative assets
- Content / editorial

**IP Assignment Agreement** (legal document) entre studio → nueva entity:

- Lista explícita del IP que se transfiere
- Effective date
- Consideration (usualmente nominal $1 o equity swap)
- Warranties (studio warrants it actually OWNS el IP — important if third parties contributed)

**Common trap**: freelancers o ex-employees pueden haber contribuido IP. Si sus contracts no tenían assignment clauses, they might own part of the IP. Validar antes de spin out.

### Capa 3: Contracts Migration

Para cada customer contract:

- **Option A — Novation**: transferir formally el contract del studio al new entity. Requiere customer consent.
- **Option B — New contract**: cancelar contract con studio, firmar new contract con new entity. Customer debe estar on board.
- **Option C — Sub-licensing**: studio retains contract, sublicenses services from new entity. Simpler but not clean separation.

**Recomendación**: Novation cuando posible. Más clean, customer prefers (same terms continuing), no interruption.

**Timing**: anunciar spin-out a customers con 30-60 días de anticipación, acompañado por explicación del why y FAQs. Major customers pueden requerir meetings individuales.

### Capa 4: Team Migration

Para cada persona trabajando en la venture:

**Employees formales**:
- Terminate employment en studio
- Hire en new entity
- New employment agreement
- Transfer benefits (health insurance, retirement) if applicable
- Final paycheck + any accrued PTO payout

**Freelancers / contratistas**:
- Terminate contract con studio
- New contract con new entity
- Transfer IP assignment (re-sign to new entity)

**Equity holders**:
- If they had sweat equity in studio → negotiate how it transfers
- Usually: cancel studio equity, issue equivalent equity in new entity (with fresh vesting period if appropriate, or grandfathered)

### Capa 5: Cap Table

La nueva entity necesita su cap table. Typical structure:

| Shareholder | % | Notes |
|---|---|---|
| Founder (natural) | 50-70% | Usually the person who will run it full-time |
| Studio (as founder / investor) | 20-40% | The studio retains meaningful stake |
| Employee pool | 10-15% | For future hires + team |
| Advisors (if any) | 0-5% | Per FAST agreement |

**Studio stake**:
- If studio contributed capital + IP + team: studio deserves stake
- Typical ranges: 20-40% at spin-out for "studio-built" ventures
- This stake may dilute over future rounds

**Founder stake**:
- The person leaving studio to run venture full-time gets lion's share
- Reflects ongoing commitment + risk taken (leaving studio salary)

### Capa 6: Financials Separation

- Open **separate bank accounts** (Mercury for US, local bank for LATAM OpCo)
- Transfer cash allocation from studio → new entity (with documentation — is it a loan? investment? service payment?)
- Set up **accounting from zero** (new books, no mixing historical data with studio)
- **Tax registration** in relevant jurisdictions
- **Pricing/billing** under new entity's name

**Common trap**: commingling funds por meses mientras migration happens. Riesgo legal — makes separation unclean, pierce-the-corporate-veil risk.

### Capa 7: Branding / Marketing

- Domain transfer (if shared with studio, acquire own domain)
- Website rebuild or transfer
- Social media accounts (transfer ownership or create new)
- Email accounts (@newventure.com vs @studio.com)
- Stationery, business cards
- Customer communication of rebrand if applicable

---

## Flujo del skill

### Paso 1 — Assess readiness

**SO-1**: "¿La venture cumple los signals positivos de spin-out?
- [ ] Revenue ≥ $10k MRR sustained 6+ months
- [ ] Team dedicado ≥3 FT (no studio GPs part-time)
- [ ] Pre-PMF → PMF validated
- [ ] VC interest / term sheet
- [ ] Customer signals (enterprise asking for dedicated entity)
- [ ] Regulatory signals (need own entity for compliance)
- [ ] Natural founder ready to go full-time

Si marcaste <3 signals: probably NOT ready. Revisar en 3-6 meses."

### Paso 2 — Define structure

**SO-2**: "Invocar `structure-decision` skill para elegir jurisdicción + forma legal para la nueva entity. Considerar:

- Mercado objetivo de la venture
- Fundraising plans (VC friendly jurisdictions = Delaware or Cayman)
- Founders' tax residency
- Special regulations por sector

Output: jurisdicción + forma (Delaware LLC vs. Delaware C-Corp vs. Cayman Sandwich setup)."

### Paso 3 — IP inventory

**SO-3**: "Listar todo el IP creado para esta venture mientras estaba en el studio:
- [Codebase repos]
- [Trademarks filed]
- [Domains owned]
- [Patents]
- [Trade secrets / algorithms]
- [Customer data]
- [Content / assets]

Identificar quién lo creó (staff studio, freelancers, contratistas). Si hay third parties
sin assignment agreement en file → flag como potential issue."

### Paso 4 — Contracts inventory

**SO-4**: "Listar todos los contracts activos under this venture:
- Customer contracts (con valor > $)
- Vendor contracts (hosting, tools, SaaS)
- Partnership agreements
- Licensing agreements

Per cada uno decidir: novation, new contract, o sub-licensing."

### Paso 5 — Team plan

**SO-5**: "Listar personas involucradas + action plan:

| Person | Current role | Action post spin-out | Equity in new entity |
|---|---|---|---|
| [Natural founder] | Lead | Full-time new entity | 50-70% |
| [Team member] | Role | Transfer to new entity | 0-5% + vesting |
| [Studio GP] | PM part-time | Remain in studio; advisor to new entity | 0-3% (advisor) |
| [Freelancer] | Dev contract | Transfer contract | 0 (contractor) |"

### Paso 6 — Cap table design

**SO-6**: "Cap table inicial de la new entity. Considerar:
- Studio stake (20-40% typical)
- Founder stake (50-70%)
- Employee pool (10-15%)
- Advisors (0-5%)

Generate via skill `cap-table-per-venture`."

### Paso 7 — Timeline

**SO-7**: "Spin-out timeline realista:

- **Week 1-2**: legal entity formation, accountants engaged
- **Week 3-4**: IP inventory + assignment agreement drafted
- **Week 5-6**: team communication + employment changes
- **Week 7-8**: customer communication + contract migrations begin
- **Week 9-10**: bank accounts + financial separation
- **Week 11-12**: branding, website, announcement

Total: **~3 meses** para spin-out clean. Quick-and-dirty en 4-6 semanas = likely issues."

---

## Output

Generar `./portfolio/{studio}/spin-outs/{venture}-spin-out-plan.md`:

```markdown
# Spin-Out Plan — [Venture Name]

**⚠️ DRAFT ONLY — NOT legal advice. Validate with corporate + tax + IP lawyers.**

## Readiness assessment

| Signal | Status |
|---|---|
| Revenue ≥ $10k MRR 6+ months | ✅/❌ |
| Dedicated team ≥3 FT | ✅/❌ |
| PMF validated | ✅/❌ |
| VC interest | ✅/❌ |
| Customer signals | ✅/❌ |
| Natural founder | ✅/❌ |

**Decision**: [GO / WAIT / NO]

## Proposed structure

- Jurisdicción: [e.g., Delaware LLC]
- Legal form: [e.g., LLC with potential C-Corp flip]
- Banking: [e.g., Mercury]

## IP inventory + assignment

[Lista completa + ownership status]

## Contracts to migrate

| Contract | Type | Migration method | Target date |
|---|---|---|---|
| [name] | Customer | Novation | [date] |
| [name] | Vendor | New contract | [date] |

## Team migration plan

[Table completa]

## Cap table (new entity)

| Shareholder | % | Shares | Vesting |
|---|---|---|---|
| [Founder] | 60% | X | 4yr/1yr cliff |
| Studio | 25% | Y | Fully vested |
| Employee pool | 10% | Z | Per hire vesting |
| Advisor | 5% | W | Per FAST |

## 12-week timeline

[Detailed week-by-week plan]

## Risks + mitigations

- [Risk 1]: [Mitigation]
- [Risk 2]: [Mitigation]

## Legal + advisors engaged

- [ ] Corporate lawyer: [name]
- [ ] Tax advisor: [name]
- [ ] IP lawyer: [name]
- [ ] Employment lawyer: [name] (if applicable)
```

---

## Principios clave

- **Clean separation > shortcut**: 3 meses clean spin-out > 6 semanas messy spin-out
- **IP assignment first**: sin IP ownership, el spin-out puede ser unwound
- **Customer communication early**: major customers prefer knowing 60 días ahead
- **Studio retains stake**: 20-40% stake es fair para studio's contribution
- **Accounting separation desde día 1**: evitar commingling

## Anti-patterns

- Spin-out antes de PMF (usually kills the venture — timing wrong)
- Olvidar IP de freelancers sin assignment clauses
- Transfer de cash sin documentation (loan? investment? unclear)
- Customer communication last-minute (damages relationships)
- No retirar accounting hasta que esté separado (creates mess)
- Studio retains too much (60%+) — kills founder motivation
- Studio retains too little (<15%) — no worth it for studio

## Integración con otras skills

- **`structure-decision`**: prerequisite — jurisdicción + forma legal
- **`cap-table-per-venture`**: para estructurar el cap table de new entity
- **`sweat-equity-agreement`**: para equity del founder + team en new entity
- **`liability-contagion-analysis`**: si la venture era 🔴 y operaba en studio single-LLC, el spin-out reduces contagion risk
- **`structure-evolution-roadmap`**: el spin-out es una de las rutas (Single-LLC → Multi-LLC)

## Recursos

- [Cooley Go — Spin-Out Agreements](https://www.cooleygo.com/)
- [Y Combinator — Founder Agreement templates](https://www.ycombinator.com/library)
- [Carta — Cap Table management post spin-out](https://carta.com/)
- [Clerky — Formation docs + corporate housekeeping](https://www.clerky.com/)
