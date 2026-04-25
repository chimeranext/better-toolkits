---
name: msstore-submission
description: "Submit an app to Microsoft Store via Microsoft Partner Center. Covers two packaging paths (PWA via PWA Builder MSIX, native MSIX from Win32/UWP/desktop apps), Partner Center account setup, app reservation, package upload, store listing requirements (description, screenshots, age rating), certification process (1-7 days typical), and post-launch updates. Use this skill when the user asks about Microsoft Store, Partner Center, MSIX, AppX, Windows Store submission, MS Store certification, Windows app distribution, 'publish to Microsoft Store', or 'Windows app store'."
---

# Microsoft Store Submission via Partner Center

Microsoft Store accepts apps in three packaging formats:

1. **MSIX/MSIXBundle** (modern, recommended) — for Win32 desktop apps, UWP apps, and PWAs (via PWA Builder).
2. **AppX/AppXBundle** (legacy MSIX precursor) — being phased out; new submissions should use MSIX.
3. **EXE installer wrapped in MSIX** (Microsoft Store for Business / WinGet path) — niche.

This skill focuses on the **MSIX path** because it's modern, automatic-updating, and what PWA Builder produces.

## When to invoke

- During `/app-gtm-release:ship-msstore` Gates 0-4
- During `/app-gtm-release:ship-pwa` Gate 4 (Microsoft Store submission step)
- When the user asks: "publish to Microsoft Store", "MSIX submission", "Partner Center setup", "Windows app store", "MS Store certification"

## Bar 1 — Partner Center account

Microsoft Partner Center is the dashboard. Two account types:

| Type | Cost | Verification | Use case |
|---|---|---|---|
| Individual | $19 USD one-time | Email + phone | Solo devs, personal apps |
| Company | $99 USD one-time | DUNS number + phone | Apps under a legal entity, paid apps with revenue split |

Sign up: https://partner.microsoft.com/en-us/dashboard/registration/

After signup, Microsoft verifies identity (1-3 business days). You CANNOT submit apps before verification completes.

### Tax + payment setup (required for paid apps)

Even free apps with ads require tax info. Set up under Settings → Account settings → Payout and tax. Microsoft pays via:
- Bank transfer (most countries)
- PayPal (limited countries)

Threshold: $200 USD (USA), $400 USD (most other countries) before payout.

## Bar 2 — App reservation

Before uploading any package, reserve the app's name in Partner Center:

1. Apps & Games → Overview → "Create a new app"
2. Enter the desired name (max 256 chars). Microsoft checks for trademark conflicts.
3. Once reserved, the name is yours for **1 year**. If you don't submit a package within that window, the reservation expires and the name returns to the pool.

The reservation generates two critical identifiers:

```
Package family name: 12345MyCompany.MyApp_a1b2c3d4e5f6g
Publisher identity:  CN=A1B2C3D4-E5F6-7890-1234-56789ABCDEF0
```

Both must match your MSIX package metadata exactly. Mismatches reject at upload.

## Bar 3 — Package preparation

### Path A: PWA via PWA Builder (recommended for web apps)

PWA Builder generates an MSIX with the right metadata if you provide the Package family name and Publisher identity:

1. Go to https://www.pwabuilder.com/
2. Enter your PWA's HTTPS URL
3. Click "Build" → "Microsoft Store"
4. Enter:
   - Package ID (use the Package family name from Partner Center, format: `MyCompany.MyApp`)
   - Publisher (use the Publisher identity from Partner Center, format: `CN=...`)
   - Version (4-part: `1.0.0.0` — Microsoft Store uses 4-part Windows versioning, NOT semver)
5. Download the MSIX bundle

The MSIX includes:
- Your PWA's URL (loaded in WebView2 / Edge runtime)
- Manifest data converted to APPX manifest format
- Icons in all 5 Windows sizes (44x44, 50x50, 150x150, 310x310, 310x150)

### Path B: Native MSIX from Win32/UWP

For native Windows apps (Electron, .NET MAUI Windows, UWP, Tauri, native Win32):

**MSIX Packaging Tool** (Microsoft, free):
1. Install from Microsoft Store: search "MSIX Packaging Tool"
2. Run as administrator
3. Choose "Create package on this computer"
4. Provide your installer (.exe, .msi, or just the binary folder)
5. Tool monitors install actions, captures registry/file changes
6. Outputs an MSIX

