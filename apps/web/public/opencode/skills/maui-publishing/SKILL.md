---
name: maui-publishing
description: ".NET MAUI multi-target publishing for Android, iOS, Windows (Microsoft Store), and macOS (Mac Catalyst). Covers .NET workload setup, project structure (Platforms/{Android,iOS,Windows,MacCatalyst}), build modes (Debug, Release with AOT/R2R/trimming), per-target signing (Android keystore, iOS provisioning, MSIX self-signing or Microsoft Store, Mac App Store), entitlements, code signing CI workflow, .csproj target framework matrix, MAUI Hot Reload limits in production, and typical migration pitfalls from Xamarin.Forms. Use this skill when the user asks about .NET MAUI, MAUI publishing, dotnet workload install maui, .csproj TargetFrameworks for MAUI, MAUI Android/iOS/Windows packaging, MAUI MSIX, MAUI App Store submission, Xamarin to MAUI migration, or 'ship a .NET MAUI app'."
---

# .NET MAUI Multi-Target Publishing

.NET MAUI (Multi-platform App UI) is Microsoft's evolution of Xamarin.Forms. A single .NET 8/9 codebase targets Android, iOS, Windows (WinUI 3), and macOS (Mac Catalyst).

This skill walks through:

1. .NET workload setup
2. Project structure
3. Per-target build commands
4. Signing per platform
5. Publishing modes (AOT, R2R, trimming)
6. Common migration pitfalls (Xamarin → MAUI)

## When to invoke

- During `/app-gtm-release:ship-maui` Gates 1-3
- When the user asks: ".NET MAUI", "MAUI publishing", "dotnet maui", "MAUI signing", "MAUI iOS provisioning", "MAUI MSIX", "Xamarin migration"

## Bar 1 — Workload setup

MAUI is delivered as a .NET workload. Install the latest:

```bash
dotnet workload install maui
dotnet workload list
# Should show: maui, maui-android, maui-ios, maui-maccatalyst, maui-windows
```

For specific frameworks:
```bash
dotnet workload install maui-android
dotnet workload install maui-ios
dotnet workload install maui-windows
dotnet workload install maui-maccatalyst
```

For CI (avoids interactive prompts):
```bash
dotnet workload install maui --skip-sign-check
```

Keep workloads up-to-date:
```bash
dotnet workload update
```

### .NET version targeting

| MAUI version | .NET required | Stable since |
|---|---|---|
| MAUI 9.0 | .NET 9 | 2026-Q1 |
| MAUI 8.0 | .NET 8 | 2024-Q1 (LTS) |
| MAUI 7.0 | .NET 7 | end-of-life |

Use .NET 8 for production (LTS support until 2027). Use .NET 9 for new projects starting 2026 onwards.

## Bar 2 — Project structure

A typical MAUI project:

```
MyMauiApp/
├── MyMauiApp.csproj                  # Multi-target project file
├── App.xaml + App.xaml.cs            # Application entry
├── AppShell.xaml + AppShell.xaml.cs  # Shell navigation
├── MainPage.xaml + MainPage.xaml.cs
├── MauiProgram.cs                    # DI + app builder
├── Resources/
│   ├── AppIcon/
│   ├── Splash/
│   ├── Fonts/
│   ├── Images/
│   ├── Raw/
│   └── Styles/
├── Platforms/
│   ├── Android/
│   │   ├── AndroidManifest.xml
│   │   ├── MainActivity.cs
│   │   ├── MainApplication.cs
│   │   └── Resources/
│   ├── iOS/
│   │   ├── AppDelegate.cs
│   │   ├── Info.plist
│   │   ├── Program.cs
│   │   └── Entitlements.plist
│   ├── MacCatalyst/
│   │   ├── AppDelegate.cs
│   │   ├── Info.plist
│   │   ├── Program.cs
│   │   └── Entitlements.plist
│   ├── Tizen/
│   └── Windows/
│       ├── App.xaml + App.xaml.cs
│       ├── Package.appxmanifest      # MSIX manifest for Microsoft Store
│       └── app.manifest
└── ViewModels/, Models/, Services/   # Your app code
```

