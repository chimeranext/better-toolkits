# Typeform Responses API Adapter (v2 stub)

> **STATUS: NOT IMPLEMENTED IN V1.** Documentado para forward compatibility.

## Source

`typeform-api`

## Endpoints

```
GET https://api.typeform.com/forms/{formId}/responses
  ?page_size=100
  &since=2026-04-01T00:00:00Z
  &until=2026-04-30T23:59:59Z
```

Auth: OAuth 2.0 Bearer token (Typeform Personal Access Token o full OAuth flow).

## Response

```json
{
  "items": [
    {
      "response_id": "abc123",
      "submitted_at": "2026-04-01T15:00:00Z",
      "hidden": { "module_id": "module:riverpod", "email": "learner1@test" },
      "answers": [
        {
          "field": { "id": "f1", "ref": "rating" },
          "type": "number",
          "number": 5
        },
        {
          "field": { "id": "f2", "ref": "takeaway" },
          "type": "text",
          "text": "Null safety"
        }
      ]
    }
  ],
  "page_count": 3,
  "total_items": 250
}
```

## Mapping a FeedbackRecord

```typescript
{
  learner_id: item.hidden?.email ?? item.response_id,
  module_id: item.hidden?.module_id,
  submitted_at: item.submitted_at,
  responses: Object.fromEntries(
    item.answers.map(a => [a.field.ref, a[a.type]])
  )
}
```

## Referencia

- Typeform API docs: <https://www.typeform.com/developers/responses/>
- Typeform OAuth flow: <https://www.typeform.com/developers/get-started/applications/>
