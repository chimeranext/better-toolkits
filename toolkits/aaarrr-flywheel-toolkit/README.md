# AAARRR Flywheel Toolkit

> **Mantra:** fail fast, fail often, fail cheap, fail forward.

Sistema de agentes, comandos y workflows que ejecuta el framework **AAARRR** (Awareness, Acquisition, Activation, Revenue, Retention, Referral) sobre Meta Marketing API. Combina un **Acquisition funnel** lineal con un **Retention/Referral flywheel** que retroalimenta a Acquisition vía custom audiences, lookalikes de high-LTV buyers, y K-factor real.

Todo se ejecuta vía Graph API directo — cero MCP, cero abstracciones. Si Meta rompe algo, lo arreglás vos en código que entendés.

---

## ¿Por qué Funnel + Flywheel?

- El **funnel** (Awareness → Acquisition → Activation → Revenue) es **lineal**: cada paso pierde gente; ese drop-off es lo que optimizás.
- El **flywheel** (Retention → Referral) es **circular**: clientes activados generan momentum que regresa al inicio del funnel como audiencia LAL, K-factor, UGC, y reduce el blended CAC.

Si tratás esto como "doble funnel", terminás con dos sistemas desconectados. Tratándolo como funnel + flywheel, las primeras 4 As alimentan a las últimas 2, y las últimas 2 cierran el loop hacia el inicio.

---

## Quick Start (5 minutos)

### 1. Pre-requisitos

```bash
# Node 20+
node --version

# tsx para ejecutar TypeScript scripts
npm install
```

Configurar acceso a Meta:

```bash
export META_ACCESS_TOKEN="EAAxxxxxx"  # Long-lived System User token
```

Necesitás:
- Meta Business Manager con Ad Account
- Facebook Page conectada al Ad Account
- Instagram Business Account vinculada (si vas IG)
- Pixel instalado y disparando event `Purchase`
- Long-lived access token con scopes `ads_management`, `ads_read`, `business_management`

### 2. Setup en tu proyecto

En el directorio raíz de tu producto/proyecto, crear `.aaarrr/config.json`:

```json
{
  "meta": {
    "ad_account_id": "act_1234567890",
    "page_id": "987654321",
    "instagram_actor_id": "17841400000000000",
    "pixel_id": "1234567890",
    "business_id": "123456789",
    "access_token_env": "META_ACCESS_TOKEN"
  },
  "product": {
    "name": "Mi Producto",
    "url": "https://miproducto.com",
    "activation_event": "Purchase",
    "target_cpa": 25,
    "target_ltv": 75,
    "target_d30_repurchase": 0.15,
    "target_k_factor": 0.20,
    "gross_margin": 0.7,
    "currency": "USD"
  },
  "revenue_source": {
    "type": "meta_pixel"
  }
}
```

`gross_margin` debe ser entre 0 y 1 (0.7 = 70%). Es crítico — el toolkit calcula LTV con gross margin, no revenue.

### 3. Lanzar el sistema

```bash
/aaarrr-launch --product "Mi Producto" --cpa-target 25 --platform ig --budget 50
```

Esto te genera:
- Plan de Acquisition (TOF/MOF/BOF) en `.aaarrr/plans/`
- Plan de Retention (D7/D30/D90)
- Plan de Referral (con seed audience)
- Resumen financiero del launch
- Comandos exactos para activar después de tu OK

**Nada se activa solo.** Todo arranca PAUSED. Vos disparás el primer `status=ACTIVE` cuando estés listo.

---

## Flujo típico de 7 días

```
Día 0: /aaarrr-launch        → planes generados, todo PAUSED
       [revisión humana]
       activación manual del Acquisition

Día 2: /aaarrr-analyze --auto-flag
       → mata losers (CPA > 1.5x target)

Día 3: /activate --diagnose
       → fix leak top en activation funnel

Día 7: /retain --day 7        → primer rung del flywheel

Día 14: /revenue --report     → primer LTV:CAC real
        /refer --launch       → si buyers_high_ltv ≥200

Día 30: /revenue --cohort     → primera cohorte completa
        decisión: scale, iterate, or kill
```

