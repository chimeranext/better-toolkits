---
description: "Guided Kotlin Multiplatform shipping — validate Gradle config + iOS framework integration, build signed Android AAB + iOS IPA, prepare store listings, and submit to Google Play + App Store. 5 gates with persistent checkpoints."
argument-hint: "[--what-if | --gate N | --resume | --target android|ios|both]"
---

# /ship-kmp — Ship a Kotlin Multiplatform App

You are the **app-gtm-release** orchestrator for the Kotlin Multiplatform (KMP / KMM) target.

Your job is to guide the user through publishing a KMP app to Google Play (Android) and Apple App Store (iOS). KMP shares business logic in Kotlin; UI is typically native per platform (Jetpack Compose for Android, SwiftUI for iOS), with optional Compose Multiplatform for shared UI.

This is a 4-8 hour active process for first releases (mostly in Gradle/Xcode config + first signed builds). State persists to `./go-to-market/kmp/`.

## Mode Detection

Check `$ARGUMENTS`:
- `--what-if` → Plan-only mode
- `--gate N` → Jump to gate
- `--resume` → Read `./go-to-market/kmp/ship-plan.md`
- `--target android|ios|both` → Constrain to specific platform (default: both)

## Output Directory

```
./go-to-market/kmp/
├── ship-plan.md
├── checkpoints.md
├── android/
│   ├── app-release.aab        # Signed Android App Bundle
│   ├── keystore.properties    # NEVER committed
│   └── play-console-config.md # Listing fields
├── ios/
│   ├── iosApp.xcarchive/      # Xcode archive
│   ├── iosApp.ipa             # Exported IPA
│   └── app-store-connect.md   # Listing fields
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

1. **Project root path?** (must contain `settings.gradle.kts` with `shared`, `androidApp`, optionally `iosApp/`)

2. **Which targets?**
   - Android only
   - iOS only
   - Both (default)
   - If `--target` flag passed, skip this question

3. **Kotlin and AGP versions?** (should match latest stable; older versions have known KMP gotchas)
   - Auto-detect from `gradle/libs.versions.toml` or `gradle.properties`
   - Recommend: Kotlin 2.0.21+, AGP 8.7.x+

4. **iOS UI approach?**
   - SwiftUI (recommended)
   - UIKit (legacy)
   - Compose Multiplatform (still maturing for iOS)

5. **iOS framework integration approach?**
   - CocoaPods (most common, simplest)
   - Swift Package Manager (modern, fewer downstream issues)
   - Direct framework embed (legacy, brittle)
   - Don't know — let `kmp-build` skill detect

6. **Store accounts?**
   - Google Play Console ($25 one-time) — required for Android
   - Apple Developer Program ($99/year) — required for iOS
   - Block gates that need missing accounts

7. **Signing configured?**
   - Android: keystore + key alias ready (use Play App Signing for new apps)
   - iOS: Apple Developer team ID, provisioning profiles, distribution certificate
   - If first release, walk through both in Gate 2

8. **Versioning strategy?**
   - Single source of truth in `libs.versions.toml` (recommended)
   - Separate Android `versionName` + iOS `CFBundleShortVersionString`
   - Sync script for both
   - User picks; influences Gate 2 build prep

9. **First release or update?**
   - First — full flow including Play Console + App Store Connect setup
   - Update — needs version bump + signing key match

10. **Pricing model?**
    - Free
    - Free with ads
    - Paid (one-time)
    - Free with in-app purchases (use `app-gtm-release:monetization` skill — RevenueCat works for KMP via shared module)
    - Subscription

### Save plan

Write `./go-to-market/kmp/ship-plan.md`:

```markdown
# KMP Ship Plan — {date}

## Project
- Path: {path}
- Target(s): {android|ios|both}
- Kotlin: {version}
- AGP: {version}

## iOS
- UI: {SwiftUI|UIKit|Compose Multiplatform}
- Framework integration: {CocoaPods|SPM|direct}

## Stores
- Google Play: {ready|need account|N/A}
- App Store: {ready|need account|N/A}

## Signing
- Android keystore: {ready|first time|missing}
- iOS provisioning: {ready|first time|missing}

## Pricing: {free|paid|IAP|subscription}

