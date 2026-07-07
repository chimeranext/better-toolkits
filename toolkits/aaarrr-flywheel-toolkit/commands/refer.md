---
description: "Lanza, mide y escala el referral loop. Cierra el flywheel del lado viral."
argument-hint: "[--launch | --check | --scale | --iterate] [--incentive 'descripción'] [--to <audience>]"
---

# /refer — Referral focused

Segunda mitad del flywheel. Toma high-LTV buyers y los convierte en source de Acquisition. Si funciona, baja el blended CAC. Si no funciona después de 60 días, se mata.

## Parsing

- `--launch`: lanza la campaña de referidos por primera vez.
- `--check`: mide K-factor real del programa actual. Default si hay programa activo.
- `--scale`: si K ≥ target * 1.2 por 14 días, escala budget +50% y expande audiencia.
- `--iterate`: si K < target * 0.5 por 30 días, propone iteración (cambio de reward o creative).
- `--incentive '<descripción>'`: ej. "20% off ambos" o "1 mes free para ambos".
- `--to <audience>`: audiencia source. Default `buyers_high_ltv`. Otros: `buyers_d30`.
- `--mechanic two_sided|one_sided`: default `two_sided` (siempre recomendado).

## Workflow

### Modo `--launch`

Handoff a `referral-architect`:
```
Diseña y lanza Referral campaign para {producto}.
Pre-checks:
  - Verifica que el producto trackee referrer (utm_referrer, ref_code, link único)
  - Si NO trackea, detente y reporta qué necesita implementarse en código
  - Verifica buyers_high_ltv ≥500 personas (sino usa buyers_d30 como proxy)
Genera spec con:
  - Audience: {flag o default}
  - Reward: {flag o default por tipo de producto}
  - 3 creative angles UGC
  - K-factor target + checkpoints D14, D30, D60
  - UTM convention: utm_source=meta&utm_medium=referral&utm_campaign=referral-engine&utm_content={ad_id}&utm_referrer={user_id}
  - Tracking events: ReferralShare, ReferralClickReceived, ReferralPurchase
Guarda spec en .aaarrr/plans/referral-{date}.md.
Pide OK. Deploy PAUSED.
```

### Modo `--check` (default si campaña activa)

```
Corre node ${CLAUDE_PLUGIN_ROOT}/scripts/referral-tracker.ts --window 30d.
Reporta tabla:
  - Total buyers
  - Buyers que invitaron (% activos)
  - Invitaciones enviadas
  - Click-through rate
  - Convert-to-buyer rate
  - K-factor calculado
  - Status vs target
Guarda snapshot en .aaarrr/metrics/referral-{date}.json.
Si K < target * 0.5 a D30, propone iterar. Si K < target * 0.3 a D60, propone matar.
```

### Modo `--scale`

```
Verifica que K ≥ target * 1.2 por 14 días.
Si NO: detente, reporta cuántos días le faltan.
Si SÍ:
  - Sube daily budget +50%
  - Expande audience: agrega buyers_d30 al seed
  - Crea LAL 1% de buyers_high_ltv para lado Acquisition (no solo Referral)
  - Pide OK humano
```

### Modo `--iterate`

```
Diagnóstica por qué el K-factor está bajo:
  - Si invitations_sent / total_buyers < 10% → problema de awareness del program. Iterar creative.
  - Si invitations_sent ok pero click-through < 50% → problema de mensaje del referrer. Iterar reward framing.
  - Si click-through ok pero convert < 10% → problema de landing del referido. Iterar incentivo del referee.
Genera 2 iteraciones A/B en spec, pide OK.
```

## Output para `--check`

```markdown
## Referral Health — last_30d

| Metric | Value | Target | Status |
|---|---|---|---|
| Total buyers | 412 | — | — |
| Buyers que invitaron | 87 (21%) | >15% | 🟢 |
| Invitations sent | 213 | — | — |
| Avg invitations/active referrer | 2.4 | >1.5 | 🟢 |
| Invitation → click | 67% | >50% | 🟢 |
| Click → buyer | 17% | >10% | 🟢 |
| **K-factor** | **0.058** | **>0.20** | 🔴 |
| Buyers via referral | 24 | — | — |
| Implied CAC vía referral | $4.20 | <CAC paid * 0.3 | 🟢 |

## Verdict
Programa funciona individualmente (CTRs, convert rates), pero no escala (K bajo).
La activación de buyers para invitar (21%) es buena. Los referidos convierten bien (17%).
El gap está en cuántas invitaciones genera cada referrer activado: 2.4 invitations/referrer es bajo.

## Iteración recomendada
- Subir reward del referrer 50% (actual: $X → propuesto: $1.5X) para incentivar más invitaciones por usuario.
- Agregar gamificación: "invita 3 amigos y gana extra $Y" para empujar el N por usuario.

Comando: /refer --iterate
```

## Reglas Inviolables

1. Nunca lanzas si el producto no trackea referrer
2. Nunca usas cold audiences como source — solo buyers
3. Nunca prometes K > 0.5 al usuario (mayoría B2C honesto: 0.05-0.20)
4. Distingues siempre `K medido` vs `K target` — esa precisión es el 80% del valor
5. Si después de 90 días no toca target, recomienda kill y handoff a `revenue-analyst`
