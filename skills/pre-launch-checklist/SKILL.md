---
name: pre-launch-checklist
description: "Comprehensive pre-launch checklist for Flutter apps covering code quality, environment setup, error monitoring, analytics, force updates, security, store compliance, and production readiness. Based on Andrea Bizzotto's Flutter release methodology. Use this skill when the user asks about release readiness, pre-launch review, production checklist, 'am I ready to launch', 'what am I missing before release', app review preparation, or final checks before submitting to stores. Also triggers on: 'checklist before launch', 'production readiness', 'release preparation', 'review my app before submitting'."
---

<!-- TODO: framework-agnostic split — checklist assumes Flutter conventions (flavors, pubspec.yaml, build modes). Phase 2+: abstract into "target config readiness" with per-framework adapters (Flutter, KMP, MAUI, Swift, PWA). -->

# Pre-Launch Checklist

A structured checklist to verify your Flutter app is production-ready before submitting to stores. Based on the methodology from [Andrea Bizzotto's Flutter in Production course](https://codewithandrea.com/articles/key-steps-before-releasing-flutter-app/) and the [flutter_ship_app](https://github.com/bizz84/flutter_ship_app) reference implementation, combined with practical startup shipping patterns.

## How to Use This Checklist

Work through each section in order. Items marked **[BLOCKER]** will cause store rejection or critical production issues if skipped. Items marked **[RECOMMENDED]** improve quality but can ship without. Items marked **[FIRST RELEASE]** must be in your very first release — retrofitting later is painful or impossible.

## 1. Flavors & Environments [FIRST RELEASE]

Multiple build configurations prevent test data from contaminating production analytics, crash reports, and databases.

Source: [flutter_ship_app](https://github.com/bizz84/flutter_ship_app) uses three entry points (`main_dev.dart`, `main_stg.dart`, `main_prod.dart`) with separate Firebase projects per flavor.

- [ ] **[BLOCKER]** Separate entry points for dev/staging/production environments
- [ ] **[BLOCKER]** Different app IDs per flavor (can install all variants simultaneously)
- [ ] **[RECOMMENDED]** Visual indicator for non-production builds (different icon, banner, or color)
- [ ] **[RECOMMENDED]** Separate Firebase projects per flavor (analytics, crashlytics, remote config)
- [ ] **[RECOMMENDED]** Environment variables via `--dart-define-from-file` (not hardcoded)

### Implementation Options

**Quick setup** — `flutter_flavorizr` package:
```yaml
# pubspec.yaml
dev_dependencies:
  flutter_flavorizr: ^2.2.0

# flavorizr.yaml
flavors:
  dev:
    app:
      name: "App Dev"
    android:
      applicationId: "com.company.app.dev"
    ios:
      bundleId: "com.company.app.dev"
  prod:
    app:
      name: "App"
    android:
      applicationId: "com.company.app"
    ios:
      bundleId: "com.company.app"
```

**Manual setup** — multiple entry points (flutter_ship_app pattern):
```dart
// lib/main_dev.dart
void main() => bootstrap(Env.dev);

// lib/main_prod.dart
void main() => bootstrap(Env.prod);
```

## 2. Error Monitoring [FIRST RELEASE]

You cannot fix bugs you do not know about. Error monitoring must be in the first release.

Source: Andrea Bizzotto recommends Sentry or Firebase Crashlytics. The flutter_ship_app uses Sentry with per-flavor DSN configuration.

- [ ] **[BLOCKER]** Crash reporting SDK integrated (Sentry or Firebase Crashlytics)
- [ ] **[BLOCKER]** Debug symbols uploaded for obfuscated builds (see `app-gtm-release:cicd-setup`)
- [ ] **[RECOMMENDED]** Breadcrumbs configured (events leading to crashes)
- [ ] **[RECOMMENDED]** User identification linked (to correlate crashes with users)
- [ ] **[RECOMMENDED]** Performance monitoring enabled (slow frames, startup time)
- [ ] **[RECOMMENDED]** Source maps / dSYMs uploaded to symbolicate stack traces

### Sentry Setup (Recommended)

```dart
import 'package:sentry_flutter/sentry_flutter.dart';

Future<void> main() async {
  await SentryFlutter.init(
    (options) {
      options.dsn = const String.fromEnvironment('SENTRY_DSN');
      options.tracesSampleRate = 0.2; // 20% of transactions
      options.environment = const String.fromEnvironment('ENV_NAME');
    },
    appRunner: () => runApp(const MyApp()),
  );
}
```

## 3. Analytics [RECOMMENDED]

Track user behavior to make data-driven product decisions.

Source: flutter_ship_app integrates Mixpanel with per-flavor project tokens.

- [ ] **[RECOMMENDED]** Analytics SDK integrated (Firebase Analytics, Mixpanel, or Amplitude)
- [ ] **[RECOMMENDED]** Key events defined and tracked:
  - App open / session start
  - Core feature usage (the main action users take)
  - Conversion events (signup, purchase, share)
  - Error states (failed actions from user perspective)
- [ ] **[RECOMMENDED]** User properties set (plan type, app version, platform)
- [ ] **[RECOMMENDED]** Screen tracking (which screens get the most time)

### What NOT to Track
- Personally identifiable information (PII) without consent
- Exact location (use approximate)
- Keystroke-level data
- Health/financial data (requires special compliance)

## 4. Force Update Mechanism [FIRST RELEASE]

If you need to force users off a broken version, this must exist from day one. You cannot retroactively add a force update prompt to an already-deployed version.

Source: Andrea Bizzotto emphasizes this as critical for the first release. flutter_ship_app uses `force_update_helper` package.

- [ ] **[BLOCKER]** Minimum version check on app startup
- [ ] **[BLOCKER]** Version comparison against remote config (Firebase Remote Config, backend API, or GitHub Gist)
- [ ] **[BLOCKER]** Blocking UI when update is required (full-screen, no dismissal)
- [ ] **[RECOMMENDED]** Soft update prompt for recommended (non-critical) updates
- [ ] **[RECOMMENDED]** Deep link to store listing for update

### Implementation Pattern

```dart
// Check on app startup
Future<void> checkForUpdate() async {
  final remoteMinVersion = await fetchMinVersion(); // From Remote Config
  final currentVersion = await PackageInfo.fromPlatform();

  if (currentVersion < remoteMinVersion) {
    showForceUpdateDialog(); // Full screen, no dismiss
  }
}
```

### Shorebird Alternative

For Dart-only fixes, Shorebird Code Push can patch without store submission. See `app-gtm-release:code-push`. But force update is still needed for native changes.

## 5. In-App Feedback [RECOMMENDED]

Lower the barrier for users to report issues directly from the app.

Source: Andrea Bizzotto recommends the `feedback` package with optional Sentry integration.

- [ ] **[RECOMMENDED]** Feedback mechanism accessible from settings or help menu
- [ ] **[RECOMMENDED]** Screenshot annotation capability
- [ ] **[RECOMMENDED]** Automatic device info attachment (model, OS, app version)
- [ ] **[RECOMMENDED]** Feedback routed to issue tracker (Sentry, email, or Linear)

```yaml
dependencies:
  feedback: ^3.0.0
  feedback_sentry: ^1.0.0  # Optional: routes feedback to Sentry
```

## 6. In-App Review [RECOMMENDED]

Prompt users to rate your app at moments of satisfaction.

Source: Andrea Bizzotto emphasizes timing — prompt after positive experiences, not on first launch.

- [ ] **[RECOMMENDED]** `in_app_review` package integrated
- [ ] **[RECOMMENDED]** Trigger after positive user moments (task completion, purchase, milestone)
- [ ] **[RECOMMENDED]** Respect platform rate limits (iOS limits to 3 prompts/year)
- [ ] **[RECOMMENDED]** Track whether prompt was shown (don't re-prompt too soon)

```dart
import 'package:in_app_review/in_app_review.dart';

Future<void> requestReview() async {
  final inAppReview = InAppReview.instance;
  if (await inAppReview.isAvailable()) {
    await inAppReview.requestReview();
  }
}
```

## 7. App Security [BLOCKER]

See `app-gtm-release:app-security` for detailed implementation.

- [ ] **[BLOCKER]** Firebase App Check enabled (Play Integrity + App Attest)
- [ ] **[BLOCKER]** No API keys or secrets hardcoded in Dart source
- [ ] **[BLOCKER]** HTTPS enforced for all network calls
- [ ] **[BLOCKER]** Sensitive data stored with `flutter_secure_storage`, not `shared_preferences`
- [ ] **[RECOMMENDED]** Network security config (Android) and ATS (iOS) properly configured
- [ ] **[RECOMMENDED]** ProGuard/R8 rules verified for release builds
- [ ] **[RECOMMENDED]** Account deletion flow implemented (required by both stores)

## 8. Code Quality [RECOMMENDED]

Quality gates that should pass before submission.

Source: Startup shipping guide (widgettricks) recommends focusing tests on frequently breaking code rather than 100% coverage.

- [ ] **[RECOMMENDED]** `flutter analyze` passes with no errors
- [ ] **[RECOMMENDED]** `dart format` applied consistently
- [ ] **[RECOMMENDED]** Tests cover core business logic (not necessarily 100% coverage)
- [ ] **[RECOMMENDED]** Golden tests for critical UI screens (catches layout regressions)
- [ ] **[RECOMMENDED]** No `TODO` or `FIXME` in production code paths
- [ ] **[RECOMMENDED]** Custom lint rules for project conventions

## 9. UX Polish [RECOMMENDED]

- [ ] **[RECOMMENDED]** Splash screen configured (native, not Flutter widget)
- [ ] **[RECOMMENDED]** App icon meets both store specifications
- [ ] **[RECOMMENDED]** Loading states for all async operations
- [ ] **[RECOMMENDED]** Error states with retry actions (not silent failures)
- [ ] **[RECOMMENDED]** Offline handling (graceful degradation or cached data)
- [ ] **[RECOMMENDED]** Dark mode support (or explicit light-only design)
- [ ] **[RECOMMENDED]** Responsive layout tested on smallest supported device

## 10. Store Compliance [BLOCKER]

- [ ] **[BLOCKER]** Privacy policy URL published and accessible
- [ ] **[BLOCKER]** Data safety (Google Play) / App Privacy (Apple) declarations match actual data collection
- [ ] **[BLOCKER]** Content rating completed (both stores)
- [ ] **[BLOCKER]** Age rating questionnaire submitted (both stores)
- [ ] **[BLOCKER]** Account deletion available if users can create accounts
- [ ] **[BLOCKER]** In-app purchases use StoreKit (iOS) and Play Billing (Android) for digital goods
- [ ] **[RECOMMENDED]** Terms of service URL published
- [ ] **[RECOMMENDED]** App review notes prepared with demo credentials

## 11. CI/CD Pipeline [BLOCKER]

See `app-gtm-release:cicd-setup` for full implementation.

- [ ] **[BLOCKER]** Automated builds on push (Codemagic or GitHub Actions)
- [ ] **[BLOCKER]** Code signing configured for both platforms
- [ ] **[BLOCKER]** Production builds use `--obfuscate --split-debug-info`
- [ ] **[RECOMMENDED]** PR quality gate (format + analyze + test)
- [ ] **[RECOMMENDED]** Automated distribution to testing tracks
- [ ] **[RECOMMENDED]** Sentry symbol upload in production pipeline

## Quick Reference: Must-Have for First Release

These items **cannot be added retroactively** or cause **irreversible problems** if missing:

1. Flavors / environment separation
2. Error monitoring (Sentry/Crashlytics)
3. Force update mechanism
4. Firebase App Check
5. Bundle ID / package name finalized
6. Privacy policy published

Everything else can be iterated on after launch.

---

*Methodology adapted from [Andrea Bizzotto](https://codewithandrea.com/articles/key-steps-before-releasing-flutter-app/) and the [flutter_ship_app](https://github.com/bizz84/flutter_ship_app) reference implementation. Additional patterns from the [WidgetTricks startup shipping guide](https://widgettricks.substack.com/p/startup-guide-ship-fast).*
