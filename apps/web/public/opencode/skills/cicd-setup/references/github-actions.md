# GitHub Actions Configuration Reference

Complete workflow files for a Flutter app with three workflows.

## File Structure

```
project-root/
├── .github/
│   └── workflows/
│       ├── pr-checks.yml       # PR quality gate
│       ├── android.yml         # Android build & release
│       └── ios.yml             # iOS build & release
├── scripts/
│   ├── generate_config.sh
│   ├── quality_checks.sh
│   └── upload_symbols.sh
└── lib/core/env/
    ├── env_ci.dart             # Template (committed)
    └── env_ci.g.dart           # Generated (.gitignore)
```

## Workflow 1: PR Quality Gate

```yaml
# .github/workflows/pr-checks.yml
name: PR Quality Gate

on:
  pull_request:
    branches: [develop]
    types: [opened, synchronize, reopened, ready_for_review]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality-checks:
    name: Format, analyze, test
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '17'

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version-file: pubspec.yaml
          channel: stable
          cache: true

      - name: Install dependencies
        run: flutter pub get

      - name: Run quality checks
        run: chmod +x scripts/quality_checks.sh && ./scripts/quality_checks.sh
```

**Monorepo variant** — if Flutter is in `apps/mobile/`, add path filtering and `working-directory`:

```yaml
on:
  pull_request:
    branches: [develop]
    paths:
      - 'apps/mobile/**'
      - '.github/workflows/pr-checks.yml'

jobs:
  quality-checks:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/mobile
    # ... same steps
```

## Workflow 2: Android Build & Release

```yaml
# .github/workflows/android.yml
name: Android Build & Release

on:
  push:
    branches: [develop, staging, production]

concurrency:
  group: android-${{ github.ref }}
  cancel-in-progress: true

jobs:
  android:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '17'
          cache: gradle

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version-file: pubspec.yaml
          channel: stable
          cache: true

      - name: Install dependencies
        run: flutter pub get

      - name: Detect environment
        id: env
        run: |
          BRANCH="${GITHUB_REF##*/}"
          echo "branch=$BRANCH" >> "$GITHUB_OUTPUT"
          case "$BRANCH" in
            develop)    echo "ENV=dev" >> "$GITHUB_OUTPUT" ;;
            staging)    echo "ENV=staging" >> "$GITHUB_OUTPUT" ;;
            production) echo "ENV=production" >> "$GITHUB_OUTPUT" ;;
          esac

      - name: Generate config
        run: |
          chmod +x scripts/generate_config.sh
          case "${{ steps.env.outputs.ENV }}" in
            dev)
              ./scripts/generate_config.sh dev \
                "https://dev.api.example.com" "dev_placeholder"
              ;;
            staging)
              ./scripts/generate_config.sh staging \
                "${{ secrets.STAGING_BASE_URL }}" \
                "${{ secrets.STAGING_API_KEY }}"
              ;;
            production)
              ./scripts/generate_config.sh production \
                "${{ secrets.PROD_BASE_URL }}" \
                "${{ secrets.PROD_API_KEY }}"
              ;;
          esac

      - name: Restore keystore
        if: steps.env.outputs.ENV != 'dev'
        run: |
          echo "${{ secrets.ANDROID_KEYSTORE_BASE64 }}" | base64 -d > android/app/upload-keystore.jks
          cat <<EOF > android/key.properties
          storePassword=${{ secrets.KEYSTORE_PASSWORD }}
          keyPassword=${{ secrets.KEY_PASSWORD }}
          keyAlias=${{ secrets.KEY_ALIAS }}
          storeFile=upload-keystore.jks
          EOF

      - name: Build artifact
        run: |
          if [ "${{ steps.env.outputs.ENV }}" = "production" ]; then
            flutter build appbundle --release \
              --obfuscate \
              --split-debug-info=build/symbols
          else
            flutter build appbundle --release
          fi

      - name: Upload Sentry symbols
        if: steps.env.outputs.ENV == 'production'
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
          SENTRY_PROJECT: ${{ secrets.SENTRY_PROJECT }}
        run: |
          chmod +x scripts/upload_symbols.sh
          ./scripts/upload_symbols.sh "$(git rev-parse --short HEAD)"

      - name: Distribute to Firebase
        if: steps.env.outputs.ENV == 'dev' || steps.env.outputs.ENV == 'staging'
        run: |
          npm install -g firebase-tools
          firebase appdistribution:distribute \
            build/app/outputs/bundle/release/app-release.aab \
            --app "${{ secrets.FIREBASE_ANDROID_APP_ID }}" \
            --groups "${{ secrets.FIREBASE_GROUPS }}" \
            --token "${{ secrets.FIREBASE_TOKEN }}"

      - name: Upload to Play Store
        if: steps.env.outputs.ENV == 'production'
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON }}
          packageName: com.example.myapp
          releaseFiles: build/app/outputs/bundle/release/app-release.aab
          track: production
          status: draft

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: android-${{ steps.env.outputs.ENV }}-${{ github.sha }}
          path: build/app/outputs/bundle/release/app-release.aab
          retention-days: 14
```

## Workflow 3: iOS Build & Release

