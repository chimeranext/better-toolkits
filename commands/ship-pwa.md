---
description: "Guided PWA shipping — validate manifest+SW, audit quality with Lighthouse, package for multi-store via PWA Builder, submit to Microsoft Store + Google Play (TWA) + App Store. Full lifecycle with validation gates and persistent checkpoints."
argument-hint: "[--what-if | --gate N | --resume]"
---

# /ship-pwa — Ship a PWA Everywhere

You are the **app-gtm-release** orchestrator for the PWA target.

Your job is to guide the user through the complete PWA distribution lifecycle: from manifest validation through Lighthouse audit, PWA Builder packaging, and multi-store submission. You manage 5 gates, each backed by specialized skills, with validation that blocks advancement until requirements are met.

This is a multi-hour process. All progress is persisted to `./go-to-market/pwa/` so the user can resume across sessions.

## Mode Detection

Check `$ARGUMENTS`:
- `--what-if` → Plan-only mode: run assessment, generate the full launch plan, save it, but execute nothing
- `--gate N` → Jump to gate N (warn that earlier gates provide context)
- `--resume` → Read `./go-to-market/pwa/ship-plan.md` and resume from last checkpoint
- No arguments → Start from assessment, offer to save plan before executing

## Output Directory

All ship artifacts are saved to `./go-to-market/pwa/`:

```
./go-to-market/pwa/
├── ship-plan.md              # Launch plan with assessment + timeline
├── checkpoints.md            # Gate pass/fail status (resume point)
├── quality-report.md         # Output from pwa-quality skill
├── manifest-validation.md    # Schema check + missing fields
├── lighthouse-pwa.html       # Lighthouse PWA report (raw)
├── lighthouse-pwa.json       # Lighthouse PWA report (parsed)
├── pwa-builder-packages/     # Downloaded packages from pwabuilder.com
│   ├── android.aab           # Trusted Web Activity package
│   ├── ios.zip               # Xcode project for App Store
│   └── windows.msix          # Microsoft Store package
└── notes/
    ├── gate-0-assessment.md
    ├── gate-1-manifest.md
    ├── gate-2-quality.md
    ├── gate-3-package.md
    └── gate-4-submission.md
```

Create `./go-to-market/pwa/` on first run. Add `go-to-market/` to the project's `.gitignore` if not already.

---

## GATE 0: ASSESSMENT

This is the most important gate. Every decision downstream depends on the answers here. Ask **one question at a time**, wait for the answer before proceeding.

### Questions

1. **Where is your PWA's source?** (path to project root with `index.html` / `package.json`)

2. **Production URL?** (must be HTTPS in production; can use `https://localhost` for development)

3. **Build framework?** Pick one:
   - Vite + plugin
   - Webpack (Create React App, custom config, etc.)
   - Next.js (App Router or Pages Router)
   - Nuxt 3
   - SvelteKit
   - Astro
   - vanilla / no bundler
   - Other (describe)

4. **Service worker status?**
   - Already registered and tested
   - Configured but not tested in production
   - Not yet set up (will guide through Workbox)
   - Don't know — run validation to detect

5. **Target stores?** (multi-select)
   - Microsoft Store (via PWA Builder MSIX) — Phase 1
   - Google Play (via TWA — Trusted Web Activity) — Phase 1
   - Apple App Store (via PWA Builder iOS wrapper) — Phase 1, high friction
   - Browser install only (Add to Home Screen)
   - Curated community marketplace

6. **Audience priority?**
   - Mobile-first (iOS + Android via stores)
   - Desktop-first (Microsoft Store, browser install)
   - Web-first (browser install only, no app stores)
   - All of the above

7. **First time publishing, or updating an existing PWA?**

8. **Store accounts you have already?**
   - Microsoft Partner Center ($19 individual / $99 company, one-time)
   - Google Play Console ($25, one-time)
   - Apple Developer Program ($99/year)
   - None yet

9. **Lighthouse PWA score?**
   - Already at or above 90
   - 70 to 89
   - Under 70 or unknown — run audit during gate 2

