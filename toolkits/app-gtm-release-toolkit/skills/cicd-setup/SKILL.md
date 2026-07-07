---
name: cicd-setup
description: "Set up CI/CD pipelines for Flutter app builds and releases using Codemagic (priority) or GitHub Actions. Use this skill when the user asks about Flutter CI/CD, automated builds, Codemagic setup, GitHub Actions for Flutter, code signing automation, build pipelines, or deploying Flutter apps through CI. Also triggers on: 'automate my builds', 'set up continuous integration', 'pipeline for Flutter', 'codemagic.yaml', 'workflow for Flutter', or any mention of automating Flutter app distribution."
---

# CI/CD Pipeline Setup for Flutter

This skill configures automated build, test, and deployment pipelines for Flutter mobile apps. It produces three workflows that cover the full release lifecycle.

## Three Workflows

Every Flutter CI/CD setup needs these three workflows, regardless of platform:

1. **PR Quality Gate** — runs on pull requests, blocks merge if quality checks fail
2. **Android Pipeline** — builds, signs, and distributes Android artifacts per environment
3. **iOS Pipeline** — builds, signs, and distributes iOS artifacts per environment

## Platform Selection

**GitHub Actions + Custom Runners (recommended when you already have CI/CD infra):**
- Read `references/github-actions.md` for complete workflow files
- If your org already uses custom runners (Blacksmith, Buildjet, self-hosted), use them for Flutter too
- Add Flutter via `subosito/flutter-action@v2` — works on any Ubuntu runner
- Path filtering for monorepo setups
- Same dashboard, secrets, and billing as your existing CI/CD
- Signing: manual (keystore in secrets, key.properties generated in CI)

**GitHub Actions + GitHub-hosted runners (starting from scratch, budget-conscious):**
- Read `references/github-actions.md` for complete workflow files
- 2000 free Linux minutes/month, 200 macOS minutes
- Larger action ecosystem but slower than custom runners
- Good for small projects without existing CI infra

**Codemagic (recommended for iOS releases or teams without CI/CD):**
- Read `references/codemagic.md` for the complete `codemagic.yaml` configuration
- Native Flutter support — no Docker images or custom setup
- Built-in code signing UI for both Android and iOS
- Mac Mini M2 instances for iOS builds — no macOS runner management
- 500 free build minutes/month on the free tier
- Best value when you need iOS builds without managing macOS infrastructure

## Common Architecture

Both platforms share the same logical architecture. The differences are in YAML syntax and platform-specific features.

### Environment Detection

Pipelines detect the target environment from the branch name:

| Branch | Environment | Distribution | Signing | Obfuscation |
|--------|-------------|-------------|---------|-------------|
| `develop` | dev | Firebase App Distribution | Debug or unsigned | No |
| `staging` | staging | Firebase App Distribution / TestFlight | Release signed | No |
| `production` | production | Google Play / App Store | Release signed | Yes |

### Config Injection Pattern

Never commit secrets to the repository. Use template-based injection:

**Template file** (committed): `lib/core/env/env_ci.dart`
```dart
class EnvConfig {
  static const String baseUrl = '<<BASE_URL>>';
  static const String apiKey = '<<API_KEY>>';
  static const String environment = '<<ENV_NAME>>';
}
```

**Generator script** (committed): `scripts/generate_config.sh`
```bash
#!/usr/bin/env bash
set -euo pipefail

ENV_NAME=${1:?Usage: $0 <env> <base-url> <api-key>}
BASE_URL=${2:?}
API_KEY=${3:?}

TEMPLATE="lib/core/env/env_ci.dart"
OUT="lib/core/env/env_ci.g.dart"

sed -e "s|<<BASE_URL>>|$BASE_URL|g" \
    -e "s|<<API_KEY>>|$API_KEY|g" \
    -e "s|<<ENV_NAME>>|$ENV_NAME|g" \
    "$TEMPLATE" > "$OUT"

echo "Config generated for $ENV_NAME"
```

**Generated file** (in `.gitignore`): `lib/core/env/env_ci.g.dart`

### Quality Checks Script

Reusable across both CI platforms: `scripts/quality_checks.sh`
```bash
#!/usr/bin/env bash
set -euo pipefail

echo "=== Formatting ==="
dart format --output=none --set-exit-if-changed .

echo "=== Static analysis ==="
flutter analyze --fatal-infos

echo "=== Tests ==="
flutter test --no-pub --coverage

echo "=== Coverage threshold ==="
THRESHOLD=${COVERAGE_THRESHOLD:-70}
if command -v lcov >/dev/null 2>&1; then
  COVERAGE=$(lcov --summary coverage/lcov.info 2>&1 | grep 'lines' | awk '{print $2}' | sed 's/%//')
  if [ "$(echo "$COVERAGE < $THRESHOLD" | bc)" -eq 1 ]; then
    echo "Coverage $COVERAGE% is below threshold $THRESHOLD%"
    exit 1
  fi
  echo "Coverage: $COVERAGE% (threshold: $THRESHOLD%)"
fi
```

