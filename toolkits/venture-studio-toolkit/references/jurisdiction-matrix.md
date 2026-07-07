# Jurisdiction Matrix

> Matriz comparativa de las 16 jurisdicciones cubiertas nativamente por el plugin,
> organizada en 4 familias: **LATAM** (8 países), **US** (3 estados), **Offshore** (3),
> **EU founder options** (2). Cada sección incluye formas legales disponibles, costos
> estimados, tiempos de setup, implicaciones fiscales, compatibility con VCs, y
> banking options.
>
> **Aviso**: Los datos son estimados basados en fuentes públicas a abril 2026.
> Validar con abogado local antes de incorporar.

---

## Familia 1: LATAM (8 países)

### Costa Rica

- **Forma legal principal**: Sociedad Anónima (S.A.) o Sociedad de Responsabilidad Limitada (S.R.L.)
- **Setup cost**: ~$500-$1,500 USD (notario + registro + asesoría básica)
- **Annual maintenance**: ~$400-$800 USD (contabilidad + impuesto renta básico)
- **Setup time**: 2-4 semanas (si los socios están en CR; más lento si no)
- **Tax regime**: Impuesto sobre la renta 30% (empresas) + IVA 13%
- **Regulatory agencies**: INS (seguros), CCSS (Caja), MEIC (registro mercantil), Ministerio de Hacienda
- **Banking**: BAC Credomatic, BCR, Promerica (todos requieren documentos detallados)
- **VC friendliness**: ⚠️ Baja — VCs internacionales generalmente prefieren que la HoldCo NO sea S.A. costarricense
- **Pain points**: tiempos largos de INS/CCSS/MEIC, costos de formalización altos para el mercado pequeño
- **Fit**: startups con mercado primario CR + empleados formales locales. Si el mercado es US/global, considerar **Skip-CR pattern** (ver `structure-decision`).

### México

- **Forma legal principal**: Sociedad Anónima Promotora de Inversión (S.A.P.I. de C.V.) o Sociedad de Responsabilidad Limitada (S. de R.L. de C.V.)
- **Setup cost**: ~$1,500-$4,000 USD (notario público + registro público + asesoría)
- **Annual maintenance**: ~$1,500-$4,000 USD (contador + SAT compliance)
- **Setup time**: 3-6 semanas
- **Tax regime**: Impuesto Sobre la Renta (ISR) 30% + IVA 16%
- **Regulatory agencies**: SAT, IMSS (social security), Secretaría de Economía, CNBV (si fintech)
- **Banking**: BBVA, Banorte, Santander, Klar (digital), Nu (digital)
- **VC friendliness**: 🟢 Alta — S.A.P.I. de C.V. fue diseñada pensando en VC (permite diferentes clases de acciones + acuerdos de accionistas sofisticados)
- **Fit**: OpCo en Cayman Sandwich para startups con mercado México grande. Standalone S.A.P.I. viable para fundraising doméstico.

### Colombia

- **Forma legal principal**: Sociedad por Acciones Simplificada (S.A.S.)
- **Setup cost**: ~$500-$2,000 USD (Cámara de Comercio + notario + asesoría)
- **Annual maintenance**: ~$1,000-$2,500 USD
- **Setup time**: 1-2 semanas (S.A.S. es notablemente rápida)
- **Tax regime**: Impuesto de renta 35% + IVA 19%
- **Regulatory agencies**: Cámara de Comercio, DIAN (impuestos), Superintendencia de Sociedades
- **Banking**: Bancolombia, Davivienda, Nequi (digital)
- **VC friendliness**: 🟢 Media-alta — S.A.S. es flexible y moderna (reforma 2008)
- **Fit**: OpCo en LATAM structures; standalone para startups con mercado colombiano primario

### Chile

- **Forma legal principal**: Sociedad por Acciones (SpA) o Sociedad Anónima (S.A.)
- **Setup cost**: ~$800-$2,500 USD (notario + Conservador de Bienes Raíces + asesoría)
- **Annual maintenance**: ~$1,500-$3,000 USD
- **Setup time**: 2-4 semanas
- **Tax regime**: Impuesto Primera Categoría 27% + IVA 19%
- **Regulatory agencies**: SII (impuestos), CMF (financial)
- **Banking**: Santander Chile, Banco de Chile, Banco Estado, Mach (digital)
- **VC friendliness**: 🟢 Alta — SpA es muy flexible, estándar para VC deals
- **Fit**: OpCo en Cayman Sandwich para startups con ambición regional Sur América. Programa **Startup Chile** ofrece grants equity-free a startups extranjeras basándose en Chile.

