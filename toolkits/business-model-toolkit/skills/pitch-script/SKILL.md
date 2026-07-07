---
name: pitch-script
version: 1.0.0
description: >
  This skill should be used when the user asks to "create a pitch script",
  "pitch script", "video pitch", "guion de pitch", "guion para video",
  "teleprompter", "script de presentacion", "guion de 3 minutos",
  "pitch de 3 minutos", "grabar un pitch", "script para grabar",
  "/pitch-script",
  or wants to generate a teleprompter-style script for recording a
  short video pitch (max 3 minutes) in Marp format.
  The output is a black-background presentation designed for full-screen
  reading, where the presenter advances slides with mouse or remote.
---

# Guion de Pitch (Pitch Script)

Dialogo guiado interactivo para generar un **guion de video pitch de maximo 3 minutos**
en formato MARP teleprompter. El resultado es una presentacion de fondo negro con texto
grande, disenada para leer en pantalla completa mientras se graba.

## Regla critica: maximo 10 renglones por slide

Cada slide puede tener **maximo 10 renglones de texto** (sin contar lineas en blanco
ni el encabezado h1). Si un bloque de contenido excede 10 renglones, dividirlo en
dos slides. Esta regla es inviolable.

## Regla de duracion

El pitch completo no debe superar **3 minutos** (~450-500 palabras en espanol a ritmo
de presentacion natural de 150-170 palabras por minuto). Contar las palabras del guion
final y verificar que no excedan 500.

## Regla de idioma

Todo el contenido generado debe estar en **espanol**. Terminos de negocio en formato
**"espanol (English)"** la primera vez que aparecen. Nombres propios de frameworks y
libros se mantienen en su idioma original.

## Directorio de salida

El guion se genera en `./business/03-ejecucion-aceleracion/11-pitch-script.md`.
Leer `${CLAUDE_PLUGIN_ROOT}/references/output-structure.md` para el arbol completo.

## Regla de personalizacion

**Siempre Opcion B** -- reemplazar TODOS los marcadores genericos de la plantilla con
contexto real del proyecto. Nunca dejar placeholders como `[descripcion]` o `**\_**`.

## Estilo de preguntas

Una pregunta a la vez. Opcion multiple cuando sea posible. Esperar respuesta antes de avanzar.

## Modos de ejecucion

### Modo normal (por defecto)
Escribe el entregable en `./business/`.

### Modo simulacion (what-if)
Se activa cuando el usuario dice "simulacion", "prueba", "what-if",
"no guardes nada", o agrega `--what-if` al comando.

En modo simulacion:
- **NO** crear directorios ni escribir archivos
- **SI** presentar el contenido completo en la conversacion como bloque de codigo
- **SI** prefijar con:

```
[SIMULACION] Se escribiria: ./business/03-ejecucion-aceleracion/11-pitch-script.md
```

## Fuentes de contexto

Antes de generar, leer los archivos existentes del proyecto para incorporar datos reales:

```
./business/01-problema-hipotesis/02-entrevista-problema.md  -> Slide: Problema
./business/01-problema-hipotesis/03-perfil-expectativas-cliente.md -> Slide: A quien
./business/01-problema-hipotesis/05-investigacion-mercado.md -> Slide: Impacto (TAM)
./business/02-solucion-validacion/02-solucion-ideal.md      -> Slides: Solucion
./business/02-solucion-validacion/04-propuesta-unica-de-valor.md -> Slide: Diferencial
./business/02-solucion-validacion/05-ventaja-injusta-o-competitiva.md -> Slide: Diferencial
./business/03-ejecucion-aceleracion/01-modelo-de-ingresos.md -> Slide: A quien (modelo)
./business/03-ejecucion-aceleracion/02-economia-unitaria.md  -> Slide: Impacto (metricas)
./business/03-ejecucion-aceleracion/10-pitch-deck.md         -> Contexto general
```

Si el pitch deck (10-pitch-deck.md) ya existe, usarlo como fuente primaria de datos.
Si no existen archivos previos, las preguntas cubren lo necesario.

Tambien considerar fuentes alternativas de contexto:
- Archivos SRD (`./srd/` o `./srd-espanol/`): personas, journeys, gap audit
- README.md del proyecto
- Cualquier otro archivo que el usuario senale

## Puerta obligatoria