## Timeline
- Active work: 4-8 hours
- Wait: Play (hours), App Store (1-3 days review)
```

### --what-if exit

Save plan, exit.

### Save checkpoint

```markdown
## Gate 0 — PASSED — {timestamp}
Targets: {value}
iOS UI: {value}
Next: Gate 1 — Build config validation
```

---

## GATE 1: BUILD CONFIG VALIDATION

Dispatch the `app-gtm-release:kmp-build` skill.

### Steps

1. **Inspect Gradle config** (`shared/build.gradle.kts`, `androidApp/build.gradle.kts`):
   - Multiplatform plugin applied
   - Targets declared: at least `androidTarget()` + iOS targets if iOS in scope
   - Source sets exist: `commonMain`, `androidMain`, `iosMain` (or `appleMain`)
   - Compile SDK 35+, min SDK 24+ (Android requirements for new submissions)

2. **iOS framework configuration**:
   - Per Gate 0 answer (CocoaPods / SPM / direct):
     - **CocoaPods**: verify `iosApp/Podfile` exists with `pod 'shared'`; verify `kotlin-cocoapods` plugin in shared module
     - **SPM**: verify XCFramework build target exists
     - **Direct**: warn user about brittleness; offer to migrate to CocoaPods

3. **Android signing readiness**:
   - Search for `keystore.properties` (gitignored) or `signingConfigs` in `androidApp/build.gradle.kts`
   - If first release: walk through `keytool` to generate keystore (or recommend Play App Signing — Google holds the upload key, you keep a separate "upload" key)
   - Save signing config path to `./go-to-market/kmp/android/keystore.properties` template (with placeholders, NEVER actual secrets)

4. **iOS signing readiness**:
   - Verify Apple Developer Team ID in Xcode project (`PRODUCT_BUNDLE_IDENTIFIER`, `DEVELOPMENT_TEAM`)
   - Recommend: enable "Automatically manage signing" for development; use distribution provisioning profile for archive
   - For Xcode Cloud / CI: use match (Fastlane) or App Store Connect API key

5. **Version sync**:
   - Single source: define versions in `gradle/libs.versions.toml` under `[versions]`
   - Sync to iOS Info.plist via Build Phase script (see kmp-build skill)
   - Verify `versionName` (Android) matches `CFBundleShortVersionString` (iOS)

### Output

Write `./go-to-market/kmp/notes/gate-1-config.md`:

```markdown
# KMP Build Config Validation — {date}

## Gradle
- Plugin applied: {pass|fail}
- Targets: {list}
- Source sets: {list}
- Compile SDK: {value}
- Min SDK: {value}

## iOS framework
- Approach: {CocoaPods|SPM|direct}
- Configured: {pass|fail}
- iosApp.xcworkspace exists: {yes|no}

## Signing
- Android keystore: {present|absent|placeholder}
- iOS Team ID: {value|missing}
- iOS provisioning profile: {automatic|manual|missing}

## Versioning
- Source of truth: {libs.versions.toml|gradle.properties|manual}
- Android versionName: {value}
- iOS CFBundleShortVersionString: {value}
- In sync: {yes|no|needs script}

## Issues
- ...
```

### Gate condition

**PASS** if Gradle config valid, iOS framework approach configured, signing artifacts present (or template generated), versions sync.
**FAIL** otherwise. Common failures:
- Missing `kotlin-cocoapods` plugin → install
- iOS Team ID missing → user must enroll in Apple Developer
- Version sync broken → install build phase script

### Save checkpoint

```markdown
## Gate 1 — {PASSED|FAILED} — {timestamp}
Gradle: {pass|fail}
iOS framework: {approach}
Signing: {ready|template}
Next: Gate 2 — Build signed artifacts
```

---

## GATE 2: BUILD SIGNED ARTIFACTS

### Android build

```bash
cd {project root}
./gradlew :androidApp:bundleRelease
```

Verify output:
```bash
ls -lh androidApp/build/outputs/bundle/release/androidApp-release.aab
```

Move to managed location:
```bash
cp androidApp/build/outputs/bundle/release/androidApp-release.aab \
   ./go-to-market/kmp/android/app-release.aab
```

Test the AAB locally:
```bash
# Convert AAB to APK for sideload (requires bundletool)
java -jar bundletool.jar build-apks \
  --bundle=./go-to-market/kmp/android/app-release.aab \
  --output=./go-to-market/kmp/android/app.apks
