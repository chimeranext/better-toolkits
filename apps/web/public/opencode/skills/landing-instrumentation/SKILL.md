---
name: landing-instrumentation
version: 1.0.0
description: >
  This skill should be used when the user asks to "instrument a landing",
  "wire up tracking", "install Pixel", "install GA4", "install PostHog",
  "set up Conversions API", "CAPI server-side", "fix attribution", "no
  estoy midiendo conversiones", "instrumentar landing", "instalar pixel",
  "no tengo trackeo", "/landing-instrument", or mentions a deployed landing
  that lacks Meta Pixel, GA4, PostHog, UTM scheme or Conversions API.

  Auto-activates when the user complains about: missing data en AAARRR
  dashboards, attribution gaps, iOS 14.5 Pixel signal loss, can't see
  conversions in Meta Ads, ad blockers eating events.

  Covers a 4-layer attribution stack: Meta Pixel (client) → Conversions API
  (server) → GA4 → PostHog → UTM scheme. Outputs working snippets, server
  code, and verification commands. NOT a substitute for proper landing-page
  design — pair with `/landing-page` upstream.
---

# Landing Instrumentation — 4-Layer Attribution Stack

Sin tracking, AAARRR opera con datos imaginados. El objetivo de este skill es dejar instalado el stack mínimo para que cada capa de AAARRR consuma señales reales.

## Idioma

Documento en español. Snippets de código en inglés con comentarios en español.

## La regla de oro

> **Si no podés validar un evento en menos de 60 segundos con un comando o un click, no está instalado.**

Toda integración termina con un verification step. Sin verificación, asumís y te equivocás.

---

## Stack de 4 capas

```
┌─────────────────────────────────────────────────────────────────┐
│ Capa 1: Meta Pixel (client-side)                                │
│  → Events firan desde el browser                                │
│  → Pierde 30-50% en iOS 14.5+, ad blockers, cookies bloqueadas  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ duplica con event_id
┌─────────────────────────────────────────────────────────────────┐
│ Capa 2: Meta Conversions API (server-side)                      │
│  → Events firan desde el backend                                │
│  → Recupera lo que el client pierde                             │
│  → Hashing de PII obligatorio                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Capa 3: GA4 (analytics general)                                 │
│  → Multi-channel attribution, audiencias, exploraciones         │
│  → Server-side via Measurement Protocol (opcional)              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Capa 4: PostHog (product analytics)                             │
│  → Behavioral, session recordings, feature flags                │
│  → Útil post-signup; menos para landings puras                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Cross-cutting: UTM scheme                                       │
│  → Define source/medium/campaign para cada canal                │
│  → Persistir UTMs de la primera visita en localStorage          │
│  → Adjuntar al payload de cada evento de conversión             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Capa 1: Meta Pixel (client-side)

### Snippet base — agregar al `<head>` justo antes de `</head>`

```html
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'PIXEL_ID_HERE');
fbq('track', 'PageView');
</script>
<noscript>
  <img height="1" width="1" style="display:none"
       src="https://www.facebook.com/tr?id=PIXEL_ID_HERE&ev=PageView&noscript=1"/>
</noscript>
<!-- End Meta Pixel Code -->
```

### Standard events (preferí estos sobre custom)

| Cuándo | Event | Payload mínimo |
|---|---|---|
| Carga de cualquier página | `PageView` | (auto, no params) |
| Vio detalle de producto | `ViewContent` | `{ content_ids, content_type, value, currency }` |
| Submitió form de lead | `Lead` | `{ value, currency }` |
| Inició checkout | `InitiateCheckout` | `{ value, currency, num_items }` |
| Agregó pago | `AddPaymentInfo` | `{ value, currency }` |
| Compra completada | `Purchase` | `{ value, currency, content_ids }` (mandatory: value+currency) |

**Ejemplo Lead** (form de demo):
```js
document.querySelector('#demo-form').addEventListener('submit', () => {
  fbq('track', 'Lead', {
    content_name: 'Demo Request',
    value: 0,
    currency: 'USD'
  }, { eventID: generateEventId() });  // ← crítico para deduplicación con CAPI
});

