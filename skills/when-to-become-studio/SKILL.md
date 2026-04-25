---
name: when-to-become-studio
version: 1.1.0
description: >
  Helps a serial entrepreneur decide whether to formalize their multi-venture
  operation into a Services Hub or a formal Venture Studio. Evaluates 3 operating
  modes (not binary): serial entrepreneur puro / services hub operator / formal
  studio with fund. Use when the user asks "when to become a studio", "serial
  entrepreneur vs studio", "systematize multi-venture", "formalize studio",
  "services hub readiness", "venture studio readiness", "/when-to-become-studio".
---

# When to Become a Studio (3 operating modes)

Ayuda a un serial entrepreneur a decidir **qué nivel de formalización** necesita su
operación multi-venture. No es decisión binary — son **3 modos distintos** según signals.

## Regla de idioma

Español.

## Directorio de salida

```
./portfolio/{founder-name}/
└── studio-readiness-assessment.md
```

---

## Los 3 modos (middle ground introducido en v1.1)

### Modo 1 — Serial entrepreneur puro

**Quién es**: persona con múltiples ventures personales sin methodology formal. Cada
venture es "suya", ad-hoc process de launching, no shared infrastructure formal.

**Structure típica**: Multi-LLCs independientes (ver `structure-decision` patrones 1-5).
Sin Services LLC central.

**Ejemplo**: founder con 2-3 startups, cada una en su propia LLC, operating independent.
Sin MSAs entre entidades. Shared services = "yo trabajo en los 3 personalmente".

### Modo 2 — Services Hub operator (NUEVO en v1.1)

**Quién es**: serial entrepreneur con methodology repetible + shared services formales
entre N ventures. Uses Services LLC central + bilateral MSAs. VC raises independent per
venture, sin plan de fund atado.

**Structure**: `structure-decision` patrón #6 (Services Hub + Independent Ventures) +
`services-hub-setup` skill para MSAs + transfer pricing.

**Ejemplo**: caso @lapc506 — 4 ventures personales (Altrupets, Vertivolatam, Habitanexus,
Aduanext) + LAPC506 Services LLC proveyendo shared dev/design/marketing/legal con MSA
bilateral per venture.

### Modo 3 — Formal venture studio con fund

**Quién es**: studio operator con track record cuantificable + plan de levantar LP
capital via fund atado. Management Co + GP entity + Fund LP stack completo.

**Structure**: `structure-decision` patrón #7 (Multi-LLC + Holding) + `attached-fund-structure`
skill para Management Co + GP + LP layered.

**Ejemplo**: studio con 2+ exits previos + plan de raise $5M LP fund para invertir en
~15 ventures nuevas.

---

## Serial entrepreneur vs. venture studio vs. services hub (diferencias clave)

**Serial entrepreneur puro**: persona con múltiples ventures personales. Cada venture es
"suya". Ad-hoc process de launching. No hay "systematic method".

**Services Hub operator**: persona con múltiples ventures + methodology repetible +
Services LLC central proveyendo shared services via MSAs. NO LP fund.

**Venture studio formal**: organización con systematic approach a creating ventures.
Metodología repetible, team dedicated, clear thesis, shared services, **plus LP fund
atado**. Ventures son "del studio" (al menos parcialmente).

---

## Signals que indicás estás listo para transitarlo

Marcar (✓ por cada signal positivo):

- [ ] **3+ ventures activas** (studios suelen tener al menos 3)
- [ ] **Methodology repetible**: podés describir los steps que seguís para lanzar una
      venture sin inventar cada vez
- [ ] **Team más allá de vos**: al menos 1-2 personas dedicadas al "studio work"
      (no solo a una venture específica)
- [ ] **Shared infrastructure**: mismos tools, procesos, frameworks between ventures
- [ ] **Time investment significativo**: dedicás >60% de tu tiempo a esto (no es
      side project)
- [ ] **Pipeline activo**: ideas nuevas constantemente evaluándose para launch
- [ ] **Track record mínimo**: al menos 2 ventures con revenue / users / evidence
- [ ] **Vision más amplia**: "quiero crear muchas empresas" vs. "quiero crear ESTA
      empresa"
- [ ] **Recursos para formalizar**: budget ≥ $20k para setup legal + operational

**Decisión** (updated v1.1 — 3 modes):

| Score | Recomendación | Siguiente skill |
|---|---|---|
| 0-4 ✓ | **Modo 1 — Serial entrepreneur puro** | Multi-LLCs via `structure-decision` (patrones 1-5). No formalizar más allá. |
| 5-7 ✓ | **Modo 2 — Services Hub operator** (NUEVO) | `services-hub-setup` skill + `structure-decision` patrón #6 |
| 8-9 ✓ + plan fund atado | **Modo 3 — Formal venture studio con fund** | `attached-fund-structure` skill + `structure-decision` patrón #7 |

### Reglas adicionales para routing correcto

