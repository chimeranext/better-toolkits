---
name: design-studio
version: 1.0.0
description: >
  Runs a collaborative sketch exercise (Design Studio / Design Charrette) adapted for
  AI-assisted workflows. Use when the user asks for "design studio",
  "design charrette", "ideacion colaborativa", "ejercicio de sketches",
  "generar ideas de UI", "6-up", "divergencia de ideas",
  "/design-studio", or wants to rapidly explore design solution space
  for a specific problem. Based on Lean UX (Jeff Gothelf, O'Reilly 2013), cap. 5.
  Focuses on divergent thinking first, then convergence. Output is a decision
  document with 6 variants + critique + converged solution + parking lot.
---

# Design Studio (Ejercicio de Diseño Colaborativo)

Implementa el ejercicio de **Design Studio / Design Charrette** de *Lean UX*
(Jeff Gothelf, O'Reilly 2013), cap. 5 — "Design It Together". Adaptado para
workflows AI-assisted donde la divergencia de ideas la genera el agente junto al
usuario, y la convergencia es co-decisión.

## Regla de idioma

Contenido en **español**. Términos técnicos de diseño en formato "español (English)"
la primera vez que aparecen.

## Directorio de salida

```
./docs/ux-research/design-studios/
└── YYYY-MM-DD-[topic-slug].md     # Documento único por sesión
```

## Puerta obligatoria

NO avanzar entre fases sin aprobación explícita del usuario. Cada fase tiene
puerta de confirmación.

---

## Filosofía del ejercicio

> "The Design Studio removes the ego from design. Instead of one 'hero designer'
> producing a single idea, the whole team diverges on many ideas, then converges
> together on the strongest."
> — Jeff Gothelf, *Lean UX*

**Principios**:

- **Diverger primero, converger después**. Nunca empezar con la "mejor idea".
  Siempre generar múltiples variantes antes de elegir.
- **Low-fidelity siempre**. Sketches textuales / ASCII / wireframes crudos, no
  visual design finalizado. El objetivo es explorar, no producir pixel-perfect.
- **Crítica = clarificación de intención**, NO "me gusta / no me gusta".
  Siempre preguntar: "¿cómo resuelve esta opción el problema del persona?"
- **Parking lot de ideas rechazadas**. Ninguna idea se pierde — se archiva por
  si la necesitamos después.

---

## Vista general de las 5 fases

```
DESIGN STUDIO (adaptado para AI-assisted)
  |-- Fase 1: Problem Definition (15-45 min equivalente)
  |-- Fase 2: Divergent Ideation — 6 variantes (10 min)
  |-- Fase 3: Presentation + Critique (3 min por variante)
  |-- Fase 4: Iterate + Refine (5-10 min)
  |-- Fase 5: Team Convergence (45 min)
  +-- Output: decision document con converged solution + parking lot
```

---

## Fase 1 — Problem Definition

**Objetivo**: Establecer el problema, restricciones, persona, y éxito.

### Preguntas al usuario

- **DS-1**: "¿Qué problema específico vamos a diseñar una solución para? (una oración,
  acotada, no 'mejorar la experiencia general')"
- **DS-2**: "¿Quién es el persona objetivo? Podés invocar `persona-builder` si no lo
  tenés definido aún — en modo CREATE_PROTO_PERSONA generá uno rápido."
- **DS-3**: "¿Cuáles son las restricciones del diseño? (técnicas, tiempo, regulatorias,
  brand, plataforma objetivo, accesibilidad, etc.)"
- **DS-4**: "¿Cómo sabremos que la solución funciona? Definí 2-3 métricas de éxito
  (cualitativas o cuantitativas)."
- **DS-5**: "¿Hay soluciones existentes que hay que considerar (propias o de competencia)
  para NO repetirlas?"

### Output de Fase 1

**Problem brief (documento de trabajo)**:

- **Problema**: `[una oración clara]`
- **Persona**: `[nombre + primary_pain]`
- **Restricciones**: `[lista]`
- **Métricas de éxito**: `[2-3 métricas]`
- **Soluciones existentes a evitar**: `[lista]`