function generateEventId() {
  return crypto.randomUUID();  // o cualquier UUID v4
}
```

### Deduplicación con CAPI (event_id)

El Pixel client y la Conversions API server pueden firar **el mismo evento** dos veces. Meta deduplica si:
- Ambos eventos tienen el mismo `event_id` (también conocido como `eventID` en client)
- Llegan dentro de 48h una de la otra
- Coinciden en `event_name` y match-keys

**Sin event_id no hay deduplicación → conversiones contadas 2x → métricas infladas.**

Implementación:
```js
// Client-side
const eventId = crypto.randomUUID();
fbq('track', 'Purchase', { value: 99.99, currency: 'USD' }, { eventID: eventId });

// Enviar a tu backend con el mismo eventId
fetch('/api/track', {
  method: 'POST',
  body: JSON.stringify({
    event_name: 'Purchase',
    event_id: eventId,  // ← mismo valor
    user_data: { email: 'user@example.com' },
    custom_data: { value: 99.99, currency: 'USD' }
  })
});
```

---

## Capa 2: Meta Conversions API (server-side)

**Por qué es crítica.** Sin CAPI, perdés:
- ~30% de events en iOS 14.5+ (ATT framework)
- ~15-25% en Chrome con ad blockers (uBlock, AdGuard)
- ~10% en Safari por ITP (Intelligent Tracking Prevention)

Combinado, en LATAM mobile-heavy: **~40-50% del Pixel client está roto**. Meta no optimiza el algoritmo correctamente, y vos creés que el CPA es alto cuando en realidad la mitad de las conversiones no se atribuyen.

### Implementación Node.js (Express / Next.js API Route)

`api/track.ts`:

```typescript
import { createHash } from 'node:crypto';

const PIXEL_ID = process.env.META_PIXEL_ID!;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN!;
const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE; // para Test Events, omitir en prod

