# Productization Workflow — launchpad-toolkit → chimeranext Launchpad

Este documento explica **cómo fluye** una idea metodológica desde el plugin hacia una feature shipped en el producto chimeranext Launchpad. Es la razón de existir del plugin como "methodology laboratory".

## TL;DR

```
launchpad-toolkit plugin          chimeranext Launchpad product
├── skill ships v0.X              ├── feature shipped v1.X
│      │                          │      ▲
│      ▼                          │      │
│   dog-food                      │   engineering
│      │                          │      ▲
│      ▼                          │      │
│   learning emerges              │   William triages
│      │                          │      ▲
│      ▼                          │      │
│   feature-to-spike  ───────────►│   SPIKE in Linear
                                       (parent legacy-ticket)
```

El plugin valida metodología **antes** de que William comprometa engineering time en chimeranext.

## Por qué este workflow existe

### Problema anterior

Sin este workflow, la metodología del Launchpad pillar se diseña dentro del product code. Esto significa:

- **Iteration slow**: cada cambio de UX/flow requiere engineering ticket, code review, deploy
- **Risk alto**: features que no funcionan se descubren **después** de shipping
- **Founder feedback indirecto**: los founders no tienen canal para feedback metodológico, solo bug reports

### Solución: metodología-first en plugin

El plugin permite:

- **Rapid iteration** — cambiar un SKILL.md y re-dogfoodear inmediatamente (no deploy cycle)
- **Risk mitigation** — patterns que no funcionan se descartan en el plugin, nunca llegan a chimeranext
- **Direct founder feedback** — founders que usan el plugin dan feedback metodológico por diseño
- **Multi-source learning** — chimeranext team dogfooding + external founders dogfooding = mayor volumen de learnings

## Los 5 pasos del workflow

### 1. Usuario invoca skill del plugin

External founder o internal team member invoca un skill (ej: `startup-intake`, `cap-table-builder`, etc.).

El skill:
- Estructura interview / flow / cálculo
- Genera artifact(s) en `./launchpad/{startup-slug}/...`

### 2. Learning emerge

Durante o post-uso del skill, emerge un pattern:

**Ejemplos de patterns válidos para SPIKE**:
- "Founders stage=Ideation responden más en profundidad cuando intake pregunta problem antes de solution"
- "Cap table builder necesita edge case: founder que ya filed 83(b) en otra startup"
- "Co-founder matching tiene falso positivo alto cuando founder pide 'any technical co-founder' sin specs"

**NO válidos**:
- "La UX debería ser más bonita" (no específico)
- "Deberíamos tener un cap table builder" (ya está scoped en legacy-ticket)

### 3. feature-to-spike skill transforma learning en SPIKE

El skill `feature-to-spike` estructura el learning en formato Linear SPIKE issue:
- Concrete pattern + evidence
- Productization hypothesis
- Acceptance criteria
- Parent = legacy-ticket
- Assignee = William Ugalde
- Labels = spike, launchpad, methodology-prototype

El skill **no crea el issue automáticamente** — genera draft + pregunta al user si filear.

### 4. William triages en Linear

SPIKE aparece en William's queue (asignado a él). William:
- Lee el pattern + evidence
- Evalúa productization hypothesis
- Decide scope + priority:
  - **Accept + Implement**: mueve a In Progress, ships en chimeranext roadmap
  - **Accept + Park**: acepta la idea pero park hasta que dependencies existan
  - **Reject**: rechaza con rationale → plugin iterates skill o descarta pattern

### 5. Feature ships en chimeranext (o skill itera)

**Si accepted + implemented**: chimeranext Launchpad ship la feature, plugin puede archivar el prototype skill o mantenerlo sincronizado como regresión test.

**Si rejected**: plugin skill itera el pattern (mejora flow, ajusta output, etc.) o descarta si no había señal real.

## Ownership matrix

| Rol | Plugin (launchpad-toolkit) | chimeranext Launchpad product |
|---|---|---|
| **Andrés Peña** | Owner metodología + skill development | — |
| **William Ugalde** | Consumer SPIKEs + dog-food internal | **Owner pillar** — engineering, UX, product |
| **Daniel Garbanzo** | chimeranext API consumer (future) | **Owner chimeranext API** — consumed by plugin agents |
| **External founders** | Dog-food users + feedback source | Eventually end users of chimeranext product |

## Qué cuenta como "duplicación aceptable"

**ACEPTABLE** (by design):
- Skills del plugin implementan features que chimeranext ya tiene → el plugin es lab metodológico
- `startup-intake` skill + chimeranext Launchpad intake UI: ambos existen, plugin prototipa next version
- `cap-table-builder` skill + chimeranext Launchpad cap table feature: lo mismo

**NO aceptable** (redundant — evitar):
- Plugin skills que operan a **portfolio-level** → ese scope pertenece a `venture-studio-toolkit`
- Plugin skills que hacen **customer research** → pertenece a `ux-research-toolkit`
- Plugin skills que hacen **business model design** → pertenece a `business-model-toolkit`

Plugin = single-venture launchpad journey **MICRO**. Nothing else.

## Cadencia esperada

- **Fase 0 — bootstrap** (actual, v0.1): 2 skills shipped (`startup-intake` + `feature-to-spike`), William evalúa
- **Fase 1 — validación** (v0.2): expandir a 4 skills (+ `cap-table-builder` + `founder-documents`), primera batch de SPIKEs
- **Fase 2 — maturity** (v0.3): 8 skills completos + `chimeranext-api-consumer` agent (pending chimeranext API)
- **Fase 3 — productization** (v1.0): plugin skills son estables, loop SPIKE → feature funciona regularmente, William ha shipped ≥3 features validadas en plugin

## Métricas de éxito del plugin

No son las mismas que métricas del product (chimeranext Launchpad). Para el plugin:

- **# SPIKEs filed vía `feature-to-spike`** (por mes)
- **# SPIKEs accepted by William** (rate vs filed)
- **# chimeranext Launchpad features shipped que originaron en plugin SPIKEs**
- **# external founders using plugin** (indicador de dual-purpose funcionando)
- **Time saved**: engineering hours chimeranext ahorrados al descartar patterns débiles en plugin

## Límites del workflow

- **NO replace product research**: el plugin no reemplaza customer interviews, usability testing, etc. Es complementary
- **NO replace William's judgment**: William acepta/rechaza SPIKEs según chimeranext product vision — el plugin propone, no decide
- **NO block chimeranext roadmap**: si chimeranext tiene feature urgent, no espera a plugin prototype
