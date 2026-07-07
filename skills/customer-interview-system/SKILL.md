---
name: customer-interview-system
version: 1.0.0
description: >
  This skill should be used when the user asks to conduct customer interviews,
  needs help with "customer interview", "entrevista cliente", "entrevistar clientes",
  "script de entrevista", "voy a entrevistar", "mentor de entrevistas",
  "outreach para entrevistas", "resumir entrevista", "patrones en entrevistas",
  or wants structured guidance through the complete customer development
  interview methodology (Lean Customer Development by Cindy Alvarez, 2014):
  5 core questions, opening/closing scripts, 60-second silence rule, magic wand,
  "other people" method, speech pattern detection (real vs. aspirational),
  milestone tracking (2/5/10/15-20 interviews), pattern detection across interviews,
  V/I/AI summary format, and post-interview self-evaluation.
  Invocable standalone OR from business-model-toolkit Phase 2 (Problem Validation)
  and Phase 7 (Solution Interview).
---

# Sistema de Entrevistas de Customer Development

Implementa el sistema completo de entrevistas de *Lean Customer Development*
(Cindy Alvarez, O'Reilly 2014). Guía al fundador desde el outreach inicial,
pasando por la ejecución de la entrevista, hasta el análisis de patrones
cross-entrevistas.

## Relación con `entrevista-problema.md` y `entrevista-solucion.md`

**Esta skill NO reemplaza** los templates existentes `entrevista-problema.md`
(Fase 2 de `problem-validation`) ni `entrevista-solucion.md` (Fase 7 de
`solution-design`). Los complementa.

| Template existente | Esta skill (customer-interview-system) |
|---|---|
| **QUÉ preguntar** — el cuestionario estructurado (Running Lean: 7 secciones; Solution: 7 secciones con Commitment Ladder) | **CÓMO ejecutar** — outreach, scripts conversacionales (5 preguntas core Alvarez), técnicas (60s silencio, magic wand, other people) |
| Se genera **UNA VEZ** por proyecto como guía reutilizable | Se ejecuta **una vez por cada entrevista** — genera notes.md + summary.md individuales |
| Formato: **cuestionario** con preguntas cualitativas + cuantitativas + escalas | Formato: **conversación** abierta, transcripción semi-estructurada |
| Ideal para: **encuestas a escala**, validación estructurada post-descubrimiento | Ideal para: **descubrimiento inicial**, deep qualitative insights, patrones cross-entrevistas |
| Cubre las **7 dimensiones de Running Lean** (Detonante, Resultado Esperado, Soluciones Usadas, Alternativas, Inercia, Fricciones, Próximos Pasos) | Usa las **5 preguntas core de Alvarez** como espina dorsal conversacional + follow-ups naturales |

**Integración práctica**:

1. **Fase 2a (Lluvia de Supuestos)**: identifica Top 3 hipótesis de alto riesgo
2. **Fase 2b (Entrevista del Problema)**: genera `02-entrevista-problema.md` — la GUÍA
   estructurada del proyecto (qué quiero aprender, qué dimensiones cubrir)
3. **customer-interview-system** (esta skill): ejecuta el programa de entrevistas usando
   las 5 preguntas core Alvarez como conversación natural, **usando `02-entrevista-problema.md`
   como checklist mental** para asegurarse de cubrir las 7 dimensiones durante la charla.
   Cada entrevista produce `entrevistas/entrevista-NN-[nombre]/notes.md` + `summary.md`.

**Regla práctica**: El entrevistador usa las 5 preguntas core como abrepuertas conversacional;
al final de la entrevista (antes del closing) revisa mentalmente las 7 secciones de
`02-entrevista-problema.md` y si alguna quedó sin cubrir, hace un follow-up natural.
Nunca leer el cuestionario como checklist explícito delante del entrevistado — mata el flow.

Para la **entrevista de solución** (Fase 7), la relación es análoga:
- `entrevista-solucion.md` = guía estructurada con Commitment Ladder + pricing + comparación
- `customer-interview-system` = ejecuta la conversación, captura reacción espontánea al demo,
  detecta speech patterns de commitment real vs. aspirational

## Regla de idioma

Todo el contenido generado debe estar en **español**. Los términos técnicos
(JTBD, Magic Wand, 5 Whys) se presentan en formato **"español (English)"**
la primera vez que aparecen.

## Directorio de salida

```
./business/01-problema-hipotesis/entrevistas/
├── 00-outreach-templates.md           # Templates personalizados: email, LinkedIn, scheduling, follow-up
├── 00-patrones.md                     # Cross-interview pattern detection (se actualiza cada milestone)
├── entrevista-01-[nombre-persona]/
│   ├── notes.md                       # Raw interview notes con 5 core questions + observaciones
│   └── summary.md                     # V/I/AI summary (Validates/Invalidates/Also Interesting)
├── entrevista-02-[nombre-persona]/
│   └── ...
└── entrevista-NN-[nombre-persona]/
    └── ...
```

Para **entrevistas de solución** (Fase 7 del business-model-toolkit), usar
`./business/02-solucion-validacion/entrevistas/` con la misma estructura.

## Puertas obligatorias

NO avanzar sin:

- **Puerta 0 (Preparación)**: outreach templates generados y al menos 5 prospects contactados
- **Puerta 1 (Después de 2 entrevistas)**: ajustar preguntas y tono según feedback inicial
- **Puerta 2 (Después de 5 entrevistas)**: debe haber al menos UN entrevistado emocionado con el problema. Si no → replantear hipótesis
- **Puerta 3 (Después de 10 entrevistas)**: patrones emergiendo. Aplicar técnica "other people" para desafiarlos
- **Puerta 4 (Después de 15-20 entrevistas)**: patrones consistentes, ya no hay sorpresas nuevas. Hipótesis validada o invalidada

---

## Vista general del flujo

```
FLUJO DE ENTREVISTAS DE CUSTOMER DEVELOPMENT
  |-- Paso 1: Preparación           -> outreach templates + lista de prospects
  |-- Paso 2: Script de entrevista  -> 5 core questions personalizadas al proyecto
  |-- Paso 3: Ejecución             -> opening + flow + closing (user lo hace offline)
  |-- Paso 4: Debriefing             -> notes.md + summary.md V/I/AI + self-eval
  |-- Paso 5: Pattern detection     -> 00-patrones.md actualizado cada milestone
  +-- Puerta: Hipótesis validada o pivot?
```

---

## Paso 1: Preparación y Outreach

Leer plantilla: `${CLAUDE_PLUGIN_ROOT}/assets/templates/outreach-templates.md`

**Objetivo**: Generar templates de outreach personalizados al proyecto para contactar
prospects (customers, clientes potenciales).

**Preguntas al usuario**:

- **OT-1**: "¿A qué segmento de cliente vas a entrevistar primero? (Usá el segmento
  identificado en la Fase 3 del business-model-toolkit, o describilo si no lo tenés aún.)"