NO generar el guion hasta que las preguntas hayan sido respondidas y el usuario
haya aprobado. Preguntar UNA A LA VEZ. Esperar respuesta.

---

## Preguntas del guion -- 3-5 preguntas

Leer plantilla: `${CLAUDE_PLUGIN_ROOT}/assets/templates/pitch-script-marp.md`

**PS-1**: "Cual es la audiencia del video?
a) Inversores / jurado de aceleradora
b) Clientes potenciales (demo comercial)
c) Programa de emprendimiento social (ej: Social Skin, Seedstars)
d) Concurso de pitch (publico general)
e) Otro (describilo)"

Esto define el tono y enfasis del guion:
- Inversores: enfasis en modelo de negocio, traccion, ask
- Clientes: enfasis en problema, solucion, beneficios
- Programa social: enfasis en problema social, impacto, sostenibilidad
- Concurso: enfasis en historia, emocion, vision

**PS-2**: "Cual es tu gancho? Describe una historia, anecdota o situacion cotidiana
que ilustre el problema que resuelves. Debe ser algo que la audiencia pueda visualizar
inmediatamente."

**PS-3**: "Que cifras o datos concretos tenes para respaldar el problema?
(estadisticas, costos, frecuencia, numero de afectados)"

**PS-4**: "Que frase de cierre queres usar? Puede ser tu eslogan, tu vision
a futuro, o una frase memorable que resuma tu propuesta."

**PS-5** (opcional, solo si no hay archivos previos): "Describe brevemente:
- Tu solucion (que hace y como funciona)
- Tu diferencial (por que sos unico)
- Tu modelo de negocio (quien paga y cuanto)"

## Generacion del guion

Despues de las preguntas, generar el guion siguiendo la estructura de la plantilla
(7 slides: gancho, problema, solucion, diferencial, audiencia, impacto, cierre).

### Reglas de generacion

1. **Max 10 renglones por slide** (sin contar lineas en blanco ni h1)
2. **Max 500 palabras total** (~3 minutos)
3. **Lenguaje conversacional** -- como si hablaras con alguien, no como un documento
4. **Cifras concretas** -- nunca decir "muchos" o "gran cantidad"; usar numeros
5. **Sin jerga tecnica innecesaria** -- el stack, la arquitectura, los frameworks NO van
6. **Sin instrucciones de camara** -- el guion es solo texto para leer
7. **Enfasis con formato Marp** -- usar `**negrita**` para cifras clave y `*italica*` para nombres propios
8. **Cada slide es una unidad** -- se puede pausar entre slides sin perder coherencia
9. **Adaptar al tono de la audiencia** segun PS-1

### Verificacion pre-entrega

Antes de presentar el guion al usuario, verificar:
- [ ] Ningun slide excede 10 renglones de texto
- [ ] Total de palabras <= 500
- [ ] Todos los marcadores reemplazados con datos reales
- [ ] Hay al menos 3 cifras concretas en el guion
- [ ] El gancho es visceral/visual, no abstracto
- [ ] El cierre es memorable

Generar `03-ejecucion-aceleracion/11-pitch-script.md`. Presentar. Esperar aprobacion.

---

## Principios clave

- **Una pregunta a la vez** -- nunca abrumar con multiples preguntas
- **Opcion multiple cuando sea posible** -- mas facil de responder; abierta cuando sea necesario
- **Siempre Opcion B** -- personalizar cada marcador generico con contexto del proyecto
- **Puertas de aprobacion** -- presentar entregable, esperar aprobacion antes de escribir
- **Max 10 renglones** -- regla inviolable por slide
- **Max 500 palabras** -- regla inviolable para el guion completo
- **Espanol como base** -- con terminos de negocio en formato "espanol (English)" la primera vez

## Recursos adicionales

### Archivos de referencia
- **`${CLAUDE_PLUGIN_ROOT}/references/pitch-deck-10-commandments.md`** -- Los 10 Mandamientos: estructura narrativa del pitch
- **`${CLAUDE_PLUGIN_ROOT}/references/methodology.md`** -- Bancos de preguntas, reglas de personalizacion
- **`${CLAUDE_PLUGIN_ROOT}/references/output-structure.md`** -- Estructura de directorios

### Archivos de plantilla (leer antes de generar)
- **`${CLAUDE_PLUGIN_ROOT}/assets/templates/pitch-script-marp.md`** -- Plantilla teleprompter MARP (7 slides, fondo negro, texto grande)
