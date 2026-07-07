---
name: services-hub-setup
version: 1.0.0
description: >
  Sets up a "Services Hub Model" — a central Services LLC that contracts
  bilateral MSAs with each independent Venture LLC in a multi-venture portfolio.
  Middle ground between serial-entrepreneur-with-Multi-LLCs and
  formal-venture-studio-with-holding. Generates MSA template + SOW template
  + transfer pricing methodology + IP assignment rider + billing calendar.
  Use when the user asks "services hub", "MSA template", "shared services setup",
  "central services entity", "transfer pricing methodology",
  "/services-hub-setup", or has chosen Services Hub pattern (patrón #6) via
  structure-decision skill. STRONG LEGAL DISCLAIMER — MSAs are legal contracts
  that require lawyer review.
---

# Services Hub Setup

Implementa el **Services Hub Model** — una Services LLC central que provee shared
services a múltiples Venture LLCs independientes vía Master Service Agreements (MSAs)
bilaterales.

Es el **middle ground** entre:
- Serial entrepreneur con Multi-LLCs sin shared services formales (chaos)
- Venture studio formal con Holding + Fund atado (overkill hasta que sea necesario)

## ⚠️ DISCLAIMER LEGAL FUERTE

Los MSAs, SOWs, e IP Assignment Riders que este skill genera son **templates de
preparación**. **NO son asesoría legal**. **Antes de firmar cualquier MSA con una
Venture LLC que tenga VC money o empleados**, consultar:

- **Corporate lawyer** en la jurisdicción del Services LLC (Delaware típicamente)
- **Corporate lawyer** en la jurisdicción de cada Venture LLC (LATAM local)
- **Tax advisor** con experiencia en transfer pricing arm's-length (big 4 o
  specialist firm)
- **IP lawyer** si hay patents o trade secrets involved

Errores comunes en MSAs self-drafted:

- IP assignment ambiguo → dispute cuando Venture LLC raise VC
- Transfer pricing sin methodology documentada → tax reassessment + penalties
- Billing terms vagos → dispute entre entidades (aunque sean "tuyas")
- Liability caps insuficientes → Services LLC absorbe catastrophic loss

**Uso correcto de este skill**: generar drafts estructurados, llegar al abogado con
material listo para revisión + customization jurisdiccional.

## Regla de idioma

Español. Términos legales en "español (English)" primera vez.

## Directorio de salida

```
./portfolio/{founder-o-studio-name}/services-hub/
├── services-llc-outline.md                 # Operating agreement outline del Services LLC
├── msa-template.md                         # Master Service Agreement base
├── sow-template.md                         # Statement of Work per engagement
├── transfer-pricing-methodology.md         # Arm's-length methodology + markup rationale
├── ip-assignment-rider.md                  # IP assignment rider (anexo al MSA)
├── billing-calendar.md                     # Cadencia mensual de facturación
└── venture-msas/                           # Copias firmadas per venture (cuando se generen)
    ├── {venture-1}-msa.md
    ├── {venture-2}-msa.md
    └── ...
```

---

## Prerrequisito: elegir Services Hub como estructura

