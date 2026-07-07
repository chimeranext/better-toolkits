---
name: storyboard
version: 1.0.0
description: >
  Direct creation of Storyboards (visual narratives). Use when the user
  asks for "storyboard", "guion visual", "historia visual",
  "narrativa del usuario", "comic", "escenas",
  "/storyboard", or wants to tell the story of a user experience
  through sequential scenes. Simplest map type, focused on emotion.
---

# Guion Visual (Storyboard)

Atajo directo para crear un Guion Visual (Storyboard) sin pasar por la
seleccion de tipo de mapa. Usa el mismo flujo que el Taller de Mapas UX pero con
el tipo de mapa ya definido: perfil `storyboard`, variante `narrative`.

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
  > Es este el persona que queres usar para el guion?
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

  Para storyboards específicamente, si el scope del scene es simple (4-6 frames), se puede usar `NOT_FOUND` + `DIALOGUE_TEMPLATE` en su lugar (proto-persona puede ser overkill para storyboards cortos).

- **NOT_FOUND** (legacy fallback — o para storyboards simples): Ejecutar dialogo mínimo de creacion de persona. Preguntar una a la vez:

  1. "Como se llama tu usuario/a? Que edad tiene?"
  2. "Cual es su rol o profesion?"
  3. "Donde vive? (ciudad, pais)"
  4. "Cual es el mayor dolor o problema que enfrenta [nombre]?"
  5. "Describi en una oracion la situacion de [nombre]."

  Sugerir `avatar_emoji` basado en las respuestas.

**PUERTA DE APROBACION**: Confirmar el persona antes de continuar.

---

## Paso 2 -- OMITIDO

El tipo de mapa ya esta definido: **Guion Visual (Storyboard)**,
perfil `storyboard`, variante `narrative`.

Informar al usuario:

> "Vamos a crear un **Guion Visual (Storyboard)** para **[nombre del persona]**.
> El storyboard narra la experiencia del usuario a traves de escenas secuenciales,
> como un comic o guion cinematografico. Es ideal para comunicar empatia,
> presentar casos de uso, o documentar una experiencia clave de forma visual y emotiva."

---

## Paso 3 -- Recopilar Datos (Data Collection)

Leer `${CLAUDE_PLUGIN_ROOT}/references/methodology.md` antes de este paso.

Leer las escenas por defecto desde
`${CLAUDE_PLUGIN_ROOT}/assets/schemas/profiles/storyboard.profile.json`.

Primero preguntar sobre la cantidad de escenas:

> "Cuantas escenas (scenes) queres en el guion?
>
> Por defecto uso 6 escenas que cubren el arco completo de problema a solucion:
> 1. Contexto -- la situacion inicial
> 2. Problema -- el conflicto o dolor
> 3. Busqueda -- el usuario busca una solucion
> 4. Descubrimiento -- encuentra algo prometedor
> 5. Solucion -- lo usa y funciona
> 6. Resultado -- el estado final mejorado
>
> Responde 'Si' para usar estas 6, o indica cuantas escenas necesitas
> (puedes describir tus propios titulos)"

Para cada escena (una a la vez), hacer estas preguntas en orden:

1. "Que esta pasando en la escena **[N] -- [titulo]**?
   Describe la situacion con detalle."
   -> `scene_description`

2. "Donde y cuando ocurre esta escena?
   (ej: 'lunes a la manana, en el consultorio', 'en el auto de regreso a casa')"
   -> `scene_setting`

3. "Hay algun dialogo o pensamiento clave que quieras incluir?
   (ej: '[nombre] piensa: ¿por que tarda tanto?', o deja en blanco si no aplica)"
   -> `scene_dialogue` *(opcional, puede estar vacio)*

4. "Cual es el estado de animo general en esta escena?
   (ej: ansiosa, esperanzada, frustrada, aliviada, confundida)"
   -> `scene_mood`

5. "Del 1 al 5, como se siente **[nombre]** en esta escena?
   (1=muy mal, 5=muy bien)"
   -> `emotion.level`
   Basado en el mood descrito, sugerir emoji y etiqueta emocional. -> `emotion.emoji`, `emotion.label`

Despues de completar TODAS las escenas:

6. "En una frase, cual es el mensaje central que queres que el espectador recuerde
   al ver este guion?"
   -> `analysis.moments_of_truth[0].description` *(el insight central del storyboard)*

**PUERTA DE APROBACION**: Confirmar que todas las escenas estan completas antes de continuar.

---

## Paso 4 -- Generar JSON (Generate JSON)

Leer `${CLAUDE_PLUGIN_ROOT}/assets/schemas/profiles/storyboard.profile.json`.

Construir el objeto JSON conforme al esquema core. Usar `meta.type: "storyboard"`,
`meta.profile: "storyboard"`, `meta.variant: "narrative"`.

Mapear cada escena como una fase con los campos:
- `id`: "scene-N"
- `label`: titulo de la escena
- `scene_description`, `scene_setting`, `scene_dialogue`, `scene_mood`
- `emotion.level`, `emotion.emoji`, `emotion.label`

Crear directorio: `docs/ux-research/maps/{titulo-slugificado}/`
Escribir `map.json`.

Presentar resumen:

> "He generado el JSON del guion. Contiene **[N] escenas** y el arco emotivo
> va de **[emotion inicial]** a **[emotion final]**.
> Queres revisarlo antes de generar la visualizacion?
> 1. Si, mostrame el JSON
> 2. No, continua con la visualizacion"

**PUERTA DE APROBACION**: Confirmar JSON antes de renderizar.

---

## Paso 5 -- Renderizar HTML (Render HTML)

Leer `${CLAUDE_PLUGIN_ROOT}/agents/renderer.md` y despachar el agente renderer
con la ruta al `map.json`.

Una vez completo, informar al usuario:

> "El guion visual esta listo. Abri el archivo
> `docs/ux-research/maps/{nombre}/map.html` en Chrome o Edge para verlo."

Preguntar:

> "Queres que analice el guion usando el framework de 7 puntos de NN/g?"

**PUERTA DE APROBACION**: Confirmar HTML renderizado.

---

## Paso 6 -- Analisis (Analysis) -- Opcional

Si el usuario dice si, leer la seccion del framework de 7 puntos en
`${CLAUDE_PLUGIN_ROOT}/references/methodology.md`.

Para el storyboard, aplicar el framework con enfoque narrativo:

1. **Expectativas no cumplidas** -- En que escena la experiencia contradice lo esperado por el usuario
2. **Escenas innecesarias** -- Hay escenas que podrian fusionarse o eliminarse sin perder el hilo narrativo
3. **Puntos bajos / friccion** -- Las escenas con emotion.level 1-2 son el corazon del conflicto -- verificar que esten bien representadas
4. **Transiciones de escena** -- El cambio entre escenas, es fluido y logico o hay saltos abruptos
5. **Evaluacion de ritmo** -- El guion, tiene el ritmo correcto? Demasiadas escenas de problema, muy pocas de solucion?
6. **Momento de verdad** -- Identificar la escena clave donde todo cambia para el usuario
7. **Punto alto** -- La escena con mayor emocion positiva, representa adecuadamente el valor de la solucion?

Presentar hallazgos y recomendar siguiente tipo de mapa:

> "Basado en este guion, el siguiente paso natural seria crear un
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
- **`${CLAUDE_PLUGIN_ROOT}/assets/schemas/profiles/storyboard.profile.json`** -- Perfil, escenas por defecto y variante narrative
