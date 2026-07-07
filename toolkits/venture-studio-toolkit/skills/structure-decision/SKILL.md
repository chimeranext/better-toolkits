---
name: structure-decision
version: 1.0.0
description: >
  Guides the founder/studio operator through a decision tree for choosing the
  corporate structure of their venture(s): Single-LLC vs Multi-LLC vs
  Cayman Sandwich vs Delaware Tostada vs Skip-CR pattern vs Delaware C-Corp.
  Use when the user asks "structure-decision", "decidir estructura legal",
  "¿single LLC o multi LLC?", "Cayman Sandwich", "Delaware Tostada",
  "Skip-CR pattern", "holding vs multi-LLC", "estructura corporativa",
  "LATAM incorporation", "/structure-decision", or needs to decide the legal
  structure for a new venture or for a portfolio of ventures. Produces
  a structured recommendation with rationale, cost estimates, risks,
  and an evolution roadmap (migration triggers).
---

# Decisión de Estructura Corporativa

Guía al fundador / operador de studio a través de un árbol de decisión para elegir la
estructura legal correcta para sus ventures. Cubre los 7 patrones principales usados por
startups LATAM con ambiciones globales.

## Regla de idioma

Contenido en **español**. Términos legales se presentan en formato **"español (English)"**
la primera vez que aparecen.

## Directorio de salida

```
./portfolio/{founder-o-studio-name}/
├── structure-decision.md        # Recomendación + rationale + evolution roadmap
└── jurisdiction-matrix.md       # Opcional: matriz comparativa si el usuario pide
```

## Regla de personalización

**Siempre Opción B** — reemplazar TODOS los marcadores genéricos con contexto del proyecto.
Nunca usar ejemplos genéricos.

## Modos de ejecución

### Modo normal (por defecto)

Escribe la recomendación en `./portfolio/{name}/structure-decision.md`.

### Modo simulación (what-if)

Se activa con "simulación", "what-if", "--what-if", "sin guardar". Presenta la recomendación
completa en la conversación sin escribir archivos.

---

## Aviso legal crítico

> **Esta skill NO es asesoría legal**. Es una herramienta de decisión para entender los
> trade-offs de cada estructura y llegar preparado a la conversación con un abogado
> especializado. Cada jurisdicción tiene particularidades (tratados fiscales, regulaciones
> sectoriales, case law) que requieren criterio profesional.
>
> **Recomendación**: antes de incorporar, validar la decisión con un abogado corporativo
> con experiencia en LATAM startups + US incorporation. Referencias: Latitud, Manzano Law,
> Cooley, WilmerHale.

---

## Los 7 patrones cubiertos

| # | Patrón | Capas | Costo | Cuándo | Tax |
|---|---|---|---|---|---|
| 1 | **Skip-CR Pattern** (caso Acme Studio) | DE/WY/TX LLC + freelancers LATAM | $ | Bootstrapped, no vende al mercado LATAM local, no empleados formales locales | Pass-through |
| 2 | **Single-LLC multi-brand** | 1 LLC + múltiples DBAs/marcas | $$ | Serial founder early-stage, low liability, no fundraising por venture | Pass-through (consolidado) |
| 3 | **Delaware Tostada** | DE LLC → LATAM OpCo | $$ | Pre-seed/seed con SAFEs/convertibles | Pass-through |
| 4 | **Cayman Sandwich** | Cayman HoldCo → DE LLC → LATAM OpCo | $$$$ | Series A+ con VCs internacionales | No Cayman corporate tax |
| 5 | **Delaware C-Corp** | DE C-Corp → LATAM OpCo | $$$ | Exit US acquirer, QSBS elegibilidad | 21% federal + withholding (21-48% en exit) |
| 6 | **Services Hub + Independent Ventures** (caso serial-founder) | Services LLC + N Venture LLCs (bilateral MSAs) | $$$ | Serial founder con 3+ ventures, shared services, independent VC raises per venture, sin plan fund | Pass-through per venture; Services LLC consolida personal income |
| 7 | **Multi-LLC + Holding** (futuro) | Holding → múltiples LLCs de ventures | $$$$$ | Studio operator o serial founder con ventures maduras buscando VC + plan de fund atado | Depende de holding jurisdiction |

