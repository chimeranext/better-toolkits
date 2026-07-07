---
name: execution-plan
version: 2.0.0
description: >
  This skill should be used when the user asks about "revenue model",
  "unit economics", "financial model", "branding", "brand identity",
  "legal foundation", "modelo de ingresos", "economia unitaria",
  "modelo financiero", "marca e identidad", "fundacion legal",
  "costos fijos", "LTV", "CAC", "pricing", "precios",
  "constitucion legal", "equity", "/execution-plan",
  or wants guided help with the financial and operational foundation
  of their startup: revenue streams, unit economics, financial projections,
  brand identity, and legal structure.
  Covers Phases 9-13 of the startup lifecycle (Space 3a: Execution Foundation).
  Requires Space 2 (Solution Validation) to be completed first.
---

# Plan de Ejecucion (Execution Plan)

Dialogo guiado interactivo para la primera mitad del **Espacio 3: Ejecucion-Aceleracion**
del framework de startup. Cubre el modelo de ingresos, economia unitaria, modelo financiero,
marca e identidad y fundacion legal. Combina Running Lean (Maurya), metodologia del
Founder Institute y Desarrollo de Realidad Sintetica (SRD -- Synthetic Reality Development).

**Prerrequisito**: Los Espacios 1 y 2 deben estar completos. Los archivos en
`./business/01-problema-hipotesis/` y `./business/02-solucion-validacion/` proporcionan
el contexto necesario. Si no existen, sugerir al usuario completar las fases anteriores.

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
[SIMULACION] Se escribiria: ./business/03-ejecucion-aceleracion/01-modelo-de-ingresos.md
```

- **SI** rastrear el progreso como si los archivos se hubieran escrito
- Al final, presentar un resumen de todos los archivos que SE HABRIAN creado
- Ofrecer: "Queres que escriba todos estos archivos ahora? (sale del modo simulacion)"

Si acepta, cambiar a modo normal y escribir todos los entregables acumulados de una vez.

## Puerta obligatoria

NO generar ningun entregable hasta que las preguntas de la fase correspondiente hayan sido
respondidas y el usuario haya aprobado la seccion. Preguntar UNA A LA VEZ. Esperar respuesta.

---

## Vista general de Fases 9-13

```
ESPACIO 3a: EJECUCION (Fases 9-13)
  |-- Fase 9:  Modelo de Ingresos      -> 03-ejecucion-aceleracion/01-modelo-de-ingresos.md
  |-- Fase 10: Economia Unitaria       -> 03-ejecucion-aceleracion/02-economia-unitaria.md
  |-- Fase 11: Modelo Financiero       -> 03-ejecucion-aceleracion/03-modelo-financiero.md
  |-- Fase 12: Marca e Identidad       -> 03-ejecucion-aceleracion/04-marca-e-identidad.md
  |-- Fase 13: Fundacion Legal         -> 03-ejecucion-aceleracion/05-fundacion-legal.md
  +-- PUERTA 3: Base financiera y legal solida?
