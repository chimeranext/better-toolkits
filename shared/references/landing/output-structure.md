# Output Structure — Business Model Files

## Directory Layout

All deliverables go in `./business/`, organized in three numbered spaces.
Each space represents a stage of the startup lifecycle with its own validation gate.

```
./business/
│
├── 01-problema-hipotesis/               # SPACE 1: Problem-Hypothesis
│   ├── 01-founder-profile.md            # Founder's Why, Life Story, Uniquely Qualified
│   ├── 02a-lluvia-supuestos.md          # Assumption Brainstorm (LCD Alvarez cap. 2): 12 prompts + Risk/Unknown matrix
│   ├── 02-entrevista-problema.md        # Problem Interview (7 sections, personalized) — the structured GUIDE
│   ├── entrevistas/                     # Per-interview artifacts (via customer-interview-system skill)
│   │   ├── 00-outreach-templates.md     # Personalized outreach: email, LinkedIn, scheduling, follow-up
│   │   ├── 00-patrones.md               # Cross-interview pattern detection (updated at each milestone)
│   │   └── entrevista-NN-[nombre]/      # One folder per interview
│   │       ├── notes.md                 # Raw notes (5 core Alvarez questions + observations)
│   │       └── summary.md               # V/I/AI summary + speech pattern analysis
│   ├── 03-perfil-expectativas-cliente.md # Customer Profile: Demografia + Traits Continuum + Ikigai + JTBD
│   ├── 04-fuerzas-del-cliente.md        # 4 Customer Forces (Push, Pull, Anxiety, Inertia)
│   └── 05-investigacion-mercado.md      # Market Research, Failed Solutions, Insights
│
├── 02-solucion-validacion/              # SPACE 2: Solution-Validation
│   ├── 00-modelo-de-negocio.md          # BMC Index with links to all 14 modules
│   ├── 01-problematica.md               # Problemática
│   ├── 02-solucion-ideal.md             # Solución Ideal
│   ├── 03-segmentos-de-mercado.md       # Segmentos de Mercado
│   ├── 04-propuesta-unica-de-valor.md   # Propuesta Única de Valor
│   ├── 05-ventaja-injusta-o-competitiva.md  # Ventaja Injusta o Competitiva
│   ├── 06-canales-de-distribucion.md    # Canales de Distribución
│   ├── 07-objetivos-y-resultados-clave.md   # Objetivos y Resultados Clave
│   ├── 08-fuentes-de-ingresos.md        # Fuentes de Ingresos
│   ├── 09-recursos-clave.md             # Recursos Clave
│   ├── 10-actividades-clave.md          # Actividades Clave
│   ├── 11-cadena-de-valor.md            # Cadena de Valor
│   ├── 12-estructura-de-costos.md       # Estructura de Costos
│   ├── 13-metricas-de-impacto.md        # Métricas de Impacto
│   ├── 14-relaciones-con-los-clientes.md    # Relaciones con los Clientes
│   ├── 15-entrevista-solucion.md        # Solution Interview + Commitment Ladder
│   ├── 15a-scorecard-validacion-hipotesis.md # Hypothesis Validation Scorecard (LCD Alvarez cap. 6): 4 criterios
│   ├── 16-experimento-mvp.md            # MVP Experiment: Hypothesis → Test → Learn + MVP Type Selector (6 tipos, LCD cap. 7)
│   └── entrevistas/                     # Solution interviews (mismo formato que Space 1)
│       ├── 00-outreach-templates.md     # Outreach templates para solution interviews
│       ├── 00-patrones.md               # Cross-interview pattern detection
│       └── entrevista-NN-[nombre]/      # Per-interview notes.md + summary.md V/I/AI
│
├── 03-ejecucion-aceleracion/            # SPACE 3: Execution-Acceleration
│   ├── 01-modelo-de-ingresos.md         # Revenue Models (3→2→1), Steps to Revenue
│   ├── 02-unit-economics.md             # CAC, LTV, Conversion Rate, Margins
│   ├── 03-modelo-financiero.md          # Beyond Budgeting 3-process model (Target / Forecast / Resource Allocation) + Slidebean 14-sheet template integration (Lean Enterprise cap. 13)
│   ├── 04-branding.md                   # Naming, Domain, Social Media, Design Spec
│   ├── 05-fundacion-legal.md            # Incorporation, Cap Table, IP, Agreements
│   ├── 06-go-to-market.md               # Channels, Marketing, Email Capture, Growth Goals
│   ├── 07-product-roadmap.md            # Roadmap, Releases, Project Plan, Dev Tools
│   ├── 08-equipo-y-contratacion.md      # Team, Hiring Plan, Outsourcing, Ethics Code
│   ├── 09-advisory-board.md             # Advisors, FAST Agreement, Board Setup
│   ├── 10-pitch-deck.md                 # MARP Pitch Deck (investor-ready, 15 slides)
│   └── 11-pitch-script.md              # MARP Teleprompter Script (video pitch, 3 min, 7 slides)
│
├── 04-landing-pages/                    # SPACE 4: Landing Pages (CRO)
│   ├── [audiencia]-landing-spec.md      # Full landing page spec (12 sections)
│   ├── [audiencia]-landing-adr.md       # Architecture Decision Record
│   └── [audiencia]-landing-copy.md      # Compiled copy for all sections
│
└── README.md                            # Business model summary with links to all spaces

./README.md                              # Project README (at root)
```

