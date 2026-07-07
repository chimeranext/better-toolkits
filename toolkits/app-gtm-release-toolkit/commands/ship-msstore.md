---
description: "Guided Microsoft Store shipping — two paths (PWA via PWA Builder MSIX, or native Win32/UWP/MAUI MSIX). Walks through Partner Center setup, app reservation, package upload, store listing, and certification monitoring with persistent checkpoints."
argument-hint: "[--what-if | --gate N | --resume | --path A|B]"
---

# /ship-msstore — Ship to Microsoft Store

You are the **app-gtm-release** orchestrator for the Microsoft Store target.

Your job is to guide the user through Microsoft Store submission. Two distinct paths converge at the same submission flow:

- **Path A: PWA via PWA Builder** — for web apps. PWA Builder generates the MSIX. If the user already ran `/app-gtm-release:ship-pwa`, they likely have a package ready and just need this command for the Microsoft-Store-specific submission steps.
- **Path B: Native MSIX** — for Win32, UWP, .NET MAUI Windows, Tauri, Electron, or any native Windows app that produces (or can produce) an MSIX.

Both paths share Gates 0, 3, and 4 (assessment, package validation, submission). They diverge in Gates 1-2 (package preparation).

This is a 1-3 hour active process; certification adds 1-7 days wait. State persists to `./go-to-market/msstore/`.

## Mode Detection

Check `$ARGUMENTS`:
- `--what-if` → Plan-only mode
- `--gate N` → Jump to gate
- `--resume` → Read `./go-to-market/msstore/ship-plan.md` and resume
- `--path A` or `--path B` → Skip path selection in Gate 0
- No arguments → Start from assessment

## Output Directory

```
./go-to-market/msstore/
├── ship-plan.md
├── checkpoints.md
├── package/
│   └── {YourApp}_{version}_{arch}.msixbundle
├── partner-center/
│   ├── reservation.md          # Package family name + Publisher identity
│   ├── certification-log.md    # Certification reports per submission
│   └── store-listing.md        # Description, screenshots paths, keywords
└── notes/
    ├── gate-0-assessment.md
    ├── gate-1-package.md
    ├── gate-2-validation.md
    ├── gate-3-listing.md
    └── gate-4-submission.md
```

---

## GATE 0: ASSESSMENT

Ask **one question at a time**. Save answers to `./go-to-market/msstore/notes/gate-0-assessment.md`.

### Questions

1. **Path A or Path B?**
   - **A**: PWA via PWA Builder (you have a deployed HTTPS PWA URL)
   - **B**: Native (Win32 / UWP / .NET MAUI / Tauri / Electron)
   - If `--path A` or `--path B` was passed, skip this question

2. **Project source path?** (path to repo root or PWA URL for path A)

3. **Have you already run `/app-gtm-release:ship-pwa`?** (path A only)
   - If yes, find their `./go-to-market/pwa/pwa-builder-packages/windows.msix` and skip to Gate 3
   - If no, walk through PWA Builder in Gate 1

4. **Native build framework** (path B only)?
   - .NET MAUI Windows
   - UWP (legacy)
   - Win32 + Windows Application Packaging Project
   - Tauri (Rust + WebView2)
   - Electron (via electron-builder)
   - Other native (provide details)

5. **Microsoft Partner Center account status?**
   - Verified individual ($19) ready
   - Verified company ($99) ready
   - Account exists but not yet verified — wait 1-3 days before submitting
   - No account — create at https://partner.microsoft.com/en-us/dashboard/registration/
   - Decision: if no account, BLOCK gate 4 until verified

6. **App reservation status?**
   - Already reserved in Partner Center (have Package family name + Publisher identity)
   - Not yet reserved — will guide through it in Gate 3
   - Don't know — check Partner Center → Apps & Games

7. **Pricing model?**
   - Free
   - Free with ads
   - Paid (one-time)
   - Free with in-app purchases
   - Subscription
   - Affects Gate 3 store listing requirements (privacy disclosures, age rating)

8. **Markets?**
   - All 248 markets (default)
   - Subset (which countries?)
   - Test markets only first (for soft launch)

9. **First submission or update?**
   - First — full flow including reservation
   - Update of existing app — need package family name match + version bump

10. **Target Windows versions?**
    - Windows 10 + Windows 11 (default for most apps)
    - Windows 11 only (limits audience)
    - Surface Hub / Xbox / HoloLens (specialized)

### Save plan

Write `./go-to-market/msstore/ship-plan.md`:

```markdown
# Microsoft Store Ship Plan — {date}

## Path: {A|B}

## Source
- Project: {path or URL}
- Framework: {framework}

## Account
- Partner Center: {status}
- Reservation: {status}

## Package
- Will generate: {PWA Builder MSIX | native MSIX from {framework}}
- Version: {x.y.z.w}

## Pricing
- Model: {free|paid|IAP|subscription}

## Timeline
- Active work: 1-3 hours
- Wait time: 1-7 days certification (longer for first submission)
```

