---
name: kmp-build
description: "Build, test, and prepare a Kotlin Multiplatform (KMP / KMM) project for shipping to Google Play and Apple App Store. Covers project structure (commonMain, androidMain, iosMain, iosApp/), Gradle Kotlin DSL config, Kotlin/Native compilation, iOS framework integration via CocoaPods or Swift Package Manager, Compose Multiplatform setup, expect/actual patterns, build commands per platform, signing, version sync between Gradle and iOS Info.plist, and common pitfalls (framework size, transitive Kotlin dependencies, kotlinx.* version conflicts). Use this skill when the user asks about KMP, KMM, Kotlin Multiplatform Mobile, shared Kotlin code, Compose Multiplatform, expect/actual, kotlin-multiplatform Gradle plugin, KMP iOS framework, embed Kotlin in iOS, or 'ship a Kotlin Multiplatform app'."
---

# Kotlin Multiplatform Build & Release

Kotlin Multiplatform (KMP) lets you share business logic in Kotlin across Android, iOS, desktop (JVM/Linux/Windows/macOS), and web (JS/Wasm). Native UI per platform is the most common pattern (sometimes called KMM = Kotlin Multiplatform Mobile when Android+iOS only). With Compose Multiplatform, UI can also be shared.

This skill walks through:

1. Project structure expectations
2. Gradle config (Kotlin DSL)
3. iOS framework integration
4. Compose Multiplatform vs native UI choice
5. Build commands per target
6. Versioning and signing
7. Common pitfalls

## When to invoke

- During `/app-gtm-release:ship-kmp` Gates 1-3
- When the user asks: "KMP setup", "Gradle for KMP", "iOS framework integration", "Compose Multiplatform", "expect/actual", "Kotlin shared code"

## Bar 1 — Project structure

Standard KMP project layout:

```
my-kmp-app/
├── shared/                          # Shared Kotlin module
│   ├── build.gradle.kts             # Multiplatform plugin config
│   └── src/
│       ├── commonMain/kotlin/       # Pure Kotlin, runs everywhere
│       ├── commonTest/kotlin/       # Tests for common code
│       ├── androidMain/kotlin/      # Android-specific (Java interop, Android SDK)
│       ├── androidUnitTest/kotlin/
│       ├── iosMain/kotlin/          # iOS-specific (Foundation, UIKit interop)
│       ├── iosTest/kotlin/
│       ├── desktopMain/kotlin/      # Optional: JVM desktop
│       └── jsMain/kotlin/           # Optional: JS/Wasm
├── androidApp/                      # Android UI (Jetpack Compose or XML views)
│   ├── build.gradle.kts
│   └── src/main/...
├── iosApp/                          # iOS UI (SwiftUI / UIKit, with Swift)
│   ├── iosApp.xcodeproj/
│   └── iosApp/                      # Swift source files
├── settings.gradle.kts              # Root: includes "shared", "androidApp"
├── build.gradle.kts                 # Root build config
├── gradle.properties                # Project properties (versions, flags)
└── gradle/libs.versions.toml        # Version catalog (recommended)
```

Note: iOS doesn't have a Gradle build. Xcode handles iosApp/. Gradle builds the iOS framework that Xcode then embeds.

## Bar 2 — Gradle configuration

### `gradle.properties`

```properties
# Performance
org.gradle.jvmargs=-Xmx4g -Dfile.encoding=UTF-8
org.gradle.parallel=true
org.gradle.caching=true

# Kotlin
kotlin.code.style=official
kotlin.mpp.androidSourceSetLayoutVersion=2

# AndroidX
android.useAndroidX=true
android.nonTransitiveRClass=true
```

### `gradle/libs.versions.toml` (version catalog)

```toml
[versions]
kotlin = "2.0.21"
agp = "8.7.3"  # Android Gradle Plugin
compose = "1.7.5"
compose-multiplatform = "1.7.0"
ktor = "3.0.1"
kotlinx-coroutines = "1.9.0"
kotlinx-serialization = "1.7.3"
sqldelight = "2.0.2"
koin = "4.0.0"

[libraries]
kotlinx-coroutines-core = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-core", version.ref = "kotlinx-coroutines" }
kotlinx-serialization-json = { module = "org.jetbrains.kotlinx:kotlinx-serialization-json", version.ref = "kotlinx-serialization" }
ktor-client-core = { module = "io.ktor:ktor-client-core", version.ref = "ktor" }
ktor-client-android = { module = "io.ktor:ktor-client-android", version.ref = "ktor" }
ktor-client-darwin = { module = "io.ktor:ktor-client-darwin", version.ref = "ktor" }
sqldelight-android = { module = "app.cash.sqldelight:android-driver", version.ref = "sqldelight" }
sqldelight-native = { module = "app.cash.sqldelight:native-driver", version.ref = "sqldelight" }
koin-core = { module = "io.insert-koin:koin-core", version.ref = "koin" }
compose-runtime = { module = "androidx.compose.runtime:runtime", version.ref = "compose" }

[plugins]
multiplatform = { id = "org.jetbrains.kotlin.multiplatform", version.ref = "kotlin" }
android-application = { id = "com.android.application", version.ref = "agp" }
android-library = { id = "com.android.library", version.ref = "agp" }
serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
compose-multiplatform = { id = "org.jetbrains.compose", version.ref = "compose-multiplatform" }
sqldelight = { id = "app.cash.sqldelight", version.ref = "sqldelight" }
```