## Validation Gates Between Spaces

### Gate 1: Problem → Solution
Before advancing to Space 2, verify:
- Customer Forces balance is **positive** (Push+Pull > Anxiety+Inertia)
- At least **5 problem interviews** completed with consistent patterns
- Market research confirms **viable TAM** and **failed/weak alternatives**

### Gate 2: Solution → Execution
Before advancing to Space 3, verify:
- Solution Interview shows **financial-level commitment** (not just verbal)
- MVP experiment hypothesis **confirmed** (or pivot completed)
- BMC modules are **internally consistent** (revenue model matches cost structure)

### Gate 3: Execution Readiness
Before considering the startup a scale-up candidate:
- Unit economics are **viable** (LTV > 3× CAC)
- Financial model shows **path to profitability** within 18 months
- Legal foundation is **established** (incorporated, IP protected)
- Team has **key roles filled** or outsourced

### Gate 4: Landing Page Readiness
Before deploying a landing page:
- All 12 sections have **personalized copy** (no generic placeholders)
- CTAs are **consistent** across the page (same text, minimum 3 appearances)
- Emotional sequence is **coherent** (each section pushes toward the next)
- Urgency mechanism is **real** (not artificial/manipulative)
- Brand colors are **defined** (minimum: CTA, hero background, urgency, accent)
- FAQ resolves **top 3 objections** + rephrases **3 benefits**
- OG tags configured for social sharing
- Tracking (GA4 + pixels) configured

---

## Space 1: Problem-Hypothesis — File Details

### 01-founder-profile.md

```markdown
# Perfil del Fundador

## Mi Por Qué (Founder's Why)
[Por qué estoy emprendiendo — visión a 5 años si continúo vs si abandono]

## Mi Historia (Life Story)
1. Infancia
2. Formación académica
3. Carrera profesional
4. Emprendimiento
5. El futuro

## Por Qué Estoy Únicamente Calificado
[Educación, experiencia, pasión, creencias — por qué este problema por 10 años]

## Mis Metas en este Programa
- Meta 1: ...
- Meta 2: ...
- Meta 3: ...

## Disponibilidad de Tiempo
[Horas por semana, full-time o parcial, plan de asignación]
```

### 05-investigacion-mercado.md

