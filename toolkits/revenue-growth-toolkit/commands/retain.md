---
description: "Crea Custom Audiences post-compra y lanza campañas Retention D7/D30/D90"
argument-hint: "[--day 7|30|90 | --refresh-audiences | --check-churn] [--offers stack] [--audiences buyers_d7,d30,d90]"
---

# /retain — Retention focused

Primera mitad del flywheel. Toma a quien compró y lo trae de vuelta antes de que se consolide como churned.

## Parsing

- `--day 7|30|90`: lanza la campaña de ese escalón. Si no se especifica, hace refresh + diagnóstico.
- `--refresh-audiences`: actualiza/crea las custom audiences core sin lanzar nada.
- `--check-churn`: corre `churn-detector.ts` y reporta tendencias.
- `--nps`: lee el NPS + segmentación (promoters/passives/detractors) + estado del feedback loop, y enruta cada segmento (detractors→triage, passives→campaña, promoters→`/refer`). Libro de definiciones: `references/nps-and-feedback-loop.md`.
- `--offers stack`: confirma uso de stack offers (default). `--offers discount` para descuento plano (no recomendado).
- `--audiences <list>`: override de las audiencias default (raro de usar).
- `--what-if`: simulación, sin Graph API.

## Workflow

### Modo `--refresh-audiences`

Handoff a `retention-automator`:
```
Verifica audiencias core (buyers_d7, d30, d90, high_ltv, churned_60d, churned_120d, cart_abandoners_24h, engaged_no_purchase).
Crea las que falten.
Verifica delivery_status, alerta de las que no estén ready.
Output: tabla con tamaño, estado, último refresh.
```

### Modo `--check-churn`

```
Corre node ${CLAUDE_PLUGIN_ROOT}/scripts/churn-detector.ts --window 30,60,90.
Compara cohortes mes-a-mes.
Si churn al D60 creció >15% MoM, flag al usuario con propuesta:
  "Churn al D60 acelera (X% MoM). Recomiendo activar workflows/churn-rescue.yaml."
Guarda snapshot en .aaarrr/metrics/churn-{date}.json.
```

### Modo `--nps`

Handoff a `retention-automator`:
```
Lee references/nps-and-feedback-loop.md.
Pull respuestas NPS (score 0-10 + comentario) del window disponible.
Calcula NPS = %Promoters(9-10) − %Detractors(0-6). Passives(7-8) no puntúan.
Segmenta y reporta:
  - NPS blended + tendencia MoM + NPS por cohorte/segmento (obligatorio; el blended esconde detractors)
  - Conteo promoters / passives / detractors
Enruta el feedback loop (captura→triage→cierre):
  - Detractors → triage SLA 48h + top temas por frecuencia (kill-signal de LTV si recurrente)
  - Passives → audiencia de retención + quick win del gap más citado
  - Promoters → seed a /refer (buyers_high_ltv) + pedir referral/review en el peak
Cruza con churn: si el NPS de una cohorte cae, vigilar su churn a 30-60 días (/retain --check-churn).
Output: tabla de segmentos + NPS + verdict + próximos pasos por segmento.
Guarda snapshot en .aaarrr/metrics/nps-{date}.json.
```

### Modo `--day 7|30|90`

```
Lanza campaña Retention D{N}.
Pre-checks:
  - audiencia tiene ≥1,000 personas (sino, detente y reporta)
  - Acquisition está estable (CPA dentro de target por 7+ días)
Genera spec con stack offer apropiado (D7=cross-sell, D30=reorder, D90=win-back).
Pide OK humano.
Deploy PAUSED. Devuelve comando de activación.
```

### Modo default (sin flags específicos)

1. `--refresh-audiences` primero
2. `--check-churn` segundo
3. `--nps` tercero (leading indicator; si el NPS cae, el churn viene detrás)
4. Reporta qué escalones (D7/D30/D90) tienen audiencia suficiente para lanzar
5. Sugiere al usuario el siguiente comando: `/retain --day 7` o el que aplique

## Output Format

Para `--refresh-audiences`:

```markdown
## Custom Audiences Health

| Name | Subtype | Size | Status | Last Refresh | Action |
|---|---|---|---|---|---|
| buyers_d7 | WEBSITE | 412 | ready | 2h ago | OK |
| buyers_d30 | WEBSITE | 1,847 | ready | 4h ago | OK |
| buyers_d90 | WEBSITE | 5,213 | ready | 1d ago | OK |
| buyers_high_ltv | CUSTOM | 287 | ⚠️ < 500 | manual | Esperar 2 semanas |
| churned_60d | WEBSITE | 1,124 | ready | 3h ago | OK |
| churned_120d | WEBSITE | 2,891 | ready | 1d ago | OK |
| cart_abandoners_24h | WEBSITE | 38 | ⚠️ small | 10m ago | OK (alta rotación) |
| engaged_no_purchase | WEBSITE | 14,202 | ready | 6h ago | OK |
```

## Reglas Inviolables

1. Nunca lanzas Retention si Acquisition está roja (CPA > target * 1.3 por 7+ días)
2. Nunca lanzas D7 con audiencia <1,000 — Meta no entrega eficiente
3. Nunca usas la misma creative en D7 y D30 (debe haber progression)
4. Si el escalón D90 tiene CPA peor que `acquisition-buyer` original, detente y haz handoff a `revenue-analyst` — el problema es LTV, no media
