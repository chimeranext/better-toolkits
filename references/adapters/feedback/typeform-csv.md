# Typeform CSV Adapter (v1)

Adapter v1 para CSVs exportados desde Typeform.

## Source

`typeform-csv`

## Formato CSV de Typeform

```csv
#,Submit Date,Network ID,What is your email?,How useful was this module? (1-5),What did you take away?
1,2026-04-01 15:00:00,R1,learner1@test,5,Null safety
2,2026-04-01 16:00:00,R2,learner2@test,3,Demasiado rápido
```

Columnas fijas:
- `#` — número de submission.
- `Submit Date` — timestamp local del workspace (atención: NO siempre es UTC).
- `Network ID` — IP-based fingerprint.

Columnas custom: question labels exactos.

## Mapping a FeedbackRecord

```typescript
{
  learner_id: row['What is your email?'] ?? row['Network ID'],
  module_id: hidden_field_or_inferred,
  submitted_at: parseAndConvertToUTC(row['Submit Date']),  // Typeform usa local TZ del workspace
  responses: {
    // todas las question columns como key-value
  }
}
```

## Particularidades vs Tally

- **Timezone**: Typeform usa la TZ del workspace owner (NO UTC). Convertir explícitamente.
- **Hidden fields**: Typeform los soporta pero los muestra en la columna como cualquier otro field.
- **Logic jumps**: si el form tiene branching, algunas columnas pueden estar vacías
  para algunos respondents — manejar como `null`.

## Referencia

- Typeform hidden fields: <https://www.typeform.com/help/a/hidden-fields-360029259452/>
- Typeform CSV export: en el form → Results → Download → CSV
