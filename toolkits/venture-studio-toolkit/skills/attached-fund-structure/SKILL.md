---
name: attached-fund-structure
version: 1.1.0
description: >
  Designs the legal structure for attaching a venture fund to a studio —
  Management Co + GP entity + LP entity layered per govclab recommendation.
  Use when the user asks "attached fund", "studio fund", "management company",
  "GP LP structure", "fund formation", "LP agreement",
  "/attached-fund-structure", or has a mature studio and considers launching
  a fund alongside it. STRONG LEGAL DISCLAIMER — fund formation is highly
  regulated and jurisdiction-specific; this skill is a preparation aid, NOT
  legal advice.
---

# Attached Fund Structure (Studio + Fund)

Diseña la estructura legal para atar un fondo al studio operativo, siguiendo la
arquitectura recomendada por govclab.

## ⚠️ ¿Este skill es para vos?

**Este skill es para venture studios con plan de fund atado (LP capital)**. Si sos
serial entrepreneur o operador de studio sin plan de fund institucional,
**probablemente NO necesitás esto**.

### Casos donde este skill NO es para vos

- **3-5 ventures personales con raises VC independientes per venture** → usar
  `structure-decision` patrón #6 (Services Hub) + skill `services-hub-setup`
- **Un solo venture con VC** → usar `structure-decision` para elegir Delaware Tostada,
  Cayman Sandwich, o C-Corp apropiado
- **Serial entrepreneur sin plan de fund institucional** → usar `when-to-become-studio`
  para validar si necesitás formalizar (probablemente Mode 2 — Services Hub)
- **Pre-track record studio** → esperar hasta tener 2+ exits o milestone equivalente
  antes de considerar fund atado

### Casos donde SÍ es para vos

- Track record verificable de venture studio operando 2+ años
- Plan concreto de levantar $2-10MM+ de Limited Partners institucionales
- Team dedicated al studio work (no solo founders de ventures individuales)
- Budget para setup legal $50k+ + fund admin $20-50k/año ongoing
- LP prospects identificados con conversaciones iniciales (≥10 meetings)

Si ninguno de estos aplica → volvé a `structure-decision` (especialmente patrón #6
Services Hub) o `when-to-become-studio` para guía apropiada.

## ⚠️ DISCLAIMER LEGAL FUERTE

**Fund formation es un dominio altamente regulado**. Las jurisdicciones tienen
requirements específicos (SEC en US, CIMA en Cayman, CNMV en España, etc.), reglas de
KYC/AML sobre LPs, restricciones de marketing (Reg D en US, etc.), y responsabilidades
fiduciarias significativas.

**Esta skill genera un draft estructural para llegar preparado/a a tu abogado**. **NO
reemplaza**:

- Fund formation lawyer (especializado en VC)
- Securities lawyer (para compliance de marketing + offering)
- Tax lawyer / accountant (para structuring fiscal)
- Fund administrator (para operaciones)

**NO incorporar un fund basándote solo en este output**. Consultar al menos 3 abogados
especializados antes de firmar nada. Los errores de fund formation son caros y a menudo
irreversibles.

## Regla de idioma

Español. Términos de fund formation en "español (English)" primera vez.

## Directorio de salida

```
./portfolio/{studio-name}/fund/
├── structure-design.md          # Diseño arquitectónico
├── jurisdictions-analysis.md    # Comparativa de jurisdicciones para GP/LP/Fund
├── checklist-abogados.md        # Qué preguntar a cada tipo de abogado
└── references-links.md          # Templates govclab + otros recursos
```

---

## La arquitectura recomendada (govclab)

