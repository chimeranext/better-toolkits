# F-Droid: Complete Submission Guide

## Overview

F-Droid is a catalogue of FOSS (Free and Open Source Software) applications for Android. Unlike Google Play, F-Droid **builds your app from source** on their build servers, verifying that the distributed APK matches the source code.

## Submission Process

### Step 1: Prepare Your Repository

Your source code must be publicly accessible and meet these requirements:

- [ ] FOSS license file in repo root (LICENSE, COPYING, or similar)
- [ ] No proprietary dependencies (check all pub dependencies)
- [ ] No pre-built binaries in the source tree
- [ ] No tracking/analytics SDKs (or must be removable via build config)
- [ ] No non-free assets (fonts, images with restrictive licenses)

### Step 2: Create Metadata File

F-Droid uses YAML metadata. Create a file for the [fdroiddata](https://gitlab.com/fdroid/fdroiddata) repository:

```yaml
# metadata/com.example.yourapp.yml
Categories:
  - Utilities          # See: https://f-droid.org/docs/Build_Metadata_Reference/#Categories
License: MIT           # SPDX identifier
AuthorName: Your Name
AuthorEmail: you@example.com
SourceCode: https://github.com/youruser/yourapp
IssueTracker: https://github.com/youruser/yourapp/issues

AutoName: Your App Name
Description: |
  Your app description. This supports basic formatting.

  * Feature one
  * Feature two

  Multi-paragraph descriptions are fine.

RepoType: git
Repo: https://github.com/youruser/yourapp.git

Builds:
  - versionName: 1.0.0
    versionCode: 1
    commit: v1.0.0           # Git tag
    output: build/app/outputs/flutter-apk/app-release.apk
    srclibs:
      - flutter@stable
    rm:
      - ios                  # Remove non-Android dirs
      - web
      - macos
      - windows
      - linux
    build: |
      export PATH="$$flutter$$/bin:$PATH"
      flutter pub get
      flutter build apk --release

AutoUpdateMode: Version
UpdateCheckMode: Tags
CurrentVersion: 1.0.0
CurrentVersionCode: 1
```

### Step 3: Submit Merge Request

1. Fork [fdroiddata](https://gitlab.com/fdroid/fdroiddata) on GitLab
2. Add your metadata YAML file to `metadata/`
3. Test locally:
   ```bash
   pip install fdroidserver
   fdroid readmeta
   fdroid lint com.example.yourapp
   fdroid checkupdates com.example.yourapp
   ```
4. Submit a merge request
5. Wait for review (typically 1-4 weeks)

### Step 4: After Acceptance

- F-Droid builds your app from source on their schedule
- New versions detected automatically via `AutoUpdateMode: Version` + git tags
- Build cycle: typically 3-7 days after a new tag is pushed
- Your app appears at `https://f-droid.org/packages/com.example.yourapp/`

## Flutter-Specific Build Configuration

### Flutter Build Type

F-Droid has a `flutter` srclib that handles Flutter SDK management:

```yaml
Builds:
  - versionName: 1.0.0
    versionCode: 1
    commit: v1.0.0
    subdir: .
    output: build/app/outputs/flutter-apk/app-release.apk
    srclibs:
      - flutter@3.24.0       # Pin to specific version
    rm:
      - ios
      - web
    prebuild:
      - export PATH="$$flutter$$/bin:$PATH"
      - flutter config --no-analytics
      - flutter pub get
    build:
      - export PATH="$$flutter$$/bin:$PATH"
      - flutter build apk --release --no-tree-shake-icons
```

### Handling Dart Dependencies

Some pub.dev packages contain proprietary code. F-Droid will flag these. Common offenders:

| Package | Issue | Solution |
|---------|-------|---------|
| `firebase_core` | Proprietary Google SDK | Remove, use Supabase/Appwrite |
| `google_maps_flutter` | Proprietary Google Maps | Use `flutter_map` |
| `google_sign_in` | Proprietary OAuth | Use `flutter_appauth` |
| `in_app_purchase` | Play Billing Library | Not needed for FOSS/free apps |
| `geolocator` | Uses Google Play Services | Use with `geolocator_android` (pure FOSS) |

### Conditional Dependencies with Flavors

```yaml
# pubspec.yaml — base dependencies only (FOSS-safe)
dependencies:
  flutter:
    sdk: flutter
  http: ^1.0.0
  flutter_map: ^6.0.0
  # ... FOSS deps only
```

```yaml
# For Play Store flavor, add in a separate pubspec or use build config:
# pubspec_playstore.yaml
dependencies:
  firebase_core: ^3.0.0
  firebase_analytics: ^11.0.0
```

## Anti-Features

F-Droid marks apps with "Anti-Features" rather than rejecting them outright for minor issues:

| Anti-Feature | Meaning |
|-------------|---------|
| Ads | Contains advertising |
| Tracking | Reports activity to third parties |
| NonFreeNet | Depends on non-free network services |
| NonFreeAdd | Promotes non-free add-ons |
| NonFreeDep | Depends on non-free software |
| NSFW | Contains content not safe for work |
| UpstreamNonFree | Upstream source code is not free |
| NonFreeAssets | Contains non-free assets |
| KnownVuln | Has known security vulnerabilities |
| NoSourceSince | Source code no longer available |

If your app has anti-features, declare them in the metadata:

```yaml
AntiFeatures:
  NonFreeNet:
    en-US: Connects to a proprietary API for weather data
```

## Reproducible Builds

F-Droid can verify that builds are reproducible (APK from source = APK from developer):

```yaml
Builds:
  - versionName: 1.0.0
    versionCode: 1
    commit: v1.0.0
    output: build/app/outputs/flutter-apk/app-release.apk
    binary: https://github.com/youruser/yourapp/releases/download/v1.0.0/app-release.apk
```

The `binary` field points to your signed APK. F-Droid builds from source and compares. If they match, the app is marked as reproducible (higher trust).

## Store Listing for F-Droid

F-Droid uses Fastlane-style metadata structure:

```
metadata/
└── com.example.yourapp/
    └── en-US/
        ├── full_description.txt
        ├── short_description.txt
        ├── title.txt
        ├── changelogs/
        │   └── 1.txt           # Changelog for versionCode 1
        └── images/
            ├── icon.png          # 512x512
            ├── featureGraphic.png # 1024x500
            └── phoneScreenshots/
                ├── 01.png
                └── 02.png
```

Or provide these in your app's source repository under `fastlane/metadata/android/`.

## Update Cycle

Once your app is in F-Droid:

1. Push a new git tag (e.g., `v1.1.0`)
2. F-Droid detects the new tag via `UpdateCheckMode: Tags`
3. Build server picks up the new version (3-7 day cycle)
4. APK built from source and published
5. Users see update in their F-Droid client

To speed up the cycle, you can run `fdroid checkupdates com.example.yourapp` and submit a merge request with the updated metadata.
