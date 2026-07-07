---
name: feature-to-spike
version: 0.1.0
description: >
  Transforms methodology learnings from dog-food sessions of launchpad-toolkit
  into Linear SPIKE issues formatted for William Ugalde (chimeranext Launchpad
  owner). This is the plugin's DIFFERENTIATOR — the piece that makes
  launchpad-toolkit a "methodology laboratory" not just a founder tool.
  Use when the user asks "propose spike", "generate spike", "feature to
  spike", "productize this", "send to William", "/feature-to-spike".
---

# Feature-to-Spike

**Este skill es el differentiator de launchpad-toolkit**. Transforma un learning del dog-food (ej: "el startup-intake tiene un flow donde preguntar X después de Y produce respuestas 3x más detalladas") en un Linear SPIKE issue formateado para que William Ugalde lo evalúe y eventualmente productize en chimeranext Launchpad.

Sin este skill, launchpad-toolkit sería solo otra herramienta founder-facing. Con este skill, se convierte en un **prototyping lab metodológico** con loop explícito: metodología → dog-food → SPIKE → chimeranext feature.

## Regla de idioma

**Issue body en inglés** (convención chimeranext Linear). Interacción con el usuario en español.

## Directorio de salida

```
./launchpad/spikes/
├── YYYY-MM-DD-{spike-slug}.md       # Drafted SPIKE (before filing)
└── YYYY-MM-DD-{spike-slug}-filed.md # Post-filing (includes Linear URL)
```

---

## Loop metodología → chimeranext feature

```
┌─────────────────────┐
│ 1. User uses        │
│    launchpad-       │
│    toolkit skill    │ ◄────────── External founder or internal dog-food
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 2. Methodology      │
│    learning emerges │
│    (UX pattern,     │
│     flow improve-   │
│     ment, missing   │
│     feature, etc.)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 3. feature-to-spike │
│    transforms       │ ◄────────── THIS SKILL
│    learning into    │
│    SPIKE issue      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 4. William evaluates│
│    SPIKE, decides   │
│    scope/priority   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 5. chimeranext Launchpad │
│    feature shipped  │
│    (OR skill iterated│
│    if SPIKE rejected)│
└─────────────────────┘
```

Ver `references/productization-workflow.md` para detalle del workflow.

---

## ¿Qué es un good SPIKE para launchpad?

Un SPIKE útil para productizar en chimeranext Launchpad tiene **4 características**:

1. **Concrete pattern** — no "William debería revisar UX" sino "founders en stage=Ideation con industry=fintech tienen 60% más engagement cuando el intake pregunta traction signals ANTES de competitive landscape"
2. **Dogfood evidence** — claim fundamentado en ≥1 sesión de dog-food con artefactos generados (startup-profile.md, etc.)
3. **Productization hypothesis** — una idea concreta de cómo productizarlo en chimeranext (UI flow, data model change, algorithm tweak...)
4. **Acceptance criteria** — cómo William puede validar si la hipótesis funciona post-implementation

SPIKES que NO cumplen estas 4 son mejores como notes o user feedback, no como SPIKE formal.

---

## Flujo del skill

### Paso 1 — Identificar el learning

**FTS-1**: "¿Qué aprendiste del dog-food que podría valer productizarse en chimeranext Launchpad? Describílo en 1-2 oraciones (el 'concrete pattern')."

Validar que el pattern es concreto y specific. Si vago → re-prompt: "¿Podés dar un ejemplo concreto del pattern en acción?"

### Paso 2 — Evidence gathering

**FTS-2**: "¿Qué artefactos o sesiones de dog-food soportan este learning?
- Skill(s) usado(s): [startup-intake / cap-table-builder / etc.]
- Artifact(s) generado(s): [path a `.md` archivos]
- Observación específica: [qué viste]
- Startup(s) involucradas: [nombres o anonymizado si confidential]"

### Paso 3 — Productization hypothesis

**FTS-3**: "¿Cómo te imaginás productizarlo en chimeranext Launchpad? Describí:
- Qué component(s) se tocarían: [UI / API / data model / matching algorithm]
- Cambio concreto: [ej: 'reordenar sections del intake form', 'agregar field X al Startup Profile schema', 'incluir Y en co-founder matching weight']
- Alternativas consideradas: [brief]"

### Paso 4 — Acceptance criteria

**FTS-4**: "¿Cómo validaría William si funcionó post-implementation? Definí ≥2 criterios measurables:
- Metric: [ej: intake completion rate, profile quality score, matching accuracy]
- Threshold: [cuánto mejora vs baseline]
- Timeline: [cuándo medir]"

### Paso 5 — Priority + scope

**FTS-5**: "En tu opinión:
- Priority (Urgent/High/Normal/Low): [default = Normal]
- Est. scope (S/M/L/XL): [S = 1 session, L = 3-5 sessions]
- Blocking dependencies: [ej: requires chimeranext API by @garbanzo, blocked on X]"

### Paso 6 — Generate SPIKE draft

**FTS-6**: Generar `./launchpad/spikes/YYYY-MM-DD-{spike-slug}.md` con el template de output.