```mermaid
flowchart TD
    MC["🏢 <b>Management Company</b><br/>Operaciones del studio<br/>Contratos · servicios · gestión de portfolio"]
    GP["⚖️ <b>GP Entity (General Partner)</b><br/>Administradora del fund<br/>Decisions de inversión · gestión del fund"]
    Fund["💰 <b>Fund Entity (LP)</b><br/>Vehículo de inversión<br/>Donde viven los recursos de los LPs"]
    Portfolio["🚀 <b>Portfolio Companies</b><br/>Las ventures<br/><i>Del studio o inversiones externas</i>"]

    MC -->|"provides services to"| GP
    GP -->|"manages"| Fund
    Fund -->|"invests in"| Portfolio

    style MC fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style GP fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    style Fund fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style Portfolio fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
```

### Por qué esta separación

- **Management Co** aísla operaciones del studio de las responsabilidades del fund (si el fund falla, el studio operations siguen)
- **GP Entity** separada del fund provee limited liability para los managers (si un LP demanda, no toca assets personales)
- **Fund Entity** es donde viven los LP commitments — estructurado según jurisdicción (Delaware LP, Cayman LP, Luxembourg SCSp, etc.)

### Management fees + Carry

- **Management Company recibe management fee**: típico 2% annual del committed capital
- **GP Entity recibe carry**: típico 20% de los profits después del hurdle (8% IRR usual)
- Esto es "2 and 20" — el standard VC industry

---

## Flujo del skill

### Paso 1 — Precondiciones

**AFS-1**: "¿Cumplís estas precondiciones?
- [ ] Studio tiene al menos 12 meses operando con track record
- [ ] Track record cuantificable (exits, raised amounts, companies helped)
- [ ] Thesis validated (ver skill `studio-thesis`)
- [ ] Secret sauce identified (ver skill `secret-sauce`)
- [ ] LP prospects identificados (al menos 10 potential LPs con conversaciones iniciales)
- [ ] Capital disponible para setup ($50k-$200k mínimo para setup legal + fund admin)

Si alguna falta: **NO estás listo/a para attached fund todavía**. El setup cost + regulatory burden matará al studio si arrancás sin precondiciones."

### Paso 2 — Fund jurisdicción

**AFS-2**: "¿Dónde están tus LPs principales?
- US-based LPs (HNWIs, family offices, institutions) → Delaware LP más común
- LATAM LPs → Cayman LP (47.7% de unicornios LATAM ya están ahí)
- European LPs → Luxembourg SCSp o Ireland
- Mixed international → Cayman típicamente
- Token-economy LPs (crypto) → BVI o Cayman

La jurisdicción del fund debe matchear where LPs están dispuestos a invertir con
comfort legal/fiscal."

### Paso 3 — GP entity jurisdicción

**AFS-3**: "¿Dónde viven los GPs (los managers del fund)?
- US residents → Delaware LLC para GP
- Non-US residents + US LPs → Cayman GP o BVI
- Latam GPs + local fund → podría ser jurisdicción LATAM (con caveats — raro para fund institutional)

La GP entity debe ser compatible con tax residency de los GPs para evitar
double-taxation del carry."

### Paso 4 — Management Co jurisdicción

**AFS-4**: "¿Dónde se operan los servicios del studio (empleados, contratistas, oficina)?
- US operations → Delaware LLC or C-Corp
- LATAM operations → OpCo local (CR SRL, MX S.A.P.I., etc.)
- Mixed operations → Management Co donde esté el mayor volumen de ops

La Management Co es donde se pagan los empleados y proveedores. Debe poder contratar
localmente."

### Paso 5 — Matching las 3 jurisdicciones

Las 3 entidades NO tienen que estar en la misma jurisdicción. De hecho, la estructura
típica de un fund LATAM:

- Fund: **Cayman LP**
- GP: **Cayman LLC** (o Delaware LLC)
- Management Co: **LATAM OpCo** (donde están los empleados del studio)

Esta separación es exactamente lo que govclab recomienda.

### Paso 6 — Fund size + economics

**AFS-5**: "Definir parámetros (ver también skill `studio-thesis`):
- **Target fund size**: $X MM (mínimo $2MM, target $10MM para emerging manager)
- **Management fee**: 2% anual del committed capital (estándar)
- **Carry**: 20% de profits después de hurdle
- **Hurdle rate**: 8% IRR (LP gets 8% before GP gets carry — estándar)
- **Fund term**: 10 años + 2 extensions de 1 año (estándar VC)
- **Investment period**: primeros 3-5 años para deploying capital

