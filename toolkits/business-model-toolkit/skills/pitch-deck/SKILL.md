---
name: pitch-deck
version: 2.0.0
description: >
  This skill should be used when the user asks to "create a pitch deck",
  "pitch deck", "investor presentation", "investor deck",
  "presentacion a inversores", "deck para inversores",
  "arma mi pitch deck", "genera mi presentacion",
  "MARP presentation", "presentacion MARP",
  "/pitch-deck",
  or wants to generate an investor-ready pitch deck that synthesizes
  all prior business model work into a compelling 12-slide presentation.
  Covers Phase 18 of the startup lifecycle.
  Requires all prior phases (1-17) to be completed first for full context.
---

# Presentacion a Inversores (Pitch Deck)

Dialogo guiado interactivo para la **Fase 18: Presentacion a Inversores** del framework
de startup. Genera un pitch deck listo para inversores en formato MARP (Markdown
Presentation Ecosystem) de 12 diapositivas, incorporando TODO el contexto acumulado
de los Espacios 1-3.

**Prerrequisito**: Idealmente las Fases 1-17 deben estar completas. Los archivos en
`./business/01-problema-hipotesis/`, `./business/02-solucion-validacion/` y
`./business/03-ejecucion-aceleracion/` proporcionan el contexto necesario para una
presentacion coherente y fundamentada. Si no existen todos los archivos, trabajar con
la informacion disponible y senalar los vacios que deben llenarse.

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
[SIMULACION] Se escribiria: ./business/03-ejecucion-aceleracion/10-pitch-deck.md
```

- **SI** rastrear el progreso como si los archivos se hubieran escrito

## Puerta obligatoria

NO generar el pitch deck hasta que las preguntas hayan sido respondidas y el usuario
haya aprobado. Preguntar UNA A LA VEZ. Esperar respuesta.

---

## Fase 18: Presentacion a Inversores (Pitch Deck) -- 2-3 preguntas

Leer plantilla: `${CLAUDE_PLUGIN_ROOT}/assets/templates/pitch-deck-marp.md`

Antes de generar, leer los archivos existentes del proyecto para incorporar contexto:

```
./business/01-problema-hipotesis/01-perfil-fundador.md      -> Diapositiva: Equipo
./business/01-problema-hipotesis/02-entrevista-problema.md  -> Diapositiva: Problema
./business/01-problema-hipotesis/03-perfil-expectativas-cliente.md -> Diapositiva: Cliente
./business/01-problema-hipotesis/05-investigacion-mercado.md -> Diapositiva: Mercado
./business/02-solucion-validacion/                          -> Diapositivas: Solucion, BMC
./business/03-ejecucion-aceleracion/01-modelo-de-ingresos.md -> Diapositiva: Modelo de Negocio
./business/03-ejecucion-aceleracion/02-economia-unitaria.md  -> Diapositiva: Metricas
./business/03-ejecucion-aceleracion/03-modelo-financiero.md  -> Diapositiva: Financieros
./business/03-ejecucion-aceleracion/07-hoja-de-ruta.md       -> Diapositiva: Roadmap
```

Preguntas para completar o ajustar el pitch deck:

**PD-1**: "Cual es tu pedido de inversion (Ask)? Monto, uso de fondos y hitos que
vas a lograr con ese capital."

**PD-2**: "Que traccion tenes hasta ahora? (usuarios, ingresos, cartas de intencion,
pilotos, listas de espera -- cualquier dato que demuestre progreso)"

**PD-3**: "Cual es tu ventaja competitiva sostenible (Moat)? Por que es dificil
copiar tu solucion?"

Version lista para inversores: incorporar TODO el contexto de los Espacios 1-3.
Reemplazar ano y nombre de empresa codificados en la plantilla con valores reales.

Generar `03-ejecucion-aceleracion/10-pitch-deck.md`. Presentar. Esperar aprobacion.

---

## Empaquetado (post pitch deck)

Despues de que el pitch deck sea aprobado, ofrecer completar el empaquetado final:

### Fase 18b: Guion de Video Pitch
Ofrecer generar un guion teleprompter de 3 minutos basado en el pitch deck:
> "El pitch deck esta listo. Queres que genere un guion de video pitch de 3 minutos
> para grabar? Es una presentacion teleprompter en formato MARP que podes leer en
> pantalla completa mientras grabas."

Si acepta, invocar el skill `pitch-script` o generar directamente
`03-ejecucion-aceleracion/11-pitch-script.md` usando la plantilla correspondiente.

### Fase 19: README del Negocio
Generar `business/README.md` con enlaces a los 3 espacios y estado de avance.

### Fase 20: README del Proyecto
Generar `README.md` en la raiz del proyecto siguiendo `${CLAUDE_PLUGIN_ROOT}/references/readme-guide.md`.

### Fase 21: Integracion SRD
Ofrecer `/srd-framework:srd-assess` con contexto precargado de todos los archivos de negocio.

---

## Metodologia: Los 10 Mandamientos de los Grandes Pitch Decks

El pitch deck se estructura siguiendo los 10 Mandamientos. Leer la referencia completa
antes de generar: `${CLAUDE_PLUGIN_ROOT}/references/pitch-deck-10-commandments.md`

Cada diapositiva mapea a un mandamiento:

| Slide | Mandamiento | Contenido |
|-------|------------|-----------|
| 1 | -- | Portada (nombre, eslogan, presentador) |
| 2 | 1. Problema | Urgencia + evidencia concreta |
| 3 | 2. Solucion | Propuesta unica + insight diferenciador |
| 4 | 3. Valor 10x | Producto, modelo, precios -- mejora cuantificable |
| 5 | 4. TAM | Calculo bottom-up (clientes x precio) |
| 6 | 5. Competencia | Tabla comparativa con beneficios medibles |
| 7 | 6. Go-to-Market | Cliente objetivo + segmentos + canales + CAC/LTV |
| 8-9 | 7. Producto | Casos de uso por rol + demo/capturas |
| 10 | 8. Financieros | Proyecciones realistas + supuestos + confianza |
| 11 | 9. Ask | Monto + hitos medibles (NO runway) |
| 12 | Bonus | Traccion (si existe) |
| 13 | Bonus | Equipo (full-time vs parcial vs asesores) |
| 14 | 10. Vision | Dominio del mercado en 3 anos |
| 15 | -- | Cierre + contacto |

Regla critica del Mandamiento 5: usar TABLA para competencia, nunca magic quadrant.
Regla critica del Mandamiento 8: declarar nivel de confianza, nunca decir "conservador".
Regla critica del Mandamiento 9: inversores compran METAS, no tiempo de runway.

## Principios clave

- **Una pregunta a la vez** -- nunca abrumar con multiples preguntas
- **Opcion multiple cuando sea posible** -- mas facil de responder; abierta cuando sea necesario
- **Siempre Opcion B** -- personalizar cada marcador generico con contexto del proyecto
- **Puertas de aprobacion** -- presentar cada entregable, esperar aprobacion antes de avanzar
- **Contexto completo** -- el pitch deck debe reflejar todo el trabajo previo, no inventar datos
- **Espanol como base** -- con terminos de negocio en formato "espanol (English)" la primera vez
- **Diagramas en Mermaid** -- todo diagrama de flujo, maquina de estados, arquitectura o
  secuencia debe usar sintaxis Mermaid (```mermaid). No usar ASCII art ni diagramas de texto.

## Recursos adicionales

### Archivos de referencia
- **`${CLAUDE_PLUGIN_ROOT}/references/pitch-deck-10-commandments.md`** -- Los 10 Mandamientos: metodologia para estructura del pitch deck
- **`${CLAUDE_PLUGIN_ROOT}/references/methodology.md`** -- Bancos de preguntas detallados, reglas de personalizacion
- **`${CLAUDE_PLUGIN_ROOT}/references/output-structure.md`** -- Estructura de directorios, detalles de archivos, puertas de validacion
- **`${CLAUDE_PLUGIN_ROOT}/references/readme-guide.md`** -- Patrones de generacion de README

### Archivos de plantilla (leer antes de generar)
- **`${CLAUDE_PLUGIN_ROOT}/assets/templates/pitch-deck-marp.md`** -- Presentacion MARP (15 diapositivas, alineada con 10 Mandamientos)
