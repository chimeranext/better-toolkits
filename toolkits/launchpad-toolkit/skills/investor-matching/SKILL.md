---
name: investor-matching
version: 0.3.0
description: >
  Investor fit scoring methodology. Evaluates investor candidates against
  a startup profile using a 5-axis framework (stage fit, check size fit,
  thesis alignment, geography / vertical overlap, value-add depth).
  Produces ranked target list with customized outreach per investor.
  Works standalone (manual investor input or curated lists like YC, NVCA
  directory) — can consume chimeranext investor database via chimeranext-api-consumer
  agent when available. Use when the user asks "investor matching", "find
  investors", "investor fit", "fundraising targets", "VC list", "angel
  matching", "/investor-matching". NOT financial or legal advice.
---

# Investor Matching

Evalúa **candidatos a investor** (VCs, angels, family offices, CVCs) contra un startup profile con un **framework de 5 ejes**. Produce target list ranked + outreach customizado.

## ⚠️ Disclaimer

- Fundraising tiene **regulatory + tax implications** en cada jurisdicción (securities law, accreditation requirements, tax treatment)
- Este skill genera **investor research structured**, NO sustituye:
  - Securities lawyer (Reg D filing, Blue Sky compliance, cross-border)
  - Tax advisor (QSBS timing, Section 1202 tracking)
  - Professional fundraising coach o advisor con track record
- **Nunca enviar outreach** sin review legal de los materials (deck + data room + term sheet draft)

## Regla de idioma

Español.

## Directorio de salida

```
./launchpad/{startup-slug}/investor-matching/
├── target-criteria.md                  # Qué perfil de investor buscamos
├── investor-[name]/
│   ├── fit-scorecard.md                # 5-axis scorecard con evidencia
│   ├── outreach-template.md            # Customized email + LinkedIn
│   └── intelligence-notes.md           # Check history, portfolio fit, known biases
├── target-list.md                      # Ranked list + outreach sequence plan
└── tracker.md                          # Pipeline status per investor (emailed, responded, meeting, etc.)
```

---

## Los 5 ejes de evaluación

### 1. Stage fit

¿El investor escribe checks en el stage actual de la startup?

**Score 1-5**:
- 5: Primary focus es tu stage + >50% de portfolio en este stage
- 4: Active en tu stage + invierte en adjacent stages
- 3: Invierte ocasionalmente en tu stage, más focused en adjacent
- 2: Solo invierte ocasionalmente en tu stage (outlier checks)
- 1: Nunca invierte en tu stage

**Data source**: Crunchbase, PitchBook, investor's "About" page, recent check announcements.

### 2. Check size fit

¿El check size típico del investor coincide con el amount que estás raising?

**Score 1-5**:
- 5: Tu round size = median check size del investor (ideal lead)
- 4: Tu round = 50-80% of median o 120-150% (co-lead o primary)
- 3: Tu round = 30-50% o 150-200% (follower check or stretch)
- 2: Tu round = 10-30% o >200% (unlikely to engage)
- 1: Rounds outside their mandate entirely

**Formula**: 
- Median investor check = typical size from recent portfolio announcements
- Target ownership = check size / post-money valuation (most VCs target 10-20%)

### 3. Thesis alignment

¿El problema que resuelve tu startup cabe en la thesis del investor?

**Score 1-5**:
- 5: Tu startup es explicitly mentioned en su public thesis
- 4: Thesis cubre el espacio + portfolio has 2+ similar ventures (positive signal)
- 3: Thesis cubre el espacio pero no hay portfolio proof
- 2: Thesis adjacent pero NOT primary focus
- 1: Thesis distinct o incompatible

**Data source**: Investor's blog posts, Twitter, podcasts interviews, portfolio list, published thesis docs.

