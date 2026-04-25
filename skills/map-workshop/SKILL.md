---
name: map-workshop
version: 1.0.0
description: >
  Guided UX research map creation from scratch. Use when the user asks to
  "create a journey map", "map user experience", "day in the life",
  "experience map", "mapear experiencia", "journey del usuario",
  "mapa de experiencia", "customer journey", "service blueprint",
  "mapa del cliente", "investigacion de usuarios", "UX research",
  "mapear la experiencia del usuario", "como vive mi usuario",
  "mapa de viaje", "experiencia del cliente", "entender a mis usuarios",
  "/map-workshop", or wants to understand their users' experience.
  Detects existing personas and guides non-experts through the full process.
---

# Taller de Mapas UX (UX Map Workshop)

Dialogo guiado interactivo para crear artefactos de investigacion UX profesionales.
Guia desde cero a usuarios sin experiencia en UX research, detectando personas
existentes y produciendo mapas visuales interactivos.

## Regla de idioma

Todo el contenido generado debe estar en **espanol**. Los terminos de UX se presentan
en formato **"espanol (English)"** la primera vez que aparecen, para que el usuario
aprenda la terminologia en ambos idiomas. Despues de la primera mencion, se puede usar
solo el termino en espanol. Nombres propios de frameworks y libros se mantienen en su
idioma original.

## Directorio de salida

`docs/ux-research/maps/{nombre-del-mapa}/` -- contiene `map.json` (fuente de verdad)
y `map.html` (visualizacion interactiva).

## Estilo de preguntas

Una pregunta a la vez. Opcion multiple cuando sea posible. Esperar respuesta antes de avanzar.

## Puerta obligatoria

NO generar ningun artefacto hasta que las preguntas del paso correspondiente hayan sido
respondidas y el usuario haya aprobado la seccion. Preguntar UNA A LA VEZ. Esperar respuesta.

---

## Flujo completo

```
TALLER DE MAPAS UX (6 pasos)
  |-- Paso 1: Detectar Contexto        -> Persona confirmada
  |-- Paso 2: Tipo de Mapa             -> Mapa seleccionado
  |-- Paso 3: Recopilar Datos          -> Todas las fases completas
  |-- Paso 4: Generar JSON             -> map.json escrito
  |-- Paso 5: Renderizar HTML          -> map.html escrito
  |-- Paso 6: Analisis (opcional)      -> Framework de 7 puntos NN/g
  +-- PUERTAS: Aprobacion entre cada paso
```

---

## Paso 1 -- Detectar Contexto (Context Detection)

Leer `${CLAUDE_PLUGIN_ROOT}/agents/persona-builder.md` y despachar el agente persona-builder.

Evaluar el resultado:

- **FOUND_SRD / FOUND_BMT / FOUND_MAP**: Presentar el persona encontrado al usuario.
  Mostrar: nombre, edad, rol, ubicacion, dolor principal (primary pain), contexto.
  Preguntar:

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

## Paso 2 -- Determinar Tipo de Mapa (Map Type Selection)

Leer `${CLAUDE_PLUGIN_ROOT}/references/map-type-guide.md` antes de este paso.

Hacer estas preguntas en orden (desde la perspectiva del usuario final, NO del fundador):

**Pregunta 1**: "Tu usuario final o cliente ya cuenta con algun producto/servicio
existente para atender su problema/necesidad?"

- **No** -> Continuar a pregunta 1b.

- **Si** -> Continuar a pregunta 2.

**Pregunta 1b**: "Queres contar la historia emotiva de tu usuario en escenas
(como un comic o guion visual), o preferes mapear su dia completo y contexto de vida?"

- **Historia emotiva en escenas** -> Seleccionar Guion Visual (Storyboard). Explicar:

  > "Vamos a crear un **Guion Visual (Storyboard)**.
  > Este mapa narra la experiencia del usuario a traves de escenas secuenciales,
  > ideal para comunicar empatia, presentar casos de uso o documentar una experiencia
  > clave de forma visual y emotiva."

- **Dia completo / contexto de vida** -> Seleccionar Mapa de Experiencia (Experience Map). Explicar:

  > "Vamos a crear un **Mapa de Experiencia (Experience Map)** tipo 'Un Dia en la Vida'.
  > Este mapa captura la experiencia general de tu usuario a lo largo de un dia tipico,
  > sin enfocarse en un producto especifico. Es ideal para entender el contexto de vida
  > y descubrir necesidades no atendidas."

**Pregunta 2**: "Es un producto/servicio digital?"

Registrar la respuesta como contexto (afecta los tipos de puntos de contacto despues).

