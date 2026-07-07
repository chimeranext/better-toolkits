# xAPI CSV Adapter (v1)

Adapter v1 genérico basado en CSV. El usuario exporta CSV desde su LRS (cualquiera) y
lo transforma al formato canónico abajo antes de pasarlo a `/course-retro`.

## Source

`xapi-csv`

## Formato CSV esperado

Primera fila = headers exactos. Encoding UTF-8.

```csv
learner_id,au_id,verb,timestamp,score,success,completion,duration
juan@chimeranext.io,au:riverpod-001,passed,2026-04-01T10:00:00Z,0.85,true,true,PT45M
maria@example.com,au:riverpod-001,failed,2026-04-01T11:00:00Z,0.65,false,false,PT30M
juan@chimeranext.io,au:widgets-layout-001,completed,2026-04-03T14:00:00Z,,,true,PT3H
```

## Reglas de parsing

| Columna | Tipo | Requerido | Notas |
|---|---|---|---|
| `learner_id` | string | sí | email o UUID |
| `au_id` | string | sí | debe matchear un `au_id` en `course.json` |
| `verb` | enum | sí | lowercase: `launched`, `initialized`, `completed`, `passed`, `failed`, `terminated`, `satisfied`, `waived`, `abandoned` |
| `timestamp` | ISO-8601 | sí | UTC con `Z` o offset |
| `score` | float | no | 0.0-1.0 (relevante para passed/failed) |
| `success` | boolean | no | `true`/`false` |
| `completion` | boolean | no | `true`/`false` |
| `duration` | ISO-8601 duration | no | ej. `PT45M`, `PT2H30M` |

## Transformaciones desde otros LRS

### Ralph LRS export

```sql
SELECT
  actor->>'mbox' as learner_id,
  object->>'id' as au_id,
  verb->>'id' as verb_iri,
  timestamp,
  result->>'score'->'scaled' as score,
  result->>'success' as success,
  result->>'completion' as completion,
  result->>'duration' as duration
FROM statements
WHERE object->>'id' LIKE 'au:%';
```

Post-process: extraer el verb name de `verb_iri` (`http://adlnet.gov/expapi/verbs/passed` → `passed`).

### SCORM Cloud export

Reports → Course → Download CSV → renombrar columnas según mapping:
- `Learner ID` → `learner_id`
- `Activity ID` → `au_id`
- `Verb` → `verb` (lowercase)
- `Timestamp` → `timestamp`
- `Score Scaled` → `score`
- `Success` → `success`
- `Completion Status` → `completion`
- `Total Time` → `duration`

### Learning Locker export

Reports → Custom Query → Export CSV. Mismo mapping que Ralph.

### Moodle xAPI subsystem

```sql
SELECT
  CONCAT('mailto:', u.email) as learner_id,
  s.activityid as au_id,
  s.verb as verb,
  s.timestamp,
  -- Moodle no expone result en CSV directo; necesita query custom a mdl_xapi_states
  ...
FROM mdl_xapi_states s
JOIN mdl_user u ON s.userid = u.id;
```

## Output al skill

El skill `course-retro` lee el CSV, lo parsea según las reglas arriba, y lo pasa a
`XapiRecord[]` para mapping a Kirkpatrick L1-L4.

## Validación previa

Antes de ingerir, el skill puede correr una pasada de validación:
- Headers exactos.
- Verbs solo del enum permitido.
- Timestamps parseables.
- Sin filas vacías.

Si falla validación: report al usuario qué fila/columna está mal.