export async function POST(req: Request) {
  const body = await req.json();
  const {
    event_name,
    event_id,
    event_time = Math.floor(Date.now() / 1000),
    user_data = {},
    custom_data = {},
    event_source_url,
  } = body;

  // Hash PII (Meta exige SHA-256 de email, phone, name, etc.)
  const hash = (s: string) =>
    createHash('sha256').update(s.toLowerCase().trim()).digest('hex');

  const userData: Record<string, string | string[]> = {
    client_ip_address: req.headers.get('x-forwarded-for')?.split(',')[0] ?? '',
    client_user_agent: req.headers.get('user-agent') ?? '',
  };
  if (user_data.email) userData.em = [hash(user_data.email)];
  if (user_data.phone) userData.ph = [hash(user_data.phone.replace(/\D/g, ''))];
  if (user_data.fbp) userData.fbp = user_data.fbp;       // Pixel cookie (_fbp)
  if (user_data.fbc) userData.fbc = user_data.fbc;       // Pixel click ID (_fbc)

  const payload = {
    data: [{
      event_name,
      event_time,
      event_id,       // ← deduplicación con client
      event_source_url,
      action_source: 'website',
      user_data: userData,
      custom_data,
    }],
    ...(TEST_EVENT_CODE && { test_event_code: TEST_EVENT_CODE }),
  };

  const url = `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('CAPI error', res.status, err);
    return new Response(JSON.stringify({ error: 'capi_failed' }), { status: 502 });
  }

  const json = await res.json();
  return new Response(JSON.stringify(json), { status: 200 });
}
```

### Implementación Cloudflare Worker (para landings estáticos)

Si tu landing es Astro / Vercel static / GitHub Pages, no tenés backend. Usá un Cloudflare Worker (gratis hasta 100k requests/día):

`worker.ts`:
```typescript
export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    // CORS para que la landing pueda firar
    const origin = req.headers.get('origin');
    const corsOk = origin && env.ALLOWED_ORIGINS.split(',').includes(origin);
    if (!corsOk) return new Response('CORS', { status: 403 });

    const body = await req.json();
    // ... mismo flujo que el ejemplo Node arriba ...
    // Hashing inline porque Workers no tiene node:crypto, usá Web Crypto API:

    const hash = async (s: string) => {
      const buf = new TextEncoder().encode(s.toLowerCase().trim());
      const digest = await crypto.subtle.digest('SHA-256', buf);
      return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
    };

    // Build payload, fetch a graph.facebook.com, return JSON
    // ...
  },
};
```

### Cookies del Pixel (`_fbp`, `_fbc`)

El Pixel setea dos cookies:
- `_fbp` — browser ID, persiste 90 días
- `_fbc` — click ID, solo si el user llegó vía un anuncio (URL contiene `fbclid`)

Estas cookies son **el match-key más importante** para que CAPI conecte el server event con el browser que originó el click. **Pasar siempre `fbp` y `fbc` desde el client al backend** cuando firás un evento server-side.

```js
// Client
function getCookie(name) {
  return document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))?.[2];
}

// Capturar fbclid de URL y formatear como _fbc
const fbclid = new URLSearchParams(location.search).get('fbclid');
if (fbclid) {
  document.cookie = `_fbc=fb.1.${Date.now()}.${fbclid}; path=/; max-age=7776000`;
}

fetch('/api/track', {
  method: 'POST',
  body: JSON.stringify({
    event_name: 'Lead',
    event_id: eventId,
    user_data: {
      email: 'user@example.com',
      fbp: getCookie('_fbp'),
      fbc: getCookie('_fbc'),
    },
  }),
});
```

### Test Events (debugging)

En Events Manager → Test Events, copiar el `test_event_code` y pasarlo en cada CAPI request mientras debugging. Los events aparecen en Test Events, NO en el dashboard normal — útil porque podés probar sin contaminar métricas.

**Importante**: en producción, omitir `test_event_code`. Si lo dejás, los events quedan en Test Events y no se atribuyen al ad.

### Event Match Quality (EMQ)

Meta puntúa la calidad del match con un score 1-10. Subir a ≥7 mejora la atribución dramáticamente.

Match-keys ordenados por valor:
1. `em` (email hashed) — el más fuerte
2. `ph` (phone hashed)
3. `fbp` + `fbc` (cookies)
4. `client_ip_address` + `client_user_agent`
5. `external_id` (tu user ID, hashed)
6. `fn`/`ln` (first/last name hashed)
7. `db` (date of birth hashed)

Mandar todos los que tengas. Cada uno suma al score.

---

## Capa 3: GA4

### Snippet base

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXX', {
    send_page_view: true,
    cookie_flags: 'SameSite=None;Secure'  // necesario para iframe embeds
  });
</script>
```

### Standard ecommerce events

GA4 espera nombres específicos para ecommerce; usalos.

```js
// Lead
gtag('event', 'generate_lead', {
  currency: 'USD',
  value: 0,
});

// Purchase
gtag('event', 'purchase', {
  transaction_id: 'T-12345',
  currency: 'USD',
  value: 99.99,
  items: [
    { item_id: 'sku_001', item_name: 'Plan Pro', price: 99.99, quantity: 1 }
  ],
});
```

### Server-side via Measurement Protocol (opcional)

Si querés mandar events server-side (compatible con CAPI):

```typescript
const MEASUREMENT_ID = 'G-XXXXXXXX';
const API_SECRET = process.env.GA4_API_SECRET!; // GA4 Admin → Data Streams → Measurement Protocol

await fetch(
  `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`,
  {
    method: 'POST',
    body: JSON.stringify({
      client_id: cookies.get('_ga')?.split('.').slice(2).join('.') ?? crypto.randomUUID(),
      events: [{
        name: 'purchase',
        params: {
          transaction_id: 'T-12345',
          currency: 'USD',
          value: 99.99,
          items: [{ item_id: 'sku_001', item_name: 'Plan Pro', price: 99.99 }],
        },
      }],
    }),
  }
);
```

---

## Capa 4: PostHog

### Snippet base

```html
<script>
!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init bs ws ge fs capture De calculateEventProperties $s register register_once register_for_session unregister unregister_for_session Ps getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty Es $s createPersonProfile Is opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing Ss debug xs getPageViewId captureTraceFeedback captureTraceMetric".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
posthog.init('phc_PROJECT_KEY_HERE', {
  api_host: 'https://us.i.posthog.com',  // o https://eu.i.posthog.com para EU region
  capture_pageview: true,
  capture_pageleave: true,
  autocapture: true,                      // captura clicks, form submits automáticamente
});
</script>
```

### Identificar usuarios después de login

```js
// Después de auth
posthog.identify(user.id, {
  email: user.email,
  name: user.name,
  plan: user.plan,
});

