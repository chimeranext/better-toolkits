# Coach vs Mentor vs Tutor Distinction (Irby 2018)

Distinción estructural entre coaching, mentoring y tutoring. Usado por
`session-type-detector` agent para elegir el profile correcto de session plan.

## Tabla comparativa

| Aspecto | Mentoring | Coaching | Tutoring |
|---|---|---|---|
| **Foco** | Desarrollo integral del individuo | Performance específica, evento-focused | Problema/contenido específico |
| **Duración** | Larga (posiblemente vitalicia) | Time-bound, hasta cumplir goal | Corto plazo, tarea-específica |
| **Selección** | Por el mentee | Por individuo u organización | Asignado u opcional |
| **Resultado** | Crecimiento y red profesional | Goal alcanzado → coach se retira | Mejora medible en tema X |
| **Pre-work típico** | Reflexión sobre carrera/identidad | Definir KPI o resultado esperado | Tarea/diagnóstico/test previo |
| **Cierre típico** | ¿Qué te llevás de la relación? | ¿Lograste el goal? + handoff | ¿Resolviste el problema X? |

## Quote clave (Irby, 2018, p. 297)

> *"mentors can coach, but coaches hardly ever mentor, and mentors and coaches can
> tutor, but tutors rarely mentor or coach."*

Traducción: las funciones se contienen asimétricamente. Un mentor puede asumir el
rol de coach en una sesión específica, pero un tutor rara vez tiene la relación o
scope para mentorear.

## Signals para auto-detección (`session-type-detector`)

### Tutoring signals
- Existe curso activo con el learner.
- Topic es técnicamente específico (ej. "Riverpod providers").
- Frases: "quiero entender X", "me trabo en Y".

### Coaching signals
- Existe performance plan activo.
- Frase explícita de KPI (ej. "bajar el lead time").
- Formato "sesión N de M" (time-bound engagement).

### Mentoring signals
- Relationship history marker (ej. "nos conocemos desde…").
- Frases sobre carrera / identidad / red / long-term.
- Sin goal time-bound medible.

## Usado por

- `session-type-detector` (auto-detection + justificación + confidence).
- `1-on-1-session-planner` skill (paso 2).
- `session-plan-audit` (check type consistency).
- Profiles de session-plan (`coaching_specific`, `mentoring_specific`,
  `tutoring_specific` fields).

## Referencia fuente

Irby, B. J. (2018). *Editor's Overview: Differences and Similarities with Mentoring,
Tutoring, and Coaching*. **Mentoring & Tutoring: Partnership in Learning**, 26(2),
115-121. DOI: <https://doi.org/10.1080/13611267.2018.1489237>.

Quote histórico referenciado por Irby (2018) de su propio editorial de 2012:
Irby, B. J. (2012). Editor's overview: Mentoring, tutoring, and coaching.
*Mentoring & Tutoring: Partnership in Learning*, 20(3), 297–301.
