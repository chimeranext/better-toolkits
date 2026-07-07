---
name: alt-distribution
description: "Distribute apps through alternative channels beyond mainstream stores. Android: F-Droid, GitHub Releases (Obtainium-compatible), IzzyOnDroid, direct APK. Linux desktop: Flathub (Phase 2). Covers reproducible builds, fdroiddata metadata, AppStream metadata for Flathub, flatpak-builder manifests, and PR workflow to flathub/flathub. Use this skill when the user asks about F-Droid publishing, open source app distribution, APK distribution outside Play Store, Obtainium, reproducible builds, FOSS app stores, fdroiddata, IzzyOnDroid, self-hosted repos, sideloading, distributing without Google Play, Flathub, flatpak, flatpak-builder, AppStream, 'publish to Flathub', or 'Linux desktop FOSS distribution'."
---

<!-- TODO: framework-agnostic split for Android-focused sections (F-Droid, Obtainium, IzzyOnDroid) — Phase 3+ when MAUI/KMP need Android alt-distribution. The Flathub section (Phase 2) is already framework-agnostic since Flatpak builds anything that compiles on Linux. -->

# Alternative Distribution: Beyond Google Play, Beyond Snap

Not every app belongs on the mainstream stores. FOSS projects, privacy-focused apps, and developers who want to avoid commission/review processes have several established distribution channels.

This skill covers three domains:
1. **Android alternatives** (F-Droid, Obtainium, IzzyOnDroid, direct APK) — Phase 0+
2. **Linux desktop alternatives** (Flathub, AppImage) — Phase 2 addition
3. **Windows & Apple restricted/offline distribution** (WinGet, MSIX sideloading, Store private audience, Apple Unlisted) — non-public channels that still go through (or around) the mainstream stores

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

## Curated Community Marketplaces

Some communities — accelerators, incubators, dev collectives — run their own curated app repositories: maintainer-approved storefronts that users browse through third-party Android store clients such as Droid-ify or Neo Store. If a community you belong to runs one, it is usually the cheapest distribution channel available to you.

<!-- TODO: ChimeraNext marketplace — link the concrete submission flow here once the repo exists -->

### Why Use One

- Zero cost (no Google Play Console account needed)
- No review queue — maintainer-approved, published in minutes
- Your app appears in the community's store client for every user who added the repo
- Resilient against Google's Developer Verification Program (September 2026)

### How They Typically Work

You publish on **your own repo**. The marketplace indexes it.

1. **Publish a signed release APK** on your GitHub repo:
   ```bash
   flutter build apk --release
   git tag -a v1.0.0 -m "Release 1.0.0"
   git push origin v1.0.0
   gh release create v1.0.0 build/app/outputs/flutter-apk/app-release.apk
   ```

2. **Submit your repo URL** through the marketplace's intake channel (usually an issue template on the marketplace repo)

3. **A maintainer adds your app** to the marketplace index — you never touch the marketplace repo

4. **Future updates are automatic** — publish a new release on your repo, the index picks it up

### Keep Android Open

Starting September 2026, Google's Android Developer Verification Program may restrict sideloading on stock Android. Community marketplaces continue working on custom ROMs (GrapheneOS, CalyxOS, LineageOS) without restrictions.

---

## Flathub (Linux Desktop)

Flathub is the de facto Linux desktop app store. Unlike Snap (centralized, Canonical-controlled, requires `snapd`), Flatpak (the underlying tech) is decentralized and bundle-portable. Most major Linux distros ship with Flathub support out of the box (Fedora, Ubuntu via PPA, Linux Mint, Pop!_OS, Endless OS, elementary OS).

### When Flathub vs Snap?

Pair, don't pick:

| Property | Flathub | Snap Store |
|---|---|---|
| Distros pre-shipped with support | Fedora, Mint, Pop!_OS, Endless, elementary, EndeavorOS, Manjaro | Ubuntu, Ubuntu Core |
| Sandboxing | Bubblewrap + portals | AppArmor + seccomp |
| Update model | Decentralized (anyone can host a remote) | Centralized (snapcraft.io only) |
| Submission gate | Manual review by Flathub maintainers (PR-based) | Automated review (strict) or 1-2 weeks (classic) |
| Confinement override | "permissions" in manifest | "classic" confinement (manual approval) |
| Format | OCI container with Flatpak runtime | SquashFS image with snapd metadata |