```yaml
# .github/workflows/ios.yml
name: iOS Build & Release

on:
  push:
    branches: [develop, staging, production]

concurrency:
  group: ios-${{ github.ref }}
  cancel-in-progress: true

jobs:
  ios:
    runs-on: macos-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version-file: pubspec.yaml
          channel: stable
          cache: true

      - name: Install dependencies
        run: flutter pub get

      - name: Detect environment
        id: env
        run: |
          BRANCH="${GITHUB_REF##*/}"
          echo "branch=$BRANCH" >> "$GITHUB_OUTPUT"
          case "$BRANCH" in
            develop)    echo "ENV=dev" >> "$GITHUB_OUTPUT" ;;
            staging)    echo "ENV=staging" >> "$GITHUB_OUTPUT" ;;
            production) echo "ENV=production" >> "$GITHUB_OUTPUT" ;;
          esac

      - name: Generate config
        run: |
          chmod +x scripts/generate_config.sh
          case "${{ steps.env.outputs.ENV }}" in
            dev)
              ./scripts/generate_config.sh dev \
                "https://dev.api.example.com" "dev_placeholder"
              ;;
            staging)
              ./scripts/generate_config.sh staging \
                "${{ secrets.STAGING_BASE_URL }}" \
                "${{ secrets.STAGING_API_KEY }}"
              ;;
            production)
              ./scripts/generate_config.sh production \
                "${{ secrets.PROD_BASE_URL }}" \
                "${{ secrets.PROD_API_KEY }}"
              ;;
          esac

      - name: Install CocoaPods
        run: cd ios && pod install

      - name: Import signing certificate
        if: steps.env.outputs.ENV != 'dev'
        run: |
          echo "${{ secrets.IOS_CERTIFICATE_BASE64 }}" | base64 -d > cert.p12
          security create-keychain -p "" build.keychain
          security import cert.p12 -k build.keychain \
            -P "${{ secrets.IOS_CERTIFICATE_PASSWORD }}" -T /usr/bin/codesign
          security list-keychains -s build.keychain
          security default-keychain -s build.keychain
          security unlock-keychain -p "" build.keychain
          security set-key-partition-list -S apple-tool:,apple: -s -k "" build.keychain

      - name: Install provisioning profile
        if: steps.env.outputs.ENV != 'dev'
        run: |
          echo "${{ secrets.IOS_PROVISIONING_PROFILE_BASE64 }}" | base64 -d > profile.mobileprovision
          mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles
          cp profile.mobileprovision ~/Library/MobileDevice/Provisioning\ Profiles/

      - name: Build iOS
        run: |
          case "${{ steps.env.outputs.ENV }}" in
            dev)
              flutter build ios --release --no-codesign
              ;;
            staging)
              flutter build ipa --release
              ;;
            production)
              flutter build ipa --release \
                --obfuscate \
                --split-debug-info=build/symbols
              ;;
          esac

      - name: Upload Sentry symbols
        if: steps.env.outputs.ENV == 'production'
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
          SENTRY_PROJECT: ${{ secrets.SENTRY_PROJECT }}
        run: |
          chmod +x scripts/upload_symbols.sh
          ./scripts/upload_symbols.sh "$(git rev-parse --short HEAD)"

      - name: Upload to TestFlight
        if: steps.env.outputs.ENV == 'staging' || steps.env.outputs.ENV == 'production'
        env:
          APP_STORE_CONNECT_API_KEY_ID: ${{ secrets.APP_STORE_CONNECT_API_KEY_ID }}
          APP_STORE_CONNECT_API_ISSUER_ID: ${{ secrets.APP_STORE_CONNECT_API_ISSUER_ID }}
          APP_STORE_CONNECT_API_KEY_CONTENT: ${{ secrets.APP_STORE_CONNECT_API_KEY_CONTENT }}
        run: |
          cd ios
          gem install bundler
          bundle install
          bundle exec fastlane beta

      - name: Upload to App Store
        if: steps.env.outputs.ENV == 'production'
        env:
          APP_STORE_CONNECT_API_KEY_ID: ${{ secrets.APP_STORE_CONNECT_API_KEY_ID }}
          APP_STORE_CONNECT_API_ISSUER_ID: ${{ secrets.APP_STORE_CONNECT_API_ISSUER_ID }}
          APP_STORE_CONNECT_API_KEY_CONTENT: ${{ secrets.APP_STORE_CONNECT_API_KEY_CONTENT }}
        run: |
          cd ios
          bundle exec fastlane release

      - name: Upload artifact
        if: steps.env.outputs.ENV != 'dev'
        uses: actions/upload-artifact@v4
        with:
          name: ios-${{ steps.env.outputs.ENV }}-${{ github.sha }}
          path: build/ios/ipa/*.ipa
          retention-days: 14
```

## Workflow 4: Windows Microsoft Store (optional desktop target)

Add this only when the Flutter app also ships to the Microsoft Store. It runs on a Windows runner, builds the desktop app, and publishes to Partner Center via the Microsoft Dev Store CLI.