// Group analytics (B2B)
posthog.group('company', user.company_id, {
  name: user.company_name,
  industry: user.company_industry,
});
```

### Custom events (cuando autocapture no alcanza)

```js
posthog.capture('demo_request_submitted', {
  source_landing: 'gobierno',
  industry: form.industry,
  company_size: form.company_size,
});
```

---

## Capa 5: UTM scheme canónico

### Esquema base

| Parámetro | Significado | Ejemplo |
|---|---|---|
| `utm_source` | Plataforma de origen | `facebook`, `instagram`, `google`, `newsletter`, `direct` |
| `utm_medium` | Tipo de tráfico | `cpc`, `email`, `organic`, `social`, `referral` |
| `utm_campaign` | Nombre de campaña | `q2-launch`, `gobierno-onboarding` |
| `utm_content` | Variante creativa / placement | `video-30s`, `carousel-3`, `feed-vs-reels` |
| `utm_term` | Keyword o targeting | `lookalike-buyers`, `interest-pet-care` |

### Custom AAARRR params (extender)

| Parámetro | Significado | Ejemplo |
|---|---|---|
| `utm_funnel_stage` | Etapa AAARRR | `tof`, `mof`, `bof` |
| `utm_audience` | Segmento | `cold-lal-buyers`, `warm-engagers-90d` |
| `utm_creative_id` | ID exacto del ad | `23854...` (Meta ad_id) |

### Naming convention

Lowercase + kebab-case. Ejemplo:
```
utm_source=facebook
utm_medium=cpc
utm_campaign=q2-launch
utm_content=video-30s_buyers-lal
utm_term=interest-eco-products
utm_funnel_stage=tof
utm_audience=cold-lal-buyers-3pct
utm_creative_id=23854001234567890
```

### Persistencia cross-redirect

Los UTMs se pierden si el usuario navega a otra página interna sin que vos los preserves. Solución: guardar en `localStorage` la primera vez que aparecen, y reusarlos al firar conversion events.

```js
// On every page load
(function() {
  const params = new URLSearchParams(location.search);
  const utm = {};
  ['source', 'medium', 'campaign', 'content', 'term', 'funnel_stage', 'audience', 'creative_id']
    .forEach(k => {
      const v = params.get(`utm_${k}`);
      if (v) utm[k] = v;
    });

  if (Object.keys(utm).length > 0) {
    // First touch: solo seteá si no existe ya
    if (!localStorage.getItem('utm_first_touch')) {
      localStorage.setItem('utm_first_touch', JSON.stringify({ ...utm, ts: Date.now() }));
    }
    // Last touch: siempre actualizá
    localStorage.setItem('utm_last_touch', JSON.stringify({ ...utm, ts: Date.now() }));
  }
})();

