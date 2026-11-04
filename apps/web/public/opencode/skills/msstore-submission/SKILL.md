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

### Why MSIX (or PWA) beats a raw EXE/MSI

If you're choosing a Windows distribution format, prefer **MSIX or PWA over EXE/MSI**: when you ship through the Store, **Microsoft signs the package for free** with a trusted cert tied to your publisher identity. A raw EXE/MSI installer instead requires you to buy your own code-signing certificate (OV/EV) to avoid SmartScreen warnings — an ongoing cost MSIX-via-Store sidesteps entirely.

### Accepted upload formats

Partner Center accepts `.msix` / `.msixbundle` / `.msixupload`, `.appx` / `.appxbundle` / `.appxupload`, and `.xap`. For submission, prefer the **upload file** variants (`.msixupload` / `.appxupload`): they bundle multiple architectures and embed the **symbol files** Partner Center uses for crash analytics. A **multi-arch app bundle** (x86 + x64 + ARM64) is preferred over a single-architecture package so one submission covers every device.

## When to invoke

- During `/app-gtm-release:ship-msstore` Gates 0-4
- During `/app-gtm-release:ship-pwa` Gate 4 (Microsoft Store submission step)
- When the user asks: "publish to Microsoft Store", "MSIX submission", "Partner Center setup", "Windows app store", "MS Store certification"

## Bar 1 — Partner Center account

Microsoft Partner Center is the dashboard. Two account types:

| Type | Cost | Verification | Use case |
|---|---|---|---|
| Individual | Free (2025+) | Email + phone | Solo devs, personal apps |
| Company | Free registration (2025+) | Business verification | Apps under a legal entity, paid apps with revenue split |

> **⚠️ Version-sensitive — registration fees were removed in 2025.** Microsoft's current docs (updated 2025-07) announce **zero registration fees**, with free developer registration for individual developers and a revamped company onboarding with no registration fee. Older guides still cite the historical **one-time $19 (individual) / $99 (company)** fee — that fee no longer applies. Re-verify the current policy at signup time, since Microsoft has flip-flopped on this before.

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

The reservation generates the **product identity** — find it under **Product management → Product identity** in Partner Center. Three values matter:

```
Package/Identity/Name:  12345MyCompany.MyApp        # Package family name (minus the hash suffix)
Publisher:              CN=A1B2C3D4-E5F6-7890-...   # Publisher identity
Publisher display name: My Company                   # Human-readable publisher
```

Inject all three into your packaging config (PWA Builder fields, `msix_config` in `pubspec.yaml`, or `Package.appxmanifest`). They must match the reservation exactly. Mismatches reject at upload.

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

> **⚠️ GOTCHA — the 4th version digit (revision) MUST be 0.** Microsoft Store reserves the revision field for its own use, so `1.0.0.1` is rejected. In Flutter, `version: 1.0.0+1` in `pubspec.yaml` maps to `build-name+build-number`, and the build-number becomes that 4th digit — so Flutter's default `1.0.0.1` fails the Store. Force it to zero when building the Windows package: `flutter build windows --build-number=0`. Increment the first three digits (`1.0.1.0`, `1.1.0.0`, …) for updates instead.

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

Every MSIX must be signed with a certificate. Two options:

1. **Microsoft Store signing** (free, automatic): submit unsigned package; Microsoft signs it during certification using a Microsoft-issued cert tied to your Partner Center publisher identity. The signed package is what end-users install.
2. **Self-signed for sideload testing**: use `signtool.exe sign /a /v /fd SHA256 mypackage.msix`. Self-signed packages CAN be sideloaded for testing but CANNOT be submitted to Microsoft Store.

For PWA Builder MSIX: leave unsigned, submit as-is. Partner Center signs.

> **Note — Visual Studio no longer generates a temporary cert.** Since **Visual Studio 2019**, the packaging wizard stopped auto-creating a temporary test certificate. For local dev/test signing you now supply your own cert: generate one with the PowerShell `New-SelfSignedCertificate` cmdlet, or (better for teams) sign against a cert stored in **Azure Key Vault** so the private key never lands on a dev machine. None of this is needed for the Store path — Microsoft signs on submission — only for sideloading and internal test builds.

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

> **WACK is deprecated.** The **Windows App Certification Kit** (`appcert.exe`) is no longer maintained — run it only for optional local sanity checks, not as a required gate. The **real certification runs automatically when you upload to Partner Center**; there is no separate pre-flight tool you must pass first. Older walkthroughs present WACK as a mandatory step — treat that as legacy.

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

Total: **2-3 calendar days** typical (up to ~7 in edge cases). PWAs are usually on the faster end. New publishers face stricter review on first 1-2 submissions.

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

- **Microsoft Dev Store CLI** (`msstore`): the modern, CI-friendly path. Drive it via the `microsoft/setup-msstore-cli@v1` GitHub Action (see `cicd-setup` for the full workflow, secrets, and `reconfigure → package → publish` flow).
- **Microsoft Store Submission API** (REST): create submissions, upload packages, update listings programmatically. Auth via Azure AD app registration. Docs: https://learn.microsoft.com/en-us/windows/apps/publish/store-submission-api

> **⚠️ Version-sensitive — "Automate Store submissions" is gone from Visual Studio 2026.** The old VS wizard feature (Entra ID + Tenant ID / Client ID / Client key from Partner Center) that generated submission automation is **not supported in Visual Studio 2026**. The VS2019-era flow is still documented but legacy. For modern CI/CD, drive submissions with the **`msstore` CLI** instead — that's the path `cicd-setup` scaffolds.

Example GitHub Actions (Dev Store CLI):

```yaml
- name: Install Dev Store CLI
  uses: microsoft/setup-msstore-cli@v1
- name: Configure credentials
  run: msstore reconfigure
    --tenantId ${{ secrets.AZURE_AD_TENANT_ID }}
    --clientId ${{ secrets.AZURE_AD_CLIENT_ID }}
    --clientSecret ${{ secrets.AZURE_AD_CLIENT_SECRET }}
    --sellerId ${{ secrets.SELLER_ID }}
- name: Package and publish
  run: |
    msstore package .
    msstore publish -v
```

> **Prereq:** the app must already exist in Partner Center with at least one completed manual submission, and `msstore init` must have been run once in the repo. See `cicd-setup` for the full workflow.

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
