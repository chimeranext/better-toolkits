---
name: secret-sauce
version: 1.0.0
description: >
  Identifies and articulates the studio/fund's "secret sauce" — the quantified
  competitive advantage that justifies why THIS team should execute THIS thesis.
  Uses govclab's 6-metric ranking system and 37-word articulation standard.
  Use when the user asks "secret sauce", "unfair advantage", "competitive moat",
  "por qué nosotros", "what makes this team unique", "differentiator",
  "/secret-sauce", or has thesis + focus done and needs to articulate the
  "why us" component.
---

# Secret Sauce (Unfair Advantage)

Identifica el **secret sauce** del studio/fund — el diferenciador cuantificable
que justifica por qué este equipo es uniquely qualified para ejecutar su tesis.

## Regla de idioma

Español. Métricas financieras en "español (English)" primera vez.

## Directorio de salida

```
./portfolio/{name}/
└── secret-sauce.md
```

---

## Definición (govclab)

> "The Secret Sauce of a fund describes why the managers are uniquely qualified
> to pursue the Thesis."

Es **matter-of-fact**, **cuantificado**, con 1-2 data points. **Sin adjetivos**.
**Sin superlativos**. **Sin jerga inventada**.

---

## 6 métricas rankeadas por preferencia de LPs

### 1. Total exit value (la más fuerte)

"$X MM cumulative exit value" — la métrica que LPs aman más porque es el outcome final
de VC (liquid returns).

Ejemplo: *"cumulative exit value of over $500 MM in EdTech"*

### 2. ROI / IRR / MOIC

Multiple of invested capital.

Ejemplo: *"200% ROI over 5 years"* o *"3.5x MOIC on 12 investments"*

### 3. Total amount raised

Capital raised by portfolio companies (shows ability to raise follow-on rounds).

Ejemplo: *"$500MM raised by portfolio companies"*

### 4. Measurable sales increases

Helping companies increase sales by measurable amounts.

Ejemplo: *"helping three BioTech companies secure $20MM+ in sales each"*

### 5. Number of companies helped / programs run

Breadth of experience.

Ejemplo: *"25 companies helped across 3 programs"* o *"12 financings led for $65MM total"*

### 6. Years of experience (la más débil)

Usar **solo si no hay métricas superiores**. Sin data points cuantitativos, years
of experience es poco diferenciador — "20 años en tech" dice mucho menos que "$500MM exit value".

---

## Reglas de articulación (govclab standard)

1. **37 palabras máximo** en el statement completo
2. **No adjetivos** ("innovative", "leading", "best-in-class") — LPs los leen como ruido
3. **No superlativos** ("the largest", "the best") — invita a challenge
4. **Plain English** — evitar jerga inventada
5. **Un data point impresivo** (máximo dos si son complementarios)
6. **Data estrictamente relacionada al focus** — no data random de otro sector

---

## Proceso de identificación (govclab 4 pasos)

### Paso 1 — Identificar 2 métricas con track record

**SS-1**: "Del team completo de GPs / operators del studio, ¿en cuáles de las 6
métricas tienen evidencia cuantificable?

Para cada persona del equipo, listar:
- Name
- Exits totales value (si hay)
- Ventures started/scaled con revenue data
- Amounts raised by companies helped
- Sales increases measured
- Years in the focus industry

Marcar con 🟢 las métricas donde hay data verificable, 🟡 donde hay estimated, 🔴 donde falta."

### Paso 2 — Collect data (usar estimates si es necesario inicialmente)

**SS-2**: "Para las 2 métricas más fuertes (más alto ranking govclab), recolectar data points
específicos. Ejemplos aceptables:

- 'Grupo Alfa y Yappo exits totalizando $45MM'
- '$120MM raised by 8 portfolio companies at Accelerator X'
- '3x revenue growth achieved for 5 SaaS B2B clients in previous consultancy'

Si usás estimados, marcarlos como 'estimated' y planear recolección de data verificable
(ideal antes de mostrar a LPs)."

### Paso 3 — Escribir 3 versiones por cada métrica (6 versiones total)