### `shared/build.gradle.kts`

```kotlin
plugins {
    alias(libs.plugins.multiplatform)
    alias(libs.plugins.android.library)
    alias(libs.plugins.serialization)
    alias(libs.plugins.sqldelight)
}

kotlin {
    androidTarget {
        compilations.all {
            kotlinOptions { jvmTarget = "17" }
        }
    }

    listOf(
        iosX64(),       // iOS simulator on Intel Mac (rare; deprecated in favor of arm64-sim)
        iosArm64(),     // iOS device
        iosSimulatorArm64()  // iOS simulator on Apple Silicon Mac
    ).forEach { target ->
        target.binaries.framework {
            baseName = "Shared"
            isStatic = true  // static framework = no dynamic linking, faster startup
        }
    }

    sourceSets {
        commonMain.dependencies {
            implementation(libs.kotlinx.coroutines.core)
            implementation(libs.kotlinx.serialization.json)
            implementation(libs.ktor.client.core)
            implementation(libs.koin.core)
        }
        androidMain.dependencies {
            implementation(libs.ktor.client.android)
            implementation(libs.sqldelight.android)
        }
        iosMain.dependencies {
            implementation(libs.ktor.client.darwin)
            implementation(libs.sqldelight.native)
        }
        commonTest.dependencies {
            implementation(kotlin("test"))
        }
    }
}

android {
    namespace = "com.example.myapp.shared"
    compileSdk = 35
    defaultConfig {
        minSdk = 24
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
```

### `androidApp/build.gradle.kts` (consumes shared)

```kotlin
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.compose.multiplatform)
}

android {
    namespace = "com.example.myapp"
    compileSdk = 35
    defaultConfig {
        applicationId = "com.example.myapp"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }
    signingConfigs {
        create("release") {
            // Read from keystore.properties; never commit signing secrets
        }
    }
    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles("proguard-rules.pro")
            signingConfig = signingConfigs.getByName("release")
        }
    }
}

dependencies {
    implementation(project(":shared"))
    implementation(libs.compose.runtime)
}
```

## Bar 3 — iOS framework integration

Xcode needs to find and embed the Shared framework. Three approaches:

### Approach A — CocoaPods (simplest, 90% of projects use this)

Add to `shared/build.gradle.kts`:

```kotlin
plugins {
    alias(libs.plugins.kotlin.cocoapods)  // add to libs.versions.toml: kotlin-cocoapods = ...
}

kotlin {
    cocoapods {
        version = "1.0.0"
        summary = "Shared Kotlin code for myapp"
        homepage = "https://github.com/example/myapp"
        ios.deploymentTarget = "16.0"
        framework {
            baseName = "Shared"
            isStatic = true
        }
        podfile = project.file("../iosApp/Podfile")
    }
}
```

Then in `iosApp/Podfile`:

```ruby
platform :ios, '16.0'
use_frameworks!

target 'iosApp' do
  pod 'shared', :path => '../shared'
end
```

Build the iOS framework + run pod install:

```bash
./gradlew :shared:podPublishXCFramework
cd iosApp && pod install
```

Open `iosApp.xcworkspace` (NOT `.xcodeproj` after CocoaPods integration) in Xcode.

### Approach B — Swift Package Manager (SPM, modern)

Build XCFramework:

```bash
./gradlew :shared:assembleSharedXCFramework
```

Outputs `shared/build/XCFrameworks/release/Shared.xcframework`.

In Xcode: File → Add Packages → Local → select Shared.xcframework's Package.swift (you'll need to create one).

This approach is cleaner but has rough edges with Compose Multiplatform.

### Approach C — Direct framework embed (legacy, fragile)

```bash
./gradlew :shared:linkReleaseFrameworkIosArm64
# Outputs: shared/build/bin/iosArm64/releaseFramework/Shared.framework
```

Drag-drop into Xcode project → Target → General → Frameworks, Libraries → set Embed & Sign.

Brittle — re-do every clean build. Only use for prototypes.

### Versioning iOS Info.plist

The Xcode project's Info.plist version (CFBundleShortVersionString) should sync with Gradle's versionName for consistency. Use a script in the iosApp Build Phases:

```bash
# iosApp/Build Phases → New Run Script Phase
VERSION=$(grep "versionName = " ../androidApp/build.gradle.kts | sed 's/.*"\(.*\)"/\1/')
plutil -replace CFBundleShortVersionString -string "$VERSION" "${INFOPLIST_FILE}"
```

Or for KMP-native versioning, use `versionString` from your shared module config.

## Bar 4 — Compose Multiplatform vs native UI

Three choices:

### Native UI per platform (most flexible)
- Android: Jetpack Compose (recommended) or XML Views
- iOS: SwiftUI (recommended) or UIKit
- 100% native feel; more code
- Shared: only business logic