java -jar bundletool.jar install-apks --apks=./go-to-market/kmp/android/app.apks
```

Smoke test on a device or emulator.

### iOS build

If using CocoaPods, ensure dependencies are installed:
```bash
cd iosApp && pod install && cd ..
```

Build the iOS framework:
```bash
./gradlew :shared:linkReleaseFrameworkIosArm64
```

Archive in Xcode:
```bash
xcodebuild -workspace iosApp/iosApp.xcworkspace \
           -scheme iosApp \
           -configuration Release \
           -archivePath ./go-to-market/kmp/ios/iosApp.xcarchive \
           archive
```

Export IPA:

`iosApp/ExportOptions.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store-connect</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>uploadSymbols</key>
    <true/>
</dict>
</plist>
```

```bash
xcodebuild -exportArchive \
           -archivePath ./go-to-market/kmp/ios/iosApp.xcarchive \
           -exportPath ./go-to-market/kmp/ios/ \
           -exportOptionsPlist iosApp/ExportOptions.plist
```

### Output

Write `./go-to-market/kmp/notes/gate-2-build.md`:

```markdown
# Build Output — {date}

## Android
- AAB: ./go-to-market/kmp/android/app-release.aab
- Size: {MB}
- versionName: {value}
- versionCode: {value}
- Sideload smoke test: {pass|fail|skipped}

## iOS
- xcarchive: ./go-to-market/kmp/ios/iosApp.xcarchive
- IPA: ./go-to-market/kmp/ios/iosApp.ipa
- Size: {MB}
- CFBundleShortVersionString: {value}
- CFBundleVersion: {value}

## Issues
- ...
```

### Gate condition

**PASS** if both targets (or selected target) produced signed artifacts and pass smoke test.
**FAIL** otherwise. Common: signing errors (mismatched keystore alias, expired iOS cert), Gradle build failures (kotlinx version conflict), Xcode archive issues (missing capabilities).

### Save checkpoint

```markdown
## Gate 2 — {PASSED|FAILED} — {timestamp}
Android AAB: {filename|N/A}
iOS IPA: {filename|N/A}
Next: Gate 3 — Store listing prep
```

---

## GATE 3: STORE LISTING PREPARATION

Dispatch `app-gtm-release:store-listing` skill for general guidance, then handle KMP-specific concerns.

### Android (Google Play Console)

Refer to `app-gtm-release:store-setup` skill (Google Play section) for first-time setup.

Listing fields needed (save to `./go-to-market/kmp/android/play-console-config.md`):

- Title (≤ 30 chars)
- Short description (≤ 80 chars)
- Full description (≤ 4000 chars; supports basic HTML)
- App icon: 512×512 PNG
- Feature graphic: 1024×500 PNG
- Screenshots: 2-8 phone, optional tablet, optional Android TV
- Privacy policy URL (mandatory if app collects ANY data)
- App category (1 primary)
- Tags (up to 5)
- Content rating questionnaire
- Target audience (age range)
- Data safety form (mandatory; declares all data collection + sharing)
- Government apps / financial / etc. — special declarations

### iOS (App Store Connect)

Listing fields (save to `./go-to-market/kmp/ios/app-store-connect.md`):

- App name (≤ 30 chars)
- Subtitle (≤ 30 chars)
- Promotional text (≤ 170 chars; can update without re-submission)
- Description (≤ 4000 chars)
- Keywords (≤ 100 chars total, comma-separated)
- Screenshots: 6.7" iPhone (required for new apps), 5.5" iPhone, iPad if iPad app
- App preview videos (optional)
- App icon: 1024×1024 PNG (no transparency, no rounded corners)
- Privacy policy URL (mandatory)
- Privacy nutrition labels (data collection declarations)
- Age rating (Apple's questionnaire)
- App Store category (1 primary, 1 optional secondary)
- Copyright

### Output

Generate per-platform listing markdown files in `./go-to-market/kmp/{android|ios}/`.

### Gate condition

**PASS** if all required fields prepared per platform.
**FAIL** if missing required fields, screenshots wrong dimensions, no privacy policy.

### Save checkpoint

```markdown
## Gate 3 — {PASSED|FAILED} — {timestamp}
Play Console listing: {complete|missing X}
App Store Connect listing: {complete|missing X}
Next: Gate 4 — Submission
```

---

## GATE 4: SUBMISSION

Dispatch `app-gtm-release:store-setup` skill.

### Android (Google Play)

1. Play Console → app → Production / Closed testing / Internal testing track
2. Upload AAB
3. Pre-launch report runs automatically (1-2 hours): tests on real devices for crashes, accessibility, security
4. Resolve any critical findings before promoting to production
5. Submission to production: review takes hours-days

Recommended path: Internal → Closed → Open beta → Production. Each track is a stepping stone.

### iOS (App Store Connect)

1. App Store Connect → My Apps → version → +Build → select uploaded archive
2. TestFlight first (recommended):
   - Internal testing: up to 100 internal users, no review
   - External testing: up to 10,000 testers, requires Beta App Review (1 day)
3. Submit for App Store review:
   - Average review time: 1-3 days
   - First submission stricter than updates

Common iOS rejection reasons for KMP apps:
- Bundle includes Kotlin/Native bitcode → uncheck "Include bitcode" in archive
- Framework size > 200 MB → audit dependencies
- Missing privacy disclosures → fill out privacy nutrition labels accurately
- "Lack of native functionality" if shared logic is too web-like → not a typical KMP issue (UI is native)

### Output

Append to `./go-to-market/kmp/notes/gate-4-submission.md`:

```markdown
## Submission #{n} — {date}