- **OT-2**: "¿Tenés acceso a prospects? Marcá los canales disponibles:
  - [ ] Conexiones personales (amigos, familia, red cercana)
  - [ ] LinkedIn (tus conexiones + búsqueda)
  - [ ] Comunidades online (Slack, Discord, foros)
  - [ ] Eventos presenciales / conferencias
  - [ ] Cold email
  - [ ] Referidos de entrevistas previas (foot-in-the-door)"
- **OT-3**: "¿Qué incentivo podés ofrecer por 20-30 minutos de su tiempo?
  (nada / café / gift card / acceso temprano al producto / otro)"

Generar el archivo de outreach templates en el directorio correcto según la fase invocante:
- **Desde Fase 2 (Problem Interview)**: `./business/01-problema-hipotesis/entrevistas/00-outreach-templates.md`
- **Desde Fase 7 (Solution Interview)**: `./business/02-solucion-validacion/entrevistas/00-outreach-templates.md`
- **Invocación standalone**: preguntar al usuario qué fase está validando (problema o solución) y usar el path correspondiente

Path: `./business/{01-problema-hipotesis|02-solucion-validacion}/entrevistas/00-outreach-templates.md` con:
- **Template 1**: Request de introducción (para forwardear a contactos)
- **Template 2**: LinkedIn direct message
- **Template 3**: Email de scheduling (con 3-4 slots de tiempo específicos)
- **Template 4**: Follow-up si no responden en 1 semana
- **Template 5**: Thank you post-entrevista + foot-in-the-door para seguir el contacto

