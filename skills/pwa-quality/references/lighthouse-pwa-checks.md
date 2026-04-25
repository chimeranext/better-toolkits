# Lighthouse PWA Audits — Detailed Checks

Lighthouse 10+ has 14 PWA audits. The first 6 are **install blockers** — failing any prevents browsers from offering the install prompt and prevents PWA Builder from packaging.

## How to run

```bash
# CLI (installs locally if not global)
npx lighthouse https://example.com \
  --only-categories=pwa \
  --output=html --output=json \
  --output-path=./lighthouse-pwa
```

```bash
# In a CI pipeline (Chrome headless)
npx lighthouse-ci collect --url=https://example.com --settings.onlyCategories=pwa
```

In Chrome DevTools: **F12 → Lighthouse tab → check "Progressive Web App" → Generate Report**.

## Blocker audits (must pass)

### 1. Installable manifest

**Checks:**
- `<link rel="manifest">` exists and points to a reachable file
- Manifest is valid JSON
- Required fields present: `name`, `short_name`, `start_url`, `icons` (≥ 1 with size ≥ 144×144), `display: standalone | fullscreen | minimal-ui`

**Fix:** See `references/manifest-schema.md` for the complete required field list.

### 2. Service worker registered

**Checks:**
- `navigator.serviceWorker.controller` is non-null when the audit runs
- The SW responds to fetch events for `start_url`

**Fix:**
```html
<script>
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/service-worker.js");
    });
  }
</script>
```

If your SW IS registered but Lighthouse fails this audit:
- Check the SW is at the same origin
- Check no fetch handler errors in DevTools → Application → Service Workers
- Confirm scope covers `start_url`

### 3. HTTPS

**Checks:**
- Site is loaded via `https://` (or `localhost`)
- No mixed content (HTTPS page loading HTTP resources)

**Fix:**
- Use a free TLS cert from Let's Encrypt or Cloudflare
- For Cloudflare Pages / Vercel / Netlify: HTTPS is automatic
- For mixed content: open DevTools → Console for warnings, fix all `http://` references in HTML/CSS/JS

### 4. Redirects HTTP to HTTPS

**Checks:**
- The HTTP variant of the URL responds with 301/302 to HTTPS

**Fix:**

For nginx:
```nginx
server {
  listen 80;
  server_name example.com;
  return 301 https://$host$request_uri;
}
```

For Cloudflare: enable "Always Use HTTPS" in SSL/TLS settings.

For Vercel: automatic.

### 5. Viewport meta tag

**Checks:**
- `<meta name="viewport" content="width=device-width, initial-scale=1">` present in `<head>`

**Fix:** Add the tag. This is one of the simplest fixes but commonly forgotten in old templates.

### 6. Splash screen configured

**Checks:**
- Manifest contains `name`, `theme_color`, `background_color`
- At least one icon ≥ 512×512

**Fix:**
```json
{
  "name": "Acme Invoicing",
  "theme_color": "#3b82f6",
  "background_color": "#ffffff",
  "icons": [{ "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }]
}
```

## Quality audits (improve score, don't block)

### 7. Apple touch icon

**Checks:**
- `<link rel="apple-touch-icon" href="...">` with image ≥ 180×180

**Fix:** Generate a 180×180 PNG, link from HTML head:
```html
<link rel="apple-touch-icon" href="/apple-touch-icon-180.png">
```

iOS doesn't read manifest icons. This is a separate channel.

### 8. Themed omnibox

**Checks:**
- `theme_color` in manifest matches `<meta name="theme-color">` in HTML

**Fix:**
```html
<meta name="theme-color" content="#3b82f6">
```

Set the SAME hex in manifest's `theme_color`. Mismatch fails this audit.

For dynamic theme (light/dark mode):
```html
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000">
```

### 9. Maskable icon

**Checks:**
- At least one icon in manifest with `purpose: "maskable"` (or `purpose: "any maskable"`)