### Perú

- **Forma legal principal**: Sociedad Anónima Cerrada (S.A.C.) o Sociedad Comercial de Responsabilidad Limitada (S.R.L.)
- **Setup cost**: ~$600-$1,500 USD
- **Annual maintenance**: ~$1,000-$2,000 USD
- **Setup time**: 2-4 semanas
- **Tax regime**: Impuesto a la renta 29.5% + IGV 18%
- **Regulatory agencies**: SUNAT (impuestos), INDECOPI, SMV (mercado de valores)
- **Banking**: BCP, Interbank, BBVA Perú, Yape (digital wallet)
- **VC friendliness**: 🟡 Media — menor actividad VC que MX/CO/CL
- **Fit**: OpCo para mercado peruano; LatAm regional plays suelen pasar por otros hubs primero

### Uruguay

- **Forma legal principal**: Sociedad Anónima (S.A.) o Sociedad de Responsabilidad Limitada (S.R.L.)
- **Setup cost**: ~$1,000-$3,000 USD
- **Annual maintenance**: ~$1,500-$3,500 USD
- **Setup time**: 4-8 semanas
- **Tax regime**: IRAE 25% + IVA 22%, **pero régimen ZONA FRANCA** ofrece 0% tax on foreign income si califica
- **Regulatory agencies**: DGI, BCU (bank central)
- **Banking**: Santander UY, Itaú, Scotiabank
- **VC friendliness**: 🟢 Alta — Uruguay tiene reputación de jurisdicción estable + Zona Franca es excelente para HoldCos
- **Fit**: **alternativa regional a Cayman Sandwich** — Uruguay HoldCo + LATAM OpCos. Particularmente atractivo para startups argentinas que evitan inestabilidad AR.

### Argentina

- **Forma legal principal**: Sociedad por Acciones Simplificada (S.A.S.) — reforma 2017, o Sociedad Anónima (S.A.)
- **Setup cost**: ~$500-$2,000 USD
- **Annual maintenance**: ~$1,500-$3,500 USD
- **Setup time**: 2-6 semanas (S.A.S. más rápida)
- **Tax regime**: Impuesto a las Ganancias 35% + IVA 21% + impuestos provinciales
- **Regulatory agencies**: AFIP, IGJ, BCRA
- **Banking**: ⚠️ **complicado por controles cambiarios** (cepo al dólar) — muchos founders argentinos operan vía cuentas en US/UY
- **VC friendliness**: 🔴 Baja — VCs evitan Argentina como HoldCo por controles cambiarios + inflación + inestabilidad política. Founders argentinos típicamente incorporan en Delaware o Uruguay.
- **Fit**: solo OpCo; nunca HoldCo. Considerar mudanza a UY o US para operaciones.

### Brasil

- **Forma legal principal**: Sociedade Limitada (Ltda.) o Sociedade Anônima (S.A.)
- **Setup cost**: ~$2,000-$5,000 USD (cartório + registros + advogado)
- **Annual maintenance**: ~$3,000-$8,000 USD (contabilidade é complexa)
- **Setup time**: 4-12 semanas
- **Tax regime**: IRPJ 15% + CSLL 9% + ISS 2-5% + PIS/COFINS — **regimenes múltiples** (Lucro Real, Presumido, Simples) según scale
- **Regulatory agencies**: Receita Federal, Banco Central (CVM si fintech)
- **Banking**: Itaú, Bradesco, Nubank, C6 Bank
- **VC friendliness**: 🟢 Alta para scale-ups (mercado VC brasileño grande) pero 🔴 setup complexity es alta
- **Fit**: OpCo para el mercado brasileño (gigante, justifica la complejidad). HoldCo en Cayman es casi universal.

---

## Familia 2: US (3 estados)

### Delaware