Todos los templates deben estar **completamente personalizados** al proyecto (Opción B):
- Nombre del proyecto real
- Problema específico que se investiga (no placeholder)
- Incentivo real
- Slots de tiempo realistas

Presentar. Esperar aprobación.

---

## Paso 2: Script de Entrevista

Leer plantilla: `${CLAUDE_PLUGIN_ROOT}/assets/templates/interview-notes-template.md`

**Objetivo**: Generar el script de preguntas personalizado al proyecto.

### Las 5 preguntas core (Alvarez)

Estas 5 preguntas son la columna vertebral de TODA entrevista de customer development.
Se personalizan al contexto del proyecto pero mantienen su estructura:

1. **"Tell me about how you do ______ today..."**
   - Personalizada: `"Contame cómo [proceso/tarea específica del proyecto] actualmente."`

2. **"Do you use any [tools/products/apps/tricks] to help you get ______ done?"**
   - Personalizada: `"¿Usás alguna herramienta, app, o truco que te ayude a [resolver el problema]?"`

3. **"If you could wave a magic wand and be able to do anything that you can't do today,
   what would it be? Don't worry about whether it's possible, just anything."**
   - Personalizada: `"Si pudieras tener una varita mágica y cambiar cualquier cosa
     sobre [área del problema], sin importar si es posible o no hoy — ¿qué sería?"`

4. **"Last time you did ______, what were you doing right before you got started?
   Once you finished, what did you do afterward?"**
   - Personalizada: `"La última vez que [hiciste la tarea], ¿qué estabas haciendo justo
     antes de empezar? ¿Y después de terminar?"` (el contexto importa tanto como la tarea en sí)

5. **"Is there anything else about ______ that I should have asked?"**
   - Personalizada: `"¿Hay algo más sobre [el problema/área] que debería haber preguntado y no lo hice?"`

**Preguntas al usuario para personalizar**:

- **SC-1**: "¿Cuál es la hipótesis principal que querés validar/invalidar? (del resultado
  de Fase 2a Lluvia de Supuestos, Top 3 supuestos prioritarios)"
- **SC-2**: "¿Qué proceso/tarea específica reemplaza la frase '_____' en pregunta 1?
  (ej. 'gestionás inventario', 'encontrás dev freelance', 'planificás comidas de la semana')"

Generar **script personalizado** con:
- Opening script (1 minuto, establece tono conversacional)
- 5 preguntas core personalizadas
- Follow-up prompts sugeridos (Can you tell me more?, Why do you think that happens?,
  What's the consequence?, Who else is involved?)
- Closing script (3 últimos minutos: foot-in-the-door + thank you)

**Reglas NO negociables del script**:

- **Regla de los 60 segundos de silencio**: Después de la primera pregunta, el
  entrevistador NO habla durante al menos 60 segundos. Esto fuerza al entrevistado
  a elaborar más allá de la respuesta superficial inicial.
- **Preguntas del presente, NO del futuro**: Nunca "¿Usarías...?" o "¿Qué tan probable es...?".
  Siempre "Contame de la última vez que...".
- **Técnica "Other People"**: Cuando detectás un patrón, desafialo: "Otras personas me han
  dicho que prefieren X — ¿cómo te comparás vos con eso?". Provoca corrección o confirmación.
- **Abstract up one level**: Si te enfocás en grocery delivery, preguntá cómo alimenta a su
  familia. Si en file sharing, cómo colabora en documentos.
- **Zero leading questions**: Nunca "¿No pensás que...?", "¿Te gustaría...?", "¿No sería genial si...?".
- **Features → Problems**: Si el entrevistado sugiere features, redirigir: "Me decís que te
  gustaría [feature]. ¿Podés contarme cuándo y cómo lo usarías? Dando un paso atrás, parece
  que tenés el problema de [X] — ¿es así?"

Para las técnicas detalladas, leer `${CLAUDE_PLUGIN_ROOT}/references/customer-interview-methodology.md`.

Presentar script. Esperar aprobación. Recordar al usuario: "el script es una guía, no un guion
rígido — seguí la energía del entrevistado."

---

## Paso 3: Ejecución (el usuario la hace offline)

**No se hace en esta skill** — la entrevista la ejecuta el usuario con el prospect, offline.

Recomendaciones a darle al usuario:

- **Emparejar (pair interviewing)**: Si es equipo, una persona entrevista, otra toma notas.
  Beneficios: detecta leading questions del entrevistador, involucra a miembros escépticos
  del equipo, trae perspectivas cross-funcionales.
- **Grabación**: Con permiso del entrevistado, grabar (Zoom local record, Otter.ai, etc.)
  facilita luego el análisis de patrones.
- **Duración**: 20-45 minutos. Si se alarga más, el entrevistado se cansa o se vuelve
  complaciente.

Una vez que el usuario ejecute la entrevista, invita a volver con las notas crudas.

---

## Paso 4: Debriefing (Resumen V/I/AI)

Leer plantilla: `${CLAUDE_PLUGIN_ROOT}/assets/templates/interview-summary-v-i-ai.md`

**Objetivo**: Después de cada entrevista, procesar las notas y generar un resumen estructurado.

**Preguntas al usuario**:

- **DB-1**: "Pasame tus notas crudas de la entrevista. Puede ser transcripción, bullet points,
  grabación, o cualquier formato. Lo estructuramos juntos."
- **DB-2**: "¿Cuál fue el MOMENTO de la entrevista con más emoción/energía? (Esa es la
  señal más importante — la emoción ES priorización.)"