**FTS-7**: "¿Filear el SPIKE en Linear ahora, o revisás el draft primero?
- Opción A: File ahora (requiere Linear MCP o gh CLI con Linear integration)
- Opción B: Solo genero el draft, vos lo fileás manualmente cuando estés listo"

---

## Output template

Generar `./launchpad/spikes/YYYY-MM-DD-{spike-slug}.md`:

```markdown
# SPIKE: [Short title — what to investigate/productize]

**Target assignee**: William Ugalde (Launchpad pillar owner)
**Suggested labels**: spike, launchpad, methodology-prototype
**Priority**: [Urgent / High / Normal / Low]
**Est. scope**: [S / M / L / XL]

---

## Context

Methodology learning from dog-food of `launchpad-toolkit`. This SPIKE proposes productizing a pattern validated via prototype in the plugin — reducing productization risk for chimeranext Launchpad.

**Concrete pattern observed**:

[1-2 sentences, specific + measurable]

---

## Dogfood evidence

### Skill(s) used

- [Skill name(s) from launchpad-toolkit]

### Artifact(s) generated

- [Path to `.md` artifact, ideally linked or attached]

### Observation

[What was observed — quote artifacts or specific outputs if helpful]

### Startup(s) involved

[Name or anonymized "Founder A, stage=MVP, industry=fintech"]

---

## Productization hypothesis

### Component(s) to change in chimeranext Launchpad

- [UI / API / data model / matching algorithm / etc.]

### Concrete change proposed

[ej: "Reorder intake form sections: Traction before Competitive to match observed dogfood pattern"]

### Alternatives considered

[Brief rejection rationale for other options]

---

## Acceptance criteria

- [ ] **Metric**: [ex: intake completion rate]
- [ ] **Threshold**: [ex: +15% vs baseline measured in 2-week cohort]
- [ ] **Timeline**: [ex: measure 30 days post-feature-ship]

- [ ] **Metric**: [second criterion]
- [ ] **Threshold**: [threshold]
- [ ] **Timeline**: [timeline]

---

## Dependencies / prereqs

- [List blocking dependencies — ex: "requires chimeranext API by @garbanzo" or "none"]

---

## Links

- **launchpad-toolkit SKILL**: [link to SKILL.md that generated the learning]
- **Artifact(s)**: [link to `.md` output(s)]
- **Related DOJ issues**: [parent SPIKE legacy-ticket, sibling issues if any]

---

Created by Claude Code via `launchpad-toolkit:feature-to-spike`, on behalf of @lapc506.
```

---

## Integración con Linear

### Vía Linear MCP (recomendado)

Si Linear MCP está configurado (`mcp__linear-server__save_issue`), el skill puede filear el SPIKE directamente:

```
mcp__linear-server__save_issue(
  team="chimeranext",
  project="Launchpad",
  parentId="legacy-ticket",           # Parent SPIKE for launchpad-toolkit
  assignee="william@chimeranext.io",
  title="SPIKE: [title]",
  description="[generated body]",
  labels=["Spike", "Explore", "M"],
  priority=3,
  state="Triage"                  # Let William move to In Progress when ready
)
```

### Vía gh + Linear sync

Si gh CLI está disponible pero Linear MCP no, generar issue body + prompt user para filear manualmente con el slug `andres/doj-XXXX-{slug}`.

### Vía copy-paste

Si ningún tooling disponible, output puro markdown para que usuario copie-pega en Linear web UI.

---

## Principios clave

- **NO crear issues sin confirmación explícita** — default es generar draft, filear solo si user dice "sí"
- **William como default assignee** (ID Linear: `8f14370d-3602-49e3-81f2-eeb05b965687`; email: `william@chimeranext.io`)
- **Parent issue = legacy-ticket por default** — mantiene trazabilidad con el tracking SPIKE del plugin
- **Labels consistentes**: `spike`, `launchpad`, `methodology-prototype` — William filtra por estos
- **No escalate prematurely**: si el learning es débil, sugerir "keep dogfooding más antes de SPIKE"

## Anti-patterns

- SPIKEs vagos tipo "mejorar UX" — rechazar, pedir specific pattern
- SPIKEs sin acceptance criteria — no hay forma de validar post-implementation
- Crear issues bypaseando William → viola ownership del pillar (ver feedback memory)
- Usar SPIKE format para feature requests — si es clear feature (no investigation), debería ser feature issue, no SPIKE

## Integración con otras skills

- **Input usuario de cualquier skill de launchpad-toolkit** → si durante uso detectan un productization candidate, invocar `feature-to-spike`
- **`startup-intake`**: learnings sobre preguntas que funcionan mejor
- **`cap-table-builder`** (v0.2): learnings sobre edge cases del vesting calculator
- **`cofounder-matching`** (v0.2): learnings sobre weighting del algoritmo

## Recursos

- **chimeranext Launchpad pillar ownership** (Slack 2026-04-10 `#C0AKTN24C91`)
- **Parent tracking SPIKE**: [legacy-ticket](https://linear.app/chimera-coding/issue/legacy-ticket)
- **Productization workflow doc**: `references/productization-workflow.md`
