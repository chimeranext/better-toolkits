# xAPI Adapter Interface

Contract común que cumplen todos los adapters xAPI (v1 CSV-based, v2 API-based).
Permite swapear adapters sin cambiar el código del skill `course-retro`.

## TypeScript-style shape

```typescript
interface XapiAdapter {
  source: string;           // identificador del adapter ("xapi-csv", "ralph-api", "scorm-cloud-api", "learning-locker-api")
  ingest(input: string): Promise<XapiRecord[]>;
  // input para CSV adapters: path al archivo
  // input para API adapters: config JSON con { base_url, auth, filters }
}

interface XapiRecord {
  learner_id: string;       // email o user UUID
  au_id: string;            // identificador del AU (debe coincidir con course.json)
  verb: string;             // launched | initialized | completed | passed | failed | terminated | satisfied | waived | abandoned
  timestamp: string;        // ISO-8601 UTC
  result?: {
    score?: number;         // 0.0-1.0
    success?: boolean;
    completion?: boolean;
    duration?: string;      // ISO-8601 duration (PT45M)
  };
}
```

## Implementación en v1

Para v1, "ingest" se invoca vía prompt al skill `course-retro` — el skill lee este
adapter doc, entiende las reglas de parsing, y aplica al input del usuario manualmente
(no hay código ejecutable).

## Implementación en v2

v2 introduce JS/TS scripts ejecutables (`adapters/xapi/ralph.ts`, etc.) que cumplen
literalmente este interface y son invocados desde el skill via Bash.

## Adapters disponibles

| Adapter | Estado | Source format |
|---|---|---|
| `csv.md` | v1 ✅ | CSV genérico |
| `ralph.md` | v2 stub | Ralph LRS HTTP API |
| `scorm-cloud.md` | v2 stub | SCORM Cloud Statement API |
| `learning-locker.md` | v2 stub | Learning Locker Statement API |
