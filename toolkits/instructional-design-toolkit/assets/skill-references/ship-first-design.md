# Ship-First Design

Backward design adaptado para builders. Definir el ship primero, después assessments,
después contenido. Adaptación de chimera-academy.

## Design order

### Stage 1 — What They Ship

- Definir capstone first:
  - `title`
  - `deliverable` (artefacto concreto: URL, repo, documento)
  - 3-5 `assessment_criteria` con IDs inmutables
- Definir per-module ship milestones (escalando desde early a capstone).

### Stage 2 — How We Know They Built It

- Challenge criteria por módulo (¿qué evidencia prueba aprendizaje?).
- Quiz scope por módulo.
- Map de cada ship milestone a evidencia medible.

### Stage 3 — What Gets Them There

- Ahora sí diseñar módulos + contenido que preparan para los assessments.
- Cada lesson responde: ¿qué assessment capability habilita?

## Ship Milestone Progression

| Fase | Milestone típico |
|---|---|
| Early modules (0-25% del curso) | Commit local, escribir docs, run tests locales |
| Mid modules (25-60%) | Deploy to staging, scaffold projects, share con 1 persona |
| Late modules (60-90%) | Deploy to production, post publicly, first users |
| Capstone | Ship something real that others can use |

## Hiring test

Para cada capstone: *"¿Contratarías a alguien que produjo esto?"*

Respuestas aceptables:
- "Sí, absolutamente — es mid-level quality" → capstone fuerte
- "Sí con condiciones" + las condiciones (ej. "si además explica sus decisiones") → OK
- "Borderline" → capstone blando, revisar criterios
- "No" → capstone insuficiente, rediseñar

## Usado por

- `new-course` (paso 2 arma capstone first).
- `course-audit` (check hiring test no genérico).
- `course-audit` (check ship milestones escalating).

## Referencia fuente

Adaptación de chimera-academy `skills/ship-first-design/`. Inspirado en *Backward Design*
(Wiggins & McTighe, *Understanding by Design*, 1998) pero reorientado hacia builders
— donde el "deliverable shipped" es el único outcome que cuenta, no la comprensión
académica.
