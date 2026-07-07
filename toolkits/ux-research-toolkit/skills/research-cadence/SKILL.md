---
name: research-cadence
version: 1.0.0
description: >
  Sets up and maintains a continuous research cadence using the 3-12-1 format
  from Lean UX: 3 users tested per week, by 12:00 noon on 1 day (usually Thursday).
  Use when the user asks for "research cadence", "weekly user testing",
  "continuous discovery", "3-12-1", "Thursday user tests", "investigacion continua",
  "testing semanal", "/research-cadence", or wants to establish a sustainable
  weekly rhythm for UX research instead of big-bang research events.
  Generates weekly plans (Mon-Fri activities) and tracks cumulative findings.
---

# Cadencia de Research (3-12-1 Weekly)

Implementa la cadencia semanal de research continuo basada en *Lean UX*
(Jeff Gothelf, O'Reilly 2013), cap. 6 — "Test, Learn, Iterate".

> "Three users. By twelve noon. Once a week."
> — La cadencia 3-12-1 transforma research de evento esporádico a ritual recurrente.

## Regla de idioma

Contenido en **español**. Términos de UX en formato "español (English)" la primera vez.

## Directorio de salida

```
./docs/ux-research/
├── research-cadence.md                    # Documento maestro (plan general + config)
└── weekly-logs/
    ├── YYYY-WW/                           # Una carpeta por semana (ISO week)
    │   ├── plan.md                        # Plan Mon-Fri con actividades
    │   ├── recruiting-list.md             # Prospects contactados + estado
    │   ├── test-script.md                 # Script del testing day
    │   ├── session-01-[nombre].md         # Notas de la sesión 1
    │   ├── session-02-[nombre].md         # Notas de la sesión 2
    │   ├── session-03-[nombre].md         # Notas de la sesión 3
    │   └── patterns.md                    # Patrones detectados esa semana
    └── cumulative-patterns.md             # Patrones cross-semanas (3+ semanas)
```

## Estilo de preguntas

Una pregunta a la vez. Opción múltiple cuando posible.

---

## Filosofía del 3-12-1

**3 usuarios**: Suficiente para detectar patrones, pocos suficientes para procesar
en un día. No 1 (muy poco), no 10 (burnout).

**12:00 (mediodía)**: Todas las sesiones terminan antes del mediodía. La tarde se usa
para procesar hallazgos **mientras están frescos**, no al día siguiente.

**1 día**: Un solo día de la semana dedicado a testing. Por defecto **jueves** (suficiente
info la semana como para tener algo que testear; deja viernes para planificar siguiente).

**Cross-sprint**: Se testea LO QUE ESTÉ LISTO el jueves — sketches, wireframes, prototipos
clickeables, coded builds. La skill `fidelity-guide` ajusta expectativas según fidelity.

**Regla de oro**: Nunca pasar más de **5 días hábiles sin hablar con un usuario**.
Si llegás al día 6 sin research, es una regresión a big-bang research.

---

## Paso 1 — Configuración inicial

La primera vez que el usuario activa esta skill, generar el **documento maestro**
`./docs/ux-research/research-cadence.md` con la configuración del proyecto.

### Preguntas

- **RC-1**: "¿Qué día de la semana va a ser el **Testing Day**?
  Por defecto jueves. Opciones:
  - [ ] Lunes (recomendado solo si tu sprint termina viernes)
  - [ ] Martes
  - [ ] Miércoles (si preferís mitad de semana)
  - [x] Jueves (recomendado — default de Lean UX)
  - [ ] Viernes (no recomendado — procesamiento queda para lunes)"

- **RC-2**: "¿Quién compone el equipo de research?
  - **Moderador(es)**: quien lidera las sesiones
  - **Notetaker(s)**: quien toma notas
  - **Observadores**: stakeholders que miran (producto, dev, design)
  - **Recruiter**: quien agenda prospects"

- **RC-3**: "¿Qué canal usan para el testing?
  - [ ] Presencial en oficina
  - [ ] Zoom / Google Meet (video + screen share)
  - [ ] Teléfono (solo voz)
  - [ ] Mixto"

- **RC-4**: "¿Qué software de broadcasting tienen para que el equipo entero mire en vivo?
  Opciones: Morae, Silverback, Zoom rooms, Lookback, UserTesting.com,
  ninguno (solo moderador/notetaker). Esto permite que **todo el equipo** vea las
  mismas sesiones sin necesidad de re-grabar."

- **RC-5**: "¿Qué incentivo ofrecen a los usuarios? (gift card, acceso temprano, nada,
  otro — aplica por sesión)"

