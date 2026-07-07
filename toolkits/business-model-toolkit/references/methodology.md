# Business Model Brainstorming — Detailed Methodology

## Dialogue Principles

### One Question Per Message

Each message contains exactly ONE question. Never bundle questions.
If a topic needs exploration, split into sequential questions.

### Question Formats

Prefer multiple choice when possible:
```
¿Cómo planeas distribuir tu producto?
a) Online directo (e-commerce propio)
b) Marketplace de terceros (Amazon, MercadoLibre)
c) Tiendas físicas / distribuidores
d) Modelo híbrido (online + físico)
e) Otro (descríbelo)
```

Use open-ended for exploratory questions:
```
Describe los 3 problemas principales que resuelve tu producto.
```

### Adaptive Follow-Ups

Based on answers, ask targeted follow-ups:
- If revenue model is unclear: "Llévame paso a paso por lo que pasa cuando un usuario gratuito se convierte en cliente que paga."
- If multi-sided marketplace: "¿Quiénes son los dos lados? ¿Qué necesita cada lado del otro?"
- If B2B: "¿Quién es el comprador? ¿Quién es el usuario final? ¿Son la misma persona?"
- If hardware + software: "¿El hardware se vende o se alquila? ¿El software es SaaS o licencia?"

### Shortcut

If the user says "solo genera" or similar, skip remaining questions in the current phase
and work with available context. Acknowledge assumptions and proceed.

---

## Phase 2: Problem Validation — Detailed Question Bank

### Questions to Ask (4-6, one at a time)

**PV-1 — Core Problem**:
"¿Cuál es el problema principal que resuelve tu producto? Descríbelo como si se lo explicaras a alguien que nunca ha escuchado de tu proyecto."

**PV-2 — Problem Frequency**:
"¿Con qué frecuencia experimentan este problema tus clientes potenciales?
a) Diariamente
b) Semanalmente
c) Mensualmente
d) Estacionalmente
e) Una vez en la vida (compra grande)"

**PV-3 — Emotional Impact**:
"¿Qué emoción predomina cuando el cliente enfrenta este problema?
a) Frustración (no logra lo que quiere)
b) Ansiedad (miedo de que algo salga mal)
c) Confusión (no sabe qué hacer)
d) Impotencia (sabe qué hacer pero no puede)
e) Otra (descríbela)"

**PV-4 — Current Solutions**:
"¿Qué hacen actualmente tus clientes potenciales para resolver este problema? Describe las alternativas existentes, aunque sean imperfectas."

**PV-5 — Friction Points**:
"¿Qué es lo más frustrante o ineficiente de las soluciones actuales?"

**PV-6 — Inertia Barriers**:
"¿Qué le impediría a alguien probar tu solución hoy? (ej: costo, complejidad, desconfianza, hábito, falta de tiempo)"

### Personalization Rules (Option B)

When generating `business/entrevista-problema.md`:

1. Read the template from `assets/templates/entrevista-problema.md`
2. Replace ALL instances of `[mencionar el problema]` with the actual problem described by the user
3. Replace `[un evento o período de tiempo]` with context-appropriate timeframes
4. Replace `[una causa específica]` with actual causes identified
5. Replace `[mencionar el resultado esperado]` with the user's desired outcome
6. Replace `[acción relacionada con el resultado esperado]` with specific actions
7. Replace generic factor/alternative placeholders with real alternatives mentioned
8. Replace `[el problema]` throughout with the specific problem statement
9. Replace `[la solución actual]` with the actual current solutions described
10. Replace `[lograr el resultado esperado]` with specific outcomes

**Example transformation:**

BEFORE (generic):
```
¿Podrías describir la última vez que experimentaste el problema de [mencionar el problema]?
```

AFTER (personalized for a meal planning app):
```
¿Podrías describir la última vez que experimentaste el problema de planificar tus comidas semanales sin desperdiciar alimentos?
```

BEFORE:
```
* [ ] Factor A
* [ ] Factor B
* [ ] Factor C
```

AFTER:
```
* [ ] Variedad de recetas disponibles
* [ ] Facilidad para ajustar porciones
* [ ] Integración con supermercados locales
```

---

## Phase 3: Customer Profile — Detailed Question Bank

### Questions to Ask (4-6, one at a time)

**CP-1 — Demographics**:
"Describe a tu cliente ideal: edad, estado civil, profesión, lugar de residencia, nivel socioeconómico."

**CP-2 — Motivations (Ikigai)**:
"¿Qué motiva a tu cliente ideal? Piensa en:
- Lo que ama hacer (pasiones)
- Lo que sabe hacer bien (habilidades)
- Lo que el mundo necesita (propósito)
- Por lo que le pueden pagar (profesión)"

**CP-3 — Pains**:
"¿Cuáles son los 3 mayores dolores o frustraciones de tu cliente relacionados con el problema que resuelves?"