**PUERTA DE APROBACIÓN**: Confirmar el problem brief antes de diverger.

---

## Fase 2 — Divergent Ideation (6 variantes)

**Objetivo**: Generar 6 variantes de solución al problema, explorando diferentes ejes
de diseño. Nada de convergencia todavía — **todas las ideas se aceptan en esta fase**.

### Proceso

El agente genera 6 variantes siguiendo esta plantilla mental — cada variante debe
diferir significativamente en al menos UNO de estos ejes:

| Eje de variación | Ejemplos contrastantes |
|---|---|
| **Patrón de interacción** | Gestos vs. buttons vs. voice vs. automation |
| **Altura de fidelidad** | Screen completa vs. widget pequeño vs. notificación passive |
| **Timing del flujo** | Al inicio de la sesión vs. en el momento del problema vs. post-hoc |
| **Canal** | In-app vs. email vs. SMS vs. físico vs. multi-canal |
| **Grado de automatización** | Manual vs. assisted vs. fully automated |
| **Estructura de contenido** | Texto vs. visual vs. video vs. interactivo |

### Formato de cada variante (texto/ASCII, no visual pulido)

```
### Variante N: [Nombre corto descriptivo]

**Eje de variación**: [Cuál eje explora]

**One-liner**: [Cómo funciona en una oración]

**Sketch descriptivo**:
┌─────────────────────────┐
│ [ASCII o descripción    │
│  verbal detallada de    │
│  la interfaz / flujo]   │
└─────────────────────────┘

**Flujo del persona**:
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

**Qué resuelve (del primary_pain)**: [Conexión explícita al problema]

**Qué NO resuelve / trade-off**: [Ser honesto con las limitaciones]
```

### Reglas de generación

- Las 6 variantes **deben ser genuinamente distintas** — no son "la misma idea con 6 colores".
- Al menos **una variante radical/contraria** — ej. "y si en lugar de una app web, es una
  notificación SMS?". Sirve como baseline para medir cuánto innovan las otras.
- **Nada de análisis comparativo todavía**. Solo generar.
- Si el usuario pide más variantes (7, 8...), aceptarlo, pero >10 es señal de dispersión.

**PUERTA DE APROBACIÓN**: Presentar las 6 variantes. Confirmar que el usuario entendió cada
una antes de entrar a crítica. Si alguna no se entiende, regenerarla más clara.

---

## Fase 3 — Presentation + Critique

**Objetivo**: Clarificar la intención de cada variante a través de crítica estructurada.
**NO es "me gusta / no me gusta"**.

### Preguntas de crítica (aplicar a CADA variante)

Para cada una de las 6 variantes, responder con evidencia:

1. **¿Cómo resuelve esta variante el `primary_pain` del persona?**
2. **¿Qué restricciones (de Fase 1) viola o ignora?**
3. **¿Cuál es el riesgo principal si implementamos esto?**
4. **¿Qué supuesto del equipo/producto asume esta variante?**
5. **¿Qué evidencia necesitaríamos para validarla?**
6. **Score relativo** al problem brief: 🟢 fuerte / 🟡 mediana / 🔴 débil

### Formato de output

| # | Variante | Resuelve primary_pain | Viola restricción | Riesgo principal | Score |
|---|---|---|---|---|---|
| 1 | [Nombre] | Sí / Parcial / No | [Cuál] | [Cuál] | 🟢 / 🟡 / 🔴 |
| 2 | [Nombre] | | | | |
| ... | | | | | |

**PUERTA DE APROBACIÓN**: ¿El usuario está de acuerdo con la evaluación? Ajustar antes de
iterar.

---

## Fase 4 — Iterate + Refine

**Objetivo**: Tomar las 2-3 variantes con mejor score de Fase 3 y refinarlas. Puede incluir
**combinar elementos** de múltiples variantes.

### Preguntas al usuario

- **IR-1**: "De las 6 variantes, ¿cuáles 2-3 querés refinar?"
- **IR-2**: "¿Alguna combinación tiene sentido? (ej. 'el flujo de Variante 1 con el canal
  de Variante 3')"
