---
name: accelerator-launchpad
version: 1.0.0
description: >
  Matches a startup's profile (stage, vertical, geography, equity tolerance,
  urgency) against a curated catalog of 12+ external accelerator programs
  and produces ranked recommendations with application checklists.
  Use when the user asks "which accelerator", "accelerator matching",
  "apply to YC", "Techstars vs 500 Startups", "accelerator for LATAM",
  "CIHUBS accelerator network", "RevTech Labs", "Plug and Play",
  "SOSA corporate partners", "/accelerator-launchpad", or needs to decide
  among external acceleration programs. Implements CIHUBS-style meta-broker
  logic for LATAM founders seeking international acceleration.
---

# Accelerator Launchpad (matching a programas de aceleración)

Matcha el perfil de una startup contra 12+ aceleradoras/programas y produce
recomendaciones rankeadas con checklists de aplicación. Inspirado en la lógica de
meta-broker de CIHUBS (que dirige startups ticas hacia el ecosistema global apropiado).

## Regla de idioma

Contenido en **español**. Nombres de aceleradoras y términos técnicos se mantienen en
su forma original. Cuando aplicable, explicar en español primero y luego el nombre.

## Directorio de salida

```
./portfolio/{venture-o-studio-name}/accelerators/
├── match-analysis.md            # Scoring de fit para cada aceleradora evaluada
├── top-3-recommendations.md     # Ranked recommendations con rationale
├── application-checklist-01-[accelerator].md  # Prep checklist por top 3
├── application-checklist-02-[accelerator].md
├── application-checklist-03-[accelerator].md
└── timeline.md                  # Cohortes abiertas y fechas de aplicación
```

## Regla de personalización

**Siempre Opción B** — las recomendaciones deben basarse en los inputs específicos del
usuario, no en defaults genéricos.

---

## Filosofía: CIHUBS como meta-broker