### `.csproj` MAUI configuration

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFrameworks>net8.0-android;net8.0-ios;net8.0-maccatalyst</TargetFrameworks>
    <TargetFrameworks Condition="$([MSBuild]::IsOSPlatform('windows'))">$(TargetFrameworks);net8.0-windows10.0.19041.0</TargetFrameworks>
    <OutputType>Exe</OutputType>
    <RootNamespace>MyMauiApp</RootNamespace>
    <UseMaui>true</UseMaui>
    <SingleProject>true</SingleProject>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>

    <ApplicationTitle>My MAUI App</ApplicationTitle>
    <ApplicationId>com.example.mymauiapp</ApplicationId>
    <ApplicationVersion>1</ApplicationVersion>
    <ApplicationDisplayVersion>1.0.0</ApplicationDisplayVersion>

    <SupportedOSPlatformVersion Condition="$([MSBuild]::GetTargetPlatformIdentifier('$(TargetFramework)')) == 'ios'">15.0</SupportedOSPlatformVersion>
    <SupportedOSPlatformVersion Condition="$([MSBuild]::GetTargetPlatformIdentifier('$(TargetFramework)')) == 'maccatalyst'">15.0</SupportedOSPlatformVersion>
    <SupportedOSPlatformVersion Condition="$([MSBuild]::GetTargetPlatformIdentifier('$(TargetFramework)')) == 'android'">21.0</SupportedOSPlatformVersion>
    <SupportedOSPlatformVersion Condition="$([MSBuild]::GetTargetPlatformIdentifier('$(TargetFramework)')) == 'windows'">10.0.17763.0</SupportedOSPlatformVersion>
    <TargetPlatformMinVersion Condition="$([MSBuild]::GetTargetPlatformIdentifier('$(TargetFramework)')) == 'windows'">10.0.17763.0</TargetPlatformMinVersion>
  </PropertyGroup>

  <PropertyGroup Condition="$([MSBuild]::GetTargetPlatformIdentifier('$(TargetFramework)')) == 'windows' AND '$(Configuration)' == 'Release'">
    <PublishTrimmed>true</PublishTrimmed>
    <TrimMode>partial</TrimMode>
    <PublishReadyToRun>true</PublishReadyToRun>
  </PropertyGroup>
</Project>
```

## Bar 3 — Build commands per target

### Android

```bash
# Debug install + run on connected device
dotnet build -t:Run -f net8.0-android -c Debug

# Release AAB (ready for Play Console)
dotnet publish -f net8.0-android -c Release \
  -p:AndroidPackageFormat=aab \
  -p:AndroidKeyStore=true \
  -p:AndroidSigningKeyStore=mykeystore.jks \
  -p:AndroidSigningKeyAlias=key0 \
  -p:AndroidSigningStorePass=$KEYSTORE_PASS \
  -p:AndroidSigningKeyPass=$KEYSTORE_PASS

# Output: bin/Release/net8.0-android/publish/com.example.mymauiapp-Signed.aab
```

For Play App Signing (Google holds the upload key, you keep separate "upload" key):
- Use `AndroidPackageFormat=aab`
- Set `AndroidUseLatestPlatformSdk=true`

### iOS

```bash
# Build to simulator
dotnet build -t:Run -f net8.0-ios -c Debug -p:_DeviceName=:v2:udid=SIMULATOR_UDID

# Release IPA (ready for App Store Connect)
dotnet publish -f net8.0-ios -c Release \
  -p:RuntimeIdentifier=ios-arm64 \
  -p:ArchiveOnBuild=true \
  -p:CodesignKey="Apple Distribution: Your Name (TEAM_ID)" \
  -p:CodesignProvision="Your Provisioning Profile Name"

