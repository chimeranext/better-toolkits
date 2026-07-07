---
name: demo-day-prep
version: 0.3.0
description: >
  Demo Day preparation workflow — from application write-up (YC, Techstars,
  etc.) to pitch deck (10-slide standard) to pitch script (3-min standard)
  to Q&A prep. Produces deck.md, script.md, qa-bank.md, application.md
  artifacts. Methodology-driven (adapted from YC, Techstars, chimeranext
  demo day patterns); standalone — can later consume chimeranext demo day queue
  via chimeranext-api-consumer agent. Use when the user asks "demo day prep",
  "pitch deck", "pitch script", "demo day application", "accelerator
  application", "pitch rehearsal", "Q&A prep", "/demo-day-prep".
---

# Demo Day Prep

Prepara un founder para **Demo Day** — el evento más high-stakes del early-stage journey. Cubre 4 artefactos:

1. **Application** (YC / Techstars / cualquier accelerator que requiera written apply)
2. **Pitch deck** (10-slide standard para VC demo days)
3. **Pitch script** (3-min spoken script coordinado con deck)
4. **Q&A bank** (50+ preguntas anticipadas + respuestas preparadas)

## ⚠️ Disclaimer

- Demo Day es **one-shot event** per cohort — preparation quality correlates direct con fundraising outcome
- Este skill genera **structured preparation material**, NO sustituye:
  - Rehearsal con real humans (record + review; iteration crítica)
  - Feedback from experienced demo day judges o investor advisors
  - Legal review de financial claims + forward-looking statements
  - Deck design polish (Figma / Canva / professional designer)

## Regla de idioma

Español para interacción + preparation. **Deck + script final** pueden ser en inglés si demo day es US-based + international investors expected.

## Directorio de salida

```
./launchpad/{startup-slug}/demo-day/
├── application.md                      # Application form write-up (YC, Techstars, etc.)
├── deck-outline.md                     # 10-slide outline with speaker notes
├── script.md                           # 3-min spoken script (coordinated with deck)
├── qa-bank.md                          # 50+ anticipated Q&A
├── rehearsal-log.md                    # Rehearsal iteration log (round N feedback)
└── one-pager.md                        # 1-page PDF-ready summary for post-event handout
```

---

## 4 artefactos core

### 1. Application (si aplica)

Typically required by:
- Y Combinator (~5000 words, heavily structured)
- Techstars (~2000 words, accelerator-specific)
- 500 Startups, Plug and Play, local accelerators (varies)

**Structure standard** (adaptada por accelerator):

- Company name + tagline
- Founders (backgrounds, equity split, commitment)
- Problem (customer-centric, 1-2 paragraphs)
- Solution (what we built, 1 paragraph)
- Traction (quantitative metrics, specific)
- Market (TAM/SAM/SOM + bottom-up validation)
- Competition (direct + indirect, differentiation)
- Business model (revenue streams, unit economics)
- Why now (timing rationale)
- Ask (money raising, use of funds)

**Critical**: application review para filter — must be tight, no fluff. Average reader spends 3-5 min.

### 2. Pitch deck — 10 slides standard

Canonical 10-slide structure (adaptable by accelerator):

1. **Title**: logo + tagline (≤8 words) + founder names
2. **Problem**: concrete customer story, quantified pain
3. **Solution**: what we built, 1-line core value prop
4. **Traction**: 2-3 key metrics with trajectory chart
5. **Market**: TAM/SAM/SOM, bottom-up
6. **Business model**: revenue streams, unit economics snapshot
7. **Competition**: 2×2 matrix or feature comparison
8. **Team**: founders + key advisors, why we'll win
9. **Why now**: market/tech/regulatory timing signal
10. **Ask**: $X raising, use of funds, runway bought, milestones to next round

Some accelerators require deck <10 slides (e.g., YC wants ~5 for the initial pitch). Adapt.

### 3. Pitch script — 3-min standard

Pacing:
- 3 min = 400-450 words spoken at natural pace
- Each slide gets ~18-20 seconds
- Final 30 sec reserved for ask + call-to-action

**Structure**:
- **Hook** (first 15 sec): specific customer story that demonstrates pain
- **Problem + Solution** (45 sec): what's broken + what we built
- **Traction** (30 sec): 2-3 metrics with "because X..." rationale
- **Market** (20 sec): TAM size + why bottom-up is credible
- **Business model** (20 sec): how we make money, unit economics
- **Competition** (20 sec): why we win
- **Team** (20 sec): why these people will execute
- **Why now** (10 sec): tight window rationale
- **Ask** (30 sec): $X for Y milestones, closing line

**Delivery rules**:
- NO jargon without immediate definition
- NO superlatives without quantification ("fastest growing" without data = instantly dismissed)
- Practice WITHOUT deck first (deck should complement, not drive)
- Record + review — detect filler words, weak transitions

