---
name: alt-distribution
description: "Distribute Flutter Android apps through alternative channels: F-Droid, GitHub Releases (Obtainium-compatible), IzzyOnDroid, and direct APK distribution. Use this skill when the user asks about F-Droid publishing, open source app distribution, APK distribution outside Play Store, Obtainium, reproducible builds, FOSS app stores, fdroiddata, IzzyOnDroid, self-hosted repos, sideloading, or distributing without Google Play. Also triggers on: 'publish to F-Droid', 'distribute APK', 'alternative app stores', 'FOSS distribution', 'GitHub releases for my app', or 'I dont want to use Google Play'."
---

# Alternative Distribution: Beyond Google Play

Not every Android app belongs on Google Play. FOSS projects, privacy-focused apps, and developers who want to avoid Google's 30% commission or review process have several established distribution channels.

## Distribution Channel Decision

```
Is your app fully open source (FOSS)?
├── Yes → F-Droid is your primary target
│         ├── Pure FOSS (no proprietary deps)? → Official F-Droid repo
│         └── Has some non-free deps? → IzzyOnDroid repo
│
└── No (or mixed)
    ├── Want direct-to-user distribution? → GitHub Releases + Obtainium
    ├── Want a store without Google account? → Uptodown, Aurora Store (read-only)
    └── Want full control? → Self-hosted F-Droid repo
```

## Channel Comparison

| Channel | Review | Cost | Requirements | Audience |
|---------|--------|------|-------------|----------|
| F-Droid (official) | Yes (build verification) | Free | FOSS license, reproducible builds, no proprietary deps | FOSS/privacy community |
| IzzyOnDroid | Lighter review | Free | Open source, can have some non-free deps | Broader FOSS community |
| GitHub Releases | None | Free | GitHub repo, APK artifact | Developers, Obtainium users |
| Uptodown | Editorial review | Free | APK upload | Global, no geo-restrictions |
| Self-hosted repo | None | Hosting cost | F-Droid server setup | Your users only |

## F-Droid Publishing

Read `references/fdroid.md` for the complete submission process.

### What F-Droid Requires

F-Droid builds your app **from source** on their infrastructure. This means:

1. **FOSS license** — GPL, MIT, Apache, etc. Must be in the repo
2. **No proprietary dependencies** — no Google Play Services, Firebase, proprietary analytics
3. **Reproducible builds** — F-Droid must be able to build an identical APK from your source
4. **No tracking/analytics** — no Firebase Analytics, Mixpanel, Sentry with proprietary SDKs
5. **No non-free network services** — no hard dependency on proprietary backends

### Flutter-Specific Challenges for F-Droid

Flutter apps face unique challenges on F-Droid:

| Challenge | Solution |
|-----------|---------|
| Flutter SDK not in F-Droid buildserver | Use `flutter` build type in fdroiddata metadata |
| Google Play Services deps | Replace with FOSS alternatives (e.g., `unifiedpush` instead of FCM) |
| Firebase dependencies | Remove or replace with self-hosted alternatives (Supabase, Appwrite) |
| Proprietary fonts | Use bundled open fonts or system fonts |
| Dart obfuscation | Not needed — F-Droid builds are open source |
| AAB format | F-Droid uses APK, not AAB |

### FOSS Alternatives for Common Flutter Packages

| Proprietary | FOSS Alternative | Package |
|-------------|-----------------|---------|
| Firebase Auth | Supabase Auth, Appwrite | `supabase_flutter`, `appwrite` |
| Firebase Crashlytics | Sentry (self-hosted) | `sentry_flutter` (with self-hosted Sentry) |
| Firebase Analytics | Plausible, Matomo | Custom HTTP integration |
| Google Maps | OpenStreetMap | `flutter_map` + `latlong2` |
| FCM Push | UnifiedPush, ntfy | `unifiedpush` |
| Google Sign-In | OAuth2 (generic) | `flutter_appauth` |
| Play Billing | None needed (FOSS = free) | — |

### Build Flavors for Dual Distribution

If you want both F-Droid and Google Play, use flavors to strip proprietary deps:

```groovy
// android/app/build.gradle
android {
    flavorDimensions "store"
    productFlavors {
        fdroid {
            dimension "store"
            applicationIdSuffix ".fdroid"
        }
        playstore {
            dimension "store"
            // Google Play Services included
        }
    }
}
```

```dart
// lib/main_fdroid.dart — no Firebase, no Google Play Services
void main() => bootstrap(
  store: Store.fdroid,
  analytics: NoOpAnalytics(),    // No tracking
  crashReporter: SelfHostedSentry(), // Self-hosted only
);

// lib/main_playstore.dart — full Google ecosystem
void main() => bootstrap(
  store: Store.playstore,
  analytics: FirebaseAnalytics(),
  crashReporter: SentryCrashReporter(),
);
```

## GitHub Releases (Obtainium-Compatible)

The simplest distribution: build APK, attach to GitHub release. Users install via Obtainium, which auto-updates from your releases.

### Setup

1. **Build a signed APK** (not AAB — AAB is Google Play only):
   ```bash
   flutter build apk --release
   ```

2. **Create a GitHub Release:**
   ```bash
   # Tag and release
   git tag -a v1.0.0 -m "Release 1.0.0"
   git push origin v1.0.0

   # Attach APK to release
   gh release create v1.0.0 \
     build/app/outputs/flutter-apk/app-release.apk \
     --title "v1.0.0" \
     --notes "Release notes here"
   ```