### --what-if exit

Save plan, print path, exit.

### Save checkpoint

```markdown
## Gate 0 — PASSED — {timestamp}
Path: {A|B}
Next: Gate 1 — Package preparation
```

---

## GATE 1: PACKAGE PREPARATION

Branches by path. Dispatch the `app-gtm-release:msstore-submission` skill for detailed guidance.

### Path A: PWA Builder

If user already has `./go-to-market/pwa/pwa-builder-packages/windows.msix` from `/ship-pwa`:
1. Copy to `./go-to-market/msstore/package/`
2. Verify version bump if this is an update
3. Skip to Gate 2

If not:
1. Direct user to https://www.pwabuilder.com/
2. Reference `msstore-submission` skill section "Path A: PWA via PWA Builder"
3. Guide through:
   - Enter PWA URL → click "Build" → "Microsoft Store"
   - Enter Package ID (Package family name from Partner Center, format `MyCompany.MyApp`)
   - Enter Publisher (Publisher identity from Partner Center, format `CN=...`)
   - Enter Version (4-part Windows version: `1.0.0.0` — NOT semver)
   - Download MSIX bundle
4. Move downloaded file to `./go-to-market/msstore/package/`

### Path B: Native MSIX

Reference `msstore-submission` skill section "Path B: Native MSIX". Branch by framework:

**.NET MAUI Windows:**
```bash
dotnet publish -f net8.0-windows10.0.19041.0 -c Release \
  -p:RuntimeIdentifierOverride=win10-x64 \
  -p:GenerateAppxPackageOnBuild=true
```
Output: `bin/Release/net8.0-windows10.0.19041.0/win10-x64/AppPackages/`

**Tauri:**
Edit `tauri.conf.json`:
```json
{
  "tauri": {
    "bundle": {
      "windows": { "msix": { "applicationId": "MyCompany.MyApp" } },
      "targets": ["msix"]
    }
  }
}
```
```bash
npm run tauri build -- --target x86_64-pc-windows-msvc
```

**Electron (via electron-builder):**
```yaml
# electron-builder.yml
appId: com.example.myapp
win:
  target: appx
  publisherName: CN=...
```
Note: produces `.appx` (legacy). For pure MSIX, use Microsoft's MSIX Packaging Tool to convert.

**Win32 / Windows Application Packaging Project:**
1. In Visual Studio: add a "Windows Application Packaging Project" alongside your Win32 project
2. Configure `Package.appxmanifest`: identity, capabilities, icons
3. Build configuration: Release × x64 (or ARM64)
4. Output: `bin/Release/AppPackages/{App}_{Version}_x64_bundle.msixbundle`

For all paths, output should be:
```
./go-to-market/msstore/package/{YourApp}_{x.y.z.w}_{arch}.msixbundle
```

### Output

Write `./go-to-market/msstore/notes/gate-1-package.md`:

```markdown
# Package Preparation — {date}

## Path: {A|B}

## Source
- {framework or PWA URL}

## Build command
```bash
{command used}
```

## Output
- File: {path}
- Size: {KB|MB}
- Version: {x.y.z.w}
- Architecture: {x64|x86|ARM64|all}

## Verification
- File exists: {yes|no}
- Format: msixbundle | msix | appxbundle
- Signed: {self-signed|unsigned for Partner Center signing|production-signed}
```

### Gate condition

**PASS** if package file exists and has correct format.
**FAIL** otherwise. Print build errors, link to `msstore-submission` skill troubleshooting.

### Save checkpoint

```markdown
## Gate 1 — {PASSED|FAILED} — {timestamp}
Package: {filename}
Next: Gate 2 — Local validation
```

---

## GATE 2: LOCAL VALIDATION

Validate the MSIX before uploading to Partner Center (catch issues that would otherwise delay certification).

### Steps

1. **Inspect manifest with MakeAppx.exe** (Windows SDK tool):
   ```powershell
   MakeAppx.exe unpack /p .\YourApp.msixbundle /d .\unpacked
   cat .\unpacked\AppxManifest.xml
   ```
   Verify:
   - `Identity Name` matches Package family name from Partner Center
   - `Identity Publisher` matches Publisher identity
   - `Identity Version` is 4-part numeric
   - `Capabilities` declared match what the app actually uses (extra capabilities → reject)
   - `Applications/Application/uap:VisualElements` has all required icons referenced

2. **Sideload install on a clean Windows 11 VM**:
   ```powershell
   Add-AppxPackage -Path .\YourApp.msixbundle
   ```
   - Launch app from Start menu
   - Smoke test: app opens, doesn't crash, basic functionality works
   - Uninstall: Settings → Apps → uninstall