**Red flags**:
- Investor has already invested in direct competitor (usually a pass due to portfolio conflict)
- Thesis has shifted recently (old deals don't reflect current focus)

### 4. Geography / vertical overlap

¿El investor opera en tu región + vertical?

**Score 1-5**:
- 5: Primary geography + primary vertical — deep rolodex en ambos
- 4: Primary geography OR vertical strongly, pero not both
- 3: Covers both pero not primary
- 2: Covers one secondarily, not primary
- 1: Outside their active operating zone

**LATAM-specific scoring**:
- Latitud, KaszeK, Monashees, Endeavor: primary LATAM focus
- GV, SoftBank, Sequoia: LATAM via specific local partners
- Most US funds: LATAM only via Delaware/Cayman wrapped entities (see `venture-studio-toolkit:structure-decision`)

### 5. Value-add depth

¿Qué aporta el investor más allá del capital?

**Score 1-5**:
- 5: Hands-on operating partner experience + active engagement (2-3 operator platforms per portfolio company)
- 4: Strategic advisor access + warm intros + domain expertise
- 3: Warm intros + occasional strategic guidance
- 2: Capital + quarterly check-ins (mostly passive)
- 1: Capital only (transactional, no engagement)

**Data source**: portfolio founder references (critical — interview 2-3 portcos per investor), LinkedIn posts patterns.

**Dark side probes** (ask references):
- "How did the investor behave when [portco] had a down round / missed metrics?"
- "Has the investor pushed for exits / board changes / founder replacements?"
- "How engaged are they with the portco beyond board meetings?"

---

## Weighted scoring

Ajustado por **prioridad del founder**:

| Eje | Fundraising-first (default) | Value-add-first | Stealth / Strategic |
|---|---|---|---|
| Stage fit | 25% | 20% | 20% |
| Check size fit | 25% | 20% | 20% |
| Thesis alignment | 20% | 20% | 30% |
| Geography / vertical | 15% | 15% | 15% |
| Value-add depth | 15% | 25% | 15% |

**Default**: fundraising-first — maximiza probabilidad de close del round.

**Value-add-first**: cuando founder priorizes strategic investor sobre optimal check terms (ej. post-Series A necesita operating help).

**Stealth / Strategic**: cuando necesitas investor that strongly matches thesis over pure check efficiency.

---

## Flujo del skill

### Paso 1 — Load startup + fundraising context

**IM-1**: "Vamos a targetear investors contra tu round. Necesito:

1. `startup-profile.md` (si existe — lo leo)
2. **Round specifics**:
   - Amount raising: $X
   - Target valuation: $Y pre-money (o post-money)
   - Instrument: Priced equity (Series Seed/A+) o SAFE (pre-priced)
   - Close timeline: [weeks]
3. **Fundraising priority**: Fundraising-first / Value-add-first / Stealth-Strategic
4. **Geography preference**: [LATAM / US / EU / Global]
5. **Sector**: [fintech / healthtech / B2B SaaS / marketplace / etc.]
6. **Existing investor intros**: ¿Hay existing investors que pueden referir?"

### Paso 2 — Generate target criteria

**IM-2**: Generar `target-criteria.md` con el perfil ideal de investor derivado de respuestas anteriores.

### Paso 3 — Source candidates

**IM-3**: "¿Cómo querés sourcear candidates?

- Manual input: vos me das N nombres + contexto
- Curated lists: YC Investor Day List, NVCA directory, Crunchbase, LATAM VC directory (CB Insights tables)
- **chimeranext investor database** (cuando la API esté disponible via `chimeranext-api-consumer` agent)

Para cada candidate necesito: nombre del fund, partner / angel name, LinkedIn, recent checks public info."

### Paso 4 — Score cada investor

**IM-4**: Por cada candidate, generar `fit-scorecard.md` con:

- Score por eje (1-5 con evidence citation)
- Weighted total
- Competitors en su portfolio (red flag if strong)
- Warm intro path (1st/2nd/3rd degree LinkedIn connection)

### Paso 5 — Intelligence notes

**IM-5**: Por cada investor top-tier, generar `intelligence-notes.md`:

- Last 5 investments (amount + stage)
- Public thesis evolution (track changes over last 2 years)
- Podcast / blog appearances con positions relevantes
- Known biases (e.g., "pasa en founders sin CS degree", "prefers technical co-founders", "no invierte en marketplaces")
- Founder references feedback (si disponible)

### Paso 6 — Outreach customization

**IM-6**: Generar `outreach-template.md` por top-tier investor:

- **Email 1**: Intro vía warm path si existe; cold email templated si no
- **Email 2**: Follow-up (7 días post-1) con update concreto (traction, pipeline, team)
- **LinkedIn message**: Short, thesis-specific, incluye 1 metric
- **Intro request to mutual**: Template de pedido de introducción vía mutual contact

**Personalization per investor**:
- Ref al último deal relevante del investor ("Vi tu inversión en X — hay paralelos con nuestro enfoque en Y")
- Ref a su thesis published ("Tu post de Jun 2025 sobre Z resonó con nuestro approach")
- NO menciones generic fund info que todos saben

### Paso 7 — Target list + sequence plan

**IM-7**: Generar `target-list.md` (ranked) + sequence plan:

- **Tier 1** (top 5 scores): parallel outreach en primeras 2 semanas
- **Tier 2** (next 10): parallel outreach en week 3-4
- **Tier 3** (remainder): reserve para post first-pass learnings

**Sequence tactics**:
- NEVER mass email (destroys reputation + signals desperation)
- Batch de 3-5 investors por semana con staggered follow-ups
- Track response rate + adjust outreach based on early results
- Maintain "no-shop" consistency: si lead investor pidió no-shop, respectar period

### Paso 8 — Tracker setup

**IM-8**: Generar `tracker.md` — simple kanban:

- **Queue**: not yet contacted
- **Contacted**: email sent, awaiting response
- **Responded positive**: scheduled intro call
- **Intro done**: post-call, awaiting followup decision
- **Partner meeting**: advanced to partnership meeting
- **Term sheet in discussion**: active negotiation
- **Committed**: soft/hard commitment
- **Passed**: no (with rationale)

Update cadence: weekly during active fundraise.

---

## Output template — fit-scorecard.md

```markdown
# Investor Fit Scorecard — [Investor Name / Fund]

**Startup**: [Name]
**Partner / Angel**: [Name]
**Fund**: [Fund name if VC]
**Date**: YYYY-MM-DD
**Priority weighting**: [Fundraising-first / Value-add-first / Stealth-Strategic]

---

## Investor profile snapshot

- **Check size**: [median] (based on last [N] deals)
- **Stage focus**: [Seed / Series A / etc.]
- **Geography**: [list]
- **Vertical**: [list]
- **Thesis**: [1-2 sentence summary from public sources]
- **Last 5 investments**: [brief list]

## Score by axis (1-5 with evidence)

### 1. Stage fit — Score: X/5 (weight XX%)

### 2. Check size fit — Score: X/5 (weight XX%)

**Their median**: $X
**Our round**: $Y
**Fit**: [expressed as overlap]

### 3. Thesis alignment — Score: X/5 (weight XX%)

**Our thesis**: [1 sentence]
**Their thesis**: [1 sentence]
**Overlap evidence**: [citation]

### 4. Geography / vertical — Score: X/5 (weight XX%)

### 5. Value-add depth — Score: X/5 (weight XX%)

---

## Weighted total

| Axis | Score | Weight | Weighted |
|---|---|---|---|
| Stage fit | X | XX% | X.XX |
| Check size fit | X | XX% | X.XX |
| Thesis alignment | X | XX% | X.XX |
| Geography / vertical | X | XX% | X.XX |
| Value-add depth | X | XX% | X.XX |
| **TOTAL** | — | **100%** | **X.XX / 5** |

---

## Red flags checklist

- [ ] **Portfolio conflict**: ¿invirtieron en direct competitor?
- [ ] **Recent thesis drift**: ¿cambió focus away from our space en últimos 6 meses?
- [ ] **Bad founder references**: ¿references negative on specific behaviors?
- [ ] **Process red flags**: ¿timeline lento históricamente? (>90 days decision cycle = pass)

If ANY red flag = **DISQUALIFY o approach con caution**.

---

## Warm intro path

**Direct**: [if we have connection]
**1st degree mutual**: [name + strength of relation]
**2nd degree path**: [chain + likelihood of ask]

**Recommendation**: [Cold email / Intro request / Event meet / Pass]

---

## Next step

[Specific action: "Draft intro email to [mutual] by YYYY-MM-DD"]
```

---

## Integración con chimeranext (via chimeranext-api-consumer agent)

**Disponible desde v0.5.0** — este skill puede invocar al agent `chimeranext-api-consumer` con las operaciones `get_investor_database` (listado candidate investors) y `get_investor_profile` (detail por investor). Ambas retornan `SPEC_GAP` hoy (los endpoints no están en la OpenAPI spec todavía) y el skill continúa con sources manuales (NVCA, Crunchbase, LAVCA, CSV upload). Cuando los endpoints lancen, el agente retornará `LIVE_DATA` sin cambios acá — el target list inicial se pre-popula con investors + check history + portfolio fit + Chimera Score weighting automáticamente. Cada `SPEC_GAP` que retorna el agente viene con un `SPIKE_SUGGESTION` listo para alimentar el skill `feature-to-spike`.

## Integración con otras skills

- **`startup-intake`**: source del `startup-profile.md` para thesis alignment + fundraising context
- **`cap-table-builder`**: post-match, post-commit, track dilution per investor check
- **`founder-documents`**: SAFE o Term Sheet (NVCA) generados después de soft-commit
- **`demo-day-prep`** (sibling): si es demo day investor, coordinate flow
- **`feature-to-spike`**: SPIKE para chimeranext si detectás matching gap o pattern útil
- **`venture-studio-toolkit:structure-decision`**: si venture es LATAM-based + US VC, needs Cayman Sandwich o Delaware flip first

## Principios clave

- **Target quality > quantity**: 15-20 well-researched investors > 100 spray-and-pray
- **Warm intros siempre que sea posible**: 10x response rate vs cold
- **Never negotiate alone**: especially first-time founders — bring advisor or counsel
- **Track every interaction**: response rate + time-to-response + pipeline velocity informan el próximo round
- **Investor quality affects the cap table forever**: bad investor > no investor
- **"No" es información útil**: si multiple top-tier pass with similar rationale, revisar pitch/deck/metrics

## Anti-patterns

- Mass cold emails (destroys reputation, signals desperation)
- Pitching investors outside stage/check size fit ("maybe they'll stretch")
- Starting fundraise without 8+ weeks runway to close (runway pressure = bad terms)
- Ignoring portfolio conflicts ("maybe they won't notice")
- Sharing deck publicly (securities law + competitive risk)
- No "no-shop" respecting if lead asked
- Negotiating one investor at a time (lose optionality + leverage)

## Recursos

- **[NVCA Member Directory](https://nvca.org/about-us/nvca-members/)** — US VC directory
- **[Crunchbase](https://www.crunchbase.com/)** — investor database + check history
- **[PitchBook](https://pitchbook.com/)** — professional-grade investor data
- **[LAVCA — LATAM VC Association](https://lavca.org/)** — LATAM investor directory
- **[CB Insights](https://www.cbinsights.com/)** — market intelligence + investor tracking
- **"Venture Deals"** (Brad Feld + Jason Mendelson) — essential reading for founder-investor negotiation
- **"Secrets of Sand Hill Road"** (Scott Kupor, Andreessen Horowitz) — VC insider perspective
- **[Twenty Minute VC Podcast](https://www.twentyminutevc.com/)** — investor thesis intelligence gathering
