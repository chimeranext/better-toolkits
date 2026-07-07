---
name: solution-design
version: 2.0.0
description: >
  This skill should be used when the user asks to "build a business model canvas",
  "business model canvas", "BMC", "create my BMC", "build my BMC",
  "lean canvas", "solution interview", "MVP experiment",
  "modelo de negocio", "canvas de modelo de negocio",
  "entrevista de solucion", "experimento MVP",
  "arma mi business model canvas", "/solution-design",
  or wants guided help designing the solution, building the Business Model Canvas
  (14 modules), conducting the solution interview, and designing the MVP experiment.
  Covers Phases 6-8 of the startup lifecycle (Space 2: Solution-Validation).
  Requires Space 1 (Problem Validation) to be completed first.
---

# Diseno de Solucion (Solution Design)

Dialogo guiado interactivo para el **Espacio 2: Solucion-Validacion** del framework
de startup. Cubre el Modelo de Negocio Canvas (BMC -- Business Model Canvas) con sus
14 modulos, la Entrevista de Solucion y el Experimento MVP. Combina Running Lean (Maurya),
Lean Canvas y Desarrollo de Realidad Sintetica (SRD -- Synthetic Reality Development).

**Prerrequisito**: El Espacio 1 (Problema-Hipotesis) debe estar completo. Los archivos
en `./business/01-problema-hipotesis/` proporcionan el contexto necesario para disenar
la solucion. Si no existen, sugerir al usuario completar primero la validacion del problema.

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
[SIMULACION] Se escribiria: ./business/02-solucion-validacion/00-bmc-indice.md
```

- **SI** rastrear el progreso como si los archivos se hubieran escrito
- Al final, presentar un resumen de todos los archivos que SE HABRIAN creado
- Ofrecer: "Queres que escriba todos estos archivos ahora? (sale del modo simulacion)"

Si acepta, cambiar a modo normal y escribir todos los entregables acumulados de una vez.

## Puerta obligatoria

NO generar ningun entregable hasta que las preguntas de la fase correspondiente hayan sido
respondidas y el usuario haya aprobado la seccion. Preguntar UNA A LA VEZ. Esperar respuesta.

---

## Vista general del Espacio 2

```
ESPACIO 2: SOLUCION-VALIDACION (Fases 6-8)
  |-- Fase 6: Modelo de Negocio Canvas       -> 02-solucion-validacion/00 + 14 modulos
  |-- Fase 7: Entrevista de Solucion         -> 02-solucion-validacion/15-entrevista-solucion.md
  |              + Scorecard Validacion      -> 02-solucion-validacion/15a-scorecard-validacion-hipotesis.md
  |-- Fase 8: Experimento MVP (6 tipos)      -> 02-solucion-validacion/16-experimento-mvp.md
  +-- PUERTA 2: La solucion resuelve el problema y alguien pagaria?