---

## Flujo de decisión

### Paso 1 — Contexto del fundador / studio

**SD-1**: "¿Estamos decidiendo estructura para:
- (a) Una startup específica
- (b) Un portafolio de múltiples ventures (tuyos o de un studio)
- (c) Migración de estructura existente a una mejor"

**SD-2**: "¿Cuántas ventures activas (o planeadas en los próximos 12 meses) tenés?
- 1 venture
- 2-3 ventures
- 4-6 ventures
- 7+ ventures (escala de studio)"

**SD-3**: "Por cada venture, ¿cuál es el stage actual?
- Idea (sin MVP)
- MVP en desarrollo
- MVP lanzado, sin revenue
- Revenue recurrente (<$10k MRR)
- Revenue significativo ($10k-$100k MRR)
- Growth stage (>$100k MRR)"

**SD-4**: "¿Alguna venture busca levantar capital de VCs institucionales en los próximos 18 meses?
- Sí, seed/pre-seed con SAFEs (flexible)
- Sí, priced round Series A+ (requiere estructura específica)
- Bootstrapping, sin plan de VC
- No sé aún"

### Paso 2 — Exposición de riesgo

**SD-5**: "¿Alguna venture tiene exposición legal alta? (Marca las que apliquen)
- [ ] Salud / healthtech / productos médicos
- [ ] Fintech / manejo de dinero / pagos
- [ ] Menores de edad / productos para niños
- [ ] Data sensible (PII, salud, financial)
- [ ] Productos físicos con riesgo de daño
- [ ] Servicios regulados (legal, medical, etc.)
- [ ] Ninguna — todas son SaaS B2B low-risk"

Esta pregunta afecta **críticamente** si single-LLC multi-brand es viable o no. Ventures
high-liability bajo misma LLC = contaminación de responsabilidad si una es demandada.

### Paso 3 — Geografía y mercado

**SD-6**: "¿Dónde residís vos (el fundador)?
- Costa Rica
- México
- Colombia
- Chile
- Otro LATAM (Perú, Uruguay, Argentina, Brasil, etc.)
- Estados Unidos
- EU (Portugal, España, etc.)
- Otro"

**SD-7**: "¿Dónde está tu mercado primario? (Marca los que apliquen)
- [ ] Mercado local de tu país de residencia
- [ ] LATAM (regional)
- [ ] Estados Unidos
- [ ] EU
- [ ] Global (SaaS online)"

**SD-8**: "¿Necesitás contratar empleados formales (no freelancers) en tu país de residencia?
- Sí, varios empleados formales locales
- Tal vez, en 6-12 meses
- No — solo freelancers / contratistas / remote"

### Paso 4 — Exit strategy

**SD-9**: "¿Qué exit contemplás?
- Adquisición por US company (líder del mercado US)
- Adquisición por corporación LATAM / regional
- IPO (público)
- No planeo exit, business perpetuo / dividendos
- No lo pensé aún"

### Paso 5 — Recursos disponibles

**SD-10**: "¿Cuánto podés destinar a setup legal inicial?
- Menos de $500 (muy limitado)
- $500 - $2,000 (básico)
- $2,000 - $10,000 (estándar)
- $10,000+ (full structure con abogado desde día 1)"

**SD-11**: "¿Jurisdicción fiscal preferida para tu residencia personal?
- Residente fiscal CR (paga impuestos en CR)
- Residente fiscal US (paga impuestos en US)
- Residente fiscal EU (Portugal NHR, Spain Beckham Law, etc.)
- No me preocupa (nómada fiscal)"