- **Forma legal principal**: Delaware LLC, Delaware C-Corporation
- **Setup cost**: $89 (state fee) + $100-$500 registered agent + $200-$2,000 legal (Stripe Atlas / Clerky / Firstbase ~$500)
- **Annual maintenance**: $300 franchise tax (LLC) o $400+ (C-Corp, calculado por shares/assets) + registered agent ~$100
- **Setup time**: 24-48 horas con servicios como Stripe Atlas
- **Tax regime**: LLC = pass-through. C-Corp = 21% federal + 8.7% Delaware state (si revenue en DE). Otros states donde se genera revenue: registrar foreign qualification
- **Regulatory**: Delaware Division of Corporations (friendly + fast)
- **Banking**: Mercury (most common for international founders), Brex, SVB (previously)
- **VC friendliness**: ⭐⭐⭐ **Gold standard** — 60%+ de new funds + mayoría de VC-backed startups US son Delaware. C-Corp para priced rounds; LLC para SAFEs/convertibles.
- **Fit**: **default** para la mayoría de startups internacionales buscando estructura US. Delaware LLC primero, convertir a C-Corp si priced round.

### Wyoming

- **Forma legal principal**: Wyoming LLC
- **Setup cost**: $100 (state fee) + $75-$200 registered agent + legal
- **Annual maintenance**: $60 annual report + registered agent ~$100
- **Setup time**: 24-48 horas
- **Tax regime**: LLC = pass-through, **no state income tax** en Wyoming
- **Regulatory**: Wyoming Secretary of State
- **Banking**: Mercury, Brex (similar a Delaware)
- **VC friendliness**: 🟡 Media — familiarity is lower que Delaware, VCs pueden pedir migración a Delaware antes de priced round
- **Fit**: alternativa barata a Delaware para bootstrapped founders. Notable por **privacy** (Wyoming no requiere disclosure de beneficial owners en state filings) — ventaja si privacidad es valor.

### Texas

- **Forma legal principal**: Texas LLC (primary) o Texas Corporation
- **Setup cost**: $300 state filing fee + registered agent + legal
- **Annual maintenance**: $0 franchise tax si revenue < $1.23M (2024 threshold); higher for larger
- **Setup time**: 24-48 horas
- **Tax regime**: LLC = pass-through, **no state income tax**. Texas franchise tax se aplica sobre margin, no income (favorable para service businesses)
- **Regulatory**: Texas Secretary of State
- **Banking**: Mercury, Brex + large national banks con presencia fuerte
- **VC friendliness**: 🟡 Media — similar a Wyoming, VCs familiarity is lower
- **Fit**: **caso chimeranext** — Texas LLC con freelancers LATAM. Atractivo por no state tax + friendly business climate + Austin tech hub. Common para startups que NO planean captar priced round VC en corto plazo.

---

## Familia 3: Offshore holdings (3)

### Cayman Islands

- **Forma legal principal**: Cayman Exempted Company Limited by Shares
- **Setup cost**: $2,500-$5,000 USD (legal + registration)
- **Annual maintenance**: $1,000-$3,000 USD (registered office + annual filing + management)
- **Setup time**: 2-4 semanas
- **Tax regime**: **0% corporate tax on foreign-sourced income**. No capital gains, no withholding.
- **Regulatory**: CIMA (Cayman Islands Monetary Authority) si regulated activities
- **Banking**: Cayman banks (Butterfield, CIBC) o bancos globales con branches
- **VC friendliness**: ⭐⭐⭐ **Standard LATAM** — 47.7% de unicornios LATAM usan Cayman HoldCo (Cayman Sandwich structure)
- **Fit**: HoldCo para Cayman Sandwich. **Nunca** OpCo — las operaciones reales deben correr en el país de venta para evitar apariencia de evasión fiscal.
- **Risks**: Mayor scrutiny regulatorio global (OECD BEPS, CRS reporting). Reputacional — algunos corporate partners prefieren no trabajar con Cayman entities.

### Panamá

