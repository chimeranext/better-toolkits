---
description: "Calcula LTV:CAC, payback, cohortes, FB vs IG. CFO del funnel + flywheel."
argument-hint: "[--report | --cohort | --kill-check | --include-referral] [--breakdown placement|platform] [--window 30d|90d|6m]"
---

# /revenue — Revenue Analyst

Comando para evaluar la salud económica del sistema completo. No mide CTR, CPM, ni vanity metrics — mide solo lo que importa: ¿el funnel se paga? ¿el flywheel compone?

## Parsing

- `--report`: default. Tabla AAARRR con foco en LTV:CAC, payback, ratio FB vs IG.
- `--cohort`: cohort retention table de últimos 6 meses.
- `--kill-check`: corre todos los ratios contra triggers de kill.
- `--include-referral`: extiende el cálculo de LTV incluyendo el "halo effect" (revenue traído por buyers que refieren).
- `--breakdown placement|platform`: default `platform`. `placement` desagrega por Stories/Reels/Feed.
- `--window 30d|90d|6m`: default `30d`. Para cohort, default `6m`.
- `--track-ltv`: solo incluye en el report la sección de LTV expandida (12mo proyectado + intervalo de confianza).

## Workflow

Toda la operación se delega a `revenue-analyst`. Tu trabajo aquí es traducir flags a la instrucción correcta.

### Modo `--report` (default)

```
Genera revenue report para {producto} en window {window}, breakdown {breakdown}.
Pull de:
  - Spend, customers, revenue por plataforma
  - Calcula CAC blended y por plataforma
  - Calcula LTV usando gross margin (NO revenue) — lee config.product.gross_margin
  - Calcula LTV:CAC y payback
  - D30 repurchase rate
  - K-factor si hay Referral activo
Output tabla AAARRR con verdict y next-step.
Guarda en .aaarrr/metrics/revenue-{date}.json.
```

### Modo `--cohort`

```
Genera cohort retention table últimos {window}.
Por cada cohorte (mes), reporta:
  - Size
  - M1, M2, M3 ... retention
  - LTV proyectado a 12 meses
Identifica trends:
  - ¿Cohortes nuevas retienen mejor o peor?
  - ¿Algún mes específico con dip raro?
Output tabla en `.aaarrr/metrics/cohorts-{date}.md`.
```

### Modo `--kill-check`

```
Corre todos los ratios. Por cada trigger de kill que se cumpla por 7+ días:
  - LTV:CAC < 1.5
  - Payback > 90d
  - Marginal CAC > Blended CAC * 1.5
  - K-factor < 0.05 si Referral lleva >60d
Si cualquiera se cumple, output es:
  🔴 RECOMIENDO KILL FUNNEL
  Razones: {lista con números}
  Money lost so far: $X
  Estimated additional weekly loss: $Y
  Action: /kill-funnel
  Alternative: pausar Acquisition + diagnóstico (probable producto, no media)
La decisión de matar es humana — solo recomiendas.
```

### Modo `--include-referral`

Modifica el cálculo de LTV para incluir el efecto cascada:

```
LTV expandido = LTV base + (buyer_invitations × invite_conversion × LTV_referidos × discount)
donde discount = 0.5 (descontamos 50% por riesgo de no atribución verdadera)

Si LTV expandido > LTV base * 1.2, lo reportas separadamente:
  "LTV base: $75 — LTV expandido (incl. referral halo): $103 — uplift +37%"
Si la diferencia es <20%, no vale la pena complicar el report — usa LTV base solo.
```

## Output Format

Por defecto (`--report`):

```markdown
# Revenue Report — {producto} — {YYYY-MM-DD}

## Top Line
| Metric | FB | IG | Blended | Target | Status |
|---|---|---|---|---|---|
| Spend | $1,240 | $890 | $2,130 | — | — |
| New customers | 56 | 49 | 105 | — | — |
| **CAC** | **$22.14** | **$18.16** | **$20.29** | <$25 | 🟢 |
| 30d revenue/customer | $62 | $71 | $66 | — | — |
| Estimated 12mo LTV | $145 | $182 | $162 | >$75 | 🟢 |
| **LTV:CAC** | **6.5** | **10.0** | **8.0** | >3 | 🟢 |
| **Payback** | **42d** | **31d** | **37d** | <45d | 🟢 |
| D30 repurchase rate | 16% | 22% | 19% | >15% | 🟢 |
| K-factor | 0.08 | 0.18 | 0.13 | >0.2 | 🟡 |

## Verdict
🟢 Acelerar IG. LTV:CAC 10.0 con payback 31d.

## Next Step
1. /acquire --platform ig --scale +50% — esta semana
2. /refer --check — diagnóstico K-factor IG-only
3. Re-correr /revenue --report en 14 días
```

## Reglas Inviolables

1. Nunca usas LTV proyectado a >12 meses (overconfidence)
2. Nunca calculas LTV con revenue, siempre con gross margin
3. Si data <90 días, agregas: "LTV es estimación. Confidence interval ±30%"
4. Cuando `--kill-check` declara KILL, justificas con números, no opinión
5. Nunca cambias un veredicto KILL sin nueva data — solo si el usuario aporta número que cambia el cálculo