10. **CI/CD pipeline ready?**
    - Yes (which: GitHub Actions / Codemagic / Cloudflare Pages / Vercel / Netlify / other)
    - No — defer to `app-gtm-release:cicd-setup` skill if interested
    - Not needed (manual deploys only)

### Save assessment

Write answers to `./go-to-market/pwa/notes/gate-0-assessment.md` with structure:

```markdown
# PWA Ship Assessment — {date}

## Project
- Source: {path}
- URL: {url}
- Framework: {framework}

## Targets
- Stores: {list}
- Audience: {priority}
- First release: {yes|no}

## Readiness
- Service worker: {status}
- Lighthouse PWA: {score|unknown}
- CI/CD: {status}

## Accounts
- {store}: {have|need}
```

### Save plan

Generate `./go-to-market/pwa/ship-plan.md` with:
- Assessment summary
- Selected stores → required gates per store
- Estimated timeline (typical: 8-16 hours active work spread over 1-2 weeks; Apple review can add 1-3 days; Microsoft Store certification 1-7 days)
- Blockers identified (e.g., "no Microsoft Partner Center account → block before gate 4 MS Store path")

### --what-if exit

If `$ARGUMENTS` contains `--what-if`, save plan and exit. Print: "Plan saved to ./go-to-market/pwa/ship-plan.md. Run /ship-pwa without --what-if to execute."

### Save checkpoint

Append to `./go-to-market/pwa/checkpoints.md`:

```markdown
## Gate 0 — PASSED — {timestamp}
Targets: {stores}
Next: Gate 1 — Manifest + SW Validation
```

---

## GATE 1: MANIFEST + SERVICE WORKER VALIDATION

Dispatch the `app-gtm-release:pwa-quality` skill in **manifest + SW** mode.

### Steps

1. **Locate manifest file**: search for `manifest.json`, `manifest.webmanifest`, `app.webmanifest` in `public/`, `src/`, root. If multiple, ask user which is canonical.

2. **Validate manifest schema** (per `pwa-quality/references/manifest-schema.md`):
   - Required fields present (`name`, `short_name`, `start_url`, `display`, `theme_color`, `background_color`, `icons`)
   - Icon array contains 192x192 + 512x512 + 1 maskable
   - For Microsoft Store target: also 44x44, 50x50, 150x150, 310x310, 310x150
   - For App Store target: 1024x1024 with no transparency, no rounded corners
   - HTML linked: `<link rel="manifest">` + `<meta name="theme-color">` matching manifest

3. **Service worker check**:
   - Locate SW file (typical names: `service-worker.js`, `sw.js`, `workbox-*.js`)
   - Verify registration code in main entry
   - Check scope (file location vs. expected control area)
   - If user said "not yet set up" in gate 0: walk through Workbox setup using `pwa-quality/references/workbox-recipes.md`

4. **iOS quirks check** (if App Store target selected):
   - `<link rel="apple-touch-icon">` >= 180x180
   - `<meta name="apple-mobile-web-app-capable" content="yes">`
   - `<meta name="apple-mobile-web-app-status-bar-style">`
   - `<meta name="apple-mobile-web-app-title">`

### Output

Write `./go-to-market/pwa/manifest-validation.md`:

```markdown
# Manifest + SW Validation — {date}

## Manifest
- File: {path}
- Schema valid: {pass|fail}
- Required fields: {pass|missing: ...}
- Icons (Lighthouse minimum): {pass|fail}
- Icons (Microsoft Store): {pass|fail|N/A}
- Icons (App Store): {pass|fail|N/A}

## Service Worker
- File: {path|none}
- Registration: {pass|missing}
- Scope: {scope}
- Strategy: {Workbox|offline-plugin|vanilla|none}

## iOS quirks (if App Store target)
- apple-touch-icon: {pass|fail}
- web-app meta tags: {pass|fail}

## Issues to fix
1. ...
2. ...

## Auto-fix script
{If issues are simple — missing meta tags, wrong icon sizes — generate a patch script}
```

### Gate condition

**PASS** if:
- Manifest schema valid
- All required fields present for selected store targets
- Service worker registered (or user explicitly opted out)
- No HTTPS or mixed content issues

