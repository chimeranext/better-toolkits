---
name: studio-thesis
version: 1.0.0
description: >
  Guides the venture studio or VC fund operator to draft a well-structured
  investment/studio thesis in the 37-word govclab template format.
  Use when the user asks "studio thesis", "fund thesis", "investment thesis",
  "37-word thesis", "tesis del studio", "tesis de inversión", "fund formation",
  "/studio-thesis", or needs to articulate the strategy by which their
  studio/fund generates returns for LPs/investors/stakeholders.
  Based on VC Lab / govclab methodology (2023) — the thesis is PRIVATE
  for LPs, not marketing material, and connects to fund size, focus,
  and secret sauce.
---

# Studio/Fund Thesis (govclab 37-word template)

Guía al operador de venture studio o VC fund a redactar una **tesis de inversión**
estructurada siguiendo el estándar de VC Lab / govclab. Esta tesis NO es marketing
público — es el documento privado que describe **cómo** el studio/fund genera retorno
para sus Limited Partners (LPs).

## Regla de idioma

Contenido en **español**. Términos financieros en formato "español (English)" la primera
vez que aparecen. La tesis final se genera en **español Y inglés** por default (ya que los
LPs internacionales leen en inglés).

## Directorio de salida

```
./portfolio/{studio-o-fund-name}/
├── thesis.md                    # Tesis final en español
├── thesis-en.md                 # Tesis final en inglés (mismas 37 palabras, traducidas)
└── thesis-workshop/
    ├── version-01.md            # Primera iteración
    ├── version-02.md            # Segunda iteración
    ├── version-03.md            # Tercera iteración
    └── validation-notes.md      # Notas del ejercicio de validación
```

## Regla de personalización

**Siempre Opción B** — la tesis debe ser específica, no genérica. Frases como "early-stage
tech startups in LATAM" son **inválidas** por ser demasiado amplias (govclab Rule 1).

---

## Contexto crítico: qué ES y qué NO ES una tesis

### Qué ES una tesis (govclab)

> "A fund thesis describes the strategy by which a venture capital fund makes money for
> the fund investors, called Limited Partners or LPs. It identifies the stage, geography
> and focus of investments, as well as the unique differentiation of the firm."

### Qué NO ES una tesis

- **NO es marketing público** — se comparte solo con LPs potenciales, es privada
- **NO es una descripción del producto** — el producto es la cartera de ventures, no el servicio
- **NO es una misión o visión** — esas son documentos distintos, más inspiracionales
- **NO es un pitch deck** — el pitch deck es para entrepreneurs; la tesis es para LPs

---

## El template de 37 palabras

```
[Fund/Studio Name] is launching a [$X MM] [Stage] venture [fund/studio] in
[Country/City] to back [Geography] [Sector/Market Companies] [with Secret Sauce]
```

**Regla**: 35-37 palabras. Máximo 40 palabras. Más allá de eso se pierde enfoque.

### Elementos (6)

#### 1. Fund/Studio Name

- **Temporary**: color + surname al inicio (ej. "Azure Capital", "Pink Management", "Green Ventures")
- **Regla**: evitar que la tesis cambie cuando el nombre final se decida. El nombre es placeholder.

#### 2. Fund Size

- Para fund nuevo (emerging manager): **mínimo $2MM, máximo $10MM**
- Para studio: puede empezar más chico ($500k-$2MM), escalar cuando maduren
- **Regla**: el goal es oversubscribirlo 2x+ del minimum

#### 3. Stage

Opciones comunes (elegir UNA):
- **Angel** (pre-pre-seed, friends & family scale)
- **Pre-seed** (primer round estructurado, $50k-$500k tickets)
- **Seed** (producto validándose, $500k-$2M tickets)
- **Series A** (growth stage, mejor reservado para fondos más grandes)

Managers novatos: empezar **angel / pre-seed / seed**. Series A+ requiere credibilidad y capital.

#### 4. Manager Location

País y ciudad donde operan los General Partners (GPs). Fondo tiene vida de 10+ años —
asumir que GPs seguirán ahí.

#### 5. Geographic Focus

- **Regla govclab**: LP prefieren **un solo país o región** (mayor especificidad)
- Generalistas multi-región son más difíciles de cerrar con LPs

Opciones: Costa Rica, Central America, LATAM, Mexico, APAC, Europe, US East Coast, etc.

#### 6. Sector Focus

- **Usar categorías establecidas** (FinTech, SaaS, HealthTech, AgriTech, etc.)
- **NO inventar categorías** — "Circular Economy 3.0 Infrastructure" es red flag
- Si dudás si una categoría está establecida, usá Google Trends y ver 12+ meses de cobertura en TechCrunch/Crunchbase