O ejecutalo automatizado:

```bash
/loop 1d /aaarrr-analyze --auto-flag
```

---

## Estructura del toolkit

```
aaarrr-flywheel-toolkit/
├── .claude-plugin/plugin.json    # Plugin manifest
├── .claude/settings.json          # Guardrails: max spend, auto-pause rules, targets
├── .mcp.json                      # Vacío — toolkit no depende de MCP
├── package.json                   # tsx + TypeScript
├── tsconfig.json
│
├── agents/                        # 5 agentes especializados
│   ├── acquisition-buyer.md       # Lanza/escala/mata FB/IG. Patience Paradox.
│   ├── activation-optimizer.md    # CRO. Diagnóstica leaks click→primer valor.
│   ├── retention-automator.md     # D7/D30/D90 ladder. Custom audiences. Stack offers.
│   ├── referral-architect.md      # K-factor real. Two-sided rewards. Itera o mata.
│   └── revenue-analyst.md         # CFO del sistema. LTV:CAC, payback. Solo números.
│
├── commands/                      # 8 comandos
│   ├── aaarrr-launch.md           # Lanza funnel + flywheel completo
│   ├── aaarrr-analyze.md          # Tabla AAARRR end-to-end
│   ├── acquire.md                 # Solo Acquisition (launch/scale/kill-losers)
│   ├── activate.md                # CRO focused
│   ├── retain.md                  # Retention ladder + NPS/feedback loop (--nps)
│   ├── refer.md                   # Referral loop
│   ├── revenue.md                 # CFO dashboards + unit economics (--unit-economics)
│   └── kill-funnel.md             # Emergency stop
│
├── workflows/                     # Workflow YAMLs reutilizables
│   ├── double-engine-7day.yaml    # 7 días: launch → first cohort
│   ├── ig-only-aaarrr.yaml        # IG-only para Gen Z / millenial
│   └── churn-rescue.yaml          # Auto-detect + reactivación
│
├── funnels/                       # Configs declarativas
│   ├── tof-mof-bof.json           # Estructura Acquisition por presupuesto
│   ├── retention-ladder.json      # D7/D30/D90 specs
│   └── referral-engine.json       # Reward mechanics + K-factor checkpoints
│
├── templates/                     # Templates reutilizables
│   ├── aaarrr-dashboard.md        # Tabla AAARRR vacía
│   ├── creative-matrix-aaarrr.json # Hook × Stage × Platform
│   └── sop-aaarrr-daily.md        # SOP 15min diaria
│
├── scripts/                       # TypeScript directo a Graph API
│   ├── lib/
│   │   ├── graph-api.ts           # Cliente con retry + types
│   │   ├── config.ts              # Loader de .aaarrr/config.json
│   │   └── revenue-source.ts      # Adapter pattern: pixel | csv | (future Stripe)
│   ├── ltv-cac-calculator.ts      # LTV, CAC, payback por plataforma
│   ├── referral-tracker.ts        # K-factor real
│   └── churn-detector.ts          # D30/D60/D90 buckets
│
├── hooks/                         # Safety hooks (no bloquean, solo flag)
│   ├── hooks.json
│   ├── spend-safety.sh            # Warning ante POST/DELETE a Graph API
│   └── session-log.sh             # Auto-log de archivos modificados
│
├── references/                   # Libros de definiciones y metodología
│   ├── cro-methodology.md         # CRO para landing pages
│   ├── visual-language.md         # Sistema visual (typo/motion/bento)
│   ├── unit-economics.md          # CAC blended vs paid, LTV gross-margin, payback en meses, benchmarks por modelo
│   ├── nps-and-feedback-loop.md   # NPS (promoters/passives/detractors) + feedback loop captura→triage→cierre
│   └── output-structure.md        # Estructura de artefactos generados
│
└── skills/
    └── meta-graph-api/            # Documentación exhaustiva de los endpoints usados
        └── SKILL.md
```