```markdown
# Investigación de Mercado

## Análisis de Mercado (Bottom-Up)
| Nivel | Cálculo | Valor |
|-------|---------|-------|
| TAM | [Mercado total] | $X |
| SAM | [Mercado alcanzable] | $X |
| SOM | [Mercado obtenible] | $X |

## Soluciones Existentes
| # | Solución | Qué resuelve | Puntos débiles |
|---|----------|-------------|----------------|
| 1 | ... | ... | ... |

## Soluciones Fallidas (Post-Mortem)
| # | Startup fallida | Qué intentó | Por qué falló | Qué haríamos diferente |
|---|----------------|-------------|---------------|----------------------|
| 1 | ... | ... | ... | ... |

## Insights Clave
- 10 keywords para monitorear
- 10 recursos relevantes (competidores, blogs, investigadores)

## Lead Customers
| # | Nombre | Necesidad más fuerte | Disposición a pagar |
|---|--------|---------------------|-------------------|
| 1 | ... | ... | ... |
```

---

## Space 2: Solution-Validation — File Details

### Index: 00-modelo-de-negocio.md

```markdown
# Modelo de Negocio

🏗️ [Problemática](01-problematica.md) · 🏦 [Fuentes de Ingresos](08-fuentes-de-ingresos.md)
🚑 [Solución Ideal](02-solucion-ideal.md) · 🏰 [Recursos Clave](09-recursos-clave.md)
⭐ [Segmentos de Mercado](03-segmentos-de-mercado.md) · 🔴 [Actividades Clave](10-actividades-clave.md)
🏯 [Propuesta Única de Valor](04-propuesta-unica-de-valor.md) · 🐕 [Cadena de Valor](11-cadena-de-valor.md)
👫 [Ventaja Injusta o Competitiva](05-ventaja-injusta-o-competitiva.md) · 🏣 [Estructura de Costos](12-estructura-de-costos.md)
🚗 [Canales de Distribución](06-canales-de-distribucion.md) · 🐒 [Métricas de Impacto](13-metricas-de-impacto.md)
🔮 [Objetivos y Resultados Clave](07-objetivos-y-resultados-clave.md) · 🎺 [Relaciones con los Clientes](14-relaciones-con-los-clientes.md)

---

## Validación

- [Entrevista de la Solución](15-entrevista-solucion.md)
- [Scorecard Validación de Hipótesis](15a-scorecard-validacion-hipotesis.md)
- [Experimento MVP](16-experimento-mvp.md)
```

BMC module content structure remains the same as previously defined (each `##-<module>.md`
with guiding question, relevant sections, tables, and personalized content).

---

## Space 3: Execution-Acceleration — File Details

### 01-modelo-de-ingresos.md

```markdown
# Modelo de Ingresos

## Análisis de Modelos Competitivos
| # | Competidor | Revenue Model | Rating (1-5) | Cómo mejoraríamos |
|---|-----------|--------------|-------------|-------------------|
| 1 | ... | ... | ... | ... |

## Tres Modelos Evaluados
### Modelo A: [Nombre]
- Pros: ...
- Contras: ...
- Precio punto 1: $X (market rate)
- Precio punto 2: $Y ($1M en 18 meses)
- Clientes necesarios en 18 meses: N

### Modelo B: [Nombre]
...

### Modelo C: [Nombre]
...

## Modelo Seleccionado: [Nombre]
[Justificación basada en revenue interviews y Steps to Revenue]

## Steps to Revenue
| # | Paso | Tiempo | Qué debe ocurrir |
|---|------|--------|-----------------|
| 1 | ... | X min | ... |
| 2 | ... | X días | ... |

## Revenue Interviews (Feedback de clientes sobre pricing)
| # | Cliente | Modelo preferido | Precio aceptable | LTV estimado |
|---|---------|-----------------|-----------------|-------------|
| 1 | ... | ... | ... | ... |
```

### 02-unit-economics.md