### Output del paso 1

`research-cadence.md` con:

```markdown
# Research Cadence — [Proyecto]

## Configuración

- **Testing Day**: [día elegido], 08:30-12:00 (3 sesiones × 1h con 15min buffer; TODAS terminan ≤ 12:00 noon per regla 3-12-1)
- **Equipo**:
  - Moderador(es): [nombres]
  - Notetaker(s): [nombres]
  - Observadores fijos: [nombres]
  - Recruiter: [nombre]
- **Canal**: [elegido]
- **Broadcasting software**: [elegido]
- **Incentivo por sesión**: [elegido]

## Ritmo semanal

- **Lunes**: Recruiting + planificación
- **Martes**: Refinamiento del MVP/prototipo
- **Miércoles**: Test script + finalización de recruiting
- **Jueves**: Testing day (3 × 1h, antes de mediodía)
- **Viernes**: Planificación de próxima semana

## Iteraciones activas

[Lista de features/hipótesis que se están testeando — se actualiza cada semana]

## Métricas del programa

- Total de usuarios testeados: [acumulativo]
- Total de semanas activas: [contador]
- Días sin research desde último testing day: [debería ser ≤5]
```

**PUERTA DE APROBACIÓN**: Confirmar configuración antes de generar planes semanales.

---

## Paso 2 — Plan semanal (cada lunes)

Cada lunes, el usuario activa esta skill para generar el plan de la semana actual.

### Preguntas

- **WP-1**: "¿Qué vamos a testear esta semana? Puede ser:
  - Sketches nuevos (→ valida concepto)
  - Wireframes estáticos (→ valida IA/navegación)
  - Mockups de alta fidelidad (→ valida branding/estética)
  - Clickable prototype (→ valida estructura/flujo)
  - Coded build con data real (→ valida comportamiento)

  Si hay varios items, elegir UNO como foco principal. Los demás son secundarios.
  **Regla**: si no hay nada listo, testear el build actual de la aplicación —
  nunca cancelar testing day."

- **WP-2**: "¿Cuál es la pregunta de investigación de esta semana?
  Formato: 'Los usuarios pueden [hacer X] usando [el prototipo/build]?'"

- **WP-3**: "¿Cuál es el perfil de los 3 usuarios a reclutar esta semana?
  - Mismo segmento que semanas anteriores? (consistencia)
  - Segmento nuevo? (diversidad)
  - Mix 2+1 (2 core + 1 exploratorio)"

- **WP-4**: "¿Alguien del equipo va a hacer pair interviewing esta semana?
  (moderador + observador rotando roles entre sesiones — recomendado)"

### Output: plan semanal

Generar `./docs/ux-research/weekly-logs/YYYY-WW/plan.md`:

