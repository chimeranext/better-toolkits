# Kirkpatrick Evaluation (Dense 1-pager)

Framework para evaluar cursos más allá de satisfacción superficial. 4 levels, cada uno
con su source de señal.

| Level | Pregunta | Source |
|---|---|---|
| **L1 Reaction** | ¿Le gustó? | Form Tally/Typeform por módulo |
| **L2 Learning** | ¿Aprendió? | xAPI quiz pass rates, score distributions |
| **L3 Behavior** | ¿Aplica 30d después? | Follow-up survey manual |
| **L4 Results** | ¿Produjo outcome real? | Capstone URLs, prod deploys, metrics reales |

## Regla clave

- **Solo L1** = satisfacción, no aprendizaje.
- **Solo L1+L2** = memoria/aprobación, no transferencia.
- **Cursos que pegan L4** iteran contra L3/L4 explícitamente.

## Señal mínima viable

- **Pre-release** (antes de v1.0.0): L1 + L2 de al menos 1 cohort piloto (3-10 alumnos).
- **Post-release recurring**: L1 + L2 por cohorte + L3 sampling 30d después + L4
  tracking manual de capstones.

## Usado por

- `new-course` (paso 6 arma feedback_form per module, L1 source).
- `course-retro` (mapea xAPI CSV + feedback CSV a L1-L4).
- `course-audit` (check que todos los módulos tienen feedback_form).

## Referencia fuente

Kirkpatrick, D. L. (1959/1994). *Evaluating Training Programs: The Four Levels*.
<https://www.kirkpatrickpartners.com/the-kirkpatrick-model/>.
