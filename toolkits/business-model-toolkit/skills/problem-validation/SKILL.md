---
name: problem-validation
version: 2.0.0
description: >
  This skill should be used when the user asks to "validate my problem",
  "founder profile", "customer forces", "customer profile",
  "market research", "problem interview", "perfil del fundador",
  "validar mi idea", "validar mi problema", "fuerzas del cliente",
  "perfil del cliente", "investigacion de mercado",
  "entrevista del problema", "/problem-validation",
  or wants guided help with the first stage of building a business model:
  understanding the founder, validating the problem, profiling the customer,
  mapping customer forces, and researching the market.
  Covers Phases 1-5 of the startup lifecycle (Space 1: Problem-Hypothesis).
---

# Validacion del Problema (Problem Validation)

Dialogo guiado interactivo para el **Espacio 1: Problema-Hipotesis** del framework
de startup. Cubre desde el perfil del fundador hasta la investigacion de mercado,
asegurando que el problema sea real y suficientemente doloroso antes de disenar
la solucion. Combina Running Lean (Maurya), metodologia del Founder Institute
y Desarrollo de Realidad Sintetica (SRD -- Synthetic Reality Development).

## Regla de idioma

Todo el contenido generado debe estar en **espanol**. Los terminos de negocio se presentan
en formato **"espanol (English)"** la primera vez que aparecen, para que el emprendedor
aprenda la terminologia en ambos idiomas. Despues de la primera mencion, se puede usar
el acronimo solo. Nombres propios de frameworks y libros se mantienen en su idioma original.

## Directorio de salida

Todos los archivos van en `./business/` -- leer `${CLAUDE_PLUGIN_ROOT}/references/output-structure.md`
para el arbol completo de directorios.

## Regla de personalizacion

**Siempre Opcion B** -- reemplazar TODOS los marcadores genericos con contexto del proyecto.
Nunca usar ejemplos genericos.

## Estilo de preguntas

Una pregunta a la vez. Opcion multiple cuando sea posible. Esperar respuesta antes de avanzar.

## Modos de ejecucion

### Modo normal (por defecto)
Escribe todos los entregables en `./business/`.

### Modo simulacion (what-if)
Se activa cuando el usuario dice "simulacion", "prueba", "what-if",
"no guardes nada", o agrega `--what-if` al comando.

En modo simulacion:
- **NO** crear directorios ni escribir archivos
- **NO** usar las herramientas Write, Edit o Bash para creacion de archivos
- **SI** recorrer todas las fases interactivamente (preguntas, puertas de aprobacion)
- **SI** presentar el contenido completo de cada entregable en la conversacion como bloque de codigo
- **SI** prefijar cada entregable con un encabezado mostrando que SE ESCRIBIRIA:

```
[SIMULACION] Se escribiria: ./business/01-problema-hipotesis/01-perfil-fundador.md
```

- **SI** rastrear el progreso como si los archivos se hubieran escrito
- Al final, presentar un resumen de todos los archivos que SE HABRIAN creado
- Ofrecer: "Queres que escriba todos estos archivos ahora? (sale del modo simulacion)"

Si acepta, cambiar a modo normal y escribir todos los entregables acumulados de una vez.

### Deteccion del modo

Al INICIO de la sesion, buscar senales de simulacion:
1. El usuario dice explicitamente "simulacion", "what-if", "prueba", "--what-if"
2. El usuario dice "probemos con..." o "quiero probar" o "sin guardar"
3. Si no es claro, preguntar: "Queres que escriba los archivos o preferis modo simulacion (sin guardar)?"

Anunciar el modo claramente:
- Normal: "Modo normal -- los archivos se guardaran en `./business/`"
- Simulacion: "Modo simulacion -- nada se guarda, todo se muestra en la conversacion"

## Puerta obligatoria

NO generar ningun entregable hasta que las preguntas de la fase correspondiente hayan sido
respondidas y el usuario haya aprobado la seccion. Preguntar UNA A LA VEZ. Esperar respuesta.

---

## Vista general del Espacio 1

```
ESPACIO 1: PROBLEMA-HIPOTESIS (Fases 1-5)
  |-- Fase 1: Perfil del Fundador      -> 01-problema-hipotesis/01-perfil-fundador.md
  |-- Fase 2: Validacion del Problema  -> 01-problema-hipotesis/02-entrevista-problema.md
  |-- Fase 3: Perfil del Cliente       -> 01-problema-hipotesis/03-perfil-expectativas-cliente.md
  |-- Fase 4: Fuerzas del Cliente      -> 01-problema-hipotesis/04-fuerzas-del-cliente.md
  |-- Fase 5: Investigacion de Mercado -> 01-problema-hipotesis/05-investigacion-mercado.md
  +-- PUERTA 1: El problema es real y suficientemente doloroso?
```

