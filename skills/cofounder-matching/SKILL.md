---
name: cofounder-matching
version: 0.3.0
description: >
  Rubric-based co-founder matching methodology. Scores candidate
  co-founders against a founder's startup profile using a 6-axis framework
  (domain fit, skill complementarity, values alignment, equity expectations,
  time commitment, track record). Produces a ranked shortlist with gap
  analysis + interview questions per candidate. Works standalone (manual
  candidate input) — can consume chimeranext candidate pool via chimeranext-api-consumer
  agent when available. Use when the user asks "co-founder matching", "find
  co-founder", "evaluate candidate", "co-founder fit", "co-founder scoring",
  "/cofounder-matching". NOT legal or HR advice.
---

# Co-Founder Matching

Evalúa candidatos a **co-founder** contra un startup profile usando una **rubric de 6 ejes**. Produce un ranked shortlist + gap analysis + interview questions customizadas por candidato.

## ⚠️ Disclaimer

Co-founder matching es **decisión high-stakes**:

- Co-founder equity grants son típicamente 20-50% — irreversible sin término (o clawback tras vesting)
- Co-founder disputes son la razón #1 de failure en early stage startups
- Este skill genera **marco de evaluación estructurado**, NO sustituye:
  - Working session trial (4-8 semanas de trabajo pre-grant)
  - Legal review del Founder Agreement
  - Background / reference checks profesionales
  - Red flag conversations (visión a 10 años, sacrifice tolerance, exit expectations)

## Regla de idioma

Español.

## Directorio de salida

```
./launchpad/{startup-slug}/cofounder-matching/
├── rubric.md                           # Rubric personalizada para esta startup
├── candidate-[name]/
│   ├── scorecard.md                    # 6-axis scorecard con evidencia
│   ├── gap-analysis.md                 # Qué falta vs ideal candidate
│   └── interview-questions.md          # Preguntas customizadas para este candidato
└── shortlist.md                        # Ranked list + recommendation
```

---

## La rubric — 6 ejes de evaluación

### 1. Domain fit

¿El candidato entiende el mercado objetivo?

**Score 1-5**:
- 5: Operador/builder en el vertical con >5 años + network relevante
- 4: Usuario profundo del problema + research extensa del mercado
- 3: Familiar con el mercado pero sin operator experience
- 2: Conoce el mercado desde afuera (consumidor casual, articles)
- 1: Sin conocimiento relevante del dominio

### 2. Skill complementarity

¿Las skills del candidato llenan gaps del founder existente?

Mapear a los 3 roles archetype de Y Combinator:
- **Hacker** (builds the product)
- **Hustler** (sells and markets)
- **Designer** (designs the experience)

**Score 1-5**:
- 5: Cubre completamente un gap crítico + es world-class en eso
- 4: Cubre un gap + tiene competencia sólida
- 3: Cubre parcialmente un gap existente
- 2: Duplica skills existentes (overlapping, not complementary)
- 1: No aporta skills relevantes al stage actual

### 3. Values alignment

¿Comparten los valores clave para esta venture?