Antes de correr este skill, confirmar vía `structure-decision` que **Services Hub** (patrón
#6) es la recomendación correcta para tu scenario.

Señales claras de Services Hub fit:

- **3+ ventures activas** (menos → no justifica overhead)
- **Shared services reales** (mismos devs, designers, tools entre ventures)
- **Plan de VC raises independent per venture** (cada cap table separado)
- **Sin plan de fund atado** (si querés fund atado → usar `attached-fund-structure`)
- **Ventures no-combinables** por liability contagion (ver `liability-contagion-analysis`)

Si no tenés estas señales, probably Services Hub es premature optimization.

---

## El flujo (7 pasos)

### Paso 1 — Context del founder + ventures

**SH-1**: "¿Cuántas ventures voy a servir desde el Services LLC?
- Nombres legales (o codenames si pre-formation)
- Jurisdicción de cada una
- Stage (idea / MVP / revenue)"

**SH-2**: "¿Qué shared services voy a proveer? Marcar los que apliquen:
- [ ] Engineering / development (devs con skill set compartido)
- [ ] Design / UX
- [ ] Marketing / content / growth
- [ ] Legal retainer + compliance
- [ ] Finance / accounting
- [ ] Infrastructure / DevOps
- [ ] People / HR / recruiting
- [ ] Executive / strategy (tu time como founder)
- [ ] Otro (especificar)"

**SH-3**: "¿Quién vive en el Services LLC?
- Tú (founder) — % ownership
- Otros partners en el Services LLC — %
- Empleados full-time (no freelancers ni contractors) — typical roles?"

### Paso 2 — Form Services LLC

**SH-4**: "Setup del Services LLC:

**Jurisdicción recomendada**: Delaware LLC (default).
- Razones: pass-through taxation, VCs familiar, Mercury banking, low cost
- Alternativas: Wyoming LLC (cheaper + privacy), US-TX LLC (Skip-CR pattern si founders
  son LATAM residents sin empleados US)

**Setup vía Stripe Atlas / Firstbase / Clerky**: ~$500-$800
**Annual maintenance**: ~$400 (franchise + registered agent)
**Banking**: Mercury (default para founders internacionales)

**Naming convention**: '[Founder Surname] Services LLC' o '[Studio Name] Services LLC'.
Importante: NO usar el mismo nombre que ninguna venture (confusión legal + branding).

**Operating Agreement key terms**:
- Member(s) + ownership %
- Capital contributions (minimum $1k initial)
- Management structure (member-managed default; manager-managed si múltiples)
- Distribution rules
- Dissolution + exit procedures"

Generar `services-llc-outline.md` con:
- Nombre legal propuesto
- Jurisdicción
- Operating agreement outline
- Banking setup
- EIN requirement (filing con IRS)
- Initial capital contribution

### Paso 3 — Draft MSA template (framework)

Leer también: disclaimer legal al inicio del skill.

**SH-5**: "MSA es el contrato framework entre Services LLC y cada Venture LLC. Se firma
una vez, vida multi-año, y después cada engagement específico se describe via SOW
(Statement of Work) sin re-firmar todo.

Términos clave del MSA:

1. **Parties**: Services LLC + Venture LLC + legal addresses
2. **Scope general**: catálogo amplio de services que puede proveer
3. **Pricing methodology**: cost-plus markup (ver paso 5)
4. **Billing cadence**: mensual default
5. **IP ownership**: work product → Venture (excepto Services LLC tools/frameworks)
6. **Confidentiality**: 5-year NDA both ways
7. **Liability caps**: 12 months of fees per Venture (standard)
8. **Termination**: 60-day notice + transition plan
9. **Dispute resolution**: arbitration en Delaware (default)
10. **Governing law**: Delaware (match Services LLC jurisdiction)"

Generar `msa-template.md` con sección por término + placeholder sections para customization
jurisdiccional.

### Paso 4 — Draft SOW template (per engagement)

**SH-6**: "Los SOWs son addenda al MSA para describir engagements específicos.

Formato SOW típico:
- Reference al MSA de base
- Engagement name + description
- Deliverables + acceptance criteria
- Timeline (start + end date o ongoing)
- Pricing (fixed, hourly, retainer)
- Dedicated resources (qué personas/horas)
- Success metrics
- Dependencies (qué necesita la Venture proveer)

Ejemplos:
- SOW-001: 'Build MVP v1 de [Venture]. 40 hours/week × 12 weeks. $X total.'
- SOW-002: 'Marketing retainer para [Venture]. 20 hours/week ongoing. $Y/mes.'
- SOW-003: 'Legal review anual de TOS + Privacy Policy. Fixed $Z.'"

Generar `sow-template.md` con sección para cada campo + 3 ejemplos por tipo (dev,
marketing, legal).

### Paso 5 — Transfer pricing methodology

Este paso es **el más crítico** para tax compliance.

**SH-7**: "Transfer pricing entre entidades relacionadas (Services LLC ↔ Venture LLC con
common ownership) requiere arm's-length pricing.

**Metodología estándar recomendada**: **Cost-plus con 10% markup**.

- **Cost**: todos los costos directos + indirectos de proveer el service
  - Salarios + benefits + payroll taxes de los team members
  - Tools + infrastructure allocated
  - Overhead general (oficina, admin, etc.)
- **Markup**: 10% sobre cost (defensible per OECD guidelines para services)
- **Invoice**: Services LLC bills Venture LLC monthly al Cost × 1.10

**Alternativas** (para casos específicos):

- **Cost-plus 5%**: para services de bajo valor agregado (data entry, admin)
- **Cost-plus 15%**: para services altamente especializados (engineering con rare skills)
- **Flat rate**: para shared infrastructure fácil de allocate (cloud hosting per user)
- **ABC (Activity-Based Costing)**: para legal retainer where matters son discrete

**Regla de oro**: documentar la methodology BEFORE firmar el primer MSA. Re-evaluar
annually. Tax authorities require Transfer Pricing Documentation en auditorías —
tener methodology escrita es critical defense."

Generar `transfer-pricing-methodology.md` con:
- Methodology elegida + rationale
- Markup benchmarks (con fuentes OECD + industry)
- Cost calculation example
- Re-evaluation cadence (annual review)
- Documentation requirements per jurisdicción

### Paso 6 — IP Assignment Rider

**SH-8**: "IP assignment entre Services LLC y Venture LLC es sutil:

**Work product → Venture LLC**: todo código, diseño, copy, marketing materials creado
PARA la Venture se asigna a la Venture. El Venture pays la ownership via el MSA fees.

**Services LLC retains**: tools, frameworks, reusable libraries que Services LLC usó
para hacer el work product. Ejemplo: Services LLC tiene un framework React customizado;
usa ese framework para build Venture LLC's app; el app es de la Venture, el framework es
de Services LLC.

**Third-party IP**: open source + third-party services (AWS, Stripe, etc.) con their
respective licenses.

**Pre-existing IP**: cualquier cosa Services LLC o Venture LLC tenían ANTES del MSA
keeps its original ownership.

