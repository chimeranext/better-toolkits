---
name: cost-of-delay-cd3
version: 1.0.0
description: >
  Prioritizes initiatives (features, ventures, hiring decisions, capital
  allocations) using Cost of Delay divided by Duration (CD3). Replaces
  HiPPO (Highest Paid Person's Opinion) and gut-feel prioritization with
  economic prioritization. Based on Lean Enterprise cap. 8. Use when the
  user asks "cost of delay", "CD3", "prioritization framework",
  "which feature first", "weighted shortest job first", "WSJF",
  "priorizar iniciativas", "/cost-of-delay-cd3", or has a backlog of
  initiatives and needs to decide what to work on first.
---

# Cost of Delay / Duration (CD3)

Prioriza iniciativas (features, ventures, hiring, capital) usando **Cost of Delay
divided by Duration** (CD3). Reemplaza HiPPO y gut-feel con priorización económica
defendible.

Basado en *Lean Enterprise* cap. 8 (adaptado de Don Reinertsen's *Principles of Product
Development Flow*).

## Regla de idioma

Español. Financial terms en "español (English)" primera vez.

## Directorio de salida

```
./portfolio/{venture-o-studio-name}/prioritization/
├── backlog-cd3-YYYY-MM-DD.md         # Snapshot de priorización
└── cd3-calculations.md               # Cálculos detallados por item
```

---

## Fórmula base

```
CD3 = Cost of Delay ($ per unit time) / Duration (time to deliver)
```

Mayor CD3 = más prioritario (entrega valor económico por unidad de tiempo más rápidamente).

### Ejemplo

| Feature | Cost of Delay | Duration | CD3 |
|---|---|---|---|
| A | $10k/week | 4 weeks | $2,500 |
| B | $5k/week | 1 week | $5,000 |
| C | $20k/week | 12 weeks | $1,667 |

**Ranking por CD3**: B (5,000) > A (2,500) > C (1,667)

Aunque C tiene el COD más alto ($20k/week), su duration es larga, así que otros features
generan más valor total en ese tiempo.

---

## Calcular Cost of Delay (más difícil que Duration)

### Tipos de Cost of Delay

**1. Revenue delay**: $X/week que NO ganamos por no tener el feature.
- "Feature de suscripción anual bloquea $50k/mes potenciales"
- COD = $50k / 4 weeks = $12,500/week

**2. Cost savings delay**: $X/week que estamos gastando por no optimizar.
- "Automation reduce $20k/mes de ops manual"
- COD = $5k/week

**3. Risk delay**: $X/week en expected losses de un riesgo.
- "Security vuln podría costar $500k en breach, 10% prob in next 6 months"
- COD = $500k × 10% / 26 weeks = $1,923/week

**4. Competitive delay**: valor de entrar al mercado primero / no quedarse atrás.
- Difícil de cuantificar directo. Estimar con customer churn / market share loss.

**5. Strategic option delay**: valor de keep future options open.
- También difícil. Estimar via Expected Value of Information (EVI).

### Estimación práctica

Rara vez se puede cuantificar exacto. Usar **rango 3-point** (low / likely / high):

```
CD_low = $X/week (conservative)
CD_likely = $Y/week (expected)
CD_high = $Z/week (optimistic)
```

Rankear por likely, stress test con low/high.

---

## Distribución power-law (observación clave)

En la práctica, CD sigue distribución **power law**: unos pocos items tienen CD 10-100x
mayor que la mayoría. Esto significa:

- Los top 3-5 items dominan el valor total del backlog
- Priorizar los top 3-5 correctamente es 10x más importante que priorizar el resto
- Pierder tiempo en debates de items #15 vs #16 es desperdicio

**Regla práctica**: después de calcular CD3 para todos los items, los top 20% usualmente
representan 80%+ del valor. Focus ahí.

---

## Flujo del skill

### Paso 1 — Inventario del backlog

**CD-1**: "Listá los items a priorizar. Pueden ser:
- Features de producto
- Ventures a invertir del portfolio (capital allocation)
- Hiring decisions (cual rol contratar primero)
- Technical debt items
- Marketing campaigns
- Partnerships a pursue

Máximo 20 items por round — más diluye la señal."

### Paso 2 — Estimar Duration

**CD-2**: "Para cada item, estimar duration:
- Para features: dev weeks estimated (usar sizing T-shirt: S/M/L/XL)
- Para ventures: months de runway needed before next milestone
- Para hiring: weeks to hire + ramp (usar 8-12 weeks promedio)
- Para partnerships: weeks de negotiation + integration

Si duration es incierto, usar 3-point estimate (low/likely/high)."

### Paso 3 — Estimar Cost of Delay

**CD-3**: "Para cada item, identificar qué tipo de CD aplica y estimar:

**Tipo 1 — Revenue delay**:
- ¿Cuánto revenue NO entra per week/month por NO tener esto?

**Tipo 2 — Cost savings delay**:
- ¿Cuánto se gasta per week/month que se eliminaría con esto?

**Tipo 3 — Risk delay**:
- Expected loss × probability / time horizon

**Tipo 4 — Competitive delay**:
- Churn mensual × ticket promedio (si aplica)
- Market share loss estimation

**Tipo 5 — Strategic option**:
- Valor de mantener opción abierta — difícil, estimar conservador

Si múltiples tipos aplican, sumarlos."

### Paso 4 — Calcular CD3

**CD-4**: "Para cada item:
CD3 = Total Cost of Delay / Duration

Rankear descendente por CD3."

### Paso 5 — Sanity check

**CD-5**: "Revisar el top 5 del ranking:
- ¿Los números 'se sienten' correctos? (intuition check — si el #1 es contraintuitivo, revisar supuestos)
- ¿Las estimates de duration son realistic? (developers tienden a sub-estimate)
- ¿Los CODs están sobrevalorados? (business tiende a over-claim)

Ajustar si hay anomalías."

### Paso 6 — Identificar power-law cutoff

**CD-6**: "Graficar CD3 descendente. Usualmente hay un 'knee' donde los top items dominan.
- Focus execution en top 3-5
- El resto queda en backlog, re-evaluar trimestralmente"

---

## Output

Generar `./portfolio/{name}/prioritization/backlog-cd3-YYYY-MM-DD.md`:

```markdown
# Backlog priorizado por CD3 — YYYY-MM-DD

**Context**: [cual pod / team / project]
**Método**: Cost of Delay / Duration (CD3)

## Top items (priorizar primero)

| Rank | Item | CD3 | COD ($/week) | Duration | Type COD |
|---|---|---|---|---|---|
| 1 | [name] | $X | $Y | Z weeks | [revenue/cost/risk/competitive/strategic] |
| 2 | | | | | |
| 3 | | | | | |
| 4 | | | | | |
| 5 | | | | | |

## Full ranking

[Complete table con todos los items]

## Power-law observation

- Top 3 CD3 sum: $X
- Rest of backlog CD3 sum: $Y
- Ratio: top 3 representan X% del valor total

## Rationale por top item

### #1 [item name]

**Cost of Delay breakdown**:
- Revenue delay: $X/week ([details])
- Other types: ...

**Duration estimate**: Y weeks
- Why: [reasoning]
- Confidence: [high / medium / low]

**CD3**: $X/week

**Recommendation**: Start immediately. Block dev capacity for next Y weeks.

### #2 [item name]
[...]

## Decisions

- Top 3 committed to this quarter: [names]
- Backlog for re-evaluation next Q: [count]
- Items rejected (low CD3): [names + reason]

## Next re-prioritization

Cada trimestre re-calcular CD3 — CODs cambian con el mercado, durations con capacity.
Próxima fecha: YYYY-MM-DD
```

---

## Case study: Maersk

*Lean Enterprise* documenta Maersk's experiencia:

- Pre-CD3: features priorizadas por HiPPO
- Post-CD3: median cycle time reduced by ~50%
- Power-law revealed: small # de features dominan el valor económico

Take-away: la disciplina del método genera insights que HiPPO nunca ve.

---

## Principios clave

- **CD > duration**: un feature con alto CD y poco duration domina
- **Power law everywhere**: top 3-5 items son donde todo el valor vive
- **Estimación is inherently imprecise**: usar ranges, no números mágicos
- **Re-calcular periódicamente**: CODs cambian, durations cambian
- **Replace HiPPO explicitly**: el proceso visible desafía decisiones por autoridad

## Anti-patterns

- **CD estimado por política, no evidencia**: "este feature lo pidió el CEO, COD alto" = HiPPO disfrazado
- **Ignorar duration**: solo priorizar por COD lleva a tackling mega-features primero
- **Cálculos sin sanity check**: confiar números ciegamente, especialmente para items contraintuitivos
- **No re-priorizar**: backlog CD3 calculado hace 6 meses es obsoleto
- **Micro-tuning rank 15-20**: gastar tiempo en items que no están en el knee de la power law

## Integración con otras skills

- **`innovation-scorecard`**: actions identified en scorecard se priorizan vía CD3
- **`three-horizons`**: CD3 aplicado dentro de cada horizon (no mezclar items H1 y H3 en mismo ranking)
- **`explore-exploit`**: CD3 más confiable en Exploit (datos sólidos); en Explore usar como guideline
- **`improvement-kata`**: el siguiente step del kata puede priorizarse vía CD3

## Recursos

- **Lean Enterprise** (Humble/Molesky/O'Reilly, 2015) — cap. 8 "Identifying Value and Increasing Flow"
- **Principles of Product Development Flow** (Don Reinertsen, 2009) — origen del framework
- **SAFe WSJF** (Weighted Shortest Job First) — adaptación en Scaled Agile
- **Joshua Arnold — Black Swan Farming** — consultant + blog sobre CD3 applications
