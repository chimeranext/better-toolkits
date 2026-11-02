---
name: code-push
description: "Set up over-the-air (OTA) updates for Flutter apps using Shorebird Code Push. Use this skill when the user asks about hot updates, OTA updates, code push, patching without store review, instant updates, bypassing store releases, Shorebird setup, or deploying Dart code changes without going through the app store submission process. Also triggers on: 'push a fix without store update', 'update without releasing', 'Shorebird', 'patch my app', or 'instant deploy'."
---

<!-- TODO: framework-agnostic split — Shorebird is Dart-only. When a second framework lands (e.g., MAUI Hot Reload, Capacitor Live Updates, EAS Update for RN), fork this into per-framework skills (code-push-flutter, code-push-maui, etc.) routed by /ship-{framework}. -->

# Code Push: Over-The-Air Updates with Shorebird

Shorebird Code Push lets you deploy Dart code changes instantly to users without going through the app store review process. Fix bugs, update logic, and ship improvements in minutes instead of days.

## What Code Push Can and Cannot Do

Understanding the boundaries is critical before relying on this tool:

### Can Patch (Dart code changes)
- Bug fixes in Dart logic
- UI tweaks and layout adjustments
- Business logic changes
- Generated code (localization files, JSON serialization)
- Pure Dart dependency updates

### Cannot Patch (requires store release)
- Asset changes (images, fonts, audio files)
- Native code (Java, Kotlin, Swift, Objective-C)
- Flutter engine version changes
- Native plugin updates (adding/updating packages with native components)
- Minimum OS version changes

**Rule of thumb:** if the change touches only `lib/` and pure Dart dependencies, it can be patched. Anything else requires a store release.

## How It Works

```
1. Create release:  shorebird release android  → baseline release → upload to stores
2. Users install from store
3. Make Dart code changes
4. Create patch:    shorebird patch android    → diff against release → uploaded to Shorebird cloud
5. Users open app → Shorebird checks for patches → downloads diff → applies on next restart
```

The modified Flutter engine included with Shorebird:
1. Checks for updates on app startup
2. Downloads the patch in the background
3. Applies the patch on the next app restart

## Setup

### 1. Install Shorebird CLI

```bash
# macOS/Linux
curl --proto '=https' --tlsv1.2 https://raw.githubusercontent.com/shorebirdtech/install/main/install.sh -sSf | bash

# Verify
shorebird doctor
```

### 2. Initialize in Your Project

```bash
cd your_flutter_project
shorebird init
```

This creates `shorebird.yaml` with a unique `app_id`:

```yaml
# shorebird.yaml
app_id: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Commit `shorebird.yaml` to your repository.

### 3. Create a Release

```bash
# Android release
shorebird release android

# iOS release
shorebird release ios

# With flavor
shorebird release android --flavor production

# With specific version
shorebird release android -- --build-number=42
```

This produces store-ready artifacts (AAB for Android, IPA for iOS) with the Shorebird engine embedded. Upload these to the stores as you normally would.

### 4. Deploy a Patch

After making Dart code changes:

```bash
# Patch Android
shorebird patch android

# Patch iOS
shorebird patch ios

# Patch specific release
shorebird patch android --release-version=1.0.0+1

# Patch with flavor
shorebird patch android --flavor production
```

The patch is a diff against the release — only changed code is downloaded by users.

### 5. Monitor Patches

```bash
# List releases
shorebird releases list

# List patches for a release
shorebird patches list --release-version=1.0.0+1

# Check patch status
shorebird patches list
```

## CI/CD Integration

### Shorebird in GitHub Actions

```yaml
# .github/workflows/shorebird-release.yml
name: Shorebird Release

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  release-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Shorebird
        uses: shorebirdtech/setup-shorebird@v1
        with:
          cache: true

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '17'

      - name: Create Shorebird release
        env:
          SHOREBIRD_TOKEN: ${{ secrets.SHOREBIRD_TOKEN }}
        run: shorebird release android

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: android-release
          path: build/app/outputs/bundle/release/app-release.aab
```

```yaml
# .github/workflows/shorebird-patch.yml
name: Shorebird Patch

on:
  workflow_dispatch:
    inputs:
      platform:
        description: 'Platform to patch'
        required: true
        type: choice
        options: [android, ios]

jobs:
  patch:
    runs-on: ${{ inputs.platform == 'ios' && 'macos-latest' || 'ubuntu-latest' }}
    steps:
      - uses: actions/checkout@v4

      - name: Setup Shorebird
        uses: shorebirdtech/setup-shorebird@v1

      - name: Create patch
        env:
          SHOREBIRD_TOKEN: ${{ secrets.SHOREBIRD_TOKEN }}
        run: shorebird patch ${{ inputs.platform }}
```

### Shorebird in Codemagic

```yaml
# In codemagic.yaml, add to scripts:
scripts:
  - name: Install Shorebird
    script: |
      curl --proto '=https' --tlsv1.2 https://raw.githubusercontent.com/shorebirdtech/install/main/install.sh -sSf | bash
      echo "PATH=$HOME/.shorebird/bin:$PATH" >> $CM_ENV

  - name: Create Shorebird release
    script: |
      shorebird release android
    # Or for patching:
    # shorebird patch android
```

### Required CI Secret

Generate a Shorebird CI token:

```bash
shorebird login:ci
```

This outputs a token. Add it as `SHOREBIRD_TOKEN` in your CI secrets.

## Workflow Integration

### With the app-gtm-release Pipeline

The recommended flow integrates Shorebird into the existing CI/CD pipeline:

```
New feature / major change:
  └─ Normal release flow (CI/CD → store submission → review)
      └─ shorebird release android/ios
          └─ Upload to stores

Bug fix / minor Dart change:
  └─ shorebird patch android/ios
      └─ Users get fix on next app restart (no store review)
```

### Version Strategy

- **Releases** = store versions (1.0.0, 1.1.0, 2.0.0)
- **Patches** = OTA fixes within a release (patch 1, patch 2, patch 3 for release 1.0.0)

Only one patch is active per release at a time. A new patch replaces the previous one.

## Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| Android | Stable | AAB and APK supported |
| iOS | Stable | IPA supported |
| macOS | Supported | AAR format |
| Web | Not supported | Not applicable (web deploys differently) |
| Windows | Not yet | Planned |
| Linux | Not yet | Planned |

## Pricing

| Plan | Patches/month | Price |
|------|--------------|-------|
| Hobby | 5,000 | Free |
| Team | 50,000 | $20/month |
| Business | 500,000 | Custom |

Patch = one user receiving one update.

## Store Compliance

Both Apple and Google **allow** over-the-air code updates as long as:
- The update mechanism is declared in the app binary
- Updates don't change the fundamental nature of the app
- Updates don't bypass review to add policy-violating content

Shorebird's approach (modified Flutter engine that checks for Dart code updates) complies with both stores' policies. Shorebird only patches Dart code — it cannot modify native code or add new native capabilities.

## Best Practices

1. **Use patches for fixes, releases for features** — don't try to ship major features via patches
2. **Test patches thoroughly** — patches skip store review, so you are the QA gate
3. **Monitor patch adoption** — use Shorebird dashboard to track how many users received the patch
4. **Roll back if needed** — create a new patch that reverts changes
5. **Keep releases frequent** — patches are diffs; smaller diffs = faster downloads
6. **Combine with Sentry** — monitor crash rates before and after patches to validate fixes