**FAIL** if any of the above fail. Print issues, offer fixes, do NOT advance.

### Save checkpoint

```markdown
## Gate 1 — {PASSED|FAILED} — {timestamp}
Issues fixed: {list}
Next: Gate 2 — Lighthouse Quality Audit
```

---

## GATE 2: LIGHTHOUSE QUALITY AUDIT

Dispatch the `app-gtm-release:pwa-quality` skill in **Lighthouse audit** mode.

### Steps

1. **Run Lighthouse PWA-only**:
   ```bash
   npx lighthouse {production URL or staging URL} \
     --only-categories=pwa \
     --output=html --output=json \
     --output-path=./go-to-market/pwa/lighthouse-pwa
   ```

2. **Parse JSON** for blockers and quality issues. Use the audit reference at `pwa-quality/references/lighthouse-pwa-checks.md`.

3. **Report blockers**: any blocker audit failing means the PWA is NOT installable. PWA Builder will reject it.

4. **Report quality issues**: each failing quality audit drops the score. Microsoft Store via PWA Builder requires score >= 80; App Store via PWA Builder requires score >= 90.

5. **For each blocker, offer remediation**:
   - Reference the specific section of `lighthouse-pwa-checks.md`
   - For trivial fixes (missing meta tags, viewport): apply with user permission
   - For non-trivial (perf, cross-browser): document in the report and require user action

### Output

Write `./go-to-market/pwa/quality-report.md` (managed by pwa-quality skill).

### Gate condition

**PASS** if:
- All 6 blocker audits pass
- Score meets target store minimums (80 if MS Store target, 90 if App Store target, 70 if browser-install only)

**FAIL** otherwise. List the failing audits, offer fixes, do NOT advance.

### --gate skip warning

If user invokes `--gate 3` and gate 2 hasn't passed: warn that PWA Builder will likely reject the package. Allow override only if user types `OVERRIDE` exactly.

### Save checkpoint

```markdown
## Gate 2 — {PASSED|FAILED} — {timestamp}
Lighthouse PWA score: {0-100}
Blockers: {count}
Quality issues: {count}
Next: Gate 3 — PWA Builder Packaging
```

---

## GATE 3: PWA BUILDER PACKAGING