// On conversion
function getAttributionPayload() {
  const first = JSON.parse(localStorage.getItem('utm_first_touch') ?? '{}');
  const last = JSON.parse(localStorage.getItem('utm_last_touch') ?? '{}');
  return {
    first_touch: first,
    last_touch: last,
  };
}
```

### URL Parameters automáticos en Meta Ads

En Meta Ads Manager → Ad → Tracking → URL Parameters, pegá:
```
utm_source=facebook&utm_medium=cpc&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}&utm_creative_id={{ad.id}}
```

Meta rellena `{{...}}` automáticamente con el nombre real de la campaña/adset/ad. **Nunca hardcodear** `utm_campaign=launch` — perdés granularidad.

Para Google Ads: `?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={creative}&utm_term={keyword}`

---

## Capa 6 (opcional): GTM consolidación

Si vas a tener 4+ tags, considerá centralizarlos en Google Tag Manager para evitar editar el `<head>` cada vez.

```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
<!-- End Google Tag Manager -->
```

Y en GTM Workspace creás los tags individualmente (Pixel, GA4, PostHog) con triggers basados en `dataLayer.push` events.

`dataLayer.push` canónico:
```js
dataLayer.push({
  event: 'purchase',
  ecommerce: {
    transaction_id: 'T-12345',
    value: 99.99,
    currency: 'USD',
    items: [...],
  },
  utm: getAttributionPayload(),
  user: { id: user.id, email_hashed: hashedEmail },
});
```

**Trade-off**: GTM agrega ~30-50KB de JS y un nivel de indirección. Para landings minimalistas (1-3 tags), instalación directa es más simple.

---

## Privacy & Compliance

### GDPR (EU users)

Si la landing recibe tráfico EU, **consent banner obligatorio antes** de cargar Pixel/GA4/PostHog. Implementación con `cookiebot` o similar:

```js
// Bloquear tags hasta consent
if (Cookiebot.consent.statistics) {
  // Cargar GA4
  loadScript('https://www.googletagmanager.com/gtag/js?id=G-XXX');
}
if (Cookiebot.consent.marketing) {
  // Cargar Pixel
  loadScript('https://connect.facebook.net/en_US/fbevents.js');
}
```

### Hashing de PII

Para **CAPI server-side** y **Measurement Protocol**, hashear con SHA-256 (lowercase, trim) ANTES de mandar:

```js
const hash = (s) => crypto.subtle.digest('SHA-256',
  new TextEncoder().encode(s.toLowerCase().trim())
);
```

NUNCA mandar email/phone en plaintext a Meta o Google. Aunque digan que lo hashean del lado de ellos, **vos hasheás del tuyo**.

### Nunca en URL params

NUNCA poner email/phone/name en query string. GA, server logs, y referrers los capturan. Si tenés un form de signup, POSTearlo, no GETearlo.

### Children's data (COPPA)

Si la audiencia incluye <13 años, no se puede usar Pixel ni GA4 sin parental consent. Buscar herramientas COPPA-compliant.

---

## Verification por capa

### Pixel client
1. Instalar Chrome extension **Meta Pixel Helper**
2. Abrir landing
3. Ver: PageView fired, Pixel ID matches, no errors

### CAPI server
```bash
# Test event manual
curl -X POST "https://graph.facebook.com/v21.0/${PIXEL_ID}/events" \
  -H "Content-Type: application/json" \
  -d "{
    \"data\": [{
      \"event_name\": \"PageView\",
      \"event_time\": $(date +%s),
      \"action_source\": \"website\",
      \"event_source_url\": \"https://your-landing.com\",
      \"user_data\": {\"client_user_agent\": \"curl-test\"}
    }],
    \"test_event_code\": \"TEST12345\",
    \"access_token\": \"${META_ACCESS_TOKEN}\"
  }"