---

## Fase 1: Perfil del Fundador (Founder Profile) -- 3-4 preguntas

Leer plantilla: `${CLAUDE_PLUGIN_ROOT}/assets/templates/founder-profile.md`

El perfil del fundador usa formato de README de perfil de GitHub con insignias (badges)
de shields.io, secciones con emojis, linea del tiempo profesional, portafolio de startups
y visualizacion de habilidades.

**PF-1 -- Tu por que**: "Por que estas emprendiendo? Describi como sera tu vida en 3-5 anos
si lanzas tu empresa vs si dejas de emprender."

**PF-2 -- Historia y trayectoria**: "Contame brevemente tu historia en 5 puntos:
infancia, formacion, carrera, emprendimiento y vision del futuro.
Que startups o proyectos previos tenes? Logros cuantificables?"

**PF-3 -- Habilidades y calificacion unica**: "Cuales son tus habilidades tecnicas y blandas
principales? Por que estas unicamente calificado/a para resolver este problema?"

**PF-4 -- Tiempo, metas y enlaces**: "Cuantas horas semanales podes dedicarle? Metas principales?
Pasame tus enlaces: LinkedIn, GitHub, portafolio, redes sociales."

Generar `01-problema-hipotesis/01-perfil-fundador.md` con insignias de shields.io para
habilidades, linea del tiempo profesional, portafolio de startups y todas las secciones
de la plantilla. Presentar. Esperar aprobacion.

## Fase 2: Validacion del Problema (Problem Validation) -- 4-6 preguntas

Leer plantilla: `${CLAUDE_PLUGIN_ROOT}/assets/templates/entrevista-problema.md`

Explorar el problema usando los 4 componentes de Running Lean:
Detonante, Frecuencia, Relevancia, Viabilidad Tecnica.

**Siempre Opcion B**: Reemplazar TODOS los marcadores genericos con contexto del proyecto.

Generar `01-problema-hipotesis/02-entrevista-problema.md`. Presentar. Esperar aprobacion.

## Fase 3: Perfil del Cliente (Customer Profile) -- 4-6 preguntas

Leer plantilla: `${CLAUDE_PLUGIN_ROOT}/assets/templates/perfil-expectativas-cliente.md`

Cubrir: Demografia, Ikigai, Dolores y Ganancias (Pains/Gains), Trabajos por Hacer del
Cliente (JTBD -- Jobs-to-be-Done) con dimensiones de complejidad.

Poblar las secciones 6-12 con respuestas de la Fase 2 -- no volver a preguntar.

**Regla de contextualizacion de las Dimensiones de Complejidad (Opcion B)**:
Las 6 dimensiones de complejidad NO deben presentarse como preguntas genericas abstractas.
Antes de preguntar, explicar al usuario para que sirven y en que contexto responderlas:

1. Introducir con: "Queremos entender **que tan dificil es para vos [el trabajo/proceso
   especifico identificado en el JTBD]** -- desde [inicio del proceso] hasta [fin del proceso]."
2. Cada nivel de cada dimension debe reescribirse con el contexto del proyecto:
   - Generico: "Necesito herramientas especializadas disponibles en el mercado"
   - Contextualizado: "Necesite documentos especiales (cartas de referencia, comprobantes)"
3. Las descripciones de cada nivel deben usar el lenguaje del usuario, no jerga de frameworks.
4. Incluir el indicador numerico `(X/5)` junto a los emojis para accesibilidad en terminales.

Generar `01-problema-hipotesis/03-perfil-expectativas-cliente.md`. Presentar. Esperar aprobacion.

## Fase 4: Fuerzas del Cliente (Customer Forces) -- 3-4 preguntas

Leer plantilla: `${CLAUDE_PLUGIN_ROOT}/assets/templates/fuerzas-del-cliente.md`

Mapear las 4 fuerzas de Ash Maurya: Empuje (Push), Atraccion (Pull),
Ansiedad (Anxiety) e Inercia (Inertia). Calcular el balance.

Generar `01-problema-hipotesis/04-fuerzas-del-cliente.md`. Presentar. Esperar aprobacion.