3. **Run Windows App Certification Kit (WACK)**:
   - Free Microsoft tool: download from Windows SDK
   - Run: `Microsoft App Certification Kit` → "Validate Store Apps"
   - Tests: package format, capabilities mismatch, performance, accessibility
   - Output: PASS/FAIL report. Resolve all FAILs before submitting (Microsoft runs WACK on their side too).

### Output

Write `./go-to-market/msstore/notes/gate-2-validation.md`:

```markdown
# Local Validation — {date}

## Manifest inspection
- Identity Name: {value} | Matches reservation: {yes|no}
- Publisher: {value} | Matches reservation: {yes|no}
- Version: {value}
- Capabilities: {list}

## Sideload test
- Install: {pass|fail}
- Launch: {pass|fail}
- Smoke test: {pass|fail}
- Uninstall clean: {pass|fail}

## WACK results
- Overall: {PASS|FAIL}
- Failures: {list}
- Warnings: {list}

## Issues
- ...
```

### Gate condition

**PASS** if manifest matches Partner Center reservation, sideload install + launch works, WACK passes (warnings ok).
**FAIL** otherwise.

### Save checkpoint

```markdown
## Gate 2 — {PASSED|FAILED} — {timestamp}
WACK: {PASS|FAIL}
Sideload: {PASS|FAIL}
Next: Gate 3 — Store listing prep
```

---

## GATE 3: STORE LISTING PREPARATION

Microsoft Store requires comprehensive metadata. Prepare it before opening Partner Center to avoid losing flow.

Dispatch `app-gtm-release:store-listing` skill for general guidance, then add Microsoft-specific requirements.

### Store listing fields

Prepare each in `./go-to-market/msstore/partner-center/store-listing.md`:

1. **Display name** (≤ 256 chars) — usually matches `name` from manifest
2. **Description** (≤ 10,000 chars) — supports basic HTML (`<b>`, `<i>`, `<ul>`, `<li>`)
3. **Short description** (≤ 200 chars) — shown in search results
4. **What's new in this version** (≤ 1500 chars) — release notes
5. **Categories**:
   - Primary (1 of: Books & reference, Business, Developer tools, Education, Entertainment, Food & dining, Government & politics, Health & fitness, Kids & family, Lifestyle, Medical, Multimedia design, Music, Navigation & maps, News & weather, Personal finance, Personalization, Photo & video, Productivity, Security, Shopping, Social, Sports, Travel, Utilities & tools, Weather)
   - Optional secondary
6. **Screenshots** (at least 1, max 10 per device type):
   - Desktop: 1366x768 to 3840x2160 pixels
   - Mobile: 768x1280 to 2560x1440
   - Path: `./go-to-market/msstore/partner-center/screenshots/desktop-{n}.png`
7. **Store logos**:
   - Required: 300x300 PNG (square logo)
   - Optional: 2400x1200 PNG (for spotlight features)
8. **Trailer** (optional): 30-second video, 720p+
9. **Search keywords** (≤ 7 single words or short phrases)
10. **Copyright notice**
11. **Trademark notices** (if using trademarked names)
12. **Additional license terms** (if open-source dependencies require disclosure)
13. **Privacy policy URL** (required if app collects ANY data, including telemetry)
14. **Support contact info** (email or URL)
15. **Website URL** (optional but recommended)

### Age rating questionnaire

Mandatory. Takes 5-10 minutes. Answer honestly — Microsoft cross-checks against your app's actual content.

Categories of questions:
- Violence (none / mild / fantasy / realistic / brutal)
- Sex / nudity (none / suggestive / non-explicit / explicit)
- Profanity (none / mild / moderate / extreme)
- Drugs / alcohol (none / referenced / used)
- Gambling (none / simulated / real-money)
- Online interactions (none / chat / unrestricted)
- User-generated content (none / moderated / unmoderated)
- Sharing of personal information (none / opt-in / required)

Result: combined ratings for IARC (international) + ESRB (US) + PEGI (EU) + others.

### Output

Write `./go-to-market/msstore/partner-center/store-listing.md`:

```markdown
# Store Listing — {date}

## Display name: {name}

## Short description (≤ 200 chars)
{text}

## Description (≤ 10,000 chars)
{full text}

## Category: {primary} / {secondary}

## Screenshots ({count} desktop, {count} mobile)
- desktop-1.png: {description}
- desktop-2.png: {description}
- mobile-1.png: {description}

## Store logos
- 300x300: {path}
- 2400x1200: {path|N/A}

## Keywords ({count}/7)
- {kw1}, {kw2}, ...

## Privacy policy
- URL: {url}

## Age rating answers
- IARC: {result}
- ESRB: {result}
- PEGI: {result}

## What's new
{text for first version or update notes}
```