**Pregunta 3**: "Queres entender como tu usuario vive el viaje con ese producto/servicio,
o necesitas planificar las historias de desarrollo (user stories) del equipo tecnico?"

- **Viaje del cliente** -> Continuar a pregunta 4.

- **Planificar desarrollo** -> Seleccionar Mapa de Historias de Usuario (User Story Map). Explicar:

  > "Vamos a crear un **Mapa de Historias de Usuario (User Story Map)**.
  > Este mapa descompone las actividades del usuario en historias de desarrollo
  > con criterios de aceptacion, prioridad y estimaciones. Ideal para planificar
  > sprints y construir el backlog."

**Pregunta 4**: "Necesitas ver solo la experiencia visible del cliente, o tambien los
procesos internos que ocurren detras de escena para entregar ese servicio?"

- **Solo experiencia visible** -> Seleccionar Mapa del Viaje del Cliente (Customer Journey Map). Explicar:

  > "Vamos a crear un **Mapa del Viaje del Cliente (Customer Journey Map)**.
  > Este mapa rastrea la experiencia de tu usuario con tu producto/servicio especifico,
  > desde que lo descubre hasta que lo usa regularmente. Es ideal para encontrar
  > puntos de friccion y mejorar la experiencia."

- **Tambien procesos internos** -> Seleccionar Plano de Servicio (Service Blueprint). Explicar:

  > "Vamos a crear un **Plano de Servicio (Service Blueprint)**.
  > Este mapa va mas alla del viaje del cliente: captura tanto lo que el cliente
  > ve y experimenta (frontstage) como los procesos internos que lo hacen posible
  > (backstage), separados por la linea de visibilidad (line of visibility).
  > Ideal para identificar cuellos de botella operativos y mejorar la entrega del servicio."

Presentar el tipo de mapa seleccionado y pedir aprobacion:

> "Tipo de mapa seleccionado: **[tipo]**. Estas de acuerdo o preferis otro tipo?"

**PUERTA DE APROBACION**: Confirmar tipo de mapa antes de continuar.

---

## Paso 3 -- Recopilar Datos (Data Collection)

Leer `${CLAUDE_PLUGIN_ROOT}/references/methodology.md` antes de este paso.

### Para Mapa de Experiencia (Day in the Life)

Leer las fases por defecto desde
`${CLAUDE_PLUGIN_ROOT}/assets/schemas/profiles/experience-map.profile.json`.

Presentar las fases temporales predeterminadas:

> "Voy a mapear el dia de **[nombre del persona]** en 5 momentos.
> Queres usar estos o personalizarlos?
>
> 1. Manana temprana
> 2. Media manana
> 3. Tarde
> 4. Atardecer
> 5. Noche
>
> (Responde 'Si' para usar estos, o describi tus fases personalizadas)"

Para cada fase (una a la vez), hacer estas preguntas en orden:

1. "Que hace **[nombre]** durante **[fase]** relacionado con [dominio/problema]?"
   -> `actions`

2. "Que esta pensando o sintiendo en ese momento?"
   -> `thoughts`

3. "Que le frustra o le duele en este punto?"
   -> `frustrations`

4. "Del 1 al 5, como calificarias su estado emocional?
   (1=muy mal, 2=mal, 3=neutral, 4=bien, 5=muy bien)"
   -> `emotion.level`
   Basado en la descripcion del usuario, sugerir un emoji y una etiqueta emocional
   (ej: "Frustrada", "Aliviado", "Ansioso"). -> `emotion.emoji`, `emotion.label`

5. "Como esta interactuando con soluciones existentes en este momento?"
   -> `touchpoints`

6. "Que oportunidad de mejora ves aca?"
   -> `opportunities`

Despues de completar TODAS las fases:

7. "Cuales son los 3-4 puntos de dolor (Pain Points) principales que identificas
   en todo el recorrido de [nombre]?"
   -> `analysis.pain_points`

8. "Cual es el Momento de Verdad (Moment of Truth) -- el punto donde la experiencia
   cambia decisivamente para bien o para mal?"
   -> `analysis.moments_of_truth`

### Para Customer Journey Map

Primero preguntar: "Cual es el producto/servicio especifico que queremos mapear?"

Leer las fases por defecto desde
`${CLAUDE_PLUGIN_ROOT}/assets/schemas/profiles/journey-map.profile.json`.

Presentar las etapas de viaje predeterminadas:

> "Voy a mapear el viaje de **[nombre del persona]** con **[producto/servicio]**
> en 6 etapas. Queres usar estas o personalizarlas?
>
> 1. Descubrimiento (Awareness)
> 2. Consideracion (Consideration)
> 3. Adquisicion (Acquisition)
> 4. Onboarding
> 5. Uso (Usage)
> 6. Retencion (Retention)
>
> (Responde 'Si' para usar estas, o describi tus etapas personalizadas)"

Para cada fase, hacer las mismas 6 preguntas del Mapa de Experiencia, MAS:

7. "A traves de que canales interactua con el producto en esta fase?
   (ej: app movil, web, email, redes sociales, presencial, telefono)"
   -> `channels`

Despues de completar todas las fases, hacer las mismas preguntas de analisis
(pain points y momentos de verdad).

### Para Plano de Servicio (Service Blueprint)

Primero preguntar: "Cual es el producto o servicio especifico que vamos a mapear en este plano?"
Registrar como `product_context`.

Leer las fases por defecto desde
`${CLAUDE_PLUGIN_ROOT}/assets/schemas/profiles/service-blueprint.profile.json`.

Presentar las etapas predeterminadas:

> "Voy a mapear el plano de servicio de **[product_context]** en 6 etapas.
> Queres usar estas o personalizarlas?
>
> 1. Descubrimiento (Awareness)
> 2. Consideracion (Consideration)
> 3. Adquisicion (Acquisition)
> 4. Entrega del servicio (Service Delivery)
> 5. Post-servicio (Post-service)
> 6. Retencion (Retention)
>
> (Responde 'Si' para usar estas, o describi tus etapas personalizadas)"

Para cada fase, hacer las mismas 6 preguntas base del Customer Journey Map, MAS:

7. "Que acciones visibles realiza el personal o sistema frente al cliente en esta etapa?
   (lo que el cliente SI ve o experimenta directamente)"
   -> `frontstage_actions`

8. "Que sucede detras de escena que el cliente NO ve?
   (procesos internos, coordinacion entre equipos, tareas administrativas)"
   -> `backstage_actions`

9. "Que sistemas, bases de datos o herramientas soportan esta etapa?
   (ej: CRM, sistema de pagos, base de datos de inventario, plataforma de turnos)"
   -> `support_processes`

10. "Que evidencia fisica o tangible recibe el cliente en esta etapa?
    (ej: ticket, confirmacion por email, factura, producto fisico, notificacion push)"
    -> `physical_evidence`

11. "Que tan visible es este proceso para el cliente?
    1. Visible -- el cliente lo ve directamente
    2. Parcialmente visible -- el cliente siente el efecto pero no el proceso
    3. Oculto -- el cliente no tiene conocimiento de este proceso"
    -> `line_of_visibility`

Despues de completar todas las fases, hacer las mismas preguntas de analisis
(pain points y momentos de verdad).

### Para Guion Visual (Storyboard)

Leer las escenas por defecto desde
`${CLAUDE_PLUGIN_ROOT}/assets/schemas/profiles/storyboard.profile.json`.

Primero preguntar sobre la cantidad de escenas:

> "Cuantas escenas queres en el guion?
>
> Por defecto uso 6 escenas que cubren el arco completo de problema a solucion:
> 1. Contexto -- la situacion inicial
> 2. Problema -- el conflicto o dolor
> 3. Busqueda -- el usuario busca una solucion
> 4. Descubrimiento -- encuentra algo prometedor
> 5. Solucion -- lo usa y funciona
> 6. Resultado -- el estado final mejorado
>
> Responde 'Si' para usar estas 6, o indica cuantas escenas necesitas"

Para cada escena (una a la vez), hacer estas preguntas en orden:

1. "Que esta pasando en la escena **[N] -- [titulo]**? Describe la situacion."
   -> `scene_description`

2. "Donde y cuando ocurre esta escena?"
   -> `scene_setting`

3. "Hay algun dialogo o pensamiento clave? (opcional)"
   -> `scene_dialogue`

4. "Cual es el estado de animo general en esta escena?"
   -> `scene_mood`

5. "Del 1 al 5, como se siente **[nombre]** en esta escena? (1=muy mal, 5=muy bien)"
   -> `emotion.level`
   Sugerir emoji y etiqueta emocional. -> `emotion.emoji`, `emotion.label`

Despues de todas las escenas, preguntar:

6. "En una frase, cual es el mensaje central que queres que el espectador recuerde?"
   -> `analysis.moments_of_truth[0].description`

### Para Mapa de Historias de Usuario (User Story Map)

Primero preguntar: "Cual es el producto o funcionalidad especifica que vamos a descomponer en historias?"
Registrar como `product_context`.

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