```yaml
# .github/workflows/msstore.yml
name: Microsoft Store Build & Publish

on:
  push:
    branches: [production]

concurrency:
  group: msstore-${{ github.ref }}
  cancel-in-progress: true

jobs:
  msstore:
    runs-on: windows-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version-file: pubspec.yaml
          channel: stable
          cache: true

      - name: Enable Windows desktop
        run: flutter config --enable-windows-desktop

      - name: Install dependencies
        run: flutter pub get

      - name: Install Dev Store CLI
        uses: microsoft/setup-msstore-cli@v1

      - name: Configure credentials
        run: >
          msstore reconfigure
          --tenantId ${{ secrets.AZURE_AD_TENANT_ID }}
          --clientId ${{ secrets.AZURE_AD_CLIENT_ID }}
          --clientSecret ${{ secrets.AZURE_AD_CLIENT_SECRET }}
          --sellerId ${{ secrets.SELLER_ID }}

      # 4th version digit MUST be 0 for Microsoft Store — force build-number to 0
      - name: Package MSIX
        run: msstore package . --build-number 0

      - name: Publish to Partner Center
        run: msstore publish -v
```

**Prerequisites (one-time, before this workflow can succeed):**
1. App reserved in Partner Center with **at least one completed manual submission** (CI publishes updates, not the first release).
2. Run `msstore init` once locally in the repo to generate the project association.
3. Azure AD app registration (single tenant) with a client secret, assigned the Developer role in Partner Center — this supplies the four secrets above.

## Fastlane Setup (iOS)

Required for GitHub Actions iOS distribution.

**`ios/Gemfile`:**
```ruby
source "https://rubygems.org"
gem "fastlane"
```

**`ios/fastlane/Fastfile`:**
```ruby
default_platform(:ios)

platform :ios do
  lane :beta do
    api_key = app_store_connect_api_key(
      key_id: ENV["APP_STORE_CONNECT_API_KEY_ID"],
      issuer_id: ENV["APP_STORE_CONNECT_API_ISSUER_ID"],
      key_content: ENV["APP_STORE_CONNECT_API_KEY_CONTENT"],
      is_key_content_base64: false
    )

    upload_to_testflight(
      api_key: api_key,
      ipa: "../build/ios/ipa/*.ipa",
      skip_waiting_for_build_processing: true
    )
  end

  lane :release do
    api_key = app_store_connect_api_key(
      key_id: ENV["APP_STORE_CONNECT_API_KEY_ID"],
      issuer_id: ENV["APP_STORE_CONNECT_API_ISSUER_ID"],
      key_content: ENV["APP_STORE_CONNECT_API_KEY_CONTENT"],
      is_key_content_base64: false
    )

    upload_to_app_store(
      api_key: api_key,
      ipa: "../build/ios/ipa/*.ipa",
      force: true,
      skip_screenshots: true,
      skip_metadata: true
    )
  end
end
```

## GitHub Secrets Configuration

Configure in **Settings > Secrets and variables > Actions**:

| Secret | Description |
|--------|-------------|
| `ANDROID_KEYSTORE_BASE64` | `base64 -w 0 upload-keystore.jks` |
| `KEYSTORE_PASSWORD` | Keystore password |
| `KEY_ALIAS` | Key alias (e.g., `upload`) |
| `KEY_PASSWORD` | Key password |
| `IOS_CERTIFICATE_BASE64` | `base64 -w 0 Certificates.p12` |
| `IOS_CERTIFICATE_PASSWORD` | Certificate password |
| `IOS_PROVISIONING_PROFILE_BASE64` | `base64 -w 0 profile.mobileprovision` |
| `FIREBASE_TOKEN` | `firebase login:ci` output |
| `FIREBASE_ANDROID_APP_ID` | Firebase app ID |
| `FIREBASE_GROUPS` | Tester group names |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Service account JSON |
| `APP_STORE_CONNECT_API_KEY_ID` | Key ID from App Store Connect |
| `APP_STORE_CONNECT_API_ISSUER_ID` | Issuer ID |
| `APP_STORE_CONNECT_API_KEY_CONTENT` | `.p8` file content |
| `STAGING_BASE_URL` | Staging API URL |
| `STAGING_API_KEY` | Staging API key |
| `PROD_BASE_URL` | Production API URL |
| `PROD_API_KEY` | Production API key |
| `SENTRY_AUTH_TOKEN` | Sentry auth token |
| `SENTRY_ORG` | Sentry org slug |
| `SENTRY_PROJECT` | Sentry project slug |
| `AZURE_AD_TENANT_ID` | Azure AD tenant ID (Microsoft Store publish) |
| `AZURE_AD_CLIENT_ID` | Azure AD app registration client ID |
| `AZURE_AD_CLIENT_SECRET` | Azure AD client secret |
| `SELLER_ID` | Partner Center Seller ID (Account settings → Legal info) |

## Monorepo Considerations

For monorepo setups where Flutter is at `apps/mobile/`:

1. Add `paths:` filter to `on.push` and `on.pull_request`
2. Set `defaults.run.working-directory: apps/mobile` on each job
3. Adjust artifact paths to include the prefix
4. Use `dorny/paths-filter@v2` for conditional job execution across packages
