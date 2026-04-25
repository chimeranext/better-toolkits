# Tally.so CSV Adapter (v1)

Adapter v1 para CSVs exportados desde Tally.so.

## Source

`tally-csv`

## Formato CSV de Tally

Tally exporta CSV con esta estructura:

```csv
Submitted At,Respondent ID,Email,Rating,Top takeaway,Confusion
2026-04-01T15:00:00Z,R1,learner1@test,5,Null safety es genial,Nada
2026-04-01T16:00:00Z,R2,learner2@test,3,Muy rápido,async/await
```

Columnas fijas (siempre presentes):
- `Submitted At` — timestamp ISO-8601.
- `Respondent ID` — UUID asignado por Tally.

Columnas custom: dependen del form. Cada question label se vuelve una columna.

## Mapping a FeedbackRecord

```typescript
{
  learner_id: row['Email'] ?? row['Respondent ID'],  // prefer email if collected
  module_id: hidden_field_or_inferred_from_filename,
  submitted_at: row['Submitted At'],
  responses: {
    // todas las columnas custom como key-value
    'Rating': parseInt(row['Rating']),
    'Top takeaway': row['Top takeaway'],
    'Confusion': row['Confusion']
  }
}
```

## Cómo obtener el `module_id`

Tally permite "hidden fields" pre-populados via URL params. Recomendación:

1. Al embeber el form en el AU, pasar `?module_id=module:riverpod`.
2. Tally captura el hidden field y lo agrega al CSV como columna.
3. Adapter usa esa columna directamente.

Si no hay hidden field: inferir del nombre del archivo (ej. `tally-module-3.csv` →
`module:3`). Si tampoco: pedir al usuario que provea el `module_id`.

## Referencia

- Tally hidden fields docs: <https://help.tally.so/hidden-fields>
- Tally CSV export: en el form → Submissions → Export → CSV
