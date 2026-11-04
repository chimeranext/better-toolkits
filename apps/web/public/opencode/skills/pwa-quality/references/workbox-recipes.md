# Workbox 7 — Production Recipes

Tested patterns for service worker logic. Copy-paste with confidence.

## Setup by build tool

### Vite (`vite-plugin-pwa`)

```bash
npm install -D vite-plugin-pwa
```

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "service-worker.ts",
      registerType: "prompt",
      manifest: { /* or load from public/manifest.webmanifest */ },
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,svg,png,webp,woff2}"]
      }
    })
  ]
});
```

### Webpack (`workbox-webpack-plugin`)

```bash
npm install -D workbox-webpack-plugin
```

```js
// webpack.config.js
const { InjectManifest } = require("workbox-webpack-plugin");

module.exports = {
  plugins: [
    new InjectManifest({
      swSrc: "./src/service-worker.ts",
      swDest: "service-worker.js"
    })
  ]
};
```

### Next.js — `next-pwa` (Pages Router) or manual SW (App Router)

For App Router:
1. Place `service-worker.ts` in `app/` and import workbox
2. Build with `workbox-build` postbuild script
3. Register from a `<Script>` tag in your layout

For Pages Router:
```bash
npm install next-pwa
```

```js
// next.config.js
const withPWA = require("next-pwa")({ dest: "public" });
module.exports = withPWA({ /* your config */ });
```

### Vanilla / CRA (`workbox-cli`)

```bash
npm install -g workbox-cli
workbox wizard  # interactive setup
workbox generateSW workbox-config.js
```

## Recipe 1 — Precaching + page navigation

Most common pattern: precache build artifacts, serve HTML stale-while-revalidate.

```ts
// service-worker.ts
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";

// __WB_MANIFEST is replaced at build time with the asset list
precacheAndRoute(self.__WB_MANIFEST);

// HTML pages — stale-while-revalidate
registerRoute(
  ({ request }) => request.mode === "navigate",
  new StaleWhileRevalidate({
    cacheName: "pages",
    plugins: [
      // Limit to 50 entries, expire after 30 days
      new (require("workbox-expiration").ExpirationPlugin)({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60
      })
    ]
  })
);

self.skipWaiting();
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
```

## Recipe 2 — API caching with timeout fallback

Network-first with 5-second timeout — important for offline support without blocking forever.

```ts
import { NetworkFirst } from "workbox-strategies";
import { registerRoute } from "workbox-routing";

registerRoute(
  ({ url }) => url.pathname.startsWith("/api/"),
  new NetworkFirst({
    cacheName: "api",
    networkTimeoutSeconds: 5,
    plugins: [
      new (require("workbox-cacheable-response").CacheableResponsePlugin)({
        statuses: [0, 200]  // include opaque responses
      })
    ]
  })
);
```

## Recipe 3 — Static assets (images, fonts) — cache-first with size cap

```ts
import { CacheFirst } from "workbox-strategies";

registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images",
    plugins: [
      new (require("workbox-expiration").ExpirationPlugin)({
        maxEntries: 100,
        maxAgeSeconds: 60 * 24 * 60 * 60,
        purgeOnQuotaError: true
      }),
      new (require("workbox-cacheable-response").CacheableResponsePlugin)({
        statuses: [0, 200]
      })
    ]
  })
);

registerRoute(
  ({ request }) => request.destination === "font",
  new CacheFirst({ cacheName: "fonts" })
);
```

## Recipe 4 — Background sync (offline writes)

When the user submits a form offline, queue it and replay when online.

```ts
import { BackgroundSyncPlugin } from "workbox-background-sync";
import { NetworkOnly } from "workbox-strategies";

const bgSync = new BackgroundSyncPlugin("invoiceQueue", {
  maxRetentionTime: 24 * 60  // 24 hours in minutes
});

registerRoute(
  ({ url }) => url.pathname === "/api/invoices",
  new NetworkOnly({ plugins: [bgSync] }),
  "POST"
);
```

The browser triggers a `sync` event when network returns. Workbox replays the queued requests.

## Recipe 5 — Update notification (the "right" update flow)

Don't `skipWaiting` blindly. Tell the user a new version is ready.

```ts
// In the SW
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
```

```ts
// In your app code
import { registerSW } from "virtual:pwa-register";  // vite-plugin-pwa export

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("App updated. Reload to use the new version?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("App ready to work offline");
  }
});
```

## Recipe 6 — Push notifications

```ts
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? { title: "Notification" };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/badge-72.png",
      data: { url: data.url }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      const target = event.notification.data?.url || "/";
      const existing = clients.find((c) => c.url.includes(target));
      if (existing) return existing.focus();
      return self.clients.openWindow(target);
    })
  );
});
```

You also need server-side: VAPID keys, push subscription endpoint storage, message sending via Web Push Protocol or a service like FCM/OneSignal.

## Recipe 7 — Handling SW errors gracefully

```ts
self.addEventListener("error", (event) => {
  console.error("SW error:", event.error);
  // Send to error tracking
});

self.addEventListener("unhandledrejection", (event) => {
  console.error("SW unhandled promise:", event.reason);
});
```

In your app, listen for fetch failures and fallback:

```ts
fetch("/api/data").catch(() => {
  // Show offline UI
});
```

## Cache management

### Clear specific cache

```ts
self.addEventListener("message", (event) => {
  if (event.data?.type === "CLEAR_API_CACHE") {
    event.waitUntil(caches.delete("api"));
  }
});
```

### Force update of precached entry

Increment your build version. Workbox detects the change and re-precaches.

### Inspect caches in DevTools

Application → Cache Storage. You can manually delete, inspect, or replay individual entries.

## Common bugs

| Symptom | Cause | Fix |
|---|---|---|
| SW updates only after closing all tabs | No `skipWaiting` | Add `self.skipWaiting()` in install handler |
| Old code runs forever | SW caching `index.html` aggressively | Use stale-while-revalidate, not cache-first, for HTML |
| Offline page never shows | No fallback handler | Add a navigation route with offline fallback HTML |
| API returns stale data after login | Auth tokens cached | Exclude auth-bearing requests from caching, or use `cacheKey` to bust |
| `__WB_MANIFEST` undefined | `injectManifest` not configured | Switch from `generateSW` to `injectManifest` mode |
| Range requests fail (video/audio) | Default strategies don't handle Range | Add `RangeRequestsPlugin` |

## Resources

- [Workbox docs](https://developer.chrome.com/docs/workbox/) — official
- [Workbox modules reference](https://developer.chrome.com/docs/workbox/modules/) — full API
- [PWA Stats](https://www.pwastats.com/) — case studies of working PWAs