```

---

## Fase 6: Modelo de Negocio Canvas (BMC -- Business Model Canvas) -- 5 rondas de preguntas

Leer metodologia: `${CLAUDE_PLUGIN_ROOT}/references/methodology.md`

Generar 15 archivos en `02-solucion-validacion/` (00 indice + 14 modulos).
Agrupar preguntas en 5 rondas segun `${CLAUDE_PLUGIN_ROOT}/references/methodology.md`.

Para el modulo 13 (Metricas de Impacto), incorporar el Sistema de Metricas de Impacto
(IRIS+ -- Impact Reporting and Investment Standards) cuando aplique.

**Siempre Opcion B**: Reemplazar TODOS los marcadores genericos con contexto del proyecto.
Usar los hallazgos del Espacio 1 (perfil del fundador, entrevista del problema, perfil
del cliente, fuerzas del cliente, investigacion de mercado) como insumos directos.

## Fase 7: Entrevista de la Solucion (Solution Interview) -- 2-3 preguntas

Leer plantillas:
- `${CLAUDE_PLUGIN_ROOT}/assets/templates/entrevista-solucion.md` -- guia estructurada con Commitment Ladder
- `${CLAUDE_PLUGIN_ROOT}/assets/templates/hypothesis-validation-scorecard.md` -- NUEVO: scorecard de 4 criterios de Alvarez

**Proceso enriquecido**:

1. **Ejecutar la Entrevista de Solucion** usando la guia `entrevista-solucion.md` + invocando
   `business-model-toolkit:customer-interview-system` para cada entrevista individual
   (outreach + notes per-interview + V/I/AI summary + speech pattern analysis).

2. **Generar el archivo estructurado** `02-solucion-validacion/15-entrevista-solucion.md`
   consolidando hallazgos del set de entrevistas.

3. **Evaluar con el Hypothesis Validation Scorecard** (nuevo): despues de al menos 5
   entrevistas de solucion, aplicar los **4 criterios de Alvarez** (LCD cap. 6) para decidir
   si la hipotesis esta validada, parcialmente validada, invalidada, o indeterminada:
   - **Criterio 1**: Problema real confirmado
   - **Criterio 2**: El cliente cree que el problema debe resolverse
   - **Criterio 3**: El cliente ya ha invertido (tiempo/dinero/esfuerzo) intentando resolverlo
   - **Criterio 4**: No hay bloqueo externo insuperable
   - **Umbral de validacion**: los 4 criterios se cumplen en >=70% de las entrevistas

4. **Identificar earlyvangelists** (pyramid de Steve Blank) del pool de entrevistados:
   candidatos ideales para el MVP experiment (Fase 8).

Generar ademas `02-solucion-validacion/15a-scorecard-validacion-hipotesis.md` usando el
template. Routing por veredicto (debe coincidir con la guidance del scorecard template):

- **VALIDADA** (≥70%): avanzar a Fase 8 (MVP Experiment) con earlyvangelists identificados como candidates para el test inicial.
- **PARCIALMENTE VALIDADA** (40-69%): NO avanzar a Fase 8. Refinar la hipótesis (probablemente ICP demasiado amplio — considerar split en sub-segmentos) y re-validar con mínimo 5 entrevistas adicionales post-refinamiento. Solo si tras refinamiento el veredicto sigue PARCIAL, considerar volver a Fase 6 (BMC) o Fase 2a (Lluvia de Supuestos) para reformular más profundamente.
- **INVALIDADA** (<40%): NO avanzar a Fase 8. **Pivot**: volver a Fase 2a (Lluvia de Supuestos) y revisar qué supuestos del cuadrante B (alto riesgo + desconocido) fallaron; reformular la hipótesis desde ahí. No construir el producto mientras esto no se resuelva.
- **INDETERMINADA** (N<5): realizar más entrevistas antes de concluir.

Presentar. Esperar aprobacion.

## Fase 8: Experimento con Producto Minimo Viable (MVP -- Minimum Viable Product) -- 3-4 preguntas

Leer plantillas:
- `${CLAUDE_PLUGIN_ROOT}/assets/templates/experimento-mvp.md` -- ciclo Hipotesis -> Test -> Aprendizaje
- `${CLAUDE_PLUGIN_ROOT}/assets/templates/mvp-type-selector.md` -- NUEVO: selector de 6 tipos de MVP (LCD cap. 7)

**Proceso enriquecido**:

1. **Seleccionar el tipo de MVP** (paso nuevo antes de disenar el experimento). Los 6 tipos:
   - **Pre-Order MVP**: valida disposicion a pagar
   - **Audience Building MVP**: valida interes y engagement
   - **Concierge MVP**: valida demanda + logistica (servicio manual)
   - **Wizard of Oz MVP**: valida comportamiento real (interfaz real, backend manual)
   - **Single Use Case MVP**: valida direccion / feature focus
   - **Other People's Product MVP**: valida demanda usando infraestructura existente

   Recorrer el decision flow del selector:
   - **Paso 1**: identificar cual es el supuesto principal a validar (A-F)
   - **Paso 2**: responder las 4 preguntas de contexto (restriccion principal, construccion
     significativa, audiencia previa, criticidad de confianza)
   - **Paso 3**: revisar el catalogo de los 6 tipos con pros/cons
   - **Paso 4**: elegir el tipo + justificar + reconocer blind spots

2. **Generar** `02-solucion-validacion/16-experimento-mvp.md` con:
   - Tipo de MVP seleccionado y razon
   - Hipotesis que valida
   - Diseno del experimento segun el tipo elegido
   - **Criterios de exito cuantificados** definidos ANTES de lanzar (umbral que VALIDA
     vs umbral que INVALIDA) -- regla critica anti-confirmation-bias
   - Timeline y recursos
   - Fecha de Go/No-Go decision (sin postergar)

3. **Earlyvangelists identificados en Fase 7** son el target prioritario del MVP.

Presentar. Esperar aprobacion.

---

## PUERTA 2: Validacion de la Solucion

> "Espacio 2 completo. Antes de pasar a ejecucion:
> - La Entrevista de la Solucion mostro compromiso financiero (no solo verbal)?
> - El experimento MVP confirmo la hipotesis principal?
> - El BMC es internamente consistente?
> Avanzamos al Espacio 3?"

Si el usuario aprueba, indicar que el siguiente paso es la fase de
Plan de Ejecucion (Execution Plan) -- Fases 9-13.

---

## Principios clave

- **Una pregunta a la vez** -- nunca abrumar con multiples preguntas
- **Opcion multiple cuando sea posible** -- mas facil de responder; abierta cuando sea necesario
- **Siempre Opcion B** -- personalizar cada marcador generico con contexto del proyecto
- **Puertas de aprobacion** -- presentar cada entregable, esperar aprobacion antes de avanzar
- **Puertas de validacion** -- verificar antes de avanzar entre espacios
- **Solucion antes que Ejecucion** -- nunca saltar al plan de ejecucion sin validar la solucion
- **Espanol como base** -- con terminos de negocio en formato "espanol (English)" la primera vez
- **Diagramas en Mermaid** -- todo diagrama de flujo, maquina de estados, arquitectura o
  secuencia debe usar sintaxis Mermaid (```mermaid). No usar ASCII art ni diagramas de texto.

## Recursos adicionales

### Archivos de referencia
- **`${CLAUDE_PLUGIN_ROOT}/references/methodology.md`** -- Bancos de preguntas detallados, reglas de personalizacion, rondas del BMC
- **`${CLAUDE_PLUGIN_ROOT}/references/output-structure.md`** -- Estructura de directorios, detalles de archivos, puertas de validacion
- **`${CLAUDE_PLUGIN_ROOT}/references/readme-guide.md`** -- Patrones de generacion de README

### Archivos de plantilla (leer antes de generar)
- **`${CLAUDE_PLUGIN_ROOT}/assets/templates/entrevista-solucion.md`** -- Entrevista de la solucion + escalera de compromiso
- **`${CLAUDE_PLUGIN_ROOT}/assets/templates/hypothesis-validation-scorecard.md`** -- Scorecard de 4 criterios de Alvarez (LCD cap. 6)
- **`${CLAUDE_PLUGIN_ROOT}/assets/templates/experimento-mvp.md`** -- Ciclo de experimento MVP
- **`${CLAUDE_PLUGIN_ROOT}/assets/templates/mvp-type-selector.md`** -- Selector de 6 tipos de MVP con decision tree (LCD cap. 7)
