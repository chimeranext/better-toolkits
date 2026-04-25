---
name: fidelity-guide
version: 1.0.0
description: >
  Advises on what feedback to expect (and NOT expect) from user research
  sessions based on the fidelity level of the artifact being tested
  (sketches, wireframes, high-fi mockups, clickable prototypes, coded builds).
  Use when the user asks "what should I test", "fidelity level",
  "what feedback to expect", "nivel de fidelidad", "que esperar del testing",
  "testing wireframes vs prototype", "/fidelity-guide", or is unsure whether
  an artifact is ready to show users. Based on Lean UX (Jeff Gothelf,
  O'Reilly 2013), cap. 5 — "The Fidelity Sweet Spot".
---

# Fidelity Guide (Guía de Niveles de Fidelidad)

Ayuda a decidir **qué feedback esperar** de una sesión de research según el nivel de
fidelidad del artefacto. Evita errores comunes como testear branding con sketches
(demasiado pronto) o cuestionar la IA con un build coded (demasiado tarde).

Basado en *Lean UX* (Jeff Gothelf, O'Reilly 2013), cap. 5.

## Regla de idioma

Contenido en **español**. Términos de diseño UX en formato "español (English)" la
primera vez que aparecen.

## Directorio de salida

Esta skill **NO produce archivos** por default — es consultiva. Si el usuario pide
registro de la decisión tomada, puede generar:

```
./docs/ux-research/fidelity-decisions/YYYY-MM-DD-[topic].md
```

---

## Uso típico

Invocar esta skill **ANTES** de un testing day (jueves en `research-cadence`) cuando
hay dudas sobre qué artefacto mostrar o qué esperar de la sesión.

---

## Los 6 niveles de fidelidad

### Nivel 1 — Sketches (papel/pizarra/tablet)

**Qué es**: Dibujos a mano, crudos, en papel o tablet. Sin colores, sin texto final,
sin layout definitivo. Hechos en minutos.

**Qué feedback SÍ esperar**:
- ✅ **Validación del concepto**: ¿la idea general tiene sentido para el usuario?
- ✅ **Flow inicial**: ¿los pasos generales están en orden?
- ✅ **Reacción emocional**: ¿genera interés / curiosidad / confusión?

**Qué feedback NO esperar**:
- ❌ Feedback de **usabilidad específica** (no hay interacciones reales)
- ❌ Feedback de **visual design / branding** (no hay estética definida)
- ❌ Feedback de **copywriting** (texto es placeholder)
- ❌ Feedback de **layout preciso** (todo está re-arrangeable)

**Método de test ideal**: Conversación open-ended tipo "¿qué ves acá? ¿qué harías?"

**Cuándo usar**: Fase temprana de divergencia. Después de un Design Studio.

**Mal uso común**: Mostrar sketch y preguntar "¿te gusta el diseño?" — no hay diseño
todavía, la pregunta es incoherente.

---

### Nivel 2 — Wireframes estáticos (Balsamiq, papel estructurado, Figma low-fi)

**Qué es**: Layouts con boxes, placeholders, navegación definida, pero sin visual design.
Blanco y negro o grises. Sin clicks funcionales.

**Qué feedback SÍ esperar**:
- ✅ **Information architecture (IA)**: ¿la estructura/categorización tiene sentido?
- ✅ **Navegación**: ¿pueden encontrar dónde ir? ¿entienden la jerarquía?
- ✅ **Taxonomía y labeling**: ¿las etiquetas son claras? ¿el vocabulario coincide?
- ✅ **Copy choices**: ¿el texto principal comunica? (aunque no sea definitivo)
- ✅ **Priorización de contenido**: ¿lo importante está destacado vs. secundario?

**Qué feedback NO esperar**:
- ❌ Feedback de **branding / estética** (no hay)
- ❌ Feedback de **microinteracciones / animaciones** (estático)
- ❌ Feedback de **performance / velocidad** (no hay código)
- ❌ Feedback de **experiencia completa** (usuarios no pueden "completar una tarea")

**Método de test ideal**: Walkthrough guiado. Usuario explica qué ve, qué clickaría,
por qué. Moderador puede simular navegación mostrando el siguiente wireframe.

**Cuándo usar**: Después de validar el concepto con sketches. Antes de invertir en
visual design.

**Mal uso común**: Dejar el wireframe con Lorem Ipsum y preguntar si entienden el
contenido. El copy debe ser placeholder **realista**, no abstracto.

---

### Nivel 3 — Mockups de alta fidelidad NO clickeables (Figma, Sketch, PSD)

**Qué es**: Diseño visual completo — colores, tipografía, iconografía, sombras,
espaciado. Pero NO es clickeable — son imágenes.

**Qué feedback SÍ esperar**:
- ✅ **Branding / estética**: ¿comunica la personalidad de marca?
- ✅ **Jerarquía visual**: ¿el ojo va primero a lo importante?
- ✅ **Figure-ground**: ¿los elementos interactivos se distinguen del fondo?
- ✅ **Claridad de calls-to-action**: ¿los botones se ven como botones?
- ✅ **Paleta de color**: ¿los colores refuerzan el mensaje o distraen?
- ✅ **Legibilidad**: ¿el texto es legible en el contexto real?
- ✅ **Accesibilidad visual**: ¿contraste, tamaños cumplen estándares?

**Qué feedback NO esperar**:
- ❌ Feedback de **usabilidad funcional** (no se puede interactuar)
- ❌ Feedback de **flow cross-pantalla** (usuario ve una pantalla a la vez)
- ❌ Feedback de **microinteracciones** (estáticas)
- ❌ Feedback de **responsive / mobile real** (solo el mockup específico que hiciste)

**Método de test ideal**: Preference testing, 5-second test, first-click test.
Mostrar la imagen 5 segundos, preguntar qué recuerda.

**Cuándo usar**: Validar visual design ANTES de invertir en prototipo clickeable o código.

**Mal uso común**: Testear usabilidad con mockups no-clickeables. Si necesitás saber
si pueden navegar, usá Nivel 4+.

---

### Nivel 4 — Prototipos clickeables (Figma Prototype, Invision, Marvel)

**Qué es**: Mockups conectados con transiciones. El usuario puede clickar y navegar
entre pantallas. Sin lógica de negocio real — las transiciones son predefinidas.

**Qué feedback SÍ esperar**:
- ✅ **Product structure**: ¿la navegación realmente funciona en contexto?
- ✅ **Flow completo**: ¿pueden completar una tarea end-to-end?
- ✅ **Discoverability**: ¿encuentran features escondidas o avanzadas?
- ✅ **Confusion points**: ¿dónde se traban? ¿qué esperaron que pasara y no pasó?
- ✅ **Mental model**: ¿el modelo mental del usuario matchea la navegación?
- ✅ **Micro-copy**: ¿entienden los estados (loading, error, empty, success)?

**Qué feedback NO esperar**:
- ❌ Feedback de **performance real** (transiciones son instantáneas, no hay API calls)
- ❌ Feedback de **data edge cases** (data es hardcoded, no hay comportamientos extraños)
- ❌ Feedback de **flows alternos** que no prototipaste (los dead-ends te muestran solo
  la happy path)
- ❌ Feedback de **integración con otros sistemas** (aislado)

**Método de test ideal**: Task-based usability testing. "Querés comprar un café —
mostrame cómo lo harías." Cronometrar tareas, anotar fricciones.

**Cuándo usar**: Antes de escribir código. Para validar que el flow funciona antes
de comprometer dev time.

**Mal uso común**: Testear comportamiento con data real. Si necesitás saber cómo se
comporta con 10,000 items vs. 2 items, usá Nivel 5+.

---

### Nivel 5 — Coded prototype (hand-coded, no data real o data mock)

**Qué es**: Código real, pero:
- Data es mock / static
- No hay backend real (o hay uno mínimo)
- Puede estar deployed en staging / localhost

**Qué feedback SÍ esperar**:
- ✅ **Comportamiento / workflow realista**: ¿las interacciones responden como se espera?
- ✅ **Microinteracciones reales**: hover states, animations, transitions
- ✅ **Responsive real**: funciona en múltiples viewports
- ✅ **Accesibilidad técnica**: screen readers, keyboard navigation
- ✅ **Performance inicial**: ¿la UI siente rápida / lenta?
- ✅ **Edge cases de interacción**: dobleclicks, swipes, gestos inesperados

**Qué feedback NO esperar**:
- ❌ **Feedback de data real del usuario** (data es mock — no refleja casos reales)
- ❌ **Performance bajo carga real** (no hay concurrency, no hay DB real)
- ❌ **Integración completa** con otros sistemas
- ❌ **Métricas de adopción / conversión** (no hay usuarios orgánicos todavía)

**Método de test ideal**: Usability testing completo + think-aloud protocol. El
usuario usa el prototype como si fuera su app normal.

**Cuándo usar**: Validar la UX antes de conectar la API real y comprometer inversión
de backend.

**Mal uso común**: Testear con equipo interno solamente. Los colegas saben demasiado
sobre el producto y ocultan problemas reales.

---

### Nivel 6 — Coded build con data real (staging o producción)

**Qué es**: El producto real o cercano al real. Data real de usuarios reales,
integraciones reales, deploy completo.

**Qué feedback SÍ esperar**:
- ✅ **Comportamiento real del usuario en el tiempo**: cohort analysis, retention, funnels
- ✅ **A/B test conclusiones estadísticas**: diferencias medibles entre variantes
- ✅ **Performance bajo carga real**: lag, timeouts, errores concurrency
- ✅ **Edge cases de data**: ¿qué pasa con usuarios que tienen 50 items? ¿con 0?
- ✅ **Integraciones**: ¿realmente se conecta con Stripe/Supabase/etc.?
- ✅ **Conversión / monetización real**: ¿realmente pagan?

**Qué feedback NO esperar**:
- ❌ **Iteración rápida de diseño** — cualquier cambio requiere release
- ❌ **Exploración de alternativas radicales** — el costo de cambio es alto
- ❌ **Testing de concepto** — si el concepto es malo, llegaste muy tarde

**Método de test ideal**: A/B testing, cohort analysis, funnel analysis, session
recordings (ej. PostHog), NPS / CSAT surveys, customer interviews post-uso.

**Cuándo usar**: Después de validar con niveles 4-5. Para optimizar lo que ya funciona,
no para descubrir si funciona.

**Mal uso común**: Hacer user testing tipo "¿te gusta el nuevo diseño?" con producto
live. A esa altura ya no deberías preguntar opinión subjetiva — deberías medir
comportamiento real.

---

## Decisión rápida: ¿qué nivel usar?

```
¿Qué querés aprender?                    → Nivel recomendado

¿La idea/concepto tiene sentido?          → Nivel 1 (sketches)
¿La estructura/navegación funciona?       → Nivel 2 (wireframes)
¿El visual design comunica?               → Nivel 3 (mockups)
¿Pueden completar tareas end-to-end?      → Nivel 4 (clickable prototype)
¿Las microinteracciones funcionan?        → Nivel 5 (coded, mock data)
¿Hay traction / conversion?               → Nivel 6 (producción + analytics)
```

**Regla de oro**: **Usá la fidelidad MÁS BAJA que responda tu pregunta de
investigación**. Cuanto mayor la fidelidad, mayor el costo de cambio y menor la
apertura del usuario a feedback radical (asumen que "ya está decidido").

---

## Briefing del usuario antes del test (expectation setting)

Regardless del nivel, **siempre** setear expectativas con el participante:

### Para niveles 1-3 (sketches, wireframes, mockups estáticos)

> "Esto es una maqueta temprana — nada está clickeable. Quiero entender qué pensás
> sobre el concepto y la estructura. Si algo parece 'incompleto', es intencional —
> voy a tomar nota de lo que falta según tu criterio."

### Para nivel 4 (clickable prototype)

> "Esto es un prototipo — las cosas parecen reales pero algunas interacciones están
> limitadas. Si clickás algo que no responde, no es bug, es que todavía no está
> prototipado — anotamos eso como feedback."

### Para niveles 5-6 (coded)

> "Esto es un producto real (o casi real). Usalo como si fuera tu aplicación normal.
> Si encontrás algo que no funciona, es un bug real que queremos arreglar. Pensá en
> voz alta mientras lo usás."

---

## Anti-patrón: "Fidelity mismatch"

Error común: nivel de fidelidad del artefacto NO matchea la pregunta de investigación.

| Pregunta | Artefacto INCORRECTO | Artefacto CORRECTO |
|---|---|---|
| ¿Entienden la navegación? | Sketch (muy bajo) | Wireframe o clickable |
| ¿Les gusta el branding? | Wireframe (sin visual design) | Mockup alta fidelidad |
| ¿Pueden usarlo bajo estrés? | Clickable (mock data) | Coded build con data real |
| ¿Van a pagar? | Mockup estático | Producto live con Stripe real |

**Señal de fidelity mismatch**: los usuarios constantemente dan feedback sobre cosas
que no podés medir con el artefacto actual ("el color de este botón no me gusta" en
un wireframe gris). Re-evaluar si el artefacto es correcto para la pregunta.

---

## Preguntas consultivas (flow de la skill)

Cuando el usuario invoca esta skill, guía el diálogo con:

- **FG-1**: "¿Qué artefacto tenés listo para el próximo test?
  - [ ] Sketches / papel
  - [ ] Wireframes estáticos (low-fi)
  - [ ] Mockups alta fidelidad (no clickeables)
  - [ ] Prototipo clickeable (Figma/Invision)
  - [ ] Coded prototype con data mock
  - [ ] Producto live / staging con data real"

- **FG-2**: "¿Cuál es tu pregunta de investigación principal? (una oración)"

- **FG-3**: Evaluar fidelity vs. pregunta. Si hay mismatch, sugerir:
  - Subir fidelity (si pregunta requiere más detalle del que el artefacto provee)
  - Bajar fidelity (si la pregunta es más temprana de lo que el artefacto supone)
  - Ajustar la pregunta (si el artefacto es el correcto pero la pregunta no está bien formulada)

- **FG-4** (opcional): "¿Querés que documente esta decisión en
  `docs/ux-research/fidelity-decisions/`?"

---

## Integración con otras skills

- **`design-studio`**: después del ejercicio, decidir qué nivel de fidelidad usar para
  prototipar la solución convergida
- **`research-cadence`**: cada semana (lunes) consultar fidelity-guide si hay dudas
  sobre qué testear el jueves
- **`map-workshop`**: después de crear mapas, decidir a qué nivel prototipar los
  touchpoints identificados
- **`business-model-toolkit:customer-interview-system`**: el tipo de MVP seleccionado
  (Fase 8 de BMT) tiene un nivel de fidelidad asociado:
  - Concierge MVP → Nivel 1-2 (manual, poca fidelidad de software)
  - Wizard of Oz → Nivel 5 (interfaz real, backend manual)
  - Coded MVP → Nivel 5-6

## Recursos adicionales

- **Lean UX** (Jeff Gothelf, O'Reilly 2013), cap. 5 — "Design It Together", sección
  "The Fidelity Sweet Spot"
- **Paper Prototyping** (Carolyn Snyder, Morgan Kaufmann 2003) — bible del Nivel 1
- **Don't Make Me Think** (Steve Krug, New Riders 2000) — principles aplicables a
  cualquier fidelidad