[CIHUBS](https://cihubs.com) (Costa Rica) opera como **broker** que conecta startups
locales con aceleradoras globales (Plug and Play, Singularity, etc.) según fit. No es
una aceleradora en sí — es una capa de matching + introducción.

Este skill replica esa lógica algorítmicamente:

1. **Input**: perfil de la startup
2. **Matching**: scoring contra 12+ programas
3. **Output**: ranked recommendations + prep
4. **Bonus**: identifica si CIHUBS podría facilitar la introducción (si el usuario está en CR)

---

## Catálogo de aceleradoras (12+)

### Tier 1 — Top global (alta competencia)

#### Y Combinator (YC)

- **Website**: ycombinator.com
- **Stage**: Pre-seed / Seed
- **Vertical**: Multi-vertical (fav tech/SaaS/AI)
- **Geography**: Global, con preferencia implícita por US
- **Cohort size**: ~200-300 per batch (2 batches/año)
- **Duration**: 3 meses (intensivo, Mountain View mandatorio)
- **Model**: $500k invested (MFN SAFE + standard SAFE) por 7% equity
- **Application**: YC application form, entrevista vía video
- **Strength**: network más fuerte del mundo VC + post-acceleration funding access
- **Fit**: "ambicious, tech-forward, willing to relocate 3 months to SF"
- **LATAM access**: sí — muchas LATAM unicorns pasaron por YC (Rappi, NotCo, etc.)

#### Techstars

- **Website**: techstars.com
- **Stage**: Seed
- **Vertical**: Multi-vertical con **programas especializados** (FinTech, Sports, Energy, etc.)
- **Geography**: Global — 50+ programs en diferentes ciudades
- **Cohort size**: ~10 per program
- **Duration**: 3 meses
- **Model**: $120k ($20k for 6% + $100k convertible)
- **Strength**: corporate partnerships por program (ej. Techstars Barclays = FinTech focus)
- **Fit**: startups con corporate partner relevante en la industria objetivo
- **LATAM access**: hay programs en Miami, NYC — accesibles para LATAM

#### 500 Startups (ahora **500 Global**)

- **Website**: 500.co
- **Stage**: Seed
- **Vertical**: Multi-vertical con geography-specific flagships
- **Geography**: Global — LATAM fund activo (500 LatAm)
- **Cohort size**: ~20-30 per batch
- **Duration**: 4 meses
- **Model**: $150k for 6% equity (LATAM program)
- **Strength**: LATAM-specific program con mentors regionales + US expansion support
- **Fit**: LATAM startup con ambición US
- **LATAM access**: ⭐ primary target — historically strong in LATAM

### Tier 2 — Vertical / Corporate partnership accelerators

#### RevTech Labs (Charlotte, NC)

- **Website**: revtechlabs.co
- **Stage**: Post-revenue, post-growth
- **Vertical**: **Fintech + Insurtech EXCLUSIVAMENTE**
- **Geography**: Global (must show intent to expand to US)
- **Cohort size**: 13-15 per class (Class 25 en 2026)
- **Duration**: 12 semanas (Charlotte + roadshow mid-program)
- **Model**: hasta $120k investment
- **Strength**: diversity focus (53%+ female/founders of color) + financial sector mentor network
- **Fit**: fintech/insurtech startups con MVP + revenue, looking to expand to US
- **LATAM access**: sí — accept global, requires "intent to expand into US market"

#### Plug and Play

- **Website**: plugandplaytechcenter.com
- **Stage**: Seed - Series B
- **Vertical**: **20+ vertical programs** (Smart Cities, Insurance, Food, Mobility, etc.)
- **Geography**: 50+ offices globally (incluye Silicon Valley, LATAM offices en México, Brasil)
- **Cohort size**: varies per program
- **Duration**: 3 meses por program
- **Model**: **equity-free** (rare) — matching con corporate partners para pilots/partnerships
- **Strength**: corporate matching (500+ corporate partners pagan por ver deals)
- **Fit**: startups que necesitan corporate customers más que capital
- **LATAM access**: ⭐ oficinas en MX + BR

#### Portal Innovations (Chicago)

- **Website**: portalinnovations.com
- **Stage**: Pre-seed a Series A
- **Vertical**: **Biotech + Medtech EXCLUSIVAMENTE**
- **Geography**: Chicago, Houston, Boston, Atlanta, Providence, New Brunswick
- **Cohort size**: portfolio model (membership vs. cohort)
- **Duration**: indefinido (membership-based)
- **Model**: Spark (equity investment) + LINK (in-kind investment, lab access = equity)
- **Strength**: **lab space físico** + life sciences network
- **Fit**: biotech/medtech con necesidades wet-lab (no solo software)
- **LATAM access**: limitado (requiere presencia física en cities cubiertas)

#### SOSA Open Innovation

- **Website**: sosa.co
- **Stage**: Post-traction (venture-backed o revenue-ready)
- **Vertical**: multi-sector (financial, insurance, heavy industry, energy)
- **Geography**: NYC + global (Israel HQ)
- **Programs**:
  - **NY Accelerator**: immersive 2-day a 6-mes programs, corporate matching con BASF/Schneider/HP/Tokio Marine/Zurich/Siemens
  - **Go-to-Market (GTM)**: 5-month US sales sprint (no equity model público)
- **Cohort size**: customized (40+ programs delivered)
- **Strength**: corporate matching + GTM execution (actúa como "US general manager
  at fraction of cost")
- **Fit**: startups con revenue validado buscando entrada a US corporate market
- **LATAM access**: sí — 10+ nationalities historically, incluye LATAM
- **Alumni outcome**: 380 companies, $150M raised by alumni

### Tier 3 — Programas LATAM-específicos

#### Startup Chile

- **Website**: startupchile.org
- **Stage**: Pre-seed a seed
- **Vertical**: multi-vertical
- **Geography**: Chile (program requires moving to Santiago)
- **Cohort size**: ~100 per batch (múltiples batches/año)
- **Duration**: 6 meses
- **Model**: **$30k-$80k equity-free grant** (government-backed)
- **Strength**: no-equity capital + LATAM base for regional expansion + government backing
- **Fit**: LATAM startups early-stage (especialmente de países más pequeños) que quieren base regional
- **LATAM access**: ⭐ diseñado for LATAM

#### NUMA

- **Website**: numa.co
- **Stage**: Seed
- **Vertical**: multi-vertical con FinTech focus en ciertos programs
- **Geography**: París, Madrid, Bangalore, Ciudad de México, Buenos Aires, etc.
- **Cohort size**: ~10 per program
- **Duration**: 3-6 meses
- **Model**: varies (equity + mentorship)
- **Strength**: europea-LATAM bridge, French-speaking markets
- **Fit**: startups con ambición europea + latina
- **LATAM access**: ⭐ hay programs en MX + AR

#### Parallel 18 (Puerto Rico)

- **Website**: parallel18.com
- **Stage**: Seed
- **Vertical**: multi-vertical
- **Geography**: Puerto Rico (program base)
- **Cohort size**: ~20 per batch
- **Duration**: 5 meses
- **Model**: $40k equity-free grant + mentorship
- **Strength**: Puerto Rico tax benefits + US Spanish-speaking bridge
- **Fit**: LATAM startups buscando entry a US con ventaja fiscal + familiar cultural
- **LATAM access**: ⭐ hispanohablante, US jurisdiction

#### Seedstars

- **Website**: seedstars.com
- **Stage**: Seed
- **Vertical**: multi-vertical, focus en emerging markets
- **Geography**: 80+ países (África, Asia, LATAM)
- **Cohort size**: varies
- **Duration**: varies
- **Model**: varies (equity + competition winnings)
- **Strength**: emerging markets focus + global competition network
- **Fit**: startups from underserved markets with regional ambition
- **LATAM access**: ⭐ varios países LATAM cubiertos

### Tier 4 — Specialty / MassChallenge

#### MassChallenge

- **Website**: masschallenge.org
- **Stage**: any (early-stage focus)
- **Vertical**: multi-vertical
- **Geography**: Boston, Rhode Island, Israel, Mexico City, Switzerland, UK, Texas
- **Cohort size**: ~100-250 per program
- **Duration**: 4 meses
- **Model**: **equity-free** (rare) — prizes + mentorship
- **Strength**: no dilución + broad access + diverse mentor pool
- **Fit**: early-stage broad spectrum; competitive but no equity cost to enter
- **LATAM access**: ⭐ MX program (MassChallenge Mexico)

### Meta-broker

#### CIHUBS (Costa Rica)

- **Website**: cihubs.com
- **Role**: NOT an accelerator — broker/facilitator
- **Service**: "soft landing" de innovación LATAM hacia ecosistema global
- **Partners**: Plug and Play, Singularity, Cambridge, SAAB, etc.
- **Fit**: startups ticas que no saben a cuál accelerator aplicar — CIHUBS recomienda
  basado en sector/etapa

---

## Flujo del skill

### Paso 1 — Perfil de la startup

**AL-1**: "¿Stage actual de la startup?
- Idea / pre-MVP
- MVP lanzado sin revenue
- Pre-seed (MVP + early traction)
- Seed (producto validándose, some revenue)
- Post-seed / pre-Series A (revenue sostenido)
- Series A+ (growth stage)"

**AL-2**: "¿Vertical principal? (elegir UNO — el más importante)
- SaaS B2B
- SaaS B2C
- Fintech / Insurtech
- Healthtech / Medtech / Biotech
- AI / ML tools
- EdTech
- AgriTech / FoodTech
- CleanTech / ClimateTech
- Developer tools
- Marketplace / e-commerce
- Hardware / IoT
- Otro (especificar)"

**AL-3**: "¿Geografía actual y objetivo?
- Currently based in: [país + ciudad]
- Primary market today: [market]
- Expansion target in 12 months: [target]"

**AL-4**: "¿Qué necesitás más del accelerator?
- [ ] Capital (cheque grande)
- [ ] Mentorship (acceso a operadores senior)
- [ ] Corporate partnerships (pilots/clients)
- [ ] US market entry / GTM help
- [ ] Network de inversores follow-on
- [ ] Lab space / infrastructure física
- [ ] Tax benefits / govt. backing
- [ ] Brand credibility (YC stamp)
- [ ] All of the above"

**AL-5**: "¿Equity tolerance — cuánta equity estás dispuesto/a a dar?
- 0% (solo equity-free programs)
- 0-3% (mínima dilución)
- 3-7% (standard accelerator)
- 7-10% (premium program if returns are strong)
- Doesn't matter if returns are strong"

**AL-6**: "¿Urgencia?
- Urgente (necesito aplicar a lo que esté abierto ahora, no tengo 6 meses)
- Media (puedo esperar 2-3 meses por la cohort correcta)
- Planificado (puedo elegir program + timing óptimo)"

### Paso 2 — Scoring contra el catálogo

Para cada una de las 12+ aceleradoras, calcular un **fit score (0-100)** basado en:

| Dimensión | Peso |
|---|---|
| Stage match (¿la aceleradora targetea tu stage actual?) | 25% |
| Vertical match (¿tu vertical está en scope o excluded?) | 25% |
| Geography fit (¿accesible desde tu ubicación?) | 15% |
| Equity vs. tolerance (¿dilución aceptable para el usuario?) | 10% |
| Need fit (¿lo que ofrece el program matchea lo que necesitás?) | 15% |
| Timing (¿cohort abierto alineado con tu urgencia?) | 10% |

**Fit score bands**:
- 🟢 **80-100**: excelente fit — aplicar
- 🟡 **60-79**: buen fit — considerar
- 🟠 **40-59**: marginal — solo si tenés ventaja única
- 🔴 **0-39**: skip — no vale el esfuerzo de aplicar

### Paso 3 — Generar top 3 recommendations

Presentar las 3 aceleradoras con el score más alto con rationale detallado por cada una:

```markdown
## Top 3 Accelerator Matches

### 1. [Name] — Score: 🟢 87/100

**Why this fit**:
- [Razón 1 con data point]
- [Razón 2 con data point]

**Application deadline**: [fecha cohort próxima]

**Equity cost**: [monto]

**Top alumni in your space**: [ejemplos si existen]

**Red flags / trade-offs**:
- [Consideración honest]

### 2. [Name] — Score: 🟢 81/100

[...]

### 3. [Name] — Score: 🟡 74/100

[...]
```

### Paso 4 — Application checklist para top 3

Para cada top 3, generar un **application checklist** basado en artefactos que ya existen
en el proyecto del usuario (leer `./business/` si business-model-toolkit se usó):

```markdown
## Application Checklist — [Accelerator Name]

### Deadline: [fecha]

### Required artifacts

- [ ] **Pitch deck** — [¿existe en `./business/03-ejecucion-aceleracion/10-pitch-deck.md`?]
- [ ] **Financial model** — [¿existe en `./business/03-ejecucion-aceleracion/03-modelo-financiero.md`?]
- [ ] **Team bios** — [¿existe `./business/01-problema-hipotesis/01-perfil-fundador.md`?]
- [ ] **Traction metrics** — [gap — necesita armarse]
- [ ] **Demo video** — [gap]
- [ ] **Legal incorporation proof** — [¿resuelto via `structure-decision` skill?]
- [ ] **Customer references** — [lista]

### Gaps to close before applying

1. [Gap específico]: [cómo resolverlo]
2. [Gap específico]: [cómo resolverlo]

### Tailoring del pitch para este accelerator

[Aquí el skill genera recommendations específicas del formato/énfasis que prefiere
ese accelerator — ej. YC prefiere "metrics first", RevTech Labs prefiere "micro-goals"]

### Alumni network intro leverage

[Si el usuario conoce alumni del program, listar y sugerir outreach]
```

### Paso 5 — Timeline

Generar `timeline.md` con fechas de cohorts abiertas para las top 3 aceleradoras + plan
de aplicación.

---

## Reglas especiales

### Regla 1 — Exclusiones verticales hard

Hay aceleradoras que **solo** aceptan verticales específicos. Si el vertical de la startup
no matchea, score = 0 para esa aceleradora:

- Portal Innovations → solo biotech/medtech
- RevTech Labs → solo fintech/insurtech
- Techstars FinTech (programs específicos) → solo fintech

### Regla 2 — Exclusiones geográficas hard

- Startup Chile → requiere mudarse a Santiago 6 meses
- Y Combinator → requiere mudarse a SF 3 meses
- Portal Innovations → requiere presencia física en cities cubiertas

Si el usuario NO puede/quiere mudarse, estos scores se reducen drásticamente.

### Regla 3 — Flag CIHUBS como facilitator (si CR)

Si el usuario responde `CR` en AL-3 (geography), agregar nota:

> 💡 **Tip CIHUBS**: Si estás en Costa Rica, CIHUBS (cihubs.com) puede facilitar
> introducciones a Plug and Play y otras aceleradoras del partner network. Vale
> contactarlos antes de aplicar cold a las top 3.

### Regla 4 — Flag alumnos conocidos

Si el usuario conoce alumnos de alguno de los top 3 (preguntarlo al final), recomendar
**foot-in-the-door via alumni intro** (rate de response 4x mayor que cold application).

---

## Principios clave

- **Fit > brand**: un program bien matcheado con score 80 > YC con score 55
- **Vertical fit es binario**: aplicar a Portal Innovations siendo SaaS es desperdicio
- **Corporate matching > capital** para startups post-revenue: SOSA/Plug and Play > YC
- **Equity-free siempre vale evaluar primero**: MassChallenge, Plug and Play, Startup Chile
- **Alumnos matter**: intro warm > cold application

## Anti-patterns

- Aplicar a YC "porque sí" sin evaluar fit (low conversion)
- Aplicar a 10+ programs simultáneamente (dispersión)
- Ignorar aceleradoras LATAM-específicas por preferencia US (muchas veces mejor ROI)
- No validar que el vertical esté en scope antes de aplicar

## Integración con otras skills

- **`business-model-toolkit`** Fase 18 (pitch deck) — se usa el pitch existente para
  tailoring por accelerator
- **`business-model-toolkit`** Fase 10 (unit economics) — los números vienen de ahí
  para métricas de tracción que la aceleradora va a pedir
- **`structure-decision`** — la estructura legal afecta qué aceleradoras aceptan (ej.
  YC prefiere Delaware C-Corp; Cayman Sandwich trabaja para la mayoría)
- **`studio-thesis`** (si el usuario es studio) — diferente uso: el studio NO aplica a
  aceleradoras para sí mismo, sino para las ventures que produce

## Recursos adicionales

- **CIHUBS**: [cihubs.com](https://cihubs.com)
- **RevTech Labs**: [revtechlabs.co](https://www.revtechlabs.co/accelerator-program-founder)
- **Plug and Play**: [plugandplaytechcenter.com](https://www.plugandplaytechcenter.com/innovation-services/startups/accelerator-programs)
- **Portal Innovations**: [portalinnovations.com](https://www.portalinnovations.com/portfolio/)
- **SOSA NY Accelerator**: [sosa.co/openinnovation/newyork-accelerator](https://www.sosa.co/openinnovation/newyork-accelerator)
- **SOSA GTM**: [sosa.co/openinnovation/go-to-market](https://www.sosa.co/openinnovation/go-to-market)
- **Y Combinator**: [ycombinator.com](https://ycombinator.com)
- **Techstars**: [techstars.com](https://techstars.com)
- **500 Global**: [500.co](https://500.co)
- **Startup Chile**: [startupchile.org](https://startupchile.org)
- **Parallel 18**: [parallel18.com](https://parallel18.com)
- **MassChallenge**: [masschallenge.org](https://masschallenge.org)
- **NUMA**: [numa.co](https://numa.co)
- **Seedstars**: [seedstars.com](https://seedstars.com)
