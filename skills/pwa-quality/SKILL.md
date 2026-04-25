---
name: pwa-quality
description: "Validate and improve a Progressive Web App's quality before shipping to stores. Covers Web App Manifest schema, service worker patterns (Workbox 7 / offline-plugin / vanilla), Lighthouse PWA audits (the 14 PWA checks), HTTPS + mixed content, install prompts (beforeinstallprompt), iOS-specific quirks (apple-touch-icon, status bar, safe-areas), and common pitfalls that block app store submission. Use this skill when the user asks about PWA readiness, manifest validation, service worker setup, Lighthouse PWA score, Workbox, offline-plugin, install prompts, 'is my PWA ready', 'why does my PWA fail Lighthouse', PWA Builder requirements, or before /ship-pwa runs gate validation."
---

# PWA Quality: Manifest, Service Worker, Lighthouse, and Multi-Store Readiness

A PWA is "production-ready" when it passes three independent bars:

1. **Manifest correctness** — `manifest.json` (or `manifest.webmanifest`) is schema-valid and contains the fields stores require.
2. **Service worker reliability** — registered at the right scope, with a caching strategy that survives network failure and version upgrades.
3. **Lighthouse PWA score ≥ 90** — gate for PWA Builder packaging and for Microsoft Store certification.

This skill walks through each bar with concrete checks, common pitfalls, and the reference docs you can paste into the user's project.

## When to invoke

- Before `/app-gtm-release:ship-pwa` runs Gate 1 or Gate 2
- When the user says: "is my PWA ready", "validate my manifest", "Lighthouse PWA failing", "why won't my service worker register", "Workbox setup", "offline-plugin", "iOS install prompt"
- When packaging for Microsoft Store: PWA Builder requires Lighthouse PWA ≥ 80 and a manifest with specific icons (44×44, 50×50, 150×150, 310×310)

## Bar 1 — Manifest Correctness

The Web App Manifest is JSON at the root of your project (typically `/public/manifest.json` or `/manifest.webmanifest`). Linked from HTML via `<link rel="manifest" href="/manifest.webmanifest">`.

### Required fields (PWA Builder + Lighthouse)

| Field | Required by | Notes |
|---|---|---|
| `name` | Lighthouse, MS Store | Full app name (≤ 100 chars). Shown in install prompt. |
| `short_name` | Lighthouse, all stores | ≤ 12 chars. Shown on home screens. |
| `start_url` | Lighthouse | Usually `/`. Add UTM params: `/?utm_source=pwa` |
| `display` | Lighthouse | `standalone` or `fullscreen`. NOT `browser` (fails Lighthouse). |
| `background_color` | Lighthouse | Hex color. Shown during launch. |
| `theme_color` | Lighthouse, iOS | Hex color. Sets browser UI color. |
| `icons` | Lighthouse, all stores | See "Icon requirements" below. |
| `id` | Stores, future-proofing | Unique identifier (e.g., `/?source=pwa`). Prevents accidental duplicates in stores. |

### Icon requirements (the trap)

Most projects fail PWA Builder here. You need:

| Size | Purpose | Where it shows |
|---|---|---|
| `192×192` | Lighthouse minimum | Android home screen |
| `512×512` | Lighthouse minimum + maskable | Android splash screen |
| `512×512` (maskable) | Adaptive Android icons | `purpose: "maskable"` field |
| `1024×1024` | iOS via PWA Builder wrapper | App Store packaging |
| `44×44`, `50×50`, `150×150`, `310×310`, `310×150` | Microsoft Store via PWA Builder | MSIX package generation |

The `maskable` purpose is critical. Two valid declarations:

```json
"icons": [
  { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
  { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
  { "src": "/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
]
```

Test maskable icons at https://maskable.app/ — they should fit inside an 80% safe zone.

### Optional but high-value fields