# Output: bin/Release/net8.0-ios/ios-arm64/publish/MyMauiApp.ipa
```

For TestFlight: archive + upload via Xcode Organizer or `xcrun altool`.

### Windows (Microsoft Store via MSIX)

```bash
# Debug
dotnet build -t:Run -f net8.0-windows10.0.19041.0 -c Debug

# Release MSIX bundle (ready for Microsoft Store)
dotnet publish -f net8.0-windows10.0.19041.0 -c Release \
  -p:RuntimeIdentifierOverride=win10-x64 \
  -p:GenerateAppxPackageOnBuild=true \
  -p:AppxPackageSigningEnabled=false  # Microsoft Store will sign

# Output: bin/Release/net8.0-windows10.0.19041.0/win10-x64/AppPackages/MyMauiApp_1.0.0.0_x64.msixbundle
```

For sideload testing: set `AppxPackageSigningEnabled=true` and provide a self-signed cert. NOT for Store submission.

For Microsoft Store submission, defer to `/app-gtm-release:ship-msstore` (path B native MSIX). It handles Partner Center reservation, package upload, certification.

### macOS (Mac Catalyst)

Phase 3 — but if you want to ship to Mac App Store now:

```bash
dotnet publish -f net8.0-maccatalyst -c Release \
  -p:RuntimeIdentifier=maccatalyst-arm64 \
  -p:CreatePackage=true

# Output: bin/Release/net8.0-maccatalyst/maccatalyst-arm64/publish/MyMauiApp.pkg
```

Mac App Store submission is a Phase 3 deliverable; for now, document the path and let user submit manually via Xcode.

## Bar 4 — Signing per platform

### Android keystore

Generate a release keystore (or use existing):
```bash
keytool -genkey -v -keystore mauiapp.keystore -alias mauikey \
        -keyalg RSA -keysize 2048 -validity 10000
```

Store securely (NOT in repo); reference in CI via secrets:
```bash
dotnet publish ... \
  -p:AndroidSigningKeyStore=$KEYSTORE_PATH \
  -p:AndroidSigningKeyAlias=$KEY_ALIAS \
  -p:AndroidSigningStorePass=$KEYSTORE_PASS \
  -p:AndroidSigningKeyPass=$KEY_PASS
```

For Play App Signing, generate the upload key only; Google manages the app signing key after first upload.

### iOS provisioning

Use Xcode-managed signing (recommended for first release):

`Platforms/iOS/Entitlements.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>aps-environment</key>
    <string>production</string>  <!-- if using push notifications -->
</dict>
</plist>
```

CI signing: use Fastlane match for distributed teams, or App Store Connect API key for solo dev:

```bash
# Download distribution profile
fastlane match appstore --readonly

# Build with the profile
dotnet publish -f net8.0-ios ... \
  -p:CodesignKey="Apple Distribution: ..." \
  -p:CodesignProvision="match AppStore com.example.mymauiapp"
```

### Windows MSIX

For Microsoft Store: leave package unsigned, Microsoft signs during certification. Use `AppxPackageSigningEnabled=false`.

For sideload (testing/internal distribution): self-sign:
```powershell
$cert = New-SelfSignedCertificate -Type Custom -Subject "CN=YourCompany" `
                                  -KeyUsage DigitalSignature -FriendlyName "MAUI Test Cert" `
                                  -CertStoreLocation "Cert:\CurrentUser\My"
Export-PfxCertificate -Cert $cert -FilePath "mauicert.pfx" -Password (ConvertTo-SecureString -String "TestPass" -Force -AsPlainText)
```

Reference in `.csproj`:
```xml
<PropertyGroup>
  <AppxPackageSigningEnabled>true</AppxPackageSigningEnabled>
  <PackageCertificateKeyFile>mauicert.pfx</PackageCertificateKeyFile>
  <PackageCertificatePassword>TestPass</PackageCertificatePassword>