Generar:

1. **`notes.md`** dentro de `entrevista-NN-[nombre]/`:
   - Metadata (nombre, fecha, rol/empresa, canal de contacto)
   - Sección por cada una de las 5 preguntas core con respuestas capturadas
   - Sección "También interesante" con tangentes y observaciones
   - Marcar con **bold** o 🔥 los momentos con emoción alta

2. **`summary.md`** dentro de `entrevista-NN-[nombre]/` con formato V/I/AI:
   - **V — Validates**: 2-3 hallazgos que CONFIRMAN hipótesis del proyecto
   - **I — Invalidates**: 2-3 hallazgos que CONTRADICEN hipótesis del proyecto
   - **AI — Also Interesting**: 2-3 sorpresas, tangentes, o insights inesperados

3. **Speech pattern analysis** (automatizado por la skill):
   Analizar las respuestas en busca de speech patterns según Table 6-1 de Alvarez:

   | Real (customer) | Aspirational (non-customer) |
   |---|---|
   | "Ya probé..." / "Así lo hago..." | "Planeo hacer..." / "Aún no lo probé..." / "Sigo queriendo..." |
   | "Necesito [tarea] más rápido/mejor porque..." | "[Tarea] es imposible..." / "No sé cómo alguien hace [tarea]..." |
   | "Esto me ayudaría a lograr [meta]..." | "Estaría bueno tener..." / "Sería interesante ver..." |
   | "Ahora mismo..." | "Pronto..." / "En cuanto pase [evento]..." |
   | "Así lo hago..." | "¡No lo hago! Debería..." |

   Marcar cada respuesta del entrevistado con 🟢 (real) o 🟡 (aspirational).
   Una entrevista con mayoría 🟡 tiene valor limitado — el entrevistado describe lo que
   DESEARÍA, no lo que HACE.

4. **Self-evaluation checklist** (para el entrevistador):
   - ¿El opening fluyó bien?
   - ¿Hice preguntas leading u ofrecí opiniones?
   - ¿Alguna pregunta generó respuestas cortas/blandas? (revisarla para la próxima)
   - ¿Hice alguna pregunta improvisada valiosa? (agregar al template)
   - ¿Hay algo que quería aprender y no aprendí?
   - ¿Dónde mostró más emoción el entrevistado?

Presentar. Esperar aprobación. Guardar archivos.

---

## Paso 5: Pattern Detection (cross-entrevistas)

Después de cada milestone (2, 5, 10, 15-20 entrevistas), actualizar `00-patrones.md` con:

### Después de la entrevista #2:
- **Ajustes al script**: preguntas que no funcionaron, follow-ups nuevos valiosos
- **Ajustes de tono/ritmo**: ¿hablé mucho yo? ¿fui muy técnico? ¿muy abstracto?

### Después de la entrevista #5 (PUERTA crítica):
Responder:
1. ¿Encontré al menos UNA persona REALMENTE emocionada con el problema?
   - Si NO → la hipótesis de problema probablemente está mal. Volver a Fase 2a
     Lluvia de Supuestos y reformular.