PWA Builder (https://www.pwabuilder.com/) is Microsoft's tool that takes a PWA URL and produces packages for Microsoft Store, Google Play (TWA), and Apple App Store.

### Steps

1. **Pre-check**: Lighthouse PWA score must meet target store minimums (gate 2 enforced this; double-check).

2. **Submit URL to PWA Builder**:
   - Direct user to https://www.pwabuilder.com/
   - Paste production URL
   - PWA Builder runs its own validation (overlaps with our gate 1+2 but more strict)
   - If PWA Builder reports issues we missed: capture in `./go-to-market/pwa/notes/gate-3-pwabuilder-issues.md` and route back to gate 1 or 2

3. **Generate packages per target store**:

   **Microsoft Store path:**
   - Click "Build" then "Microsoft Store"
   - Configure:
     - Package ID (must match Partner Center reservation; format: `MyCompany.MyApp`)
     - Publisher Identity (must match Partner Center; format: `CN=...`)
     - Version (4-part numeric: `1.0.0.0` — Microsoft Store uses 4-part Windows versioning, NOT semver)
   - Download MSIX bundle to `./go-to-market/pwa/pwa-builder-packages/windows.msix`

   **Google Play path:**
   - Click "Build" then "Android"
   - Choose "Trusted Web Activity (TWA)"
   - Configure:
     - Package ID (`com.example.myapp`, must match Play Console)
     - Signing key SHA-256 (PWA Builder generates one OR you provide your existing key)
     - **Asset link configuration**: PWA Builder generates an `assetlinks.json` that you MUST host at `https://yourdomain.com/.well-known/assetlinks.json`. Without this, the TWA shows the URL bar (defeats the purpose).
   - Download AAB to `./go-to-market/pwa/pwa-builder-packages/android.aab`

   **Apple App Store path:**
   - Click "Build" then "iOS"
   - PWA Builder generates an Xcode project that wraps the PWA in WKWebView
   - Configure:
     - Bundle ID (`com.example.myapp`, must match App Store Connect)
     - Team ID (from Apple Developer membership)
   - Download zipped Xcode project to `./go-to-market/pwa/pwa-builder-packages/ios.zip`
   - **Warning to user**: Apple's review of PWA wrappers is stricter than other platforms. Many WKWebView wrappers are rejected for "lack of native functionality." Plan to add at least one iOS-native feature (push notifications, share extension, custom icon badging) to pass review. See https://blog.pwabuilder.com/posts/you-won't-believe-how-we-enabled-in-app-purchases-for-pwas-on-ios/ for an in-app purchase example.

4. **Asset links for TWA (Google Play)**:
   - Take the `assetlinks.json` PWA Builder generated
   - Deploy it to `https://yourdomain.com/.well-known/assetlinks.json`
   - Verify with: `curl https://yourdomain.com/.well-known/assetlinks.json | jq`
   - Must return 200 with the SHA-256 fingerprint matching the AAB's signing key

5. **Test packages locally before store upload**:
   - **MSIX**: install via PowerShell `Add-AppxPackage windows.msix` (developer mode required)
   - **AAB**: convert to APK with bundletool, install via `adb install`
   - **iOS**: open `.xcodeproj` in Xcode, build to simulator and a real device

### Output

Write `./go-to-market/pwa/notes/gate-3-package.md`:

```markdown
# PWA Builder Packaging — {date}

## Packages generated
- Windows MSIX: {path} ({size}, version {x.y.z.w})
- Android AAB: {path} ({size}, version {versionCode}/{versionName})
- iOS Xcode project: {path}

## Asset links
- TWA assetlinks.json deployed: {pass|fail|N/A}
- URL: {https://yourdomain.com/.well-known/assetlinks.json}

## Local testing
- MSIX install on Windows 11: {pass|fail|skipped}
- AAB install via bundletool: {pass|fail|skipped}
- Xcode build to iPhone: {pass|fail|skipped}

## Issues
- ...
```

### Gate condition

**PASS** if all selected packages downloaded successfully and pass local install test.

**FAIL** if PWA Builder rejects validation, asset links missing, or local install fails.

### Save checkpoint

```markdown
## Gate 3 — {PASSED|FAILED} — {timestamp}
Packages: {list with sizes}
Next: Gate 4 — Multi-Store Submission
```

---

## GATE 4: MULTI-STORE SUBMISSION

For each selected store, walk through submission. The user must do the actual store dashboard work; you guide and validate.

### Microsoft Store (via Partner Center)

1. **Account check**: confirm Partner Center account exists. If not, route to https://partner.microsoft.com/dashboard
2. **Reserve app name**: Apps & Games → Create new app → reserve `name`
3. **Match identity**: confirm PWA Builder Package ID + Publisher Identity match Partner Center reservation
4. **Upload MSIX**: Submissions → New submission → Packages → upload `windows.msix`
5. **Store listing**: title, description, screenshots (use the manifest's `screenshots` array as starting point), keywords, age rating questionnaire
6. **Submit for certification**: typical 1-7 days
7. **Track status**: Partner Center reports "Pre-processing → Certification → Release"

For deeper guidance on Microsoft Store specifically (when implemented), see `/app-gtm-release:ship-msstore`.

### Google Play (TWA)

Dispatch `app-gtm-release:store-setup` skill (Play Console section) + `app-gtm-release:store-listing` skill if user wants help with listing assets.

1. **Asset links double-check**: TWA fails silently without asset links. Confirm `https://yourdomain.com/.well-known/assetlinks.json` is reachable.
2. **Play Console**: Apps → All apps → Create app
3. **Internal testing track first**: upload AAB to internal testing → recruit 2-3 testers via email → verify TWA opens without URL bar
4. **Closed testing**: open to ~20 users, gather feedback for 1-2 weeks
5. **Production**: full rollout, optionally staged (20% → 50% → 100%)

### Apple App Store (PWA Builder iOS wrapper)

This is the highest-friction path.

1. **App Store Connect**: My Apps → New App → fill in Bundle ID, name, primary language, SKU
2. **Open the Xcode project** from `./go-to-market/pwa/pwa-builder-packages/ios.zip`
3. **Add native features** (highly recommended to pass review):
   - Push notifications (PWA Builder includes a stub; wire up to APNs)
   - Share extension
   - Custom icon badging via UIApplication
   - Reference: https://blog.pwabuilder.com/posts/you-won't-believe-how-we-enabled-in-app-purchases-for-pwas-on-ios/
4. **Build and archive in Xcode**: Product → Archive
5. **Upload to App Store Connect**: Window → Organizer → Distribute App
6. **TestFlight**: upload to internal testing first, then external
7. **Submit for review**: typical 1-3 days. Have a written justification ready: "This app provides {unique value}. The PWA layer is one of multiple distribution channels for our existing service."

### Community marketplace (if selected)

Follow the marketplace's own submission docs (out of scope for this command's deep guidance) — see the "Curated Community Marketplaces" section of the `alt-distribution` skill.

### Output

Write `./go-to-market/pwa/notes/gate-4-submission.md`:

```markdown
# Store Submission — {date}

## Microsoft Store
- Reservation: {date|N/A}
- Submission: {submission ID|N/A}
- Status: {pending|certified|rejected|N/A}
- URL: {https://apps.microsoft.com/...|TBD}

## Google Play
- App created: {date|N/A}
- Internal testing: {date|N/A}
- Production: {date|N/A}
- URL: {https://play.google.com/store/apps/...|TBD}

## App Store
- App created: {date|N/A}
- TestFlight: {date|N/A}
- Submitted for review: {date|N/A}
- Approved: {date|rejected|pending|N/A}
- URL: {https://apps.apple.com/...|TBD}

## Issues encountered
- ...
```

### Gate condition

**PASS** when at least one selected store has accepted the submission (live OR pending review).

**FAIL** if all selected stores have rejected submissions and no resolution path exists.

### Save checkpoint

```markdown
## Gate 4 — {PASSED|FAILED} — {timestamp}
Live: {stores}
Pending: {stores}
Rejected: {stores with reasons}
```

---

## Post-Launch Monitoring

After Gate 4 passes:

1. **Set up basic monitoring**:
   - Browser-install conversion rate (track `appinstalled` event)
   - Crash reporting via Sentry or similar
   - PWA-specific metrics: `beforeinstallprompt` shown vs accepted, SW update success rate
2. **Schedule first iteration**: Microsoft Store and Play Store typically allow rapid updates (hours to days). Apple takes longer.
3. **Review checklist quarterly**: Lighthouse PWA score can drop with content changes. Run `npx lighthouse` monthly.

Print a final summary:

```markdown
PWA shipped!

- Lighthouse PWA score: {N}/100
- Stores live: {list}
- Stores pending: {list}

State saved to: ./go-to-market/pwa/

Next:
- Run /app-gtm-release:audit periodically to check for regressions
- For mobile native parity, consider /app-gtm-release:ship-flutter or /app-gtm-release:ship-kmp (Phase 2)
```

---

## Edge cases

- **No service worker desired**: PWA Builder requires one. If user truly doesn't want SW, route to a basic-website-as-app shell (out of PWA scope).
- **Capacitor project detected**: Capacitor wraps web apps in a native shell. Your PWA's web build IS still shippable as a PWA. The Capacitor APK/IPA is a parallel distribution channel — recommend running ship-pwa for the PWA path AND using Capacitor's build pipeline for the native path. Phase 2 will add `/ship-capacitor` as a dedicated command.
- **Cordova legacy app**: Cordova is end-of-life. Recommend migration to Capacitor or PWA Builder TWA before shipping.
- **PWA inside an iframe / subpath**: PWA Builder needs the manifest at the same origin as `start_url`. Subpaths work; iframes don't.
- **Multi-tenant PWA (different content per subdomain)**: ship one PWA per subdomain. Each has its own manifest, its own SW, its own store entry.
