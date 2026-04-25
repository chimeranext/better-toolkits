---
name: liability-contagion-analysis
version: 1.0.0
description: >
  Identifies "high-liability" ventures in a portfolio that are dangerous to
  combine under a single-LLC multi-brand structure. Prevents liability
  contamination across ventures that, if one is sued or has a regulatory
  incident, could drag down all the others.
  Use when the user asks "liability contagion", "contagio de responsabilidad",
  "can I combine these ventures under one LLC", "single-LLC risk",
  "liability analysis", "regulatory risk portfolio",
  "/liability-contagion-analysis", or is considering a single-LLC multi-brand
  structure for multiple ventures. Founder-mode skill — critical for serial
  entrepreneurs.
---

# Liability Contagion Analysis

Analiza el portafolio de ventures para identificar **riesgos de contagio de
responsabilidad** si se operan bajo una misma LLC con múltiples brands/DBAs.

## Regla de idioma

Español. Términos legales en "español (English)" primera vez.

## Directorio de salida

```
./portfolio/{founder-name}/
└── liability-contagion-analysis.md
```

## Aviso legal

**Esta skill NO es asesoría legal**. El análisis de liability contagion es específico
de la jurisdicción, el sector, y el caso. El output de esta skill debe validarse con
abogado corporativo especializado antes de tomar decisiones de estructura.

---

## El problema

Cuando un founder tiene **múltiples ventures bajo una misma LLC** (operando como DBAs
o brands), la LLC misma es la entidad legal que responde por TODAS las ventures.

Si una venture:
- Es demandada (ej. customer lesionado, data breach, negligence claim)
- Recibe acción regulatoria (ej. fine por no-compliance)
- Tiene bankruptcy event

... los **assets de TODAS las demás ventures** bajo la misma LLC están en riesgo.

Esto se llama **liability contagion** (contagio de responsabilidad) — también referido como **intra-LLC cross-venture contamination** en literatura legal US.

### ⚠️ Distinción crítica: contagion NO es piercing the corporate veil

Son **dos doctrinas distintas** que founders suelen confundir. Confundirlas lleva a remedies equivocados:

| Concepto | Qué protege / qué vulnera | Cómo se activa | Remedy correcto |
|---|---|---|---|
| **Intra-LLC contagion** (esta skill) | Los assets de Venture A están expuestos a demandas contra Venture B cuando ambas están en la misma LLC | Operar múltiples businesses bajo una sola entidad | **Multi-LLC** — separar cada venture en su propia entidad |
| **Piercing the corporate veil** | Los **personal assets del founder** (casa, cuentas personales, salario) están expuestos a demandas contra la LLC | Ignorar corporate formalities (commingling funds, undercapitalization, alter ego, fraude) | **Corporate hygiene** — bank accounts separados, documentación formal, proper capitalization, respect entity as distinct |

**No es una versión "extrema" de la otra**. Son vectores de riesgo independientes:

- Podés sufrir **contagion sin veil piercing**: 3 ventures bajo una LLC, demanda a venture A toca assets de B y C (no necesita piercing). Multi-LLC lo previene.
- Podés sufrir **veil piercing sin contagion**: una sola LLC con una sola venture, pero founder comingla fondos personales con la LLC — el plaintiff perfora el velo y va contra casa del founder. Multi-LLC NO lo previene; solo corporate hygiene lo previene.
- Podés sufrir **ambos** si tenés multi-venture + poor hygiene.

**Remedy stack correcto**: Multi-LLC (previene contagion) **+** corporate formalities (previene veil piercing). Uno sin el otro deja una puerta abierta.

### Ejemplo concreto

- **Setup**: Founder tiene 3 ventures bajo "ACME LLC" — (1) un SaaS B2B de productividad,
  (2) un marketplace de servicios, (3) una app móvil para niños.
- **Incidente**: un niño sufre daño psicológico supuestamente causado por la app #3.
  Los padres demandan ACME LLC por $2M.
