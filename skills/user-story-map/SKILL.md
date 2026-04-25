---
name: user-story-map
version: 1.0.0
description: >
  Direct creation of User Story Maps for agile planning. Use when the user
  asks for "user story map", "mapa de historias", "story map",
  "historias de usuario", "planificacion agil", "agile planning",
  "backlog", "sprint planning", "/user-story-map",
  or wants to break down a user journey into development stories.
---

# Mapa de Historias de Usuario (User Story Map)

Atajo directo para crear un Mapa de Historias de Usuario (User Story Map) sin pasar
por la seleccion de tipo de mapa. Usa el mismo flujo que el Taller de Mapas UX pero
con el tipo de mapa ya definido: perfil `user-story-map`.

## Regla de idioma

Todo el contenido generado debe estar en **espanol**. Los terminos de UX y agile se
presentan en formato **"espanol (English)"** la primera vez que aparecen. Despues de
la primera mencion, se puede usar solo el termino en espanol.

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
  > Es este el persona que queres usar para el mapa de historias?
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

## Paso 1.5 -- Identificar Producto o Servicio

Preguntar:

> "Cual es el producto o funcionalidad especifica que vamos a descomponer en historias?
> (ej: 'app de agendamiento de turnos veterinarios', 'modulo de pagos', 'onboarding de nuevos usuarios')"

Registrar como `product_context`. Este valor define el alcance del mapa.

---

## Paso 2 -- OMITIDO

El tipo de mapa ya esta definido: **Mapa de Historias de Usuario (User Story Map)**,
perfil `user-story-map`.

Informar al usuario:

> "Vamos a crear un **Mapa de Historias de Usuario (User Story Map)** para **[nombre del persona]**
> sobre **[product_context]**.
>
> Este mapa descompone las actividades principales del usuario en historias de desarrollo
> (user stories) con criterios de aceptacion (acceptance criteria), prioridad y estimaciones.
> Es ideal para planificar sprints y construir el backlog (lista de pendientes de desarrollo)."

---

## Paso 3 -- Recopilar Datos (Data Collection)

Leer `${CLAUDE_PLUGIN_ROOT}/references/methodology.md` antes de este paso.

Leer las actividades por defecto desde
`${CLAUDE_PLUGIN_ROOT}/assets/schemas/profiles/user-story-map.profile.json`.

Presentar las actividades predeterminadas:

> "Voy a organizar las historias de **[product_context]** en 6 actividades principales.
> Queres usar estas o personalizarlas?
>
> 1. Descubrir (Discover)
> 2. Evaluar (Evaluate)
> 3. Adquirir (Acquire)
> 4. Configurar (Setup)
> 5. Uso principal (Core Use)
> 6. Extender (Extend)
>
> (Responde 'Si' para usar estas, o describi tus propias actividades)"

Para cada actividad (una a la vez), hacer estas preguntas en orden:

1. "Que hace **[nombre]** en la actividad de **[actividad]** con **[product_context]**?
   Describe las acciones concretas."
   -> `actions`

2. "Cual es la historia de usuario (user story) para esta actividad?
   Usemos el formato: 'Como [persona], quiero [meta], para [beneficio]'
   (ej: 'Como duena de mascota, quiero ver los turnos disponibles, para elegir el mejor horario')"
   -> `user_story`

3. "Cuales son los criterios de aceptacion (acceptance criteria)?
   Escribi uno por linea. Son las condiciones que deben cumplirse para considerar
   esta historia completa.
   (ej: 'El calendario muestra disponibilidad en tiempo real', 'El usuario puede filtrar por especialidad')"
   -> `acceptance_criteria`

4. "Que prioridad tiene esta historia?
   1. Must-have -- critica, el producto no funciona sin esta
   2. Should-have -- importante, agrega valor significativo
   3. Could-have -- deseable, mejora la experiencia pero no es urgente
   4. Won't-have -- fuera del alcance actual (para backlog futuro)"
   -> `priority`

