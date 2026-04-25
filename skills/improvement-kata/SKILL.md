---
name: improvement-kata
version: 1.0.0
description: >
  Facilitates Mike Rother's Improvement Kata — a scientific pattern of working
  for continuous improvement with 5 daily questions. Based on Lean Enterprise
  cap. 6. Use when the user asks "improvement kata", "toyota kata",
  "5 daily questions", "target condition", "continuous improvement framework",
  "mejora continua", "kata de mejora", "/improvement-kata", or wants to apply
  a structured method for making progress toward an ambitious goal via daily
  PDCA experiments.
---

# Improvement Kata

Facilita Mike Rother's **Improvement Kata** — patrón científico de trabajo para
mejora continua. Basado en *Lean Enterprise* cap. 6 + Rother's *Toyota Kata* (2010).

Fundamentalmente: un framework para **hacer progreso sistemático hacia una meta
ambiciosa** via experimentos diarios PDCA (Plan-Do-Check-Act).

## Regla de idioma

Español. Términos lean en "español (English)" primera vez.

## Directorio de salida

```
./portfolio/{team-o-venture-name}/kata/
├── kata-board.md                    # Target condition + current + obstacles
├── experiments/
│   ├── YYYY-MM-DD-experiment-01.md  # Un archivo por experimento diario
│   └── YYYY-MM-DD-experiment-02.md
└── kata-review-YYYY-MM-DD.md        # Review semanal / mensual
```

---

## Los 4 pasos del Improvement Kata

### Paso 1: Understand the Direction / Challenge

La **dirección** viene del leadership. Es ambiciosa, potencialmente unattainable,
inspiradora. No es una meta específica — es el norte.

Ejemplos:
- "Ser el studio líder de LATAM para developer-tools startups"
- "Reducir time-to-PMF promedio de 12 meses a 6 meses en el portfolio"
- "Lograr 10x en MRR sin aumentar burn rate"

### Paso 2: Grasp the Current Condition

Entender el estado actual con **facts y data**, no impresiones.

- Process mapping (cómo funciona hoy)
- Metrics baseline (dónde estamos)
- Variabilidad (rangos, no solo promedios)

### Paso 3: Establish the Next Target Condition

El target condition es **específico, measurable, achievable, relevant, time-bound**
(SMART) y describe el proceso como QUEREMOS que funcione en una fecha específica.

Formato:
- "[Proceso] funcionará [cómo]"
- "Metric X estará en Y"
- "Deadline: [fecha]"

**Crítico**: el target condition es **un peldaño hacia el Challenge**, no el Challenge
en sí. Usualmente 2-4 semanas en el futuro.

Ejemplo:
- **Challenge**: "Reducir time-to-PMF de 12 meses a 6 meses"
- **Current condition**: time-to-PMF promedio actual = 14 meses (data de últimas 5 ventures)
- **Target condition**: "Para las próximas 2 ventures que arranquen, time-to-first-validated-hypothesis será ≤ 8 semanas"

### Paso 4: Iterate Toward the Target Condition (PDCA daily)

Hacia el target, correr PDCA **diariamente**. Cada día:

- **Plan**: qué experimento vamos a correr hoy
- **Do**: ejecutarlo
- **Check**: resultado vs. prediction
- **Act**: learning → próximo experimento

---

## Las 5 preguntas diarias (corazón del kata)

Cada día el coach pregunta al learner:

1. **What is the target condition?**
   (Forzar recordar la meta específica, no deriva)

2. **What is the actual condition now?**
   (Fact-based, no opinión)

3. **What obstacles do you think are preventing you from reaching the target
   condition? Which one are you addressing now?**
   (Identificar obstacles + focus en UNO)

4. **What is your next step? What do you expect?**
   (Plan del próximo experimento + prediction explícita)

5. **When can we go and see what we have learned from taking that step?**
   (Commitment time para check)

**Regla**: las 5 preguntas duran 10-15 minutos. NO son status report — son learning cycle.

---

## Roles

- **Learner**: la persona haciendo el kata (founder, PM, eng lead, etc.)
- **Coach**: pregunta las 5 daily questions, NO dice qué hacer
- **Challenge owner** (opcional): leadership que define la Challenge

**Regla importante**: el coach NO soluciona. El coach solo pregunta. El learner piensa
y decide.

---

## Obstacles (step 3)

Los **obstacles** son razones concretas por las que no estamos en el target condition.

- Ejemplos concretos, no abstractos:
  - NO: "no tenemos budget"
  - SÍ: "el dev está bloqueado por falta de Stripe API keys en staging"

Lista de obstacles **se revisa y se añade** en cada daily. Uno a la vez se aborda
(focus > coverage).

---

## Experimentos (step 4)

Cada experimento sigue el formato:

```
Obstacle being addressed: [name]

Plan (prediction): "Si hago X, espero Y resultado. Razón: [hypothesis]"

Do: [executed]

Check: "Realmente pasó Z. Gap con prediction: ..."

Act (next step): "Basado en Z, next experiment es: ..."
```

**Regla clave**: tener **prediction explícita**. Si "no teníamos expectativa clara",
no aprendemos de la evidencia — solo observamos eventos.

---

## Escalamiento al portfolio

En un studio con múltiples ventures, el kata se aplica a:

- **Cada venture** individualmente (team level)
- **Studio-level** para mejoras cross-portfolio (org level)