#### 7. Secret Sauce

**Regla más importante**: el secret sauce es el "why us" — la razón por la cual estos GPs
son uniquely qualified para ejecutar esta tesis.

Métricas rankeadas por preferencia de LPs (usar la más alta disponible):
1. **Total exit value** (la más fuerte)
2. **ROI / IRR / MOIC** (multiple of invested capital)
3. **Total amount raised** por portfolio companies
4. **Measurable sales** increases
5. **Number of companies helped, programs run**
6. **Years of experience** (la más débil)

**Formato**: matter-of-fact, con 1-2 data points. Sin adjetivos. Sin superlativos.

---

## Ejemplos canónicos (govclab)

### Azure Capital — Toronto AI

> "Azure Capital is launching a $5MM pre-seed venture fund in Toronto to back Canadian
> AI startups with 15+ exits totaling $3.5B in value."

37 palabras. Específico. Data point cuantificado.

### Green Ventures — Berlin Sustainability

> "Green Ventures is launching a $7MM seed venture fund in Berlin to back European
> sustainability companies with 200% ROI over 5 years."

36 palabras. Mercado específico. Métrica de performance clara.

### Coral VC — Sydney APAC

> "Coral VC is launching a $10MM angel venture fund in Sydney to back APAC e-commerce
> companies with 5 portfolio companies achieving 30% MoM growth."

37 palabras. Métrica de tracción por portfolio.

### Blue Investments — São Paulo AgriTech

> "Blue Investments is launching a $2MM pre-seed venture fund in São Paulo to back
> Brazilian Agritech companies with a 1,200-person network across 30 agricultural sectors."

37 palabras. Network size como secret sauce (menor ranking pero válido).

### Pink Management — Silicon Valley Biotech

> "Pink Management is launching a $10MM studio fund in Silicon Valley to back biotech
> hardware companies with $500MM raised and 20+ FDA approvals in management team's history."

37 palabras. Multiple data points. Studio fund (no solo VC).

---

## Flujo del skill

### Paso 1 — Contexto del operador

**ST-1**: "¿Qué tipo de entidad es?
- (a) Venture studio (construye ventures internamente)
- (b) VC fund (invierte en ventures externos)
- (c) Studio + attached fund (ambos, estructura compleja)"

**ST-2**: "¿Quiénes son los General Partners (GPs) o founders del studio?
Nombres + 1-liner del background de cada uno."

**ST-3**: "¿Dónde residen los GPs? (país + ciudad principal)"

### Paso 2 — Parámetros del fund

**ST-4**: "¿Tamaño objetivo del fund?
- $500k - $2MM (micro)
- $2MM - $5MM (small)
- $5MM - $10MM (emerging manager target)
- $10MM - $25MM (mid)
- $25MM+ (requires track record)
- Studio sin fund atado"

**ST-5**: "¿Stage de inversión? (si hay fund)
- Angel
- Pre-seed
- Seed
- Series A+
- Mixto (especificar allocation)"

### Paso 3 — Focus (geography + sector)

**ST-6**: "¿Geographic focus? (1 país ideal; región aceptable si país demasiado pequeño)"

**ST-7**: "¿Sector focus? (usar categorías establecidas — FinTech, SaaS, HealthTech, EdTech,
AgriTech, etc.). Si son múltiples, el más fuerte + secundario."

### Paso 4 — Secret Sauce (el más crítico)

**ST-8**: "¿Track record cuantificable del equipo? Dame los 2 mejores data points que
tengan, en orden de preferencia de LPs:

1. Total exit value generado (ej. '3 exits totalizando $500M')
2. ROI / IRR de inversiones previas
3. Total raised por portfolio companies previas
4. Sales increases medibles en empresas ayudadas
5. Número de empresas asesoradas / mentoreadas
6. Años de experiencia en el sector

Si los datos son estimados, marcar como estimado — los refinamos luego."

**ST-9**: "Si el secret sauce no encaja en métricas cuantitativas, ¿hay network access o
partnerships únicos? (ej. '25-member industry network', 'Partnership with [institución
respetada]')"

### Paso 5 — Generar 3 versiones

Aplicar el template de 37 palabras a los inputs anteriores y generar **3 versiones distintas**:

- **Versión 1**: más conservadora (data point más fuerte + geography más específica)
- **Versión 2**: más ambiciosa (stage más alto + secret sauce más agresivo)
- **Versión 3**: mix alternativo (diferente énfasis)

Presentar las 3 en paralelo para comparación.

### Paso 6 — Ejercicio de validación (30-60 min)

**Instrucciones al usuario** (reproducir verbatim):

