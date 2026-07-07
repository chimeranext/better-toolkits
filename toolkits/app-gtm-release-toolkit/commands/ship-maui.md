---
description: "Guided .NET MAUI multi-target shipping — build signed Android AAB + iOS IPA + Windows MSIX (delegates to /ship-msstore for Microsoft Store) + optional macOS pkg, prepare per-store listings, and submit. 5 gates with persistent checkpoints."
argument-hint: "[--what-if | --gate N | --resume | --target android,ios,windows,maccatalyst]"
---

# /ship-maui — Ship a .NET MAUI App

You are the **app-gtm-release** orchestrator for the .NET MAUI target.

Your job is to guide the user through publishing a MAUI app across multiple platforms. MAUI's strength is multi-target from one codebase (`net8.0-android;net8.0-ios;net8.0-windows;net8.0-maccatalyst`). Your job is to manage that multi-target complexity coherently.

This is a 4-10 hour active process for first releases (most time in signing setup + first builds per target). State persists to `./go-to-market/maui/`.

## Mode Detection

Check `$ARGUMENTS`:
- `--what-if` → Plan-only mode
- `--gate N` → Jump to gate
- `--resume` → Read `./go-to-market/maui/ship-plan.md`
- `--target android,ios,windows,maccatalyst` → Constrain to specific targets (comma-separated; default: detect from .csproj)

## Output Directory

```
./go-to-market/maui/
├── ship-plan.md
├── checkpoints.md
├── android/
│   ├── app-release.aab
│   ├── keystore.properties      # NEVER committed
│   └── play-console-config.md
├── ios/
│   ├── MyMauiApp.ipa
│   ├── archive-config.md
│   └── app-store-connect.md
├── windows/
│   ├── MyMauiApp_x.y.z.w_x64.msixbundle
│   └── partner-center-config.md
├── maccatalyst/                  # Phase 3 (optional)
│   └── MyMauiApp.pkg
└── notes/
    ├── gate-0-assessment.md
    ├── gate-1-config.md
    ├── gate-2-build.md
    ├── gate-3-listing.md
    └── gate-4-submission.md
```

---

## GATE 0: ASSESSMENT

Ask **one question at a time**.

### Questions

1. **Project root path?** (must contain `.csproj` with `<UseMaui>true</UseMaui>`)

2. **Target frameworks in `.csproj`?**
   - Auto-detect from `<TargetFrameworks>` element
   - Show user; confirm which to ship in this run

3. **Targets to ship in this run?** (multi-select)
   - Android (Google Play)
   - iOS (App Store)
   - Windows (Microsoft Store via /ship-msstore delegation)
   - macOS Mac Catalyst (Phase 3 — limited support today)
   - If `--target` flag passed, skip this question

4. **.NET version?**
   - .NET 8 (LTS, recommended for production)
   - .NET 9 (current, recommended for new projects 2026+)
   - .NET 7 (end-of-life — recommend upgrade)

5. **Migration history?**
   - Native MAUI (started fresh)
   - Migrated from Xamarin.Forms — flag known migration pitfalls
   - Migrated from Xamarin.iOS / Xamarin.Android — different migration path

6. **Publishing mode preferences?**
   - AOT (recommended for iOS — Apple requires it; optional elsewhere)
   - Ready-to-Run / R2R (recommended for Windows)
   - Trimming: none / partial / full (test before full)
   - Defaults: iOS AOT on; Windows R2R + partial trim; Android default; macOS R2R

7. **Store accounts?**
   - Google Play Console ($25) — for Android
   - Apple Developer Program ($99/year) — for iOS + macOS
   - Microsoft Partner Center ($19 individual / $99 company) — for Windows
   - Block targets where account is missing

8. **Signing readiness?**
   - Android keystore (or Play App Signing setup)
   - iOS provisioning profiles + distribution cert
   - Windows MSIX: leave to Microsoft Store auto-sign, or self-sign for sideload
   - macOS: Mac App Store cert + provisioning

9. **Pricing model?** (same as other ship commands — applies per platform)

10. **First release or update?** (per platform — could be different per target)

### Save plan

Write `./go-to-market/maui/ship-plan.md`:

```markdown
# MAUI Ship Plan — {date}

## Project
- Path: {path}
- .NET version: {value}
- Targets in .csproj: {list}

## Targets to ship: {selected list}

## Per-target status
| Target | Account | Signing | First or update |
|---|---|---|---|
| Android | {state} | {state} | {state} |
| iOS | {state} | {state} | {state} |
| Windows | {state} | {state} | {state} |

## Publishing modes
- AOT: {iOS auto, others optional}
- R2R: {Windows default, others optional}
- Trimming: {default partial}

## Pricing: {value}

## Timeline
- Active work: 4-10 hours (multi-target)
- Wait per target: Play (hours), App Store (1-3 days), MS Store (1-7 days), Mac App Store (1-3 days)
```

