# SAM Methodology (Successive Approximation Model)

Metodología de instructional design de Allen Interactions. Antítesis de ADDIE —
iterativa en vez de secuencial.

## Las 3 fases

### 1. Preparation (Savvy Start)

- Kickoff corto (horas, no semanas).
- Prototipo inicial rough del curso.
- Objetivo: alinear stakeholders en la dirección, NO en el contenido final.

### 2. Iterative Design

- Ciclos cortos: Design → Proof → Review.
- Cada ciclo produce un artefacto mejorado.
- Feedback loop: stakeholders + target learners review cada iteration.
- Puerta de salida: diseño validado antes de construir todo el contenido.

### 3. Iterative Development

- Alpha → Beta → Gold.
- Alpha: rough content con pilot cohort (3-10 alumnos).
- Beta: refinado post-pilot + small release (30-50 alumnos).
- Gold: production-ready post-beta retros.

## Regla de oro

**Ningún curso debe llegar a su primera cohorte de 100+ sin haber pasado por al menos
una cohorte piloto de 3-10.**

Razón: sin data de alumnos reales, el curso es hipótesis. Escalar hipótesis sin pilot
produce cursos que fallan silenciosamente (alumnos completan pero no aplican).

## Contraste con ADDIE

| Paso ADDIE | Problema |
|---|---|
| Analysis | Toma meses, outputs se vuelven stale antes de dev |
| Design | Se diseña completo antes de validar con learners |
| Development | Se desarrolla todo antes de pilot |
| Implementation | Primera exposición a alumnos reales |
| Evaluation | Al final del proceso, costoso iterar |

SAM invierte: evaluación continua desde el prototipo inicial.

## Usado por

- Filosofía general del toolkit (iteración es first-class con `/course-revise`, `/course-retro`, `/course-diff`).
- `course-audit` (flag si no hay evidencia de pilot cohort antes de v1.0.0).
- `course-iteration-guide.md` (explica cómo estructurar los ciclos).

## Referencia fuente

Allen, M. (2012). *Leaving ADDIE for SAM: An Agile Model for Developing the Best
Learning Experiences*. ATD Press.
URL: <https://learn.alleninteractions.com/allen-interactions-rapid-instructional-design-and-development-with-sam>.