### Sentry Symbol Upload Script

For production builds with obfuscation: `scripts/upload_symbols.sh`
```bash
#!/usr/bin/env bash
set -euo pipefail

RELEASE=${1:?Usage: $0 <release-id>}

if ! command -v sentry-cli >/dev/null 2>&1; then
  echo "sentry-cli not found, skipping symbol upload"
  exit 0
fi

sentry-cli releases new "$RELEASE" || true
sentry-cli upload-dif build/symbols || true
sentry-cli releases finalize "$RELEASE" || true

echo "Symbols uploaded for $RELEASE"
```

### Build Variations by Environment

**Dev builds:**
```bash
flutter build appbundle --release          # Android
flutter build ios --release --no-codesign  # iOS
```

**Staging builds:**
```bash
flutter build appbundle --release          # Android (signed via key.properties)
flutter build ipa --release                # iOS (signed via profile)
```

**Production builds:**
```bash
flutter build appbundle --release \
  --obfuscate \
  --split-debug-info=build/symbols         # Android

flutter build ipa --release \
  --obfuscate \
  --split-debug-info=build/symbols         # iOS
```

### Distribution Channels

| Environment | Android | iOS |
|-------------|---------|-----|
| Dev | Firebase App Distribution | TestFlight (internal) or none |
| Staging | Firebase App Distribution | TestFlight (external) |
| Production | Google Play Store | App Store Connect |

### Required Secrets

Organize secrets into logical groups in your CI platform:

**Signing:**
- `ANDROID_KEYSTORE_BASE64` — base64-encoded `.jks` file
- `KEYSTORE_PASSWORD` — keystore password
- `KEY_ALIAS` — key alias name
- `KEY_PASSWORD` — key password
- `IOS_CERTIFICATE_BASE64` — base64-encoded `.p12` distribution certificate
- `IOS_CERTIFICATE_PASSWORD` — certificate password
- `IOS_PROVISIONING_PROFILE_BASE64` — base64-encoded `.mobileprovision`

**Distribution:**
- `FIREBASE_TOKEN` — from `firebase login:ci`
- `FIREBASE_ANDROID_APP_ID` — Firebase console app ID
- `FIREBASE_IOS_APP_ID` — Firebase console app ID
- `FIREBASE_GROUPS` — comma-separated tester group names
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` — Play Console service account
- `APP_STORE_CONNECT_API_KEY_ID` — App Store Connect key ID
- `APP_STORE_CONNECT_API_ISSUER_ID` — issuer ID
- `APP_STORE_CONNECT_API_KEY_CONTENT` — `.p8` key content

**Environment:**
- `STAGING_BASE_URL`, `STAGING_API_KEY`
- `PROD_BASE_URL`, `PROD_API_KEY`

**Monitoring:**
- `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`

## Desktop target: Windows / Microsoft Store

When the Flutter app also ships to the Microsoft Store (desktop Windows build), add a fourth pipeline. It packages the Windows build as MSIX and publishes to Partner Center. Two paths, matching the two platforms above:

**GitHub Actions — via Microsoft Dev Store CLI:**
- Action `microsoft/setup-msstore-cli@v1`.
- Secrets: `AZURE_AD_TENANT_ID`, `AZURE_AD_CLIENT_ID`, `AZURE_AD_CLIENT_SECRET`, `SELLER_ID` (Seller ID from Partner Center → Account settings → Organization profile → Legal info).
- Flow: `msstore reconfigure …` → `flutter pub get` → `msstore package .` → `msstore publish -v`.
- **Prereq:** the app must already exist in Partner Center with ≥1 completed submission; run `msstore init` once in the repo.

**Codemagic — via `msix` pub package + Partner Center API:**
- `instance_type: windows_x2` (Visual Studio 2019 with the "Desktop development with C++" workload).
- `dev_dependencies: msix` + an `msix_config` block in `pubspec.yaml`.
- Build: `flutter build windows` → `flutter pub run msix:create`; publish via a `partner_center:` block.

> **⚠️ GOTCHA (both platforms):** the app's **first version must be published manually** to Partner Center before automation works. CI can only publish updates to an already-live app. See `msstore-submission` for the manual first-submission flow and the 4th-version-digit-must-be-0 rule.

Full workflow files are in the reference files below.

## Implementation

After understanding the architecture above, read the reference file for the chosen platform:

- **Codemagic:** `references/codemagic.md` — complete `codemagic.yaml` with all three mobile workflows plus the Windows / Microsoft Store pipeline
- **GitHub Actions:** `references/github-actions.md` — complete `.github/workflows/*.yml` files plus the Windows / Microsoft Store workflow

Both references produce the same outcome: signed artifacts distributed to the right channel per environment.