5. "Para que release o sprint esta pensada esta historia? (opcional, deja en blanco si no lo sabes)"
   -> `release` *(opcional)*

6. "Cual es la estimacion de esfuerzo (effort estimate)?
   XS / S / M / L / XL (opcional, deja en blanco si no lo sabes)"
   -> `effort_estimate` *(opcional)*

Despues de completar TODAS las actividades:

7. "Cuales son los 3-4 riesgos o dependencias principales que identificas en este mapa?"
   -> `analysis.pain_points` *(en el contexto del user story map, estos son riesgos/dependencias)*

8. "Cual es la historia mas critica (Most Critical Story) -- la que si falla bloquea el resto?"
   -> `analysis.moments_of_truth[0]`

**PUERTA DE APROBACION**: Confirmar que todas las actividades estan completas antes de continuar.

---

## Paso 4 -- Generar JSON (Generate JSON)

Leer `${CLAUDE_PLUGIN_ROOT}/assets/schemas/profiles/user-story-map.profile.json`.

Construir el objeto JSON conforme al esquema core. Usar `meta.type: "user-story-map"`,
`meta.profile: "user-story-map"`.

Mapear cada actividad como una fase con los campos:
- `id`: slug de la actividad
- `label`: nombre de la actividad
- `actions`, `user_story`, `acceptance_criteria`, `priority`
- `release` (si fue provisto), `effort_estimate` (si fue provisto)

Crear directorio: `docs/ux-research/maps/{titulo-slugificado}/`
Escribir `map.json`.

Presentar resumen:

> "He generado el JSON del mapa de historias. Contiene **[N] actividades** con
> **[N] historias de usuario**. Distribucion de prioridades:
> Must-have: [N], Should-have: [N], Could-have: [N], Won't-have: [N].
> Queres revisarlo antes de generar la visualizacion?
> 1. Si, mostrame el JSON
> 2. No, continua con la visualizacion"

**PUERTA DE APROBACION**: Confirmar JSON antes de renderizar.

---

## Paso 5 -- Renderizar HTML (Render HTML)

Leer `${CLAUDE_PLUGIN_ROOT}/agents/renderer.md` y despachar el agente renderer
con la ruta al `map.json`.

Una vez completo, informar al usuario:

> "El mapa de historias visual esta listo. Abri el archivo
> `docs/ux-research/maps/{nombre}/map.html` en Chrome o Edge para verlo e
> interactuar con el."

Preguntar:

> "Queres que analice el mapa para identificar dependencias y riesgos de planificacion?"

**PUERTA DE APROBACION**: Confirmar HTML renderizado.

---

## Paso 6 -- Analisis (Analysis) -- Opcional

Si el usuario dice si, leer la seccion del framework de 7 puntos en
`${CLAUDE_PLUGIN_ROOT}/references/methodology.md`.

Para el user story map, adaptar el framework a planificacion agile:

1. **Historias sin criterios de aceptacion claros** -- Identificar historias vagas que generaran ambiguedad en desarrollo
2. **Dependencias ocultas** -- Actividades que requieren que otra este completa antes; mapearlo explicitamente
3. **Cuellos de botella** -- Actividades con muchas historias Must-have concentradas; riesgo de bloqueo de sprint
4. **Saltos de canal o contexto** -- Actividades que implican cambios de plataforma no contemplados en las historias
5. **Estimacion vs. valor** -- Historias con esfuerzo XL/L de baja prioridad; candidatas a dividir o descartar
6. **Historia critica** -- Confirmar y expandir la historia mas critica identificada en Paso 3
7. **Quick wins** -- Historias con esfuerzo XS/S y prioridad Must-have o Should-have; priorizarlas en el primer sprint

Presentar hallazgos y recomendar siguiente tipo de mapa:

> "Basado en este mapa de historias, el siguiente paso natural seria crear un
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
- **`${CLAUDE_PLUGIN_ROOT}/assets/schemas/profiles/user-story-map.profile.json`** -- Perfil, actividades y capas agile
