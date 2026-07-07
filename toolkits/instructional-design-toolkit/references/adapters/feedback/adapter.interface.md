# Feedback Adapter Interface

Contract común para adapters de feedback (Kirkpatrick L1 + L3 sources).

## TypeScript-style shape

```typescript
interface FeedbackAdapter {
  source: string;           // "tally-csv", "typeform-csv", "tally-api", "typeform-api", "reach-360-api"
  ingest(input: string): Promise<FeedbackRecord[]>;
}

interface FeedbackRecord {
  learner_id: string;       // email del respondent
  module_id: string;        // o lesson_id si granularidad fina
  submitted_at: string;     // ISO-8601 UTC
  responses: Record<string, string | number>;  // free-form key-value de las respuestas
}
```

## Adapters disponibles

| Adapter | Estado | Source |
|---|---|---|
| `tally-csv.md` | v1 ✅ | Tally.so CSV export |
| `typeform-csv.md` | v1 ✅ | Typeform CSV export |
| `tally-api.md` | v2 stub | Tally.so API |
| `typeform-api.md` | v2 stub | Typeform Responses API |
| `reach-360-api.md` | v2 stub | Articulate Reach 360 API |

## Mapping al modelo Kirkpatrick

`responses` es free-form porque cada form tiene preguntas distintas. El skill
`course-retro` interpreta los keys según convenciones:

- Keys con palabras `rating`, `útil`, `score` → L1 numeric (1-5).
- Keys con palabras `llevás`, `aprendiste`, `qué aprendí` → L1 free text.
- Keys con palabras `aplico`, `usé`, `días después` → L3 behavior.

Para cursos que quieran mejor parsing: documentar las question labels en
`course.json` → `module.feedback_form.questions_l1`.