1. "Que hace **[nombre]** en la actividad de **[actividad]** con **[product_context]**?"
   -> `actions`

2. "Cual es la historia de usuario (user story)?
   Formato: 'Como [persona], quiero [meta], para [beneficio]'"
   -> `user_story`

3. "Cuales son los criterios de aceptacion (acceptance criteria)? (uno por linea)"
   -> `acceptance_criteria`

4. "Que prioridad tiene esta historia?
   1. Must-have  2. Should-have  3. Could-have  4. Won't-have"
   -> `priority`

5. "Para que release o sprint? (opcional)"
   -> `release`

6. "Estimacion de esfuerzo? XS / S / M / L / XL (opcional)"
   -> `effort_estimate`

Despues de todas las actividades:

7. "Cuales son los 3-4 riesgos o dependencias principales que identificas?"
   -> `analysis.pain_points`

8. "Cual es la historia mas critica que si falla bloquea el resto?"
   -> `analysis.moments_of_truth[0]`

**PUERTA DE APROBACION**: Confirmar que todos los datos de todas las fases estan
completos antes de continuar.

---

## Paso 4 -- Generar JSON (Generate JSON)

Leer el perfil activo desde
`${CLAUDE_PLUGIN_ROOT}/assets/schemas/profiles/{perfil-seleccionado}.profile.json`.

Construir el objeto JSON conforme al esquema core + capas activas:

```json
{
  "meta": {
    "type": "[experience-map | journey-map | service-blueprint | storyboard | user-story-map]",
    "profile": "[experience-map | journey-map | service-blueprint | storyboard | user-story-map]",
    "variant": "[day-in-the-life | narrative | null]",
    "title": "[titulo descriptivo del mapa]",
    "created": "YYYY-MM-DD",
    "updated": "YYYY-MM-DD",
    "version": 1
  },
  "persona": {
    "name": "...",
    "age": 0,
    "role": "...",
    "location": "...",
    "avatar_emoji": "...",
    "primary_pain": "...",
    "context": "..."
  },
  "phases": [
    {
      "id": "...",
      "label": "...",
      "icon": "...",
      "actions": ["..."],
      "thoughts": ["..."],
      "frustrations": ["..."],
      "emotion": {
        "level": 3,
        "label": "...",
        "emoji": "..."
      },
      "touchpoints": ["..."],
      "opportunities": ["..."],
      "channels": ["..."]
    }
  ],
  "analysis": {
    "pain_points": ["..."],
    "moments_of_truth": [
      {
        "phase": "...",
        "description": "..."
      }
    ],
    "recommended_next_map": null
  }
}
```

Crear directorio: `docs/ux-research/maps/{titulo-slugificado}/`

Escribir `map.json`.

Presentar un resumen:

> "He generado el JSON del mapa. Contiene **[N] fases**, **[N] pain points**,
> y **[N] momentos de verdad**.
>
> Queres revisarlo antes de generar la visualizacion?
> 1. Si, mostrame el JSON
> 2. No, continua con la visualizacion"

**PUERTA DE APROBACION**: Confirmar JSON antes de renderizar.

---

## Paso 5 -- Renderizar HTML (Render HTML)

Leer `${CLAUDE_PLUGIN_ROOT}/agents/renderer.md` y despachar el agente renderer
con la ruta al `map.json` generado en el Paso 4.

Una vez completo, informar al usuario:

> "El mapa visual esta listo. Abri el archivo
> `docs/ux-research/maps/{nombre}/map.html` en Chrome o Edge para verlo e
> interactuar con el.
>
> Podes editar cualquier celda directamente en el navegador y usar los botones
> 'Save JSON' / 'Refresh from JSON' para sincronizar los cambios."

Preguntar:

> "Queres que analice el mapa usando el framework de 7 puntos de NN/g
> (Nielsen Norman Group)?
> 1. Si, hacer el analisis
> 2. No, el mapa esta completo"

**PUERTA DE APROBACION**: Confirmar HTML renderizado.

---

## Paso 6 -- Analisis (Analysis) -- Opcional

Si el usuario dice si, leer la seccion del framework de 7 puntos en
`${CLAUDE_PLUGIN_ROOT}/references/methodology.md`.

Recorrer cada punto del framework:

### (1) Expectativas no cumplidas (Unmet Expectations)

"Donde la experiencia entra en conflicto con lo que el usuario espera?"

Revisar los rows de `thoughts` y `frustrations` de cada fase. Identificar brechas
entre expectativa y realidad.

### (2) Puntos de contacto innecesarios (Unnecessary Touchpoints)