- **Forma legal principal**: Sociedad Anónima (S.A.) panameña o Sociedad de Responsabilidad Limitada (S.R.L.)
- **Setup cost**: ~$1,200-$2,500 USD
- **Annual maintenance**: ~$400-$800 USD (tasa única + resident agent)
- **Setup time**: 1-2 semanas
- **Tax regime**: **Territorial** — solo se gravan ingresos generados en Panamá. Foreign income = 0% tax.
- **Regulatory**: Registro Público, DGI (si tiene operaciones locales)
- **Banking**: Banistmo, Banco General, Multibank
- **VC friendliness**: 🟡 Media — menos estándar que Cayman pero aceptable
- **Fit**: alternativa a Cayman para HoldCos LATAM. Ventaja: USD friendly (el balboa = USD 1:1) + zona horaria central + menos reputational baggage que Cayman.
- **Risks**: lista gris del GAFI históricamente (2014-2016, aunque actualmente fuera). Panama Papers scandal afectó reputación global.

### British Virgin Islands (BVI)

- **Forma legal principal**: BVI Business Company (BVIBC)
- **Setup cost**: $1,500-$3,500 USD
- **Annual maintenance**: $450-$1,200 USD (annual government fee + registered agent)
- **Setup time**: 1-2 semanas
- **Tax regime**: 0% corporate tax en foreign income. No capital gains, no withholding.
- **Regulatory**: BVI Financial Services Commission
- **Banking**: bancos internacionales vía BVI presence
- **VC friendliness**: 🟡 Media — usado por Asian/European deals más que LATAM
- **Fit**: alternativa a Cayman. BVI tiene ventaja de corporate flexibility (BVIBC es muy flexible para diferentes estructuras). Usado más en Asia/Europa.
- **Risks**: similar a Cayman en scrutiny internacional.

---

## Familia 4: EU founder options (2)

### Portugal

- **Forma legal principal**: Sociedade por Quotas (Lda.) o Sociedade Anónima (S.A.)
- **Setup cost**: €500-€2,000 (notário + conservatória + advogado)
- **Annual maintenance**: €1,000-€3,000 (contabilidade obrigatória)
- **Setup time**: 1-3 semanas
- **Tax regime**:
  - Corporate: IRC 21% + derrama municipal variable
  - **IFICI (Incentivo Fiscal para a Investigação Científica e Inovação)**: 20% flat IRS rate for 10 years on qualifying income para new tax residents que trabajaron fuera de Portugal 5+ años
  - **Startup Visa**: residency visa para fundadores non-EU con startup innovadora
- **Regulatory**: Autoridade Tributária, IAPMEI (agencia de innovación)
- **Banking**: Caixa Geral, BPI, Millennium BCP, Activobank
- **VC friendliness**: 🟡 Media — ecosistema VC en Portugal está maduro, especialmente Lisbon hub
- **Fit**: **residency para founder LATAM que busca base EU**. IFICI es muy atractivo fiscal (reemplaza el NHR antiguo). Lisbon = tech hub growing + bilingual ES/EN ambiente.
- **Coverage**: refs + checklist ligero en el plugin (NO guided workflow full). Validar con abogado portugués.

### Estonia

- **Forma legal principal**: Osaühing (OÜ) — equivalent a LLC
- **Setup cost**: €190 state fee + €200-€500 notary + legal ~€500. **Vía e-Residency**: €100-€300 total
- **Annual maintenance**: €300-€1,000 (contabilidad)
- **Setup time**: 1-3 días vía **e-Residency** (literally online)
- **Tax regime**:
  - **0% tax on retained earnings** — Estonia solo grava distributed profits (20% al momento de distribución)
  - Corporate: 20% flat sobre distributed profits
  - No tax on R&D reinvestment
- **Regulatory**: Estonian Tax and Customs Board
- **Banking**: Wise (default para e-Residents), LHV, SEB
- **VC friendliness**: 🟢 Alta — Estonia es ecosystem digital-first, lots of successful Estonian tech (Skype, Bolt, Pipedrive)
- **Fit**: **best para SaaS founders solo que quieren EU jurisdiction sin moverse físicamente**. e-Residency permite managing 100% remote. Bootstrap-friendly por no tax on retained earnings.
- **Coverage**: refs + checklist ligero. Validar con Estonian accountant.
- **Limitation**: no reemplaza residency fiscal del founder — la OÜ paga impuestos en Estonia, pero el founder sigue pagando impuestos en su país de residencia fiscal (donde viva más de 183 días/año).

---

## Matriz comparativa resumen