¿Querés algo non-standard? Justificar y esperar pushback de LPs."

### Paso 7 — LPA (Limited Partnership Agreement)

**AFS-6**: "Para el LPA (contrato con LPs), Govclab provee free templates:

- **Cornerstone LPA v3.0** — [govclab.com/resources](https://govclab.com/resources/) — incorporates latest SEC regulations
- **The PACT** — pledge agreement for non-binding LP commitments (usado en fundraising antes del closing)

Consultar estos templates como starting point, pero **NUNCA firmar un template como-es**.
Tu abogado debe customize al caso específico.

Key terms que NO son negotiables con LPs serios:

- Capital calls mechanism (cómo el fund llama capital de LPs)
- Preferred return / hurdle
- Carry waterfall (distribución de profits)
- Clawback provisions (si GP sobrepaga carry, debe devolver)
- Key person clause (qué pasa si GP clave se va o muere)
- Investment restrictions (no invertir en ciertos sectores, geografías, stages)
- Reporting requirements (frequency + format)"

### Paso 8 — Fund administrator

**AFS-7**: "Todo fund institutional usa un **fund administrator** para manejar:

- NAV calculations
- Capital calls + distributions
- LP reporting
- KYC/AML compliance
- Tax reporting (K-1s in US, etc.)

Options comunes: Sudrania, Gen II Fund Services, Deloitte Fund Administration, etc.
Costo: $20k-$100k/year según tamaño del fund.

Para fund <$10MM, probablemente no puedas afford full admin. Opciones:
- Hybrid: GP hace admin básico + outsource audit
- Crowdfunding-lite platforms (AngelList, Carta Fund Admin) para funds pequeños"

### Paso 9 — Regulatory considerations

**AFS-8**: "Check list de regulatory compliance (varía por jurisdicción):

**US Reg D**:
- Fund debe ser privately offered — no general solicitation sin Rule 506(c)
- LPs deben ser accredited investors
- Form D filing con SEC within 15 días de first sale
- Blue sky filings por state donde LPs residen

**Cayman**:
- CIMA registration si asset size > threshold
- AML officer designated
- Economic substance requirements (operating expenses in Cayman)

**LATAM**:
- Varía drásticamente. México SEC equivalente (CNBV). Brasil CVM. Argentina CNV.
  Consultar abogado local.

**Marketing**:
- Materiales con LPs → review por securities lawyer BEFORE sending
- 'Track record' claims → auditable evidence required
- 'Returns' claims → regulated disclosures

Underestimar compliance es trampa común — lleva a SEC actions que cierran fondos."

---

## Output

Generar `./portfolio/{studio}/fund/structure-design.md`:

```markdown
# Attached Fund Structure Design — [Studio Name]

**⚠️ DRAFT ONLY — NOT legal advice. Validate with fund formation lawyer.**

## Precondiciones check

| Criterion | Status |
|---|---|
| 12+ months operating history | ✅/❌ |
| Cuantifiable track record | ✅/❌ |
| Thesis validated | ✅/❌ |
| Secret sauce identified | ✅/❌ |
| 10+ LP prospects with initial convos | ✅/❌ |
| $50k+ budget for setup | ✅/❌ |

**Proceed status**: [GO / NOT YET — address failed criteria first]

## Proposed structure

### Fund Entity

- **Jurisdicción**: [e.g., Cayman Islands]
- **Forma legal**: [e.g., Cayman Exempted Limited Partnership]
- **Razón**: [LP demographics]
- **Target fund size**: $X MM
- **Fund term**: 10 años + 2×1 year extensions

### GP Entity

- **Jurisdicción**: [e.g., Cayman LLC]
- **Razón**: [GP tax residency + fund compatibility]

### Management Company

- **Jurisdicción**: [e.g., LATAM OpCo]
- **Razón**: [where operations run]

### Economics

- Management fee: 2% annual committed capital
- Carry: 20% after 8% hurdle
- Investment period: 3 años
- Hurdle rate: 8% IRR preferred return

## LPA key terms draft

[Based on govclab Cornerstone LPA template — MUST be customized by lawyer]

- Capital calls: [mechanism]
- Distributions: [waterfall]
- Key person: [GPs named]
- Investment restrictions: [per thesis focus]
- Reporting: [quarterly unaudited, annual audited]

## Setup checklist

- [ ] Hire fund formation lawyer (3 quotes minimum)
- [ ] Hire securities lawyer (reg compliance)
- [ ] Hire tax lawyer (structuring fiscal)
- [ ] Select fund administrator
- [ ] Form Management Co (if not existing)
- [ ] Form GP Entity
- [ ] Draft LPA (use govclab template as base)
- [ ] KYC/AML procedures set up
- [ ] Form D filing prepared (US)
- [ ] Bank accounts (Management Co + GP + Fund escrow)
- [ ] Carta / Juniper Square / Dynasty setup (fund admin software)
- [ ] First close target date: [date]
- [ ] Final close target date: [date + 18 months typical]

## Estimated costs

- Legal (formation + LPA): $30k-$100k
- Fund admin setup: $10k-$30k
- Ongoing admin (annual): $20k-$80k
- Management fee can cover ongoing after first close

## Jurisdictions analysis

[Separate doc `jurisdictions-analysis.md` with detailed comparison]

## Abogados checklist

[Separate doc `checklist-abogados.md` con preguntas específicas por abogado]

## References

- Govclab resources (Cornerstone LPA, PACT)
- VC Lab curriculum (if not already done)
- Fund administrators: Sudrania, Gen II, Carta Fund Admin, AngelList
```

---

## Principios clave

- **Precondiciones MUST**: sin track record, sin LP prospects, NO hacer fund
- **3 entidades separadas**: Management Co, GP, Fund — cada una protege contra diferente risk
- **Jurisdicciones pueden diferir**: Management Co en LATAM, GP en Cayman, Fund en Cayman es estándar
- **Gov templates son starting point**: nunca firmar template genérico como-es
- **Regulatory compliance >>> optional**: SEC actions pueden cerrar tu fund irremediablemente

## Anti-patterns

- **"Solo hago un LLC y meto inversores ahí"** → puede constituir unregistered securities offering
- **Firmar Cornerstone LPA as-is** → los LPs que revisen van a detectar (y rechazar)
- **Olvidar Form D filing** → strict liability, multiples states
- **General solicitation sin 506(c)**: tweet público "raising $5M fund" sin 506(c) election = violation
- **Self-managed carry**: carry paid to self antes del final distribution sin clawback = fraud potencial

## Integración con otras skills

- **`studio-thesis`** (hard prerequisite): sin thesis validada no hay fund
- **`secret-sauce`** (hard prerequisite): LPs invierten en el secret sauce, no en vibes
- **`structure-decision`**: la Management Co se decide aquí
- **`studio-focus`**: el focus es parte del LPA (investment restrictions)

## Recursos

- **Govclab / VC Lab**:
  - [Cornerstone LPA v3.0](https://govclab.com/resources/) (free LPA template)
  - [The PACT](https://govclab.com/resources/) (non-binding LP commitment template)
  - [How to Build a Venture Studio](https://govclab.com/2023/04/25/how-to-build-a-venture-studio/) (structure guidance)
  - [VC Lab Curriculum](https://govclab.com/venture-institute/) (education)
- **Fund Administrators**: Sudrania, Gen II Fund Services, Carta Fund Admin, AngelList
- **Delaware Fund Library**: [Cooley Go](https://www.cooleygo.com/) — free templates for US funds
- **Books**: *Venture Deals* (Feld/Mendelson), *The Business of Venture Capital* (Mahendra Ramsinghani)
