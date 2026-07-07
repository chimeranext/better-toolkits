# Kirkpatrick Feedback Tools Reference

Cómo recolectar señal L1-L4 usando Tally.so, Typeform y follow-up manual. Usado por
`new-course` (paso 6) y `course-retro`.

---

## 1. Kirkpatrick 4-level model

| Level | Qué mide | Source en este toolkit |
|---|---|---|
| **L1 Reaction** | ¿Le gustó al alumno? | Form Tally/Typeform embebido al final de cada módulo |
| **L2 Learning** | ¿Realmente aprendió? | xAPI quiz statements (score distribution, pass rate) |
| **L3 Behavior** | ¿Aplica 30 días después? | Follow-up survey (Tally/Typeform) 30d post-curso |
| **L4 Results** | ¿Produjo outcome real? | Capstone tracking (URLs shippeadas, prod deploys) |

**Regla**: un curso que solo mide L1 está midiendo satisfacción. Un curso que solo
mide L1+L2 está midiendo memoria. Cursos que pegan L4 iteran contra L3/L4 explícitamente.

---

## 2. Tally.so setup per module

1. Crear cuenta en <https://tally.so> (free tier permite ilimitadas submissions).
2. Crear form nuevo por módulo. Campos recomendados:
   - **Rating** (1-5 stars) — "¿Qué tan útil fue este módulo?"
   - **Short text** — "¿Qué te llevás?"
   - **Short text** — "¿Qué te confundió?"
   - **Hidden field** `module_id` — pre-populated con el ID del módulo en el JSON.
   - **Hidden field** `learner_email` — pre-populated del LMS via URL params.
3. Publish → obtener `embed_url` (estilo iframe).
4. En `course.json` del módulo:

```json
"feedback_form": {
  "tool": "tally",
  "form_id": "wK2rLp",
  "embed_url": "https://tally.so/embed/wK2rLp?hideTitle=1",
  "questions_l1": [
    "¿Qué tan útil fue este módulo? (1-5)",
    "¿Qué te llevás?",
    "¿Qué te confundió?"
  ]
}
```

5. El HTML del AU (v2 cmi5 wrapper) renderiza el iframe al final del módulo:

```html
<iframe src="https://tally.so/embed/wK2rLp?hideTitle=1&module_id=module:riverpod&learner_email={{learner.email}}" width="100%" height="500"></iframe>
```

6. Para `/course-retro`: export CSV desde Tally → feed al adapter `feedback/tally-csv`.

---

## 3. Typeform setup per module

Idéntico patrón pero con Typeform:

1. Crear cuenta en <https://www.typeform.com>.
2. Crear form con los mismos campos (Rating, Short Text, Hidden fields).
3. Publish → obtener embed URL.
4. Config en `course.json`:

```json
"feedback_form": {
  "tool": "typeform",
  "form_id": "abc123XY",
  "embed_url": "https://form.typeform.com/to/abc123XY",
  "questions_l1": [...]
}
```

5. CSV export → adapter `feedback/typeform-csv`.

**Trade-off Tally vs Typeform**: Tally es más generoso con free tier (ilimitado);
Typeform tiene mejor UX pero cap de 10 responses/mes en free.

---

## 4. Referencia: Articulate Rise 360 pattern

Rise 360 embebe forms al final de lessons. El toolkit replica ese patrón.

Ver <https://community.articulate.com/kb/user-guide-series/rise-360-user-guide/1193842>
para ejemplos visuales. Diferencia clave: Rise usa forms internos (vendor lock-in en
respuestas); el toolkit usa Tally/Typeform (data ownership del creator).

---

## 5. L3 follow-up manual (v1)

v1 del toolkit NO automatiza L3. Proceso sugerido:

1. 30 días después del capstone, enviar email a cada alumno:
   > "Hola [nombre], pasaron 30 días desde que terminaste [curso]. ¿Podés contestar
   > 5 preguntas rápidas sobre cómo estás aplicando lo aprendido? [Tally URL]"

2. Form L3 Tally/Typeform:
   - "¿Seguís usando [concepto core del curso] en tu trabajo?" (Yes/No/Partially)
   - "Si sí, ¿en qué proyecto?"
   - "¿Qué te frenó de aplicarlo (si aplica)?"
   - "¿Recomendarías el curso a alguien con tu perfil de entrada?" (NPS 0-10)

3. Export CSV → `/course-retro` lo ingesta con `adapters/feedback/tally-csv`.

**v2**: adapter API-based que query Tally/Typeform API automáticamente según
schedule configurado.

---

## 6. L4 capstone tracking

L4 es el outcome real del curso. Para cursos de ship:
- URLs shippeadas (capstone deliverable: Play Store URL, GitHub repo, etc.).
- Deployment evidence (production URL responde 200, app publicada y accesible).
- 30 days later: ¿sigue el capstone vivo? (uptime, commits recientes, usuarios reales).

Para cursos no-ship (conceptual):
- Behavioral change medible (ej. curso de code review → lead time de reviews bajó).
- Outputs tangibles (docs publicados, decisiones reportadas).

El toolkit v1 deja L4 como tracking manual. El creator mantiene una planilla o mini-CRM
con los capstones de cada cohorte.

---

## 7. Referencia v2: Articulate Reach 360 API

Articulate Reach 360 tiene API para exportar respuestas programáticamente. Referencia:
<https://www.articulatesupport.com/es/article/Reach-360-API>.

v2 adapter `feedback/reach-360-api` usa esta API para data liberation de cursos ya
hospedados en Reach (referencia interna:
[CIV-403](https://linear.app/chimera-coding/issue/CIV-403)).
