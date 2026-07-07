---
description: "Solo Acquisition. Lanza/escala/mata campañas FB/IG sin tocar Retention ni Referral."
argument-hint: "--platform fb|ig|both --objective sales|leads|traffic --angle problem|ugc|proof --budget <USD>"
---

# /acquire — Acquisition focused

Comando dedicado a la primera mitad del AAARRR (Awareness + Acquisition + Activation). Útil cuando quieres testear el funnel de Acquisition aislado, sin gatillar la maquinaria de Retention/Referral.

## Parsing

- `--platform fb|ig|both`: Default `both`. Si `ig`, valida creatives 9:16 obligatorios.
- `--objective sales|leads|traffic`: Default `sales` si pixel + Purchase event existen, sino `leads`.
- `--angle problem|ugc|proof|curiosity|urgency`: Default rota los 5 ángulos.
- `--budget <USD>`: daily budget total. Default $50.
- `--cbo` / `--abo`: Campaign Budget Optimization vs AdSet Budget. Default `cbo`.
- `--broad` / `--lal-only` / `--retargeting-only`: limita la estructura. Default deja el subagent decidir.
- `--scale +X%`: si la campaña existe y healthy, sube budget X%.
- `--kill-losers`: revisa últimas 72h, propone matar adsets con CPA > 1.5x target.

## Workflow

### Modo launch (default si no hay campaña Acquisition activa)

1. Handoff a `acquisition-buyer`:
   ```
   Lanza Acquisition campaign para {producto} con:
   - Platform: {flag}
   - Objective: {flag}
   - Daily budget: {flag}
   - Angle: {flag}
   - Budget allocation: TOF/MOF/BOF según tabla por presupuesto
   Genera spec, espera mi OK, deploy PAUSED.
   ```

2. Espera la spec del agente, presenta al usuario:
   ```
   Plan listo en .aaarrr/plans/acquire-{date}.md.
   Resumen: {N} AdSets, ${X}/día, target CPA ${Y}.
   ¿Confirmas deploy a PAUSED? (y/n)
   ```

3. Con OK, agente deploy. Con éxito, devuelves comandos de activación:
   ```bash
   # Activar campaña
   curl -X POST "https://graph.facebook.com/v21.0/{campaign_id}?access_token=$META_ACCESS_TOKEN" -d "status=ACTIVE"

   # Activar adsets individualmente (recomendado)
   curl -X POST "https://graph.facebook.com/v21.0/{adset_id_tof}?access_token=$META_ACCESS_TOKEN" -d "status=ACTIVE"
   ```

### Modo scale (`--scale +X%`)

1. Verifica que la campaña Acquisition activa cumpla criterio Patience Paradox:
   - CPA ≤ 1.2x target por **5 días seguidos**
   - Daily spend > $500 (si no, aplica regla simplificada: CPA dentro de target por 7 días)
2. Si NO cumple, **detente** y reporta:
   > "Campaña no califica para scale. CPA $X vs target $Y. Esperar {N} días más o ajustar bid."
3. Si cumple, propone update:
   ```bash
   curl -X POST "https://graph.facebook.com/v21.0/{campaign_id}?access_token=$META_ACCESS_TOKEN" \
     -d "daily_budget={current * (1 + X/100)}"
   ```
4. Pide confirmación humana antes de ejecutar.

### Modo kill-losers (`--kill-losers`)

1. Pull insights last_72h para todos los adsets activos
2. Por cada adset con `CPA > target * 1.5` Y `spend > $50`:
   - Genera comando de pausa
   - Lista en tabla con razón
3. Output:
   ```markdown
   ## Loser Kill List
   | AdSet | Spend 72h | CPA | vs Target | Action |
   |---|---|---|---|---|
   | TOF-Broad-Hook3 | $87 | $52 | 2.08x | PAUSE |
   | MOF-LAL2-Hook5 | $73 | $48 | 1.92x | PAUSE |

   ## Comandos de pausa (ejecutar después de tu OK)
   curl -X POST .../act_X/{adset_id_1}?access_token=... -d "status=PAUSED"
   curl -X POST .../act_X/{adset_id_2}?access_token=... -d "status=PAUSED"
   ```
4. Espera OK humano antes de ejecutar.

## Reglas Inviolables

1. Nunca lanzas con `status=ACTIVE`
2. Nunca scaleas budget +X% sin verificar Patience Paradox
3. Nunca matas sin OK humano — solo recomendación con comando exacto
4. Si `--platform ig` y faltan creatives 9:16, **detente**: "Necesito mínimo 5 imágenes 9:16 para IG. Generar con `/aaarrr-launch --platform ig` o pasarme paths."