For maximum Linux desktop reach: **ship to both** Flathub AND Snap Store. Different audiences, different distros.

### Flatpak manifest (key concepts)

A Flatpak app is defined by a manifest in YAML or JSON. Filename convention: `com.example.MyApp.yml` (reverse-DNS).

```yaml
# com.example.MyApp.yml — minimal Flutter desktop example
app-id: com.example.MyApp
runtime: org.freedesktop.Platform
runtime-version: '24.08'  # Flatpak runtime; check https://docs.flatpak.org/en/latest/available-runtimes.html
sdk: org.freedesktop.Sdk
command: myapp

finish-args:
  - --share=network          # outbound network
  - --socket=wayland         # Wayland display
  - --socket=fallback-x11    # X11 fallback
  - --socket=pulseaudio      # audio
  - --device=dri             # GPU
  - --filesystem=home        # home dir access
  - --talk-name=org.freedesktop.Notifications  # desktop notifications via D-Bus

modules:
  - name: myapp
    buildsystem: simple
    build-commands:
      - install -Dm755 myapp -t /app/bin/
      - install -Dm644 myapp.desktop -t /app/share/applications/
      - install -Dm644 com.example.MyApp.appdata.xml -t /app/share/metainfo/
      - install -Dm644 icon-256.png /app/share/icons/hicolor/256x256/apps/com.example.MyApp.png
    sources:
      - type: archive
        url: https://github.com/example/myapp/releases/download/v1.0.0/myapp-linux-x86_64.tar.gz
        sha256: <sha256 of the release archive>
```

Key fields:

| Field | Purpose |
|---|---|
| `app-id` | Reverse-DNS unique identifier (matches Flathub repo name) |
| `runtime` | Base runtime (Freedesktop, GNOME, KDE) |
| `runtime-version` | Pinned version (24.08 = Sep 2024 release) |
| `sdk` | SDK matching the runtime |
| `command` | Executable name |
| `finish-args` | Sandbox permissions (analogous to snap plugs) |
| `modules` | Build steps + sources |

### Required: AppStream metadata

Flathub requires an AppStream `.appdata.xml` (or `.metainfo.xml`) file describing the app for the store listing. This is shared with KDE Discover, GNOME Software, and other Linux app browsers.

`com.example.MyApp.appdata.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<component type="desktop-application">
  <id>com.example.MyApp</id>
  <name>My App</name>
  <summary>Short tagline, ≤ 80 chars</summary>
  <description>
    <p>First paragraph. Markdown not supported; use plain text or HTML-like inline.</p>
    <p>Second paragraph if needed.</p>
  </description>

  <metadata_license>CC0-1.0</metadata_license>
  <project_license>BSL-1.1</project_license>

  <developer id="com.example">
    <name>Example Inc.</name>
  </developer>

  <url type="homepage">https://example.com</url>
  <url type="bugtracker">https://github.com/example/myapp/issues</url>
  <url type="help">https://example.com/help</url>
  <url type="vcs-browser">https://github.com/example/myapp</url>

  <launchable type="desktop-id">com.example.MyApp.desktop</launchable>

  <screenshots>
    <screenshot type="default">
      <image>https://example.com/screenshots/main.png</image>
      <caption>Main view</caption>
    </screenshot>
  </screenshots>

  <releases>
    <release version="1.0.0" date="2026-04-25">
      <description>
        <p>Initial Flathub release.</p>
      </description>
    </release>
  </releases>

  <content_rating type="oars-1.1" />

  <categories>
    <category>Office</category>
    <category>Productivity</category>
  </categories>

  <provides>
    <binary>myapp</binary>
  </provides>
</component>
```

Validate with `appstreamcli`:
```bash
appstreamcli validate com.example.MyApp.appdata.xml
```

### Required: .desktop file

Standard freedesktop.org `.desktop` file:

```ini
[Desktop Entry]
Name=My App
Comment=Tagline
Exec=myapp
Icon=com.example.MyApp
Terminal=false
Type=Application
Categories=Office;Productivity;
StartupWMClass=myapp
```

Filename matches `app-id`: `com.example.MyApp.desktop`.

### Local build

Install flatpak + flatpak-builder:

```bash
sudo apt install flatpak flatpak-builder
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
flatpak install flathub org.freedesktop.Platform//24.08 org.freedesktop.Sdk//24.08
```

