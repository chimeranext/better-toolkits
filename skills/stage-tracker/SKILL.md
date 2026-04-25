---
name: stage-tracker
version: 0.3.0
description: >
  Milestone tracking across the 6 chimeranext Launchpad stages (Ideation →
  Formation → MVP → Traction → Funded → Scaling) with per-stage exit
  criteria, blockers log, and chimera-Score-compatible scoring. Produces
  current-stage.md, milestones.md, blockers.md, chimera-score.md artifacts.
  Schema-compatible with chimeranext Launchpad stage data model. Use when the
  user asks "stage tracker", "milestones", "current stage", "startup stage",
  "chimera Score", "readiness for next stage", "/stage-tracker". Standalone
  methodology; syncs with chimeranext via chimeranext-api-consumer agent when
  available.
---

# Stage Tracker

Trackea el progreso de una venture a través de las **6 etapas del chimeranext Launchpad** — Ideation → Formation → MVP → Traction → Funded → Scaling. Cada stage tiene exit criteria explícitos, blockers log, y un scoring chimera-Score-compatible.

## ⚠️ Disclaimer

- Stage tracking es **framework de evaluación**, NO un diagnostic final — early-stage startups son messy, los stages overlap
- chimera Score es un **proxy metodológico**, NO un rating investment-grade — decisiones de inversión requieren diligence completa
- Este skill schema-compat con chimeranext pero opera **standalone** hasta que el API esté disponible

## Regla de idioma

Español.

## Directorio de salida

```
./launchpad/{startup-slug}/stage-tracker/
├── current-stage.md                    # Stage actual + confidence level
├── milestones.md                       # Milestones completados + pending per stage
├── blockers.md                         # Blockers activos con severity + owner
├── chimera-score.md                       # Scoring chimera-Score-compat (multi-axis)
└── history/
    ├── YYYY-MM-DD-stage-transition.md  # Log de transiciones
    └── ...
```

---

## Los 6 stages con exit criteria

### Stage 1 — Ideation

**Objetivo**: validar que existe un problema real worth solving.

**Exit criteria** (todos):
- [ ] Hypothesis articulada (format: "Creemos que [segment] experimenta [problem] cuando [context]")
- [ ] ≥10 problem interviews completadas
- [ ] 4/5 criterios de Alvarez cumplen en ≥70% entrevistas (ver `business-model-toolkit:customer-interview-system`)
- [ ] Earlyvangelists identificados (mínimo 3 personas que cumplen TODOS los criterios)
- [ ] ICP (Ideal Customer Profile) documentado

**Next stage**: Formation (team + legal entity setup)

### Stage 2 — Formation

**Objetivo**: formar el equipo fundador + legal entity + governance.

**Exit criteria**:
- [ ] Founders selected + vetted (ver `cofounder-matching`)
- [ ] Founder Stock Purchase Agreement (o Operating Agreement LLC) firmado
- [ ] IP Assignment Agreement firmado per founder
- [ ] Vesting Schedule Exhibit firmado per founder
- [ ] 83(b) elections filed (si US C-Corp o LLC capital interest)
- [ ] Entity incorporada (Delaware C-Corp / LLC / otro — ver `venture-studio-toolkit:structure-decision`)
- [ ] Bank account abierto (Mercury / Brex / local bank)
- [ ] Cap table inicial generada (ver `cap-table-builder`)

**Next stage**: MVP

### Stage 3 — MVP

**Objetivo**: construir + testear una solution mínima.

**Exit criteria**:
- [ ] MVP type selected + justified (ver `business-model-toolkit:solution-design` — 6 MVP types)
- [ ] MVP built (working prototype, not just mockups)
- [ ] ≥5 solution interviews con earlyvangelists
- [ ] Commitment Ladder response positive (users pay / pre-order / sign LOI)
- [ ] Hypothesis VALIDADA per scorecard (≥70% de 4 criterios)
- [ ] Iterations logged (min 3 MVP iterations)

**Next stage**: Traction

### Stage 4 — Traction

**Objetivo**: demonstrate repeatable customer acquisition + retention.

**Exit criteria**:
- [ ] ≥50 paying customers (o equivalent: ≥1000 active users si consumer, ≥10 pilot customers si B2B enterprise)
- [ ] MRR o ARR tracked + growing ≥15% MoM for ≥3 meses
- [ ] CAC + LTV measured with confidence (not estimates)
- [ ] LTV/CAC ratio ≥ 3 (sustainable unit economics)
- [ ] Churn identified + controllable (<5% monthly for SaaS; varies by model)
- [ ] At least 2 repeatable acquisition channels working

**Next stage**: Funded

### Stage 5 — Funded

**Objetivo**: raise institutional round para accelerate.

