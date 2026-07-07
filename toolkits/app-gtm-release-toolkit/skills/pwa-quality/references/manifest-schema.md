# Web App Manifest — Complete Field Reference

Source: [W3C Web App Manifest spec](https://www.w3.org/TR/appmanifest/) + browser-specific extensions.

## Core fields

### `name` (string, required)

Full app name. Used in install prompts, app launchers, and store listings.

```json
{ "name": "Acme Invoicing — Multi-currency for freelancers" }
```

Constraints:
- ≤ 100 characters (most stores)
- No emoji in iOS context (PWA Builder strips them)

### `short_name` (string, required for stores)

Shown when there's no room for `name` (home screens, app drawer). Stores require it.

```json
{ "short_name": "Acme" }
```

Constraints: ≤ 12 characters recommended (some launchers truncate at 11).

### `description` (string, recommended)

App description shown in install prompt details and store listings.

```json
{ "description": "Send invoices in 30+ currencies. Free for freelancers under 5 invoices/month." }
```

### `start_url` (string, required for installability)

URL launched when the app is opened from home screen. Must be relative or absolute to the manifest's origin.

```json
{ "start_url": "/?utm_source=pwa&source=installed" }
```

Tip: Add UTM params or query strings to track installs vs. browser visits in your analytics.

### `id` (string, recommended)

Stable unique identifier. If absent, browsers derive it from `start_url`, which means changing `start_url` later creates a "new app" in store listings (lost reviews, lost ranking).

```json
{ "id": "/?source=pwa-app" }
```

Set this on day 1 and never change it.

### `display` (string, required for installability)

How the app is rendered. Only `standalone`, `fullscreen`, and `minimal-ui` are installable.

| Value | Look | Lighthouse |
|---|---|---|
| `fullscreen` | No browser chrome, no status bar | ✅ |
| `standalone` | No browser chrome, status bar visible | ✅ Recommended |
| `minimal-ui` | Minimal browser chrome (back/refresh) | ✅ |
| `browser` | Regular tab | ❌ Fails Lighthouse |

```json
{ "display": "standalone" }
```

### `display_override` (array, optional)

Fallback chain for newer display modes (Window Controls Overlay, etc.).

```json
{ "display_override": ["window-controls-overlay", "standalone"] }
```

### `orientation` (string, optional)

Lock orientation. Most apps should leave this off.

Valid values: `any`, `natural`, `landscape`, `portrait`, plus `landscape-primary`, `landscape-secondary`, `portrait-primary`, `portrait-secondary`.

```json
{ "orientation": "portrait-primary" }
```

### `theme_color` (string, required)

Hex color setting browser UI elements (status bar on Android, title bar on Windows).

```json
{ "theme_color": "#3b82f6" }
```

Must match `<meta name="theme-color" content="#3b82f6">` in HTML or Lighthouse complains.

### `background_color` (string, required)

Hex color shown during app launch (before CSS loads). Should match your splash screen.

```json
{ "background_color": "#ffffff" }
```

### `icons` (array, required)

Array of `ImageResource` objects. See "Icon array spec" below.

### `lang` (string, optional)

Primary language tag. Defaults to user's browser locale.

```json
{ "lang": "es-CR" }
```

### `dir` (string, optional)

Text direction. `ltr` (default), `rtl`, or `auto`.

### `scope` (string, optional)

URL prefix the app controls. Defaults to the directory containing the manifest.

```json
{ "scope": "/app/" }
```

If user navigates outside the scope, the browser may show a "leaving app" UI or open in regular browser.

## Icon array spec

Each icon is an `ImageResource` object:

```json
{
  "src": "/icons/icon-512.png",
  "sizes": "512x512",
  "type": "image/png",
  "purpose": "any"
}
```

### Fields

| Field | Required | Notes |
|---|---|---|
| `src` | Yes | Relative or absolute URL |
| `sizes` | Yes | Space-separated WxH pairs: `"192x192 512x512"`. Use `any` for SVG. |
| `type` | Recommended | MIME type. Browsers can guess but explicit is safer. |
| `purpose` | Optional | `any` (default), `maskable`, `monochrome`, or combinations like `"any maskable"` |

### Required sizes by platform

| Platform | Sizes needed |
|---|---|
| Lighthouse minimum | 192×192, 512×512 |
| Android | 192×192, 512×512, 512×512 maskable |
| iOS (via PWA Builder) | 1024×1024 (no transparency, no rounded corners) |
| Microsoft Store (via PWA Builder) | 44×44, 50×50, 150×150, 310×310, 310×150 |

Generate all sizes from a single 1024×1024 source via:
- https://maskable.app/ (for the maskable variant)
- https://www.pwabuilder.com/imageGenerator (full set including Windows + iOS)

### Maskable icons explained

Adaptive icons on Android crop the icon into shapes (circle, squircle, rounded square). A `purpose: "maskable"` icon must keep important content within an 80% safe zone (the central 80% of the canvas). The outer 20% can be cropped.

Test at https://maskable.app/editor — drag your icon in, see how it renders in each shape.

## Capability fields

### `categories` (array of strings, optional)

Improves store discovery. Microsoft Store and PWA Builder use this.

```json
{ "categories": ["productivity", "business", "finance"] }
```

Standard categories: `business`, `education`, `entertainment`, `finance`, `fitness`, `food`, `games`, `government`, `health`, `kids`, `lifestyle`, `magazines`, `medical`, `music`, `navigation`, `news`, `personalization`, `photo`, `productivity`, `security`, `shopping`, `social`, `sports`, `travel`, `utilities`, `weather`.

### `screenshots` (array of ImageResource, recommended)

Shown in install prompt details and store listings. Without these, install dialogs are bare.

```json
{
  "screenshots": [
    {
      "src": "/screenshots/desktop-home.png",
      "sizes": "1280x800",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Dashboard on desktop"
    },
    {
      "src": "/screenshots/mobile-invoice.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Create invoice on iPhone"
    }
  ]
}
```

`form_factor`: `wide` (desktop) or `narrow` (mobile). Provide at least one of each.

### `shortcuts` (array, optional)

Long-press menu items on mobile, jump list on Windows.

```json
{
  "shortcuts": [
    {
      "name": "New invoice",
      "short_name": "Invoice",
      "description": "Create a new invoice",
      "url": "/invoices/new",
      "icons": [{ "src": "/shortcut-invoice.png", "sizes": "96x96" }]
    },
    {
      "name": "Recent clients",
      "url": "/clients/recent",
      "icons": [{ "src": "/shortcut-clients.png", "sizes": "96x96" }]
    }
  ]
}
```

Limit: 4 shortcuts maximum (some platforms show only 3).

### `related_applications` + `prefer_related_applications` (optional)

Tell stores about your existing native app (so the install prompt offers it instead of the PWA).

```json
{
  "prefer_related_applications": true,
  "related_applications": [
    {
      "platform": "play",
      "url": "https://play.google.com/store/apps/details?id=com.acme.invoicing",
      "id": "com.acme.invoicing"
    }
  ]
}
```

For most PWAs you want `prefer_related_applications: false` (the default) — install the PWA directly.

### `protocol_handlers` (array, optional, advanced)

Register the PWA to handle custom URL schemes (`web+invoice://...`).

```json
{
  "protocol_handlers": [
    { "protocol": "web+invoice", "url": "/handle-invoice?id=%s" }
  ]
}
```

### `file_handlers` (array, optional, advanced)

Register the PWA to open specific file types (Chrome desktop only).

```json
{
  "file_handlers": [
    {
      "action": "/open-pdf",
      "accept": { "application/pdf": [".pdf"] }
    }
  ]
}
```

### `share_target` (object, optional)

Receive shared content from OS share menu.

```json
{
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url",
      "files": [{ "name": "files", "accept": ["image/*"] }]
    }
  }
}
```

## Linking to HTML

```html
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#3b82f6">
<link rel="apple-touch-icon" href="/apple-touch-icon-180.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Acme">
```

## Validation tools

- https://manifest-validator.appspot.com/ — W3C-style validation
- https://www.pwabuilder.com/ — runs validation as part of packaging
- Chrome DevTools → Application → Manifest — live validation against the installed page
- `npx pwa-asset-generator` — auto-generates icons + meta tags from an SVG source