2. ¿Qué patrones emergen? Listar 3-5.
3. ¿Qué supuestos se validaron? ¿Cuáles se invalidaron?

### Después de la entrevista #10:
- Aplicar técnica "other people" en las siguientes entrevistas para desafiar los patrones.
  Ejemplo: "Otras personas me han dicho que prefieren X. ¿Vos cómo lo ves?"
- Si emergen dos clusters diferentes de respuestas → hay dos segmentos de cliente distintos,
  decidir cuál priorizar.

### Después de la entrevista #15-20:
- Si los patrones son consistentes y ya NO hay sorpresas nuevas → hipótesis de problema
  **validada o invalidada** con suficiente evidencia.
- Si todavía hay alta varianza → probablemente estás entrevistando un público demasiado amplio.
  Estrechar el perfil del cliente objetivo.

### Validación de hipótesis (4 criterios de Alvarez)

Antes de declarar la hipótesis VALIDADA, verificar los 4 criterios:

- [ ] 1. El cliente confirma que SÍ hay un problema/dolor real
- [ ] 2. El cliente cree que el problema PUEDE y DEBE resolverse
- [ ] 3. El cliente ya ha INVERTIDO (tiempo, dinero, esfuerzo, aprendizaje) intentando resolverlo
- [ ] 4. El cliente NO tiene circunstancias fuera de su control que le impidan solucionarlo

Si los 4 criterios se cumplen con ≥70% de los entrevistados → hipótesis **validada**.
Si menos → pivot o replantear.

Generar/actualizar `00-patrones.md` después de cada milestone.

---

## Principios clave

- **Una pregunta a la vez** — nunca bombardear al entrevistado con preguntas compuestas
- **Escuchar más que hablar** — regla del 80/20 (entrevistado 80% del tiempo)
- **Presente, no futuro** — "¿cómo lo hacés hoy?" no "¿cómo lo harías?"
- **Emoción es priorización** — el momento de más emoción es el tema más importante
- **Abrazar tangentes** — pueden revelar un problema más urgente que el que estás investigando
- **Skepticism sano** — "si dice 'tal vez', anotar como 'no'"
- **Real vs. aspirational** — distinguir entre lo que HACE vs. lo que DESEA
- **Invalidación temprana es victoria** — mejor invalidar en 5 entrevistas que después
  de construir el producto
- **Español como base** — con términos técnicos en formato "español (English)" la primera vez

---

## Integración con otras skills

Esta skill puede invocarse **standalone** o desde otras fases del business-model-toolkit:

- **Desde `problem-validation` Fase 2b (Entrevista del Problema)**: usar `customer-interview-system`
  para generar script personalizado + outreach + procesar cada entrevista
- **Desde `solution-design` Fase 7 (Solution Interview)**: mismo flujo pero con preguntas
  orientadas a validar willingness-to-pay (commitment ladder)
- **Desde `ux-research-toolkit`** (cualquier map type): invocar antes de llenar data de
  mapas para obtener insights de entrevistas reales en lugar de asumidos

---

## Recursos adicionales

### Archivos de referencia
- **`${CLAUDE_PLUGIN_ROOT}/references/customer-interview-methodology.md`** — Técnicas detalladas
  (60s silencio, magic wand, other people, 5 Whys adaptado, foot-in-the-door)
- **`${CLAUDE_PLUGIN_ROOT}/references/methodology.md`** — Principios generales del plugin
- **`${CLAUDE_PLUGIN_ROOT}/references/output-structure.md`** — Estructura de directorios

### Archivos de plantilla (leer antes de generar)
- **`${CLAUDE_PLUGIN_ROOT}/assets/templates/outreach-templates.md`** — 5 templates de outreach
- **`${CLAUDE_PLUGIN_ROOT}/assets/templates/interview-notes-template.md`** — Estructura de notas
  con 5 core questions + sidebar reminders
- **`${CLAUDE_PLUGIN_ROOT}/assets/templates/interview-summary-v-i-ai.md`** — Formato V/I/AI
- **`${CLAUDE_PLUGIN_ROOT}/assets/templates/assumption-brainstorm.md`** — Base de hipótesis
  (input de Fase 2a)

### Referencia bibliográfica
- Cindy Alvarez — *Lean Customer Development: Building Products Your Customers Will Buy*
  (O'Reilly, 2014), especialmente capítulos 3-6.