> **Ejercicio de validación de la tesis** (govclab, 30-60 min):
>
> 1. Leé las 3 versiones en voz alta, una por una.
> 2. **Grabá un video de vos pitcheando** cada versión de forma conversacional (como si
>    estuvieras en un coffee con un LP). Una toma, sin guion, memorizado.
> 3. **Autoevaluate** cada versión respondiendo:
>    - ¿Invertirías vos en un fund con esta tesis?
>    - ¿La tesis es clara o confusa?
>    - ¿Sentís confianza al decirla?
>    - ¿Hay palabras que te traban o que se sienten falsas?
> 4. Elegí la versión ganadora. Iterá sobre ella (hasta 5 iteraciones más).
> 5. Tu primera audiencia sos vos mismo/a — hasta que vos mismo la aceptes, no la
>    mostrés a LPs externos.

**ST-10**: "¿Hiciste el ejercicio del video? ¿Cuál versión ganó? ¿Qué cambios querés hacer?"

### Paso 7 — Generar output final

Generar `./portfolio/{name}/thesis.md`:

```markdown
# Tesis de [Studio/Fund Name]

> *Documento privado. NO para consumo público. Compartir solo con LPs pre-qualificados.*

**Versión final** ([fecha]):

> *"[tesis de 37 palabras en español]"*

**English version**:

> *"[thesis in English, same 37 words equivalent]"*

---

## Elementos (breakdown)

- **Name**: [name]
- **Fund size**: [$X MM]
- **Stage**: [stage]
- **Manager location**: [country/city]
- **Geographic focus**: [geo]
- **Sector focus**: [sector]
- **Secret sauce**: [data point + métrica]

## Historial de iteraciones

- Versión 1: [cuando] — [cambio principal]
- Versión 2: [cuando] — [cambio principal]
- Versión final: [cuando]

## Evidencia del secret sauce

[Lista de data points con fuentes verificables — para cuando un LP pida due diligence]

## Conexión con próximos pasos

Esta tesis alimenta:
- `studio-focus` skill (Stage × Geography × Industry expandido)
- `secret-sauce` skill (profundización del unique differentiator)
- Pitch deck para LPs (formato distinto, basado en esta tesis)
```

Y una versión en inglés (`thesis-en.md`) que traduzca las 37 palabras manteniendo el
significado — no traducción literal palabra-por-palabra.

---

## Principios clave

- **37 palabras, ni más ni menos** — la brevedad es disciplina, no limitación
- **Specificity = investability** — tesis vaga = no-fundable
- **Secret sauce cuantificado** — sin datos, es marketing, no tesis
- **Privada, no marketing** — la tesis NO va en el website del studio
- **Iterable** — la tesis cambia entre versiones del fund; estabiliza dentro de un fund
- **Refuerza decisiones** — investments tangentes al focus se evitan (no prohíben)

## Anti-patterns (red flags)

- **>40 palabras**: pérdida de enfoque
- **Adjetivos** ("innovative", "leading", "best-in-class"): inversores los leen como ruido
- **Categorías inventadas** ("Next-gen Web5 AI blockchain"): sospechoso
- **"Seed to Series B"**: muy amplio; indica falta de strategy
- **"Global focus"**: LPs odian; prefieren foco
- **"Industry agnostic"**: señal de red flag para LPs ("no tienen thesis real")
- **"We will partner with great founders"**: tautología; todos lo dicen, no diferencia

---

## Integración con otras skills

- **`structure-decision`** — si la estructura es "Studio + Attached Fund", el output
  de este skill informa el setup legal (Management Co + GP entity + LP entity)
- **`studio-focus`** (futuro skill) — expande Stage × Geography × Industry con más
  detalle (tamaño de cheque, número de deals/año, reservas para follow-on)
- **`secret-sauce`** (futuro skill) — workshop profundo del unique differentiator con
  6 metric ranking system completo

## Recursos adicionales

- **Govclab / VC Lab**: [Investment Thesis guide](https://govclab.com/2023/11/21/venture-capital-investment-thesis/)
- **Govclab — How to build a venture studio**: [link](https://govclab.com/2023/04/25/how-to-build-a-venture-studio/)
- **Govclab — Fund Size**: [link](https://govclab.com/2021/09/15/how-to-determine-your-venture-capital-fund-size/)
- **Govclab — Firm Focus**: [link](https://govclab.com/2021/09/15/venture-capital-firm-focus/)
- **Govclab — Secret Sauce**: [link](https://govclab.com/2021/09/15/how-to-determine-your-venture-capital-secret-sauce/)
- **VC Lab Curriculum** (educational program for emerging managers)
- **VC Lab — Cornerstone LPA v3.0** (free LP agreement template — referenciar cuando se
  estructure el fund)