| Jurisdicción | Setup $ | Annual $ | Setup time | VC friendly | Best for |
|---|---|---|---|---|---|
| **LATAM** | | | | | |
| Costa Rica | $500-1.5k | $400-800 | 2-4 wk | 🟡 | Mercado local CR |
| México | $1.5-4k | $1.5-4k | 3-6 wk | 🟢 | Mercado MX grande |
| Colombia | $500-2k | $1-2.5k | 1-2 wk | 🟢 | Mercado CO + LatAm |
| Chile | $800-2.5k | $1.5-3k | 2-4 wk | 🟢 | Mercado CL + Startup Chile |
| Perú | $600-1.5k | $1-2k | 2-4 wk | 🟡 | Mercado PE |
| Uruguay | $1-3k | $1.5-3.5k | 4-8 wk | 🟢 | HoldCo regional alternative |
| Argentina | $500-2k | $1.5-3.5k | 2-6 wk | 🔴 | OpCo only (never HoldCo) |
| Brasil | $2-5k | $3-8k | 4-12 wk | 🟢 | Mercado BR (justifica complexity) |
| **US** | | | | | |
| Delaware | $89-500 | ~$400 | 1-2 d | ⭐⭐⭐ | Gold standard VC |
| Wyoming | $100-300 | ~$160 | 1-2 d | 🟡 | Cheap alternative + privacy |
| Texas | $300-500 | $0-variable | 1-2 d | 🟡 | No state tax + business climate |
| **Offshore** | | | | | |
| Cayman | $2.5-5k | $1-3k | 2-4 wk | ⭐⭐⭐ | HoldCo for VC-backed LATAM |
| Panamá | $1.2-2.5k | $400-800 | 1-2 wk | 🟡 | HoldCo alternative |
| BVI | $1.5-3.5k | $450-1.2k | 1-2 wk | 🟡 | HoldCo Asian/European deals |
| **EU founder** | | | | | |
| Portugal | €500-2k | €1-3k | 1-3 wk | 🟡 | Founder residency + IFICI |
| Estonia | €100-700 | €300-1k | 1-3 d | 🟢 | Digital founder solo + 0% retained |

## Reglas rápidas de decisión

Ver `skills/structure-decision/SKILL.md` para el decision tree completo. Resumen:

- **Mercado local único + empleados locales** → incorporate local
- **Mercado US/global + no empleados LATAM formales** → Delaware LLC o Texas LLC (Skip-CR pattern)
- **VCs institucionales + Series A+** → Cayman Sandwich (Cayman HoldCo + Delaware LLC + LATAM OpCo)
- **VCs + exit US-focused** → Delaware C-Corp (QSBS elegibilidad)
- **Founder con residencia EU ambiciosa** → Portugal (Startup Visa + IFICI) o Estonia e-Residency
- **Serial founder multi-venture, no VC** → Single LLC multi-brand (con cuidado de liability contagion)
- **Studio operator con fund atado** → Multi-LLC + Holding (Cayman usualmente)

## Fuentes

- [Latitud — Cayman Sandwich](https://latitud.com/blog/cayman-sandwich-corporate-structure-startups)
- [Manzano Law — LATAM corporate structures](https://www.manzano.law/post/corporate-structures-for-latin-american-startups)
- [Carta — Cayman Sandwich rigorous](https://carta.com/learn/startups/private-companies/incorporation/cayman-sandwich/)
- [Cooley — Cayman Sandwich for LATAM](https://www.cooleygo.com/the-cayman-sandwich-a-potential-corporate-structure-solution-for-latam-startups/)
- [ECGI — Cayman Sandwich risks](https://www.ecgi.global/publications/blog/the-cayman-sandwich-risks-for-institutional-and-venture-capital-markets)
- [Govclab — Delaware domicile report](https://govclab.com/resources/) (60% de nuevos managers eligen Delaware)
- [Portugal Startup News — founders guide](https://portugalstartupnews.com/2026/03/18/the-founders-guide-to-portugal-visas-tax-incentives-and-a-maturing-startup-ecosystem/)
- [Touchdown — Portugal Startup Visa](https://www.touchdown.us/blog/portugal-startup-visa)

## Última actualización

2026-04-14 — validación inicial. Revisar anualmente para cambios regulatorios
(especialmente OECD BEPS Pillar 2, cambios IFICI Portugal, Argentina cepo cambiario).