**SS-3**: "Por cada una de las 2 métricas elegidas, escribir 3 versiones del secret sauce.
Total: 6 statements. Todos bajo 37 words, sin adjetivos."

### Paso 4 — Testear con 3-5 venture-familiar colleagues

**SS-4**: "Enviar los 6 statements (sin labels) a 3-5 colegas con experiencia VC.
Preguntarles:
1. ¿Cuál de estos te parece más investable?
2. ¿Cuál te parece confuso o forzado?
3. ¿Qué cambiarías?

Aggregar feedback. Iterar al versión ganadora."

---

## Ejemplos concretos (govclab)

### Exit Value

> *"cumulative exit value of over $500 MM in EdTech"*

### Sales Growth

> *"helping three BioTech companies secure $20MM+ in sales each"*

### Network Access

> *"25-member industry network leading to 12 financings for $65MM"*

### Hybrid (2 metrics)

> *"$500MM raised and 20+ FDA approvals in management team's history"*

---

## Flujo del skill

1. **Paso 1** — Team inventory: listar GPs + cada métrica con/sin track record
2. **Paso 2** — Data collection: obtener data points para 2 métricas más fuertes
3. **Paso 3** — Write 6 versions (3 per metric)
4. **Paso 4** — Test con colleagues, iterar
5. **Paso 5** — Seleccionar ganadora, integrar en thesis

---

## Output

Generar `./portfolio/{name}/secret-sauce.md`:

```markdown
# Secret Sauce — [Studio/Fund Name]

## Final statement

> *"[37-word statement]"*

## Team track record breakdown

### [GP name 1]
- Métrica destacada: [cuál del ranking]
- Data points: [specifics]
- Evidencia verificable: [source — LinkedIn, Crunchbase, specific transactions]

### [GP name 2]
[...]

## Métricas evaluadas

| Métrica (ranking) | Team has? | Data points |
|---|---|---|
| 1. Total exit value | 🟢/🟡/🔴 | [points] |
| 2. ROI/IRR/MOIC | | |
| 3. Total raised | | |
| 4. Measurable sales | | |
| 5. Companies helped | | |
| 6. Years of experience | | |

## 6 drafts evaluados

1. [Draft 1]
2. [Draft 2]
3. [Draft 3]
4. [Draft 4]
5. [Draft 5]
6. [Draft 6]

## Feedback de colleagues

- [Name 1]: favorite [#]. Feedback: [...]
- [Name 2]: favorite [#]. Feedback: [...]
- [Name 3]: favorite [#]. Feedback: [...]

## Winning version

[Final statement + rationale of why this one]

## Evidence dossier (para due diligence de LP)

Para cada data point del statement final, tener evidence ready:

- [data point]: [source, date, URL if public]
- [data point]: [source, date, URL if public]
```

---

## Anti-patterns

- **Adjetivos** ("innovative", "leading") → LPs discount
- **Superlativos** ("the best", "the most") → invita challenge
- **Jerga inventada** ("proprietary AI-driven alpha") → huele a marketing
- **Data no relevante al focus** → FinTech fund con secret sauce en EdTech = confuso
- **Sin data points** → "20 years of experience" sin exits es débil
- **Metric equivocado para el stage** — exit value en fund de $500k es overkill; companies helped es más apropriado

## Integración con otras skills

- **`studio-thesis`** (prerequisite): el secret sauce ocupa el slot "[with Secret Sauce]" de la tesis de 37 palabras
- **`studio-focus`** (prerequisite): el secret sauce debe alinearse al focus elegido
- **Pitch deck para LPs**: el secret sauce es la slide clave del "Why Us"

## Recursos

- **Govclab** — [Secret Sauce methodology](https://govclab.com/2021/09/15/how-to-determine-your-venture-capital-secret-sauce/)
- **Govclab** — [Investment thesis](https://govclab.com/2023/11/21/venture-capital-investment-thesis/)
- **Crunchbase** — verificar track records de GPs
- **PitchBook** — database de exits por sector