- **Contagio**: ACME LLC debe responder. Los $500k en cash + IP del SaaS B2B (venture #1)
  y los contratos del marketplace (venture #2) están en juego para pagar el settlement.

**Solución**: las 3 ventures deberían estar en LLCs separadas. Así el litigio en venture #3
afecta solo a esa LLC, no contamina a las otras dos.

---

## Qué hace "high-liability" a una venture

Una venture es **high-liability** si tiene alguna de estas características:

### 1. Exposición física o de salud

- Productos o servicios que pueden causar **daño físico** al usuario
- Salud / medical / wellness (medication, medical devices, mental health apps)
- Food / beverage / consumables (alergias, contaminación, expiración)
- Hardware con partes móviles, baterías, calor, etc.
- Servicios de transporte (rideshare, delivery)

### 2. Exposición a menores

- Apps / productos para niños < 18 años (COPPA compliance)
- Contenido user-generated accesible por menores
- Education tech para K-12

### 3. Manejo de dinero

- Fintech (custodia, pagos, lending)
- Cryptocurrency (custodia, swaps, exchanges)
- Insurance
- Crowdfunding / investment platforms

### 4. Data sensible (PII especial)

- Data de salud (HIPAA en US, equivalentes en otros países)
- Data financiera (PCI-DSS si procesás tarjetas)
- Data de menores
- Biometric data (fingerprints, face recognition)
- Data de usuarios de países con strict privacy (GDPR en EU, LGPD en Brasil)

### 5. Actividades reguladas

- Servicios legales / tax / medical / financial advice
- Telemedicine
- Cannabis / productos controlados
- Firearms / weapons
- Alcohol / tobacco
- Gambling / betting

### 6. Exposición reputational-to-legal

- Content moderation (defamation risk)
- Dating / social matching (harassment claims)
- User-generated content platforms (DMCA, copyright)
- Adult content

### 7. Vendor o contract exposure

- Enterprise SaaS con SLAs estrictas (breach = damages)
- Government contracts (False Claims Act)
- Large B2B con liability caps negociados

### 8. Geography-specific risks

- Operar en países con litigation activa (US — especialmente California)
- Operar en jurisdicciones sin good faith commercial law (algunos emerging markets)

---

## Clasificación de riesgo

Para cada venture del portafolio, asignar **rating de liability**:

### 🟢 Low-liability (safe to combine)

Ejemplos:
- SaaS B2B tool para teams (productividad, automation, analytics) — usuarios adultos,
  no data sensible, no pagos directos
- Content sitio / blog / newsletter sin moderation intensa
- Marketplace de productos digitales no-regulados
- Developer tools / libraries open-source
- Consulting services B2B standard

### 🟡 Medium-liability (caution combining)

Ejemplos:
- SaaS B2B que maneja data financiera limitada (accounting, invoicing)
- Marketplace de servicios profesionales (excluding regulated professions)
- EdTech para adultos (sin K-12 involucrados)
- B2C consumer apps sin health/financial/safety implications
- Community platforms moderadas

**Guideline**: se pueden combinar entre sí cuidadosamente si la structure tiene buen
insurance coverage, pero preferir LLCs separadas si hay recursos.

### 🔴 High-liability (DO NOT combine)

Ejemplos:
- Healthtech / telemedicine
- Fintech / crypto / payments
- Apps para niños / K-12 EdTech
- Food & beverage / supplements
- Hardware con safety implications
- Servicios médicos / legales / financial advice
- Content con moderation intensiva (social media scale)

**Regla**: cada high-liability venture en su propia LLC. NO combinar con otras high-liability,
y NO combinar con low-liability tampoco (para proteger la low-liability del contagio).

---

## Flujo del skill

### Paso 1 — Inventario del portafolio

**LC-1**: "Listá todas las ventures actuales (o planeadas en próximos 12 meses) en tu portafolio. Por cada una:
- Nombre
- Stage (idea / MVP / revenue)
- Descripción en 1 oración
- Target customer (B2B / B2C / B2B2C / B2G)
- Industria principal"

### Paso 2 — Evaluación de liability per venture

Para cada venture, preguntar:

**LC-2**: "Para [venture]:
- ¿Interactúa físicamente con usuarios? (hardware, food, delivery, transport)
- ¿Los usuarios pueden ser menores de 18?
- ¿Manejás dinero (pagos, custody, lending)?
- ¿Manejás data sensible (health, financial, biometric, children)?
- ¿La industria es regulada (medical, legal, financial advice, telecom)?
- ¿Tenés user-generated content público?
- ¿Operás primary en jurisdicción alta-litigation (US California, NY)?
- ¿Contratos B2B con liability significativas?
- Ninguna de las anteriores"

Asignar rating 🟢 / 🟡 / 🔴 basado en respuestas.

### Paso 3 — Matriz de compatibilidad

Construir una matriz de N×N ventures mostrando qué combinaciones son safe vs. unsafe.

Reglas:

| Combinación | Recomendación |
|---|---|
| 🟢 + 🟢 | ✅ Safe to combine under single-LLC if desired |
| 🟢 + 🟡 | ⚠️ Combine con insurance adecuada; preferir separate si budget |
| 🟢 + 🔴 | ❌ NO combinar — high-liability contamina low-liability |
| 🟡 + 🟡 | ⚠️ Combine con caution — usar DBAs claras + insurance |
| 🟡 + 🔴 | ❌ NO combinar |
| 🔴 + 🔴 | ❌ NEVER combinar — cada high-liability en su propia LLC |

### Paso 4 — Recomendación estructural

Con base en la matriz, recomendar una de estas estructuras:

**Opción A: Single-LLC con todas las ventures** — SOLO si todas son 🟢

**Opción B: Single-LLC para las low-risk + LLC separada para cada high-risk**
- 1 LLC para todas las 🟢 combinadas
- N LLCs adicionales, una por cada 🟡 o 🔴

**Opción C: Multi-LLC total (1 LLC por venture)** — más conservador, más costo

**Opción D: Holding + multi-LLC** — el más robusto para portfolios maduros

### Paso 5 — Risk mitigation adicional

Además de la estructura, recomendar:

1. **Insurance coverage** apropiado:
   - General Liability (GL) para cualquier venture B2C
   - Errors & Omissions (E&O) para B2B SaaS con SLAs
   - Cyber liability para data-heavy ventures
   - Professional liability para servicios regulados
   - Product liability para hardware/consumables

2. **DBA clarity**: si se combinan ventures bajo una LLC, cada brand/DBA debe estar
   claramente registrada. Sin DBAs registradas, la corte puede ver todo como una sola
   operación (menor protección).

3. **Operating agreement** robusto: el Operating Agreement de la LLC debe tener:
   - Clear asset segregation entre brands
   - Indemnification clauses
   - Distribution rules que protejan assets de una brand de claims contra otra

4. **Observable corporate formalities**: mantener registros separados, contabilidad
   separada por brand, bank accounts separados por brand. Esto NO previene contagion
   intra-LLC (solo multi-LLC lo hace), pero SÍ previene **piercing the corporate veil**
   — una doctrina distinta donde plaintiff va contra **personal assets del founder**
   si la LLC no se trata como entidad separada (commingling, undercapitalization,
   alter ego). Los dos remedies se complementan: multi-LLC contra contagion, corporate
   hygiene contra veil piercing.

### Paso 6 — Generate analysis doc

Generar `./portfolio/{founder}/liability-contagion-analysis.md`:

```markdown
# Liability Contagion Analysis — [Founder Name]

**Analysis date**: YYYY-MM-DD

## Ventures evaluadas

### [Venture 1 name]
- Description: [1 oración]
- Rating: 🟢 / 🟡 / 🔴
- Why: [specific reasons]

### [Venture 2 name]
[...]

## Matriz de compatibilidad

[N×N table]

## Recomendación estructural

**Opción recomendada**: [A / B / C / D]

**Estructura**:
- LLC #1 "[name]": [ventures que cubre]
- LLC #2 "[name]": [ventures que cubre]
- etc.

**Costo estimado**: [setup + annual maintenance combined]

## Risk mitigation adicional

### Insurance recommendations

- Venture 1: [specific coverage types]
- Venture 2: [specific coverage types]

### DBA registrations needed

- [list]

### Operating agreement provisions críticas

- [list]

## Red flags detectados

[Si hay combinations actuales que son riesgosas, listarlas explícitamente]

## Siguientes pasos

1. Consultar con abogado corporativo para validar
2. [Si cambio estructural needed] → correr `structure-evolution-roadmap` skill
3. Obtener quotes de insurance para las coverages recomendadas
4. Registrar DBAs necesarias
```

---

## Casos canónicos

### Caso 1: Founder con 3 ventures low-risk (todas 🟢)

- Venture A: SaaS B2B productivity tool
- Venture B: Developer newsletter
- Venture C: Open-source library con donations

**Matriz**: 🟢🟢🟢 — todas compatibles

**Recomendación**: Opción A (Single-LLC con 3 DBAs)

**Ahorro**: ~$3k-$5k/año vs. 3 LLCs separadas

### Caso 2: Founder con mix (común, arriesgado)

- Venture A: SaaS B2B productivity (🟢)
- Venture B: Fintech payments app (🔴)
- Venture C: EdTech para K-12 kids (🔴)

**Matriz**:
- 🟢 vs 🔴: ❌
- 🔴 vs 🔴: ❌

**Recomendación**: Opción C (3 LLCs separadas) — cada fintech y edtech k-12 en su propia entity

**Razón**: combinar la fintech con la edtech = contagion catastrófico. Combinar el SaaS con cualquiera = contamination.

### Caso 3: chimeranext Labs scenario (referencia)

- chimeranext Platform, Pathways, Forum, Marketplace — 🟢 (B2B SaaS low-risk)
- Hackathons — 🟡 (liability por eventos presenciales; insurance required)
- Software Factory — 🟡 (B2B contracts with SLAs; E&O insurance needed)
- chimera Score — 🟢

**Matriz**: mayoría 🟢, algunas 🟡, ninguna 🔴

**Recomendación**: Opción B — Single-LLC para los 🟢, LLC separada para Hackathons
(por event liability), y E&O insurance robusto para Software Factory.

Actualmente chimeranext Labs opera con una sola Texas LLC (Skip-CR pattern). Este es
**relativamente safe** dado que las ventures son mayoritariamente 🟢, pero:
- Hackathons debería tener insurance específica para eventos (general liability + event cancellation)
- Software Factory contracts deberían tener liability caps negociados
- Si alguna venture nueva es 🔴 (ej. una payments feature real), separar en LLC propia.

---

## Principios clave

- **Cuando dudés, separá**: el costo de una LLC adicional ($500-$2000/año) es insignificante vs. el downside de contagion
- **Insurance + structure son complementarios**, NO sustitutivos: una buena insurance no elimina la necesidad de structure; una buena structure no elimina la necesidad de insurance
- **Corporate formalities matter (contra veil piercing, no contra contagion)**: mantener DBAs registradas, bank accounts separados, accounting separada. Esto protege **personal assets del founder** contra pierce the corporate veil — una doctrina **distinta** a intra-LLC contagion. Multi-LLC es el remedy para contagion; corporate hygiene es el remedy para veil piercing. Los dos son complementarios, no sustitutivos
- **Re-evaluar en stage changes**: cuando una venture cruza milestones (MVP → revenue → scale), re-evaluar su rating de liability
- **Contagion va en ambas direcciones**: una low-risk venture exitosa puede ser drenada por una high-risk venture fallida; también una low-risk con incidente reputacional menor puede contaminar una high-risk con compliance sensible

## Anti-patterns

- "Es más barato tener una LLC y poner todo ahí" → falso ahorro; downside catastrófico
- "Todavía no vendí nada, no importa la liability" → algunos riesgos aplican desde day 1 (data breach, pre-sale liability)
- "Mi insurance va a cubrir todo" → las pólizas tienen exclusions; muchos casos de contagion son denied por insurers
- "Voy a reorganizar cuando crezca" → reorganizar post-revenue es costoso y taxable (ver `structure-evolution-roadmap`)

## Integración con otras skills

- **`structure-decision`**: este skill informa la respuesta a "Single-LLC vs Multi-LLC" — si hay 🔴 en el portfolio, Single-LLC multi-brand se descarta
- **`structure-evolution-roadmap`**: si una venture nueva eleva el risk rating del portfolio, trigger migración
- **`cap-table-per-venture`** (futuro skill): cap tables separados cuando hay Multi-LLC

## Recursos

- **Cooley** — [Liability contagion in SaaS](https://www.cooleygo.com/) (multiple articles)
- **Insurance brokers**: Vouch, Founder Shield (startup-specialized insurance marketplaces)
- **Delaware Chancery Court** — case law on pierce the corporate veil
- **COPPA compliance guide** (FTC) — para ventures con minor users
- **HIPAA compliance guide** (HHS) — para health ventures
