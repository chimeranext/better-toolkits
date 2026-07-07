---
name: service-blueprint
version: 1.0.0
description: >
  Direct creation of Service Blueprints. Use when the user explicitly
  asks for "service blueprint", "plano de servicio", "blueprint",
  "procesos internos", "backstage", "frontstage",
  "linea de visibilidad", "line of visibility",
  "/service-blueprint", or when mapping internal processes
  behind a customer journey. Shortcut that skips map type selection.
---

# Plano de Servicio (Service Blueprint)

Atajo directo para crear un Plano de Servicio (Service Blueprint) sin pasar por la
seleccion de tipo de mapa. Usa el mismo flujo que el Taller de Mapas UX pero con
el tipo de mapa ya definido: perfil `service-blueprint`.

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
  > Es este el persona que queres usar para el plano?
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

> "Cual es el producto o servicio especifico que vamos a mapear en este plano?
> (ej: 'proceso de atencion en clinica veterinaria', 'flujo de entrega de pedidos', 'servicio de soporte tecnico')"

Registrar como `product_context`. Este valor se usara en todo el mapa para dar
contexto a las etapas y preguntas.

---

## Paso 2 -- OMITIDO

El tipo de mapa ya esta definido: **Plano de Servicio (Service Blueprint)**,
perfil `service-blueprint`.

Informar al usuario:

> "Vamos a crear un **Plano de Servicio (Service Blueprint)** para **[nombre del persona]**
> usando **[product_context]**.
>
> El Plano de Servicio va mas alla del viaje del cliente: captura tanto lo que el cliente
> ve y experimenta (frontstage) como los procesos internos que lo hacen posible
> (backstage), separados por la **linea de visibilidad (line of visibility)**."

---

## Paso 3 -- Recopilar Datos (Data Collection)

Leer `${CLAUDE_PLUGIN_ROOT}/references/methodology.md` antes de este paso.

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

Para cada fase (una a la vez), hacer estas preguntas en orden:

**Preguntas base (experiencia del cliente):**

1. "Que hace **[nombre]** durante la etapa de **[fase]** con **[product_context]**?"
   -> `actions`

2. "Que esta pensando o sintiendo **[nombre]** en esta etapa?"
   -> `thoughts`

3. "Que le frustra o le duele en este punto?"
   -> `frustrations`

4. "Del 1 al 5, como calificarias su estado emocional en esta etapa?
   (1=muy mal, 2=mal, 3=neutral, 4=bien, 5=muy bien)"
   -> `emotion.level`
   Basado en la descripcion, sugerir emoji y etiqueta emocional. -> `emotion.emoji`, `emotion.label`

5. "Como interactua con el producto/servicio en esta etapa?
   (ej: app, email, mostrador, telefono, sitio web)"
   -> `touchpoints`

6. "A traves de que canales ocurre esa interaccion?"
   -> `channels`

7. "Que oportunidad de mejora ves desde la perspectiva del cliente?"
   -> `opportunities`

**Preguntas backstage (procesos internos):**

8. "Que acciones visibles realiza el personal o sistema frente al cliente en esta etapa?
   (lo que el cliente SI ve o experimenta directamente)"
   -> `frontstage_actions`

9. "Que sucede detras de escena que el cliente NO ve?
   (procesos internos, coordinacion entre equipos, tareas administrativas)"
   -> `backstage_actions`

10. "Que sistemas, bases de datos o herramientas soportan esta etapa?
    (ej: CRM, sistema de pagos, base de datos de inventario, plataforma de turnos)"
    -> `support_processes`

11. "Que evidencia fisica o tangible recibe el cliente en esta etapa?
    (ej: ticket, confirmacion por email, factura, producto fisico, notificacion push)"
    -> `physical_evidence`

12. "Que tan visible es este proceso para el cliente?
    1. Visible -- el cliente lo ve directamente
    2. Parcialmente visible -- el cliente siente el efecto pero no el proceso
    3. Oculto -- el cliente no tiene conocimiento de este proceso"
    -> `line_of_visibility`

Despues de completar TODAS las fases:

13. "Cuales son los 3-4 puntos de dolor (Pain Points) principales que identificas
    en todo el recorrido de **[nombre]** con **[product_context]**?"
    -> `analysis.pain_points`

14. "Cual es el Momento de Verdad (Moment of Truth) -- el punto donde la experiencia
    cambia decisivamente para bien o para mal?"
    -> `analysis.moments_of_truth`

**PUERTA DE APROBACION**: Confirmar que todos los datos de todas las fases estan
completos antes de continuar.

---

## Paso 4 -- Generar JSON (Generate JSON)

Leer `${CLAUDE_PLUGIN_ROOT}/assets/schemas/profiles/service-blueprint.profile.json`.

Construir el objeto JSON conforme al esquema core. Usar `meta.type: "service-blueprint"`,
`meta.profile: "service-blueprint"`. Incluir los campos backstage en cada fase.

Crear directorio: `docs/ux-research/maps/{titulo-slugificado}/`
Escribir `map.json`.

Presentar resumen:

> "He generado el JSON del plano. Contiene **[N] etapas**, **[N] pain points**,
> y **[N] momentos de verdad**. Queres revisarlo antes de generar la visualizacion?
> 1. Si, mostrame el JSON
> 2. No, continua con la visualizacion"

**PUERTA DE APROBACION**: Confirmar JSON antes de renderizar.

---

## Paso 5 -- Renderizar HTML (Render HTML)

Leer `${CLAUDE_PLUGIN_ROOT}/agents/renderer.md` y despachar el agente renderer
con la ruta al `map.json`.

Una vez completo, informar al usuario:

> "El plano de servicio visual esta listo. Abri el archivo
> `docs/ux-research/maps/{nombre}/map.html` en Chrome o Edge para verlo e
> interactuar con el."

Preguntar:

> "Queres que analice el plano usando el framework de 7 puntos de NN/g?"

**PUERTA DE APROBACION**: Confirmar HTML renderizado.

---

## Paso 6 -- Analisis (Analysis) -- Opcional

Si el usuario dice si, leer la seccion del framework de 7 puntos en
`${CLAUDE_PLUGIN_ROOT}/references/methodology.md`.

Recorrer los 7 puntos del framework NN/g, prestando atencion especial a:

1. **Expectativas no cumplidas** -- Brechas entre lo que el cliente espera y lo que el frontstage entrega
2. **Puntos de contacto innecesarios** -- Pasos del frontstage o backstage que podrian eliminarse
3. **Puntos bajos / friccion** -- Fases con emotion.level 1-2, prioridad maxima
4. **Transiciones de canal** -- Cambios de canal entre fases, especialmente donde el backstage cambia de sistema
5. **Evaluacion de tiempo** -- Etapas donde el cliente espera por procesos del backstage
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
- **`${CLAUDE_PLUGIN_ROOT}/assets/schemas/profiles/service-blueprint.profile.json`** -- Perfil, fases y capas backstage