```markdown
# Semana YYYY-WW — Plan

## Pregunta de investigación

**[Pregunta principal de la semana — una oración]**

## Lo que vamos a testear

- **Artefacto principal**: [sketch/wireframe/mockup/prototype/build]
- **Nivel de fidelidad**: [consultar fidelity-guide skill si hay dudas]
- **Items secundarios**: [otros si hay]

## Perfil de reclutamiento

[Describir los 3 usuarios objetivo]

## Cronograma Mon-Fri

### Lunes (hoy)
- [ ] Plan semanal generado (este doc)
- [ ] Recruiter inicia contacto con prospects (target: 5-7 leads, 3 confirmados)
- [ ] Se escribe test script draft

### Martes
- [ ] Refinamiento del artefacto principal (basado en retros previas)
- [ ] Follow-up con prospects que no confirmaron
- [ ] Revisión del test script draft

### Miércoles
- [ ] Finalizar recruiting (3 confirmados con hora, link, recordatorio enviado)
- [ ] Finalizar test script
- [ ] Team review rápido del artefacto (todos alineados con qué se va a mostrar)

### Jueves — TESTING DAY (TODAS las sesiones terminan ≤ 12:00 noon)
- [ ] 08:30-09:30 — Sesión 1
- [ ] 09:45-10:45 — Sesión 2
- [ ] 11:00-12:00 — Sesión 3
- [ ] 14:00-16:00 — Debrief del equipo (TODOS los observadores): affinity mapping
  - Leer hallazgos en voz alta
  - Transcribir a cards/sticky notes
  - Sortear por temas
  - Identificar 3-5 patrones de la semana

### Viernes
- [ ] Semana siguiente: qué testear, qué preguntas abiertas quedaron
- [ ] Actualizar `cumulative-patterns.md` si patrones se repiten 3+ semanas
- [ ] Comunicación a stakeholders externos (product, exec) con highlights

## Recruiting list

[Tabla en `recruiting-list.md`]
```

Y `recruiting-list.md` con tabla de prospects contactados.

---

## Paso 3 — Testing day (jueves)

El jueves por la mañana, el equipo ejecuta las 3 sesiones.

### Para cada sesión, generar `session-NN-[nombre].md`

Template (puede invocar `business-model-toolkit:customer-interview-system` para la
estructura detallada de notas):

```markdown
# Sesión N — [Nombre del participante]

**Fecha**: YYYY-MM-DD
**Hora**: HH:MM - HH:MM
**Moderador**: [nombre]
**Notetaker**: [nombre]
**Observadores en vivo**: [nombres]

## Pregunta de investigación (copiar de plan.md)

[...]

## Perfil del participante

- Rol/segmento: [...]
- Canal de reclutamiento: [...]
- Incentivo recibido: [...]

## Notas (semi-estructuradas)

### Apertura
[Cómo empezó la sesión, tono del participante]

### Tareas observadas / recorrido del prototipo
[Paso por paso qué hizo el participante]

### Quotes textuales relevantes
> "[cita textual]"

### Momentos de confusión / fricción
[Dónde se trabó, qué no entendió]

### Momentos de aha / deleite
[Dónde se iluminó, qué le gustó]

### Preguntas espontáneas del participante
[Qué preguntó sin que se le pidiera]

## Respuesta a la pregunta de investigación

- [ ] Sí, el participante pudo [hacer X]
- [ ] Parcialmente — completó con ayuda
- [ ] No — se trabó en [paso específico]

## Top 3 hallazgos de esta sesión

1. [Hallazgo]
2. [Hallazgo]
3. [Hallazgo]
```

### Debrief del equipo (jueves tarde)

**Proceso** (referenciado en `plan.md` línea "14:00-16:00 — Debrief"):

1. **Todos los observadores** se reúnen (no solo moderador)
2. **Leer findings en voz alta** sesión por sesión
3. **Transcribir** a sticky notes (1 finding = 1 sticky)
4. **Affinity mapping**: agrupar stickies por tema
5. **Identificar patrones**: temas que aparecieron en 2+ sesiones
6. **Detectar outliers**: findings únicos de una sesión — no actuar sobre ellos todavía,
   esperar a ver si se repiten en semanas siguientes

### Output: patterns.md de la semana