### Compose Multiplatform (UI in Kotlin)
- Single Compose codebase for Android + iOS + Desktop
- Less code; somewhat less native feel
- Phase 1 for production iOS (still maturing); use for non-critical UI
- Skip for App Store submission unless user has Compose-specific requirements

### Hybrid
- Compose Multiplatform for shared screens (settings, onboarding, lists)
- Native UI for high-stakes screens (camera, animations, complex gestures)

For `/ship-kmp` Gate 0, ask the user which approach. Default recommendation: **native UI per platform** unless the user specifically wants Compose Multiplatform.

## Bar 5 — Build commands per target

### Android

```bash
# Debug AAB
./gradlew :androidApp:bundleDebug

# Release AAB (signed)
./gradlew :androidApp:bundleRelease

# Output: androidApp/build/outputs/bundle/release/androidApp-release.aab
```

### iOS

```bash
# Build the framework that Xcode embeds
./gradlew :shared:linkReleaseFrameworkIosArm64

# Then in Xcode: Product → Archive → Distribute App → App Store Connect
# Or via xcodebuild CLI:
xcodebuild -workspace iosApp/iosApp.xcworkspace \
           -scheme iosApp \
           -configuration Release \
           -archivePath build/iosApp.xcarchive \
           archive

xcodebuild -exportArchive \
           -archivePath build/iosApp.xcarchive \
           -exportPath build/iosApp.ipa \
           -exportOptionsPlist iosApp/ExportOptions.plist
```

### Desktop (optional)

```bash
./gradlew :desktopApp:packageDmg          # macOS
./gradlew :desktopApp:packageDeb          # Debian/Ubuntu
./gradlew :desktopApp:packageMsi          # Windows
```

## Bar 6 — Common pitfalls

### Framework size bloat

Kotlin/Native produces a single binary that includes the runtime. A bare-bones KMP framework is ~5 MB. Adding kotlinx.coroutines, ktor, sqldelight pushes it to 15-30 MB. Mitigations:

- Set `isStatic = true` on the framework declaration (smaller, faster app startup; harder for hot reload)
- Use ProGuard for the Android target (KMP/Native has its own obfuscation flags)
- Audit transitive dependencies; remove unused features

### kotlinx.* version conflicts

If your shared module uses `kotlinx-coroutines:1.9.0` and a transitive iOS dependency expects 1.7.x, the framework will fail to link. Solutions:

- Pin all kotlinx.* to versions tested against your Kotlin version
- Use the version catalog (`libs.versions.toml`) to enforce consistency
- Check Kotlin compatibility matrix: https://kotlinlang.org/docs/multiplatform-compatibility-guide.html

### `expect`/`actual` boilerplate explosion

The `expect`/`actual` mechanism declares an interface in `commonMain` and implements per-platform in `androidMain`/`iosMain`. Easy at small scale; painful at large scale (every change requires touching 3+ files).

Modern alternative: use platform-specific dependency injection via Koin or kotlin-inject. Define an `expect class` in commonMain that's a Koin module, and provide platform-specific implementations via DI rather than language-level `actual`.

### iOS framework not updating in Xcode

After changing Kotlin code:
1. Run `./gradlew :shared:embedAndSignAppleFrameworkForXcode` (CocoaPods + new build script)
2. In Xcode: Product → Clean Build Folder (Cmd+Shift+K)
3. Build again

If still stale: delete `~/Library/Developer/Xcode/DerivedData/iosApp-*` and re-build.

### Compose Multiplatform iOS rough edges

- Text input on iOS may have layout issues with Compose
- iOS gestures (pinch zoom, swipe back) sometimes conflict with Compose handlers
- App Store review may flag non-native UI behavior
- Recommendation: ship with native UI for v1; consider Compose Multiplatform for v2+ if pain points justify

## Resources

- [Kotlin Multiplatform docs](https://kotlinlang.org/docs/multiplatform.html) — official
- [JetBrains KMP samples](https://github.com/JetBrains/compose-multiplatform-template) — template repo
- [KMP compatibility matrix](https://kotlinlang.org/docs/multiplatform-compatibility-guide.html) — version pinning
- [Compose Multiplatform docs](https://github.com/JetBrains/compose-multiplatform) — UI framework
- [Touchlab KaMPKit](https://github.com/touchlab/KaMPKit) — production-grade KMP starter

## Output for /ship-kmp Gate 1+2

Save validation report to `./go-to-market/kmp/notes/build-config.md`:

```markdown
# KMP Build Config — {date}

## Project structure
- shared/ module: {present|missing}
- androidApp/ module: {present|missing}
- iosApp/ Xcode project: {present|missing}

## Gradle
- Kotlin version: {value}
- AGP version: {value}
- Targets declared: {androidTarget, iosArm64, iosSimulatorArm64, ...}
- Compose Multiplatform: {used|not used}

## iOS integration
- Approach: {CocoaPods|SPM|direct embed}
- Framework name: Shared
- Static framework: {true|false}

## Versioning
- versionName (Android): {value}
- versionCode (Android): {value}
- CFBundleShortVersionString (iOS): {value} (matches: {yes|no})

## Issues
- ...
```