```json
{
  "categories": ["productivity", "business"],
  "screenshots": [
    { "src": "/screen-narrow.png", "sizes": "390x844", "form_factor": "narrow" },
    { "src": "/screen-wide.png", "sizes": "1280x800", "form_factor": "wide" }
  ],
  "shortcuts": [
    { "name": "New invoice", "url": "/invoices/new", "icons": [{"src": "/icon-shortcut.png", "sizes": "96x96"}] }
  ],
  "prefer_related_applications": false,
  "iarc_rating_id": "abc-123"
}
```

`screenshots` is required by PWA Builder for richer install dialogs and for Microsoft Store listing. `categories` improves store discovery.

### iOS quirks (Apple does not implement Web App Manifest)

iOS Safari ignores most of the manifest. You also need raw HTML meta tags:

```html
<link rel="apple-touch-icon" href="/apple-touch-icon-180.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="My App">
```

Without these, "Add to Home Screen" produces a broken install on iOS.

See **references/manifest-schema.md** for the complete W3C spec with all 30+ fields.

## Bar 2 — Service Worker Reliability

The service worker is the cache + offline + push layer. You have three viable approaches:

### Approach A — Workbox 7 (recommended for most projects)

Google's library. Battle-tested. ~6KB minified.

```js
// service-worker.js (or src/sw.ts with workbox-build)
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";

precacheAndRoute(self.__WB_MANIFEST);

// Static assets (images, fonts) — cache first
registerRoute(
  ({ request }) => request.destination === "image" || request.destination === "font",
  new CacheFirst({ cacheName: "static-assets" })
);

// API calls — network first with fallback
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/"),
  new NetworkFirst({ cacheName: "api", networkTimeoutSeconds: 5 })
);

// HTML — stale-while-revalidate
registerRoute(
  ({ request }) => request.mode === "navigate",
  new StaleWhileRevalidate({ cacheName: "pages" })
);

self.skipWaiting();
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
```

Build integration:
- **Vite**: use `vite-plugin-pwa` (wraps Workbox)
- **Webpack**: use `workbox-webpack-plugin` (`InjectManifest` for custom SW or `GenerateSW` for boilerplate)
- **Next.js**: use `next-pwa` package or App Router's `manifest.ts` + manual SW registration
- **CRA / vanilla**: use `workbox-cli` (`workbox generateSW workbox-config.js`)

### Approach B — offline-plugin (legacy / Webpack only)

`offline-plugin` is older and less maintained but simpler if you're already on Webpack and don't need Workbox's full feature set. Does precaching well, runtime caching is limited.

```js
// webpack.config.js
const OfflinePlugin = require("offline-plugin");
module.exports = {
  plugins: [
    new OfflinePlugin({ ServiceWorker: { events: true }, AppCache: false })
  ]
};
```

### Approach C — Vanilla service worker

Roll your own. Only recommended if you're shipping a tiny app or have specific needs Workbox can't meet (e.g., custom IndexedDB sync logic, server push handling).

### Service worker scope and registration

The SW file's location determines its scope. A file at `/service-worker.js` controls the entire origin. A file at `/app/service-worker.js` only controls `/app/*` — usually wrong for SPAs.

Register from your main entry:

```js
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js")
      .then((reg) => console.log("SW registered, scope:", reg.scope))
      .catch((err) => console.error("SW registration failed:", err));
  });
}
```

If the SW must control a path higher than its file location, use the `Service-Worker-Allowed` HTTP response header.

### Update strategy (the second-most-common bug)

By default, a new SW activates on the next page navigation AFTER all old tabs are closed. This creates "ghost" old versions running for hours.

Force immediate updates with `skipWaiting` + `clients.claim()`:

```js
self.addEventListener("install", (event) => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
```

But this can break long-running app sessions if the new code is incompatible with cached state. Trade-off: prefer the user-prompted update pattern for production:

```js
// In your app
navigator.serviceWorker.addEventListener("controllerchange", () => {
  // Show toast: "App updated. Refresh to use the new version?"
});
```

See **references/workbox-recipes.md** for production patterns: precaching with cache busting, stale-while-revalidate for HTML, background sync, push notifications.

