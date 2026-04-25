# Ralph LRS Adapter (v2 stub)

> **STATUS: NOT IMPLEMENTED IN V1.** Documentado para forward compatibility.
> Implementación cuando se complete el spike [legacy-ticket](https://linear.app/chimera-coding/issue/legacy-ticket).

## Source

`ralph-api`

## Endpoints

```
GET {ralph_base_url}/xAPI/statements
  ?activity={course-or-au-id}
  &since={ISO-8601-timestamp}
  &until={ISO-8601-timestamp}
  &limit=100
```

Auth: HTTP Basic con Ralph admin user/password (configurable en `linear-setup.json`
o env vars).

## Response (xAPI standard StatementResult)

```json
{
  "statements": [
    {
      "actor": { "mbox": "mailto:juan@chimeranext.io" },
      "verb": { "id": "http://adlnet.gov/expapi/verbs/passed" },
      "object": { "id": "au:riverpod-001" },
      "timestamp": "2026-04-01T10:00:00Z",
      "result": { "score": { "scaled": 0.85 }, "success": true, "completion": true, "duration": "PT45M" }
    },
    ...
  ],
  "more": "/xAPI/statements?cursor=abc123"
}
```

## Mapping a XapiRecord

```typescript
{
  learner_id: actor.mbox.replace('mailto:', ''),
  au_id: object.id,
  verb: verb.id.split('/').pop(),  // extract last segment
  timestamp: timestamp,
  result: result ? {
    score: result.score?.scaled,
    success: result.success,
    completion: result.completion,
    duration: result.duration
  } : undefined
}
```

## Pagination

Loop while `more` field is present:

```pseudo
let next = `/xAPI/statements?activity=${course_id}`;
while (next) {
  const response = await fetch(`${base_url}${next}`, { auth });
  records.push(...response.statements.map(toXapiRecord));
  next = response.more;
}
```

## Config esperado en `course-retro` skill (v2)

```json
{
  "adapter": "ralph-api",
  "config": {
    "base_url": "https://ralph.chimerapathways.dev",
    "auth": { "username": "${RALPH_USER}", "password": "${RALPH_PASS}" },
    "filters": {
      "activity": "course:flutter-fullstack-2026",
      "since": "2026-04-01T00:00:00Z"
    }
  }
}
```

Credentials van en env vars o secrets, NUNCA hard-coded.

## Referencia

- Ralph LRS: <https://ralph.io>
- xAPI spec: <https://github.com/adlnet/xAPI-Spec>
- Spike interno: [legacy-ticket](https://linear.app/chimera-coding/issue/legacy-ticket) — Custom LRS xAPI nativo en Supabase + Importador SCORM
