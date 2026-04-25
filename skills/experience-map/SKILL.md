---
name: experience-map
version: 1.0.0
description: >
  Direct creation of Experience Maps (Day in the Life). Use when the user
  explicitly asks for "experience map", "day in the life map",
  "mapa de experiencia", "dia en la vida del usuario", "dia en la vida",
  "day in the life", "mapear un dia tipico", "rutina del usuario",
  "como es el dia de mi usuario", "/experience-map",
  or when the end user does not yet have an existing product/service.
  Shortcut that skips map type selection.
---

# Mapa de Experiencia -- Un Dia en la Vida (Experience Map -- Day in the Life)

Atajo directo para crear un Mapa de Experiencia (Experience Map) sin pasar por la
seleccion de tipo de mapa. Usa el mismo flujo que el Taller de Mapas UX pero con
el tipo de mapa ya definido: perfil `experience-map`, variante `day-in-the-life`.

## Regla de idioma

Todo el contenido generado debe estar en **espanol**. Los terminos de UX se presentan
en formato **"espanol (English)"** la primera vez que aparecen. Despues de la primera
mencion, se puede usar solo el termino en espanol.

## Directorio de salida

`docs/ux-research/maps/{nombre-del-mapa}/` -- contiene `map.json` (fuente de verdad)
y `map.html` (visualizacion interactiva).

## Estilo de preguntas

Una pregunta a la vez. Opcion multiple cuando sea posible. Esperar respuesta antes de avanzar.

---

## Paso 1 -- Detectar Contexto (Context Detection)

Leer `${CLAUDE_PLUGIN_ROOT}/agents/persona-builder.md` y despachar el agente persona-builder.

Evaluar el resultado:

- **FOUND_SRD / FOUND_BMT / FOUND_MAP**: Presentar el persona encontrado al usuario.
  Mostrar: nombre, edad, rol, ubicacion, dolor principal, contexto. Preguntar:

  > "He encontrado este persona en tu proyecto:
  >
  > **[nombre]** ([edad] anos) -- [rol]
  > Ubicacion: [ubicacion]
  > Dolor principal: [primary_pain]
  > Contexto: [context]
  >
  > Es este el persona que queres usar para el mapa?
  > 1. Si, usar este persona
  > 2. No, quiero crear uno nuevo
  > 3. Quiero modificarlo"

  Si hay multiples personas de SRD: presentar lista numerada, dejar que el usuario elija.

- **CREATE_PROTO_PERSONA** (default Lean UX 4-quadrant flow cuando no hay persona en SRD/BMT/maps): Ejecutar el `PROTO_PERSONA_DIALOGUE` del agent en 4 cuadrantes (una pregunta a la vez):

  **Cuadrante 1 — Identity**: nombre (puede ser ficticio), edad, ocupación, ubicación, descripción visual del avatar en 1 oración.

  **Cuadrante 2 — Behavioral demographics** (solo demographics que PREDICEN behavior): tech-savviness, tolerancia al riesgo, contexto de decision-making (autónomo / needs approval / team-based), schedule constraints.

  **Cuadrante 3 — Pain points**: 3-5 pain points específicos con contexto, #1 unmet need actual, frustrations con soluciones existentes.

  **Cuadrante 4 — Potential solutions** (HIPÓTESIS a validar): qué soluciones PODRÍAN ayudar, cuáles ya probó y no funcionaron.

  El proto-persona resultante lleva `_hypothesis_flag: true`. Usarlo para el mapa actual, flaggeando que requiere validación con entrevistas reales (ver `business-model-toolkit:customer-interview-system`).

- **NOT_FOUND** (legacy fallback — solo si se solicitó explícitamente): Ejecutar dialogo mínimo de creacion de persona. Preguntar una a la vez:

  1. "Como se llama tu usuario/a? Que edad tiene?"
  2. "Cual es su rol o profesion?"
  3. "Donde vive? (ciudad, pais)"
  4. "Cual es el mayor dolor o problema que enfrenta [nombre]?"
  5. "Describi en una oracion la situacion de [nombre]."

  Sugerir `avatar_emoji` basado en las respuestas.

**PUERTA DE APROBACION**: Confirmar el persona antes de continuar.

---

## Paso 2 -- OMITIDO

El tipo de mapa ya esta definido: **Mapa de Experiencia (Experience Map)**,
perfil `experience-map`, variante `day-in-the-life`.

Informar al usuario:

> "Vamos a crear un **Mapa de Experiencia (Experience Map)** tipo 'Un Dia en la Vida'
> para **[nombre del persona]**. Este mapa captura la experiencia general de tu usuario
> a lo largo de un dia tipico, sin enfocarse en un producto especifico."

---

## Paso 3 -- Recopilar Datos (Data Collection)

Leer `${CLAUDE_PLUGIN_ROOT}/references/methodology.md` antes de este paso.