"Hay pasos que podrian eliminarse sin perder valor para el usuario?"

Revisar `touchpoints` de cada fase. Preguntar: "Si removieramos este paso,
mejoraria la experiencia?"

### (3) Puntos bajos / friccion (Low Points / Friction)

"Donde esta el punto emocional mas bajo?"

Identificar las fases con `emotion.level` de 1-2. Estos son zonas de prioridad
maxima para intervencion. Aplicar la regla de Peak-End (el usuario recuerda
el pico y el final de la experiencia).

### (4) Transiciones de canal (High-Friction Channel Transitions)

"Donde cambia el usuario de dispositivo o canal?"

Buscar cambios en `channels` entre fases adyacentes. Los traspasos de canal
son la fuente mas comun de abandono y frustracion.

### (5) Evaluacion de tiempo (Time Evaluation)

"Las inversiones de tiempo son proporcionales al valor recibido?"

Identificar fases donde el usuario espera o donde el tiempo se siente
desperdiciado.

### (6) Momentos de verdad (Moments of Truth)

Confirmar y expandir los momentos de verdad identificados en el Paso 3.
Criterios: alta carga emocional + punto de decision del usuario +
consecuencia duradera. Maximo 3 por mapa.

### (7) Puntos altos (High Points)

"Que esta funcionando bien y puede amplificarse?"

Identificar fases con `emotion.level` de 4-5. Los puntos altos revelan
lo que la experiencia hace bien. Protegerlos durante el rediseno.

---

### Presentar hallazgos

Presentar un resumen estructurado con los hallazgos de cada punto del framework.

Recomendar siguiente tipo de mapa:

> "Basado en este analisis, el siguiente paso natural seria crear un
> **[tipo_de_mapa_recomendado]** para **[razon justificada]**."

Actualizar `analysis.recommended_next_map` en el JSON si corresponde.

---

## Puertas de aprobacion (Approval Gates)

Resumen de todas las puertas del flujo:

1. **Despues del Paso 1** -- Persona confirmado
2. **Despues del Paso 2** -- Tipo de mapa seleccionado y aprobado
3. **Despues del Paso 3** -- Todas las fases completadas y revisadas
4. **Despues del Paso 4** -- JSON generado y aprobado
5. **Despues del Paso 5** -- HTML renderizado y confirmado

---

## Principios clave

- **Una pregunta a la vez** -- nunca abrumar con multiples preguntas
- **Opcion multiple cuando sea posible** -- mas facil de responder
- **Puertas de aprobacion** -- presentar resultado, esperar aprobacion antes de avanzar
- **Espanol como base** -- con terminos UX en formato "espanol (English)" la primera vez
- **Perspectiva del usuario final** -- las preguntas siempre son sobre el usuario, no sobre el fundador
- **Datos antes que visualizacion** -- el JSON es la fuente de verdad, el HTML es derivado
- **No fabricar datos** -- todo viene del dialogo con el usuario o de fuentes existentes

## Recursos

### Archivos de referencia
- **`${CLAUDE_PLUGIN_ROOT}/references/map-type-guide.md`** -- Arbol de decision y comparacion de tipos de mapa
- **`${CLAUDE_PLUGIN_ROOT}/references/methodology.md`** -- Metodologia NN/g, framework de 7 puntos, guia de fases

### Agentes
- **`${CLAUDE_PLUGIN_ROOT}/agents/persona-builder.md`** -- Busca personas existentes o guia la creacion
- **`${CLAUDE_PLUGIN_ROOT}/agents/renderer.md`** -- Compone HTML interactivo desde JSON

### Esquemas y perfiles
- **`${CLAUDE_PLUGIN_ROOT}/assets/schemas/core.schema.json`** -- Esquema core del JSON
- **`${CLAUDE_PLUGIN_ROOT}/assets/schemas/profiles/experience-map.profile.json`** -- Perfil de Mapa de Experiencia
- **`${CLAUDE_PLUGIN_ROOT}/assets/schemas/profiles/journey-map.profile.json`** -- Perfil de Customer Journey Map
- **`${CLAUDE_PLUGIN_ROOT}/assets/schemas/profiles/service-blueprint.profile.json`** -- Perfil de Plano de Servicio
- **`${CLAUDE_PLUGIN_ROOT}/assets/schemas/profiles/storyboard.profile.json`** -- Perfil de Guion Visual
- **`${CLAUDE_PLUGIN_ROOT}/assets/schemas/profiles/user-story-map.profile.json`** -- Perfil de Mapa de Historias de Usuario
