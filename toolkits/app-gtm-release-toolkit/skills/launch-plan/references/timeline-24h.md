# 24-Hour Timeline: Detailed Breakdown

This reference provides granular time estimates for each step. Adjust based on team experience and existing infrastructure.

## Phase 1: Pipeline (Hours 0-6)

| Step | Time | Notes |
|------|------|-------|
| Choose CI/CD platform | 15 min | Use decision tree in launch-plan |
| Create Codemagic/GH Actions account | 15 min | Connect to repo |
| Generate Android keystore | 15 min | `keytool -genkey` + base64 encode |
| Configure Android signing in CI | 30 min | Upload keystore, set env vars |
| Create iOS distribution cert + profile | 45 min | Apple Developer Portal, or Codemagic auto-manages |
| Configure iOS signing in CI | 30 min | Upload cert/profile, or use Codemagic code signing |
| Write helper scripts (generate_config, quality_checks) | 30 min | Template-based env injection |
| Write PR quality gate workflow | 30 min | Format + analyze + test + coverage |
| Write Android pipeline workflow | 45 min | Build + sign + distribute per env |
| Write iOS pipeline workflow | 45 min | Build + sign + distribute per env |
| First successful build on CI | 30 min | Debug and fix any issues |
| **Total** | **~5.5h** | Buffer: 30 min |

### Android Keystore Generation

```bash
keytool -genkey -v \
  -keystore upload-keystore.jks \
  -keyalg RSA -keysize 2048 \
  -validity 10000 \
  -alias upload

# Encode for CI secrets
base64 -i upload-keystore.jks | pbcopy  # macOS
base64 -w 0 upload-keystore.jks         # Linux
```

### key.properties (do NOT commit)

```properties
storePassword=<password>
keyPassword=<password>
keyAlias=upload
storeFile=../upload-keystore.jks
```

Reference from `android/app/build.gradle`:
```groovy
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

## Phase 2: Store Setup (Hours 6-10)

| Step | Time | Notes |
|------|------|-------|
| Google Play: create app | 10 min | Name, default language, app/game |
| Google Play: store listing | 45 min | Description, screenshots, graphic |
| Google Play: content rating | 15 min | IARC questionnaire |
| Google Play: pricing & distribution | 10 min | Countries, free/paid |
| Google Play: data safety | 30 min | Data collection/sharing declarations |
| App Store Connect: create app | 10 min | Bundle ID, SKU, name |
| App Store Connect: app information | 20 min | Category, age rating, content rights |
| App Store Connect: store listing | 45 min | Screenshots, description, keywords |
| **Total** | **~3.5h** | Buffer: 30 min |

## Phase 3: Testing (Hours 10-18)

| Step | Time | Notes |
|------|------|-------|
| Upload to Google Play internal track | 15 min | Available in seconds |
| Upload to TestFlight (internal) | 15 min | Processing takes 5-15 min |
| Add internal testers (both platforms) | 15 min | Email invites |
| Wait for tester feedback | 3-4h | Minimum viable feedback loop |
| Review Google Play pre-launch report | 30 min | Auto-generated on closed/open track |
| Set up real device testing (optional) | 1h | BrowserStack/Sauce Labs config |
| Run device matrix tests (optional) | 1h | Key device/OS combinations |
| Fix critical issues + rebuild | 1-2h | Only blockers |
| **Total** | **~7h** | Includes wait time for feedback |

### Tester Invitation Templates

**Internal testers email:**
> Subject: [AppName] Beta Testing Invitation
>
> We'd like you to test [AppName] before launch. Please:
> 1. [Android] Click this link to join: [opt-in URL from Play Console]
> 2. [iOS] Accept the TestFlight invitation email
>
> Focus on: [specific areas to test]
> Report issues to: [channel/email]

## Phase 4: Launch (Hours 18-24)

| Step | Time | Notes |
|------|------|-------|
| Production build with obfuscation | 20 min | CI/CD handles this |
| Upload Sentry debug symbols | 10 min | Automated in pipeline |
| Submit to Google Play production | 15 min | Staged rollout recommended |
| Submit to App Store Review | 15 min | Via CI/CD or Transporter |
| Configure staged/phased rollout | 10 min | 20% initial recommended |
| Set up post-launch monitoring | 30 min | Sentry + store dashboards |
| **Total** | **~2h** | Review time is async (24-48h for Apple) |

## Critical Path Items

These items can block the entire timeline if not handled early:

1. **Apple Developer enrollment** — if not already enrolled, this alone can take 48h
2. **Google Play identity verification** — new accounts need 2-5 days
3. **iOS code signing** — certificates and profiles must be valid and matching
4. **Bundle ID / package name** — cannot change after first store upload
5. **Privacy policy** — both stores require a publicly accessible URL

## Parallel Work Opportunities

These can happen simultaneously to compress the timeline:

- Android pipeline + iOS pipeline setup (if two people)
- Store listing preparation + CI/CD setup (different skillsets)
- Google Play setup + App Store Connect setup (independent platforms)
- Real device testing + collecting internal tester feedback