## Bar 3 — Lighthouse PWA Audit

Run from Chrome DevTools (Lighthouse tab) or CLI: `npx lighthouse https://example.com --only-categories=pwa --output=html --output-path=./lighthouse-pwa.html`.

The PWA category contains 14 audits. The first 6 are blockers; the rest improve quality.

### Blocker audits (failing any blocks store submission)

| Audit | What it checks |
|---|---|
| Installable manifest | Manifest is linked, contains required fields, icons are reachable |
| Service worker registered | Active SW controls the page on load |
| HTTPS | Site is served over HTTPS (or localhost) |
| Redirects HTTP to HTTPS | If HTTP variant exists, must 301 to HTTPS |
| Viewport meta tag | `<meta name="viewport" content="width=device-width, initial-scale=1">` |
| Splash screen configured | `theme_color` + `background_color` + 512×512 icon present |

### Quality audits (improve score, don't block)

| Audit | What it checks |
|---|---|
| Apple touch icon | `<link rel="apple-touch-icon">` ≥ 180×180 |
| Themed omnibox | `<meta name="theme-color">` matches manifest |
| Maskable icon | At least one icon with `purpose: "maskable"` |
| Content sized correctly for viewport | No horizontal scroll on mobile |
| Page transitions don't feel like they block on the network | TTI < 5s on slow 4G |
| Each page has a URL | SPA routing produces shareable URLs |
| Cross-browser compatibility | Site works on Safari, Firefox, Edge, not just Chrome |
| Page load is fast enough on mobile networks | LCP < 2.5s, FID < 100ms, CLS < 0.1 |

### Common Lighthouse failures and fixes

| Failure | Cause | Fix |
|---|---|---|
| "Manifest doesn't have a maskable icon" | No icon with `purpose: "maskable"` | Add a 512×512 icon with masking-safe artwork |
| "Service worker doesn't control the page" | SW registered too late / scope mismatch | Move registration to `<head>` or check scope |
| "Page redirects from HTTP to HTTPS" | Site only on HTTP | Add HTTPS or remove HTTP variant |
| "Themed omnibox" | `theme_color` missing in manifest OR meta | Set both: manifest `theme_color` + `<meta name="theme-color">` |
| "Splash screen not configured" | Missing fields | Add `name`, `theme_color`, `background_color`, 512×512 icon |
| "Web app manifest meets installability" but install button doesn't appear | Engagement heuristic not met (Chrome) | User must visit twice in 5 minutes |

See **references/lighthouse-pwa-checks.md** for full audit details with code remediations.

## Microsoft Store Specifics (for /ship-msstore handoff)

If the user is targeting Microsoft Store via PWA Builder, additional requirements:

- Lighthouse PWA score ≥ 80
- All Windows-specific icon sizes (44×44, 50×50, 150×150, 310×310, 310×150)
- Privacy policy URL in `<meta name="privacy-policy">` or app metadata
- Age rating questionnaire answered in Partner Center
- App must work without network for at least the home page

## Output

When this skill runs as part of `/ship-pwa` Gate 1 or Gate 2, produce a structured report:

```markdown
## PWA Quality Report — {project name}

### Manifest
- [✅/⚠️/❌] Required fields present
- [✅/⚠️/❌] Icons (192, 512, maskable, 1024 for iOS)
- [✅/⚠️/❌] iOS meta tags

### Service Worker
- [✅/⚠️/❌] Registered + correct scope
- [✅/⚠️/❌] Caching strategy ({Workbox/offline-plugin/vanilla})
- [✅/⚠️/❌] Update strategy (skipWaiting / user prompt)

### Lighthouse PWA
- Score: {0-100}
- Blockers: {count}
- Quality issues: {count}

### Recommendations
1. {top action}
2. {next}
3. {next}

### Ready for /ship-pwa Gate 3 (PWA Builder packaging)?
{Yes / No — block reason}
```

Save to `./go-to-market/pwa/quality-report.md` so subsequent gates can resume from this assessment.