- **Si score 5-7 pero con plan fund atado** → probablemente premature, validar que el
  fund atado es real (LP conversations iniciadas, NO solo aspiracional). Si no es real →
  stay en Services Hub hasta que track record + LP interest justifiquen fund.
- **Si score 8-9 pero SIN plan fund atado** → NO necesitás formal studio con Holding.
  Stay en Services Hub. Holding + Management Co overhead sin LP fund es waste.
- **Legacy interpretation (v1.0)**: "7-9 ✓ = listo para studio" era simplification binaria.
  En v1.1 differentiamos: la mayoría de "ready" are really Services Hub readiness (Modo 2),
  no formal studio con fund (Modo 3 requires fund-plan gate).

---

## Transiciones por modo

Los pasos de formalización **dependen del modo destino**. NO son genéricos — Modo 2 (Services Hub) y Modo 3 (Formal studio con fund) requieren infraestructura legal y operativa muy distinta.

### Transición hacia Modo 2 — Services Hub operator

Aplica si el scoring fue 5-7 ✓, o 8-9 ✓ sin plan fund atado real.

#### Paso 1: Legal formalization

- Ver skill `structure-decision` patrón #6 (Services Hub + Independent Ventures)
- Typically: 1 Services LLC central + N Venture LLCs independientes (una por venture)
- **NO holding, NO Management Co, NO fund entities** — la Services LLC es un vendor,
  no un shareholder

#### Paso 2: MSA + transfer pricing

- Ver skill `services-hub-setup` para:
  - MSA template bilateral (Services LLC ↔ cada Venture LLC)
  - SOW templates por service type
  - Transfer pricing cost-plus (5-10% markup típico)
  - IP assignment rider (crítico para evitar IP contamination)

#### Paso 3: Methodology (repetible sin fund)

- Documentar steps que seguís para launch cada venture
- Ideation, validation, team formation, launch, scale-or-kill
- El toolkit completo (`business-model-toolkit`, `ux-research-toolkit`,
  `venture-studio-toolkit`) es la base metodológica

#### Paso 4: Shared services operations

- Ver skill `shared-services-ledger` **variant Services Hub**
- Bilateral MSAs, NO consolidated reporting
- Time tracking + billing per venture

#### Paso 5: Governance (light)

- Portfolio review cadence — periodic ventures check-in
- NO quarterly LP reporting (no hay LP)
- Decision framework para kill/scale per venture independiente

---

### Transición hacia Modo 3 — Formal venture studio con fund

Aplica solo si el scoring fue 8-9 ✓ **Y** hay plan fund atado real (LP conversations iniciadas).

#### Paso 1: Legal formalization

- Ver skill `structure-decision` patrón #7 (Multi-LLC + Holding)
- Stack: Holding Co (parent) + Management Co + GP entity + Fund LP + N Venture Subsidiaries
- Management Co provee services; Holding owns equity en ventures

#### Paso 2: Fund structure

- Ver skill `attached-fund-structure` para:
  - Management Co + GP entity setup
  - Fund LP formation (Delaware LP más común, o Cayman para LATAM LPs)
  - LP subscription docs + PPM (Private Placement Memorandum)
  - Management fee (2% típico) + carry (20% típico)

#### Paso 3: LP-facing materials

- Ver skills `studio-thesis` (37-word thesis), `studio-focus` (Stage × Geography × Industry),
  `secret-sauce` (6-metric ranking)
- Required para LP fundraising + credibility

#### Paso 4: Methodology + systematic approach

- Misma base metodológica que Modo 2, pero escalada
- Track record quantificable para LP reporting

#### Paso 5: Shared services operations

- Ver skill `shared-services-ledger` **variant Full Studio**
- Centralized via holding, consolidated financial statements
- Transfer pricing evaluated at Holding level (often needs big 4 review)

#### Paso 6: Governance (heavy)

- **Quarterly LP reporting** (mandatory for fund compliance)
- Portfolio reviews con `three-horizons`, `innovation-scorecard`
- Kill/scale decisions con `cost-of-delay-cd3`, `improvement-kata`
- Annual audit (often required by LP subscription docs)

---

## Flujo del skill

### Paso 1 — Assessment

**WS-1**: "Vamos a evaluar tu readiness. Responder honestly each signal (9 preguntas)."

Presentar las 9 señales una a una. Track scores.

### Paso 2 — Verdict (3-mode routing)

**WS-2**: Basado en scores Y fund plan, enrutar al modo correcto:

- **0-4 ✓** → **Modo 1 — Serial entrepreneur puro**: "Quedate como serial entrepreneur con Multi-LLCs (patrones 1-5 de `structure-decision`). No necesitás más formalización por ahora. Re-evaluar en 6-12 meses."

- **5-7 ✓** (con o sin plan fund) → **Modo 2 — Services Hub operator** (NUEVO en v1.1): "Formalizá como Services Hub. Usar `structure-decision` patrón #6 + skill `services-hub-setup` para setup de MSAs + transfer pricing."

