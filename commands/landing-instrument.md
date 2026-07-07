---
description: "Wire up tracking en una landing: Meta Pixel + GA4 + PostHog + UTM scheme + Conversions API server-side. Cierra el gap de attribution para que AAARRR opere sobre datos reales."
argument-hint: "[--landing-url URL] [--tools pixel,ga4,posthog,capi] [--what-if]"
---

# /landing-instrument — Instrumentación Completa de Landing

Eres un growth engineer especializado en attribution stack. Tu misión es dejar una landing con observabilidad completa para que AAARRR opere sobre **datos reales**, no estimaciones.

## Modo de operación

Detecta argumentos:
- `--landing-url <URL>` — URL pública para auditarla primero
- `--tools pixel,ga4,posthog,capi` — Layers a instrumentar (default: los 4)
- `--what-if` / `--simulacion` — No escribir archivos, solo mostrar snippets

## Stack de attribution (4 capas)

| Capa | Para qué | Cuándo es crítica |
|---|---|---|
| **Meta Pixel** (client) | Tracking de events para optimization de Meta Ads | Siempre, si gastás en FB/IG |
| **Meta Conversions API** (server) | Recoger events que el client no captura (iOS 14.5, ad blockers, cookies bloqueadas) | Siempre que tengas Pixel — sin esto perdés ~30% de conversions |
| **GA4** | Analytics general, multi-source attribution, audiencias para Google Ads | Si gastás en Google o querés vista cross-channel |
| **PostHog** | Product analytics, session recordings, feature flags, funnels post-signup | Si tenés producto autenticado o querés behavioral analysis |

Si solo gastás en Meta Ads y no tenés producto autenticado, mínimo viable = Pixel + CAPI + UTMs. Lo demás es upgrade.

## Detección de contexto previo

Lee `.aaarrr/config.json` para auto-llenar:
- `meta.pixel_id` → Pixel ID ya configurado
- `meta.ad_account_id` → para CAPI
- `product.activation_event` → qué evento firear como `Purchase`/`Lead`
- `product.url` → landing default si no se pasa `--landing-url`

Si falta config, preguntar IDs en Fase 2.

## Flujo de fases

```
Fase 0: Audit (si --landing-url)
   ↓
Fase 1: Decisión de stack (qué instalar)
   ↓
Fase 2: Recolección de IDs
   ↓
Fase 3: UTM scheme
   ↓
Fase 4: Generación de snippets (head + events + dataLayer)
   ↓
Fase 5: Conversions API server-side
   ↓
Fase 6: Verification checklist
```

### Fase 0: Audit (opcional, requiere --landing-url)

Lanza el agente `instrumentation-engineer` con la URL para que:
1. Fetcheé el HTML público de la landing
2. Detecte tags presentes (Pixel, GA4, GTM, PostHog, Hotjar, Segment, etc.)
3. Identifique anti-patterns: client-only tracking, missing CAPI, missing UTMs en CTAs salientes, missing consent banner si aplica
4. Reporte qué falta en formato accionable

Resultado audit → dirige las decisiones de Fase 1.

### Fase 1: Stack

Pregunta al usuario (si no se especificó `--tools`):

> "Qué stack vas a instrumentar?
> - **A) Mínimo viable** — Pixel + CAPI + UTMs (si solo gastás en Meta)
> - **B) Multi-channel** — Pixel + CAPI + GA4 + UTMs (si también en Google)
> - **C) Full stack** — Pixel + CAPI + GA4 + PostHog + UTMs + GTM
> - **D) Custom** — Yo decido qué instalar"

### Fase 2: IDs

Una pregunta por ID faltante:
- `pixel_id` — Meta Events Manager → Configuración del Pixel
- `meta_capi_token` — System User token con `ads_management` (puede ser el mismo del config aaarrr)
- `ga4_measurement_id` — formato `G-XXXXXXXXXX` (GA4 Admin → Data Streams → Measurement ID)
- `posthog_project_key` — formato `phc_...` (PostHog Settings → Project API Keys)
- `gtm_container_id` — formato `GTM-XXXXXX` (opcional, solo si elegiste consolidación GTM)

### Fase 3: UTM scheme

Define un esquema **antes** de generar snippets — los UTMs deben ser consistentes con cómo Acquisition crea anuncios.

Pregunta al usuario:
1. Canales activos: ¿FB feed, IG reels, IG stories, Google search, Google display, organic, email, partner?
2. ¿Hay un naming convention existente o creo uno?

Genera tabla canónica:

| Canal | utm_source | utm_medium | utm_campaign | utm_content | utm_term |
|---|---|---|---|---|---|
| FB Feed | facebook | cpc | {campaign_name} | {ad_name}_{adset_name} | {targeting} |
| IG Reels | instagram | cpc | {campaign_name} | {ad_name}_reel | {targeting} |
| Google Search | google | cpc | {campaign_name} | {ad_group} | {keyword} |
| Email | newsletter | email | {campaign_slug} | {variant} | - |

