# Articulate Reach 360 API Adapter (v2 stub)

> **STATUS: NOT IMPLEMENTED IN V1.** Documentado para forward compatibility.
> Diseñado para data liberation de cursos hospedados en Reach 360 (referencia
> [CIV-403](https://linear.app/chimera-coding/issue/CIV-403)).

## Source

`reach-360-api`

## Endpoints

```
GET https://api.reach360.com/v1/courses/{courseId}/learners
GET https://api.reach360.com/v1/learners/{learnerId}/responses
GET https://api.reach360.com/v1/courses/{courseId}/responses
  ?since=2026-04-01T00:00:00Z
```

Auth: API Key en header `X-API-Key: {api_key}` (Reach 360 admin genera key en Settings).

## Mapping a FeedbackRecord

Reach 360 expone respuestas tipo SCORM/xAPI mixto. El mapping depende del shape
exacto de la response (a documentar cuando se implemente).

```typescript
{
  learner_id: response.learner.email,
  module_id: response.scoIdentifier,  // SCORM-style
  submitted_at: response.completedAt,
  responses: response.interactions.reduce((acc, int) => ({
    ...acc,
    [int.id]: int.studentResponse
  }), {})
}
```

## Caso de uso (CIV-403)

Freedom Academy / Emprove tienen cursos en Reach 360 (vendor lock-in para data).
Este adapter permite extraer las respuestas para:

1. Migrar cursos a un LRS propio (Ralph + mod_cmi5 en Moodle).
2. Análisis Kirkpatrick L1-L3 con datos históricos.
3. Backup independiente del vendor.

## Referencia

- Reach 360 API docs: <https://www.articulatesupport.com/es/article/Reach-360-API>
- Reach 360 user guide: <https://community.articulate.com/kb/user-guide-series/reach-360-user-guide/1193805>
- Issue interno: [CIV-403](https://linear.app/chimera-coding/issue/CIV-403) — Articulate Rise response data liberation