Leer las fases por defecto desde
`${CLAUDE_PLUGIN_ROOT}/assets/schemas/profiles/experience-map.profile.json`.

Presentar las fases temporales predeterminadas:

> "Voy a mapear el dia de **[nombre]** en 5 momentos. Queres usar estos o personalizarlos?
>
> 1. Manana temprana
> 2. Media manana
> 3. Tarde
> 4. Atardecer
> 5. Noche
>
> (Responde 'Si' para usar estos, o describi tus fases personalizadas)"

Para cada fase (una a la vez), hacer estas preguntas en orden:

1. "Que hace **[nombre]** durante **[fase]** relacionado con [dominio/problema]?" -> `actions`
2. "Que esta pensando o sintiendo en ese momento?" -> `thoughts`
3. "Que le frustra o le duele en este punto?" -> `frustrations`
4. "Del 1 al 5, como calificarias su estado emocional? (1=muy mal, 5=muy bien)" -> `emotion.level`
   Sugerir emoji y etiqueta emocional basados en la descripcion.
5. "Como esta interactuando con soluciones existentes en este momento?" -> `touchpoints`
6. "Que oportunidad de mejora ves aca?" -> `opportunities`

Despues de completar TODAS las fases:

7. "Cuales son los 3-4 puntos de dolor (Pain Points) principales?" -> `analysis.pain_points`
8. "Cual es el Momento de Verdad (Moment of Truth)?" -> `analysis.moments_of_truth`

**PUERTA DE APROBACION**: Confirmar datos completos antes de continuar.

---

## Paso 4 -- Generar JSON (Generate JSON)

Leer `${CLAUDE_PLUGIN_ROOT}/assets/schemas/profiles/experience-map.profile.json`.

Construir el objeto JSON conforme al esquema core. Usar `meta.type: "experience-map"`,
`meta.profile: "experience-map"`, `meta.variant: "day-in-the-life"`.

Crear directorio: `docs/ux-research/maps/{titulo-slugificado}/`
Escribir `map.json`.

Presentar resumen:

> "He generado el JSON del mapa. Contiene **[N] fases**, **[N] pain points**,
> y **[N] momentos de verdad**. Queres revisarlo antes de generar la visualizacion?"

**PUERTA DE APROBACION**: Confirmar JSON antes de renderizar.

---

## Paso 5 -- Renderizar HTML (Render HTML)

Leer `${CLAUDE_PLUGIN_ROOT}/agents/renderer.md` y despachar el agente renderer
con la ruta al `map.json`.

Una vez completo, informar al usuario:

> "El mapa visual esta listo. Abri el archivo
> `docs/ux-research/maps/{nombre}/map.html` en Chrome o Edge para verlo."

Preguntar:

> "Queres que analice el mapa usando el framework de 7 puntos de NN/g?"

**PUERTA DE APROBACION**: Confirmar HTML renderizado.

---

## Paso 6 -- Analisis (Analysis) -- Opcional

Si el usuario dice si, leer la seccion del framework de 7 puntos en
`${CLAUDE_PLUGIN_ROOT}/references/methodology.md`.

Recorrer los 7 puntos del framework NN/g:

1. **Expectativas no cumplidas** -- Donde la experiencia entra en conflicto con lo esperado
2. **Puntos de contacto innecesarios** -- Pasos que podrian eliminarse
3. **Puntos bajos / friccion** -- Fases con emotion.level 1-2, prioridad maxima
4. **Transiciones de canal** -- Cambios de dispositivo/canal entre fases
5. **Evaluacion de tiempo** -- Inversiones de tiempo vs valor recibido
6. **Momentos de verdad** -- Confirmar/expandir los identificados en Paso 3
7. **Puntos altos** -- Fases con emotion.level 4-5, proteger y amplificar

Presentar hallazgos y recomendar siguiente tipo de mapa:

> "Basado en este analisis, el siguiente paso natural seria crear un
> **[tipo_de_mapa_recomendado]** para **[razon]**."

---

## Recursos

### Archivos de referencia
- **`${CLAUDE_PLUGIN_ROOT}/references/map-type-guide.md`** -- Tipos de mapa y cuando usarlos
- **`${CLAUDE_PLUGIN_ROOT}/references/methodology.md`** -- Metodologia NN/g y framework de 7 puntos

### Agentes
- **`${CLAUDE_PLUGIN_ROOT}/agents/persona-builder.md`** -- Busca personas existentes o guia la creacion
- **`${CLAUDE_PLUGIN_ROOT}/agents/renderer.md`** -- Compone HTML interactivo desde JSON

### Esquemas y perfiles
- **`${CLAUDE_PLUGIN_ROOT}/assets/schemas/core.schema.json`** -- Esquema core del JSON
- **`${CLAUDE_PLUGIN_ROOT}/assets/schemas/profiles/experience-map.profile.json`** -- Perfil y fases por defecto