# Esperado: {"events_received":1, "messages":[], "fbtrace_id":"..."}
```

Después: Events Manager → Test Events → ver el event con `event_source = server`.

### GA4
1. Activar DebugView: agregar `?debug_mode=true` a la URL
2. GA4 Admin → DebugView → ver eventos en tiempo real
3. Realtime → Events → contadores deben moverse al firar manualmente

### PostHog
1. PostHog → Activity → Live
2. Navegar la landing — debería aparecer `$pageview` instantáneo
3. Forzar custom event: `posthog.capture('test_event')` en console
4. Ver el event en Live feed

### UTMs
1. Abrir landing con `?utm_source=facebook&utm_medium=cpc&utm_campaign=test`
2. Click en CTA principal
3. En la página de destino, abrir DevTools → Application → Local Storage
4. Confirmar `utm_first_touch` y `utm_last_touch` están seteados con el JSON correcto
5. Completar conversion: ver que el payload de Pixel/GA4/PostHog incluye los UTMs

---

## Anti-patterns frecuentes

| Anti-pattern | Síntoma | Fix |
|---|---|---|
| Pixel sin CAPI | iOS users no atribuyen, CPA reportado 1.5x el real | Instalar Capa 2 |
| `event_id` ausente | Conversiones contadas 2x cuando CAPI + Pixel firan a la vez | Generar UUID en client, pasarlo a server |
| PII en URL | Email aparece en GA referer; GDPR violation | Migrar form a POST, scrub URLs |
| UTMs solo en landing | Click→signup pierde atribución | localStorage persistence |
| Conversion event en thank-you page | Race condition con redirect → 30% no firan | Firar antes del redirect, usar `sendBeacon` |
| Hardcoded `utm_campaign=launch` | Meta sobreescribe nombres dinámicos | Usar `{{campaign.name}}` en URL Parameters |
| Test event code en prod | Eventos no atribuidos al algoritmo | Solo usar test_event_code en debugging |
| Multiple Pixel IDs | Doble disparo, métricas infladas | Auditar `<head>` por `fbq('init',...)` duplicados |
| Sin consent banner en EU | Multas GDPR | Bloquear tags hasta consent explícito |
| Pixel cargado en `<body>` | Carga tarde, pierde events de bounces tempranos | Mover a `<head>` |

---

## Wiring por stack

### Astro

`src/components/Tracking.astro`:
```astro
---
const { pixelId, ga4Id, posthogKey } = Astro.props;
---
<!-- Insertar los snippets aquí, parametrizados con props -->
```

`src/layouts/Layout.astro`:
```astro
<head>
  <Tracking
    pixelId={import.meta.env.PUBLIC_PIXEL_ID}
    ga4Id={import.meta.env.PUBLIC_GA4_ID}
    posthogKey={import.meta.env.PUBLIC_POSTHOG_KEY}
  />
</head>
```

### Next.js (App Router)

`app/components/analytics.tsx`:
```tsx
'use client';
import Script from 'next/script';

export function Analytics() {
  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){...}(...);
          fbq('init', '${process.env.NEXT_PUBLIC_PIXEL_ID}');
          fbq('track', 'PageView');`}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_ID}`} strategy="afterInteractive" />
      {/* ... */}
    </>
  );
}
```

CAPI endpoint en `app/api/track/route.ts` (ver código Capa 2 arriba).

### Plain HTML / static (GitHub Pages, Netlify, S3+CF)

Insertar snippets directamente en cada página HTML. CAPI vive en Cloudflare Worker (sin backend propio).

### WordPress / Wix / Squarespace

- WordPress: plugin "PixelYourSite" para Pixel + CAPI
- Wix: built-in Marketing Tools → Pixel & GA4
- Squarespace: built-in en Settings → Marketing → Tracking

(Pagados, pero válidos si no querés mantener código.)

---

## Output esperado al usar este skill

Cuando el comando `/landing-instrument` ejecuta este skill, espera generar:

```
.aaarrr/instrumentation/
├── head-snippet.html          # Tags para <head>, parametrizados
├── events.js                  # Helpers trackLead/trackPurchase/getAttributionPayload
├── datalayer.js               # (opcional) Si elegiste GTM
├── capi-server.ts             # Server-side endpoint
├── utm-scheme.md              # Tabla canónica de UTMs por canal
├── utm-builder.html           # Tool standalone para generar URLs con UTMs
└── verification-checklist.md  # Pasos de validación por capa
```

Cada archivo debe ser **copy-paste-ready** — ningún `[YOUR_VALUE_HERE]` que el usuario tenga que adivinar. Todos los IDs vienen de la config o de las preguntas del wizard.

---

## Referencias

- Meta Pixel Reference: https://developers.facebook.com/docs/meta-pixel/reference
- Conversions API Reference: https://developers.facebook.com/docs/marketing-api/conversions-api
- GA4 Measurement Protocol: https://developers.google.com/analytics/devguides/collection/protocol/ga4
- PostHog JS SDK: https://posthog.com/docs/libraries/js
- Cookie Consent (RGPD): https://www.cookiebot.com/en/gdpr-cookie-compliance/