---

## Aplicación del árbol de decisión

Basado en las respuestas, aplicar esta lógica en orden:

### Regla 1 — Descartar estructuras incompatibles

| Condición | Descarta |
|---|---|
| 2+ ventures con high-liability (salud/fintech/menores) | Single-LLC multi-brand (contaminación cruzada) |
| Plan de levantar priced round Series A+ en LATAM | Delaware Tostada (VCs priced rounds no aceptan LLC — necesitan C-Corp o Cayman) |
| Exit esperado US-focused | Cayman Sandwich (mejor Delaware C-Corp para QSBS) — pero validar con abogado |
| Empleados formales locales en CR / MX / CO / CL | Skip-CR puro (necesita OpCo local — subir a Delaware Tostada mínimo) |
| Presupuesto < $500 | Cayman Sandwich + Delaware C-Corp (costos mínimos $3-5k) |

### Regla 2 — Recomendación por stage y stance

| Stage + stance | Recomendación primaria | Razón |
|---|---|---|
| Idea / MVP pre-revenue, bootstrapped, 1 venture | **Skip-CR Pattern** o **Delaware Tostada** | Máxima flexibilidad, mínimo costo |
| 2-5 ventures personales early-stage, low-liability | **Single-LLC multi-brand** | Costo consolidado, simplicidad fiscal |
| 2-5 ventures con 1+ high-liability | **Multi-LLC (sin holding aún)** | Aislar la high-liability en su propia entidad |
| **3+ ventures con shared services + VC raises independent per venture + NO plan fund** | **Services Hub + Independent Ventures** (patrón #6) | Middle ground: shared efficiency sin overhead de holding; raises VC per venture con cap tables limpios |
| Revenue + pre-seed/seed + SAFEs | **Delaware Tostada** | VCs aceptan SAFEs en LLC; pass-through sigue útil |
| Revenue + Series A+ con VCs LATAM/globales | **Cayman Sandwich** | Estándar de la industria; 47.7% unicornios LATAM |
| Revenue + plan exit US-focused | **Delaware C-Corp** | QSBS elegibilidad + familiar para US acquirers |
| Studio con 5+ ventures, 2+ en Series A + plan fund atado | **Multi-LLC + Holding** (patrón #7) | Governance + clean cap tables por venture + holding para LP fund |

### Regla 3 — Ajustes por residencia fiscal del fundador

- **Residente CR** → skip CR incorporation si posible (INS/CCSS/MEIC son pesados); US-TX o Delaware LLC mejor opción
- **Residente México** → considerar México SA + US entidad si mercado principal es US
- **Residente EU con NHR (Portugal)** → Portugal Lda + structure offshore según planes

---

## Estructura del output (recomendación)

Generar `./portfolio/{name}/structure-decision.md` con estas secciones:

### 1. Decisión recomendada

- **Estructura primaria**: `[uno de los 7 patrones]`
- **Confianza**: 🟢 Alta / 🟡 Media / 🔴 Baja (explicar por qué)
- **One-liner rationale**: `[por qué esta estructura matchea el perfil]`

### 2. Por qué esta estructura (vs. las alternativas)

Tabla comparativa entre la recomendada y las 2 alternativas más cercanas:

| Dimensión | Recomendada: [X] | Alternativa 1: [Y] | Alternativa 2: [Z] |
|---|---|---|---|
| Costo setup | | | |
| Costo mantenimiento anual | | | |
| Flexibilidad VC | | | |
| Protección liability | | | |
| Complejidad fiscal | | | |
| Velocidad de setup | | | |

### 3. Plan de implementación

Pasos concretos para formar la estructura:

1. **Abogado recomendado**: tipo de abogado + estimado de horas + costo
2. **Jurisdicción(es) a registrar**: estado/país + forma legal exacta (LLC, Inc., Ltd., etc.)
3. **Banking**: qué cuentas abrir (Mercury para US LLC, Wise para multi-moneda, banco local si OpCo LATAM)
4. **Tax ID**: EIN para US, TIN para otras jurisdicciones
5. **Documentación inicial**: Operating Agreement, Certificate of Formation, Foreign Qualification si aplica
6. **Timeline realista**: semanas a full setup

### 4. Evolution roadmap (migration triggers)

Cuándo **migrar a la siguiente estructura**:

| De | A | Trigger | Timing estimado |
|---|---|---|---|
| Skip-CR | Delaware Tostada | Primer cliente LATAM que requiere factura local, o primer empleado formal local | Mes X |
| Delaware Tostada | Cayman Sandwich | Term sheet de VC para priced round Series A | Antes del closing |
| Single-LLC multi-brand | Multi-LLC | Una venture alcanza $10k MRR o recibe interest de VC | Milestone específico |
| Multi-LLC | Multi-LLC + Holding | 3+ ventures con revenue Y primer term sheet | Coordinar con VC lawyer |

### 5. Riesgos y contraindicaciones

Para la estructura recomendada:

- **Riesgo legal principal**: `[riesgo específico]`
- **Riesgo fiscal principal**: `[riesgo específico]`
- **Señal de alarma temprana**: `[qué observar que indicaría migrar]`
- **Costo hidden**: `[costos no obvios, ej. state franchise taxes, annual reports, registered agents]`

### 6. Jurisdicciones alternativas explícitamente rechazadas

Para cada alternativa evaluada, una línea del por qué NO se eligió:

- **Cayman Sandwich**: No se eligió porque `[razón]`
- **Delaware C-Corp**: No se eligió porque `[razón]`
- etc.

### 7. Recursos

- Links a proveedores legales
- Templates govclab (Cornerstone LPA, PACT) si aplica
- Calculadoras: CAC dilución, tax incidence
- Comunidades (Latitud, Founders Network, etc.)

---

## Casos canónicos (ejemplos)

### Caso 1: Acme Studio

- **Contexto**: Studio LATAM con múltiples iniciativas (Acme Academy, Acme Platform, Acme Agent, Acme Launchpad, Acme Forum, etc.) operado con empleados US + freelancers CR
- **Estructura actual**: Texas LLC (Skip-CR pattern)
- **Por qué**: Mercado no es CR local, no necesita empleados formales locales, simplicidad operativa, Mercury banking
- **Migration trigger**: Si Acme Studio formaliza como studio con fondo atado → evolucionar a Cayman Sandwich (HoldCo) + Delaware midco + LATAM OpCos por venture

### Caso 2: Serial founder con 3 startups personales

- **Contexto**: Residente CR, 3 startups en stages mixtos, sin ninguna buscando VC todavía, low liability
- **Estructura recomendada**: Single-LLC multi-brand (una LLC Delaware cubriendo los 3 brands)
- **Por qué**: Costo consolidado, sin complicación de cap tables múltiples, pass-through fiscal
- **Migration trigger**: Cuando una startup alcance $10k MRR o reciba intro-a-VC → migrar a Multi-LLC con holding futuro

### Caso 3: HealthTech seed con term sheet US

- **Contexto**: Fundadores mexicanos, producto regulado, $2M seed de VC US
- **Estructura recomendada**: Cayman Sandwich (Cayman HoldCo → DE LLC → México OpCo)
- **Por qué**: VC necesita priced round, operación local requiere compliance regulatorio, tax efficiency en exit
- **Migration trigger**: Pre-IPO si planean listar en NASDAQ → considerar flip a Delaware C-Corp

### Caso 4: Serial founder con 4 ventures mixed liability (caso serial-founder)

- **Contexto**: Residente CR, 4 ventures personales (Acme Pets animal welfare, Acme Robotics hardware+SaaS, Acme Realty proptech con escrow, Acme Customs customs SaaS), liability mix 2×🔴 + 2×🟡, plan VC raises independent per venture, sin plan fund atado
- **Estructura recomendada**: **Services Hub + Independent Ventures** (patrón #6)
- **Por qué**: Multi-LLC mandatory por liability contagion; shared services (devs, legal, marketing) worth centralizar; VC raises per venture requieren cap tables limpios independientes; holding formal prematuro hasta que 2+ ventures hit Series A
- **Estructura específica**: Acme Services LLC (Delaware) + 4 Venture LLCs (Delaware Tostada per venture) + bilateral MSAs + transfer pricing cost-plus 10%
- **Setup cost**: ~$6-8k (5 LLCs) + MSA templates via skill `services-hub-setup`
- **Migration trigger**: cuando 2+ ventures hit Series A → evolucionar a Multi-LLC + Holding (patrón #7)
- **Referencia**: skill `services-hub-setup` para el pattern completo con ejemplo

---

## Integración con otras skills del toolkit

- **`services-hub-setup`**: implementa patrón #6 (Services Hub) con MSA template + transfer pricing methodology + IP assignment rider
- **`structure-evolution-roadmap`**: profundiza el roadmap de migración con triggers específicos
- **`jurisdiction-matrix`** (reference doc): matriz comparativa completa de jurisdicciones
- **`business-model-toolkit`** Fase 13 (Fundación Legal): incluye setup inicial per venture; este skill define la arquitectura macro cross-venture
- **`accelerator-launchpad`**: si el recomendado es ir a acelerador, el output influye el timing de decisión legal
- **`cap-table-per-venture`**: aplica en patrones Services Hub (N cap tables independientes), Multi-LLC, y Holding
- **`when-to-become-studio`**: el readiness assessment route a patrón correcto (#6 Services Hub middle ground, vs #7 formal studio con fund)
- **`attached-fund-structure`**: solo aplica si patrón elegido es #7 Multi-LLC + Holding con plan de fund atado
- **`liability-contagion-analysis`**: valida que las ventures NO son combinables bajo single-LLC (rationale para patrones #6 y #7)

---

## Principios clave

- **Una pregunta a la vez** — nunca bombardear con múltiples
- **Opción múltiple cuando posible** — más fácil de responder
- **Siempre Opción B** — personalizar cada marcador genérico
- **Aviso legal NO es opcional** — recordar al usuario que esto NO reemplaza abogado
- **Rationale explícito** — cada recomendación debe tener razón citable, no solo "porque sí"
- **Migration, no terminus** — la estructura elegida hoy NO es la última; incluir triggers de migración

## Recursos adicionales

- **Latitud** — [Cayman Sandwich explicado](https://latitud.com/blog/cayman-sandwich-corporate-structure-startups), Latitud Formation para setup
- **Manzano Law** — [Corporate structures for LATAM startups](https://www.manzano.law/post/corporate-structures-for-latin-american-startups)
- **Carta** — [Cayman Sandwich rigorous](https://carta.com/learn/startups/private-companies/incorporation/cayman-sandwich/)
- **Cooley** — [Cayman Sandwich para LATAM](https://www.cooleygo.com/the-cayman-sandwich-a-potential-corporate-structure-solution-for-latam-startups/)
- **ECGI** — [Cayman Sandwich risks](https://www.ecgi.global/publications/blog/the-cayman-sandwich-risks-for-institutional-and-venture-capital-markets) (balanceador crítico)
- **Mercury** — banking para US LLCs de founders internacionales
- **Stripe Atlas** — incorporation service + EIN + banking bundled
- **Cake Equity** — guía de sweat equity + FAST agreement ([Cake Equity — Sweat equity](https://www.cakeequity.com/guides/sweat-equity))
- **Portugal Startup Visa + IFICI** — si fundador considera EU ([Touchdown](https://www.touchdown.us/blog/portugal-startup-visa))
