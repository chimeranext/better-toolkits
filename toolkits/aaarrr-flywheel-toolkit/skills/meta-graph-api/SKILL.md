---
name: meta-graph-api
description: Direct Meta Marketing API patterns para AAARRR. Endpoints usados, errors comunes, retry, Advantage+ Creative, Custom Audiences, Conversions API. Cero MCP, cero abstracciones — solo curl + JSON.
---

# Meta Graph API — Direct Patterns para AAARRR

Esta skill documenta exclusivamente los patrones de Graph API que el toolkit AAARRR Flywheel usa en producción. Si tu caso no está acá, está fuera del scope del toolkit.

**Versión asumida**: `v21.0`. Si Meta deprecca, busca en este archivo y actualiza.

## Setup mínimo

Tres cosas necesitan existir antes de cualquier operación:

```bash
export META_ACCESS_TOKEN="EAAxxxxxxxxx..."
export AD_ACCOUNT_ID="act_1234567890"
export PIXEL_ID="9876543210"
```

El access_token debe tener scopes: `ads_management`, `ads_read`, `business_management`. Si te equivocas en scopes, error 200 (insufficient permissions) — no error útil, solo frustración. Generas tokens en [Meta Business Suite → Settings → System Users](https://business.facebook.com/settings/system-users) con tipo "Admin" y selecciona todos los scopes.

## Estructura jerárquica

```
Ad Account (act_XXXXX)
  └── Campaign (objective: OUTCOME_SALES, OUTCOME_LEADS, OUTCOME_TRAFFIC, etc.)
       └── Ad Set (targeting, budget, schedule, optimization_goal)
            └── Ad (creative: asset_feed_spec con dynamic creative)
```

Toda creación es `POST /<parent_id>/<edge>`. Toda update es `POST /<entity_id>` con los campos a cambiar.

## Campaign — crear PAUSED siempre

```bash
curl -X POST "https://graph.facebook.com/v21.0/${AD_ACCOUNT_ID}/campaigns" \
  -d "name=AAARRR-Acquisition-CursoX-2026-04-25" \
  -d "objective=OUTCOME_SALES" \
  -d "status=PAUSED" \
  -d "special_ad_categories=[]" \
  -d "buying_type=AUCCION" \
  -d "access_token=${META_ACCESS_TOKEN}"
```

Response:
```json
{ "id": "120210000000000000" }
```

**Nunca** crear con `status=ACTIVE`. Toda activación es decisión humana posterior:

```bash
curl -X POST "https://graph.facebook.com/v21.0/${CAMPAIGN_ID}" \
  -d "status=ACTIVE" \
  -d "access_token=${META_ACCESS_TOKEN}"
```

### Objectives (v21+)

| Objective | Usar cuando | optimization_goal |
|---|---|---|
| `OUTCOME_SALES` | Compras, signups con pago | `OFFSITE_CONVERSIONS` |
| `OUTCOME_LEADS` | Lead forms, newsletter signups | `LEAD_GENERATION` o `OFFSITE_CONVERSIONS` |
| `OUTCOME_TRAFFIC` | Clicks/visits — evitar para PLG | `LINK_CLICKS` o `LANDING_PAGE_VIEWS` |
| `OUTCOME_AWARENESS` | Reach/branding — evitar early stage | `REACH` o `THRUPLAY` |
| `OUTCOME_ENGAGEMENT` | Engagement, page likes | `POST_ENGAGEMENT` |
| `OUTCOME_APP_PROMOTION` | App installs | `APP_INSTALLS` |

`special_ad_categories` se requiere SIEMPRE. Si no es vivienda/empleo/crédito/política/social, pasas `[]` (lista vacía).

## Ad Set — donde vive el targeting + budget

```bash
curl -X POST "https://graph.facebook.com/v21.0/${AD_ACCOUNT_ID}/adsets" \
  -d "name=TOF-Broad" \
  -d "campaign_id=${CAMPAIGN_ID}" \
  -d "status=PAUSED" \
  -d "daily_budget=5000" \
  -d "billing_event=IMPRESSIONS" \
  -d "optimization_goal=OFFSITE_CONVERSIONS" \
  -d "bid_strategy=LOWEST_COST_WITH_BID_CAP" \
  -d "bid_amount=1750" \
  -d "promoted_object={\"pixel_id\":\"${PIXEL_ID}\",\"custom_event_type\":\"PURCHASE\"}" \
  -d "targeting=$(cat <<'TARGETING'
  {
    "geo_locations": {"countries": ["CR"], "location_types": ["home"]},
    "age_min": 25,
    "age_max": 55,
    "publisher_platforms": ["facebook", "instagram"],
    "facebook_positions": ["feed", "video_feeds"],
    "instagram_positions": ["stream", "story", "reels"]
  }
TARGETING
)" \
  -d "is_dynamic_creative=true" \
  -d "access_token=${META_ACCESS_TOKEN}"
```

**Atención**:
- `daily_budget` está en CENTAVOS (5000 = $50). Error fácil.
- `bid_amount` también en CENTAVOS. 1750 = $17.50 (= 0.7 × $25 target CPA).
- `is_dynamic_creative=true` es OBLIGATORIO si vas a usar `asset_feed_spec` en los ads. Sin esto, el ad falla al crear.
- `promoted_object` con `pixel_id + custom_event_type` para `OFFSITE_CONVERSIONS`. Sin esto, optimiza en vacío.

### Bid strategies

| Strategy | Cuándo |
|---|---|
| `LOWEST_COST_WITHOUT_CAP` | Default. Meta optimiza dentro del budget |
| `LOWEST_COST_WITH_BID_CAP` | Setea max bid. Útil para flood + underbid testing (0.7x target CPA) |
| `COST_CAP` | Setea target cost por result — necesita 30+ events de baseline |

### Custom Audiences en targeting

```json
{
  "targeting": {
    "geo_locations": {"countries": ["CR"]},
    "custom_audiences": [{"id": "AUDIENCE_ID"}],
    "excluded_custom_audiences": [{"id": "PURCHASERS_AUDIENCE_ID"}]
  }
}
```

### Lookalike Audience

Primero creas la LAL desde un source:

```bash
curl -X POST "https://graph.facebook.com/v21.0/${AD_ACCOUNT_ID}/customaudiences" \
  -d "name=LAL_2pct_Buyers_HighLTV" \
  -d "subtype=LOOKALIKE" \
  -d "origin_audience_id=${SOURCE_AUDIENCE_ID}" \
  -d "lookalike_spec={\"ratio\":0.02,\"country\":\"CR\"}" \
  -d "access_token=${META_ACCESS_TOKEN}"
```

LAL puede tardar minutos a horas en estar `ready`. Verificas:

```bash
curl -G "https://graph.facebook.com/v21.0/${AUDIENCE_ID}" \
  -d "fields=delivery_status,size" \
  -d "access_token=${META_ACCESS_TOKEN}"
```

Si `delivery_status.code != 200`, esperá. Si después de 24h sigue en `not_ready`, source audience está chica (Meta requiere mínimo 100 personas).

## Ad — Advantage+ Creative obligatorio

Nunca uses `link_data.image_url` — error 1443050 garantizado. Siempre subes imagen primero:

```bash
curl -F "filename=@./images/square_1x1.jpg" \
  "https://graph.facebook.com/v21.0/${AD_ACCOUNT_ID}/adimages?access_token=${META_ACCESS_TOKEN}"
```

Response:
```json
{
  "images": {
    "square_1x1.jpg": {
      "hash": "abc123def456...",
      "url": "https://scontent.xx.fbcdn.net/..."
    }
  }
}
```

Capturas el `hash`. Después creas el ad con `asset_feed_spec`:

```bash
curl -X POST "https://graph.facebook.com/v21.0/${AD_ACCOUNT_ID}/ads" \
  -d "name=Ad-Hook1-Broad" \
  -d "adset_id=${ADSET_ID}" \
  -d "status=PAUSED" \
  -d "creative={\"object_story_spec\":{\"page_id\":\"${PAGE_ID}\",\"instagram_actor_id\":\"${IG_ACTOR_ID}\"},\"asset_feed_spec\":$(cat <<'ASSETS'
  {
    "bodies": [
      {"text": "Variación primer texto 1"},
      {"text": "Variación primer texto 2"},
      {"text": "Variación primer texto 3"},
      {"text": "Variación primer texto 4"},
      {"text": "Variación primer texto 5"}
    ],
    "titles": [
      {"text": "Headline 1"},
      {"text": "Headline 2"},
      {"text": "Headline 3"},
      {"text": "Headline 4"},
      {"text": "Headline 5"}
    ],
    "descriptions": [
      {"text": "Descripción 1"},
      {"text": "Descripción 2"}
    ],
    "images": [
      {"hash": "hash_square_1x1"},
      {"hash": "hash_vertical_9x16"}
    ],
    "link_urls": [
      {"website_url": "https://producto.com/landing?utm_source=meta&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.id}}"}
    ],
    "call_to_action_types": ["SIGN_UP"],
    "ad_formats": ["SINGLE_IMAGE"]
  }
ASSETS
)}" \
  -d "access_token=${META_ACCESS_TOKEN}"
```

### Image specs requeridas

- **1:1 (square)** — 1080×1080 mínimo, usado en Feed
- **9:16 (vertical)** — 1080×1920 mínimo, usado en Stories y Reels
- Opcional: 1.91:1 (1200×628) para right column

Si lanzas a IG y no tenés 9:16, el ad va a placement Feed solo (peor performance, mayor CPM). Always provide both.

## Custom Audiences — base del Retention/Referral

### Website-based (más comunes)

```bash
# buyers_d30 — compraron en últimos 30 días
curl -X POST "https://graph.facebook.com/v21.0/${AD_ACCOUNT_ID}/customaudiences" \
  -d "name=buyers_d30" \
  -d "subtype=WEBSITE" \
  -d "rule=$(cat <<'RULE'
  {
    "inclusions": {
      "operator": "and",
      "rules": [
        {
          "event_sources": [{"id": "PIXEL_ID", "type": "pixel"}],
          "retention_seconds": 2592000,
          "filter": {
            "operator": "and",
            "filters": [
              {"field": "event", "operator": "=", "value": "Purchase"}
            ]
          }
        }
      ]
    }
  }
RULE
)" \
  -d "access_token=${META_ACCESS_TOKEN}"
```

`retention_seconds`:
- 7 días = 604800
- 30 días = 2592000
- 90 días = 7776000

### Excluding past buyers de Acquisition

```json
{
  "targeting": {
    "custom_audiences": [{"id": "broad_lookalike"}],
    "excluded_custom_audiences": [
      {"id": "buyers_d30"},
      {"id": "buyers_d90"},
      {"id": "churned_60d"}
    ]
  }
}
```

Si no excluís, pagás CPM para impactar a alguien que ya compró — rompe LTV:CAC.

## Insights — pull de métricas

```bash
curl -G "https://graph.facebook.com/v21.0/${AD_ACCOUNT_ID}/insights" \
  -d "level=adset" \
  -d "fields=adset_name,spend,impressions,clicks,actions,action_values,cpm,cpp,ctr,frequency,reach" \
  -d "date_preset=last_30d" \
  -d "breakdowns=publisher_platform" \
  -d "access_token=${META_ACCESS_TOKEN}"
```

`actions` y `action_values` son arrays. Cada elemento tiene `action_type` y `value`. Para purchases:

```json
{
  "actions": [
    {"action_type": "purchase", "value": "47"},
    {"action_type": "offsite_conversion.fb_pixel_purchase", "value": "47"},
    {"action_type": "omni_purchase", "value": "47"}
  ]
}
```

**Atención**: pueden venir duplicados con distinto `action_type`. El toolkit usa los 3 más comunes (`purchase`, `offsite_conversion.fb_pixel_purchase`, `omni_purchase`). Si tu pixel está bien, los 3 dan el mismo número. Si dan distinto, hay tracking duplicado en el pixel — fix antes de confiar en ratios.

### Date presets útiles
- `today`, `yesterday`
- `last_3d`, `last_7d`, `last_14d`, `last_28d`, `last_30d`, `last_90d`
- `this_week_mon_today`, `last_week_mon_sun`
- `this_month`, `last_month`, `this_quarter`, `last_quarter`

### Breakdowns útiles

| Breakdown | Para qué |
|---|---|
| `publisher_platform` | FB vs IG split |
| `platform_position` | Stories vs Reels vs Feed split |
| `device_platform` | Mobile vs Desktop |
| `age,gender` | Demographics — útil pero ojo con sample size |
| `country` | Multi-country |

## Errors comunes y qué significan

| Code | Subcode | Diagnóstico |
|---|---|---|
| 100 | various | Parámetro malformado o falta. Lee el message. |
| 17 | — | Rate limit. Tu retry con exponential backoff lo arregla. |
| 80004 | — | Tu access_token vence. Renová desde Business Suite. |
| 200 | — | Falta scope en token. Probable `ads_management` faltante. |
| 1443050 | — | Imagen pasada como `image_url` en `link_data`. Subila como `adimage` y usá `image_hash`. |
| 1487079 | — | Daily budget bajo el mínimo Meta ($1 USD equivalente local). |
| 1487079 | — | Targeting demasiado angosto (audiencia <100 personas). |
| 100 | 1487749 | Targeting malformado, JSON inválido. |
| 2655 | — | Imagen rechazada por policy review. Cambiá la imagen. |
| 100 | 1487196 | Pixel no corresponde al ad account o no tiene permisos. |

## Conversions API (CAPI) — opcional pero recomendado

Después de iOS14, el pixel client-side pierde data. CAPI manda eventos server-side. Para AAARRR, lo necesitas si:
- Tu LTV:CAC rebota irrealmente bajo (problema de attribution, no de unit economics)
- Quieres usar pLTV bidding (predictive LTV) en mature accounts

```bash
curl -X POST "https://graph.facebook.com/v21.0/${PIXEL_ID}/events" \
  -d "data=$(cat <<'EVENT'
  [
    {
      "event_name": "Purchase",
      "event_time": 1714000000,
      "user_data": {
        "em": ["sha256_email_hash"],
        "ph": ["sha256_phone_hash"],
        "client_ip_address": "1.2.3.4",
        "client_user_agent": "Mozilla/..."
      },
      "custom_data": {
        "currency": "USD",
        "value": 47.00
      },
      "event_source_url": "https://producto.com/checkout/success",
      "action_source": "website"
    }
  ]
EVENT
)" \
  -d "access_token=${META_ACCESS_TOKEN}"
```

`event_time` es Unix timestamp en segundos. PII debe estar SHA-256 hashed (lowercase + trim antes de hash).

## Patterns que rompen el toolkit

Estos errores los he visto:

1. **Olvidar `is_dynamic_creative=true` en adset** → ad creation con `asset_feed_spec` falla con error 100.
2. **Crear adset con `targeting` minúsculo (audiencia <100 personas)** → error 1487079, "audience too narrow".
3. **Setear `bid_amount` pero `bid_strategy=LOWEST_COST_WITHOUT_CAP`** → silently ignored.
4. **Usar `access_token` de user en vez de System User** → expira en 60 días sin warning. Use System User token (long-lived).
5. **Subir imagen >30MB o JPG con perfil de color CMYK** → error 2655. Convertir a sRGB.

## Test de smoke en 30 segundos

Si querés verificar que tu setup funciona sin gastar:

```bash
# 1. Token válido + ad account accesible
curl -G "https://graph.facebook.com/v21.0/${AD_ACCOUNT_ID}" \
  -d "fields=name,account_status,currency,timezone_name" \
  -d "access_token=${META_ACCESS_TOKEN}"
# Debe devolver name, account_status=1 (active), currency, tz

# 2. Pixel disparando
curl -G "https://graph.facebook.com/v21.0/${PIXEL_ID}" \
  -d "fields=name,is_active,last_fired_time" \
  -d "access_token=${META_ACCESS_TOKEN}"
# last_fired_time debe ser reciente (<24h)

# 3. Page accesible
curl -G "https://graph.facebook.com/v21.0/${PAGE_ID}" \
  -d "fields=name,access_token" \
  -d "access_token=${META_ACCESS_TOKEN}"
```

Si los 3 OK, podés correr `/aaarrr-launch` con confianza.