```markdown
# Unit Economics

## Métricas Clave
| Métrica | Valor actual | Target |
|---------|-------------|--------|
| CAC (Costo de Adquisición) | $X | $X |
| LTV (Lifetime Value) | $X | $X |
| Ratio LTV:CAC | X:1 | >3:1 |
| Tasa de Conversión | X% | X% |
| Churn Rate | X% | <X% |
| Margen Bruto | X% | >X% |
| Payback Period | X meses | <X meses |

## Análisis de Sensibilidad
| Escenario | CAC | LTV | Ratio | Viable? |
|-----------|-----|-----|-------|---------|
| Base | $X | $X | X:1 | Sí/No |
| Costos ×1.5 | $X | $X | X:1 | Sí/No |
| Costos ×2.0 | $X | $X | X:1 | Sí/No |

## Customer Acquisition Channels
| Canal | Efectividad | Costo | Conversion Rate |
|-------|-------------|-------|----------------|
| ... | ... | ... | ... |
```

### 03-modelo-financiero.md

```markdown
# Modelo Financiero (18 meses)

## Revenue Forecast
| Mes | Clientes | MRR | ARR |
|-----|----------|-----|-----|
| 1 | ... | $X | $X |
...

## Estructura de Costos
| Categoría | Fijo/Variable | Mensual |
|-----------|-------------|---------|
| ... | ... | $X |

## Launch Survival
- Gastos personales mensuales: $X
- Ahorros disponibles: $X
- Meses de runway personal: X
- Fuentes de ingreso alternativas: ...

## Punto de Equilibrio: Mes X
## Founding Round (si aplica): $X de [fuente]
```

### 04-branding.md

```markdown
# Branding

## Naming Process
### 50 Palabras Candidatas: [lista]
### 5 Nombres Candidatos: [lista con disponibilidad de dominio]
### 3 Finalistas (post-feedback): [lista]
### Nombre Final: [nombre]
- Test con 10 personas: [resultados de recall y reacción]
- Name Failure Analysis: [por qué podría fallar]

## Dominios Registrados: [lista]
## Redes Sociales: [lista de cuentas]
## Design Specification: [logo, tarjetas, landing page, pitch deck template]
```

### 05-fundacion-legal.md

```markdown
# Fundación Legal

## Entidad Corporativa
- Razón social: ...
- Tipo: [SRL, SA, Corp, LLC]
- Fecha de constitución: ...
- Jurisdicción: ...

## Cap Table
| Persona | Rol | % Equity | Tipo |
|---------|-----|----------|------|
| ... | Founder | X% | Common |

## Propiedad Intelectual
- Copyright: [lista de activos marcados]
- Patentes: [análisis de patentabilidad]
- NDA/IP Assignment: [estado]

## Acuerdos de Formación: [lista con estado]
## Legal Templates: [NDA, Employment, Freelancer, Advisor FAST, Loan]
## Calendario Legal: [filing deadlines, renovaciones]
```

### 06-go-to-market.md

```markdown
# Go-to-Market

## Marketing Messaging
| # | Mensaje (≤140 chars) | Link | Clicks | Engagement |
|---|---------------------|------|--------|-----------|
| 1 | ... | ... | ... | ... |

## Customer Acquisition Channels
| Canal | Tipo | Costo | Efectividad | Prioridad |
|-------|------|-------|-------------|-----------|
| ... | ... | ... | ... | ... |

## Email Capture Flow
1. Welcome email
2. Follow-up email
3. Notificaciones/reminders

## Growth Goals
| Semana | Meta (top-of-funnel) | Meta (bottom-of-funnel/revenue) |
|--------|---------------------|-------------------------------|
| 1 | ... | ... |

## Growth Plan
- Herramientas de tracking: ...
- Accountability partner: ...
- Cadencia de revisión: [semanal/mensual]
```

### 07-product-roadmap.md