## Fase 5: Investigacion de Mercado (Market Research) -- 3-4 preguntas + agente automatico

Al iniciar esta fase, lanzar automaticamente un agente de investigacion en segundo plano
(Agent tool, `run_in_background: true`) con el siguiente prompt adaptado al proyecto:

```
Investigar el mercado de [industria/sector] en [pais/region]. Necesito:
1. TODAS las plataformas/alternativas que la gente usa para [resolver el problema].
2. Startups fallidas que intentaron resolver esto en [region] y por que fracasaron.
3. Tamano de mercado: hogares/usuarios, TAM, SAM, SOM con datos reales y fuentes.
4. Analisis de competidores clave con fortalezas y debilidades.
Buscar en espanol e ingles. Retornar hallazgos con fuentes/URLs.
```

Mientras el agente investiga, hacer las preguntas complementarias al usuario:

**IM-1**: "Conoces competidores directos? Si tenes URLs, pasámelas para analizarlos
con Chrome DevTools (capturas de pantalla + analisis de la interfaz en tiempo real)."

Si el usuario proporciona URLs de competidores, usar Chrome DevTools MCP
(`navigate_page` + `take_screenshot` + `take_snapshot`) para analizar la interfaz,
funcionalidades, precios y debilidades del competidor con datos reales.

**IM-2**: "Conoces startups que hayan intentado resolver esto y fracasaron? Por que fallaron?"

**IM-3**: "Quienes son tus 3-5 Clientes Lideres (Lead Customers) -- personas que mostraron
mas dolor y disposicion a pagar?"

Cuando el agente de investigacion termine, combinar sus hallazgos con las respuestas del
usuario para generar `01-problema-hipotesis/05-investigacion-mercado.md`.
Presentar. Esperar aprobacion.

---

## PUERTA 1: Validacion del Problema

Presentar resumen y preguntar:
> "Espacio 1 completo. Antes de pasar a disenar la solucion, validemos:
> - Las Fuerzas del Cliente tienen balance positivo?
> - Hay evidencia de que el problema es real (entrevistas, datos)?
> - El mercado es suficientemente grande?
> Avanzamos al Espacio 2 o necesitamos ajustar algo?"

Si el usuario aprueba, indicar que el siguiente paso es la fase de
Diseno de Solucion (Solution Design) -- Fases 6-8.

---

## Principios clave

- **Una pregunta a la vez** -- nunca abrumar con multiples preguntas
- **Opcion multiple cuando sea posible** -- mas facil de responder; abierta cuando sea necesario
- **Siempre Opcion B** -- personalizar cada marcador generico con contexto del proyecto
- **Puertas de aprobacion** -- presentar cada entregable, esperar aprobacion antes de avanzar
- **Puertas de validacion** -- verificar antes de avanzar entre espacios
- **Problema antes que Solucion** -- nunca saltar al diseno sin validar el problema
- **Espanol como base** -- con terminos de negocio en formato "espanol (English)" la primera vez
- **Diagramas en Mermaid** -- todo diagrama de flujo, maquina de estados, arquitectura o
  secuencia debe usar sintaxis Mermaid (```mermaid). No usar ASCII art ni diagramas de texto.

## Recursos adicionales

### Archivos de referencia
- **`${CLAUDE_PLUGIN_ROOT}/references/methodology.md`** -- Bancos de preguntas detallados, reglas de personalizacion
- **`${CLAUDE_PLUGIN_ROOT}/references/output-structure.md`** -- Estructura de directorios, detalles de archivos, puertas de validacion
- **`${CLAUDE_PLUGIN_ROOT}/references/readme-guide.md`** -- Patrones de generacion de README

### Archivos de plantilla (leer antes de generar)
- **`${CLAUDE_PLUGIN_ROOT}/assets/templates/founder-profile.md`** -- Perfil del fundador estilo GitHub con insignias, linea del tiempo, portafolio
- **`${CLAUDE_PLUGIN_ROOT}/assets/templates/entrevista-problema.md`** -- Entrevista del problema (7 secciones)
- **`${CLAUDE_PLUGIN_ROOT}/assets/templates/perfil-expectativas-cliente.md`** -- Perfil del cliente con JTBD (Jobs-to-be-Done)
- **`${CLAUDE_PLUGIN_ROOT}/assets/templates/fuerzas-del-cliente.md`** -- Diagrama de las 4 fuerzas del cliente