**Fix:**
1. Generate a maskable PNG: artwork must fit inside the central 80% safe zone
2. Test at https://maskable.app/editor
3. Add to manifest:

```json
{
  "icons": [
    { "src": "/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### 10. Content sized correctly for viewport

**Checks:**
- No element extends beyond the viewport on mobile
- No horizontal scroll

**Fix:**
- Replace fixed pixel widths with `100%` or `max-width`
- Use `vw`/`vh` units carefully (consider safe areas)
- Use `box-sizing: border-box` globally

```css
* { box-sizing: border-box; }
body { overflow-x: hidden; }  /* nuclear option for legacy code */
```

### 11. Page transitions don't feel like they block on the network

**Checks:**
- Time to Interactive (TTI) < 5s on slow 4G
- First Meaningful Paint < 4s

**Fix:** Performance optimization — separate concern. See:
- Code splitting (dynamic imports)
- Preload critical resources (`<link rel="preload">`)
- Lazy-load below-the-fold images
- Use CDN for static assets
- Minify + compress (gzip/brotli)

### 12. Each page has a URL

**Checks:**
- The URL changes when navigating
- Direct linking to `/anywhere` works (no 404s on refresh)

**Fix for SPAs:**
- React Router: configure `BrowserRouter` and server fallback to `index.html`
- Vue Router: `mode: "history"` with server fallback
- Static hosts: configure `_redirects` (Netlify), `vercel.json` (Vercel), or `404.html` workaround (GitHub Pages)

For Cloudflare Pages:
```
# _redirects
/*    /index.html   200
```

### 13. Cross-browser compatibility

**Checks:** (Lighthouse runs Chrome, but warns about features that don't work elsewhere)
- No `-webkit-` only properties
- No experimental web APIs without fallback

**Fix:**
- Use [caniuse.com](https://caniuse.com) to check feature support
- Add polyfills for IE11/older Safari if your audience needs them
- Use feature detection: `if ("share" in navigator) { ... }`

### 14. Page load is fast enough on mobile networks

**Checks:**
- LCP (Largest Contentful Paint) < 2.5s
- FID (First Input Delay) < 100ms / INP (Interaction to Next Paint) < 200ms
- CLS (Cumulative Layout Shift) < 0.1

**Fix:** Same as audit #11 (perf optimization).

## Score interpretation

Lighthouse PWA score is binary per audit (pass/fail), then weighted.

| Score range | Meaning |
|---|---|
| 100 | All audits pass |
| 90-99 | All blockers pass, some quality items fail |
| 50-89 | Some blockers fail (cannot install) |
| < 50 | Many issues |

For Microsoft Store via PWA Builder: **≥ 80**.
For Google Play TWA: no formal Lighthouse requirement, but Play Console runs its own pre-launch checks.
For App Store via PWA Builder wrapper: **≥ 90** recommended (Apple's review is strict).

## CI integration

Add to GitHub Actions:

```yaml
- name: Lighthouse PWA audit
  run: |
    npm install -g @lhci/cli
    lhci autorun --config=./lighthouserc.json
  env:
    LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["https://staging.example.com"],
      "settings": { "onlyCategories": ["pwa"] }
    },
    "assert": {
      "assertions": {
        "categories:pwa": ["error", { "minScore": 0.9 }]
      }
    }
  }
}
```

This blocks PRs that drop the PWA score below 90.

## Manual debugging

When Lighthouse reports a failure that doesn't make sense:

1. **Run with `--throttling-method=devtools`** to bypass simulated throttling.
2. **Open the report's JSON** (`--output=json`). The `lhr.audits[auditId].details` field has the raw evidence.
3. **Compare against a working PWA**: pick one from https://www.pwastats.com/ and audit it side-by-side.
4. **Use Chrome's "Application" panel** for live state: Manifest, Service Workers, Cache Storage all show what the browser actually sees.