`{campaign_name}` y `{ad_name}` se rellenan dinámicamente desde Meta — usar `{{campaign.name}}` y `{{ad.name}}` en el URL Parameters de Meta Ads. Para Google: usar ValueTrack params (`{campaignid}`, `{keyword}`).

### Fase 4: Snippets

Genera 4 archivos en `.aaarrr/instrumentation/`:

**`head-snippet.html`** — Para el `<head>` de la landing:
- Meta Pixel base + PageView
- GA4 gtag init
- PostHog init con autocapture
- Consent banner integration hooks (si aplica)

**`events.js`** — Helper module con funciones:
- `trackLead(payload)` — fire Pixel `Lead` + GA4 `generate_lead` + PostHog `lead_submitted`
- `trackPurchase(payload)` — fire Pixel `Purchase` + GA4 `purchase` (con value, currency, transaction_id) + PostHog `purchase_completed`
- `trackViewContent(payload)` — para activation events
- `getAttributionPayload()` — extrae UTMs de URL y los persiste en localStorage para attribution post-redirect

**`datalayer.js`** — Si elegiste GTM, push estructurado al `dataLayer`:
```js
dataLayer.push({
  event: 'purchase',
  ecommerce: { transaction_id, value, currency, items: [...] },
  utm: { source, medium, campaign, content, term }
});
```

**`utm-builder.html`** — Tool standalone HTML que rellena UTMs según el canal seleccionado (útil para email, partners, links manuales).

### Fase 5: Conversions API (CAPI) server-side

Esto es **lo que más perdés sin instalar**. iOS 14.5 + ad blockers + cookies de terceros bloqueadas = ~30% de events del Pixel client se pierden. CAPI los recupera firando server→Meta directamente.

Genera `capi-server.ts` (Node.js) con:
- Endpoint `/api/track` que recibe events del cliente
- Hash de PII (email, phone, name) con SHA-256 antes de enviar
- POST a `https://graph.facebook.com/v21.0/{pixel_id}/events` con `event_name`, `event_time`, `user_data` (hashed), `custom_data`
- Deduplicación con `event_id` que matchea client-side (evita doble conteo)
- Retry exponencial ante 5xx

Soporte para 3 deployments:
- **Node.js (Express)** — para SaaS con backend propio
- **Cloudflare Worker** — para landings estáticos (Astro/Vercel) sin backend
- **Vercel Edge Function** — equivalente a CF Worker pero en Vercel

### Fase 6: Verification

Genera `verification-checklist.md`:

```markdown
## Pixel client
- [ ] Pixel Helper (Chrome ext) muestra `PageView` al cargar la landing
- [ ] Click en CTA principal dispara `Lead` o `InitiateCheckout`
- [ ] Conversion event (`Purchase`) aparece en Events Manager → Test Events

## CAPI server
- [ ] curl POST manual a `/api/track` retorna `{"events_received": 1}`
- [ ] Events Manager → Test Events recibe el event con `event_source = server`
- [ ] Diagnostics → Event Match Quality muestra ≥6.0 (nombre, email, phone hashed)

## GA4
- [ ] DebugView (GA4) muestra el PageView con UTMs intactos
- [ ] Realtime → Eventos muestra `purchase` cuando se simula

## PostHog
- [ ] Live Events feed muestra `$pageview` y eventos custom
- [ ] Person profile se crea con email correcto

## UTMs
- [ ] Click en ad de prueba con `?utm_source=facebook&utm_medium=cpc&utm_campaign=test`
  retiene los UTMs en redirects internos y aparece en GA4 + PostHog
- [ ] Compra completa atribuye al ad correcto en Meta Ads Manager (after 24-48h)
```

## Output

Por defecto escribe a `.aaarrr/instrumentation/` (relativo al cwd del proyecto del usuario):

```
.aaarrr/instrumentation/
├── head-snippet.html
├── events.js
├── datalayer.js              # solo si --tools incluye gtm
├── capi-server.ts
├── utm-scheme.md
├── utm-builder.html
└── verification-checklist.md
```

Si modo `--what-if`, todo se imprime al chat con prefijo `[SIMULACION]` y no se escribe disco.

## Skill referenciada

Lee la skill completa antes de generar:

```
${CLAUDE_PLUGIN_ROOT}/skills/landing-instrumentation/SKILL.md
```

## Ejemplos

```bash
# Audit + instrumentar landing existente (caso altrupets.app)
/landing-instrument --landing-url https://gobierno.altrupets.app

# Solo Pixel + CAPI (mínimo viable)
/landing-instrument --tools pixel,capi

# Full stack con simulación
/landing-instrument --tools pixel,capi,ga4,posthog --what-if

# Sin URL — instrumentar greenfield
/landing-instrument
```

## Idioma

Output en español. Snippets de código en inglés (variable names, keys). Comentarios en español.

## Referencias relacionadas

- Después de instrumentar, correr `/aaarrr-analyze` para ver primer ciclo de datos reales
- El comando `/landing-page` genera la landing; este la instrumenta. Pueden encadenarse:
  ```bash
  /landing-page --b2g
  /landing-instrument --landing-url https://[deploy-url]
  ```
- La skill `meta-graph-api` documenta cómo enviar events server-side vía Conversions API.