```

---

## Fase 9: Modelo de Ingresos (Revenue Model) -- 3-4 preguntas

**MI-1**: "Investiga 3 modelos de ingresos que usen tus competidores. Cuales son y como
los mejorarias?"

**MI-2**: "De esos 3 modelos, cuales 2 queres testear? Para cada uno, defini 2 puntos
de precio (price points): uno competitivo y otro que genere $1M en 18 meses."

**MI-3**: "Describi los Pasos hacia el Ingreso (Steps to Revenue): cuales son todos
los pasos desde que un prospecto te conoce hasta que depositas dinero en tu cuenta?"

Generar `03-ejecucion-aceleracion/01-modelo-de-ingresos.md`. Presentar. Esperar aprobacion.

## Fase 10: Economia Unitaria (Unit Economics) -- 2-3 preguntas

**EU-1**: "Cuanto te cuesta adquirir un cliente -- Costo de Adquisicion (CAC -- Customer
Acquisition Cost)? Inclui todos los costos: marketing, ventas, incorporacion."

**EU-2**: "Cuanto vale un cliente a lo largo de su vida -- Valor de Vida del Cliente
(LTV -- Lifetime Value)? Cual es tu tasa de abandono (Churn Rate) estimada y tu
ticket promedio?"

**EU-3**: "Cuales son tus 3 canales de adquisicion principales?
Cual tiene mejor tasa de conversion (Conversion Rate)?"

Generar `03-ejecucion-aceleracion/02-economia-unitaria.md`. Presentar. Esperar aprobacion.

## Fase 11: Modelo Financiero (Financial Model) -- 2-3 preguntas

**MF-1**: "Cuales son tus costos fijos y variables mensuales?
(equipo, infraestructura, herramientas, servicios)"

**MF-2**: "Cuanto tiempo podes sobrevivir sin ingresos?
(ahorros, gastos personales, ingresos alternativos)"

**MF-3**: "Necesitas levantar capital? Si si, cuanto y de donde?
  a) Autofinanciamiento (Bootstrapping -- financiar con recursos propios sin inversores externos)
  b) Familia y amigos (Friends & Family Round)
  c) Angeles inversores (Angel Investors)
  d) Capital de riesgo (VC -- Venture Capital)
  e) Subvenciones o premios (Grants)"

Generar `03-ejecucion-aceleracion/03-modelo-financiero.md`. Presentar. Esperar aprobacion.

## Fase 12: Marca e Identidad (Branding) -- 2-3 preguntas

**MI-1**: "Lista 10+ palabras que evoquen tu producto, cliente, problema y emociones deseadas."

**MI-2**: "Ya tenes nombre? Si no, tenes candidatos? Verificaremos dominio y redes."

**MI-3**: "Que elementos de diseno necesitas? (logotipo, tarjetas, pagina de aterrizaje,
plantilla de presentacion)"

Generar `03-ejecucion-aceleracion/04-marca-e-identidad.md`. Presentar. Esperar aprobacion.

## Fase 13: Fundacion Legal (Legal Foundation) -- 2-3 preguntas

**FL-1**: "Ya estas constituido? Que tipo de entidad? En que jurisdiccion?"

**FL-2**: "Tenes cofundadores? Como es la distribucion de participacion accionaria (equity)?"

**FL-3**: "Que acuerdos legales necesitas? (Acuerdo de Confidencialidad (NDA -- Non-Disclosure Agreement), Cesion de
Propiedad Intelectual (IP Assignment), contrato laboral, Acuerdo Estandar de Asesores
del Founder Institute (FAST -- Founder Advisor Standard Template))"

Generar `03-ejecucion-aceleracion/05-fundacion-legal.md`. Presentar. Esperar aprobacion.

---

## PUERTA 3: Base Financiera y Legal

> "Fases 9-13 completas. Validemos la base financiera y legal:
> - Economia unitaria viable (LTV > 3x CAC)?
> - Modelo financiero con camino a la rentabilidad (Runway)?
> - Marca e identidad definidas (nombre, dominio, visual)?
> - Fundacion legal establecida (entidad, equity, acuerdos)?
> Listo para avanzar a Aceleracion del Crecimiento (Growth Acceleration) -- Fases 14-17?"

Si el usuario aprueba, indicar que el siguiente paso es la fase de
Aceleracion del Crecimiento (Growth Acceleration) -- Fases 14-17.

---

## Principios clave

- **Una pregunta a la vez** -- nunca abrumar con multiples preguntas
- **Opcion multiple cuando sea posible** -- mas facil de responder; abierta cuando sea necesario
- **Siempre Opcion B** -- personalizar cada marcador generico con contexto del proyecto
- **Puertas de aprobacion** -- presentar cada entregable, esperar aprobacion antes de avanzar
- **Puertas de validacion** -- verificar antes de avanzar entre espacios
- **Espanol como base** -- con terminos de negocio en formato "espanol (English)" la primera vez
- **Diagramas en Mermaid** -- todo diagrama de flujo, maquina de estados, arquitectura o
  secuencia debe usar sintaxis Mermaid (```mermaid). No usar ASCII art ni diagramas de texto.

## Recursos adicionales

### Archivos de referencia
- **`${CLAUDE_PLUGIN_ROOT}/references/methodology.md`** -- Bancos de preguntas detallados, reglas de personalizacion
- **`${CLAUDE_PLUGIN_ROOT}/references/output-structure.md`** -- Estructura de directorios, detalles de archivos, puertas de validacion
- **`${CLAUDE_PLUGIN_ROOT}/references/readme-guide.md`** -- Patrones de generacion de README