### Gate condition

**PASS** if all required fields are prepared and screenshots exist at correct resolutions.
**FAIL** if missing required fields or invalid screenshot dimensions.

### Save checkpoint

```markdown
## Gate 3 — {PASSED|FAILED} — {timestamp}
Listing fields: {complete|missing X}
Screenshots: {N desktop, N mobile}
Age rating: {complete}
Next: Gate 4 — Submit
```

---

## GATE 4: SUBMIT TO PARTNER CENTER

Final gate. User does the dashboard work; you guide and validate.

### Steps

1. **Open Partner Center** → My apps → click app

2. **Pricing and availability**:
   - Markets: per Gate 0 answer
   - Visibility: Public (default), Hidden, Private
   - Pricing: per Gate 0 answer
   - Click Save

3. **Properties**:
   - Category from Gate 3
   - Subcategory if applicable
   - System requirements (recommended hardware/software)
   - Click Save

4. **Age ratings**: paste answers from Gate 3 questionnaire (or re-do)

5. **Packages**:
   - Upload `./go-to-market/msstore/package/{YourApp}.msixbundle`
   - Wait for upload to complete + initial validation (1-2 min)
   - If errors at this stage: Partner Center surfaces them inline. Fix in package, re-upload.
   - Choose mandatory update or optional
   - Optional: configure flighting (specific groups receive new package first)

6. **Store listings** (per language; default is English):
   - Paste fields from Gate 3 store-listing.md
   - Upload screenshots
   - Upload logos
   - For multi-language support: clone listing, translate, save per language

7. **Submission options**:
   - Publication date: now / specific date
   - Mandatory update: yes / no
   - Notes for certification team (optional but useful for borderline cases — explain unique features, justify capabilities)

8. **Submit** → "Submit to the Store"

### Track certification

Partner Center shows real-time status:
- **Pre-processing** (minutes): metadata validation
- **Certification** (1-7 days): security scan + technical + content compliance
- **Released** (after publish date or on certification pass if "automatic")

If rejected, Partner Center shows a detailed report. Common codes are documented in the `msstore-submission` skill.

### Output

Append to `./go-to-market/msstore/partner-center/certification-log.md`:

```markdown
## Submission #{n} — {date}

### Package
- Version: {x.y.z.w}
- Path: {filename}

### Status timeline
- Submitted: {timestamp}
- Pre-processing: {timestamp} → {pass|fail}
- Certification started: {timestamp}
- Certification finished: {timestamp} → {pass|fail|reject reason}
- Released: {timestamp|TBD}

### Store URL
{https://apps.microsoft.com/...}

### Notes
{anything notable}
```

### Gate condition

**PASS** when submission accepted and "Pre-processing" passed.
**TRACK** while in Certification.
**FAIL** if rejected; capture reason, plan fix, re-submit.

### Save checkpoint

```markdown
## Gate 4 — {PASSED|TRACKING} — {timestamp}
Submission ID: {value}
Status: {Pre-processing|Certification|Released}
Next: monitor Partner Center for certification result
```

---

## Post-Submission

While waiting for certification:

1. Set up post-launch monitoring (telemetry, crash reporting integrated with Application Insights or Sentry)
2. Prepare your launch announcement (product page, social, blog)
3. If you have a Phase 1 multi-store launch, run `/app-gtm-release:ship-pwa` or `/app-gtm-release:ship-snap` in parallel — Microsoft Store certification doesn't block Google Play or Snap submissions

After certification passes:

1. App is live at `https://apps.microsoft.com/store/detail/{product-id}`
2. Track installs, ratings, reviews via Partner Center → Insights
3. Plan first patch update (typical: bugfix release within 2 weeks of launch to address early-adopter reports)

Print final summary:

```markdown
Microsoft Store submission complete.

- Path: {A|B}
- Submission status: {Released|In certification}
- Store URL: {url|TBD}
- Next: monitor Partner Center, plan patch v{x.y.z.w+1}

State saved to: ./go-to-market/msstore/
```

---

## Edge cases

- **App already exists in MS Store** (you're updating but don't have local clone): clone reservation metadata (Package family name, Publisher identity) into a new project; build new MSIX matching that identity; submit as update.
- **Wanting to deprecate / remove from store**: Partner Center → My apps → Pricing → set "Visibility: Hidden" or unpublish. Existing installs continue working. To force-uninstall remotely is not possible.
- **Multiple distinct apps from same publisher**: each gets its own reservation. Publisher identity is shared; Package family names differ.
- **Can't pass WACK validation**: usually capabilities mismatch. Open AppxManifest.xml, verify only declare capabilities you actually use. Common false-positive: `internetClient` declared but app never makes outbound HTTP — remove the capability.