### 4. Q&A bank — 50+ questions

Categorize anticipated questions:

**Market (10 questions)**:
- "What's your TAM bottom-up?"
- "Why is the market growing / why will it grow?"
- "Who's the largest competitor and why don't they already do this?"
- etc.

**Product (10 questions)**:
- "What's the core technical innovation?"
- "What would a competitor need to replicate this?"
- "Is there a data moat forming?"
- etc.

**Traction (10 questions)**:
- "What's the growth rate month-over-month?"
- "Which channels are working? Which aren't?"
- "What's your CAC and LTV? How confident are you?"
- etc.

**Team (5 questions)**:
- "Why are you the founder to solve this?"
- "What are your gaps and hiring plans?"
- "How did you meet your co-founders?"

**Business model (10 questions)**:
- "What's your revenue per customer?"
- "Where's margin expansion coming from?"
- "How do you price and how did you arrive at that?"

**Fundraising (5 questions)**:
- "What's your runway?"
- "How much are you raising and at what valuation?"
- "Who's already committed?"
- "What milestones does this raise unlock?"

---

## Flujo del skill

### Paso 1 — Load context + demo day target

**DD-1**: "Vamos a preparar tu Demo Day. Primero contexto:

1. `startup-profile.md` existente? Si sí, lo leo.
2. `cap-table.md` existente? (para ask slide + ownership context)
3. **Target demo day**:
   - Name: [YC / Techstars / local accelerator / internal investor day]
   - Date: [YYYY-MM-DD]
   - Audience: [general VC / sector-specific / geography-specific]
   - Format: [stage presentation / 1:1 meetings / video submission]
   - Time limit: [3 min / 5 min / 10 min]
4. **Application required**: yes/no? If yes, which questions/format?"

### Paso 2 — Application draft (if required)

**DD-2**: Si hay application, generar `application.md` siguiendo la structure del accelerator + inputs del startup profile. Incluir:

- Version para el founder edit (markdown)
- Word count tracker (must fit accelerator limits)
- Highlights section — strongest 3 bullets to ensure reviewer sees immediately

### Paso 3 — Deck outline + speaker notes

**DD-3**: Generar `deck-outline.md` con 10 slides:

- Por slide: headline + 2-3 bullet points + chart/visual description + speaker notes
- Cross-reference a datos específicos del startup profile (traction numbers, market data)
- Flag slides que requieren design polish (professional chart, custom visual)

### Paso 4 — Pitch script

**DD-4**: Generar `script.md` coordinado con deck:

- Word-by-word script (400-450 words for 3-min)
- Timing markers per slide
- Delivery cues (pauses, emphasis, transitions)
- Alternate openings (3 hooks to A/B test in rehearsal)
- Alternate closes (2 ask framings)

### Paso 5 — Q&A bank generation

**DD-5**: Generar `qa-bank.md` con 50+ Q&A:

- Por categoría (Market/Product/Traction/Team/Business Model/Fundraising)
- Question + prepared answer (30-60 sec spoken)
- Follow-up question chain (si te preguntan X y respondés Y, probable follow-up Z)
- Red flag questions — questions que si las responden mal torpedoan el momentum

### Paso 6 — One-pager handout

**DD-6**: Generar `one-pager.md` — resumen de 1 página para post-event handout:

- Logo + contact info
- 3 key metrics
- 1-line problem + 1-line solution
- 2-3 "why now" points
- Ask (specific, include link to data room / deck)
- QR code if possible (link to full deck)

### Paso 7 — Rehearsal log

**DD-7**: Iniciar `rehearsal-log.md` — track iterations:

- **Round 1**: solo rehearsal (video record + self-review)
  - Weak points detected
  - Timing issues
- **Round 2**: con co-founder/advisor feedback
- **Round 3**: con externa (founder friend + potential investor)
- **Round 4**: full dress rehearsal incluyendo Q&A bank
- **Round 5+**: polish until natural pacing

**Recommended**: mínimo 5 rounds + 3 different audiences.

---

## Output template — deck-outline.md (preview)

```markdown
# Pitch Deck Outline — [Startup Name]

**Demo Day**: [Accelerator]
**Date**: YYYY-MM-DD
**Time limit**: [3 min]
**Audience**: [profile]

---

## Slide 1 — Title

**Visual**: Logo (large, centered) + tagline
**Tagline**: [≤8 words, value-prop clear]
**Founders**: [F1] + [F2]

**Speaker notes (0:00-0:15)**:
"Hola, soy [name], CEO de [startup]. [Hook — specific customer moment]."

---

## Slide 2 — Problem

**Visual**: Customer photo / quote / data point
**Headline**: [specific pain, quantified]

**Bullets**:
- [Bullet 1 con datos específicos]
- [Bullet 2 con market validation]
- [Bullet 3 con urgency signal]

**Speaker notes (0:15-0:45)**:
"[30-sec storytelling del pain point]"

---

## Slide 3 — Solution

[continues same format for all 10 slides]
```