**MSBuild + Windows Application Packaging Project**:
- Visual Studio template: "Windows Application Packaging Project"
- Add your existing project as a reference
- Configure Package.appxmanifest (Package family name, Publisher, Version, Capabilities, Icons)
- Build configuration: Release × x64 (or ARM64 for Surface devices)
- Output: `bin/Release/AppPackages/MyApp_1.0.0.0_x64_bundle.msixbundle`

**Tauri** (web-app desktop wrapper):
```bash
npm run tauri build -- --target x86_64-pc-windows-msvc
# Outputs MSI by default; for MSIX use:
# tauri.conf.json: "windows.targets": ["msix"]
```

**Electron** (via electron-builder):
```json
// electron-builder.yml
{
  "appId": "com.example.myapp",
  "win": { "target": "appx" }
}
```
Note: electron-builder produces `.appx` (legacy). Submit via Partner Center "AppX" path or convert to MSIX with `MakeAppx.exe`.

### Signing the package

MSIX must be signed. Two options:

1. **Microsoft Store signing** (free, automatic): submit unsigned package; Microsoft signs it during certification using a Microsoft-issued cert tied to your Partner Center publisher identity. The signed package is what end-users install.
2. **Self-signed for sideload testing**: use `signtool.exe sign /a /v /fd SHA256 mypackage.msix`. Self-signed packages CAN be sideloaded for testing but CANNOT be submitted to Microsoft Store.

For PWA Builder MSIX: leave unsigned, submit as-is. Partner Center signs.

## Bar 4 — Submission flow in Partner Center

1. Apps & Games → My apps → click your reserved app
2. **Properties**: category, secondary category, system requirements, support contacts
3. **Pricing and availability**:
   - Markets (default: all 248 markets)
   - Visibility: Public, Hidden (link-only), Private (org-only)
   - Pricing: Free, Paid (set price tier in USD; Microsoft converts per market)
   - Subscriptions / consumables (if applicable)
4. **Properties** (continued): age rating questionnaire (must answer; takes 5-10 min)
5. **Packages**:
   - Upload your MSIX
   - Choose mandatory update (force users to update) or optional
   - Set rollout %: gradual (10% → 50% → 100%) or full
6. **Store listing**:
   - Description (≤ 10,000 chars; supports basic HTML)
   - What's new in this version
   - Screenshots: at least 1, max 10. Sizes:
     - Desktop: 1366x768 to 3840x2160
     - Mobile: 768x1280 to 2560x1440
     - Surface Hub / Xbox: optional
   - Store logos: 300x300 (required), 2400x1200 (optional, for spotlight)
   - Trailer videos: optional
   - Search keywords (≤ 7, helps store discovery)
   - Copyright + trademark notices
   - Additional licenses (e.g., open source disclosures)
7. **Submission options**:
   - Publish manually (you click "Publish" when certification passes)
   - Publish automatically when certification passes
   - Schedule for specific date

Click "Submit to the Store".

## Bar 5 — Certification process

Microsoft runs:

1. **Pre-processing** (minutes): metadata + package format validation
2. **Security scan** (1-2 hours): malware, capability mismatch, PII leakage
3. **Technical compliance** (1-3 days): manual + automated tests
   - App launches on Windows 10 + Windows 11
   - No crashes during smoke test
   - Capabilities declared in manifest match actual usage
   - For PWAs: WebView2 runtime functional, offline behavior
4. **Content compliance** (1-3 days): manual review for guidelines violations
   - No misleading screenshots (must show actual app)
   - No copyrighted content without rights
   - Age rating matches actual content
   - Privacy policy URL valid

Total: **1-7 calendar days** typical. PWAs are usually faster (3-5 days). New publishers face stricter review on first 1-2 submissions.

### Common rejection reasons