5 valores standard a evaluar:
- **Ambition** (growth-oriented vs. lifestyle)
- **Risk tolerance** (VC path vs. bootstrap)
- **Time horizon** (10-year commitment vs. 3-year exit)
- **Ethics** (how they've handled moral edge cases pre)
- **Impact** (profit alone vs. impact + profit)

**Score 1-5**:
- 5: Explícitamente alineado en los 5 valores con evidencia
- 4: Alineado en 4/5, el 5° es aceptable divergence
- 3: Alineado en 3/5, 2 divergencias require explícit conversation
- 2: Divergente en ≥3 valores — red flag
- 1: Misalignment fundamental que predicto breakdown

### 4. Equity expectations

¿El candidato espera un equity split compatible con el stage + contribution?

**Score 1-5**:
- 5: Expectativa razonable (10-50% dependiendo stage) + flexible + firma vesting 4yr/1yr cliff sin fricción
- 4: Razonable pero negotiations on terms (acceleration, cliff variation)
- 3: Expectativa alta pero negociable con clarification
- 2: Expectativa inflada (e.g., 50% joining at Seed post-MVP)
- 1: Unreasonable — demand sin justificación o sin aceptar vesting

### 5. Time commitment

¿Fulltime es realista para este candidato?

**Score 1-5**:
- 5: Available full-time desde día 1, financial runway personal ≥12 meses
- 4: Full-time en ≤30 días + financial runway ≥6 meses
- 3: 80%+ committed con day-job por ≤3 meses transition
- 2: Part-time indefinido (>50%) — risky pero manageable para stage
- 1: Part-time <30% o indefinido — usualmente red flag para founder

### 6. Track record + execution evidence

¿Qué ha shipped / construido / logrado el candidato antes?

**Score 1-5**:
- 5: Exit previo o role senior en exitosa startup + refs strong
- 4: Built/shipped product con traction cuantificable + refs positivos
- 3: Builds independientes con evidence (GitHub, Dribbble, case studies)
- 2: Training/certification sin ship evidence
- 1: Puro CV sin evidence de ship capability

---

## Weighted scoring

Los ejes NO pesan igual — el peso depende del stage de la startup:

| Eje | Ideation | MVP | Traction | Funded+ |
|---|---|---|---|---|
| Domain fit | 20% | 15% | 25% | 30% |
| Skill complementarity | 30% | 35% | 25% | 20% |
| Values alignment | 25% | 20% | 15% | 15% |
| Equity expectations | 10% | 10% | 15% | 15% |
| Time commitment | 10% | 15% | 10% | 10% |
| Track record | 5% | 5% | 10% | 10% |

**Rationale**: early stage prioriza skill complementarity + values (team gelling); later stage prioriza domain fit + proven execution.

---

## Flujo del skill

### Paso 1 — Load startup context

**CM-1**: "Vamos a evaluar co-founder candidates contra tu startup. Primero necesito el context:

1. ¿Tenés `startup-profile.md` generado por `startup-intake`? Si sí, lo leo.
2. ¿Cuál es el stage actual? (Ideation / Formation / MVP / Traction / Funded / Scaling)
3. ¿Qué gaps de skills tenés explícitos? (CEO + falta CTO, o tenés CEO+CTO y te falta CMO, etc.)
4. ¿Qué equity range estás considerando ofrecer? (típico 20-50% dependiendo contribution pre-existente)"

### Paso 2 — Generate rubric personalizada

**CM-2**: Generar `rubric.md` con weights ajustados al stage, y hacerlo visible al usuario para que vea los criterios antes de evaluar candidates.

### Paso 3 — Collect candidates

**CM-3**: "¿Cuántos candidates querés evaluar?

Para cada candidate, necesito:
- Nombre + contacto (LinkedIn URL ideal)
- Cómo los conociste
- Domain expertise claim (self-described + evidencia)
- Skills claim
- Time commitment expectation
- Equity expectation (o rango)
- Track record: 2-3 highlights verificables

Si tenés chimeranext API habilitada (via `chimeranext-api-consumer` agent), puedo pull candidates from your co-founder matching queue directly. Si no, proceedemos con manual input."

### Paso 4 — Score cada candidate

**CM-4**: Para cada candidate, generar `scorecard.md` con:

- Score por eje (1-5 con evidencia citada)
- Weighted total score
- Relative ranking vs otros candidates
- Key strengths
- Key concerns
- **Kill-switch flags**: criterios que si fallan, desqualify regardless de total score (ej. values misalignment severo, equity expectation outrageous, concurrent commitment a competitor venture)

### Paso 5 — Gap analysis

**CM-5**: Generar `gap-analysis.md` por candidate:

- Qué axis están under-scored
- Can gaps be closed pre-grant? (training, trial period, advisor bridge)
- Can gaps be tolerable post-grant? (rare — usually breaks later)
- Compare candidate profile to "ideal candidate" for this stage

### Paso 6 — Interview questions

**CM-6**: Generar `interview-questions.md` customizado por candidate:

- 5-8 preguntas targeted a sus weakest axes
- 2-3 preguntas de values exploration (hipotéticos concretos: "Si el lead VC te pidiera firing de un early employee antes de Series A, ¿cómo responderías?")
- 1-2 red flag probes (ej. "Contame de un conflict con un co-founder o partner pasado y cómo se resolvió")
- Reference check questions para terceros (ex-managers, ex-co-founders)

### Paso 7 — Shortlist + recommendation

**CM-7**: Generar `shortlist.md`:

- Ranked list por weighted score
- Top recommendation con rationale
- Runner-up con rationale
- "Avoid" list con explicit red flags
- Next steps recommended:
  - **Trial period before grant** (4-8 weeks paid engagement)
  - **Reference checks** (3+ independent)
  - **Founder Agreement + Vesting** (via `founder-documents` skill)
  - **Shared equity milestones** (e.g., grant 5% immediately, rest after 3-month trial validated)

---

## Output template — scorecard.md

```markdown
# Candidate Scorecard — [Candidate Name]

**Startup**: [Startup Name]
**Evaluator**: [Founder Name]
**Date**: YYYY-MM-DD
**Stage weighting**: [Ideation / MVP / Traction / Funded]

---

## Overview

- **Contact**: [LinkedIn / email]
- **How we met**: [context]
- **Time commitment claim**: [full-time / part-time X%]
- **Equity expectation**: [X% range or specific]

---

## Score by axis (1-5 with evidence)

### 1. Domain fit — Score: X/5 (weight XX%)

**Evidence**:
- [Specific observation, quote, or claim]
- [Another evidence]

**Analysis**: [why this score, not higher/lower]

### 2. Skill complementarity — Score: X/5 (weight XX%)

[same format]

### 3. Values alignment — Score: X/5 (weight XX%)

[Evaluate each of the 5 standard values with specific observations]

### 4. Equity expectations — Score: X/5 (weight XX%)

### 5. Time commitment — Score: X/5 (weight XX%)

### 6. Track record — Score: X/5 (weight XX%)

---

## Weighted total

| Axis | Score (1-5) | Weight | Weighted |
|---|---|---|---|
| Domain fit | X | XX% | X.XX |
| Skill complementarity | X | XX% | X.XX |
| Values alignment | X | XX% | X.XX |
| Equity expectations | X | XX% | X.XX |
| Time commitment | X | XX% | X.XX |
| Track record | X | XX% | X.XX |
| **TOTAL** | — | **100%** | **X.XX / 5** |

---

## Kill-switch flags

- [ ] Values severe misalignment? Y/N
- [ ] Equity demand unreasonable / no vesting? Y/N
- [ ] Concurrent commitment to competitor? Y/N
- [ ] Failed reference check? Y/N
- [ ] IP conflict / non-compete issue? Y/N

If ANY kill-switch → **DISQUALIFY regardless of score**.

---

## Summary

**Strengths**:
- [Top 3]

**Concerns**:
- [Top 3]

**Recommendation**: [Progress to interview / Trial period / Pass]

**Next step**: [specific action with timeline]
```

---

## Integración con chimeranext (via chimeranext-api-consumer agent)

**Disponible desde v0.5.0** — el agent `chimeranext-api-consumer` (ver `agents/chimeranext-api-consumer.md`) es invocable desde este skill en el Paso 3 (collect candidates) pidiendo la operación `list_candidate_pool`. Hoy esa operación retorna `SPEC_GAP` (el endpoint no está en la OpenAPI spec todavía) y el skill procede con manual candidate input — como siempre. Cuando @william + @garbanzo expongan el endpoint en chimeranext, el agente comenzará a retornar `LIVE_DATA` automáticamente sin cambios en este skill: candidate pool + Chimera Score embebido se inyectan al rubric 6-axis. Mismo patrón para push de scorecards de vuelta via `sync_candidate_scorecard` (también `SPEC_GAP` hoy).

## Integración con otras skills

- **`startup-intake`**: source de `startup-profile.md` para stage + gaps context
- **`cap-table-builder`**: post-matching, el co-founder grant se ejecuta vía este skill
- **`founder-documents`**: Founder Stock Purchase Agreement + IP Assignment + Vesting Exhibit
- **`feature-to-spike`**: si durante matching se descubre pattern útil para chimeranext (ej. "weighted scoring ajustado por stage es mejor que pesos fijos"), generar SPIKE

## Principios clave

- **Kill-switches override score**: nunca avanzar si hay values misalignment fundamental
- **Trial period obligatorio antes de grant completo**: 4-8 semanas paid + milestone-based equity release
- **Reference checks siempre**: mínimo 3 ex-colleagues o ex-partners (NO solo los que el candidate eligió)
- **Weighted scoring ajustado por stage**: pesos no son fijos, dependen del momento de la venture
- **Documentación como audit trail**: cada scorecard referencable ante future founder disputes

## Anti-patterns

- Grant de equity sin vesting porque "confiamos" → red flag VC + future dispute risk
- Skipping reference checks porque the candidate es amigo de un amigo
- Over-weighting de domain fit en Ideation stage (se aprende; skill complementarity pesa más temprano)
- Ignorar kill-switches "porque el candidate es excepcional en otros ejes"
- Una sola session de evaluación (no trial period)

## Recursos

- **Y Combinator Co-Founder Matching** ([ycombinator.com/cofounder-matching](https://www.ycombinator.com/cofounder-matching))
- **Paul Graham — "The 18 Mistakes That Kill Startups"** — #1 is single founder
- **[First Round Review — Co-Founder Guide](https://review.firstround.com/)**
- **"The Founder's Dilemmas"** (Noam Wasserman, Princeton 2012) — research sobre founder splits
- **Reference check framework**: 3×3 (3 refs, 3 questions each: values, skills, conflict resolution)