---

## Rehearsal best practices

### The 5-5-5 rule

- **5 rounds minimum** before going live
- **5 different audiences** (solo, co-founder, advisor, external founder, real investor)
- **5 iterations** per section (refine slide X 5 times based on feedback)

### What to look for in rehearsals

- **Pacing**: Hit 2:45 consistently (leaves 15 sec buffer for stage transitions)
- **Filler words**: count "umm", "like", "basically", "actually"
- **Eye contact**: look at camera / audience, NOT at deck
- **Confident posture**: stable stance, controlled hand gestures
- **Energy**: varied delivery — not monotone, not shouty
- **Weak transitions**: listen for "and then..." or "so..." as crutch words

### Record + watch back

- Record every rehearsal (phone camera is sufficient)
- Watch the playback WITHOUT audio first (body language only)
- Watch with audio but without video (delivery only)
- Watch complete
- Take notes; identify top 3 improvements per iteration

---

## Output template — script.md (preview)

```markdown
# Pitch Script — [Startup Name]

**Target duration**: 3:00
**Word count**: 430 words (@ 143 wpm)
**Last rehearsal**: [YYYY-MM-DD, duration achieved]

---

## [0:00-0:15] Hook

> "La última vez que [specific scenario], [specific customer type] tuvo que [painful action] porque [root cause]. Esto le pasa a [N number] personas cada [time period]."

**Delivery**: Direct eye contact, medium pace, no notes visible.

## [0:15-0:45] Problem deepening

> "[Continuation of pain with quantification + why current solutions fail]"

**Delivery**: [next slide cue]

[... continues through all sections]

## [2:30-3:00] Ask + close

> "Estamos raising $[X] at $[Y] post-money para [specific milestones — e.g., reach $X MRR, hire N people, expand to Y markets]. Si esto te resuena, me encantaría hablar 15 min después. Gracias."

**Delivery**: Slow down on ask, make eye contact with judges, confident pause before "Gracias".
```

---

## Integración con chimeranext (future)

Cuando el chimeranext API esté disponible:

- Pull demo day queue assignments del user desde chimeranext
- Sync rehearsal artifacts al chimeranext demo day portal
- Use chimera-Score para identify weak areas que need extra rehearsal time

Standalone hasta entonces.

## Integración con otras skills

- **`startup-intake`**: source del startup-profile.md para context
- **`cap-table-builder`**: ask slide needs accurate ownership + dilution impact
- **`investor-matching`**: Q&A prep informed by what target investors ask historically
- **`feature-to-spike`**: si durante prep se descubre pattern (ej. "3-slide deck outperforms 10-slide in video demo days"), generar SPIKE

## Principios clave

- **Deck complements, not drives**: script must hold up without slides
- **Specific > abstract**: "We have 47 paying customers" beats "We have strong traction"
- **Customer stories > stats**: open with concrete pain moment, anchor to data
- **Ask is specific**: "$1.5M at $10M post-money for 18-month runway to $500k MRR" beats "We're raising"
- **Rehearse to 2:45, live at 3:00**: buffer for nerves and stage transitions
- **Q&A prep is 50% of the work**: judges remember your Q&A more than your pitch
- **Record every iteration**: delta between round 1 and round 5 is massive

## Anti-patterns

- Reading off slides (death)
- Fitting 5 minutes of content into 3 minutes by speaking faster (unintelligible)
- Overloading slides with text (should be <20 words per slide)
- Stats without source or timeframe ("1M users" — in what period?)
- Ask slide is vague or too late (must be in final 30 sec)
- No one-pager handout (investors forget names within 1 hour)
- Rehearsing alone indefinitely (feedback loop is critical)
- Arguing with judges during Q&A (even if they're wrong, concede gracefully)
- Checking notes during pitch (signals unpreparedness)

## Recursos

- **[Y Combinator — How to Apply + Demo Day tips](https://www.ycombinator.com/resources)**
- **Guy Kawasaki — 10/20/30 rule**: 10 slides, 20 min, 30-pt font
- **[Founder Institute — Pitch Deck Template](https://fi.co/)**
- **[Pitch Anything](https://www.oren-klaff.com/pitch-anything/)** (Oren Klaff) — behavioral selling framework
- **[DemoDay.vc — Accelerator pitch database](https://demoday.vc/)** — watch past demo day recordings
- **[The Pitch Podcast](https://thepitch.show/)** — listen to real investor Q&A dynamics