**Exit criteria**:
- [ ] Round committed (SAFE round or priced equity)
- [ ] Term sheet signed + definitive docs executed (ver `founder-documents`)
- [ ] Funds wired + in company bank account
- [ ] Runway ≥ 18 months at current burn
- [ ] Board constituted (if priced round)
- [ ] Hiring plan executing (first post-funding hires)

**Next stage**: Scaling

### Stage 6 — Scaling

**Objetivo**: scale organization + market presence post-PMF.

**Exit criteria** (indicative — startups rarely "complete" scaling):
- [ ] Revenue ≥ $1M ARR (typical threshold para Series A+ conversations)
- [ ] Team ≥ 10 FTE
- [ ] Repeatable go-to-market with documented playbooks
- [ ] Retention cohort mature (12+ month cohorts tracked)
- [ ] Geographic or product expansion underway

**Beyond**: Growth stage fundraising (Series B+), potential acquisition conversations, or public readiness.

---

## chimera Score — multi-axis scoring

chimera Score es un scoring system de **0-100** compuesto por 5 axes (20 pts cada uno):

### Axis 1 — Team (0-20)

- 5: Founder-only, unvalidated
- 10: Founder + 1 co-founder, skills complementary, values aligned
- 15: Founder team + 2-3 early employees con equity
- 20: Full team cross-functional + advisors + proven execution

### Axis 2 — Product (0-20)

- 5: Idea only, no prototype
- 10: Working prototype, used by founders
- 15: MVP shipped, real users, feedback loop active
- 20: Product beyond MVP, feature roadmap informed by data

### Axis 3 — Traction (0-20)

- 5: No customers, few validation signals
- 10: Pre-revenue, high engagement signals (waitlist, LOIs, pilots)
- 15: Early revenue + growth signs
- 20: Strong revenue + growth + retention cohorts positive

### Axis 4 — Market (0-20)

- 5: Market small or unclear, competition dominant
- 10: Market growing, competition tough but opportunity exists
- 15: Market growing + defensible niche + clear customer demand
- 20: Large market + tailwinds + first-mover or superior approach

### Axis 5 — Business model (0-20)

- 5: No business model articulated
- 10: Revenue model identified, not tested
- 15: Unit economics tested, margins visible
- 20: Sustainable unit economics + clear path to profitability

**Total**: 0-100. Stage expectations:

| Stage | Typical chimera Score range |
|---|---|
| Ideation | 10-30 |
| Formation | 25-45 |
| MVP | 40-60 |
| Traction | 55-75 |
| Funded | 65-85 |
| Scaling | 75-95 |

**Caveats**:
- Score no es ranking absolute; context matters (industry, geography, market conditions)
- Score es self-reported + biased; use for internal tracking, NOT for external pitching
- chimera Score specific weighting puede shift basado en chimeranext platform evolution — este skill implementa v1

---

## Flujo del skill

### Paso 1 — Load context

**ST-1**: "Vamos a trackear tu stage actual. Contexto:

1. `startup-profile.md` existente? Si sí, lo leo (autodetect stage claim)
2. `cap-table.md` existente? (para Formation stage check)
3. Artifacts existentes en `./launchpad/{startup-slug}/`:
   - `customer-interview-system/` (Ideation validation)
   - `cofounder-matching/` (Formation team)
   - `founder-documents/` (Formation legal)
   - `cap-table-builder/` (Formation equity)
   - `investor-matching/` + `demo-day-prep/` (Funded prep)

4. ¿Qué stage claim tenés? (tu view de donde estás)"

### Paso 2 — Assess current stage

**ST-2**: Por cada stage (de Ideation hasta el claim del user), evaluar exit criteria:

- Verde ✓: criterion met (cite evidence from artifacts)
- Amarillo 🟡: criterion partially met (what's missing)
- Rojo 🔴: criterion not met (blocker)
- Gris ⚪: N/A or not yet evaluated

**Output**: tabla de exit criteria with status per stage hasta el stage claim.

### Paso 3 — Identify actual current stage

**ST-3**: Si stage claim > actual state evidenced, flag discrepancy:

- "Claim: Traction. Evidence sugiere: MVP (5 exit criteria de Traction no met). Recomendación: mark actual stage as MVP, track Traction advancement as milestones."

Generar `current-stage.md` con:
- Actual stage (evidence-based)
- Claim stage (if different)
- Confidence level: high / medium / low
- Next stage transition criteria

### Paso 4 — Milestones log

**ST-4**: Generar `milestones.md`:

- Past milestones (con dates)
- Current stage milestones (completed + pending)
- Next stage unlock milestones
- Stretch goals beyond next stage

### Paso 5 — Blockers log

**ST-5**: Generar `blockers.md`:

- Active blockers (severity: low/medium/high/critical)
- Owner per blocker
- Expected unblock date
- Escalation path if blocker persists

### Paso 6 — chimera Score compute

**ST-6**: Por los 5 axes, score 0-20 con evidence:

- Pull data from existing artifacts (interviews count, revenue metrics, team size, etc.)
- Si missing data, mark as "assumed" o "estimated" (explicit flag)
- Total score 0-100

**Generar** `chimera-score.md` con scoring breakdown + recommendations por axis.

### Paso 7 — History tracking

**ST-7**: Si hay prior `stage-tracker/` runs, compare current vs last:

- Stage transitions (when + rationale)
- chimera Score delta per axis
- New blockers opened / closed
- Milestones hit / missed

Generar `history/YYYY-MM-DD-stage-transition.md` per transition event.

---

## Output template — current-stage.md

```markdown
# Current Stage — [Startup Name]

**Assessment date**: YYYY-MM-DD
**chimera Score**: XX/100 (see `chimera-score.md`)

---

## Actual stage

**Stage**: [Ideation / Formation / MVP / Traction / Funded / Scaling]
**Confidence**: [High / Medium / Low]

**Evidence**:
- [Citation from startup-profile.md or artifacts]
- [Citation]

---

## Claim vs actual

**Founder claim**: [Stage claimed]
**Evidence-based actual**: [Stage evidenced]
**Discrepancy explanation**: [if different, why]

---

## Exit criteria for NEXT stage ([Next Stage Name])

| Criterion | Status | Evidence / Gap |
|---|---|---|
| [C1] | ✓ / 🟡 / 🔴 | [evidence or what's missing] |
| [C2] | | |
| ... | | |

**Progress**: X / Y criteria met ({%} complete)

---

## Critical path to next stage

1. [Top priority blocker to resolve]
2. [Second priority milestone to hit]
3. [Third]

**Estimated transition timeline**: [honest estimate based on velocity]

---

## Recent progress (last 30 days)

- [Milestone hit 1]
- [Milestone hit 2]
- [Key learning]

## Stale risks (things not moving in 30 days)

- [Stuck item 1]
- [Stuck item 2]
```

---

## Integración con chimeranext (via chimeranext-api-consumer agent)

**Disponible desde v0.5.0** — este skill puede invocar al agent `chimeranext-api-consumer` con las operaciones `sync_stage` (POST current-stage + chimera-score al tracker), `list_milestones` (pull milestones existentes del founder's workspace), y `get_user_courses` (esta ÚLTIMA sí está LIVE en el spec hoy — `getUserCourses` / `/user-courses`). Course progress del user puede usarse como evidencia automática para "track record" en Formation / MVP axis. `sync_stage` y `list_milestones` retornan `SPEC_GAP` hoy — el skill continúa standalone con output markdown local. Cuando los endpoints launchpad lancen, el sync será bidireccional sin cambios en este skill — el schema de output ya está chimeranext-compat por diseño.

## Integración con otras skills

- **`startup-intake`**: source del `startup-profile.md` + stage claim initial
- **Todos los otros skills de launchpad-toolkit**: evidence para exit criteria
  - `cofounder-matching` → Formation Axis
  - `cap-table-builder` → Formation Axis
  - `founder-documents` → Formation Axis
  - `investor-matching` + `demo-day-prep` → Funded Axis
- **`feature-to-spike`**: SPIKE si detectás stage criterion gap o methodology improvement for chimeranext productization
- **`business-model-toolkit`**: Ideation stage evidence via customer-interview-system + solution-design

## Principios clave

- **Evidence over claim**: founder claim sin evidence artifact = low confidence
- **Exit criteria son cumulative**: no skippear stages para acelerar
- **Regression is acceptable**: stage puede move backward (ej. pivot = back to Ideation)
- **Assessment quarterly minimum**: re-run cada 3 meses durante active phase; mensual durante transitions
- **Blockers > progress**: 1 critical blocker puede invalidar 5 milestones won
- **chimera Score directional, not absolute**: usar para self-evaluation, not external benchmarking

## Anti-patterns

- Self-promoting stage claim sin exit criteria met ("somos Series A-ready" sin $1M ARR)
- Ignorar regression (si pivot happened, mark actual stage honestly)
- Confundir activity con progress (10 interviews done pero ninguna informativa = no progress)
- Skip Formation para ir rápido a MVP (legal + cap table issues después = costo mayor)
- chimera Score manipulation (scoring self-favorably destroys honesty signal)
- No update blockers (blockers pudren silenciosamente — require active surfacing)

## Recursos

- **chimeranext Launchpad stages spec**: `chimera-documentation/content/docs/product/launchpad/startup-flows.md`
- **[First Round Review — Startup Stages Guide](https://review.firstround.com/)**
- **[YC Startup School — Startup Playbook](https://www.startupschool.org/)**
- **"The Lean Startup"** (Eric Ries) — build-measure-learn ciclo foundations
- **"Running Lean"** (Ash Maurya) — stage progression framework
