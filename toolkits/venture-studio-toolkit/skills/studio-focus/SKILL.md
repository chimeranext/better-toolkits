---
name: studio-focus
version: 1.0.0
description: >
  Defines the studio/fund focus along three dimensions — Stage × Geography × Industry —
  following govclab's 4-step framework (step 3 after thesis and size). Use when the
  user asks "studio focus", "fund focus", "stage geography industry", "enfoque del
  studio", "enfoque del fund", "focus del VC", "/studio-focus", or has a thesis
  drafted and needs to articulate the precise focus dimensions. Complements
  studio-thesis (37-word template) by expanding the Stage × Geography × Industry
  portion with concrete parameters.
---

# Studio/Fund Focus

Extiende `studio-thesis` expandiendo las 3 dimensiones de focus con parámetros
concretos. Basado en govclab's 5-step methodology for firm focus.

## Regla de idioma

Español. Términos en "español (English)" primera vez.

## Directorio de salida

```
./portfolio/{name}/
└── focus.md
```

---

## Las 3 dimensiones

### Stage

La etapa de los ventures que el studio/fund targetea:

- **Angel**: $10k-$50k tickets, pre-product idea validation
- **Pre-seed**: $50k-$500k, MVP + early traction
- **Seed**: $500k-$2M, product validated, seeking scale
- **Series A**: $2M-$15M, growth stage, unit economics positivos
- **Series B+**: $15M+, late growth, pre-IPO

**Regla govclab**: fondos nuevos elegir **1-2 stages adyacentes**. "Seed to Series B" es
demasiado amplio y señala falta de foco a LPs.

### Geography

Dónde operan los ventures del portfolio:

- **Single country**: Costa Rica, México, Colombia, etc. — LPs prefieren este
- **Single region**: LATAM, Central America, Southern Cone
- **Multi-region**: solo si GP tiene track record multi-region (raro)

**Regla govclab**: "The majority of limited partners prefer focused funds, referred to as
specialists versus generalists." Mejor profundo en 1 región que shallow en varias.

### Industry / Sector

Tipo de ventures:

- Categorías establecidas: FinTech, SaaS, HealthTech, EdTech, AgriTech, etc.
- **NO inventar categorías** ("Circular Economy 3.0 Blockchain AI") — red flag para LPs
- **Regla**: si la categoría no tiene ≥12 meses de cobertura en TechCrunch/Crunchbase,
  probablemente no es investable todavía

---

## Flujo del skill (5 pasos de govclab)

### Paso 1 — Listar stages candidatos

**SF-1**: "Listá todos los stages donde tu team tiene experiencia. Por cada uno:
- Stage
- Cuántas inversiones / operaciones en ese stage
- Track record específico en ese stage (exits, ROI, companies helped)"

### Paso 2 — Elegir el stage con más track record

**SF-2**: "De los stages listados, ¿cuál tiene el track record más sólido?
Elegir el stage donde tenés **más evidencia cuantificable**, no donde tenés más preferencia."

### Paso 3 — Elegir geografía (donde residen los GPs)

**SF-3**: "¿Dónde viven los General Partners?
- País primary de operación: __
- Ciudad base: __
- ¿Los GPs van a seguir ahí los próximos 10 años? (fondo tiene vida de 10+ años)"

**Regla**: geografía = donde están los GPs, no donde están los deals. Si los GPs viven
en San José pero el deal flow es México, la geografía declarada es **Costa Rica**
(con nota de regional reach), no México.

### Paso 4 — Listar industrias candidatas

**SF-4**: "Listá sectores donde tu team tiene deep domain expertise. Por cada uno:
- Industry
- Años de experiencia acumulada en el equipo
- Notable exits/companies en ese sector
- Network depth en ese sector (# de relationships activas)"

### Paso 5 — Triangular — Stage × Geography × Industry

**SF-5**: "Combinando Paso 2 + 3 + 4, triangular una tesis focus específica. Formato:

> '[Stage] [Industry] startups in [Geography]'

Ejemplos:
- 'Seed stage SaaS startups in Vietnam'
- 'Angel AgriTech startups in East Africa'
- 'Pre-seed HealthTech companies in Germany'"

### Paso 6 — Validar con reality check

**SF-6**: "Para la combinación elegida, validar:
- ¿Hay suficientes startups en ese focus? (≥20 deals/año al menos)
- ¿Hay LP demand para ese focus? (conocés LPs que invertirían en ese focus?)
- ¿Es suficientemente diferenciado? (no hay 20 otros fondos con el mismo focus)

Si falla alguno → ajustar focus (broader stage, o broader industry, o broader geo)."

---

## Parámetros numéricos (definir post-focus)

Una vez elegido el focus, definir:

**Ticket size**:
- Check size típico ($X-$Y per investment)
- Initial vs. follow-on reserves (ratio)

**Deals/year**:
- Target: 20-30% del fund size / check size promedio
- Ej. $5MM fund con $250k checks = 20 deals target, distribuidos en 2-3 años

**Reserves**:
- 50-100% del fund reservado para follow-ons en winners
- Ej. $5MM fund → $2-2.5MM reservado, $2.5-3MM para initial checks

---

## Output

Generar `./portfolio/{name}/focus.md`:

```markdown
# Focus — [Studio/Fund Name]

## Dimensiones

- **Stage**: [stage primary], [stage secondary opcional]
- **Geography**: [country/region]
- **Industry**: [sector primary], [sector secondary opcional]

## One-liner

> "[Stage] [Industry] startups in [Geography]"

## Parámetros numéricos

- **Check size**: $X-$Y
- **Target deals/year**: N
- **Reserves ratio**: X% del fund

## Rationale

### Por qué [stage]

[Data points del track record del equipo en ese stage]

### Por qué [geography]

[GP location + deal flow access + competitive landscape]

### Por qué [industry]

[Domain expertise + network depth + market opportunity]

## Reality check

- Deals/year disponibles en ese focus: [estimación]
- LP demand estimada: [signal]
- Diferenciación: [cómo se distingue de fondos similares]

## Excepciones permitidas

Por regla: ~5-10% de deals pueden ser tangenciales al focus sin violarlo. Definir
qué tangentes son aceptables (ej. "Seed fund pero hasta 1 deal en Series A con strong alignment").

## Post-close stability

Una vez el fund cierra, el focus NO cambia. Es el contrato con los LPs. Si querés
cambiar, necesitás nuevo fund.
```

---

## Principios clave

- **Track record > preference**: elegir stage donde hay data, no donde querés estar
- **Geography = where GPs live**: no confundir con deal flow target
- **No inventar categorías**: usar sectores establecidos; inventar = red flag
- **Pre-close adjustable, post-close fixed**: iterar antes de cerrar, no después

## Integración con otras skills

- **`studio-thesis`**: prerequisite — el focus llena el slot "[Geography] [Sector/Market]" del 37-word template
- **`secret-sauce`**: next step — el secret sauce se alinea al focus elegido
- **`accelerator-launchpad`**: si el focus es tight, algunos accelerators se descartan automáticamente

## Recursos

- **Govclab** — [VC firm focus](https://govclab.com/2021/09/15/venture-capital-firm-focus/)
- **Govclab** — [Fund size](https://govclab.com/2021/09/15/how-to-determine-your-venture-capital-fund-size/)
- **Crunchbase Industry Categories** — referencia de sectores establecidos
