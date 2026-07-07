# Builder's Bloom's Taxonomy

Taxonomía cognitiva adaptada de chimera-academy para builders de producto (no académicos).
Cada módulo declara su `bloom_level` objetivo.

## Levels

| Level | Builder Action | Typical Module Position | Ejemplo |
|---|---|---|---|
| **Recognize** | Identify tools, patterns, terminology | Early modules | "Reconocé los 3 tipos de providers de Riverpod" |
| **Explain** | Describe why a pattern works, compare approaches | Early-mid modules | "Explicá cuándo preferir autoDispose sobre keepAlive" |
| **Build** | Use a tool/framework to produce a working result | Mid modules (core) | "Construí una app Flutter con Riverpod + Supabase" |
| **Debug & Evaluate** | Break down what went wrong, assess output quality | Mid-late modules | "Debuggeá por qué el provider se recrea en cada rebuild" |
| **Decide** | Choose between approaches, justify trade-offs | Late modules | "Decidí si Riverpod o BLoC para este proyecto; justificá" |
| **Ship** | Design and deploy an original project | Final module / capstone | "Deployá la app a Play Store + App Store" |

## Progression rules

- **La mayoría de los módulos deben target Build o superior**. Recognize/Explain se usan
  solo como bridges tempranos.
- **Progression debe climb**: de Recognize a Ship, no al revés ni estancamiento.
- **Flag rojo**: salto de Recognize a Ship sin Build/Debug/Decide entre medio.
- **Flag amarillo**: 3+ módulos seguidos en el mismo nivel.

## Usado por

- `course-audit` (checks Bloom's progression climb).
- `new-course` (paso 3 pide declarar bloom_level por módulo).
- `course-visualize` (graph de curva Bloom's).

## Referencia fuente

Adaptación interna de chimera-academy `skills/blooms-taxonomy/`. No es la Bloom's
original (Educational Objectives, 1956) — esta versión está optimizada para cursos de
builders, no currículo formal.