---

## Guardrails — el "fail forward" en código

`.claude/settings.json` contiene los umbrales operacionales:

```json
{
  "guardrails": {
    "auto_pause_mode": "flag_with_confirmation",
    "max_daily_spend_usd": 300,
    "auto_pause_rules": [
      { "name": "cpa_2x_target", "metric": "cpa", "threshold_expr": "target_cpa * 2", "min_spend_usd": 100, "action": "flag_pause" },
      { "name": "roas_below_1", "metric": "roas", "threshold_value": 1, "min_days": 3, "action": "flag_pause" },
      { "name": "ltv_cac_collapse", "metric": "ltv_cac", "threshold_value": 1.5, "min_days": 7, "action": "flag_kill_funnel" }
    ]
  }
}
```

**Nada se pausa sin tu confirmación**, pero el sistema vigila constantemente y te alerta. La velocidad está en el ciclo de iteración (creates en segundos), no en la activación (revisión humana en minutos).

---

## Patrones diferenciadores

1. **Direct Graph API**, no MCP. El cliente está en `scripts/lib/graph-api.ts` — 200 líneas, retry exponencial, types completos. Si Meta rompe, lo arreglás vos.

2. **Adapter pattern para revenue source**. Empieza con Meta pixel (data garantizada). Mañana agregás Stripe/RevenueCat/CSV adapter sin tocar el cálculo de LTV.

3. **Cohorte-aware kill rules**. `revenue-analyst` no mata por una métrica de un día — exige 7+ días sostenidos. Distingue ruido de señal.

4. **K-factor medido vs target**. La mayoría de toolkits reportan K-factor proyectado. Este toolkit te obliga a medir el real (CSV de referrals + buyers count) y separa "K target" de "K medido".

5. **Patience Paradox enforced**. Si un adset cumple CPA ≤ 1.2x target por 5 días + spend > $500, se bloquean ediciones por 14 días. Andromeda compone. El biggest mistake es tocar profitable ad sets.

6. **Always PAUSED**. Toda creación arranca PAUSED. Activación es decisión humana. La fricción está en el lugar correcto.

---

## Decisiones cuando algo no funciona

| Síntoma | Comando | Acción esperada |
|---|---|---|
| CPA > 2x target con $200+ gastados | `/acquire --kill-losers` | Mata adsets perdedores con tu OK |
| LTV:CAC < 1.5 por 7+ días | `/revenue --kill-check` | Recomendación de KILL con números |
| K-factor < target * 0.3 a D60 | `/refer --iterate` o kill | Iteración de reward o kill |
| Frequency > 5 en adset principal | `/acquire --refresh-creative` | Refresh obligatorio |
| Churn 60d crece >15% MoM | `workflows/churn-rescue.yaml` | Reactivación automática |
| Activation CVR < 1.5% | `/activate --fix-cvr 1.5%` | Fix UI/copy/form |
| Funnel económicamente roto | `/kill-funnel all --reason "..."` | Pausa total + learning saved |

---

## Bibliografía / Inspiración

- AARRR (Pirate Metrics) — Dave McClure, 500 Startups
- AAARRR (con awareness extra) — Ward van Gasteren
- Funnel vs Flywheel — HubSpot (2018)
- Patience Paradox + Flood + Underbid — operadores $80M+ del mercado paid social
- Failing Forward — John C. Maxwell
- Meta Marketing API v21 reference

---

## Idioma

Docs en español. Código en inglés. Los archivos en `agents/`, `commands/` y `workflows/` están en español porque son leídos por el modelo en cada sesión y la fluidez del usuario es prioridad.

## Licencia

MIT.