**CP-4 — Gains**:
"Si tu producto funcionara perfectamente, ¿qué ganaría tu cliente?
- Resultados funcionales (ahorra tiempo, dinero, etc.)
- Resultados emocionales (tranquilidad, orgullo, etc.)
- Resultados sociales (estatus, reconocimiento, etc.)"

**CP-5 — Jobs-to-be-Done**:
"Completa esta frase desde la perspectiva de tu cliente:
'Cuando estoy en [situación], quiero [acción] para poder [resultado]'"

**CP-6 — Decision Timeline**:
"¿Cuál es el evento detonante que lleva a alguien a buscar activamente una solución como la tuya? ¿Qué los hace pasar de 'sería bueno' a 'necesito esto ya'?"

### Personalization Rules

Apply the same Option B logic: replace all template placeholders with
project-specific context from Phase 1 and Phase 2 answers.

For the Complexity Dimensions table, ask the user to rate each dimension
or estimate based on context:
- Conocimientos (📚): How much does the customer need to learn?
- Complejidad Cognitiva (🧠): How complex is the decision?
- Esfuerzo Físico (💪): How much physical effort?
- Herramientas (🛠️): What tools are needed?
- Presupuesto (💸): Budget range?
- Tiempo (🌱): How long does it take?

---

## Phase 4: Business Model Canvas — Question Rounds

### Round 1: Problem + Solution (modules 01-02)

**BMC-R1-Q1**: "Describe los 3 problemas principales que resuelve tu producto. Para cada uno, indica: quién lo sufre y qué alternativa usa actualmente."

**BMC-R1-Q2**: "¿Cuáles son las 3 características principales de tu solución que abordan directamente estos problemas?"

Generate modules 01 and 02. Present. Wait for approval.

### Round 2: Market + Value (modules 03-05)

**BMC-R2-Q1**: "Describe 2-3 segmentos de cliente diferentes. Para cada uno: quiénes son, por qué te comprarían, y cuánto están dispuestos a pagar."

**BMC-R2-Q2**: "¿Qué te hace fundamentalmente diferente de las alternativas? ¿Qué tienes que otros no pueden copiar fácilmente?"

Generate modules 03, 04, and 05. Present. Wait for approval.

### Round 3: Channels + Revenue + Relationships (modules 06, 08, 14)

**BMC-R3-Q1**: "¿Cómo llegarás a tus clientes? Describe canales de marketing, venta y distribución."

**BMC-R3-Q2**: "Detalla tu modelo de ingresos: ¿qué planes o precios tienes? ¿Recurrente o único? ¿Hay marketplace o insumos adicionales?"

**BMC-R3-Q3**: "¿Cómo será la relación continua con tus clientes? (soporte, comunidad, onboarding, retención)"

Generate modules 06, 08, and 14. Present. Wait for approval.

### Round 4: Operations (modules 09-12)

**BMC-R4-Q1**: "¿Qué recursos clave necesitas para operar? (físicos, intelectuales, humanos, tecnológicos, financieros)"

**BMC-R4-Q2**: "¿Cuáles son tus actividades esenciales y quiénes son tus socios o proveedores clave?"

**BMC-R4-Q3**: "Describe tu estructura de costos: ¿cuáles son los costos fijos y variables principales? ¿Cuál es la inversión inicial estimada?"

Generate modules 09, 10, 11, and 12. Present. Wait for approval.

### Round 5: Metrics + Goals (modules 07, 13)

**BMC-R5-Q1**: "¿Qué KPIs son los más importantes para tu negocio? (adquisición, activación, retención, ingresos, referencia)"

**BMC-R5-Q2**: "Define 2 objetivos a corto plazo (3 meses) y 2 a mediano plazo (1 año), cada uno con resultados clave medibles."

Generate modules 07 and 13. Present. Wait for approval.

Then generate the index `00-modelo-de-negocio.md` with links to all modules.

---

## Phase 4: Customer Forces (Running Lean) — Detailed Question Bank

### Questions to Ask (3-4, one at a time)

**CF-1 — Push (Insatisfacción)**:
"¿Qué es lo que más frustra a tus clientes de cómo resuelven el problema hoy?
¿Qué los empujaría a buscar activamente algo diferente?"

**CF-2 — Pull (Atracción)**:
"¿Qué de tu solución sería irresistible para ellos? ¿Qué los atraería
específicamente hacia tu producto y no hacia una alternativa?"

**CF-3 — Anxiety + Inertia**:
"¿Qué miedos tendrían al probar algo nuevo? ¿A qué están tan acostumbrados
que les costaría cambiar? (hábitos, herramientas, proveedores, rutinas)"

**CF-4 — Balance**:
"De 1 a 10, ¿qué tan insatisfechos están con su solución actual?
¿Y qué tan difícil sería convencerlos de cambiar?"

### Personalization Rules

When generating `business/fuerzas-del-cliente.md`:
1. Read the template from `assets/templates/fuerzas-del-cliente.md`
2. Replace all generic `[Factor específico]` placeholders with actual forces identified
3. Calculate the balance score based on user's answers to CF-4
4. Populate strategies for mitigating anxiety and overcoming inertia
5. Include specific action items based on the balance diagnosis

