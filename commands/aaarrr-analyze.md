---
description: "Tabla AAARRR completa con métricas por stage y por platform. Funnel + Flywheel en una sola vista."
argument-hint: "[--last 7d|14d|30d|90d] [--platform fb|ig|both] [--breakdown placement]"
---

# /aaarrr-analyze — Tabla AAARRR end-to-end

Eres el dashboard maker. Tu output es una tabla AAARRR limpia con verdict y next-step. Sin adjetivos sueltos, sin métricas sin status. El usuario debería poder mirar 30 segundos y decidir qué hacer.

## Parsing

- `--last 7d|14d|30d|90d`: ventana. Default `30d`.
- `--platform fb|ig|both`: filtro. Default `both`.
- `--breakdown placement`: agrega filas adicionales por placement (Stories/Reels/Feed/Right Column). Default off.
- `--auto-flag`: si activo, además de la tabla, lista violaciones de `auto_pause_rules` con propuestas de pausa.

## Workflow

### Fase 1: Validación
1. `.aaarrr/config.json` debe existir. Si no, dirige al usuario a `/aaarrr-launch`.
2. `META_ACCESS_TOKEN` debe estar en env. Si no, **detente**.

### Fase 2: Pull de datos

Para cada AdSet en el ad account, ejecuta vía Graph API:

```bash
curl -G "https://graph.facebook.com/v21.0/act_{id}/insights" \
  -d "level=adset" \
  -d "fields=adset_name,spend,impressions,clicks,actions,action_values,cpm,cpp,ctr,frequency,reach" \
  -d "date_preset={window}" \
  -d "breakdowns=publisher_platform" \
  -d "access_token=$META_ACCESS_TOKEN"
```

Si el usuario pidió `--breakdown placement`, agrega `platform_position` a breakdowns.

Para Retention/Referral metrics que no vienen de Meta, lees:
- `.aaarrr/metrics/cohorts-{date}.json` (output de `ltv-cac-calculator.ts`)
- `.aaarrr/metrics/referral-{date}.json` (output de `referral-tracker.ts`)
- `.aaarrr/metrics/churn-{date}.json` (output de `churn-detector.ts`)

Si alguno está stale (>3 días), corre el script de update primero:
```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/ltv-cac-calculator.ts --window {window} --breakdown platform
```

### Fase 3: Tabla AAARRR

Output principal:

```markdown
# AAARRR Report — {producto} — last_{window}

## Funnel (Acquisition lineal)
| Stage | Metric | FB | IG | Blended | Target | Status |
|---|---|---|---|---|---|---|
| Awareness | CPM | $X | $X | $X | <$15 | 🟢/🟡/🔴 |
| Awareness | Reach | X | X | X | — | — |
| Acquisition | Click → Lead CVR | X% | X% | X% | >2% | — |
| Acquisition | CPL | $X | $X | $X | — | — |
| Acquisition | **CPA** | **$X** | **$X** | **$X** | **<$25** | — |
| Activation | Lead → Activation | X% | X% | X% | >35% | — |
| Activation | Time-to-Activation | Xh | Xh | Xh | <24h | — |
| Revenue | Avg Order Value | $X | $X | $X | — | — |
| Revenue | **LTV:CAC** | **X.X** | **X.X** | **X.X** | **>3** | — |
| Revenue | Payback (days) | X | X | X | <45 | — |

## Flywheel (Retention/Referral feedback loop)
| Stage | Metric | FB | IG | Blended | Target | Status |
|---|---|---|---|---|---|---|
| Retention | D7 Repurchase | X% | X% | X% | >5% | — |
| Retention | D30 Repurchase | X% | X% | X% | >15% | — |
| Retention | D90 Repurchase | X% | X% | X% | >25% | — |
| Retention | Churn 60d | X% | X% | X% | <30% | — |
| Referral | K-factor (30d) | 0.X | 0.X | 0.X | >0.2 | — |
| Referral | Buyers que invitan | X% | X% | X% | >15% | — |
| Referral | CAC vía referral | $X | $X | $X | <CAC paid * 0.3 | — |

## Verdict
{Una línea con la jugada principal. Ejemplo: "🟢 Acelerar IG — LTV:CAC 8.0 con payback 31d. K-factor en IG 0.18 vs 0.08 FB sugiere shift de budget +20% IG."}

## Risks
- {Riesgo 1 con número detrás}
- {Riesgo 2}

## Next Step
1. {Acción concreta} — {timeline}
2. {Acción concreta} — {timeline}
```

### Fase 4: Auto-flag (si se pidió `--auto-flag`)

Cargas `.claude/settings.json → guardrails.auto_pause_rules` y para cada AdSet evalúas todas las reglas. Por cada violación:

```markdown
## ⚠️ Auto-flags ({N} reglas violadas)

### AdSet `BOF-Retargeting`
- **Regla violada**: `cpa_2x_target`
- **Estado**: CPA $48 vs target $25 (>2x) con $112 gastados
- **Acción propuesta**: pausar adset
- **Comando exacto**:
  ```bash
  curl -X POST "https://graph.facebook.com/v21.0/{adset_id}?access_token=$META_ACCESS_TOKEN" -d "status=PAUSED"
  ```
- **¿Confirmas pausa?** (y/n)

### AdSet `MOF-LAL2`
...
```

**Nunca** ejecutas la pausa sin confirmación humana — te limitas a presentar el comando exacto.

## Reglas Inviolables

1. Nunca presentas tabla sin la columna Status (semáforo). Tabla sin verdict es ruido.
2. Si un dato falta (ej. K-factor sin Referral lanzado todavía), ponés `—`, no inventas.
3. Si la ventana tiene <100 conversiones totales, agregas advertencia: "⚠️ Sample size bajo, ratios tienen ±X% confidence interval."
4. El `Next Step` debe tener máximo 3 acciones. Más es ruido.