3. **Users add to Obtainium:**
   - Install [Obtainium](https://github.com/ImranR98/Obtainium)
   - Add app URL: `https://github.com/youruser/yourapp`
   - Obtainium tracks releases and notifies on updates

### CI/CD for GitHub Releases

Add to your existing pipeline (Codemagic or GitHub Actions):

```yaml
# .github/workflows/release.yml
name: Release APK

on:
  push:
    tags: ['v*.*.*']

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '17'

      - uses: subosito/flutter-action@v2
        with:
          flutter-version-file: pubspec.yaml
          cache: true

      - run: flutter pub get

      - name: Decode keystore
        run: echo "${{ secrets.ANDROID_KEYSTORE_BASE64 }}" | base64 -d > android/app/upload-keystore.jks

      - name: Build signed APK
        run: flutter build apk --release

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: build/app/outputs/flutter-apk/app-release.apk
          generate_release_notes: true
```

Now every git tag automatically produces a signed APK on GitHub Releases.

## IzzyOnDroid

A popular F-Droid-compatible repository with lighter requirements than official F-Droid.

### Differences from F-Droid

- **Accepts apps with some non-free dependencies** (e.g., Firebase Crashlytics is OK)
- **Builds from pre-built APKs** (doesn't require reproducible source builds)
- **Faster inclusion** (days vs weeks for F-Droid)
- **Still requires open source** (source code must be available)

### Submission

1. Your app must be open source on GitHub/GitLab/Codeberg
2. Submit via [IzzyOnDroid submission form](https://apt.izzysoft.de/fdroid/index/info)
3. Provide: repo URL, APK download URL, app description
4. Izzy reviews and adds to the repository

Users who have IzzyOnDroid repo added in their F-Droid client (Droid-ify, Neo Store) will see your app.

## Self-Hosted F-Droid Repository

For organizations that want a private app store for internal distribution.

### When to Use

- Internal enterprise apps
- Beta distribution without Google Play
- Regional apps not suitable for global stores
- Apps with specific compliance requirements

### Setup

```bash
# Install fdroidserver
pip install fdroidserver

# Initialize repo
fdroid init

# Add your APK
cp your-app.apk repo/
fdroid update

# Serve via any web server (nginx, S3, GitHub Pages)
```

Users add your repo URL in their F-Droid client to access apps.

## community-marketplace Startups Marketplace

If your startup was incubated or accelerated through a community-marketplace hackathon or the community Launchpad, you can distribute through the [community-marketplace Startups Marketplace](https://github.com/community-marketplace/startups-android-marketplace) — a curated F-Droid-compatible repository.

### Why Use It

- Zero cost (no Google Play Console account needed)
- No review queue — maintainer-approved, published in minutes
- Your app appears in Droid-ify / Neo Store for all users who add the repo
- Resilient against Google's Developer Verification Program (September 2026)

### How It Works

You publish on **your own repo**. The marketplace fetches from there.

1. **Publish a signed release APK** on your GitHub repo:
   ```bash
   flutter build apk --release
   git tag -a v1.0.0 -m "Release 1.0.0"
   git push origin v1.0.0
   gh release create v1.0.0 build/app/outputs/flutter-apk/app-release.apk
   ```

2. **Open an issue** on [community-marketplace/startups-android-marketplace](https://github.com/community-marketplace/startups-android-marketplace/issues/new?template=app-submission.yml) with your repo URL

3. **A maintainer adds your app** to the marketplace index — you never touch the marketplace repo

4. **Future updates are automatic** — publish a new release on your repo, the marketplace picks it up

See the [full submission guide](https://github.com/community-marketplace/startups-android-marketplace/blob/main/docs/SUBMISSION_GUIDE.md) for details.

### Keep Android Open

Starting September 2026, Google's Android Developer Verification Program may restrict sideloading on stock Android. The community-marketplace marketplace continues working on custom ROMs (GrapheneOS, CalyxOS, LineageOS) without restrictions. See the [impact assessment](https://github.com/community-marketplace/startups-android-marketplace/blob/main/docs/KEEP_ANDROID_OPEN.md).

## Distribution Strategy Matrix

Choose based on your goals:

| Goal | Primary | Secondary |
|------|---------|-----------|
| community-marketplace startup | community-marketplace Marketplace | GitHub Releases |
| Maximum FOSS reach | F-Droid | IzzyOnDroid + GitHub Releases |
| Privacy-first, some proprietary deps | IzzyOnDroid | GitHub Releases |
| Developer audience | GitHub Releases | F-Droid |
| Global reach, no geo-restrictions | Uptodown | GitHub Releases |
| Enterprise internal | Self-hosted F-Droid | — |
| Maximum reach (FOSS + mainstream) | F-Droid + Google Play (flavors) | GitHub Releases |

## Integration with flutter-go-to-market Lifecycle

Alternative distribution fits into the existing gates:

- **Gate 0 (Assessment):** Ask "Where do you want to distribute?" — the answer determines which store skills activate
- **Gate 1 (Code Readiness):** If F-Droid, verify no proprietary deps. If dual, verify flavor separation
- **Gate 2 (Pipeline):** Add APK build step alongside AAB. Add GitHub Release workflow if needed
- **Gate 3 (Store Preparation):** F-Droid metadata instead of (or alongside) Play Store listing
- **Gate 4 (Launch):** Submit to fdroiddata, create GitHub Release, or both
