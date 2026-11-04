---
name: studio-archetype-selector
version: 1.0.0
description: >
  Helps the studio operator choose between the 3 studio archetypes from govclab:
  In-house, External partnership, Hybrid. Brief edge-case skill — usually
  embedded in studio-thesis setup but available standalone when archetype
  decision is the primary question. Use when the user asks "studio archetype",
  "in-house vs external", "venture builder model", "hybrid studio",
  "/studio-archetype-selector".
---

# Studio Archetype Selector

Ayuda al operador a elegir entre los **3 archetypes de venture studio** identificados
por govclab.

## Regla de idioma

Español.

## Directorio de salida

```
./portfolio/{studio-name}/
└── archetype-decision.md
```

---

## Los 3 archetypes (govclab)

### 1. In-house Studio

**Definición**: el studio crea startups internamente usando domain expertise propia.
Founding team sale del studio, ventures nacen dentro y luego se spin-out.

**Ejemplos**: BCG Digital Ventures, Atomic (founded by Bill Gross), Rocket Internet.

**Fit**: cuando el studio tiene deep vertical expertise y puede identificar
opportunities desde insider knowledge.

**Pros**:
- Control total sobre ideation
- Cultura consistente
- IP capture clean (todo es del studio inicialmente)
- Team stability (GPs know each other)

**Cons**:
- Hiring caro (buscar founders externos pagos)
- Scale limited por GP bandwidth
- Group-think risk (todos piensan igual)

### 2. External Partnership

**Definición**: el studio co-crea con entrepreneurs externos que tienen ideas pero
necesitan capital + infrastructure del studio.

**Ejemplos**: Founders Factory, betaworks, Highbeam.

**Fit**: cuando el studio quiere scale without hiring founders, y tiene network strong
para atraer entrepreneurs.

**Pros**:
- Entrepreneurs bring own ideas + drive
- Scale via partnership velocity
- Diverse thought (no group-think)
- Studio stake via partnership terms

**Cons**:
- Less control sobre thesis alignment
- Partnership terms disputes
- IP questions más complejos
- Entrepreneur retention risk

### 3. Hybrid

**Definición**: mezcla — el studio hace both. Algunas ventures nacen in-house, otras
vienen de external partnerships.

**Ejemplos**: Human Ventures, Prehype, Expa.

**Fit**: cuando el studio ya maduró y quiere max optionality.

**Pros**:
- Diversify deal flow
- Learn from both models
- Flexible strategy

**Cons**:
- Más complejo operacionalmente
- Requiere both skill sets
- Thesis puede diluirse

---

## Flujo del skill (5 preguntas)

**SA-1**: "¿Cuál describe mejor al team del studio hoy?
- (a) Domain experts — conocemos el sector profundamente, tenemos insights únicos
- (b) Network operators — tenemos network strong, acceso a talent y deal flow
- (c) Both — experts Y networkers"

**SA-2**: "¿Cómo querés generar ideas de venture?
- (a) Internalmente, basadas en research propia + insights del studio
- (b) Externamente, entrepreneurs nos vienen con ideas
- (c) Both, según oportunidad"

**SA-3**: "¿Qué velocity de launch esperás?
- (a) 1-3 ventures/año (in-house tempo)
- (b) 5-10 ventures/año (partnership tempo)
- (c) Flexibilidad"

**SA-4**: "¿El studio tiene capital enough para hiring founders internos?
- Yes → In-house viable
- No → External partnership es casi mandatory
- Mixed → Hybrid"

**SA-5**: "¿Tu track record de Secret Sauce se basa más en?
- (a) Haber operado startups tú mismo/a
- (b) Haber network strong + deals access
- (c) Ambos"

### Scoring

Más (a)s → **In-house**
Más (b)s → **External Partnership**
Mix → **Hybrid**

---

## Output

```markdown
# Studio Archetype Decision — [Studio Name]

## Responses

[Table with 5 questions + answers]

## Recommended archetype

**[In-house / External Partnership / Hybrid]**

## Rationale

[Based on responses + studio context]

## Implications

Structure impact:
- [In-house]: Management Co centralized + founders on payroll
- [External]: Partnership agreement templates needed
- [Hybrid]: Both setups; más complexity

Hiring impact:
- [In-house]: Need to recruit N founders/year
- [External]: Need deal flow + evaluation pipeline

Thesis impact:
- [In-house]: Tight thesis viable
- [External]: Thesis loose but clear criteria

## Next steps

1. [Specific actions per archetype]
```

---

## Principios clave

- **Archetype NO es permanente**: most studios evolve from one to another over time
- **Hybrid mid-stage is natural**: most successful studios end up hybrid after 2-3 years
- **In-house requires capital intensive**: salaries + benefits + runway
- **External requires network + reputation**: without those, entrepreneurs don't apply

## Integración con otras skills

- **`studio-thesis`**: archetype informa thesis structure
- **`studio-focus`**: in-house can be tighter focus; external más flexible
- **`vertical-charter`**: verticals pueden usar diferentes archetypes dentro del mismo studio

## Recursos

- **Govclab** — [How to build a venture studio](https://govclab.com/2023/04/25/how-to-build-a-venture-studio/)
- **GSSN (Global Startup Studio Network)** — industry data sobre archetypes