### Force Balance Interpretation

- **Push + Pull > Anxiety + Inertia**: Market is ready for switching
- **Push + Pull ≈ Anxiety + Inertia**: Opportunity exists but needs friction reduction
- **Push + Pull < Anxiety + Inertia**: Barriers too high — consider pivot or adoption strategy

---

## Phase 6: Solution Interview — Detailed Question Bank

### Questions to Ask (2-3, one at a time)

**SI-1 — Prototype Type**:
"¿Qué tipo de prototipo tienes o planeas crear?
a) Mockups / wireframes
b) Landing page
c) Demo funcional
d) Wizard of Oz (proceso manual que simula automatización)
e) MVP funcional
f) Aún no tengo nada"

**SI-2 — Validation Criteria**:
"¿Cuáles son las 3 preguntas más importantes que necesitas responder sobre tu
solución? (ej: ¿La entienden? ¿Pagarían? ¿La usarían semanalmente?)"

**SI-3 — Commitment Level**:
"¿Qué nivel de compromiso consideras éxito en una entrevista?
a) Que digan 'me interesa' (verbal — baja señal)
b) Que agenden una segunda reunión (tiempo — señal media)
c) Que refieran a otras personas (reputación — señal alta)
d) Que pre-paguen o firmen carta de intención (financiero — señal máxima)"

### Running Lean Commitment Ladder

The commitment ladder from Ash Maurya establishes that real validation comes from
"skin in the game" — not verbal approval:

1. **Verbal** — "Sounds cool" (almost meaningless)
2. **Time** — They schedule a follow-up (some signal)
3. **Reputation** — They refer others (strong signal)
4. **Financial** — They pre-pay or sign LOI (strongest signal)

The Solution Interview template captures which level of commitment was obtained.

---

## Phase 7: MVP Experiment Design — Detailed Question Bank

### Questions to Ask (3-4, one at a time)

**EXP-1 — Technical Hypothesis**:
"¿Cuál es tu hipótesis técnica principal?
Formato: 'Si [hacemos X], entonces [lograremos Y], medido por [métrica Z con umbral W]'"

**EXP-2 — Commercial Hypothesis**:
"¿Cuál es tu hipótesis comercial?
Formato: 'De una muestra de [N] personas del segmento [X], al menos [Y%]
manifiesta que [acción concreta de validación]'"

**EXP-3 — MVP Scope**:
"¿Qué features son absolutamente mínimas para probar tu hipótesis?
Lista solo lo esencial — todo lo demás se excluye del MVP."

**EXP-4 — Resources**:
"¿Qué recursos tienes disponibles para el experimento?
(tiempo en semanas, presupuesto, equipo, herramientas)"

### Experiment Types (from Running Lean + Lean Product Playbook)

Guide the user toward the right experiment type:
- **Concierge**: Manual delivery of the service (validates demand)
- **Wizard of Oz**: Appears automated but is manual behind the scenes
- **Landing page + CTA**: Tests messaging and conversion
- **Crowdfunding**: Tests willingness to pay before building
- **Video demo**: Tests comprehension and interest
- **Technical PoC**: Tests feasibility of core technology
- **A/B test**: Tests specific feature variations

### Pivot Types (from Lean Startup / Running Lean)

If the experiment results suggest pivoting, reference these types:
- Zoom-in: A feature becomes the entire product
- Zoom-out: The product becomes a feature of something bigger
- Customer segment: Same product, different segment
- Customer need: Same segment, different problem
- Platform: App ↔ platform switch
- Business architecture: B2B ↔ B2C, high-margin ↔ volume
- Channel: Change in distribution channel
- Technology: Same solution, different technology
- Growth engine: Change in acquisition strategy

---

## Phase 8: Pitch Deck — Questions

**PD-1**: "¿Tienes tracción o validación? (usuarios, ingresos, pilotos, testimonios, NPS, LOIs)"

**PD-2**: "Describe tu equipo: quiénes son, qué experiencia relevante tienen, y por qué están calificados para ejecutar esta idea."

**PD-3** (optional): "¿Buscas financiación? Si sí: ¿cuánto necesitas, en qué lo usarías, y qué hitos alcanzarías?"

Generate `business/pitch-deck.md` with MARP frontmatter.

---

## Phase 9: README — Questions

Typically no new questions needed — use all prior context.

If the project has a codebase, ask:
**RM-1**: "¿Cuál es el stack tecnológico del proyecto?"
**RM-2**: "¿Cuál es la estructura del monorepo/directorio?"

Generate `README.md` at project root.

---

## Phase 10: SRD Integration

No questions. Simply offer:

> "El modelo de negocio está completo. ¿Te gustaría que ejecute /srd-framework:srd-assess
> para generar personas sintéticas, journeys, gap audit y directiva de desarrollo?"

If accepted, pass a summary of all business context as input to the SRD skill.