```markdown
# Patrones de Semana YYYY-WW

## Pregunta de investigación original

[De plan.md]

## Respuesta (a nivel de 3 sesiones)

- [ ] CONFIRMADO — los 3 participantes pudieron hacer X
- [ ] PARCIAL — 2 de 3 pudieron
- [ ] NEGADO — 0-1 de 3 pudieron

## Top 3 patrones recurrentes

1. **[Patrón A]** — aparece en sesiones N, N (citar)
2. **[Patrón B]** — aparece en sesiones N, N
3. **[Patrón C]** — aparece en sesiones N, N

## Outliers (esperar a ver si se repiten)

- Sesión N: [hallazgo único] — monitor próximas semanas

## Decisiones tomadas

- Cambios al artefacto: [qué se cambia para próxima semana]
- Cambios a la pregunta de investigación: [refinamiento para próxima semana]
- Issues bloqueantes: [qué hay que resolver antes de testear más]
```

---

## Paso 4 — Patrones cross-semanas

Cada 3+ semanas, actualizar `cumulative-patterns.md` con patrones que aparecieron
repetidamente (no solo una semana).

### Formato

```markdown
# Patrones Cumulativos — Proyecto

Última actualización: YYYY-MM-DD (semana YYYY-WW)

## Patrones confirmados (aparecen en 3+ semanas distintas)

### Patrón 1: [Descripción]

- **Frecuencia**: semanas [WW-01, WW-02, WW-04]
- **Implicación para el diseño**: [qué significa]
- **Acción tomada**: [qué cambio se hizo o se va a hacer]

### Patrón 2: ...

## Patrones emergentes (aparecen en 2 semanas — monitorear)

[...]

## Patrones de una semana (outliers — puede ser ruido)

[...]

## Asunciones que ya fueron validadas por research continuo

- [Asunción 1] → validada por patrones [N, N, N]
- [Asunción 2] → invalidada por patrones [N, N]

## Asunciones pendientes de validar

[Lista de asunciones del equipo que todavía no se testearon]
```

---

## Principios clave

- **Continuidad > profundidad** — mejor 3 sesiones semanales consistentemente que 10
  sesiones un día y luego silencio un mes
- **El equipo entero mira** — broadcasting software permite que dev/product/design
  vean las mismas sesiones sin re-graduaciones
- **Nunca cancelar Testing Day** — si no hay prototipo nuevo, testear el build actual
- **Transcribir el día de** — procesar hallazgos mientras están frescos, no al día siguiente
- **Outliers ≠ patrón** — un hallazgo de una sesión puede ser ruido; esperar a ver si se repite
- **Pair interviewing** — rotar moderador/notetaker para distribuir skill y evitar fatigue
- **5 días máximo sin research** — regla de oro; si se pasa, es regresión a big-bang

## Integración con otras skills

- **`persona-builder`** (agent): para alinear recruiting con el segmento objetivo
- **`map-workshop` / tipos de mapa**: los hallazgos de research semanal actualizan los
  mapas UX (ej. nuevos pain points detectados se agregan al journey map)
- **`fidelity-guide`** (skill UX): decide qué feedback esperar cada semana según el
  artefacto listo
- **`business-model-toolkit:customer-interview-system`**: formato de notas de sesión
  individual (notes.md + summary.md V/I/AI)
- **`design-studio`** (skill UX): si research detecta problema nuevo, correr Design
  Studio para diverger/converger en solución antes de próximo testing day

## Recursos adicionales

- **Lean UX** (Jeff Gothelf, O'Reilly 2013), cap. 6 — "Test, Learn, Iterate"
- **TheLadders case study** (mencionado en Lean UX): 3 años de testing 3-12-1 semanal
  reveló shifts actitudinales hacia SMS en job search que no aparecieron en research
  puntual
- **Broadcasting software options**:
  - Morae (Windows, histórico)
  - Silverback (Mac)
  - Zoom rooms (universal — probablemente ya lo tenés)
  - Lookback (premium, purpose-built)
  - UserTesting.com (incluye reclutamiento)