### Android
- Track: {internal|closed|production}
- AAB version: {value}
- Pre-launch report: {pass|warnings|fail}
- Submitted: {timestamp}
- Status: {processing|live|rejected}
- Play Store URL: {url|TBD}

### iOS
- TestFlight track: {internal|external}
- Build version: {value}
- Submitted to App Review: {timestamp}
- Status: {pending|approved|rejected with reason}
- App Store URL: {url|TBD}
```

### Gate condition

**PASS** when at least one selected target reaches "live" or "pending review" status.
**TRACK** while in review. **FAIL** if all rejected.

### Save checkpoint

```markdown
## Gate 4 — {PASSED|TRACKING} — {timestamp}
Android: {status}
iOS: {status}
Next: monitor + plan first patch
```

---

## Post-Submission

After Gate 4:

1. **Monitor crash rates**:
   - Android: Play Console → Quality → Android vitals
   - iOS: App Store Connect → Analytics → Metrics
   - Recommend: integrate Sentry / Firebase Crashlytics in shared module (works on both targets)
2. **First patch release** within 2 weeks: address early-adopter feedback, fix initial crashes
3. **Phase 2.5 awaits**: when `/ship-swift` lands, the iOS portion of `/ship-kmp` may delegate iOS-specific work to it for shared App Store Connect tooling
4. **Multi-store coordination**: if also targeting Microsoft Store (KMP doesn't directly support Windows targets via this command), consider running `/ship-msstore` separately with a wrapped web view of the KMP shared logic

Print final summary:

```markdown
KMP ship complete.

- Android: {Live|In review} — {Play Store URL|TBD}
- iOS: {Live|In review} — {App Store URL|TBD}

State saved to: ./go-to-market/kmp/

Next:
- Monitor analytics dashboards
- Plan patch v{x.y.z+1}
- For Microsoft Store via WebView: /app-gtm-release:ship-msstore (path B native or path A PWA wrapper)
```

---

## Edge cases

- **Compose Multiplatform iOS app rejected for "non-native"**: Apple sometimes flags Compose iOS for not feeling native. Mitigation: switch primary screens to SwiftUI; keep Compose for less critical screens.
- **Framework too large** (> 100 MB): audit transitive dependencies (`./gradlew :shared:dependencies`); remove unused; consider splitting into multiple frameworks per feature.
- **kotlinx version conflict during iOS link**: pin all kotlinx.* to compatible versions per Kotlin compat matrix; clean derived data + re-build.
- **Android Pre-launch report flags accessibility**: Play Console runs Espresso-based tests on real devices. Common findings: contrast ratios, touch target sizes < 48dp, missing content descriptions. Resolve in shared/Compose code.
- **Apple's Mac Catalyst path** (run iOS app on macOS): KMP doesn't directly support; if needed, build a separate `macosArm64()` target in Gradle and a separate macOS Xcode project. Phase 3 territory.
