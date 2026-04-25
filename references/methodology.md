# Instructional Design Methodology Reference

Fuente autoritativa para los skills del toolkit. Condensa SAM, Builder's Bloom's,
Ship-First Design, Kirkpatrick, y la fórmula CONTEXT→CONCEPT→BUILD→SHIP→REFLECT.

---

## 1. Frameworks overview

| Framework | Rol en el toolkit |
|---|---|
| **SAM** (Allen Interactions) | Antítesis de ADDIE. Iteración rápida con prototipos en vez de diseño completo pre-desarrollo. *Ningún curso llega a 100+ sin cohort piloto de 3-10*. |
| **Builder's Bloom's** | Taxonomía cognitiva adaptada de chimera-academy: Recognize → Explain → Build → Debug → Decide → Ship. Cada módulo declara su nivel. |
| **Ship-First Design** | Backward design adaptado para builders. Definir capstone primero, después assessments, después contenido. |
| **Kirkpatrick L1-L4** | L1 Reaction (¿gustó?), L2 Learning (¿aprendieron?), L3 Behavior (¿aplican 30d después?), L4 Results (¿outcome real?). |
| **Atomic Habits** (Clear) | Cada lección = ciclo cue→craving→response→reward. Cursos sin reward pierden 60-80% entre lesson 2 y 3. *Skill deferido a v2.* |
| **Irby 2018** | Distinción coach/mentor/tutor para session plans 1-on-1. Usada por `session-type-detector` agent. |

---

## 2. Fórmula CONTEXT → CONCEPT → BUILD → SHIP → REFLECT

Estructura por lección (y por slide deck Marp):

| Sección | % del contenido | Propósito |
|---|---|---|
| **CONTEXT** | 5-10% | Hook vivo (100-200 palabras). Escena que hace al alumno FEEL la urgencia. NUNCA "En la lección anterior…". |
| **CONCEPT** | 15-25% | Mental model (300-500 palabras). Tablas, frameworks, worked examples. **La lección enseña directamente acá** — NO delega a Claude. |
| **BUILD** | 50-60% | Aplicación con Claude como partner (NO como profesor). Experimentos etiquetados con inline bold, sin sub-headers rígidos. |
| **SHIP** | 10-15% | Deliverable concreto (50-100 palabras). URL, commit, artefacto tangible. |
| **REFLECT** | 5-10% | 1-2 preguntas provocativas específicas a ESTA lección. NO genéricas ("¿Qué aprendiste?"). |

### Load-Bearing Rule

La lección TEACH el concepto directamente en CONCEPT. BUILD tiene al alumno USAR Claude
para aplicar ese concepto. **Nunca escribir "Preguntale a Claude que te explique X"** como
mecanismo de enseñanza — eso es el anti-pattern Prompt Outsourcer.

---

## 3. Cognitive ramping

Un curso bien diseñado climb Bloom's levels a lo largo de los módulos:

| Fase del curso | Nivel objetivo |
|---|---|
| Primeros 1-2 módulos | Recognize, Explain |
| Módulos core | Build |
| Módulos de profundización | Debug & Evaluate |
| Módulos finales | Decide |
| Capstone | Ship |

**Flag rojo**: saltar de Recognize a Build sin Explain entre medio. Flag amarillo: 3+
módulos seguidos en el mismo nivel.

---

## 4. Common pitfalls

1. **The Lecturer** — todo CONCEPT, nada de BUILD. Alumno lee pero no practica.
2. **The Hello-Worlder** — BUILD trivial (`console.log("hello")`) que no aplica el concepto.
3. **The Syntax Teacher** — CONCEPT enseña sintaxis en vez de mental models. Primera
   entrada en docs > explicación larga.
4. **The Prompt Outsourcer** — BUILD dice "Ask Claude to explain X" en vez de TEACH X en
   CONCEPT. Viola Load-Bearing Rule.
5. **Stakeholder-as-persona** — el curso refleja lo que el team imagina, no lo que un
   alumno real necesita. Mitigación: proto-persona Lean UX 4-quadrant.
6. **Capstone blando** — "escribir un documento de principios" falla el hiring test.
   Capstone debe ser artefacto real que otros puedan usar (URL, app deployed, repo).
7. **Empty opportunities/ship milestones** — "mejorar UX" es platitud. Ship milestone
   debe ser concreto: "deploy a Firebase Hosting con URL pública".
8. **Módulos sin reward** — el módulo no concluye en un artefacto compartible. Alumno no
   siente progreso, abandona. Atomic Habits: skip reward = skip retention.
