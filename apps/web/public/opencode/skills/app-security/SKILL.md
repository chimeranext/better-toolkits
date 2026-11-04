---
name: app-security
description: "Configure Firebase App Check and other security measures for Flutter apps before launch. Use this skill when the user asks about App Check, Play Integrity, App Attest, DeviceCheck, API protection, preventing abuse, securing Firebase services, attestation providers, or protecting backend APIs from unauthorized clients. Also triggers on: 'protect my API', 'App Check setup', 'prevent scraping', 'verify legitimate app', or 'secure Firebase'."
---

# App Security: Firebase App Check & Launch Hardening

This skill covers security measures that should be in place before a production launch, with Firebase App Check as the primary defense against API abuse.

## Firebase App Check

App Check verifies that requests to your backend and Firebase services come from your legitimate app running on an authentic, untampered device. It blocks requests from:
- Modified/repackaged APKs
- Scripts and bots
- Emulators (in production mode)
- Jailbroken/rooted devices (depending on provider)

### How It Works

```
App startup
  └─ App Check SDK requests attestation from platform provider
      ├─ Android: Play Integrity API
      ├─ iOS: App Attest (iOS 14+) or DeviceCheck
      └─ Web: reCAPTCHA Enterprise
          └─ Provider returns attestation token
              └─ App Check exchanges token for App Check token
                  └─ Token attached to Firebase/backend requests
                      └─ Firebase/backend verifies token
```

### Setup

#### 1. Install Package

```yaml
# pubspec.yaml
dependencies:
  firebase_app_check: ^0.3.0
```

#### 2. Initialize App Check

```dart
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_app_check/firebase_app_check.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();

  await FirebaseAppCheck.instance.activate(
    androidProvider: AndroidProvider.playIntegrity,
    appleProvider: AppleProvider.appAttest,
  );

  runApp(MyApp());
}
```

#### 3. Debug Provider (for development)

During development, use the debug provider to avoid attestation failures on emulators:

```dart
// Only in debug builds
await FirebaseAppCheck.instance.activate(
  androidProvider: AndroidProvider.debug,
  appleProvider: AppleProvider.debug,
);
```

The debug provider outputs a **debug token** to the console. Register this token in Firebase Console:
1. Go to Firebase Console > App Check
2. Click **Manage debug tokens**
3. Add the token from your console output

#### 4. Enable Enforcement

Until you enforce App Check, it runs in audit mode (monitors but doesn't block):

1. Firebase Console > App Check
2. Select a Firebase service (Firestore, Storage, Cloud Functions, etc.)
3. Click **Enforce**
4. Monitor the metrics — if legitimate traffic drops, you may have integration issues

**Enforce one service at a time** and monitor for a few days before enabling the next.

### Provider Comparison

| Provider | Platform | Device support | Strength |
|----------|----------|---------------|----------|
| Play Integrity | Android | Android 5.0+ with Play Services | Strong — Google's attestation |
| App Attest | iOS | iOS 14.0+ | Strong — hardware-based |
| DeviceCheck | iOS | iOS 11.0+ | Moderate — device-level, not app-level |
| Debug | All | Development only | None — for testing only |

**Recommended setup:**
- Android: `AndroidProvider.playIntegrity`
- iOS: `AppleProvider.appAttest` (falls back to DeviceCheck on older devices)

### Custom Backend Protection

If you have a custom backend (not just Firebase services), verify App Check tokens server-side:

```javascript
// Node.js backend
const { getAppCheck } = require('firebase-admin/app-check');

async function verifyAppCheckToken(req, res, next) {
  const token = req.headers['x-firebase-appcheck'];
  if (!token) {
    return res.status(401).json({ error: 'Missing App Check token' });
  }

  try {
    await getAppCheck().verifyToken(token);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid App Check token' });
  }
}
```

## Pre-Launch Security Checklist

### Code & Build Security
- [ ] **Obfuscation enabled** for production builds (`--obfuscate --split-debug-info`)
- [ ] **ProGuard/R8** configured for Android (Flutter default in release mode)
- [ ] **No debug flags** in production build (`kDebugMode` checks, debug providers removed)
- [ ] **API keys** not hardcoded in Dart code (use environment injection from CI/CD)
- [ ] **Sensitive strings** not in plain text (use `--dart-define` or env file injection)

### Network Security
- [ ] **HTTPS only** — no HTTP connections (enforce in Android Network Security Config and iOS ATS)
- [ ] **Certificate pinning** (optional but recommended for high-security apps)
- [ ] **API rate limiting** on your backend
- [ ] **Firebase App Check** enabled and enforcing

### Data Security
- [ ] **Secure storage** for tokens/credentials (`flutter_secure_storage`, not `shared_preferences`)
- [ ] **No sensitive data in logs** (audit all `print()` and logging statements)
- [ ] **Data encryption at rest** for sensitive local data
- [ ] **Proper keychain/keystore** usage for credentials

### Authentication
- [ ] **Session management** — tokens expire, refresh logic works
- [ ] **Biometric/PIN** for sensitive operations (if applicable)
- [ ] **Account deletion** — required by both stores
- [ ] **Password requirements** meet minimum standards (if using email/password)

### Store Compliance
- [ ] **Privacy policy** reflects actual data collection
- [ ] **Data safety / App Privacy** declarations accurate
- [ ] **Required disclosures** for analytics, crash reporting, advertising SDKs

## Android Network Security Config

For API security in production:

```xml
<!-- android/app/src/main/res/xml/network_security_config.xml -->
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>

    <!-- Allow cleartext only for local development -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">localhost</domain>
    </domain-config>
</network-security-config>
```

Reference in `AndroidManifest.xml`:
```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

## iOS App Transport Security

ATS enforces HTTPS by default on iOS. If you need exceptions (not recommended for production):

```xml
<!-- ios/Runner/Info.plist -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <!-- Only if needed for specific domains -->
    <key>NSExceptionDomains</key>
    <dict>
        <key>localhost</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
    </dict>
</dict>
```
