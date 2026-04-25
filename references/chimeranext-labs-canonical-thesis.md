# Canonical Thesis — chimeranext Labs

> **Propósito de este documento**: ejemplo canónico del skill `studio-thesis` aplicado a
> un caso real (chimeranext Labs). Sirve como:
>
> 1. **Test case** del template 37-word — valida que el skill produce outputs válidos
> 2. **Reference** para usuarios que quieran ver el proceso completo con un caso concreto
> 3. **Working draft** para la propia operación de chimeranext Labs — si eventualmente se
>    estructura como fund formal, esta tesis es el punto de partida
>
> **Nota importante**: los data points específicos (número de developers, exits, raised
> amounts) son **estimados / placeholder** marcados con `[VALIDAR]`. Antes de usar esta
> tesis con LPs reales, @lapc506 debe validar cada data point con fuentes primarias.

---

## Contexto del operador

- **Tipo**: Venture studio (sin fund atado todavía — estructura es Texas LLC operativa)
- **GPs/founders**: @lapc506 (Andrés Peña), Juan C. Guerrero, Daniel Bejarano
- **Ubicación**: San José, Costa Rica (operaciones); Texas, US (incorporación)
- **Año de inicio**: 2025 (según Linear workspace creation)
- **Verticals actuales** (Linear teams): chimeranext, Civic Tech, B2B Factory
- **Ventures activas en portfolio**:
  - chimeranext (Platform, Launchpad, Agent Doji, Pathways, Forum, Hackathons, Social, Marketplace, chimera Score)
  - chimeraProjects B2B
  - Software Factory (premium client work)
  - doj-projects marketplace (community-grade)

---

## Versiones iteradas

### Versión 1 — Conservadora (data points verificables)

> **"chimeranext Labs is launching a venture studio in San José, Costa Rica to back
> LATAM developer-tools SaaS companies with [VALIDAR: N developers trained through
> Pathways] and [VALIDAR: N hackathons delivered] in its 18-month operating history."**

Palabras: 36. Especifica geografía + sector. Secret sauce usa métrica #5 (número de
programas/empresas ayudadas) — menor ranking pero más verificable cuando falta exit history.

**Limitación**: sin fund size porque no hay fund atado aún. Reemplaza "venture fund" por
"venture studio".

### Versión 2 — Ambiciosa (fund atado futuro)

> **"chimeranext Labs is launching a $3MM pre-seed venture studio in San José, Costa Rica
> to back LATAM developer-tools and AI SaaS companies with [VALIDAR: $N raised] by
> portfolio companies and [VALIDAR: N exits] in founder track records."**

Palabras: 37. Asume que se consolida un fund de $3MM. Secret sauce usa métrica #3 (total
raised) — más fuerte pero requiere validar los números.

**Limitación**: el fund de $3MM no existe todavía. Esta versión es aspiracional — útil
si chimeranext Labs decide captar LPs en los próximos 12 meses.

### Versión 3 — Mix alternativo (community + product)

> **"chimeranext Labs is launching a venture studio in Costa Rica to back LATAM open-source
> and community-driven SaaS companies leveraging [VALIDAR: a 1,000+ developer community
> across Pathways bootcamps and chimera Score leaderboards]."**

Palabras: 36. Secret sauce usa métrica #5 (network size — community). Enfoque más estrecho
(open-source + community-driven) — puede ser más defendible pero también más limitante.

---

## Versión recomendada para iteración

**Versión 1** es la más honest-to-current-state. Recomendación de siguiente paso:

1. Ejecutar el ejercicio de validación (video + self-assessment — ver skill `studio-thesis`)
2. Validar los data points con fuentes primarias:
   - Contar developers train through Pathways (Supabase query contra `user_profiles`)
   - Contar hackathons delivered (Linear search o Supabase contra hackathons table)
   - Documentar track records de cada GP (LinkedIn, GitHub stars, past exits)
3. Refinar a Versión 1.1 con números reales
4. Si 12 meses después hay fund atado, promover a Versión 2

---

## Elementos (breakdown)

- **Name**: chimeranext Labs
- **Fund size**: N/A (studio sin fund atado aún) — Versión 2 asume $3MM si se consolida
- **Stage**: pre-seed (para ventures lanzadas desde el studio)
- **Manager location**: San José, Costa Rica (ops) + Texas, US (incorp)
- **Geographic focus**: LATAM (principalmente Costa Rica + regional Central America/México)
- **Sector focus**: developer-tools SaaS + AI SaaS (secundario: open-source, community-driven)
- **Secret sauce**: developer community + bootcamp + track record operando chimeranext como
  product portfolio

## Evidencia del secret sauce

Data points a validar antes de usar con LPs reales:

- [ ] Número de developers entrenados vía Pathways (Supabase query necesaria)
- [ ] Número de hackathons delivered (Linear / Supabase)
- [ ] Revenue total del studio (operaciones + Software Factory)
- [ ] chimera Score total activos (medición de engagement)
- [ ] Exits de ventures del portfolio (si alguna salió)
- [ ] Track records individuales de GPs (@lapc506 LinkedIn + CertiProf SPOPC/USFC/SFPC, etc.)

## Gaps / red flags a abordar antes de salir a LPs

1. **Fund legal structure**: actualmente Texas LLC operativa. Para captar LPs necesita
   estructurarse como Management Co + GP entity + LP entity. Ver skill `structure-decision`
   + `attached-fund-structure` (futuro).

2. **Track record cuantificable**: la palabra "[VALIDAR]" aparece 4+ veces en las versiones.
   Antes de mostrar a LPs, resolver cada uno.

3. **Focus vs. diversification**: el portfolio actual mezcla developer-tools (Pathways, Agent
   Doji), community (Forum, Social), marketplace (Marketplace, doj-projects). Un LP va a
   preguntar "¿cuál es el foco primario?". Elegir uno y ser explícito en la tesis.

4. **Geographic scope**: "LATAM" es amplio. ¿Costa Rica first + México expansion? ¿Central
   America cluster? Definir con precisión antes de pitchear.

5. **Exit strategy articulada**: ¿Cómo hace chimeranext Labs dinero para sus LPs? ¿Exits de
   ventures individuales? ¿IPO del studio entero? ¿Dividend distributions por venture?
   Esto NO va en la tesis de 37 palabras pero SÍ debe ser coherente en conversaciones
   con LPs.

---

## Conexión con el ecosistema de plugins

Esta tesis alimenta:

- **`structure-decision`** skill — informa si seguir como Texas LLC o migrar a Management Co + fund structure
- **`studio-focus`** skill (futuro) — expande Stage × Geography × Industry (ej. "pre-seed
  SaaS en México DF" vs. "seed AI tools en Costa Rica")
- **`secret-sauce`** skill (futuro) — profundiza los 2-3 data points más fuertes
- **`vertical-charter`** skill (futuro) — mapea los 3 Linear teams (chimeranext, Civic Tech,
  B2B Factory) como verticals formales del studio con sus propias mini-thesis

## Siguientes pasos para @lapc506

Si querés tomar esta tesis seriamente (no solo como test case):

1. Validar los data points (sacar de Supabase + Linear + LinkedIn)
2. Correr el ejercicio de validación del skill `studio-thesis` (video + self-assessment)
3. Compartir con Juan + Daniel Bejarano (GPs) para alineación
4. Revisar con abogado corporativo US antes de mostrar a LPs (ver `structure-decision`)
5. Decidir fund size objetivo (Versión 2 asume $3MM — ¿es viable?)

---

*Generated 2026-04-14 como test case del skill `studio-thesis` del plugin `venture-studio-toolkit`.*