| Code | Reason | Fix |
|---|---|---|
| 10.1 | App crashes on launch | Test on a clean Windows 11 VM |
| 10.2 | Doesn't function as advertised | Update description to match actual features |
| 10.4 | Hangs / unresponsive | Profile startup; ensure < 5s to first interactive |
| 10.5 | Data collection without disclosure | Add privacy policy URL + in-app disclosure |
| 11.5 | Inappropriate content for declared age rating | Re-take age rating questionnaire |
| 1.4.4 | Branding doesn't match Partner Center reservation | Confirm Package family name + Publisher identity match exactly |
| 1.5.4 | Misleading store listing | Use real screenshots, accurate description |

If rejected, you get a detailed report. Fix issues, increment version (1.0.0.0 → 1.0.0.1), re-submit.

## Bar 6 — Post-launch: updates

Updates use the same flow but skip reservation and most metadata steps:

1. Build new MSIX with incremented 4-part version (e.g., 1.0.0.0 → 1.0.0.1)
2. Partner Center → My apps → click app → Submissions → New submission
3. Upload new package; Partner Center detects it's an update
4. Optionally update store listing
5. Submit (same certification flow, often faster: 1-3 days)

### Mandatory vs optional updates

```xml
<!-- in your AppX manifest, package element -->
<Identity Version="1.0.0.1" />

<!-- elsewhere in package -->
<Properties>
  <SupportedUsers>multiple</SupportedUsers>
</Properties>
```

In Partner Center, mark the submission as "mandatory" if breaking changes (security patch, schema migration). Users get force-updated before next launch. Default is optional.

### Staged rollout

Same as Google Play: choose a percentage (10% → 50% → 100%) over hours/days. Halt rollout from Partner Center if crash rate spikes.

## CI/CD integration

For automated submissions, use:

- **Microsoft Store Submission API** (REST): create submissions, upload packages, update listings programmatically. Auth via Azure AD app registration. Docs: https://learn.microsoft.com/en-us/windows/apps/publish/store-submission-api
- **GitHub Action**: `microsoft/setup-msstore-cli` and `microsoft/msstore-cli` for CLI-driven publishing

Example GitHub Actions:

```yaml
- name: Submit to Microsoft Store
  uses: microsoft/[email protected]
  with:
    seller-id: ${{ secrets.MS_SELLER_ID }}
    client-id: ${{ secrets.MS_CLIENT_ID }}
    tenant-id: ${{ secrets.MS_TENANT_ID }}
    cert-thumbprint: ${{ secrets.MS_CERT_THUMBPRINT }}
- name: Publish package
  run: msstore publish ./bin/Release/MyApp.msixbundle --product-id ${{ secrets.MS_PRODUCT_ID }}
```

## Pricing intelligence

Microsoft Store revenue share (better than Apple/Google for many cases):
- **0%** for non-gaming apps if you use your own commerce (or none)
- **15%** for non-gaming apps using Microsoft commerce (purchases, subscriptions, in-app)
- **12%** for games using Microsoft commerce
- **30%** for in-app purchases via the legacy Windows Store APIs (avoid; use Microsoft Commerce SDK instead)

Compared to Apple App Store (15-30%) and Google Play (15-30%), Microsoft Store is the most generous to publishers — especially for free or non-IAP apps.

## Output for /ship-msstore Gate 4

Save submission outcomes to `./go-to-market/pwa/notes/gate-4-msstore.md` (or `./go-to-market/msstore/` for native paths):

```markdown
# Microsoft Store Submission — {date}

## Account
- Partner Center type: {individual|company}
- Verified: {date|pending}

## App reservation
- Name: {name}
- Package family: {value}
- Publisher identity: {value}

## Package
- Path: {file path}
- Version: {1.0.0.0}
- Path A (PWA Builder) or Path B (native)?

## Submission
- Submitted: {date}
- Status: {Pre-processing|Certification|Released|Rejected}
- Submission ID: {value}
- Store URL: {url|TBD}

## Issues
- ...
```

## Resources

- [Partner Center docs](https://partner.microsoft.com/dashboard) — official dashboard
- [MSIX docs](https://learn.microsoft.com/en-us/windows/msix/) — packaging spec
- [Store policies](https://learn.microsoft.com/en-us/windows/apps/publish/store-policies) — what gets rejected
- [PWA Builder for Microsoft Store](https://docs.pwabuilder.com/#/builder/windows) — packaging walkthrough
- [Submission API reference](https://learn.microsoft.com/en-us/windows/apps/publish/store-submission-api) — automation