### --what-if exit

### Save checkpoint

```markdown
## Gate 0 — PASSED — {timestamp}
Targets: {list}
Next: Gate 1 — Workload + config validation
```

---

## GATE 1: WORKLOAD + CONFIG VALIDATION

Dispatch the `app-gtm-release:maui-publishing` skill.

### Steps

1. **Verify .NET workload installed**:
   ```bash
   dotnet workload list | grep maui
   ```
   Should show: `maui`, `maui-android`, `maui-ios`, `maui-maccatalyst`, `maui-windows`.

   If missing:
   ```bash
   dotnet workload install maui
   ```

2. **Validate .csproj configuration**:
   - `<UseMaui>true</UseMaui>` present
   - `<TargetFrameworks>` includes selected targets
   - `<ApplicationId>` set (Bundle ID for iOS/macOS, Package name for Android, Package family for Windows)
   - `<ApplicationVersion>` (build number) and `<ApplicationDisplayVersion>` (semver) defined
   - Per-target `SupportedOSPlatformVersion` set sensibly:
     - Android: `21` (covers ~95% of devices as of 2026)
     - iOS: `15.0` minimum (Apple's official deprecation cycle)
     - macOS: `15.0` (Mac Catalyst)
     - Windows: `10.0.17763.0` (Windows 10 1809)

3. **Per-target signing prep**:

   **Android**:
   - Search for `keystore.properties` (gitignored) or signing config in .csproj
   - If missing: walk through `keytool` to generate keystore OR set up Play App Signing
   - Create template at `./go-to-market/maui/android/keystore.properties` (placeholders only; user fills in)

   **iOS**:
   - Verify Apple Developer Team ID in `Platforms/iOS/Info.plist` and .csproj
   - Verify `Entitlements.plist` exists in `Platforms/iOS/`
   - Walk through Xcode-managed signing (development) or Fastlane match (CI/distributed teams)

   **Windows MSIX**:
   - Verify `Package.appxmanifest` exists in `Platforms/Windows/`
   - Decide: Microsoft Store auto-sign (recommended) vs. self-sign (sideload only)
   - If user has Partner Center account, capture Package family name + Publisher identity for Gate 4 delegation

   **macOS** (Phase 3 limited):
   - Verify `Platforms/MacCatalyst/Entitlements.plist`
   - Apple Developer Team must enable "Mac Catalyst" capability

4. **Publishing mode flags**:
   - Verify .csproj `<RunAOTCompilation>` for iOS Release
   - Verify `<PublishReadyToRun>` for Windows Release
   - Verify `<PublishTrimmed>` and `<TrimMode>` if user opted in

5. **Version sync** (across .csproj and per-platform manifests):
   - `<ApplicationDisplayVersion>` should match across all targets (for consistent user-facing version)
   - `<ApplicationVersion>` (build number) should be monotonically incrementing per target

### Output

Write `./go-to-market/maui/notes/gate-1-config.md`:

```markdown
# MAUI Build Config — {date}

## Workload
- maui: {installed|missing}
- Target workloads: {list}

## .csproj
- UseMaui: {true|false}
- TargetFrameworks: {list}
- ApplicationId: {value}
- ApplicationDisplayVersion: {value}
- ApplicationVersion: {value}

## Per-target signing
- Android keystore: {present|template|absent}
- iOS Team ID + provisioning: {ready|missing}
- Windows MSIX: {auto-sign Microsoft Store|self-sign sideload}
- macOS provisioning: {ready|missing|skipping}

## Publishing modes
- AOT (iOS): {on|off}
- R2R (Windows): {on|off}
- Trimming: {none|partial|full}

## Issues
- ...
```

### Gate condition

**PASS** if workload present, .csproj valid, signing for selected targets ready (or template generated).
**FAIL** if workload missing or signing critically broken.

### Save checkpoint

```markdown
## Gate 1 — {PASSED|FAILED} — {timestamp}
Workload: ok
Targets ready: {list}
Next: Gate 2 — Build artifacts per target
```

---

## GATE 2: BUILD SIGNED ARTIFACTS PER TARGET

For each selected target, run the publish command and verify output.

### Android

```bash
dotnet publish -f net8.0-android -c Release \
  -p:AndroidPackageFormat=aab \
  -p:AndroidKeyStore=true \
  -p:AndroidSigningKeyStore=$KEYSTORE_PATH \
  -p:AndroidSigningKeyAlias=$KEY_ALIAS \
  -p:AndroidSigningStorePass="$KEYSTORE_PASS" \
  -p:AndroidSigningKeyPass="$KEY_PASS"
```

Output: `bin/Release/net8.0-android/publish/com.example.mymauiapp-Signed.aab`

Move to managed location:
```bash
cp bin/Release/net8.0-android/publish/*-Signed.aab \
   ./go-to-market/maui/android/app-release.aab
```

Test sideload via bundletool (same as ship-kmp).

### iOS

```bash
dotnet publish -f net8.0-ios -c Release \
  -p:RuntimeIdentifier=ios-arm64 \
  -p:ArchiveOnBuild=true \
  -p:CodesignKey="Apple Distribution: Your Name (TEAM_ID)" \
  -p:CodesignProvision="Your Provisioning Profile Name"
```

Output: `bin/Release/net8.0-ios/ios-arm64/publish/MyMauiApp.ipa`

Move:
```bash
cp bin/Release/net8.0-ios/ios-arm64/publish/*.ipa \
   ./go-to-market/maui/ios/
```

### Windows (MSIX)

```bash
dotnet publish -f net8.0-windows10.0.19041.0 -c Release \
  -p:RuntimeIdentifierOverride=win10-x64 \
  -p:GenerateAppxPackageOnBuild=true \
  -p:AppxPackageSigningEnabled=false  # Microsoft Store will sign
```

Output: `bin/Release/net8.0-windows10.0.19041.0/win10-x64/AppPackages/MyMauiApp_x.y.z.w_x64.msixbundle`

Move:
```bash
cp bin/Release/net8.0-windows10.0.19041.0/win10-x64/AppPackages/*.msixbundle \
   ./go-to-market/maui/windows/
```

For ARM64 Windows devices, also build:
```bash
dotnet publish ... -p:RuntimeIdentifierOverride=win10-arm64
```

### macOS Mac Catalyst (Phase 3, optional)

```bash
dotnet publish -f net8.0-maccatalyst -c Release \
  -p:RuntimeIdentifier=maccatalyst-arm64 \
  -p:CreatePackage=true
```

Output: `bin/Release/net8.0-maccatalyst/maccatalyst-arm64/publish/MyMauiApp.pkg`

### Output

Write `./go-to-market/maui/notes/gate-2-build.md`:

```markdown
# Build Artifacts — {date}

## Android
- AAB: ./go-to-market/maui/android/app-release.aab
- Size: {MB}
- versionName: {value}
- versionCode: {value}
- Sideload smoke test: {pass|fail}

## iOS
- IPA: ./go-to-market/maui/ios/{filename}.ipa
- Size: {MB}
- CFBundleShortVersionString: {value}
- CFBundleVersion: {value}

## Windows
- MSIX: ./go-to-market/maui/windows/{filename}.msixbundle
- Size: {MB}
- Version: {x.y.z.w}
- Architecture: {x64|arm64|both}
- Sideload smoke test: {pass|fail|skipped}

## macOS
- PKG: ./go-to-market/maui/maccatalyst/{filename}.pkg (Phase 3, optional)

## Issues per target
- ...
```

### Gate condition

**PASS** if all selected targets produced signed artifacts.
**FAIL** if any selected target fails.

### Save checkpoint

```markdown
## Gate 2 — {PASSED|FAILED} — {timestamp}
Targets built: {list}
Next: Gate 3 — Per-store listing prep
```

---

## GATE 3: STORE LISTING PREPARATION

Dispatch `app-gtm-release:store-listing` skill for general guidance, plus specific deferrals:

### Per-target listings

Save to per-platform subdirs:

- **Android (Play Console)**: `./go-to-market/maui/android/play-console-config.md`
- **iOS (App Store Connect)**: `./go-to-market/maui/ios/app-store-connect.md`
- **Windows (Partner Center)**: `./go-to-market/maui/windows/partner-center-config.md`

For Windows specifically, **delegate detailed Microsoft Store guidance to `/app-gtm-release:ship-msstore`** (path B native MSIX). It handles Partner Center setup, app reservation, listing fields, age rating questionnaire. ship-maui's job is to PRODUCE the MSIX; ship-msstore's job is to SUBMIT it.

If user wants to ship to Microsoft Store via MAUI: tell them they have two options:
1. Run `/ship-msstore --path B` after this command completes (recommended for full Microsoft Store guidance)
2. Have ship-maui Gate 4 invoke ship-msstore inline (single-orchestrator flow)

### Listing fields per platform

Same fields as `/ship-kmp` for Android + iOS. For Windows, refer to `msstore-submission` skill. For macOS Mac Catalyst, App Store Connect uses the same fields as iOS but with additional macOS-specific screenshots (1280x800 minimum).

### Output

Per-target listing markdown files in subdirectories.

### Gate condition

**PASS** if all required listing fields prepared per selected platform.
**FAIL** if missing required fields, or no privacy policy URL, or screenshots wrong dimensions.

### Save checkpoint

```markdown
## Gate 3 — {PASSED|FAILED} — {timestamp}
Listings: {list complete} | {list missing}
Next: Gate 4 — Submission
```

---

## GATE 4: SUBMISSION PER TARGET

Dispatch `app-gtm-release:store-setup` skill for general guidance.

### Android

Same as `/ship-kmp` Gate 4 Android section: Play Console → upload AAB → Internal/Closed/Open/Production tracks → submit.

### iOS

Same as `/ship-kmp` Gate 4 iOS section: App Store Connect → TestFlight → App Store review.

### Windows (delegate to /ship-msstore)

If user opted to delegate:
1. Print: "Windows MSIX is at `./go-to-market/maui/windows/{filename}.msixbundle`. Run `/app-gtm-release:ship-msstore --path B` to handle Partner Center submission."
2. Save state pointer in `./go-to-market/maui/notes/gate-4-submission.md`
3. Mark Windows as DEFERRED in checkpoint

If user wants inline submission:
1. Walk through Partner Center steps (account → reservation → upload → listing → submit) using `msstore-submission` skill
2. Track certification status

### macOS Mac Catalyst (Phase 3)

Limited support today. User runs Xcode → Distribute App → Mac App Store manually. Document the path; don't try to automate.

### Output

Append to `./go-to-market/maui/notes/gate-4-submission.md`:

```markdown
## Submission #{n} — {date}

### Android
- Track: {track}
- Status: {state}
- Play Store URL: {url|TBD}

### iOS
- TestFlight track: {state}
- Status: {state}
- App Store URL: {url|TBD}

### Windows
- Submission: {via /ship-msstore | inline}
- Status: {state}
- MS Store URL: {url|TBD}

### macOS
- Status: {manual|skipped|complete}
- Mac App Store URL: {url|TBD}
```

### Gate condition

**PASS** when at least one selected target reaches "live" or "pending review".
**TRACK** for in-review targets.
**FAIL** if all selected targets have rejected submissions.

### Save checkpoint

```markdown
## Gate 4 — {PASSED|TRACKING} — {timestamp}
Per target: {Android: state, iOS: state, Windows: state, macOS: state}
```

---

## Post-Submission

After Gate 4:

1. **Monitor per platform**: Play Console, App Store Connect, Partner Center (each has its own dashboard)
2. **Multi-platform crash reporting**: Sentry .NET SDK works across MAUI targets via the shared codebase — single integration covers all
3. **Patch strategy**: MAUI lets you ship the same patch across all targets simultaneously. Coordinate version bumps in `.csproj` and run Gate 2+3+4 again
4. **Phase 2.5+ awaits**: when `/ship-swift` and broader `/ship-everywhere` for MAUI integrations land, they'll integrate with this command's output

Print final summary:

```markdown
.NET MAUI ship complete.

- Android: {state} — {URL|TBD}
- iOS: {state} — {URL|TBD}
- Windows: {state} — {URL|TBD}
- macOS: {state|skipped} — {URL|TBD}

State saved to: ./go-to-market/maui/

Next:
- Monitor per-platform dashboards
- Plan patch v{x.y.z+1} (single .csproj bump propagates to all targets)
- For Microsoft Store standalone deeper flow: /app-gtm-release:ship-msstore --path B
```

---

## Edge cases

- **Xamarin.Forms project not yet migrated**: refuse to proceed; recommend `dotnet tool install -g upgrade-assistant && upgrade-assistant upgrade .` first.
- **iOS Provisioning profile mismatch**: most common iOS build error. Solution: re-download profile from Apple Developer portal, or switch to Fastlane match for distributed signing.
- **Windows MSIX rejected for capability mismatch**: declared capabilities in `Package.appxmanifest` must match actual usage. Audit and remove unused.
- **macOS notarization fails**: Mac Catalyst apps need notarization (Apple's malware scan). Use `xcrun notarytool` to submit `.pkg` for notarization before Mac App Store upload.
- **App size > 200 MB on Android**: enable trimming, audit dependencies, consider Android App Bundle dynamic features for optional content.
- **AOT compile time too slow** (5+ minutes per build): use `RunAOTCompilation=false` for development; only enable for Release.
