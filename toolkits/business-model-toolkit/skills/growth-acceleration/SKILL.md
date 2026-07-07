---
name: growth-acceleration
version: 2.0.0
description: >
  This skill should be used when the user asks about "go-to-market",
  "go to market plan", "product roadmap", "hiring plan", "team plan",
  "advisory board", "salida al mercado", "hoja de ruta",
  "hoja de ruta del producto", "equipo y contratacion",
  "junta asesora", "plan de contratacion", "canales de adquisicion",
  "GTM strategy", "estrategia GTM", "/growth-acceleration",
  or wants guided help with growth strategy: market entry channels,
  product roadmap, team building, and advisory board formation.
  Covers Phases 14-17 of the startup lifecycle (Space 3b: Growth Acceleration).
  Requires Phases 9-13 (Execution Plan) to be completed first.
---

# Aceleracion del Crecimiento (Growth Acceleration)

Dialogo guiado interactivo para la segunda mitad del **Espacio 3: Ejecucion-Aceleracion**
del framework de startup. Cubre salida al mercado, hoja de ruta del producto, equipo
y contratacion, y junta asesora. Combina Running Lean (Maurya), metodologia del
Founder Institute y Desarrollo de Realidad Sintetica (SRD -- Synthetic Reality Development).

**Prerrequisito**: Las Fases 1-13 deben estar completas. Los archivos en
`./business/01-problema-hipotesis/`, `./business/02-solucion-validacion/` y
`./business/03-ejecucion-aceleracion/` (archivos 01-05) proporcionan el contexto necesario.
Si no existen, sugerir al usuario completar las fases anteriores.

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
[SIMULACION] Se escribiria: ./business/03-ejecucion-aceleracion/06-salida-al-mercado.md
```

- **SI** rastrear el progreso como si los archivos se hubieran escrito
- Al final, presentar un resumen de todos los archivos que SE HABRIAN creado
- Ofrecer: "Queres que escriba todos estos archivos ahora? (sale del modo simulacion)"

Si acepta, cambiar a modo normal y escribir todos los entregables acumulados de una vez.

## Puerta obligatoria

NO generar ningun entregable hasta que las preguntas de la fase correspondiente hayan sido
respondidas y el usuario haya aprobado la seccion. Preguntar UNA A LA VEZ. Esperar respuesta.

---

## Vista general de Fases 14-17

```
ESPACIO 3b: ACELERACION (Fases 14-17)
  |-- Fase 14: Salida al Mercado         -> 03-ejecucion-aceleracion/06-salida-al-mercado.md
  |-- Fase 15: Hoja de Ruta del Producto  -> 03-ejecucion-aceleracion/07-hoja-de-ruta.md
  |-- Fase 16: Equipo y Contratacion      -> 03-ejecucion-aceleracion/08-equipo-y-contratacion.md
  |-- Fase 17: Junta Asesora              -> 03-ejecucion-aceleracion/09-junta-asesora.md
  +-- PUERTA 3 (completa): La startup esta lista para escalar?
```

---

## Fase 14: Salida al Mercado (Go-to-Market) -- 2-3 preguntas

**SM-1**: "Cuales son tus 5 canales de adquisicion candidatos?
(redes sociales, contenido, publicidad pagada, relaciones publicas, ventas directas,
afiliados, eventos)"

**SM-2**: "Escribi 3 mensajes de marketing de <=140 caracteres para tu solucion."

**SM-3**: "Que herramientas de marketing vas a usar? (analitica, correo, pruebas A/B)"

Generar `03-ejecucion-aceleracion/06-salida-al-mercado.md`. Presentar. Esperar aprobacion.

## Fase 15: Hoja de Ruta del Producto (Product Roadmap) -- 2-3 preguntas

**HR-1**: "Cuales son tus 3 metas de la solucion (Solution Goals) para el proximo ano?
(medibles y concretas)"

**HR-2**: "Lista todas las funcionalidades (features) que necesitas. Para cada una indica:
prioridad (1=esencial, 2=siguiente, 3=deseable) y version de lanzamiento (Beta, v1.0, v2.0)."

**HR-3**: "Cual es tu plan de lanzamientos (releases)?
(cada ~2 semanas, cada lanzamiento valida 1 hipotesis)"

Generar `03-ejecucion-aceleracion/07-hoja-de-ruta.md`. Presentar. Esperar aprobacion.

## Fase 16: Equipo y Contratacion (Team & Hiring) -- 2-3 preguntas

**EC-1**: "Que roles necesitas para ejecutar tu hoja de ruta?
Cuales son internos y cuales tercerizados (outsourced)?"

**EC-2**: "Cual es tu plan de contratacion (Hiring Plan) para los proximos 18 meses?
(rol, cuando, compensacion, participacion accionaria)"

**EC-3**: "Cuales son los 5-7 valores de tu empresa? (codigo de etica)"

Generar `03-ejecucion-aceleracion/08-equipo-y-contratacion.md`. Presentar. Esperar aprobacion.

## Fase 17: Junta Asesora (Advisory Board) -- 2-3 preguntas

**JA-1**: "Necesitas 3 asesores en 3 categorias: Startup (con salida exitosa -- exit),
Industria (experto en el dominio) y Tecnologia/Marketing. Tenes candidatos?"

**JA-2**: "Conoces conectores que puedan presentarte a estos asesores?"

**JA-3**: "Conoces el FAST para compensar asesores con participacion accionaria?"

Generar `03-ejecucion-aceleracion/09-junta-asesora.md`. Presentar. Esperar aprobacion.

---

## PUERTA 4: Base Operativa Lista

> "Fases 14-17 completas. Antes de armar la Presentacion a Inversores (Pitch Deck),
> validemos la base operativa (operational readiness):
> - Estrategia de salida al mercado (GTM) definida con canales y mensajes?
> - Hoja de ruta del producto con lanzamientos planificados?
> - Equipo con roles clave cubiertos o plan de contratacion claro?
> - Junta asesora conformada (startup + industria + tecnologia)?
> Listo para armar el Pitch Deck?"

Si el usuario aprueba, indicar que el siguiente paso es la fase de
Presentacion a Inversores (Pitch Deck) -- Fase 18.

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