</PropertyGroup>
```

NEVER commit the .pfx file or password.

## Bar 5 — Publishing modes (AOT, R2R, trimming)

### AOT (Ahead-of-Time compilation)
- Compiles to native code at build time → faster startup, no JIT
- Larger binary
- iOS uses AOT by default (Apple's policy bans JIT on iOS)
- Android: optional, increases APK size by ~40-60%
- Windows: optional, mostly used for performance-critical apps

```xml
<PropertyGroup Condition="'$(Configuration)' == 'Release'">
  <RunAOTCompilation>true</RunAOTCompilation>
</PropertyGroup>
```

### R2R (Ready-to-Run)
- Pre-compiles assemblies to platform-specific code
- Mid-point between JIT and full AOT: faster startup than JIT, smaller than AOT
- Default for .NET 8+ Release builds on Windows

```xml
<PublishReadyToRun>true</PublishReadyToRun>
```

### Trimming
- Removes unused code from the assembly
- Reduces app size significantly (30-50% smaller binaries)
- Can break reflection-based libraries (e.g., serializers using `Type.GetType()`)
- Test thoroughly before enabling for production

```xml
<PublishTrimmed>true</PublishTrimmed>
<TrimMode>partial</TrimMode>  <!-- or 'full' -->
```

For MAUI, partial trimming is usually safe. Full trimming requires reviewing every dependency.

## Bar 6 — Common pitfalls

### Xamarin.Forms migration

Xamarin.Forms apps must migrate to MAUI; Microsoft ended Xamarin support 2024-05-01. Migration steps:

1. Run the MAUI upgrade assistant: `dotnet tool install -g upgrade-assistant`
2. `upgrade-assistant upgrade .` in your Xamarin solution
3. Manually migrate `App.xaml` and `MainPage` (entry points changed)
4. Custom renderers → handler pattern in MAUI
5. Effects API removed; use handlers
6. `DependencyService` → DI via `MauiProgram.CreateMauiApp()`

The assistant doesn't catch everything — expect 1-2 weeks of manual cleanup for non-trivial apps.

### Hot Reload limits in production

MAUI Hot Reload works in Debug builds only. For Release / production:
- Use feature flags for runtime config changes
- For OTA UI updates, consider Capacitor Live Updates (web-based) or rebuilding entirely (most MAUI apps don't OTA UI)

### iOS link errors

Common: `error MT5210: Native linking failed, undefined Objective-C class`. Cause: missing iOS framework reference. Fix in `Platforms/iOS/Entitlements.plist` capabilities or add `[assembly: LinkWith]` attributes.

### Android signing mismatch on update

If you change keystore between releases, Play Console rejects the upload (signing key fingerprint must match). Always use the same keystore for app updates. Use Play App Signing to delegate this concern to Google.

### Windows MSIX dependencies missing

If the MSIX targets a specific Windows version (e.g., 10.0.19041.0 = Windows 10 May 2020), users on older Windows can't install. Set the lowest reasonable `TargetPlatformMinVersion`.

## Resources

- [.NET MAUI docs](https://learn.microsoft.com/en-us/dotnet/maui/) — official
- [MAUI publishing guide](https://learn.microsoft.com/en-us/dotnet/maui/deployment/) — per-platform deep dives
- [Xamarin to MAUI migration](https://learn.microsoft.com/en-us/dotnet/maui/migration/) — official migration guide
- [MAUI samples](https://github.com/dotnet/maui-samples) — reference implementations
- [Andreas Nesheim's MAUI blog](https://www.andreasnesheim.no/) — community deep-dives

## Output for /ship-maui Gate 1+2

Save validation report to `./go-to-market/maui/notes/build-config.md`:

```markdown
# MAUI Build Config — {date}

## Targets in .csproj
- net8.0-android: {present|absent}
- net8.0-ios: {present|absent}
- net8.0-maccatalyst: {present|absent}
- net8.0-windows10.0.19041.0: {present|absent}

## Publishing modes
- AOT: {true|false}
- R2R: {true|false}
- Trimming: {none|partial|full}

## Signing
- Android keystore: {ready|missing}
- iOS provisioning: {Xcode-managed|Fastlane match|missing}
- Windows MSIX: {auto-sign by Store|self-signed for sideload}

## Issues
- ...
```
