# SOP — AAARRR Daily Operations (15min)

Procedimiento estándar diario. 15 minutos. Una pasada por cada A del sistema. Toda decisión que afecte gasto requiere confirmación humana.

---

## Pre-flight (1 min)
- [ ] `META_ACCESS_TOKEN` válido (no expirado)
- [ ] `.aaarrr/config.json` actualizado
- [ ] Snapshots de ayer en `.aaarrr/metrics/` no muestran errors

---

## A1 — Awareness (2 min)

```
/aaarrr-analyze --last 1d
```

Mira en tabla:
- [ ] CPM dentro target (<$15) y no creció >20% vs ayer
- [ ] Frequency en cada adset <3 (Acquisition) o <5 (Retention)
- [ ] Reach distribuido (no concentrado en 1 placement)

**Acciones**:
- Si CPM > target: revisar creative fatigue. Si frequency también alta → refresh creatives.
- Si Reach concentrado: agregar placements o liberar advantage placement.

---

## A2 — Acquisition (3 min)

```
/aaarrr-analyze --last 7d --auto-flag
```

Mira:
- [ ] CPA blended dentro target
- [ ] Por adset: ¿algún adset con CPA > 1.5x target con $50+ gastados? Auto-flag debería listarlos
- [ ] Distribución FB vs IG: si una plataforma tiene CPM < 0.8x la otra, considerar shift

**Acciones**:
- Si auto-flag listó adsets para pausar: revisar la propuesta y confirmar pausa.
  ```
  /acquire --kill-losers
  ```
- Si una plataforma claramente mejor: 
  ```
  /acquire --platform [winner] --scale +20%
  ```

---

## A3 — Activation (2 min)

```
/activate --diagnose
```

Mira:
- [ ] Click → Landing View > 85%
- [ ] Landing → Lead/Signup > 25%
- [ ] Lead → Activation > 35%

**Acciones**:
- Si hay leak >50% en algún paso, generar fix:
  ```
  /activate --fix-cvr <stage> --target X%
  ```
- Si volumen >2,000 visitors/semana en página clave: considerar A/B test.

---

## A4 — Revenue (3 min)

```
/revenue --report
```

Mira:
- [ ] LTV:CAC > 3 (target healthy)
- [ ] Payback < 45d
- [ ] Marginal CAC vs Blended CAC

**Acciones**:
- Si LTV:CAC < 2 por 7+ días: corres `/revenue --kill-check`. Es serio.
- Si Marginal CAC > Blended * 1.3: detener scaling, no estás entrando en nuevas audiencias eficientemente.
- Si IG LTV > FB LTV * 1.3: rebalance budget.

---

## A5 — Retention (2 min)

```
/retain --refresh-audiences
```

Mira:
- [ ] buyers_d7, d30, d90 actualizados
- [ ] D30 repurchase rate > 15%
- [ ] Churn 60d MoM no creció >15%

**Acciones**:
- Si churn aceleró: `workflows/churn-rescue.yaml`
- Si audiencia D7 alcanzó >1,000 personas y aún no lanzaste D7: 
  ```
  /retain --day 7
  ```

---

## A6 — Referral (2 min)

```
/refer --check
```

Mira:
- [ ] K-factor medido vs target
- [ ] Si programa está activo: buyers_who_invited / total_buyers > 15%

**Acciones**:
- Si K < target * 0.5 a D30+: 
  ```
  /refer --iterate
  ```
- Si K ≥ target * 1.2 sostenido 14 días: 
  ```
  /refer --scale
  ```

---

## Cierre (1 min)

- [ ] Apuntar 1-2 learnings del día en `.aaarrr/learnings/daily-{YYYY-MM-DD}.md`
- [ ] Si hubo decisión de pausa/scale, anotar razón con números
- [ ] Si nada anómalo: anotar "uneventful — system stable"

---

## Triggers de emergencia (no esperan a daily SOP)

Cualquiera de estos ejecuta el comando inmediatamente:

| Síntoma | Comando |
|---|---|
| CPA blended > 2x target con $200+ gastados | `/acquire --kill-losers` |
| LTV:CAC < 1.5 por 7+ días | `/revenue --kill-check` → posible `/kill-funnel` |
| Frequency > 5 en adset principal | `/acquire --refresh-creative` |
| Pixel error en console (no events) | Detener todo, debugging primero |
