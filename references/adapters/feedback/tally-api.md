# Tally.so API Adapter (v2 stub)

> **STATUS: NOT IMPLEMENTED IN V1.** Documentado para forward compatibility.

## Source

`tally-api`

## Endpoints

```
GET https://api.tally.so/forms/{formId}/submissions
  ?page=1
  &limit=100
  &filter={"createdAt":{"$gte":"2026-04-01T00:00:00Z"}}
```

Auth: API Key en header `Authorization: Bearer {api_key}`.

## Response

```json
{
  "items": [
    {
      "id": "submission_id",
      "createdAt": "2026-04-01T15:00:00Z",
      "respondentId": "R1",
      "responses": [
        { "label": "Rating", "value": 5 },
        { "label": "Top takeaway", "value": "Null safety es genial" }
      ]
    }
  ],
  "page": 1,
  "totalPages": 3
}
```

## Mapping a FeedbackRecord

```typescript
{
  learner_id: hidden_field_email ?? respondentId,
  module_id: hidden_field_module_id,
  submitted_at: createdAt,
  responses: Object.fromEntries(item.responses.map(r => [r.label, r.value]))
}
```

## Pagination

Loop while `page < totalPages`.

## Referencia

- Tally API docs: <https://tally.so/help/developer-resources>
- Tally webhooks (alternativa pull-based): <https://help.tally.so/webhooks>