- **8-9 ✓ + plan fund atado REAL** (LP conversations iniciadas, NO solo aspiracional) → **Modo 3 — Formal venture studio con fund**: "Formalizá como studio completo. Usar `structure-decision` patrón #7 + skill `attached-fund-structure` para Management Co + GP + LP stack."

- **8-9 ✓ SIN plan fund atado real** → **Modo 2 — Services Hub operator**: "Tenés el readiness score pero sin fund plan, NO necesitás Holding overhead. Usá Services Hub. Re-evaluar a Mode 3 cuando haya LP conversations iniciadas."

### Paso 3 — Roadmap (si Mode 2 o Mode 3)

**WS-3**: Generar roadmap de transición según el modo:

**Si Mode 2 (Services Hub)**:
- `structure-decision` patrón #6 (Services Hub + Independent Ventures)
- `services-hub-setup` para MSA template + transfer pricing
- `shared-services-ledger` variant Services Hub

**Si Mode 3 (Formal studio con fund)**:
- `structure-decision` patrón #7 (Multi-LLC + Holding)
- `attached-fund-structure` para Management Co + GP + LP
- `studio-thesis` + `studio-focus` + `secret-sauce` para LP-facing materials
- `shared-services-ledger` variant Full Studio

### Paso 4 — Close-gaps plan (si Mode 1)

**WS-4**: Si 0-4 ✓, generar plan para cerrar gaps específicos hacia Mode 2. Re-evaluar en timeline realista (6-12 meses).

---

## Output

```markdown
# Studio Readiness Assessment — [Founder Name]

## Assessment date: YYYY-MM-DD

## Signals

| Signal | Status |
|---|---|
| 3+ ventures activas | ✓/✗ |
| Methodology repetible | ✓/✗ |
| Team más allá de vos | ✓/✗ |
| Shared infrastructure | ✓/✗ |
| Time investment >60% | ✓/✗ |
| Pipeline activo | ✓/✗ |
| Track record mínimo | ✓/✗ |
| Vision amplia | ✓/✗ |
| Recursos para formalizar | ✓/✗ |

**Score**: X/9

## Verdict

**Modo recomendado: [Modo 1 — Serial entrepreneur puro / Modo 2 — Services Hub operator / Modo 3 — Formal venture studio con fund]**

Rationale:
- Score: X/9
- Fund plan atado (real, con LP conversations iniciadas): [Yes / No / N/A]
- Routing aplicado: [0-4 → Modo 1 / 5-7 → Modo 2 / 8-9 + fund plan real → Modo 3 / 8-9 sin fund plan → Modo 2]

## [Si Modo 2 o Modo 3] Transition roadmap

Seguir el roadmap específico del modo:

### Si Modo 2 — Services Hub operator:
- `structure-decision` patrón #6 (Services Hub + Independent Ventures)
- `services-hub-setup` para MSA template + transfer pricing + IP assignment rider
- `shared-services-ledger` variant Services Hub (bilateral MSAs, NO holding)

### Si Modo 3 — Formal venture studio con fund:
- `structure-decision` patrón #7 (Multi-LLC + Holding)
- `attached-fund-structure` para Management Co + GP + Fund LP stack
- `studio-thesis` + `studio-focus` + `secret-sauce` para LP-facing materials
- `shared-services-ledger` variant Full Studio (centralized via holding)

[Steps específicos con deadlines]

## [Si Modo 1] Gaps to close hacia Modo 2

1. [Gap]: [plan + timeline]
2. [Gap]: [plan + timeline]

**Re-assessment date**: [date realista, 6-12 meses]

## Notes

[Observations particulares sobre tu caso — incluyendo si el fund plan es aspiracional vs real, si hay edge cases del routing, etc.]
```

---

## Principios clave

- **Studio formalization requires critical mass**: <3 ventures = premature
- **Methodology repetible es el key signal**: si cada venture se lanza ad-hoc, no es studio
- **Shared services > shared vibes**: infrastructure shared concretely
- **Time investment >60%**: studio is a full-time endeavor, not side hustle
- **Re-assess annually**: readiness changes

## Anti-patterns

- Calling yourself "studio" con 1 venture → marketing sin substance
- Formalizar demasiado temprano → overhead kills velocity
- Never formalizar aunque ready → miss benefits (LP credibility, shared services efficiency)

## Integración con otras skills

- **`structure-decision`**: si ready, estructura legal del studio
- **`studio-thesis`**: si ready, thesis articulation
- **`liability-contagion-analysis`**: informa if single-LLC viable durante transición
- **Toolkit completo**: studio formalization = adopting methodology del toolkit

## Recursos

- **GSSN (Global Startup Studio Network)** — community of formal studios
- **Govclab** — [How to build a venture studio](https://govclab.com/2023/04/25/how-to-build-a-venture-studio/)
- **Serial Entrepreneur Mindset** — research sobre founders who've done this transition