- **IR-3**: "Para cada variante refinada: ¿qué cambiarías exactamente?"

### Output: variantes refinadas

Cada variante refinada incluye:

- Nombre + descripción actualizada
- Cambios específicos vs. variante original
- Si es combinación: qué elementos trae de cuál variante
- Re-score actualizado

**PUERTA DE APROBACIÓN**: ¿Las variantes refinadas son claramente mejores que las originales?
Si alguna no mejoró, archivarla en parking lot.

---

## Fase 5 — Team Convergence

**Objetivo**: Convergir en **una** solución como "idea del equipo" que vamos a testear /
implementar a continuación.

### Preguntas al usuario

- **TC-1**: "De las variantes refinadas, ¿cuál es 'la' propuesta del equipo? (si hay más
  de una persona involucrada, puede requerir discusión — documentar el razonamiento)"
- **TC-2**: "¿Qué queda en el parking lot? Listarlo con razón del archivo."
- **TC-3**: "Siguientes pasos: ¿cómo validamos esta solución? (prototipo, user testing,
  A/B test, experimento de Lean Customer Development, Concierge MVP, etc.)"

### Output final — Design Studio Decision Document

Generar `docs/ux-research/design-studios/YYYY-MM-DD-[topic-slug].md` con:

```markdown
# Design Studio — [Topic] ([Fecha])

## Problem Brief

[De Fase 1]

## Variantes generadas (Fase 2)

### Variante 1 — 6 (todas, con descripción completa)

## Crítica (Fase 3)

[Tabla de evaluación]

## Variantes refinadas (Fase 4)

[Refinamientos + combinaciones]

## Solución convergida (Fase 5)

**Nombre**: [Nombre de la solución final]

**Descripción**: [Detalle completo]

**Por qué se eligió**: [Razonamiento del equipo — qué criterios pesaron]

**Elementos heredados de**: [Variante(s) original(es) — para trazabilidad]

## Parking Lot

Ideas archivadas (por si se necesitan más adelante):

- **[Variante N — Nombre]**: Razón del archivo: [por qué no ahora]
- ...

## Siguientes pasos

- [ ] Validación: [método elegido]
- [ ] Responsable: [quién]
- [ ] Fecha de decisión: [YYYY-MM-DD]
- [ ] Si falla validación: volver a Design Studio con aprendizajes
```

---

## Principios clave

- **Divergencia antes de convergencia** — 6 variantes mínimo antes de elegir
- **Crítica de intención, no de gusto** — "¿cómo resuelve X?" no "¿te gusta?"
- **Parking lot de ideas rechazadas** — no se pierden, se archivan con razón
- **Low-fidelity siempre** — texto/ASCII/wireframe, no visual design finalizado
- **Escalado del ejercicio** — puede durar 1 hora (rápido) o 1 día (profundo) según el problema
- **Iterar sin culpa** — si la solución convergida falla en validación, nuevo Design Studio
  con aprendizajes de la iteración anterior

## Integración con otras skills

- **`persona-builder`** (agent): invocado en Fase 1 para obtener o crear el persona
- **`business-model-toolkit:customer-interview-system`** (skill externa): después de Fase 5,
  la solución convergida puede validarse con entrevistas de cliente (LCD Alvarez)
- **`map-workshop`** (skill UX): después de Design Studio, mapear el journey del persona
  con la nueva solución puede revelar nuevos pain points
- **`fidelity-guide`** (skill UX): decidir qué nivel de fidelidad usar para testear la
  solución convergida (sketch → wireframe → clickable prototype → coded)

## Recursos adicionales

- **Lean UX** (Jeff Gothelf, O'Reilly 2013), cap. 5 — "Design It Together"
- *Sprint* (Jake Knapp, Simon & Schuster 2016) — Google Ventures' Design Sprint framework,
  versión de 5 días del Design Studio
- *The Gamestorming Book* (Gray, Brown, Macanufo, 2010) — variantes del ejercicio 6-up