```markdown
# Product Roadmap

## Solution Goals
1. [Meta medible para el próximo año]
2. [Meta medible]
3. [Meta medible]

## Feature Map
| Grupo | Feature | Prioridad (1-3) | Release |
|-------|---------|----------------|---------|
| ... | ... | 1=Esencial | Beta |

## Releases (cada ~2 semanas)
| Release | Features | Hipótesis que valida | KPIs |
|---------|----------|---------------------|------|
| Beta | ... | ... | ... |
| v1.0 | ... | ... | ... |

## Project Team
| Rol | Persona | Skills | Compensación |
|-----|---------|--------|-------------|
| ... | ... | ... | ... |

## Development Tools
| Categoría | Herramienta | Costo |
|-----------|------------|-------|
| ... | ... | ... |
```

### 08-equipo-y-contratacion.md

```markdown
# Equipo y Contratación

## Hiring Plan (18 meses)
| # | Rol | Cuándo | Salario/Equity | In-house/Outsource |
|---|-----|--------|---------------|-------------------|
| 1 | ... | Mes X | ... | ... |

## Outsourcing
| Rol | Proveedor | Proceso de gestión | Costo |
|-----|----------|-------------------|-------|
| ... | ... | ... | ... |

## Código de Ética (IMPACT o custom)
- [Valor 1]: [por qué importa]
- [Valor 2]: [por qué importa]

## Hiring Process: [pasos de onboarding]
## Test Projects: [proyectos de prueba por rol]
## Time Allocation (Founder's Schedule): [bloques semanales]
## Leadership Style: [cómo liderar, resolver disputas]
```

### 09-advisory-board.md

```markdown
# Advisory Board

## Advisor Target List
| Categoría | Nombre | Título | Empresa | Conector | Estado |
|-----------|--------|--------|---------|----------|--------|
| Startup | ... | ... | ... | ... | ... |
| Industry | ... | ... | ... | ... | ... |
| Tech/Mktg | ... | ... | ... | ... | ... |

## Advisor Interviews
| Advisor | Chemistry (1-5) | Ability (1-5) | Test Project | Resultado |
|---------|----------------|--------------|-------------|-----------|
| ... | ... | ... | ... | ... |

## Selected Advisors + FAST Agreement
| Advisor | Categoría | Performance Level | Call Schedule |
|---------|-----------|------------------|-------------|
| ... | ... | ... | ... |

## First Advisory Board Meeting: [fecha]
```

### 10-pitch-deck.md

MARP pitch deck — 15 slides aligned with the 10 Commandments of Great Pitch Decks,
incorporating all context from Spaces 1-3.

### 11-pitch-script.md

MARP teleprompter script for recording a 3-minute video pitch. Black background,
large white text, designed for full-screen reading. The presenter advances slides
with mouse or remote control.

Rules:
- Maximum 10 lines of text per slide (excluding blank lines and h1 header)
- Maximum 500 words total (~3 minutes at natural speaking pace)
- 7 slides: hook, problem, solution, differentiator, audience, impact, closing
- No camera instructions, no timing annotations
- Conversational tone, concrete numbers, no technical jargon

---

## Business README: ./business/README.md

```markdown
# [Nombre del Proyecto] — Modelo de Negocio

## Espacios

### 📋 [01 — Problema e Hipótesis](01-problema-hipotesis/)
Validación del problema, perfil de cliente, fuerzas del mercado.

### 🔬 [02 — Solución y Validación](02-solucion-validacion/)
Business Model Canvas (14 módulos), entrevista de solución, experimento MVP.

### 🚀 [03 — Ejecución y Aceleración](03-ejecucion-aceleracion/)
Revenue, unit economics, financiero, branding, legal, go-to-market, producto, equipo, advisors, pitch deck.

## Estado
| Espacio | Deliverables | Completados | Gate |
|---------|-------------|-------------|------|
| 01 Problema | 5 | X/5 | [Pendiente/Aprobado] |
| 02 Solución | 16 | X/16 | [Pendiente/Aprobado] |
| 03 Ejecución | 10 | X/10 | [Pendiente/Aprobado] |
```

## File Naming Convention

- All lowercase
- Hyphens for spaces
- Two-digit prefix for ordering (01-16)
- No accents in filenames (use `distribucion` not `distribución`)
- `.md` extension always
- Folders use same two-digit prefix convention