Redactar rider anexo al MSA especificando esto."

Generar `ip-assignment-rider.md` con:
- Definición clara de work product vs. tools/frameworks
- Licencia recíproca (Services LLC licenses frameworks to Venture para usarlo en el
  work product)
- Exclusions (pre-existing IP)
- Third-party IP handling

### Paso 7 — Billing calendar + accounting

**SH-9**: "Cadencia de facturación:

- **Día 1 del mes**: Services LLC calcula hours + costs del mes anterior
- **Día 3**: generar invoice per venture (detail hours + services)
- **Día 5**: enviar invoice a venture (email + PDF)
- **Día 15**: payment due (NET 15)
- **Día 16+**: late fee 1.5% monthly si no-paid

Si venture atraviesa cash crunch temporal, flag a service disruption antes de late fee.

Accounting setup:

- **Services LLC**: accounting software (Xero / QuickBooks). Cada cost categorizado
  por venture cliente. Revenue categorizado por venture cliente.
- **Venture LLC**: accounting software separado. Cost allocation = MSA invoice amount.
- **Bank accounts separados**: Services LLC uses Mercury account. Each Venture LLC uses
  own account. Intercompany transfers vía ACH (documented).

Documentation requerida para tax audit:

- MSA firmado
- Monthly invoices
- Time tracking data (Harvest/Toggl per team member per venture)
- Transfer pricing methodology doc
- Annual review notes"

Generar `billing-calendar.md` con:
- Mensual schedule + responsibilities
- Invoice template
- Escalation procedures
- Accounting software recommendation

---

## Evolution path: Services Hub → Holding formal

El Services Hub es **middle ground**. Cuando sea el trigger correcto, migrar a formal
Holding structure (ver skill `structure-evolution-roadmap`).

**Triggers** para upgrade a Holding:

- 2+ ventures hit Series A ($2M+ priced rounds)
- Planning de levantar FUND atado (LP capital)
- Tax optimization at holding level justifies complexity (accountant calcula $50k+/year savings)
- Exit plan del studio como entity (vs. exits individuales per venture)

**Timeline de upgrade**: planificado 6-12 meses ahead. No hacer durante term sheet
negotiation.

**Estructura destino**:

```
Holding Company (Delaware C-Corp o Cayman)
├── Management Company (renamed from Services LLC o nueva)
├── GP Entity (new)
├── Fund LP (new, if attached fund)
└── Venture LLCs (unchanged, now owned by Holding)
```

MSAs pasan a intercompany agreements centralized via Holding.

---

## Principios clave

- **MSA first, SOWs after**: siempre el framework antes de engagements específicos
- **Transfer pricing documented**: methodology escrita + re-evaluated annually
- **Separate accounting**: commingling kills the structure
- **Bilateral relationships**: cada Venture LLC sign MSA separately (not combined)
- **IP explicit**: "who owns what" clear desde día 1
- **Lawyer review NO optional**: MSA templates son drafts, no final

## Anti-patterns

- Servicios ad-hoc sin MSA (transfer pricing audit nightmare)
- Venture LLC pays Services LLC via informal Venmo (no audit trail)
- Cost-plus con markup aleatorio ("cobramos 30% porque sí") — auditoría lo cuestiona
- Mismo IP assignment clause copy-pasted entre MSAs distintos (ventures tienen needs
  distintos)
- No re-evaluar methodology annually — costs + benchmarks cambian
- Services LLC bills en bulk ("$10k/mes por Services") sin detail — no defensible

## Integración con otras skills

- **`structure-decision`** (prerequisite): debe haber elegido patrón #6 Services Hub
- **`liability-contagion-analysis`**: validar que las ventures NO son combinables bajo
  single-LLC (razón de Services Hub + Multi-LLC)
- **`shared-services-ledger`**: tracking operacional de hours + costs per venture (input
  del monthly billing)
- **`sweat-equity-agreement`**: si team members del Services LLC tienen equity en
  Venture LLCs, coordinar cap tables
- **`structure-evolution-roadmap`**: trigger para upgrade Services Hub → Holding
- **`cap-table-per-venture`**: cada Venture LLC mantiene cap table independiente

## Recursos

- **Cooley Go** — [MSA templates library](https://www.cooleygo.com/)
- **Stripe Atlas** — incorporation + standard contracts (Delaware LLC)
- **Clerky** — corporate housekeeping + document storage
- **OECD Transfer Pricing Guidelines** — source of truth internacional
- **Deloitte / PwC / EY / KPMG** — transfer pricing advisors (big 4 para audit defense)
- **Mercury** — banking para Services LLC + Venture LLCs
- **Xero / QuickBooks** — accounting software con intercompany features
- **Harvest / Toggl** — time tracking per venture para cost allocation
- **Carta** — cap table management (separate per venture)

## Case study: @lapc506 (reference)

Ver `references/lapc506-services-hub-canonical.md` para ejemplo completo del pattern
aplicado al serial entrepreneur con 4 ventures personales (Altrupets, Vertivolatam,
Habitanexus, Aduanext) operando desde Costa Rica.