Ejemplos cross-portfolio:
- Challenge: "Reducir time desde idea → launch a 30 días"
- Target condition: "Q3 2026: nueva venture lanzar MVP público en 30 días, con al menos 10 signups"
- PDCA: experimentos semanales en el proceso de launching

---

## Flujo del skill

### Paso 1 — Define Challenge

**IK-1**: "¿Cuál es la Challenge (dirección aspiracional)?
Formato: 'Lograr [estado aspiracional] para [fecha distante]'
La Challenge es inspiradora, no específicamente achievable todavía."

### Paso 2 — Grasp Current Condition

**IK-2**: "Describir el estado actual con data concreta:
- Process: ¿cómo funciona hoy?
- Metrics baseline: ¿dónde estamos?
- Variabilidad: ¿cuál es el rango?
- Pain points observables: ¿qué duele hoy?"

### Paso 3 — Set Target Condition

**IK-3**: "Definir target condition (2-4 semanas):
- Formato SMART (Specific, Measurable, Achievable, Relevant, Time-bound)
- 1-3 métricas concretas
- Descripción cualitativa del proceso target
- Deadline explícito"

### Paso 4 — List initial obstacles

**IK-4**: "Listar obstacles que separan current condition del target condition:
- Concretos, no abstractos
- Observables / measurables
- Priorizar cuál abordar primero"

### Paso 5 — Setup daily cadence

**IK-5**: "Definir:
- ¿Quién es learner?
- ¿Quién es coach?
- ¿Daily check-in cuándo? (15 min ideal)
- ¿Donde vive el kata board? (pared física, Notion, etc.)"

### Paso 6 — Run experiments

**IK-6**: "Cada día, correr las 5 preguntas + documentar experiment. Después de 1-2 semanas,
review progress vs. target condition:
- ¿On track para hit target en deadline?
- ¿Target condition necesita ajuste?
- ¿Coach-learner relationship funcionando?"

---

## Output

Generar `./portfolio/{name}/kata/kata-board.md`:

```markdown
# Kata Board — [Team/Venture Name]

## Challenge (direction)

> [Challenge statement — aspiracional, largo plazo]

## Current Condition

**As of YYYY-MM-DD**:

- [Metric 1]: [current value]
- [Metric 2]: [current value]
- Process description: [how it works today]
- Variabilidad: [ranges observed]

## Target Condition

**Deadline: YYYY-MM-DD**:

- [Metric 1] será [target value]
- [Metric 2] será [target value]
- Process target: [how we want it to work]

## Obstacles (current list)

- [ ] [Obstacle 1] — [why this blocks us]
- [ ] [Obstacle 2] — [why]
- [ ] [Obstacle 3] — [why]

## Currently addressing

**Obstacle**: [name]
**Current experiment**: [brief description, link to experiment file]

## Experiment log

See `./experiments/` for daily experiment records.

## Review cadence

- Daily check-in: [time] with [coach] and [learner]
- Weekly review: [day]
- Monthly re-target: first [day] of each month
```

Cada experimento en `./experiments/YYYY-MM-DD-experiment-NN.md`:

```markdown
# Experiment NN — YYYY-MM-DD

**Obstacle**: [being addressed]

## Plan

"Si hago [X], espero [Y prediction]."

Rationale: [hypothesis that this will address the obstacle]

## Do

**Executed**:
- [Action]
- [Action]

## Check

**Result**: [what actually happened]

**Gap with prediction**:
- [where prediction was right]
- [where prediction was wrong]
- [surprises]

## Act (next step)

**Learning**: [what we learned]

**Next experiment**: [action for tomorrow]
```

---

## Principios clave

- **Daily cadence**: el aprendizaje viene de la frecuencia, no de la grandeza de cada experimento
- **Prediction antes de execute**: sin prediction, no hay aprendizaje científico
- **Coach pregunta, learner piensa**: coach NO sugiere soluciones
- **Target condition != Challenge**: target es peldaño, Challenge es destino final
- **Facts > opiniones**: current condition debe ser measurable + observable
- **Focus en un obstacle**: intentar solucionar 5 simultáneos = no solucionar ninguno

## Anti-patterns

- Coach diciendo qué hacer (rompe el kata — learner no crece)
- Experimentos sin prediction (no se puede aprender)
- Target condition demasiado distante (vuelve al Challenge — pierde foco)
- Daily que se vuelve status report (pierde el learning cycle)
- Obstacles abstractos ("budget", "time") — no son addressable

## Integración con otras skills

- **`innovation-scorecard`**: el scorecard muestra current condition macro; el kata opera al nivel micro del improvement
- **`three-horizons`**: el kata es más útil en H1 (Exploit) donde hay procesos a mejorar; en H3 (Explore) el kata se adapta (target condition = "validated X hipótesis")
- **`cost-of-delay-cd3`**: obstacles pueden priorizarse via CD3 si hay muchos
- **`explore-exploit`**: en Explore usar kata para validar PMF (target = "problem validated + N customers identified"); en Exploit usar para optimizar operaciones

## Recursos

- **Toyota Kata** (Mike Rother, McGraw-Hill 2010) — libro fundacional
- **Lean Enterprise** (Humble/Molesky/O'Reilly, 2015) — cap. 6 "Continuous Improvement"
- **Improvement Kata Handbook** — free resource de Mike Rother
- **The Toyota Way** (Jeffrey Liker, 2003) — context más amplio del Toyota Production System
- **Kata Practitioner Community** — kata practitioners network online