Build:

```bash
flatpak-builder --user --install --force-clean build-dir com.example.MyApp.yml
flatpak run com.example.MyApp
```

Output: app installed locally for testing.

For a `.flatpak` bundle (single-file install):

```bash
flatpak-builder --repo=repo --force-clean build-dir com.example.MyApp.yml
flatpak build-bundle repo myapp.flatpak com.example.MyApp
```

### Submission to Flathub (PR workflow)

Flathub does NOT have a dashboard. Submission is via GitHub PR:

1. **Fork** [flathub/flathub](https://github.com/flathub/flathub) (the new-app submissions repo)
2. **Create a new directory** with your app-id name: `com.example.MyApp/`
3. **Add the manifest + AppStream + .desktop + icons + screenshots** to that directory
4. **Open a PR** with the title format: `Add com.example.MyApp`
5. **Review process** (1-4 weeks):
   - Automated CI builds the manifest on Flathub's infrastructure
   - Human reviewers check: package quality, sandbox permissions are minimal/justified, AppStream metadata complete, license metadata correct, no anti-features
   - Reviewers leave comments; you iterate via additional commits to your PR
6. **Merge** = listing goes live on flathub.org within hours

### Updates after launch

Flathub gives you a dedicated repo `flathub/com.example.MyApp` (separate from the submissions repo) once your initial PR merges. Updates flow through that repo:

1. Edit your `com.example.MyApp.yml` in `flathub/com.example.MyApp`
2. Update version, sources, etc.
3. Open a PR (or push directly if you have access)
4. Buildbot rebuilds and publishes within an hour

### Sandbox permissions strategy

`finish-args` declares what your app can access. Like snap plugs, but more granular. Common args:

| finish-arg | What it grants |
|---|---|
| `--share=network` | Outbound network |
| `--share=ipc` | X11 IPC (most apps need) |
| `--socket=wayland` | Wayland display |
| `--socket=fallback-x11` | X11 fallback |
| `--socket=pulseaudio` | Audio |
| `--device=dri` | GPU access |
| `--device=all` | All devices (avoid; use specific) |
| `--filesystem=home` | Read/write home dir |
| `--filesystem=xdg-documents` | XDG Documents only |
| `--filesystem=host` | Full filesystem (avoid; reviewers will reject) |
| `--talk-name=org.freedesktop.Notifications` | D-Bus notifications |
| `--system-talk-name=org.freedesktop.UPower` | System D-Bus access |

Reviewers reject overly broad args. Default minimal; add only what you need.

### Flathub vs Snap comparison for shipping

| Concern | Flathub | Snap Store |
|---|---|---|
| Build system | flatpak-builder + manifest | snapcraft + snapcraft.yaml |
| Submission | GitHub PR (1-4 week review) | snapcraft upload (automated review minutes; classic 1-2 weeks) |
| Sandbox | finish-args (granular) | plugs (named capabilities) |
| Default audiences | Fedora, Pop!_OS, Mint users | Ubuntu users |
| Auto-update | Yes (via flatpak update) | Yes (snapd refresh) |
| Centralized hosting | Yes (flathub.org) | Yes (snapcraft.io) |
| Self-hosted alternative | Yes (any HTTP server can host a Flatpak repo) | No (snapd only trusts snapcraft.io) |

For maximum Linux desktop reach, ship to **both**.

### Phase 2 integration with /ship-snap

When the user has a Linux desktop app:

1. Run `/app-gtm-release:ship-snap` (Phase 1) for Snap Store
2. Reuse build artifacts (often the binary from `snap/local/...` is similar to Flatpak's input)
3. Author Flatpak manifest separately (different dependencies, different sandbox model)
4. Open Flathub PR

In Phase 3+, `/ship-everywhere` may add Flathub as a parallel child to ship-snap when Linux desktop is detected.

## Windows & Apple: Restricted and Offline Distribution

Not every Windows or Apple app should be publicly listed. These channels reach a controlled audience — an enterprise fleet, a private beta group, or users who only get a direct link — while still leaning on (or bypassing) the official stores.

### WinGet offline download (enterprise, Windows)

**WinGet 1.8** added `winget download`, which pulls a Microsoft Store app's packages **for offline distribution** across a network. This **replaces the "Enterprise Offline" feature of Microsoft Store for Business** (which is winding down).

```powershell
winget download <App> -s msstore
winget download Calculator -s msstore   # example
```

- `msstore` is a default WinGet source; target it with `--source msstore` in `search`/`install` too.
- Requires an up-to-date WinGet — check `winget --version`; update via App Installer or `winget upgrade winget`.
- Aimed at IT/enterprise scenarios with Store licensing. Not a consumer channel.

### MSIX sideloading (Windows)

Install an MSIX outside the Store: from your own website, via Intune / Configuration Manager, or by double-clicking the package (App Installer handles it). Requirements:

- The MSIX **must be signed with a certificate the target machine trusts**. If it isn't, install the signing cert into **Trusted People** / **Trusted Publishers** on each machine first.
- The `*_Test` output folder ships an `Add-AppDevPackage.ps1` script that installs the dev cert and the package together — convenient for internal test rings.

See `msstore-submission` for how MSIX signing works (VS2019+ no longer generates a temporary cert; use PowerShell cmdlets or Azure Key Vault).

### Microsoft Store private audience (Windows)

To distribute through the Store but keep the app **invisible to the public**, use a private audience. This replaces Microsoft Store for Business / Intune / SCCM for simple cases.

1. Partner Center → **Apps and Games** → your app → **Engage** tab → **Customer Groups**.
2. Create a group ("Known user group" enabled): add individual Microsoft accounts, or upload a CSV.
3. In the submission → **Pricing and availability** → **Visibility** → **Private audience** → select the group.
4. Optionally set a date to flip from private to public later.

Only the accounts in the group can see or install the app. (Package flights, promo codes, and Store for Education are out of scope here.)

### Apple Unlisted App Distribution (iOS/macOS)

Apple's **Unlisted App Distribution** (introduced 2022) puts an app on the App Store but **hidden**: it doesn't appear in search, recommendations, charts, or categories — it's reachable only via a **direct link**. Apple recommends adding in-app authentication to gate access.

| Property | Unlisted | Enterprise Program | Private / ABM |
|---|---|---|---|
| Requires | Apple Developer Program only | Developer Enterprise Program | Developer Program + Apple Business Manager |
| Apple review | Yes (standard, via request form) | No | Yes |
| In-app purchases | **Supported** | N/A | Not via ABM |
| Discoverable | No (link only) | Internal only | ABM org only |

Key wins over the alternatives: Unlisted needs **only the standard Developer Program** (no Apple Business Manager), goes through **normal review** (so it's a legitimate public-store binary), and **supports in-app purchases** — which ABM distribution does not. Request it through the App Store Connect distribution form.

## Distribution Strategy Matrix

Choose based on your goals:

### Android

| Goal | Primary | Secondary |
|------|---------|-----------|
| Community/accelerator startup | Curated community marketplace | GitHub Releases |
| Maximum FOSS reach | F-Droid | IzzyOnDroid + GitHub Releases |
| Privacy-first, some proprietary deps | IzzyOnDroid | GitHub Releases |
| Developer audience | GitHub Releases | F-Droid |
| Global reach, no geo-restrictions | Uptodown | GitHub Releases |
| Enterprise internal | Self-hosted F-Droid | — |
| Maximum reach (FOSS + mainstream) | F-Droid + Google Play (flavors) | GitHub Releases |

### Linux desktop

| Goal | Primary | Secondary |
|------|---------|-----------|
| Maximum reach across distros | Flathub + Snap Store | AppImage on GitHub Releases |
| Ubuntu-only audience | Snap Store | Flathub |
| Fedora / non-Ubuntu audience | Flathub | AppImage |
| FOSS purist with hand-curation | Flathub + AppImage | Self-hosted Flatpak repo |
| Single-file portable | AppImage on GitHub Releases | — |

## Integration with app-gtm-release Lifecycle

Alternative distribution fits into the existing gates:

- **Gate 0 (Assessment):** Ask "Where do you want to distribute?" — the answer determines which store skills activate
- **Gate 1 (Code Readiness):** If F-Droid, verify no proprietary deps. If dual, verify flavor separation
- **Gate 2 (Pipeline):** Add APK build step alongside AAB. Add GitHub Release workflow if needed
- **Gate 3 (Store Preparation):** F-Droid metadata instead of (or alongside) Play Store listing
- **Gate 4 (Launch):** Submit to fdroiddata, create GitHub Release, or both
